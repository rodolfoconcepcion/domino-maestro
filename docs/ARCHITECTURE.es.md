# Dominó Maestro — Referencia de Arquitectura

> 🌐 **Idioma / Language**: [English](./ARCHITECTURE.md) | **Español**

## 1. Sistema y Flujo de Datos

Dominó Maestro es una aplicación SPA puramente del lado cliente en React + TypeScript (`src/main.tsx` -> `<LanguageProvider>` -> `src/App.tsx`). No existe API backend ni persistencia en servidor; todo el estado de partida, la heurística del entrenador, la síntesis de audio y el conteo probabilístico corren en memoria del navegador (con tema guardado en `localStorage['domino-theme']` e idioma guardado en `localStorage['domino-lang']`).

### Vistas Principales (`src/App.tsx`)
| Estado de Pestaña | Etiqueta (`ES` / `EN`) | Componente | Propósito |
|---|---|---|---|
| `'simulator'` (defecto) | `Mesa` / `Table` | `MatchSimulator` | Cabina de torneo 2v2 en 3 columnas, configurador de reglas, emisor de telemetría y HUD táctico |
| `'academy'` | `Academia` / `Academy` | `TacticalAcademy` | 12 ejercicios tácticos interactivos bilingües (`getScenarios(lang)`) con tablero paso a paso |
| `'tracker'` | `Matriz 28` / `28 Matrix` | `TileTracker` | Rastreador manual de 28 fichas por toque con límite estricto de 7 fichas y auditoría por palo |
| `'library'` | `Doctrina` / `Doctrine` | `PrinciplesLibrary` | Compendio bilingüe de las *10 Leyes Maestras* |

### Máquina de Estados de la Partida (`src/components/MatchSimulator.tsx`)
```
startNewRound(handNum)
  ├── Reparte 4x7 fichas doble-seis barajadas -> hands[0..3]
  ├── Mano #1: asigna salidorIndex al poseedor de [6:6] (o [0:0] si La Chiva)
  ├── Mano #2+: asigna salidorIndex = lastWinnerIndex (o rota)
  └── turn = salidorIndex
        │
        ├──► turn === 0 (Humano) ──► Toca ficha resaltada (o selector Izq/Der)
        │                            o "Paso Obligado" si playableForMe.length === 0
        │
        └──► turn ∈ {1,2,3} (IA) ──► setTimeout 900ms -> evaluateMovesForSeat()
                                    ├── playable.length > 0 -> makePlay()
                                    └── playable.length === 0 -> handlePass()
                                          │
                                          ▼
                            checkNextTurn(nextPlayer, newHands, updatedEnds, closerIdx)
                              ├── newHands[playerIdx].length === 0 -> Pegada (+Capicúa/+Mano Brava)
                              ├── !anyPlayerCanPlay -> Tranque (1v1 FEDODO o 2v2 parejas)
                              └── Caso contrario -> setTurn((playerIdx + 1) % 4)
```

### Motor Geométrico de Cadena Serpenteante
Tanto `MatchSimulator.tsx` (`TILE_LONG = 72`, `TILE_SHORT = 40`, `ARM_ROW = 5`) como `TacticalAcademy.tsx` (`TILE_LONG = 56`, `TILE_SHORT = 32`, `ARM_ROW = 5`) comparten el mismo cálculo determinista 2D (`layoutArm` + `mirrorArm`):
1. `board[centerIdx]` se ancla en `(-centerW / 2, -centerH / 2)`.
2. `rightOut = board.slice(centerIdx + 1)` se extiende a la derecha vía `layoutArm()`, partiendo de `+centerW / 2`.
3. `leftOut = board.slice(0, centerIdx).reverse()` invierte cada ficha (`[outer, chain]` -> `[chain, outer]`), corre `layoutArm()` y aplica espejo horizontal (`left = -(p.left + w)`), partiendo de `-centerW / 2`.
4. Los dobles se dibujan cruzados verticalmente (`vertical = true`) sobre la línea.
5. Tras `ARM_ROW = 5` fichas por fila, la siguiente gira verticalmente desplazando `y` hacia abajo por `TILE_LONG * 0.75` e invirtiendo `dir = -dir`.
6. La escala responsiva ajusta móviles (`viewportW < 640`) mediante `scale = Math.max(0.5, availW / rawW)`.

### Compilaciones Estáticas Preservadas (`public/` -> `dist/`)
Los prototipos estáticos HTML/Tailwind viven bajo `public/` (`v2/`, `v-opt-a/`, `v-pbr-3d/`, `v-sprites/`, `v-tactile/`, `v1-threejs/`, `v2-isometric/`, `refs/`) para que `npm run build` conserve todas las subrutas en `dist/`.

---

## 2. Diseño del Maestro Virtual / Coach Táctico IA

El Maestro Virtual / **Coach Táctico** es un **motor heurístico determinista** combinado con un **árbol curado de escenarios**. No se realizan llamadas a APIs LLM ni inferencia externa.

