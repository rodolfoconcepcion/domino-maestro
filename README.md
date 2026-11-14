# Dominó Maestro (`domino-masterclass`)

Interactive **Dominican competitive partnership dominoes (2v2)** training suite featuring a live tournament match simulator, a deterministic client-side Tactical Coach (*El Maestro*), a 28-tile probability matrix, and a curated tactical academy.

- **Production Instance**: [https://domino.concepcions.org](https://domino.concepcions.org)
- **Repository**: [https://github.com/rodolfoconcepcion/domino-maestro](https://github.com/rodolfoconcepcion/domino-maestro)

---

## Key Modules (`src/`)

| Tab (`App.tsx`) | Module | Description |
|---|---|---|
| **Mesa** | [`src/components/MatchSimulator.tsx`](./src/components/MatchSimulator.tsx) | Full 4-player 2v2 partnership cockpit (`Nosotros`: `0` & `2` vs. `Ellos`: `1` & `3`) playing to 100 or 200 points with snake-chain layout, Left Tactical Coach HUD, Right 28-Tile Matrix HUD, and round debrief. |
| **Academia** | [`src/components/TacticalAcademy.tsx`](./src/components/TacticalAcademy.tsx) & [`src/data/scenarios.ts`](./src/data/scenarios.ts) | 12 interactive tactical scenarios across `Principiante`, `Intermedio`, and `Maestro` levels (opening leads, *respeto a la salida*, right-rival strangulation, *tranque* math, *ficha puente*, *cambio de mando*, *la pensada*, and *a ley de una* defense). |
| **Matriz 28** | [`src/components/TileTracker.tsx`](./src/components/TileTracker.tsx) | Manual 28-tile click-to-mark tracking matrix (`[0:0]`–`[6:6]`) enforcing the 7-tile hand limit and surfacing monopoly suits, dry suits, and trapped doubles. |
| **Doctrina** | [`src/components/PrinciplesLibrary.tsx`](./src/components/PrinciplesLibrary.tsx) | Reference viewer for the *10 Leyes Maestras* (10 Master Laws of Dominican Dominoes). |
| **Static Prototypes** | `dist/v2/`, `dist/v-pbr-3d/`, `dist/v-sprites/`, etc. | Standalone HTML/Tailwind experimental builds (including `dist/v2/index.html` with 3-layer DOM shadows, explicit `leftArm`/`rightArm` seam tracking, and Web Audio tile clack synthesis). |

---

## Dominican Rules & Configurable Variations

The match engine defaults to standard Dominican tournament rules with live toggles inside **Mesa**:

- **Deck & Seating**: Standard 28 double-six tiles, 7 per player, strict counter-clockwise turn order `(playerIdx + 1) % 4`.
- **Opening Lead (*La Salida*)**: Hand #1 is led by `[6:6]` (or `[0:0]` *"La Chiva"* when `ruleFirstHandSalida = '00'`). Hand #2+ follows *salida libre* (*"El que gana sale"*).
- **Pegada & Capicúa**: Emptying your hand scores all unplayed pips on the table, with configurable *Capicúa* bonus (`0`, `+25`, or `+50` points on non-double tiles matching both open ends).
- **Tranque (Blocked Board)**: Supports **1v1 Individual** comparison (`closerIdx` vs. `(closerIdx + 1) % 4`) or **2v2 Parejas**, tie handling via **FEDODO** (`cerrador` wins ties) or **Mano Brava** (`manobrava` carries points forward), and optional **Tranca Castigada** (`+25` penalty when the closer loses).
- **Pass Bonuses**: Configurable **Paso de Salida** (`+25`) and **Triple Paso / Pase Corrido** (`+25`).
- **No-Win-By-Bonus Guard (`ruleNoWinByBonus`)**: Bonus points do not apply and cannot close out a match once a team is within 25 points of the target score (`>= 75` in 100-pt or `>= 175` in 200-pt matches).
- **Zapato Alert (`ruleZapatoAlert`)**: Tracks shutout victory states.

---

## Tech Stack

- **Frontend**: React `18.3`, TypeScript `~5.7` (`strict: true`), Vite `6.0`, Tailwind CSS `3.4`, `lucide-react`, `canvas-confetti`
- **AI / Coach**: 100% client-side deterministic heuristic move evaluator (no external LLM calls or backend database)
- **Tooling & QA**: Playwright (`^1.65.0`)
- **Container & Edge**: `nginx:alpine` ([`Dockerfile`](./Dockerfile), [`nginx.conf`](./nginx.conf) with gzip, SPA fallback, and `GET /health`), Cloudflare Zero Trust Tunnel

---

## Getting Started

### Prerequisites
- Node.js `>= 18` and `npm`

### Local Development
```bash
npm install
npm run dev
```
Starts the Vite dev server on `http://0.0.0.0:3333` (`vite.config.ts`).

### Typecheck, Build & Preview
```bash
npm run build    # Runs tsc && vite build -> dist/
npm run preview  # Previews production bundle locally
```

### Playwright E2E Tests
```bash
npx playwright test
```
> Note: `playwright` (`^1.65.0`) is installed in `devDependencies`; initializing `playwright.config.ts` and `tests/` specs is tracked in [`docs/TODO.md`](./docs/TODO.md).

### Docker
```bash
docker build -t domino-maestro .
docker run -d -p 3333:80 --name domino-maestro domino-maestro
```
Health check endpoint: `GET http://localhost:3333/health` -> `{"status":"ok","service":"domino-maestro"}`.

---

## Project Documentation

- [`GEMINI.md`](./GEMINI.md) — Core invariants, domino rules, and git/testing workflow rules
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — Match state machine, snake layout solver, coach heuristic scoring, and deployment topology
- [`docs/TODO.md`](./docs/TODO.md) — Completed milestones, known issues, and prioritized backlog
