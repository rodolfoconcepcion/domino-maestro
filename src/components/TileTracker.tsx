import React, { useState } from 'react';
import { DominoTile } from './DominoTile';
import { useLanguage } from '../i18n/LanguageContext';
import { RotateCcw, Brain, ShieldAlert, CheckCircle, BarChart3, Hand, Layers, Sparkles, HelpCircle } from 'lucide-react';

type TileState = 'unplayed' | 'in_hand' | 'on_board';
type MarkMode = 'in_hand' | 'on_board';

// Generate all 28 tiles
const ALL_28_TILES: [number, number][] = [];
for (let i = 0; i <= 6; i++) {
  for (let j = i; j <= 6; j++) {
    ALL_28_TILES.push([i, j]);
  }
}

const DEMO_STATES: Record<string, TileState> = {
  // In your hand (4 tiles left, holding total control of 5s)
  '5-5': 'in_hand',
  '3-5': 'in_hand',
  '1-5': 'in_hand',
  '0-2': 'in_hand',
  // Already played on the board (10 tiles)
  '6-6': 'on_board',
  '5-6': 'on_board',
  '4-5': 'on_board',
  '4-4': 'on_board',
  '2-4': 'on_board',
  '2-6': 'on_board',
  '1-6': 'on_board',
  '0-1': 'on_board',
  '0-5': 'on_board',
  '2-5': 'on_board',
};

