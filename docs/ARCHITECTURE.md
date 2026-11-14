# Dominó Maestro — Architecture Reference

> 🌐 **Language / Idioma**: **English** | [Español](./ARCHITECTURE.es.md)

## 1. System & Data Flow

Dominó Maestro is a pure client-side React + TypeScript Single-Page Application (`src/main.tsx` -> `<LanguageProvider>` -> `src/App.tsx`). There is no backend API or server-side persistence; all game state, heuristic coaching, audio synthesis, and probability tracking run locally in browser memory (with theme persisted in `localStorage['domino-theme']` and language persisted in `localStorage['domino-lang']`).

### Top-Level Views (`src/App.tsx`)
| Tab State | UI Label (`ES` / `EN`) | Component | Purpose |
|---|---|---|---|
| `'simulator'` (default) | `Mesa` / `Table` | `MatchSimulator` | 3-column live 2v2 tournament cockpit, rule configurator, live telemetry emitter, and tactical HUD |
| `'academy'` | `Academia` / `Academy` | `TacticalAcademy` | 12 interactive bilingual tactical puzzles (`getScenarios(lang)`) with step-by-step board state |
| `'tracker'` | `Matriz 28` / `28 Matrix` | `TileTracker` | Manual 28-tile click-to-mark tracker with 7-tile hand limit and suit audit |
| `'library'` | `Doctrina` / `Doctrine` | `PrinciplesLibrary` | 10 Master Laws (*10 Leyes Maestras*) bilingual tactical compendium |

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

### Live Move Evaluator (`src/engine/coach.ts`)
- **Trigger**:
  - For Human (`seatIdx === 0`): `useEffect` in `MatchSimulator.tsx` runs whenever `turn === 0 && !gameOver`, passing current state + active `lang` (`'es' | 'en'`).
  - For AI seats (`seatIdx ∈ {1, 2, 3}`): 900ms `setTimeout` invokes `evaluateMovesForSeat({ seatIdx, ..., lang })` and plays `options[0]` (or passes via `handlePass`).
- **Inputs**:
  - `seatIdx: number` (`0..3`), `hands: Tile[][]`, `boardEnds: [number, number] | null`, `passedSuits: number[][]`, `handNumber`, `ruleFirstHandSalida`, `salidorIndex`, `boardLength`, `salidaValues`, `lang?: 'es' | 'en'`.
- **Scoring Rules**:
  1. **Hand #1 Opening (`!boardEnds && handNumber === 1`)**: Forces single mandatory option (`[6:6]` or `[0:0]`, score `10`).
  2. **Free Opening (`!boardEnds && handNumber > 1`)**: Ranks all tiles by suit dominance (`maxSuit * 3`), backed double bonus (`+4` if `t[0] === t[1]`), and pip weight discharge (`round(((t[0] + t[1]) / 3) * 10) / 10`).
  3. **Mid-Game Move Evaluation**: Evaluates every legal `(tile, side)` pair with `newEnd`, `otherEnd`, remaining hand `rest`, seat-relative partner `(seatIdx + 2) % 4`, next rival `(seatIdx + 1) % 4`, and previous rival `(seatIdx + 3) % 4`:
     - **Suit Control**: `+3` per remaining tile in `rest` matching `newEnd` or `otherEnd`.
     - **Board Squaring (*Cuadre*)**: `+4` if `newEnd === otherEnd && owned(newEnd) > 0`.
     - **Weight Discharge (*Descarga*)**: `+round((pips / 3) * 10) / 10`.
     - **Double Offloading**: `+3` if `tile[0] === tile[1]`.
     - **Pass Exploitation / Partner Protection / Salida Respect**:
       - `-5` if partner already passed on `newEnd`.
       - `+5` if next opponent passed on `newEnd`.
       - `+1` if previous opponent passed on `newEnd`.
       - `+2` partner *Salida* respect when protecting partner's lead suit in early rounds (`boardLength <= 5`).
- **Outputs**:
  - `options: CoachOption[]`: Sorted descending by `total`, top 3 displayed in Left HUD (`MatchSimulator.tsx`).
  - `advice: string`: Localized (`es` or `en`) tactical explanation recommending why the highest-scoring move is optimal.
  - **Left HUD Telemetry Bars** (`MatchSimulator.tsx`):
    - *La Salida* / Opening Lead: `salidaPct = clamp(25..100, round((dominantSuitCount / 7) * 100))`
    - *Partner Signals*: `76%` (no conflicting passes), `48%` (passed 1 open end), `15%` (passed both), `50%` (unopened)
    - *Lock Risk* (`Riesgo de Tranque`): `clamp(12..95, round((playedCountOnOpenEnds / 14) * 100))`
