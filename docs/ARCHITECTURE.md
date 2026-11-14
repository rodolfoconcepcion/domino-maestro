# Dominó Maestro — Architecture Reference

## 1. System & Data Flow

Dominó Maestro is a pure client-side React + TypeScript Single-Page Application (`src/main.tsx` -> `src/App.tsx`). There is no backend API or server-side persistence; all game state, heuristic coaching, and probability tracking run locally in browser memory (with theme preference persisted in `localStorage` under `domino-theme`).

### Top-Level Views (`src/App.tsx`)
| Tab State | UI Label | Component | Purpose |
|---|---|---|---|
| `'simulator'` (default) | `Mesa` | `MatchSimulator` | 3-column live 2v2 tournament cockpit, rule configurator, and tactical HUD |
| `'academy'` | `Academia` | `TacticalAcademy` | 12 interactive tactical puzzles (`SCENARIOS`) with step-by-step board state |
| `'tracker'` | `Matriz 28` | `TileTracker` | Manual 28-tile click-to-mark tracker with 7-tile hand limit and suit audit |
| `'library'` | `Doctrina` | `PrinciplesLibrary` | 10 Master Laws (*10 Leyes Maestras*) tactical compendium |

### Match State Machine (`src/components/MatchSimulator.tsx`)
```
startNewRound(handNum)
  ├── Deals 4x7 shuffled double-six tiles -> hands[0..3]
  ├── Hand #1: sets salidorIndex to holder of [6:6] (or [0:0] if La Chiva)
  ├── Hand #2+: sets salidorIndex = lastWinnerIndex (or rotates)
  └── turn = salidorIndex
        │
        ├──► turn === 0 (Human) ──► Click highlighted tile (or pendingTile side prompt)
        │                           or "Paso Obligado" if playableForMe.length === 0
        │
        └──► turn ∈ {1,2,3} (AI) ──► 900ms setTimeout -> getPlayableMoves()
                                    ├── playable.length > 0 -> makePlay()
                                    └── playable.length === 0 -> handlePass()
                                          │
                                          ▼
                            checkNextTurn(nextPlayer, newHands, updatedEnds, closerIdx)
                              ├── newHands[playerIdx].length === 0 -> Pegada (+Capicúa/+Mano Brava)
                              ├── !anyPlayerCanPlay -> Tranque (1v1 FEDODO or 2v2 parejas)
                              └── Otherwise -> setTurn((playerIdx + 1) % 4)
```

### Board Snake-Chain Layout Engine
Both `MatchSimulator.tsx` (`TILE_LONG = 72`, `TILE_SHORT = 40`, `ARM_ROW = 5`) and `TacticalAcademy.tsx` (`TILE_LONG = 56`, `TILE_SHORT = 32`, `ARM_ROW = 5`) share the same deterministic 2D coordinate solver (`layoutArm` + `mirrorArm`):
1. `board[centerIdx]` anchors at `(-centerW / 2, -centerH / 2)`.
2. `rightOut = board.slice(centerIdx + 1)` extends rightward via `layoutArm()`, starting at `+centerW / 2`.
3. `leftOut = board.slice(0, centerIdx).reverse()` flips each tile (`[outer, chain]` -> `[chain, outer]`), runs `layoutArm()`, and mirrors horizontally (`left = -(p.left + w)`), starting at `-centerW / 2`.
4. Doubles render vertically (`vertical = true`) across the chain line.
5. After `ARM_ROW = 5` tiles in a row, the next tile becomes a vertical corner turn shifting `y` downward by `TILE_LONG * 0.75` and reversing `dir = -dir`.
6. Responsive scaling clamps mobile viewports (`viewportW < 640`) with `scale = Math.max(0.5, availW / rawW)`.

### Standalone Experimental Builds (`dist/`)
Several prototype builds exist directly inside `dist/` for visual and architectural evaluation (outside the Vite `src/` bundle):
- `dist/v2/index.html`: Standalone HTML/Tailwind/JS v2.0 tournament table (`ARM_ROW = 4`, `TILE_LONG = 88`, `TILE_SHORT = 44`) featuring:
  - **3-Layer DOM Architecture**: `#shadows-layer` (`.felt-shadow`), `#tiles-layer` (`.pbr-domino`), and `#targets-layer` (floating end-target buttons), preventing contact-shadow bleeding between adjacent tiles.
  - **Explicit Arm Model**: Separate `centerItem`, `leftArm`, and `rightArm` arrays storing `{ tile, inner, outer, isDouble, playedBy, playOrder }`.
  - **Web Audio Synthesis**: `playClackSound()` synthesizes tactile tile placement audio via `AudioContext` triangle oscillator.
