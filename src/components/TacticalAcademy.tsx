import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { SCENARIOS } from '../data/scenarios';
import { DominoTile } from './DominoTile';
import { Tile, ScenarioBoardTile } from '../types/domino';
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight, RotateCcw, Award, Lightbulb, BookOpen, AlertTriangle, Eye, Hash } from 'lucide-react';

const ARM_ROW = 5;
const TILE_LONG = 56;
const TILE_SHORT = 32;

const flip = ([a, b]: Tile): Tile => [b, a];

interface Placed {
  tile: Tile;
  playedBy: number;
  playOrder?: number;
  left: number;
  top: number;
  vertical: boolean;
}

const PLAYER_BADGES: Record<number, { tag: string; name: string; color: string }> = {
  0: { tag: 'TÚ', name: 'Tú', color: 'bg-emerald-500 text-slate-950' },
  1: { tag: 'RD', name: 'Rival Derecha', color: 'bg-rose-500 text-white' },
  2: { tag: 'COM', name: 'Compañero', color: 'bg-cyan-400 text-slate-950' },
  3: { tag: 'RI', name: 'Rival Izquierda', color: 'bg-orange-500 text-white' },
};

const layoutArm = (outward: ScenarioBoardTile[]): Placed[] => {
  const placed: Placed[] = [];
  let dir = 1;
  let x = 0;
  let y = 0;
  let count = 0;
  let lastDouble = false;

  outward.forEach(({ tile, playedBy, playOrder }) => {
    const isDouble = tile[0] === tile[1];
    if (count < ARM_ROW) {
      const w = isDouble ? TILE_SHORT : TILE_LONG;
      const h = isDouble ? TILE_LONG : TILE_SHORT;
      placed.push({
        tile: dir > 0 ? tile : flip(tile),
        playedBy,
        playOrder,
        left: dir > 0 ? x : x - w,
        top: y - h / 2,
        vertical: isDouble,
      });
      x += dir * w;
      lastDouble = isDouble;
      count++;
    } else {
      const cornerLeft = dir > 0 ? x - TILE_SHORT : x;
      const cornerTop = y + (lastDouble ? TILE_LONG / 2 : TILE_SHORT / 2);
      placed.push({ tile, playedBy, playOrder, left: cornerLeft, top: cornerTop, vertical: true });
      y = cornerTop + TILE_LONG * 0.75;
      dir = -dir;
      x = dir > 0 ? cornerLeft + TILE_SHORT : cornerLeft;
      count = 1;
      lastDouble = false;
    }
  });
  return placed;
};

const mirrorArm = (arm: Placed[]): Placed[] =>
  arm.map((p) => {
    const w = p.vertical ? TILE_SHORT : TILE_LONG;
    return { ...p, left: -(p.left + w), tile: p.vertical ? p.tile : flip(p.tile) };
  });

