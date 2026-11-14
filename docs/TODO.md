# Dominó Maestro — Sprint & Task Tracker

> 🌐 **Language / Idioma**: **English** | [Español](./TODO.es.md)

## 1. Completed Milestones

### Git History (`master`)
- **`b77a933` (2026-11-11) — Initial Baseline (`chore: initial baseline commit for Domino Maestro`)**:
  - Built 4-tab React + TypeScript + Tailwind SPA (`MatchSimulator`, `TacticalAcademy` with 12 Dominican scenarios, `TileTracker` 28-tile manual matrix, `PrinciplesLibrary` 10 Master Laws).
  - Configured Docker (`nginx:alpine`), `nginx.conf` (`/health`, gzip, SPA fallback), and Vite dev server on port `3333`.
- **`fe66af3` & `4d5a43b` (2026-11-11) — Tactile Tournament UI & Repo Ignore**:
  - Upgraded tile visual styling, shadows, and `.gitignore` (`node_modules`).
- **`a2174aa` (2026-11-11) — 3-Column Tournament Cockpit (`feat(ui): implement full 3-column tournament cockpit matching mockup`)**:
  - Defaulted root view to `simulator` (*Mesa*), expanded container to `1700px`, added Left HUD (Tactical Coach telemetry) and Right HUD (28-Tile Probability Matrix), added standing 3D opponent tiles and bottom player rack tray.
- **`9def41d` (2026-11-11) — Authentic Mockup Transformation (`feat(ui): complete authentic mockup UI transformation`)**:
  - Moved `.felt-texture` to full-screen edge-to-edge root, added floating glass header, stripped nested table borders and redundant `'JUGAR'` labels, and enlarged ivory resin tiles with brass pins.

### Uncommitted Prototype Milestones (`dist/v2/` — 2026-11-12)
- Deployed standalone interactive v2.0 table at `dist/v2/index.html` (plus visual prototypes `/v-sprites/`, `/v-pbr-3d/`, `/v-opt-a/`, `/v-tactile/`):
  - Implemented 3-layer DOM architecture (`#shadows-layer`, `#tiles-layer`, `#targets-layer`) eliminating tile-to-tile shadow bleeding.
  - Replaced mixed English/Spanish labels with pure Spanish UI terminology.
  - Added Web Audio API wooden clack synthesis (`playClackSound()`).
  - Built explicit `leftArm`/`rightArm` seam engine with strict open-end validation (`{ inner, outer }`).

---

### Completed Priority Milestones (`P0`–`P3`)
- **[P0] Playwright E2E Suite (`playwright.config.ts`, `tests/app.spec.ts`)**:
  - Configured headless Chromium runner (`playwright/test` targeting dedicated Vite dev server on `http://127.0.0.1:4173`) with 5 core E2E specs covering navigation tabs, theme toggle, rule configurator modal, Academia scenario flow (`1/12` -> `2/12`), Matriz 28 demo/reset & 7-tile limit guard, and Doctrina law tabs (`5 passed`).
- **[P1] `/v2/` Backport & Tactical Heuristic AI (`src/engine/coach.ts`, `src/utils/sound.ts`, `MatchSimulator.tsx`, `DominoTile.tsx`, `TacticalAcademy.tsx`)**:
  - Extracted pure `evaluateMovesForSeat` + `getPlayableMoves` into `src/engine/coach.ts` and replaced random AI seat play (`1`, `2`, `3`) with full Dominican 2v2 heuristic scoring (suit control, *cuadre*, pip offload, double offload, partner pass avoidance, next-rival strangling, partner *Salida* respect).
  - Added Web Audio wooden clack synthesis (`playClackSound()`), explicit `{ inner, outer }` seam validation, independent `#shadows-layer` / `#tiles-layer` (`boardMode`), and pure Spanish HUD titles (`6 passed`).
- **[P2] Live Header Telemetry & Static Prototype Preservation (`src/App.tsx`, `src/components/MatchSimulator.tsx`, `public/`)**:
  - Added `MatchTelemetry` (`scores`, `targetScore`, `handNumber`, `roundSeconds`) and a live 1-second round timer in `MatchSimulator`, wired via `onTelemetryChange` to `App.tsx` (`data-testid="header-live-score"` and `data-testid="header-round-timer"` replacing static `154 - 120` and `00:00:00`).
  - Preserved static prototype sub-routes (`v2/`, `v-opt-a/`, `v-pbr-3d/`, `v-sprites/`, `v-tactile/`, `v1-threejs/`, `v2-isometric/`) under `public/` so `npm run build` emits `dist/v2/index.html`, and ignored generated test/preview artifacts in `.gitignore` (`7 passed`).
- **[P3] Bilingual Documentation (ES/EN) & Full Bilingual Application (ES/EN) (`src/i18n/`, all UI components, `README.es.md`, `docs/*.es.md`)**:
  - Implemented `LanguageProvider` (`localStorage['domino-lang']`, default `'es'`) and `getScenarios(lang)` translating all 12 tactical scenarios, all 10 Master Laws in `PrinciplesLibrary`, all 28-Tile Matrix diagnostics, and the full 2v2 Simulator (`App.tsx`, `MatchSimulator.tsx`, `TacticalAcademy.tsx`, `TileTracker.tsx`, `PrinciplesLibrary.tsx`).
  - Created Spanish companion documentation (`README.es.md`, `docs/ARCHITECTURE.es.md`, `docs/TODO.es.md`) and cross-linked bilingual headers across all docs.

## 2. In Progress / Known Issues

None — all prioritized `P0`–`P3` backlog milestones have been implemented and verified.

---

## 3. Prioritized Backlog Status

- **[x] [P0] Initialize Playwright E2E Suite**: Completed (`5 passed`).
- **[x] [P1] Backport `/v2/` Engine & UI Improvements into `src/`**: Completed (`6 passed`).
- **[x] [P1] Replace Random AI Seat Logic with Tactical Heuristic**: Completed (`src/engine/coach.ts`).
- **[x] [P2] Wire Live Score & Round Timer to Header Telemetry**: Completed (`data-testid="header-live-score"` & `data-testid="header-round-timer"`, `7 passed`).
- **[x] [P2] Clean Up Repository & Preserve Sub-Routes Properly**: Completed (`public/` static prototypes + `.gitignore`, `dist/v2/index.html` verified).
- **[x] [P3] Bilingual Documentation (ES/EN) & Full Bilingual Application (ES/EN)**:
  - Spanish documentation companions (`README.es.md`, `docs/ARCHITECTURE.es.md`, `docs/TODO.es.md`) and bilingual cross-links across `GEMINI.md` and English docs.
  - Persistent `ES` / `EN` language switcher (`data-testid="lang-toggle"`, `localStorage['domino-lang']`) across `App.tsx`, `MatchSimulator.tsx`, `TacticalAcademy.tsx` (+ all 12 scenarios), `TileTracker.tsx`, and `PrinciplesLibrary.tsx`.
