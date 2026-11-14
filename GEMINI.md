# Dominó Maestro (`domino-masterclass`)

## 1. Project Summary & Stack
- **Application**: Interactive Dominican competitive dominoes (2v2 partnership) trainer, match simulator, 28-tile probability matrix, and tactical academy.
- **Frontend**: React 18.3, TypeScript ~5.7 (`strict: true`), Vite 6.0 (dev port `3333`), Tailwind CSS 3.4, `lucide-react`, `canvas-confetti`.
- **AI / Coach Engine**: 100% client-side deterministic heuristic move evaluator and curated scenario tree (no external LLM API or backend database).
- **Hosting & Edge**: Static `dist/` served by `nginx:alpine` (`Dockerfile`, `nginx.conf`) in Docker container `runtipi-domino-maestro` on `192.168.0.25:3333`, exposed via Cloudflare Zero Trust Tunnel at `https://domino.concepcions.org`.

## 2. Core Invariants (Never Break)
- **Deck & Teams**: Standard 28 double-six tiles (`[0:0]`–`[6:6]`). Four seats, 7 tiles each: `Nosotros` (`0`: Tú, `2`: Compañero) vs. `Ellos` (`1`: Rival Derecha, `3`: Rival Izquierda).
- **Turn Order**: Strictly `(playerIdx + 1) % 4` (`0 -> 1 -> 2 -> 3 -> 0`).
- **Opening Lead (*La Salida*)**:
  - **Hand #1 (`0-0`)**: Mandatory lead by holder of `[6:6]` (or `[0:0]` *"La Chiva"* if configured).
  - **Hand #2+ (*Salida Libre*)**: *"El que gana sale"* — the individual winner of the prior hand leads any tile.
- **Tile Matching & Seams**:
  - Played tiles must match an open end in `boardEnds: [left, right]`.
  - Prompt the user for side choice **only** when a tile matches both ends AND `boardEnds[0] !== boardEnds[1]`.
  - Maintain inner/outer pip orientation along the board chain; render doubles crosswise (vertical) on horizontal rows.
- **Dominican Scoring & Custom Rules**:
  - **Pegada (Dominó)**: Winner's team scores all remaining pips across all 4 hands.
  - **Tranque (Blocked Board)**: Default Dominican 1v1 compares only `closerIdx` vs. `(closerIdx + 1) % 4`; ties go to the closer (*FEDODO*) or carry over (*Mano Brava*). Optional 2v2 `parejas` mode compares team totals.
  - **Bonuses**: First pass after opening lead (`+25`), *Triple Paso / Pase Corrido* (`+25`), *Capicúa* (`+25` or `+50`, non-double matching both open ends), *Tranca Castigada* (`+25` penalty if closer loses count).
  - **No-Win-By-Bonus Guard (`ruleNoWinByBonus`)**: Bonus points do not apply and cannot win once a team is within 25 points of `targetScore` (`>= 75` in 100-pt or `>= 175` in 200-pt games).
- **UI & Theme Guardrails**:
  - All user-facing gameplay copy must remain in authentic Dominican Spanish.
  - Light-mode overrides in `src/index.css` must preserve `.felt-texture` and `.domino-tile` pip contrast.

## 3. Workflow & Git Rules
- **Dev Server**: `npm run dev` (`http://0.0.0.0:3333`)
- **Typecheck & Build**: `npm run build` (`tsc && vite build` -> `dist/`)
- **Preview Build**: `npm run preview`
- **Playwright E2E**: `npx playwright test` (required after every frontend/UI/CSS edit)
- **Deploy to Homelab**: `domino-deploy` (`--local-only` or `--skip-build` supported)
- **Mandatory Rules**:
  1. Run Playwright E2E tests after any frontend, template, or styling modification.
  2. Commit every completed milestone with a clean, semantic Git commit message (`git add . && git commit -m "feat/fix/chore(...): ..."`).

## 4. Context Map
- Read [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) when working on game state machines, board chain geometry, the AI Tactical Coach / heuristic scorer, experimental `dist/` prototypes, or Docker/Runtipi/Cloudflare deployment.
- Read [`docs/TODO.md`](./docs/TODO.md) before starting new work to pick prioritized tasks, review known issues, or log sprint progress.