- **Header Telemetry (`App.tsx` <-> `MatchSimulator.tsx`)**:
  - `MatchSimulator` emits `{ scores, targetScore, handNumber, roundSeconds }` via `onTelemetryChange` driven by a live 1-second timer to update `[data-testid="header-live-score"]` and `[data-testid="header-round-timer"]`.

### Standalone Audio & Board Shadows
- **`src/utils/sound.ts`**: `playClackSound()` synthesizes tactile wooden tile placement clicks on every valid play via Web Audio API triangle oscillators.
- **2-Layer DOM Board Surface (`DominoTile.tsx` `boardMode`, `MatchSimulator.tsx`, `TacticalAcademy.tsx`)**: Separates `data-testid="board-shadows-layer"` (`z-0`) from `data-testid="board-tiles-layer"` (`z-10`) so adjacent contact shadows never darken neighboring ivory tile faces.

### Curated Academy & 28-Tile Deductions
- **Tactical Academy (`src/data/scenarios.ts` + `src/i18n/scenarios.en.ts` + `TacticalAcademy.tsx`)**: `getScenarios(lang)` returns all 12 `PuzzleScenario` records localized cleanly into Spanish or English without duplicating tile geometry.
- **28-Tile Matrix (`src/components/TileTracker.tsx`)**: Computes per-suit inventory (`remaining = 7 - (inHand + onBoard)`), surfacing live alerts for `monopolySuits`, `drySuits`, and `trappedDoubles`.

---

## 3. Directory Map

```text
/home/rodolfo/projects/domino-masterclass/
├── GEMINI.md                     # Auto-loaded session invariants & workflow guide (<120 lines)
├── README.md / README.es.md      # Bilingual project overview & developer guide
├── docs/
│   ├── ARCHITECTURE.md / .es.md  # System architecture reference (EN & ES)
│   └── TODO.md / .es.md          # Living sprint & backlog tracker (EN & ES)
├── playwright.config.ts          # Headless Chromium runner on http://127.0.0.1:4173
├── tests/
│   └── app.spec.ts               # Playwright E2E specs (navigation, rules, Academy, Matrix, Doctrine, P1–P3)
├── public/                       # Preserved static prototypes copied into dist/ on build (v2/, v-pbr-3d/, etc.)
├── src/
│   ├── main.tsx                  # React 18 root mount wrapped in <LanguageProvider>
│   ├── App.tsx                   # Floating glass header, live telemetry, ES/EN toggle, theme toggle, 4 tabs
│   ├── index.css                 # Tailwind directives, .felt-texture, glass panels, light-mode overrides
│   ├── i18n/
│   │   ├── LanguageContext.tsx   # Persistent ES/EN React context (localStorage['domino-lang'])
│   │   └── scenarios.en.ts       # Full English translation layer for all 12 scenarios + getScenarios(lang)
│   ├── engine/
│   │   └── coach.ts              # Shared 4-seat heuristic evaluator & legal move generator
│   ├── utils/
│   │   └── sound.ts              # Web Audio wooden tile clack synthesizer
│   ├── types/
│   │   └── domino.ts             # Tile, ScenarioBoardTile, PuzzleScenario, GamePlayer interfaces
│   ├── data/
│   │   └── scenarios.ts          # 12 curated Dominican tactical puzzle scenarios (SCENARIOS)
│   └── components/
│       ├── DominoTile.tsx        # Reusable ivory resin tile SVG/CSS pips, brass pin, badges, boardMode
│       ├── MatchSimulator.tsx    # Core 2v2 match engine, 11 rule configs, snake layout, Coach & Matrix HUDs
│       ├── TacticalAcademy.tsx   # Interactive puzzle board consuming getScenarios(lang)
│       ├── TileTracker.tsx       # Standalone 28-tile manual counting matrix (7-tile hand guard)
│       └── PrinciplesLibrary.tsx # 10 Master Laws bilingual doctrine viewer
├── Dockerfile                    # Multi-file copy into nginx:alpine (port 80)
├── nginx.conf                    # Gzip, SPA fallback, GET /health JSON endpoint
├── package.json                  # React 18, Vite 6, TS 5.7, Tailwind 3.4, Playwright ^1.65.0
├── tsconfig.json                 # Strict TypeScript config (ES2020, bundler resolution)
└── vite.config.ts                # Vite config (host 0.0.0.0, port 3333)
```

**Playwright E2E Status**: Active and configured (`playwright.config.ts` -> `tests/app.spec.ts`), executed against Vite on `http://127.0.0.1:4173` via `npx playwright test`.

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
