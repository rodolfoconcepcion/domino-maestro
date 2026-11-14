# Dominó Maestro — Sprint & Task Tracker

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

## 2. In Progress / Known Issues

1. **Missing Playwright E2E Configuration & Test Suite**:
   - `playwright` (`^1.65.0`) was added to `package.json` and `package-lock.json` (currently uncommitted), but no `playwright.config.ts` or `tests/` specs exist yet.
2. **Random Bot Move Selection in React Simulator**:
   - In `src/components/MatchSimulator.tsx` (lines 784–786), AI seats `1`, `2`, and `3` pick a random legal move (`Math.floor(Math.random() * playable.length)`) and always play `'left'` on `'both'`-end tiles instead of using a tactical heuristic.
3. **Static Header Telemetry in `src/App.tsx`**:
   - The top glass header bar (`src/App.tsx`, lines 65–78) renders hardcoded placeholder text (`154 - 120` Live Tournament Score and `00:00:00` Round timer) rather than live `gameScores` and round elapsed time from `MatchSimulator`.
4. **Feature Drift Between `src/` and `dist/v2/index.html`**:
   - Upgrades implemented in `dist/v2/index.html` (independent `.felt-shadow` layer, Web Audio tile clack synthesis, 100% Spanish Left/Right HUD labels replacing *"Tactical Coach"* / *"Partner Signaling"* / *"Tranca Risk"* / *"28-Tile Probability Matrix"*, and explicit `leftArm`/`rightArm` tracking) have not yet been ported into `src/components/`.
5. **Working Tree & Build Hygiene**:
   - `package.json` / `package-lock.json` have uncommitted Playwright changes.
   - Root screenshot artifacts (`preview_v1*.png`, `screenshot.png`), `reference_apps/`, and standalone prototype directories inside `dist/` (`dist/v2/`, `dist/v-pbr-3d/`, `dist/v-sprites/`, etc.) are untracked; running `npm run build` (`vite build`) risks overwriting static sub-routes in `dist/`.

---

## 3. Next Up (Prioritized Backlog)

- **[P0] Initialize Playwright E2E Suite**:
  - Add `playwright.config.ts` targeting `http://localhost:3333` (and Vite preview/dev webServer).
  - Add `tests/` specs covering all 4 tabs (`Mesa`, `Academia`, `Matriz 28`, `Doctrina`), legal move highlighting, dual-end side prompt, Dominican rule toggles, 7-tile limit in `TileTracker`, and responsive mobile/desktop viewports.
- **[P1] Backport `/v2/` Engine & UI Improvements into `src/`**:
  - Port independent contact-shadow rendering, Web Audio clack sound effects, pure Spanish HUD labels, and explicit `leftArm`/`rightArm` seam validation from `dist/v2/index.html` into `src/components/MatchSimulator.tsx` and `src/components/DominoTile.tsx`.
- **[P1] Replace Random AI Seat Logic with Tactical Heuristic**:
  - Extract the heuristic scorer in `MatchSimulator.tsx` into a reusable pure module (e.g., `src/engine/coach.ts`) and use it for seats `1`, `2`, and `3` (partner respects player's *Salida*; rivals target cutting the next player and offloading doubles/heavy pips).
- **[P2] Wire Live Score & Round Timer to Header Telemetry**:
  - Lift `gameScores`, `handNumber`, and a live `useEffect` round timer to `App.tsx` (or shared context) to replace the static `154 - 120` and `00:00:00` header values.
- **[P2] Clean Up Repository & Preserve Sub-Routes Properly**:
  - Move any kept static prototypes (`v2/`, etc.) into `public/` if they should survive `vite build`, `.gitignore` temporary root preview PNGs, and commit the cleaned tree.