export const TileTracker: React.FC = () => {
  const { lang, tr } = useLanguage();
  const [tileStates, setTileStates] = useState<Record<string, TileState>>({});
  const [markMode, setMarkMode] = useState<MarkMode>('in_hand');
  const [selectedSuit, setSelectedSuit] = useState<number | null>(null);
  const [isDemoLoaded, setIsDemoLoaded] = useState<boolean>(false);
  const [handLimitWarning, setHandLimitWarning] = useState<boolean>(false);

  const getTileKey = (t: [number, number]) => `${t[0]}-${t[1]}`;

  const totalInHand = ALL_28_TILES.filter((t) => tileStates[getTileKey(t)] === 'in_hand').length;
  const totalOnBoard = ALL_28_TILES.filter((t) => tileStates[getTileKey(t)] === 'on_board').length;
  const totalUnplayed = 28 - totalInHand - totalOnBoard;

  const handleTileClick = (tile: [number, number]) => {
    const key = getTileKey(tile);
    const current = tileStates[key] || 'unplayed';

    let next: TileState;
    if (markMode === 'in_hand') {
      if (current === 'in_hand') {
        // Always allow unmarking a tile from hand
        next = 'unplayed';
        setHandLimitWarning(false);
      } else {
        // Enforce strict 7-tile regulatory maximum in hand
        if (totalInHand >= 7) {
          setHandLimitWarning(true);
          return;
        }
        next = 'in_hand';
        setHandLimitWarning(false);
      }
    } else {
      // 1-click toggle for Played on Board (Green)
      // If it was in hand, playing it moves it to the board!
      next = current === 'on_board' ? 'unplayed' : 'on_board';
      setHandLimitWarning(false);
    }

    setIsDemoLoaded(false);
    setTileStates((prev) => ({
      ...prev,
      [key]: next,
    }));
  };

  const handleReset = () => {
    setTileStates({});
    setSelectedSuit(null);
    setIsDemoLoaded(false);
    setHandLimitWarning(false);
    setMarkMode('in_hand');
  };

  const handleLoadDemo = () => {
    setTileStates(DEMO_STATES);
    setSelectedSuit(5);
    setIsDemoLoaded(true);
    setHandLimitWarning(false);
    setMarkMode('on_board');
  };

  // Stats per suit (0 to 6)
  const suitStats = Array.from({ length: 7 }, (_, suit) => {
    const suitTiles = ALL_28_TILES.filter(([a, b]) => a === suit || b === suit);
    const inHand = suitTiles.filter((t) => tileStates[getTileKey(t)] === 'in_hand');
    const onBoard = suitTiles.filter((t) => tileStates[getTileKey(t)] === 'on_board');
    const accounted = inHand.length + onBoard.length;
    const remaining = 7 - accounted;

    // Check double status
    const doubleKey = `${suit}-${suit}`;
    const doubleState = tileStates[doubleKey] || 'unplayed';

    return {
      suit,
      inHand: inHand.length,
      onBoard: onBoard.length,
      accounted,
      remaining,
      doubleState,
    };
  });

  // Live tactical deductions based on current matrix
  const monopolySuits = suitStats.filter((s) => s.remaining === 0 && s.inHand > 0);
  const drySuits = suitStats.filter((s) => s.remaining === 0 && s.inHand === 0);
  const trappedDoubles = suitStats.filter((s) => s.doubleState === 'unplayed' && s.remaining >= 1 && s.remaining <= 2);

  return (
    <div className="space-y-5">
      {/* Header & Quick Demo Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md shadow-xl">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            {tr('Herramienta de Entrenamiento Mental', 'Mental Counting & Tracking Tool')}
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            {tr('Matriz de Conteo y Probabilidad (Las 28 Fichas)', 'Counting & Probability Matrix (All 28 Tiles)')}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'en' ? (
              <>
                Mark your tiles and board plays with <b>1 single tap</b> to spot dead suits and trapped doubles.
              </>
            ) : (
              <>
                Marca tus fichas y las jugadas en mesa con <b>1 solo toque</b> para descubrir qué números están muertos y quién tiene dobles atrapados.
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleLoadDemo}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {tr('Cargar Ejemplo Práctico', 'Load Practical Example')}
          </button>

          <button
            onClick={handleReset}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 border border-white/10 transition active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {tr('Limpiar Todo', 'Clear All')}
          </button>
        </div>
      </div>

      {/* Step-by-Step Guide & 1-Click Mode Switcher */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4" />
            {tr(
              '¿Cómo usar la matriz? Elige qué quieres marcar con 1 clic:',
              'How to use the matrix? Choose what to mark with 1 click:'
            )}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {tr('En tu mano:', 'In your hand:')} <b className="text-amber-400">{totalInHand}/7</b> • {tr('En mesa:', 'On board:')} <b className="text-emerald-400">{totalOnBoard}</b> • {tr('Ocultas:', 'Hidden:')} <b className="text-slate-200">{totalUnplayed}</b>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              setMarkMode('in_hand');
              setHandLimitWarning(false);
            }}
            className={`p-3 rounded-xl border text-left transition flex items-center justify-between gap-3 active:scale-98 ${
              markMode === 'in_hand'
                ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/40 text-white'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow">
                <Hand className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-amber-300 uppercase">
                  {tr('Paso 1: Marcar Mi Mano (Amarillo)', 'Step 1: Mark My Hand (Yellow)')}
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  {tr(
                    `Máximo 7 fichas por jugador (${totalInHand}/7 marcadas).`,
                    `Maximum 7 tiles per player (${totalInHand}/7 marked).`
                  )}
                </div>
              </div>
            </div>
            {markMode === 'in_hand' && (
              <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black uppercase shrink-0">
                {tr('Activo', 'Active')}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setMarkMode('on_board');
              setHandLimitWarning(false);
            }}
            className={`p-3 rounded-xl border text-left transition flex items-center justify-between gap-3 active:scale-98 ${
              markMode === 'on_board'
                ? 'bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-400/40 text-white'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-emerald-300 uppercase">
                  {tr('Paso 2: Marcar Fichas en Mesa (Verde)', 'Step 2: Mark Board Tiles (Green)')}
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  {tr(
                    `Actívalo durante el juego y toca cada ficha que se juegue en la mesa (${totalOnBoard} jugadas).`,
                    `Activate during play and tap every tile placed on the board (${totalOnBoard} played).`
                  )}
                </div>
              </div>
            </div>
            {markMode === 'on_board' && (
              <span className="px-2 py-0.5 rounded bg-emerald-400 text-slate-950 text-[10px] font-black uppercase shrink-0">
                {tr('Activo', 'Active')}
              </span>
            )}
          </button>
        </div>

        {(handLimitWarning || (markMode === 'in_hand' && totalInHand === 7)) && (
          <div
            className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
              handLimitWarning
                ? 'bg-rose-950/60 border-rose-500 text-rose-100'
                : 'bg-emerald-950/50 border-emerald-500/60 text-emerald-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className={`w-4 h-4 shrink-0 ${handLimitWarning ? 'text-rose-400' : 'text-emerald-400'}`} />
              <span>
                {handLimitWarning ? (
                  lang === 'en' ? (
                    <>
                      <b>7-tile hand limit reached (7/7):</b> In dominoes you only hold 7 tiles. Tap a yellow tile to unmark it, or switch to <b>Step 2</b>.
                    </>
                  ) : (
                    <>
                      <b>Límite de 7 fichas alcanzado (7/7):</b> En dominó solo tienes 7 fichas en mano. Toca una ficha amarilla si quieres cambiarla, o pasa al <b>Paso 2</b>.
                    </>
                  )
                ) : lang === 'en' ? (
                  <>
                    <b>Hand complete (7/7 tiles)!</b> All 7 tiles are marked. Now switch to <b>Step 2</b> to track board plays.
                  </>
                ) : (
                  <>
                    <b>¡Mano completa (7/7 fichas)!</b> Ya marcaste tus 7 fichas. Ahora cambia al <b>Paso 2</b> para ir marcando las que se jueguen en la mesa.
                  </>
                )}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setMarkMode('on_board');
                setHandLimitWarning(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[11px] shrink-0 shadow transition active:scale-95"
            >
              {tr('Ir al Paso 2 (Mesa) →', 'Go to Step 2 (Board) →')}
            </button>
          </div>
        )}

        {isDemoLoaded && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/50 text-xs text-slate-200 space-y-1">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              {tr('Ejemplo Práctico Cargado (Observa el Número 5 a la derecha):', 'Practical Example Loaded (Watch Suit 5 on the right):')}
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">
              {lang === 'en' ? (
                <>
                  In this example you hold 4 tiles (yellow: <b>[5:5]</b>, <b>[3:5]</b>, <b>[1:5]</b>, <b>[0:2]</b>) and 10 tiles are on the board (green). Look at <b>Suit 5</b> on the right: 4 are on the board and you hold the remaining 3 (<b>7 of 7 visible = 0 live outside, dead suit for everyone else</b>). Squaring the board to 5 forces all 3 opponents to pass!
                </>
              ) : (
                <>
                  En este ejemplo tienes 4 fichas en mano (amarillas: <b>[5:5]</b>, <b>[3:5]</b>, <b>[1:5]</b>, <b>[0:2]</b>) y ya se jugaron 10 fichas en la mesa (verdes). Mira el <b>Número 5</b> en la columna derecha: 4 están en la mesa y las otras 3 las tienes tú en la mano (<b>7 de 7 visibles = 0 vivas afuera, número muerto para los demás</b>). ¡Eso significa que si cuadras la mesa a 5, los otros 3 jugadores están obligados a pasar!
                </>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Main Grid: Suits overview + 28 tiles matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 28 Tiles Interactive Board */}
        <div className="lg:col-span-8 p-3.5 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Brain className="w-4 h-4 text-amber-400" />
              {tr('Tablero de 28 Fichas', '28-Tile Matrix Board')} (
              {markMode === 'in_hand'
                ? tr('Tocando para: Mi Mano ✋', 'Tapping for: My Hand ✋')
                : tr('Tocando para: En Mesa 🎲', 'Tapping for: On Board 🎲')}
              )
            </span>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] sm:text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 rounded bg-slate-100 border border-slate-400" /> {tr('Vivas', 'Live')} ({totalUnplayed})
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-3 h-3 rounded bg-amber-400" /> {tr('En Mano', 'In Hand')} ({totalInHand}/7)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-3 rounded bg-emerald-500" /> {tr('En Mesa', 'On Board')} ({totalOnBoard})
              </span>
            </div>
          </div>

          {/* 7 Rows (one for each suit 0 to 6) */}
          <div className="space-y-2.5 sm:space-y-3">
            {[0, 1, 2, 3, 4, 5, 6].map((suit) => {
              const rowTiles = ALL_28_TILES.filter((t) => t[0] === suit);
              const isFilterActive = selectedSuit === null || selectedSuit === suit;

              return (
                <div
                  key={suit}
                  className={`p-2 sm:p-2.5 rounded-xl border transition-all flex items-center gap-2 sm:gap-3 ${
                    isFilterActive
                      ? 'bg-slate-950/60 border-slate-800/80'
                      : 'opacity-30 bg-slate-950/20 border-transparent'
                  }`}
                >
                  <div className="w-14 sm:w-16 text-center font-bold font-mono text-xs sm:text-sm text-amber-400 shrink-0">
                    {tr('Núm.', 'Suit')} {suit}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 flex-1">
                    {rowTiles.map((tile) => {
                      const key = getTileKey(tile);
                      const state = tileStates[key] || 'unplayed';

                      return (
                        <div key={key} className="relative group flex flex-col items-center">
                          <DominoTile
                            top={tile[0]}
                            bottom={tile[1]}
                            size="sm"
                            selected={state === 'in_hand'}
                            className={
                              state === 'on_board'
                                ? '!border-emerald-500 ring-2 ring-emerald-500/50 opacity-75'
                                : state === 'in_hand'
                                ? '!border-amber-400'
                                : ''
                            }
                            badge={
                              state === 'in_hand'
                                ? tr('MANO', 'HAND')
                                : state === 'on_board'
                                ? tr('MESA', 'BOARD')
                                : undefined
                            }
                            badgeColor={
                              state === 'in_hand'
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-emerald-500 text-slate-950'
                            }
                            onClick={() => handleTileClick(tile)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Tactical Analysis & Probabilities */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                {tr('Auditoría por Números (Regla de 7)', 'Suit Audit (Rule of 7)')}
              </span>
              {selectedSuit !== null && (
                <button
                  onClick={() => setSelectedSuit(null)}
                  className="text-[11px] text-amber-400 hover:underline font-bold"
                >
                  {tr('Ver todos los números', 'Show all suits')}
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {suitStats.map((st) => {
                const isMonopoly = st.remaining === 0 && st.inHand > 0;
                return (
                  <div
                    key={st.suit}
                    onClick={() =>
                      setSelectedSuit(selectedSuit === st.suit ? null : st.suit)
                    }
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      selectedSuit === st.suit
                        ? 'bg-amber-950/30 border-amber-500/60 ring-1 ring-amber-500/40'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        {tr('Número', 'Suit')} {st.suit}
                      </span>
                      <span className="font-mono text-slate-400 text-[11px]">
                        {st.accounted}/7 {tr('vistas', 'seen')} • <b className={st.remaining === 0 ? 'text-emerald-400' : 'text-white'}>{st.remaining} {tr('afuera', 'live')}</b>
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                      <div
                        className="bg-amber-400 h-full"
                        style={{ width: `${(st.inHand / 7) * 100}%` }}
                        title={`${st.inHand} ${tr('en tu mano', 'in your hand')}`}
                      />
                      <div
                        className="bg-emerald-500 h-full"
                        style={{ width: `${(st.onBoard / 7) * 100}%` }}
                        title={`${st.onBoard} ${tr('en la mesa', 'on the board')}`}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-1 mt-2 text-[11px]">
                      <span className="text-slate-400">
                        {tr('Doble', 'Double')} [{st.suit}:{st.suit}]:{' '}
                        {st.doubleState === 'unplayed' ? (
                          <b className="text-amber-400">{tr('¡VIVO afuera!', 'LIVE unseen!')}</b>
                        ) : st.doubleState === 'in_hand' ? (
                          <b className="text-amber-300">{tr('En tu mano', 'In hand')}</b>
                        ) : (
                          <b className="text-emerald-400">{tr('Ya salió', 'Played')}</b>
                        )}
                      </span>

                      {isMonopoly ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {tr('¡Muerto afuera (Tuyo)!', 'Dead outside (Yours)!')}
                        </span>
                      ) : st.remaining === 0 ? (
                        <span className="text-red-400 font-bold flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" />
                          {tr('¡Número muerto (7/7)!', 'Dead suit (7/7)!')}
                        </span>
                      ) : st.remaining === 1 ? (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" />
                          {tr('¡Casi muerto (1 viva)!', 'Nearly dead (1 live)!')}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Tactical Deductions Box */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                {tr('Conclusiones Tácticas en Vivo:', 'Live Tactical Deductions:')}
              </span>
              {totalInHand === 0 && totalOnBoard === 0 ? (
                <p className="text-[11px] leading-relaxed text-slate-400">
                  {lang === 'en' ? (
                    <>
                      Mark your tiles (Yellow) and board plays (Green), or click <b>“Load Practical Example”</b> above to see winning patterns detected by the matrix.
                    </>
                  ) : (
                    <>
                      Marca tus fichas (Amarillo) y las de la mesa (Verde), o presiona <b>«Cargar Ejemplo Práctico»</b> arriba para ver qué jugadas ganadoras detecta la matriz.
                    </>
                  )}
                </p>
              ) : (
                <ul className="text-[11px] space-y-1.5 text-slate-300 leading-relaxed">
                  {monopolySuits.map((s) => (
                    <li key={`m-${s.suit}`} className="text-emerald-300">
                      {lang === 'en' ? (
                        <>
                          • <b>Suit {s.suit} dead for everyone else:</b> You hold the last {s.inHand} tile(s) of {s.suit} with <b>0</b> outside. Squaring to {s.suit} forces passes or wins a lock.
                        </>
                      ) : (
                        <>
                          • <b>Número {s.suit} muerto para los demás:</b> Tienes las últimas {s.inHand} ficha(s) de {s.suit} y afuera quedan <b>0</b>. Si cuadras a {s.suit}, das pase redondo o trancas ganando.
                        </>
                      )}
                    </li>
                  ))}
                  {drySuits.map((s) => (
                    <li key={`d-${s.suit}`} className="text-rose-300">
                      {lang === 'en' ? (
                        <>
                          • <b>Dead Suit {s.suit} (7/7):</b> All 7 tiles of {s.suit} are out. Closing both ends to {s.suit} locks the board immediately.
                        </>
                      ) : (
                        <>
                          • <b>Número {s.suit} Muerto (7/7):</b> Ya salieron las 7 fichas del {s.suit}. Si cierras ambas puntas a {s.suit}, la mano se tranca de inmediato.
                        </>
                      )}
                    </li>
                  ))}
                  {trappedDoubles.map((s) => (
                    <li key={`t-${s.suit}`} className="text-amber-300">
                      {lang === 'en' ? (
                        <>
                          • <b>Trapped Double Alert [{s.suit}:{s.suit}]:</b> Only {s.remaining} tile(s) of suit {s.suit} remain unseen and the double hasn’t played. You can strand it!
                        </>
                      ) : (
                        <>
                          • <b>¡Alerta de Doble [{s.suit}:{s.suit}] Acorralado!:</b> Solo queda(n) {s.remaining} ficha(s) del número {s.suit} afuera y el doble no ha salido. ¡Puedes ahorcar ese doble!
                        </>
                      )}
                    </li>
                  ))}
                  {monopolySuits.length === 0 && drySuits.length === 0 && trappedDoubles.length === 0 && (
                    <li className="text-slate-400">
                      • {tr(
                        'Sigue marcando las fichas jugadas en mesa para detectar números muertos, monopolios o dobles rivales acorralados.',
                        'Keep marking played board tiles to detect dead suits, monopolies, or trapped opponent doubles.'
                      )}
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