### Evaluador de Jugadas en Vivo (`src/engine/coach.ts`)
- **Disparadores**:
  - Para el Humano (`seatIdx === 0`): `useEffect` en `MatchSimulator.tsx` cuando `turn === 0 && !gameOver`, pasando el estado actual + idioma activo `lang` (`'es' | 'en'`).
  - Para asientos IA (`seatIdx ∈ {1, 2, 3}`): temporizador `900ms` invoca `evaluateMovesForSeat({ seatIdx, ..., lang })` y ejecuta `options[0]` (o pasa vía `handlePass`).
- **Entradas**:
  - `seatIdx: number` (`0..3`), `hands: Tile[][]`, `boardEnds: [number, number] | null`, `passedSuits: number[][]`, `handNumber`, `ruleFirstHandSalida`, `salidorIndex`, `boardLength`, `salidaValues`, `lang?: 'es' | 'en'`.
- **Reglas de Puntuación**:
  1. **Salida Mano #1 (`!boardEnds && handNumber === 1`)**: Fuerza la salida reglamentaria (`[6:6]` o `[0:0]`, puntaje `10`).
  2. **Salida Libre (`!boardEnds && handNumber > 1`)**: Ordena todas las fichas por dominio de palo (`maxSuit * 3`), bono por doble respaldado (`+4` si `t[0] === t[1]`) y descarga de puntos (`round(((t[0] + t[1]) / 3) * 10) / 10`).
  3. **Juego Medio**: Evalúa cada par válido `(tile, side)` con `newEnd`, `otherEnd`, mano restante `rest`, compañero relativo `(seatIdx + 2) % 4`, rival derecho `(seatIdx + 1) % 4` y rival izquierdo `(seatIdx + 3) % 4`:
     - **Control de Palo**: `+3` por cada ficha en `rest` que coincida con `newEnd` u `otherEnd`.
     - **Cuadre**: `+4` si `newEnd === otherEnd && owned(newEnd) > 0`.
     - **Descarga de Peso**: `+round((pips / 3) * 10) / 10`.
     - **Acostar Doble**: `+3` si `tile[0] === tile[1]`.
     - **Explotación de Pases / Respeto al Salidor**:
       - `-5` si el compañero ya pasó al `newEnd`.
       - `+5` si el rival derecho ya pasó al `newEnd`.
       - `+1` si el rival izquierdo ya pasó al `newEnd`.
       - `+2` respeto a la salida del compañero en rondas iniciales (`boardLength <= 5`).
- **Salidas**:
  - `options: CoachOption[]`: Ordenadas descendentemente por `total`, mostrando el Top 3 en el HUD izquierdo (`MatchSimulator.tsx`).
  - `advice: string`: Recomendación táctica localizada (`es` o `en`) justificando la jugada óptima.
  - **Barras de Telemetría del HUD Izquierdo** (`MatchSimulator.tsx`):
    - *La Salida*: `salidaPct = clamp(25..100, round((dominantSuitCount / 7) * 100))`
    - *Señales del Compañero*: `76%` (sin pases conflictivos), `48%` (pasó a 1 punta), `15%` (pasó a ambas), `50%` (mesa sin abrir)
    - *Riesgo de Tranque*: `clamp(12..95, round((playedCountOnOpenEnds / 14) * 100))`
- **Telemetría en Encabezado (`App.tsx` <-> `MatchSimulator.tsx`)**:
  - `MatchSimulator` emite `{ scores, targetScore, handNumber, roundSeconds }` mediante `onTelemetryChange` alimentado por un reloj de 1 segundo que actualiza `[data-testid="header-live-score"]` y `[data-testid="header-round-timer"]`.

### Audio Independiente y Capas de Sombra DOM
- **`src/utils/sound.ts`**: `playClackSound()` sintetiza el golpe acústico de cada ficha mediante osciladores triangulares Web Audio API.
- **Superficie DOM en 2 Capas (`DominoTile.tsx` `boardMode`, `MatchSimulator.tsx`, `TacticalAcademy.tsx`)**: Separa `data-testid="board-shadows-layer"` (`z-0`) de `data-testid="board-tiles-layer"` (`z-10`) evitando que las sombras oscurezcan fichas vecinas.

### Academia Curada y Deducciones de 28 Fichas
- **Academia Táctica (`src/data/scenarios.ts` + `src/i18n/scenarios.en.ts` + `TacticalAcademy.tsx`)**: `getScenarios(lang)` retorna los 12 escenarios `PuzzleScenario` traducidos dinámicamente a Español o Inglés sin duplicar geometría.
- **Matriz 28 (`src/components/TileTracker.tsx`)**: Calcula inventario por palo (`remaining = 7 - (inHand + onBoard)`), detectando `monopolySuits`, `drySuits` y `trappedDoubles`.

---

## 3. Mapa de Directorios

