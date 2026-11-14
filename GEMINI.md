# Dominó Maestro (`domino-masterclass`)

> 🌐 **Language / Idioma**: **English** ([README.md](./README.md)) | [Español](./README.es.md) • Docs: [Architecture (EN)](./docs/ARCHITECTURE.md) / [Arquitectura (ES)](./docs/ARCHITECTURE.es.md) • [TODO (EN)](./docs/TODO.md) / [TODO (ES)](./docs/TODO.es.md)

## 1. Project Summary & Stack
- **Application**: Bilingual (ES/EN) interactive Dominican competitive dominoes (2v2 partnership) trainer, match simulator, 28-tile probability matrix, and tactical academy.
- **Frontend**: React 18.3, TypeScript ~5.7 (`strict: true`), Vite 6.0 (dev port `3333`), Tailwind CSS 3.4, `lucide-react`, `canvas-confetti`, Web Audio synthesizer (`src/utils/sound.ts`).
- **AI / Coach Engine**: 100% client-side deterministic heuristic move evaluator (`src/engine/coach.ts`) and bilingual curated scenario tree (`src/data/scenarios.ts` + `src/i18n/scenarios.en.ts`) with no external LLM API or backend database.
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
- **UI, Bilingual & Theme Guardrails**:
  - Support full bilingual **ES** (default, authentic Dominican Spanish) and **EN** (English) via `src/i18n/LanguageContext.tsx` (`localStorage['domino-lang']`); keep both translations complete and never mix languages in a mode.
  - Preserve independent DOM shadow layers (`board-shadows-layer` / `board-tiles-layer`) and `.felt-texture` / `.domino-tile` contrast across dark and light modes (`src/index.css`).

## 3. Workflow & Git Rules
- **Dev Server**: `npm run dev` (`http://0.0.0.0:3333`)
- **Typecheck & Build**: `npm run build` (`tsc && vite build` -> `dist/`, preserving `public/` sub-routes such as `dist/v2/`)
- **Preview Build**: `npm run preview`
- **Playwright E2E**: `npx playwright test` (`playwright.config.ts` -> `tests/app.spec.ts` on `http://127.0.0.1:4173`; required after every frontend/UI/CSS edit)
- **Deploy to Homelab**: `domino-deploy` (`--local-only` or `--skip-build` supported)
- **Mandatory Rules**:
  1. Run Playwright E2E tests after any frontend, template, or styling modification.
  2. Commit every completed milestone with a clean, semantic Git commit message (`git add . && git commit -m "feat/fix/chore(...): ..."`).

## 4. Context Map
- Read [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) ([ES](./docs/ARCHITECTURE.es.md)) for game state machines, board chain geometry, `src/engine/coach.ts`, `src/i18n/`, experimental `public/`/`dist/` prototypes, or Docker/Runtipi/Cloudflare deployment.
- Read [`docs/TODO.md`](./docs/TODO.md) ([ES](./docs/TODO.es.md)) before starting new work to pick prioritized tasks, review known issues, or log sprint progress.
