# Dominó Maestro (`domino-masterclass`)

> 🌐 **Idioma / Language**: [English](./README.md) | **Español**

Suite interactiva bilingüe (**ES / EN**) de entrenamiento para **dominó dominicano competitivo en parejas (2v2)**, con simulador de partido en vivo, Coach Táctico determinista del lado cliente (*El Maestro*), matriz de probabilidad de las 28 fichas y academia táctica curada.

- **Instancia en Producción**: [https://domino.concepcions.org](https://domino.concepcions.org)
- **Repositorio**: [https://github.com/rodolfoconcepcion/domino-maestro](https://github.com/rodolfoconcepcion/domino-maestro)

---

## Módulos Principales (`src/`)

| Pestaña (`App.tsx`) | Módulo | Descripción |
|---|---|---|
| **Mesa / Table** | [`src/components/MatchSimulator.tsx`](./src/components/MatchSimulator.tsx) | Mesa completa 2v2 de 4 jugadores (`Nosotros/Us`: `0` y `2` vs. `Ellos/Them`: `1` y `3`) a 100 o 200 puntos con marcador/reloj en vivo en el encabezado, cadena serpenteante (*snake-chain*), capa independiente de sombras DOM, síntesis de sonido Web Audio, HUD izquierdo de Coach Táctico, HUD derecho de Matriz de 28 Fichas y resumen de mano. |
| **Academia / Academy** | [`src/components/TacticalAcademy.tsx`](./src/components/TacticalAcademy.tsx), [`src/data/scenarios.ts`](./src/data/scenarios.ts), [`src/i18n/scenarios.en.ts`](./src/i18n/scenarios.en.ts) | 12 escenarios tácticos interactivos bilingües en niveles `Principiante`, `Intermedio` y `Maestro` (*salida óptima*, *respeto a la salida*, estrangulación al rival de la derecha, cálculo de *tranque*, *ficha puente*, *cambio de mando*, *la pensada* y defensa *a ley de una*). |
| **Matriz 28 / 28 Matrix** | [`src/components/TileTracker.tsx`](./src/components/TileTracker.tsx) | Matriz manual interactiva de conteo de las 28 fichas (`[0:0]`–`[6:6]`) con límite estricto de 7 fichas en mano, alertas de números monopolizados, números muertos y dobles atrapados. |
| **Doctrina / Doctrine** | [`src/components/PrinciplesLibrary.tsx`](./src/components/PrinciplesLibrary.tsx) | Compendio bilingüe de las *10 Leyes Maestras* del dominó competitivo dominicano. |
| **Motor Central e i18n** | [`src/engine/coach.ts`](./src/engine/coach.ts), [`src/i18n/LanguageContext.tsx`](./src/i18n/LanguageContext.tsx), [`src/utils/sound.ts`](./src/utils/sound.ts) | Evaluador heurístico compartido para los 4 asientos (`es`/`en`), contexto persistente de idioma (`localStorage['domino-lang']`) y sintetizador de chasquido de madera Web Audio. |
| **Prototipos Estáticos** | `public/v2/`, `public/v-pbr-3d/`, `public/v-sprites/`, etc. (`dist/` al compilar) | Compilaciones experimentales HTML/Tailwind preservadas durante `vite build`. |

---

## Reglas Dominicanas y Variaciones Configurables

El motor de juego aplica por defecto reglas de torneo dominicano con controles en vivo dentro de **Mesa**:

- **Juego y Asientos**: Baraja estándar de 28 fichas doble seis, 7 por jugador, turno estricto en sentido antihorario `(playerIdx + 1) % 4`.
- **La Salida**: La Mano #1 abre obligatoriamente con `[6:6]` (o `[0:0]` *"La Chiva"* si `ruleFirstHandSalida = '00'`). Desde la Mano #2 rige *salida libre* (*"El que gana sale"*).
- **Pegada y Capicúa**: Quedarse sin fichas suma todos los puntos restantes en la mesa, con bono configurable de *Capicúa* (`0`, `+25` o `+50` puntos al pegar con ficha no doble que encaja en ambas puntas abiertas).
- **Tranque (Cierre)**: Admite comparación **Dominicana 1 vs 1** (`closerIdx` vs. `(closerIdx + 1) % 4`) o **Por Parejas (2 vs 2)**, resolución de empates por **FEDODO** (`cerrador` gana el empate) o **Mano Brava** (`manobrava` acumula puntos para la siguiente mano), y **Tranca Castigada** opcional (`+25` pts de penalización al trancar perdiendo).
- **Bonos de Paso**: **Paso en la Salida** configurable (`+25`) y **Triple Paso / Pase Corrido** (`+25`).
- **Límite de Bono (`ruleNoWinByBonus`)**: Los puntos de bonificación no aplican ni permiten ganar el partido cuando una pareja está a 25 puntos o menos de la meta (`>= 75` en partidas a 100 pts o `>= 175` a 200 pts).
- **Alerta de Zapato (`ruleZapatoAlert`)**: Celebra victorias por blanqueo total (ej. `100-0` o `200-0`).

---

## Stack Tecnológico

- **Frontend**: React `18.3`, TypeScript `~5.7` (`strict: true`), Vite `6.0`, Tailwind CSS `3.4`, `lucide-react`, `canvas-confetti`, Web Audio API
- **IA / Coach**: Evaluador heurístico determinista 100% en navegador (sin llamadas a LLMs externos ni base de datos)
- **Pruebas y Calidad**: Playwright (`^1.65.0`)
- **Contenedor y Red**: `nginx:alpine` ([`Dockerfile`](./Dockerfile), [`nginx.conf`](./nginx.conf) con gzip, fallback SPA y `GET /health`), Cloudflare Zero Trust Tunnel

---

## Guía Rápida de Uso

### Prerrequisitos
- Node.js `>= 18` y `npm`

### Desarrollo Local
```bash
npm install
npm run dev
```
Inicia el servidor de desarrollo Vite en `http://0.0.0.0:3333` (`vite.config.ts`).

### Verificación de Tipos, Compilación y Vista Previa
```bash
npm run build    # Ejecuta tsc && vite build -> dist/
npm run preview  # Previsualiza el paquete de producción localmente
```

### Pruebas E2E con Playwright
```bash
npx playwright test
```
Ejecuta Chromium headless contra `http://127.0.0.1:4173` (`playwright.config.ts` + [`tests/app.spec.ts`](./tests/app.spec.ts)), verificando navegación, cambio de tema, configurador de reglas, flujo de Academia, Matriz 28, Doctrina, mejoras P1, telemetría en vivo P2 y cambio bilingüe `ES <-> EN` P3 en todas las pestañas.

### Docker
```bash
docker build -t domino-maestro .
docker run -d -p 3333:80 --name domino-maestro domino-maestro
```
Endpoint de salud: `GET http://localhost:3333/health` -> `{"status":"ok","service":"domino-maestro"}`.

---

## Documentación del Proyecto

- [`GEMINI.md`](./GEMINI.md) — Invariantes clave, reglas del dominó y flujo de trabajo Git/Playwright
- [`README.md`](./README.md) — Main project documentation in English
- [`docs/ARCHITECTURE.es.md`](./docs/ARCHITECTURE.es.md) ([English](./docs/ARCHITECTURE.md)) — Máquina de estados, geometría de cadena, heurística del Coach, i18n y despliegue
- [`docs/TODO.es.md`](./docs/TODO.es.md) ([English](./docs/TODO.md)) — Hitos completados, incidencias y backlog priorizado