```text
/home/rodolfo/projects/domino-masterclass/
├── GEMINI.md                     # Invariantes y flujo de sesión auto-cargado (<120 líneas)
├── README.md / README.es.md      # Guía principal bilingüe (EN & ES)
├── docs/
│   ├── ARCHITECTURE.md / .es.md  # Referencia técnica de arquitectura (EN & ES)
│   └── TODO.md / .es.md          # Seguimiento de sprints y backlog (EN & ES)
├── playwright.config.ts          # Ejecutor Chromium headless en http://127.0.0.1:4173
├── tests/
│   └── app.spec.ts               # Suite E2E Playwright (navegación, reglas, Academia, Matriz, Doctrina, P1–P3)
├── public/                       # Prototipos estáticos preservados en dist/ (v2/, v-pbr-3d/, etc.)
├── src/
│   ├── main.tsx                  # Punto de entrada React 18 envuelto en <LanguageProvider>
│   ├── App.tsx                   # Barra superior flotante, telemetría en vivo, selector ES/EN, tema y 4 pestañas
│   ├── index.css                 # Directivas Tailwind, .felt-texture, paneles glass y modo claro
│   ├── i18n/
│   │   ├── LanguageContext.tsx   # Contexto persistente ES/EN (localStorage['domino-lang'])
│   │   └── scenarios.en.ts       # Capa completa de traducción al inglés de los 12 escenarios + getScenarios(lang)
│   ├── engine/
│   │   └── coach.ts              # Evaluador heurístico compartido para los 4 asientos y jugadas válidas
│   ├── utils/
│   │   └── sound.ts              # Sintetizador de chasquido Web Audio
│   ├── types/
│   │   └── domino.ts             # Interfaces Tile, ScenarioBoardTile, PuzzleScenario y GamePlayer
│   ├── data/
│   │   └── scenarios.ts          # 12 escenarios tácticos dominicanos curados (SCENARIOS)
│   └── components/
│       ├── DominoTile.tsx        # Ficha de resina marfil reutilizable con pines, insignias y boardMode
│       ├── MatchSimulator.tsx    # Motor principal 2v2, 11 configuraciones de regla, cadena serpenteante y HUDs
│       ├── TacticalAcademy.tsx   # Tablero interactivo de escenarios con getScenarios(lang)
│       ├── TileTracker.tsx       # Matriz manual de 28 fichas con límite estricto de 7 fichas
│       └── PrinciplesLibrary.tsx # Visor bilingüe de las 10 Leyes Maestras
├── Dockerfile                    # Imagen nginx:alpine (puerto 80)
├── nginx.conf                    # Compresión gzip, fallback SPA y endpoint GET /health
├── package.json                  # React 18, Vite 6, TS 5.7, Tailwind 3.4, Playwright ^1.65.0
├── tsconfig.json                 # Configuración TypeScript estricta
└── vite.config.ts                # Configuración Vite (host 0.0.0.0, puerto 3333)
```

---

## 4. Despliegue y Red

### Flujo de Compilación y Entrega
```text
Espacio Local (/home/rodolfo/projects/domino-masterclass)
  │
  ├──[1] npm run build (tsc && vite build) ──► dist/
  │
  ├──[2] ~/.local/bin/domino-deploy
  │       ├── Reinicia domino-maestro.service local si está activo
  │       ├── rsync -avz --delete (excl. node_modules, .git)
  │       │      └──► Homelab 192.168.0.25:/home/rodolfo/runtipi/apps/_user/domino-maestro/src/
  │       └── ssh docker restart runtipi-domino-maestro
  │
  └──[3] Contenedor de Producción (runtipi-domino-maestro, nginx:alpine)
          ├── Volúmenes: ./src/dist -> /usr/share/nginx/html:ro
          │              ./src/nginx.conf -> /etc/nginx/conf.d/default.conf:ro
          ├── Puerto LAN: 0.0.0.0:3333 -> 80/tcp (http://192.168.0.25:3333)
          └── Túnel Edge: Cloudflare Zero Trust Tunnel ("CasaOs-Davie")
                          └──► https://domino.concepcions.org
```

### Nginx y Monitoreo de Salud
- **Enrutamiento SPA (`nginx.conf`)**: `try_files $uri $uri/ /index.html;` permite servir la aplicación React raíz junto con las subrutas estáticas (`/v2/`, `/v-sprites/`, etc.) directamente desde `/usr/share/nginx/html`.
- **Endpoint de Salud**: `GET /health` responde `200 OK` con `{"status":"ok","service":"domino-maestro"}` (`access_log off`).
- **Disponibilidad y Alertas**: Monitoreado en Uptime Kuma Monitor #38 (`https://status.concepcions.org`) con alertas por Telegram (`@Concepcions_homelab_bot`).
- **Docker Compose (`/home/rodolfo/runtipi/apps/_user/domino-maestro/docker-compose.yml`)**: Ejecuta `domino-maestro:latest` con `restart: unless-stopped` en el puerto `3333:80`.