export const TacticalAcademy: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [solvedScenarios, setSolvedScenarios] = useState<string[]>([]);
  const [showPlayerBadges, setShowPlayerBadges] = useState(true);
  const [showPlayOrder, setShowPlayOrder] = useState(true);
  const [viewportW, setViewportW] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const onResize = () => setViewportW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const scenario = SCENARIOS[currentIdx];
  const selectedOption = scenario.options.find((opt) => opt.id === selectedOptionId);

  const handleSelectOption = (optId: string, tile: Tile) => {
    setSelectedOptionId(optId);
    setSelectedTile(tile);

    const chosen = scenario.options.find((o) => o.id === optId);
    if (chosen?.isCorrect) {
      if (!solvedScenarios.includes(scenario.id)) {
        setSolvedScenarios((prev) => [...prev, scenario.id]);
      }
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const handleNext = () => {
    if (currentIdx < SCENARIOS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOptionId(null);
      setSelectedTile(null);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
      setSelectedOptionId(null);
      setSelectedTile(null);
    }
  };

  const handleResetCurrent = () => {
    setSelectedOptionId(null);
    setSelectedTile(null);
  };

  return (
    <div className="space-y-6">
      {/* Progress & Chapter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg">
        <div>
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-amber-400">
            {scenario.chapter}
          </span>
          <h2 className="text-base sm:text-xl font-bold text-white flex flex-wrap items-center gap-2 mt-0.5">
            <span>{scenario.title}</span>
            <span
              className={`text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full font-medium ${
                scenario.difficulty === 'Principiante'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                  : scenario.difficulty === 'Intermedio'
                  ? 'bg-blue-950 text-blue-400 border border-blue-800/60'
                  : 'bg-purple-950 text-purple-400 border border-purple-800/60'
              }`}
            >
              {scenario.difficulty}
            </span>
          </h2>
        </div>

        {/* Counter & Nav Controls */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
          <div className="flex items-center gap-1 order-2 sm:order-1">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 transition flex items-center justify-center active:scale-95"
              title="Escenario Anterior"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-slate-300 px-2">
              {currentIdx + 1}/{SCENARIOS.length}
            </span>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentIdx === SCENARIOS.length - 1}
              className="w-8 h-8 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center shadow active:scale-95"
              title="Siguiente Escenario"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-left sm:text-right order-1 sm:order-2">
            <div className="text-[11px] sm:text-xs text-slate-400">Progreso</div>
            <div className="text-xs sm:text-sm font-bold text-amber-400">
              {solvedScenarios.length}/{SCENARIOS.length} resueltos
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 order-3">
            {SCENARIOS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentIdx(idx);
                  setSelectedOptionId(null);
                  setSelectedTile(null);
                }}
                className={`w-3.5 h-3.5 sm:w-3 sm:h-3 rounded-full transition-all ${
                  idx === currentIdx
                    ? 'ring-2 ring-amber-400 bg-amber-400 scale-125'
                    : solvedScenarios.includes(s.id)
                    ? 'bg-emerald-500'
                    : 'bg-slate-700'
                }`}
                title={s.title}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Table & Situation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column: Virtual Domino Board Context */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="felt-texture p-3 sm:p-6 rounded-2xl border-4 border-[#2d2217] shadow-2xl relative min-h-[300px] sm:min-h-[340px] flex flex-col justify-between">
            {/* Table Corners & Center Details */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-300 font-mono px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-950/80 border border-emerald-500/20 backdrop-blur-sm">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                Punta Izq: <b className="text-amber-400 font-bold">{scenario.context.boardEnds[0] === 0 && scenario.context.boardEnds[1] === 0 ? '—' : scenario.context.boardEnds[0]}</b>
              </span>
              <span>
                Salidor: <b className="text-amber-300 font-bold">{scenario.context.salidaBy}</b>
                {scenario.context.boardTiles && scenario.context.boardTiles.length > 0 && (
                  <span className="text-slate-400 ml-1">• Fichas: <b className="text-white">{scenario.context.boardTiles.length}</b></span>
                )}
              </span>
              <span className="flex items-center gap-1">
                Punta Der: <b className="text-amber-400 font-bold">{scenario.context.boardEnds[0] === 0 && scenario.context.boardEnds[1] === 0 ? '—' : scenario.context.boardEnds[1]}</b>
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse" />
              </span>
            </div>

            {/* Toggle Badges and Order controls in table */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-2 px-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPlayerBadges(!showPlayerBadges)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg flex items-center gap-1 border transition ${
                    showPlayerBadges ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-slate-900/80 text-slate-400 border-slate-800'
                  }`}
                  title="Mostrar autor en cada ficha"
                >
                  <Eye className="w-3 h-3" />
                  {showPlayerBadges ? 'Autor: ON' : 'Autor: OFF'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPlayOrder(!showPlayOrder)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg flex items-center gap-1 border transition ${
                    showPlayOrder ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-slate-900/80 text-slate-400 border-slate-800'
                  }`}
                  title="Mostrar orden de jugada (#1, #2...)"
                >
                  <Hash className="w-3 h-3" />
                  {showPlayOrder ? 'Orden: ON' : 'Orden: OFF'}
                </button>
              </div>

              {(showPlayerBadges || showPlayOrder) && (
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-300 bg-slate-950/70 px-2.5 py-1 rounded-lg border border-slate-800">
                  {showPlayerBadges &&
                    [0, 2, 1, 3].map((pIdx) => (
                      <span key={pIdx} className="flex items-center gap-1">
                        <span className={`px-1 py-0.2 rounded font-extrabold text-[8px] ${PLAYER_BADGES[pIdx].color}`}>
                          {PLAYER_BADGES[pIdx].tag}
                        </span>
                        <span>{PLAYER_BADGES[pIdx].name}</span>
                      </span>
                    ))}
                  {showPlayOrder && (
                    <span className="flex items-center gap-1 text-amber-300 ml-1">
                      <span className="px-1 py-0.2 rounded-full font-mono font-bold text-[8px] bg-slate-950 border border-amber-400/80 text-amber-300">
                        #1
                      </span>
                      <span>Salida</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Realistic Board Chain or Clean Table */}
            <div className="my-auto py-3 min-h-[140px] flex flex-col items-center justify-center">
              {(!scenario.context.boardTiles || scenario.context.boardTiles.length === 0) ? (
                <div className="text-center py-6 px-4 bg-slate-950/60 rounded-xl border border-emerald-500/20 space-y-1.5 backdrop-blur-sm">
                  <div className="text-sm font-bold text-emerald-300">
                    Mesa de Juego Limpia (Inicio de Partida)
                  </div>
                  <p className="text-xs text-slate-300">
                    No hay fichas jugadas aún en la mesa. Tienes la salida de la mano.
                  </p>
                </div>
              ) : (
                (() => {
                  const tiles = scenario.context.boardTiles;
                  const centerIdx = scenario.context.centerIdx ?? 0;
                  const centerItem = tiles[centerIdx];
                  const centerTile = centerItem.tile;
                  const centerVertical = centerTile[0] === centerTile[1];
                  const centerW = centerVertical ? TILE_SHORT : TILE_LONG;
                  const centerH = centerVertical ? TILE_LONG : TILE_SHORT;
                  const rightOut = tiles.slice(centerIdx + 1);
                  const leftOut = tiles
                    .slice(0, centerIdx)
                    .reverse()
                    .map((item) => ({ tile: flip(item.tile), playedBy: item.playedBy, playOrder: item.playOrder }));

                  const shift = (arm: Placed[], dx: number): Placed[] =>
                    arm.map((p) => ({ ...p, left: p.left + dx }));

                  const all: Placed[] = [
                    {
                      tile: centerTile,
                      playedBy: centerItem.playedBy,
                      playOrder: centerItem.playOrder,
                      left: -centerW / 2,
                      top: -centerH / 2,
                      vertical: centerVertical,
                    },
                    ...shift(layoutArm(rightOut), centerW / 2),
                    ...shift(mirrorArm(layoutArm(leftOut)), -centerW / 2),
                  ];

                  const minX = Math.min(...all.map((p) => p.left));
                  const maxX = Math.max(...all.map((p) => p.left + (p.vertical ? TILE_SHORT : TILE_LONG)));
                  const minY = Math.min(...all.map((p) => p.top));
                  const maxY = Math.max(...all.map((p) => p.top + (p.vertical ? TILE_LONG : TILE_SHORT)));

                  const rawW = maxX - minX + 16;
                  const rawH = maxY - minY + 16;
                  const availW = viewportW < 640 ? viewportW - 56 : rawW;
                  const scale = rawW > availW ? Math.max(0.5, availW / rawW) : 1;

                  return (
                    <div className="w-full overflow-x-auto py-2 flex justify-center">
                      <div
                        className="relative"
                        style={{ width: rawW * scale, height: rawH * scale }}
                      >
                        <div
                          className="relative origin-top-left"
                          style={{
                            width: rawW,
                            height: rawH,
                            transform: scale < 1 ? `scale(${scale})` : undefined,
                          }}
                        >
                          {all.map((p, i) => {
                            const badgeInfo = PLAYER_BADGES[p.playedBy] || PLAYER_BADGES[0];
                            return (
                              <div
                                key={i}
                                className="absolute"
                                style={{ left: p.left - minX + 8, top: p.top - minY + 8 }}
                              >
                                <DominoTile
                                  top={p.tile[0]}
                                  bottom={p.tile[1]}
                                  size="sm"
                                  orientation={p.vertical ? 'vertical' : 'horizontal'}
                                  className={i === 0 ? 'ring-2 ring-amber-400/80' : ''}
                                  badge={showPlayerBadges ? badgeInfo.tag : undefined}
                                  badgeColor={badgeInfo.color}
                                  orderBadge={showPlayOrder ? p.playOrder : undefined}
                                  disabled
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}

              {scenario.context.knownPasses.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-3">
                  {scenario.context.knownPasses.map((p, i) => (
                    <span
                      key={i}
                      className="text-[11px] sm:text-xs bg-red-950/80 text-red-300 border border-red-700/60 px-2 sm:px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>{p.player} <b>PASÓ</b> al número {p.suit}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* My Hand Display */}
            <div className="bg-slate-950/80 border border-slate-700/80 p-2.5 sm:p-4 rounded-xl backdrop-blur-md">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] sm:text-xs uppercase font-bold tracking-wider text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span>Tus Fichas en Mano</span>
                </span>
                <span className="text-[11px] sm:text-xs text-slate-400 font-mono shrink-0">
                  {scenario.context.myHand.length} fichas
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 pt-1">
                {scenario.context.myHand.map(([top, bottom], idx) => {
                  const matchingOptions = scenario.options.filter(
                    (o) => (o.tile[0] === top && o.tile[1] === bottom) || (o.tile[0] === bottom && o.tile[1] === top)
                  );
                  const isSelected = selectedTile && (
                    (selectedTile[0] === top && selectedTile[1] === bottom) ||
                    (selectedTile[0] === bottom && selectedTile[1] === top)
                  );

                  return (
                    <DominoTile
                      key={idx}
                      top={top}
                      bottom={bottom}
                      size="md"
                      selected={!!isSelected}
                      highlighted={matchingOptions.length > 0 && !selectedOptionId}
                      onClick={() => {
                        if (matchingOptions.length === 1) {
                          handleSelectOption(matchingOptions[0].id, [top, bottom]);
                        } else if (matchingOptions.length > 1) {
                          setSelectedTile([top, bottom]);
                        }
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Notes & Context Badges */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              Lectura y Observaciones de la Mesa
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {scenario.context.notes.map((note, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Tactical Question & Feedback */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Situation Text */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Situación en Mesa
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentIdx === 0}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 transition flex items-center gap-1"
                    title="Escenario Anterior"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Anterior
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={currentIdx === SCENARIOS.length - 1}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1 shadow"
                    title="Siguiente Escenario"
                  >
                    Siguiente
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-200 mt-1.5 leading-relaxed">
                {scenario.situation}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-500/30">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                Pregunta del Maestro:
              </span>
              <p className="text-sm font-semibold text-white">
                {scenario.question}
              </p>
            </div>

            {/* Answer Options */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Selecciona tu jugada táctica:
              </span>
              {scenario.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                const isMatchingTile = selectedTile && (
                  (selectedTile[0] === opt.tile[0] && selectedTile[1] === opt.tile[1]) ||
                  (selectedTile[0] === opt.tile[1] && selectedTile[1] === opt.tile[0])
                );

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id, opt.tile)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? opt.isCorrect
                          ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/50 text-emerald-100'
                          : 'bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/50 text-rose-100'
                        : isMatchingTile && !selectedOptionId
                          ? 'bg-slate-800 border-amber-400/80 ring-2 ring-amber-400/30 text-white'
                          : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <DominoTile
                        top={opt.tile[0]}
                        bottom={opt.tile[1]}
                        size="sm"
                        orientation="horizontal"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-300">
                          Jugar [{opt.tile[0]}:{opt.tile[1]}]
                          {opt.targetEnd !== undefined && (
                            <span className="text-amber-400 ml-1.5 font-bold">
                              por la {opt.targetEnd === scenario.context.boardEnds[0] ? 'Punta Izquierda' : 'Punta Derecha'} ({opt.targetEnd})
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {opt.tacticalPrinciple}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div>
                        {opt.isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback & Tactical Tip */}
            {selectedOption && (
              <div
                className={`p-4 rounded-xl border space-y-3 animate-fadeIn ${
                  selectedOption.isCorrect
                    ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-600/60 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {selectedOption.isCorrect ? (
                    <Award className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                  )}
                  <h4 className="font-bold text-sm">
                    {selectedOption.isCorrect ? '¡Decisión Correcta!' : 'Jugada Desacertada'}
                  </h4>
                </div>

                <p className="text-xs leading-relaxed text-slate-200">
                  {selectedOption.explanation}
                </p>

                <div className="pt-2 border-t border-slate-700/50 text-xs italic text-amber-300 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{scenario.tacticalTip}</span>
                </div>
              </div>
            )}

            {/* Action / Retry Button */}
            {selectedOptionId && !selectedOption?.isCorrect && (
              <div className="flex items-center justify-end pt-1">
                <button
                  type="button"
                  onClick={handleResetCurrent}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reintentar esta jugada
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