- Other experimental prototypes in `dist/`: `v-opt-a/`, `v-pbr-3d/`, `v-sprites/`, `v-tactile/`, `v1-threejs/`, `v2-isometric/`, and `refs/`.

---

## 2. AI Virtual Master Design

The "Virtual Master" / **Tactical Coach** is a **deterministic heuristic evaluation engine** paired with a **curated scenario tree**. No external LLM APIs or network inference calls are made.

### Live Move Evaluator (`src/components/MatchSimulator.tsx`, L264–444)
- **Trigger**: `useEffect` running whenever `turn === 0 && !gameOver` (depends on `turn`, `boardEnds`, `hands`, `gameOver`, `passedSuits`).
- **Inputs**:
  - `hands[0]` (player hand)
  - `boardEnds: [number, number] | null`
  - `passedSuits: number[][]` (recorded passed suits per seat `0..3`)
  - `handNumber`, `ruleFirstHandSalida`
- **Scoring Rules**:
  1. **Hand #1 Opening (`!boardEnds && handNumber === 1`)**: Forces single mandatory option (`[6:6]` or `[0:0]`, score `10`).
  2. **Free Opening (`!boardEnds && handNumber > 1`)**: Ranks all tiles in `hands[0]` by:
     - Suit dominance: `maxSuit * 3`
     - Backed double bonus: `+4` if `t[0] === t[1]`
     - Pip weight discharge: `round(((t[0] + t[1]) / 3) * 10) / 10`
  3. **Mid-Game Move Evaluation**: Generates every valid `(tile, side)` pair where `side ∈ {'left', 'right'}` and computes `newEnd`, `otherEnd`, and remaining hand `rest`:
     - **Suit Control**: `+3` per remaining tile in `rest` matching `newEnd` or `otherEnd` (`endsOwned * 3`).
     - **Board Squaring (*Cuadre*)**: `+4` if `newEnd === otherEnd && owned(newEnd) > 0`.
     - **Weight Discharge (*Descarga*)**: `+round((pips / 3) * 10) / 10`.
     - **Double Offloading**: `+3` if `tile[0] === tile[1]`.
     - **Pass Exploitation / Partner Protection**:
       - `-5` if partner (`passedSuits[2]`) already passed on `newEnd`.
       - `+5` if next opponent (`passedSuits[1]`, *Rival Derecha*) passed on `newEnd`.
       - `+1` if previous opponent (`passedSuits[3]`, *Rival Izquierda*) passed on `newEnd`.
- **Outputs**:
  - `coachOptions: CoachOption[]`: Sorted descending by `total`, top 3 displayed in Left HUD with score breakdown.
  - `coachAdvice: string`: Natural-language Dominican Spanish recommendation explaining why the top-ranked move is optimal.
  - **Left HUD Telemetry Bars** (`MatchSimulator.tsx` L806–842):
    - *La Salida*: `salidaPct = clamp(25..100, round((dominantSuitCount / 7) * 100))`
    - *Partner Signaling*: `76%` (no conflicting passes), `48%` (passed 1 open end), `15%` (passed both), `50%` (unopened)
    - *Tranca Risk*: `clamp(12..95, round((playedCountOnOpenEnds / 14) * 100))`

### Automated Seat AI (`1`, `2`, `3`)
- **React Simulator (`MatchSimulator.tsx` L773–791)**: Waits `900ms`, computes `getPlayableMoves(hands[turn], boardEnds)`, passes if empty, or picks a **random** legal move (`playable[Math.floor(Math.random() * playable.length)]`), defaulting `'both'`/`'any'` to `'left'`.
- **v2 Standalone Engine (`dist/v2/index.html` L1080–1102)**: Waits `950ms` and sorts legal moves descending by `(pips + (isDouble ? 4 : 0))` before selecting `playable[0]`.

### Curated Academy & 28-Tile Deductions
- **Tactical Academy (`src/data/scenarios.ts` + `TacticalAcademy.tsx`)**: `SCENARIOS` defines 12 `PuzzleScenario` records across 10 chapters (`Principiante`, `Intermedio`, `Maestro`). Each scenario provides fixed `boardTiles`, `boardEnds`, `myHand`, `knownPasses`, multiple-choice `options` (with `isCorrect`, `tacticalPrinciple`, `explanation`), and `tacticalTip`.
- **28-Tile Matrix (`src/components/TileTracker.tsx`)**: Computes per-suit inventory (`remaining = 7 - (inHand + onBoard)`), surfacing live alerts for `monopolySuits` (`remaining === 0 && inHand > 0`), `drySuits` (`remaining === 0 && inHand === 0`), and `trappedDoubles` (`doubleState === 'unplayed' && remaining >= 1 && remaining <= 2`).

