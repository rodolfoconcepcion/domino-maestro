# Dominó Maestro — Seguimiento de Tareas y Sprints

> 🌐 **Idioma / Language**: [English](./TODO.md) | **Español**

## 1. Hitos Completados

### Historial Git (`master`)
- **`b77a933` (2026-11-11) — Línea Base Inicial (`chore: initial baseline commit for Domino Maestro`)**:
  - Aplicación SPA de 4 pestañas en React + TypeScript + Tailwind (`MatchSimulator`, `TacticalAcademy` con 12 escenarios dominicanos, `TileTracker` de 28 fichas, `PrinciplesLibrary` con las 10 Leyes Maestras).
  - Configuración de Docker (`nginx:alpine`), `nginx.conf` (`/health`, gzip, fallback SPA) y servidor Vite en puerto `3333`.
- **`fe66af3` & `4d5a43b` (2026-11-11) — Interfaz Táctil de Torneo y `.gitignore`**:
  - Mejoras visuales en fichas, sombras e ignorado de `node_modules`.
- **`a2174aa` (2026-11-11) — Cabina de Torneo en 3 Columnas (`feat(ui): implement full 3-column tournament cockpit matching mockup`)**:
  - Vista inicial por defecto en `simulator` (*Mesa*), contenedor expandido a `1700px`, HUD izquierdo del Coach Táctico y HUD derecho de Matriz de Probabilidad, fichas 3D de rivales y atril inferior para el jugador.
- **`9def41d` (2026-11-11) — Transformación Visual Auténtica (`feat(ui): complete authentic mockup UI transformation`)**:
  - Textura `.felt-texture` de borde a borde, encabezado superior glass flotante y fichas marfil ampliadas con pines metálicos.

### Prototipos Independientes (`dist/v2/` — 2026-11-12)
- Mesa interactiva independiente v2.0 en `dist/v2/index.html` (junto con `/v-sprites/`, `/v-pbr-3d/`, `/v-opt-a/`, `/v-tactile/`) incorporando arquitectura DOM en 3 capas (`#shadows-layer`, `#tiles-layer`, `#targets-layer`), audio Web Audio (`playClackSound()`) y uniones explícitas `leftArm`/`rightArm`.

---

### Prioridades Completadas (`P0`–`P3`)
- **[P0] Suite E2E con Playwright (`playwright.config.ts`, `tests/app.spec.ts`)**:
  - Ejecutor Chromium headless contra servidor Vite dedicado (`http://127.0.0.1:4173`) con 5 pruebas E2E cubriendo pestañas de navegación, cambio de tema, configurador de reglas, flujo de Academia (`1/12` -> `2/12`), Matriz 28 (ejemplo, reinicio y límite 7/7) y pestañas de Doctrina (`5 passed`).
- **[P1] Migración `/v2/` e IA Táctica Heurística (`src/engine/coach.ts`, `src/utils/sound.ts`, `MatchSimulator.tsx`, `DominoTile.tsx`, `TacticalAcademy.tsx`)**:
  - Extracción de `evaluateMovesForSeat` + `getPlayableMoves` a `src/engine/coach.ts`, reemplazando las jugadas aleatorias de los asientos IA (`1`, `2`, `3`) por heurística competitiva dominicana 2v2.
  - Síntesis acústica Web Audio (`playClackSound()`), validación explícita `{ inner, outer }` de puntas abiertas, capa independiente `board-shadows-layer` / `board-tiles-layer` (`boardMode`) y títulos HUD estandarizados (`6 passed`).
- **[P2] Telemetría en Vivo e Higiene de Prototipos (`src/App.tsx`, `src/components/MatchSimulator.tsx`, `public/`)**:
  - Agregado `MatchTelemetry` (`scores`, `targetScore`, `handNumber`, `roundSeconds`) y reloj de ronda de 1 segundo conectado vía `onTelemetryChange` a `App.tsx` (`data-testid="header-live-score"` y `data-testid="header-round-timer"`).
  - Preservación de subrutas estáticas (`v2/`, `v-opt-a/`, `v-pbr-3d/`, `v-sprites/`, `v-tactile/`, `v1-threejs/`, `v2-isometric/`) dentro de `public/` para emitir `dist/v2/index.html` en compilación y limpieza vía `.gitignore` (`7 passed`).
- **[P3] Documentación Bilingüe (ES/EN) y Aplicación Completamente Bilingüe (ES/EN) (`src/i18n/`, todos los componentes UI, `README.es.md`, `docs/*.es.md`)**:
  - Contexto `LanguageProvider` (`localStorage['domino-lang']`, defecto `'es'`) y capa `getScenarios(lang)` traduciendo los 12 escenarios tácticos, las 10 Leyes Maestras, la Matriz 28 y todo el Simulador 2v2 (`App.tsx`, `MatchSimulator.tsx`, `TacticalAcademy.tsx`, `TileTracker.tsx`, `PrinciplesLibrary.tsx`).
  - Documentación completa en español (`README.es.md`, `docs/ARCHITECTURE.es.md`, `docs/TODO.es.md`) y selectores cruzados en toda la documentación.

## 2. En Progreso / Incidencias Conocidas

Ninguna — todos los elementos priorizados `P0`–`P3` han sido implementados y verificados.

---

## 3. Estado del Backlog Priorizado

- **[x] [P0] Inicializar Suite E2E con Playwright**: Completado (`5 passed`).
- **[x] [P1] Portar Mejoras de Motor y UI de `/v2/` hacia `src/`**: Completado (`6 passed`).
- **[x] [P1] Reemplazar IA Aleatoria por Heurística Táctica**: Completado (`src/engine/coach.ts`).
- **[x] [P2] Conectar Marcador en Vivo y Temporizador al Encabezado**: Completado (`data-testid="header-live-score"` y `data-testid="header-round-timer"`, `7 passed`).
- **[x] [P2] Limpiar Repositorio y Preservar Subrutas Estáticas**: Completado (`public/` + `.gitignore`, `dist/v2/index.html` verificado).
- **[x] [P3] Documentación Bilingüe (ES/EN) y Aplicación Completamente Bilingüe (ES/EN)**:
  - Documentación complementaria en español (`README.es.md`, `docs/ARCHITECTURE.es.md`, `docs/TODO.es.md`) y enlaces de idioma en todos los documentos.
  - Selector persistente `ES` / `EN` (`data-testid="lang-toggle"`, `localStorage['domino-lang']`) en `App.tsx`, `MatchSimulator.tsx`, `TacticalAcademy.tsx` (+ 12 escenarios), `TileTracker.tsx` y `PrinciplesLibrary.tsx`.