---

## 3. Directory Map

```text
/home/rodolfo/projects/domino-masterclass/
├── GEMINI.md                     # Auto-loaded session invariants & workflow guide (<120 lines)
├── docs/
│   ├── ARCHITECTURE.md           # This technical reference
│   └── TODO.md                   # Living sprint & backlog tracker
├── src/
│   ├── main.tsx                  # React 18 root mount
│   ├── App.tsx                   # Floating glass header, theme toggle, 4-tab view switcher
│   ├── index.css                 # Tailwind directives, .felt-texture, glass panels, light-mode overrides
│   ├── types/
│   │   └── domino.ts             # Tile, ScenarioBoardTile, PuzzleScenario, GamePlayer interfaces
│   ├── data/
│   │   └── scenarios.ts          # 12 curated Dominican tactical puzzle scenarios (SCENARIOS)
│   └── components/
│       ├── DominoTile.tsx        # Reusable ivory resin tile SVG/CSS pips, brass pin, badges
│       ├── MatchSimulator.tsx    # Core 2v2 match engine, 10+ rule toggles, snake layout, Coach & Matrix HUDs
│       ├── TacticalAcademy.tsx   # Interactive puzzle board consuming SCENARIOS
│       ├── TileTracker.tsx       # Standalone 28-tile manual counting matrix (7-tile hand guard)
│       └── PrinciplesLibrary.tsx # 10 Master Laws doctrine viewer
├── dist/                         # Vite production bundle + standalone prototypes (v2/, v-pbr-3d/, v-sprites/, etc.)
├── reference_apps/               # Reference UI screenshots (domino_go/, jogatina/, vip_dominoes.webp)
├── Dockerfile                    # Multi-file copy into nginx:alpine (port 80)
├── nginx.conf                    # Gzip, SPA fallback, GET /health JSON endpoint
├── package.json                  # React 18, Vite 6, TS 5.7, Tailwind 3.4, Playwright ^1.65.0
├── tsconfig.json                 # Strict TypeScript config (ES2020, bundler resolution)
├── vite.config.ts                # Vite config (host 0.0.0.0, port 3333)
└── tailwind.config.js            # Custom domino palette and tactile/felt box-shadows
```

**Playwright E2E Status**: `playwright` (`^1.65.0`) is installed in `package.json` `devDependencies`; `playwright.config.ts` and `tests/` have not yet been initialized (tracked in [`docs/TODO.md`](./TODO.md)).

---

## 4. Deployment & Networking

### Build & Delivery Pipeline
```text
Local Workspace (/home/rodolfo/projects/domino-masterclass)
  │
  ├──[1] npm run build (tsc && vite build) ──► dist/
  │
  ├──[2] ~/.local/bin/domino-deploy
  │       ├── Restarts local domino-maestro.service if active
  │       ├── rsync -avz --delete (excl. node_modules, .git)
  │       │      └──► Homelab 192.168.0.25:/home/rodolfo/runtipi/apps/_user/domino-maestro/src/
  │       └── ssh docker restart runtipi-domino-maestro
  │
  └──[3] Production Container (runtipi-domino-maestro, nginx:alpine)
          ├── Bind mounts: ./src/dist -> /usr/share/nginx/html:ro
          │                ./src/nginx.conf -> /etc/nginx/conf.d/default.conf:ro
          ├── LAN Port:    0.0.0.0:3333 -> 80/tcp (http://192.168.0.25:3333)
          └── Edge Tunnel: Cloudflare Zero Trust Tunnel ("CasaOs-Davie")
                           └──► https://domino.concepcions.org
```

### Nginx & Health Monitoring
- **SPA Routing (`nginx.conf`)**: `try_files $uri $uri/ /index.html;` enables serving both the root React bundle and static prototype sub-paths (`/v2/`, `/v-sprites/`, `/v-pbr-3d/`, etc.) directly from `/usr/share/nginx/html`.
- **Health Endpoint**: `GET /health` returns `200 OK` with `{"status":"ok","service":"domino-maestro"}` (`access_log off`).
- **Uptime & Alerts**: Monitored via Uptime Kuma Monitor #38 (`https://status.concepcions.org`) with alerts dispatched via Telegram (`@Concepcions_homelab_bot`).
- **Docker Compose (`/home/rodolfo/runtipi/apps/_user/domino-maestro/docker-compose.yml`)**: Runs `domino-maestro:latest` with `restart: unless-stopped` on port `3333:80`.
