import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { DominoTile } from './DominoTile';
import { Tile } from '../types/domino';
import { RotateCcw, Sparkles, User, Users, Settings2, X } from 'lucide-react';
import { playClackSound } from '../utils/sound';
import { CoachOption, evaluateMovesForSeat, getPlayableMoves } from '../engine/coach';
import { useLanguage } from '../i18n/LanguageContext';

// Generate full standard 28 double-six tiles
const generateSet = (): Tile[] => {
  const set: Tile[] = [];
  for (let i = 0; i <= 6; i++) {
    for (let j = i; j <= 6; j++) {
      set.push([i, j]);
    }
  }
  return set;
};

const ARM_ROW = 5; // tiles per row on each side of the center tile (corner tile included)
const TILE_LONG = 72; // board tile long side in px
const TILE_SHORT = 40; // board tile short side in px

const flip = ([a, b]: Tile): Tile => [b, a];

interface BoardItem {
  tile: Tile;
  playedBy: number;
  playOrder: number;
  inner?: number;
  outer?: number;
}

export interface MatchTelemetry {
  scores: [number, number];
  targetScore: 100 | 200;
  handNumber: number;
  roundSeconds: number;
}

interface MatchSimulatorProps {
  onTelemetryChange?: (telemetry: MatchTelemetry) => void;
}

interface Placed {
  tile: Tile; // as displayed (top/left half first)
  playedBy: number;
  playOrder: number;
  left: number;
  top: number;
  vertical: boolean;
}

const PLAYER_BADGES: Record<number, { tag: string; name: string; color: string; dot: string }> = {
  0: { tag: 'TÚ', name: 'Tú', color: 'bg-emerald-500 text-slate-950', dot: 'bg-emerald-500' },
  1: { tag: 'RD', name: 'Rival Derecha', color: 'bg-rose-500 text-white', dot: 'bg-rose-500' },
  2: { tag: 'COM', name: 'Compañero', color: 'bg-cyan-400 text-slate-950', dot: 'bg-cyan-400' },
  3: { tag: 'RI', name: 'Rival Izquierda', color: 'bg-orange-500 text-white', dot: 'bg-orange-500' },
};

/**
 * Lay out one arm with exact pixel positions so tiles touch.
 * Coordinates: x=0 is the arm's start edge at the center tile, y=0 is the center line of row 0.
 * `outward` tiles are oriented chain-side first. Doubles sit crosswise (vertical) in line.
 * When a row is full, a vertical corner tile turns the chain down and it returns the other way.
 */
const layoutArm = (outward: BoardItem[]): Placed[] => {
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
      // Corner: vertical tile directly under the last tile, aligned to the outer edge
      const cornerLeft = dir > 0 ? x - TILE_SHORT : x;
      const cornerTop = y + (lastDouble ? TILE_LONG / 2 : TILE_SHORT / 2);
      placed.push({ tile, playedBy, playOrder, left: cornerLeft, top: cornerTop, vertical: true });
      // Next row's center line sits on the corner's lower half
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

const shuffle = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const MatchSimulator: React.FC<MatchSimulatorProps> = ({ onTelemetryChange }) => {
  const { lang, tr } = useLanguage();
  const playerBadges: Record<number, { tag: string; name: string; color: string; dot: string }> = {
    0: { tag: tr('TÚ', 'YOU'), name: tr('Tú', 'You'), color: PLAYER_BADGES[0].color, dot: PLAYER_BADGES[0].dot },
    1: { tag: tr('RD', 'RR'), name: tr('Rival Derecha', 'Right Rival'), color: PLAYER_BADGES[1].color, dot: PLAYER_BADGES[1].dot },
    2: { tag: tr('COM', 'PTR'), name: tr('Compañero', 'Partner'), color: PLAYER_BADGES[2].color, dot: PLAYER_BADGES[2].dot },
    3: { tag: tr('RI', 'LR'), name: tr('Rival Izquierda', 'Left Rival'), color: PLAYER_BADGES[3].color, dot: PLAYER_BADGES[3].dot },
  };
  const [board, setBoard] = useState<BoardItem[]>([]);
  const [boardEnds, setBoardEnds] = useState<[number, number] | null>(null);
  const [turn, setTurn] = useState<number>(0); // 0: Player (You), 1: Right, 2: Partner (Top), 3: Left
  const [hands, setHands] = useState<Tile[][]>([[], [], [], []]);
  const [passedSuits, setPassedSuits] = useState<number[][]>([[], [], [], []]);
  const [isCoachActive, setIsCoachActive] = useState<boolean>(true);
  const [showPlayerBadges, setShowPlayerBadges] = useState<boolean>(true); // Default ON per user request
  const [showPlayOrder, setShowPlayOrder] = useState<boolean>(true); // Default ON: show #1, #2...
  const [showRulesConfig, setShowRulesConfig] = useState<boolean>(false);

  // Configurable Dominican Rules & Customs
  const [ruleFirstPass25, setRuleFirstPass25] = useState<boolean>(true);
  const [ruleTranqueMode, setRuleTranqueMode] = useState<'individual' | 'parejas'>('individual');
  const [targetScore, setTargetScore] = useState<100 | 200>(200);
  const [ruleCapicuaBonus, setRuleCapicuaBonus] = useState<number>(25); // 0 (off), 25, 50 pts
  const [ruleTriplePaso25, setRuleTriplePaso25] = useState<boolean>(true);
  const [ruleZapatoAlert, setRuleZapatoAlert] = useState<boolean>(true);
  const [ruleTrancaCastigada, setRuleTrancaCastigada] = useState<boolean>(false);
  const [ruleTranqueEmpateMode, setRuleTranqueEmpateMode] = useState<'cerrador' | 'manobrava'>('cerrador');
  const [ruleFirstHandSalida, setRuleFirstHandSalida] = useState<'66' | '00'>('66');
  const [ruleNoWinByBonus, setRuleNoWinByBonus] = useState<boolean>(true); // 25+ bonus points cannot win the match (75+ in 100, 175+ in 200)

  // Active game counters for Dominican customs
  const [accumulatedTiePoints, setAccumulatedTiePoints] = useState<number>(0); // Points from Mano Brava
  const [consecutivePasses, setConsecutivePasses] = useState<number>(0); // Counter for Triple Paso

  const [coachAdvice, setCoachAdvice] = useState<string>('');
  const [coachOptions, setCoachOptions] = useState<CoachOption[]>([]);
  const [gameOver, setGameOver] = useState<string | null>(null);
  const [lastWinnerIndex, setLastWinnerIndex] = useState<number | null>(null);
  const [bonusBanner, setBonusBanner] = useState<string | null>(null);
  const [firstPassChecked, setFirstPassChecked] = useState<boolean>(false);
  const [lastPlayerWhoPlayed, setLastPlayerWhoPlayed] = useState<number>(0);
  const [gameScores, setGameScores] = useState<[number, number]>([0, 0]); // [Team Us (0&2), Team Them (1&3)]
  const [handNumber, setHandNumber] = useState<number>(1);
  const [roundSeconds, setRoundSeconds] = useState<number>(0);
  const [salidorIndex, setSalidorIndex] = useState<number>(0);
  const [centerIdx, setCenterIdx] = useState<number>(0); // index of the first tile inside board[]
  const [pendingTile, setPendingTile] = useState<Tile | null>(null); // tile fits both ends: ask user
  const [viewportW, setViewportW] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const onResize = () => setViewportW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (gameOver) return;
    const interval = window.setInterval(() => {
      setRoundSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [gameOver, handNumber]);

  useEffect(() => {
    onTelemetryChange?.({
      scores: gameScores,
      targetScore,
      handNumber,
      roundSeconds,
    });
  }, [gameScores, targetScore, handNumber, roundSeconds, onTelemetryChange]);

  const isZapatoUs = gameScores[0] >= targetScore && gameScores[1] === 0;
  const isZapatoThem = gameScores[1] >= targetScore && gameScores[0] === 0;

  const matchWinner =
    gameScores[0] >= targetScore
      ? isZapatoUs && ruleZapatoAlert
        ? tr(
            `¡ZAPATO COMPLETO / PELA DE CHIVO! Tu Pareja (Nosotros) blanqueó la partida ${gameScores[0]} a 0.`,
            `FULL SHUTOUT (ZAPATO)! Your Pair (Us) shut out the match ${gameScores[0]} to 0.`
          )
        : tr(
            '¡Tu Pareja (Nosotros) ganó la partida completa!',
            'Your Pair (Us) won the full match!'
          )
      : gameScores[1] >= targetScore
      ? isZapatoThem && ruleZapatoAlert
        ? tr(
            `¡ZAPATO COMPLETO / PELA DE CHIVO! La Pareja Rival (Ellos) blanqueó la partida ${gameScores[1]} a 0.`,
            `FULL SHUTOUT (ZAPATO)! Opponents (Them) shut out the match ${gameScores[1]} to 0.`
          )
        : tr(
            'La Pareja Rival (Ellos) ganó la partida completa.',
            'Opponents (Them) won the full match.'
          )
      : null;

  // Start new round
  const startNewRound = (nextHandNum?: number) => {
    const targetHandNum = typeof nextHandNum === 'number' ? nextHandNum : handNumber + 1;
    setHandNumber(targetHandNum);

    const tiles = shuffle(generateSet());
    const h0 = tiles.slice(0, 7);
    const h1 = tiles.slice(7, 14);
    const h2 = tiles.slice(14, 21);
    const h3 = tiles.slice(21, 28);

    // Regla Dominicana de Salida:
    // Mano #1 del partido (0-0): Sale obligatoriamente quien tenga el [6:6] (o [0:0] si está activa La Chiva).
    // Mano #2 en adelante: Siempre sale de primero el último jugador que ganó la mano anterior.
    let starter = 0;
    if (targetHandNum === 1) {
      const targetDouble = ruleFirstHandSalida === '00' ? 0 : 6;
      [h0, h1, h2, h3].forEach((hand, playerIdx) => {
        hand.forEach(([a, b]) => {
          if (a === targetDouble && b === targetDouble) {
            starter = playerIdx;
          }
        });
      });
    } else {
      starter = lastWinnerIndex !== null ? lastWinnerIndex : (salidorIndex + 1) % 4;
    }

    setHands([h0, h1, h2, h3]);
    setBoard([]);
    setCenterIdx(0);
    setBoardEnds(null);
    setPassedSuits([[], [], [], []]);
    setGameOver(null);
    setBonusBanner(null);
    setFirstPassChecked(false);
    setConsecutivePasses(0);
    setLastPlayerWhoPlayed(starter);
    setPendingTile(null);
    setRoundSeconds(0);
    setSalidorIndex(starter);
    setTurn(starter);
  };

  const resetFullMatch = () => {
    setGameScores([0, 0]);
    setLastWinnerIndex(null);
    setAccumulatedTiePoints(0);
    setConsecutivePasses(0);
    startNewRound(1);
  };

  useEffect(() => {
    startNewRound(1);
  }, []);

  // Player Names
  const playerNames = [
    tr('Tú', 'You'),
    tr('Rival Derecha', 'Right Rival'),
    tr('Compañero', 'Partner'),
    tr('Rival Izquierda', 'Left Rival'),
  ];

  // Generate coach advice via shared Dominican heuristic engine
  useEffect(() => {
    if (turn !== 0 || gameOver) {
      return;
    }

    const salidaValues = board[centerIdx]?.tile ? [...board[centerIdx].tile] : [];
    const evaluation = evaluateMovesForSeat({
      seatIdx: 0,
      hands,
      boardEnds,
      passedSuits,
      handNumber,
      ruleFirstHandSalida,
      salidorIndex,
      boardLength: board.length,
      salidaValues,
      lang,
    });

    setCoachOptions(evaluation.options);
    setCoachAdvice(evaluation.advice);
  }, [turn, boardEnds, hands, gameOver, passedSuits, handNumber, ruleFirstHandSalida, salidorIndex, board, centerIdx, lang]);

  // Execute a play with explicit open-end seam validation and Web Audio feedback
  const makePlay = (playerIdx: number, tile: Tile, targetEnd: 'left' | 'right') => {
    if (boardEnds) {
      const innerCheck = targetEnd === 'left' ? boardEnds[0] : boardEnds[1];
      if (tile[0] !== innerCheck && tile[1] !== innerCheck) {
        return;
      }
    }

    const prevEnds = boardEnds;
    setConsecutivePasses(0);
    playClackSound();

    // Remove tile from player hand
    const newHands = [...hands];
    newHands[playerIdx] = newHands[playerIdx].filter(
      (t) => !(t[0] === tile[0] && t[1] === tile[1]) && !(t[0] === tile[1] && t[1] === tile[0])
    );
    setHands(newHands);
    setLastPlayerWhoPlayed(playerIdx);

    // If this is the second tile placed on the board, the first-pass window is over
    if (board.length >= 1 && !firstPassChecked) {
      setFirstPassChecked(true);
    }

    // Update board with explicit inner/outer seam orientation
    let updatedEnds: [number, number];
    const nextOrder = board.length + 1;
    if (!boardEnds) {
      updatedEnds = [tile[0], tile[1]];
      setBoard([{ tile, playedBy: playerIdx, playOrder: 1, inner: tile[0], outer: tile[1] }]);
      setCenterIdx(0);
    } else if (targetEnd === 'left') {
      const inner = boardEnds[0];
      const outer = tile[0] === inner ? tile[1] : tile[0];
      updatedEnds = [outer, boardEnds[1]];
      // Orient so the matching half touches the chain (right half faces the chain)
      setBoard([
        { tile: [outer, inner], playedBy: playerIdx, playOrder: nextOrder, inner, outer },
        ...board,
      ]);
      setCenterIdx((c) => c + 1);
    } else {
      const inner = boardEnds[1];
      const outer = tile[0] === inner ? tile[1] : tile[0];
      updatedEnds = [boardEnds[0], outer];
      // Left half faces the chain
      setBoard([
        ...board,
        { tile: [inner, outer], playedBy: playerIdx, playOrder: nextOrder, inner, outer },
      ]);
    }
    setBoardEnds(updatedEnds);
    setPendingTile(null);

    // Check Win (Pegada / Dominó): Winner's team sums all remaining points from all 4 players
    if (newHands[playerIdx].length === 0) {
      const winnerName = playerNames[playerIdx];
      const isOurTeam = playerIdx === 0 || playerIdx === 2;
      setLastWinnerIndex(playerIdx);

      // Check Capicúa (winning with non-double whose two halves match the two open ends, squaring the board)
      let capicuaBonus = 0;
      let isCapicua = false;
      if (prevEnds && tile[0] !== tile[1]) {
        const matchesBothEnds =
          (tile[0] === prevEnds[0] && tile[1] === prevEnds[1]) ||
          (tile[0] === prevEnds[1] && tile[1] === prevEnds[0]);
        if (matchesBothEnds) {
          isCapicua = true;
          capicuaBonus = ruleCapicuaBonus;
        }
      }

      const totalRemainingPts = newHands.reduce(
        (sum, h) => sum + h.reduce((s, [a, b]) => s + a + b, 0),
        0
      );
      const basePts = totalRemainingPts;
      const tiePts = accumulatedTiePoints;
      if (tiePts > 0) setAccumulatedTiePoints(0);

      const currentTeamScore = isOurTeam ? gameScores[0] : gameScores[1];
      let capicuaBlockedByLimit = false;
      if (
        isCapicua &&
        capicuaBonus > 0 &&
        ruleNoWinByBonus &&
        (currentTeamScore >= targetScore - capicuaBonus ||
          currentTeamScore + basePts + tiePts + capicuaBonus >= targetScore)
      ) {
        capicuaBonus = 0;
        capicuaBlockedByLimit = true;
      }

      const ptsAwarded = basePts + capicuaBonus + tiePts;

      const extras: string[] = [];
      if (isCapicua && capicuaBonus > 0) extras.push(`¡CAPICÚA! (+${capicuaBonus} pts)`);
      if (capicuaBlockedByLimit) {
        extras.push(
          tr(
            `Capicúa sin bono (+0 pts extras: con ${currentTeamScore} pts o en tiro de meta no aplica para ganar)`,
            `Capicúa without bonus (+0 extra pts: at ${currentTeamScore} pts or match-winning play, bonuses do not apply)`
          )
        );
      }
      if (tiePts > 0) {
        extras.push(
          tr(`+${tiePts} pts de Mano Brava acumulados`, `+${tiePts} carried Mano Brava pts`)
        );
      }
      const extraTag = extras.length > 0 ? ` [${extras.join(' • ')}]` : '';

      setGameOver(
        tr(
          `¡DOMINÓ! ${winnerName} se pegó y ganó la mano (+${ptsAwarded} pts para ${isOurTeam ? 'Nosotros' : 'Ellos'})${extraTag}.`,
          `DOMINO! ${winnerName} went out and won the hand (+${ptsAwarded} pts for ${isOurTeam ? 'Us' : 'Them'})${extraTag}.`
        )
      );
      if (isOurTeam) {
        confetti({ particleCount: isCapicua ? 160 : 100, spread: 80, origin: { y: 0.6 } });
        setGameScores((prev) => [prev[0] + ptsAwarded, prev[1]]);
      } else {
        setGameScores((prev) => [prev[0], prev[1] + ptsAwarded]);
      }
      return;
    }

    // Advance turn (use the freshly computed ends, not stale state)
    checkNextTurn((playerIdx + 1) % 4, newHands, updatedEnds, playerIdx);
  };

  // Pass logic
  const handlePass = (playerIdx: number) => {
    if (boardEnds) {
      setPassedSuits((prev) =>
        prev.map((list, i) =>
          i === playerIdx ? Array.from(new Set([...list, boardEnds[0], boardEnds[1]])) : list
        )
      );
    }

    // Dominican Rule: If the player immediately following the salidor passes on the first turn, +25 pts to salidor's team!
    if (
      ruleFirstPass25 &&
      board.length === 1 &&
      !firstPassChecked &&
      playerIdx === (salidorIndex + 1) % 4
    ) {
      setFirstPassChecked(true);
      const salidorIsOurTeam = salidorIndex === 0 || salidorIndex === 2;
      const currentTeamScore = salidorIsOurTeam ? gameScores[0] : gameScores[1];
      const teamLabel = salidorIsOurTeam ? tr('Nosotros', 'Us') : tr('Ellos', 'Them');

      if (ruleNoWinByBonus && currentTeamScore >= targetScore - 25) {
        setBonusBanner(
          tr(
            `⚠️ Paso en la salida de ${playerNames[playerIdx]}: No se suman los +25 pts extras porque ${teamLabel} tiene ${currentTeamScore} pts (con ${targetScore - 25}+ pts no aplican bonos para ganar el partido). Continúa el juego normal.`,
            `⚠️ First-pass on ${playerNames[playerIdx]}: No +25 bonus added since ${teamLabel} has ${currentTeamScore} pts (at ${targetScore - 25}+ pts bonuses cannot apply). Play continues normally.`
          )
        );
      } else if (salidorIsOurTeam) {
        setGameScores((prev) => [prev[0] + 25, prev[1]]);
        setBonusBanner(
          tr(
            `⚡ ¡Paso en la salida! ${playerNames[playerIdx]} no pudo responder a la salida de ${playerNames[salidorIndex]}: +25 pts para Nosotros.`,
            `⚡ Lead Pass (+25)! ${playerNames[playerIdx]} passed on ${playerNames[salidorIndex]}'s opening lead: +25 pts for Us.`
          )
        );
      } else {
        setGameScores((prev) => [prev[0], prev[1] + 25]);
        setBonusBanner(
          tr(
            `⚡ ¡Paso en la salida! ${playerNames[playerIdx]} no pudo responder a la salida de ${playerNames[salidorIndex]}: +25 pts para Ellos.`,
            `⚡ Lead Pass (+25)! ${playerNames[playerIdx]} passed on ${playerNames[salidorIndex]}'s opening lead: +25 pts for Them.`
          )
        );
      }
    }

    // Dominican Rule: Pase Corrido / Triple Paso (+25 pts)
    const nextConsecutivePasses = consecutivePasses + 1;
    setConsecutivePasses(nextConsecutivePasses);
    if (ruleTriplePaso25 && nextConsecutivePasses === 3 && board.length > 1) {
      const isOurTeam = lastPlayerWhoPlayed === 0 || lastPlayerWhoPlayed === 2;
      const currentTeamScore = isOurTeam ? gameScores[0] : gameScores[1];
      const teamLabel = isOurTeam ? tr('Nosotros', 'Us') : tr('Ellos', 'Them');

      if (ruleNoWinByBonus && currentTeamScore >= targetScore - 25) {
        setBonusBanner(
          tr(
            `⚠️ ¡Pase Corrido (Triple Paso)! No se suman los +25 pts extras porque ${teamLabel} tiene ${currentTeamScore} pts (con ${targetScore - 25}+ pts no aplican bonos para ganar el partido). Continúa el juego normal.`,
            `⚠️ Triple Pass! No +25 bonus added since ${teamLabel} has ${currentTeamScore} pts (at ${targetScore - 25}+ pts bonuses do not apply). Play continues normally.`
          )
        );
      } else if (isOurTeam) {
        setGameScores((prev) => [prev[0] + 25, prev[1]]);
        setBonusBanner(
          tr(
            `⚡ ¡Pase Corrido (Triple Paso)! Los 3 jugadores pasaron consecutivamente. Vuelta limpia a ${playerNames[lastPlayerWhoPlayed]}: +25 pts para Nosotros.`,
            `⚡ Triple Pass! All 3 opponents passed consecutively back to ${playerNames[lastPlayerWhoPlayed]}: +25 pts for Us.`
          )
        );
      } else {
        setGameScores((prev) => [prev[0], prev[1] + 25]);
        setBonusBanner(
          tr(
            `⚡ ¡Pase Corrido (Triple Paso)! Los 3 jugadores pasaron consecutivamente. Vuelta limpia a ${playerNames[lastPlayerWhoPlayed]}: +25 pts para Ellos.`,
            `⚡ Triple Pass! All 3 opponents passed consecutively back to ${playerNames[lastPlayerWhoPlayed]}: +25 pts for Them.`
          )
        );
      }
    }

    checkNextTurn((playerIdx + 1) % 4, hands, boardEnds, lastPlayerWhoPlayed);
  };

  // Check next turn and detect Tranque (Block)
  const checkNextTurn = (
    nextPlayer: number,
    currentHands: Tile[][],
    ends: [number, number] | null,
    closerIdx: number
  ) => {
    // Check if all players are blocked (Tranque)
    let anyPlayerCanPlay = false;
    for (let i = 0; i < 4; i++) {
      if (getPlayableMoves(currentHands[i], ends, handNumber, ruleFirstHandSalida).length > 0) {
        anyPlayerCanPlay = true;
        break;
      }
    }

    if (!anyPlayerCanPlay && ends) {
      // Game Trancado
      const handPts = currentHands.map((h) => h.reduce((s, [a, b]) => s + a + b, 0));
      const allFourPoints = handPts[0] + handPts[1] + handPts[2] + handPts[3];
      const tiePts = accumulatedTiePoints;

      if (ruleTranqueMode === 'individual') {
        // Dominican Default: Compare ONLY the player who locked (closerIdx) vs the next player in turn (following opponent)
        const nextOpponentIdx = (closerIdx + 1) % 4;
        const closerPts = handPts[closerIdx];
        const opponentPts = handPts[nextOpponentIdx];

        const closerIsOurTeam = closerIdx === 0 || closerIdx === 2;

        if (closerPts < opponentPts) {
          const winnerTeamLabel = closerIsOurTeam ? tr('Nosotros', 'Us') : tr('Ellos', 'Them');
          setLastWinnerIndex(closerIdx);
          if (tiePts > 0) setAccumulatedTiePoints(0);
          const totalPts = allFourPoints + tiePts;
          const tieMsg = tiePts > 0 ? tr(` (+${tiePts} pts acumulados de Mano Brava)`, ` (+${tiePts} carried Mano Brava pts)`) : '';
          setGameOver(
            tr(
              `¡TRANQUE DOMINICANO! Cerró ${playerNames[closerIdx]} (${closerPts} pts) vs ${playerNames[nextOpponentIdx]} (${opponentPts} pts). Ganó ${winnerTeamLabel} y suma +${totalPts} pts (total de los 4 jugadores${tieMsg}).`,
              `DOMINICAN LOCK (TRANQUE)! ${playerNames[closerIdx]} (${closerPts} pts) vs ${playerNames[nextOpponentIdx]} (${opponentPts} pts). ${winnerTeamLabel} wins +${totalPts} pts (all 4 hands combined${tieMsg}).`
            )
          );
          if (closerIsOurTeam) {
            confetti({ particleCount: 100, spread: 70 });
            setGameScores((prev) => [prev[0] + totalPts, prev[1]]);
          } else {
            setGameScores((prev) => [prev[0], prev[1] + totalPts]);
          }
        } else if (opponentPts < closerPts) {
          const nextIsOurTeam = nextOpponentIdx === 0 || nextOpponentIdx === 2;
          const winnerTeamLabel = nextIsOurTeam ? tr('Nosotros', 'Us') : tr('Ellos', 'Them');
          const currentTeamScore = nextIsOurTeam ? gameScores[0] : gameScores[1];
          setLastWinnerIndex(nextOpponentIdx);
          if (tiePts > 0) setAccumulatedTiePoints(0);
          const canApplyPenalty =
            ruleTrancaCastigada &&
            !(
              ruleNoWinByBonus &&
              (currentTeamScore >= targetScore - 25 ||
                currentTeamScore + allFourPoints + tiePts + 25 >= targetScore)
            );
          const penalty = canApplyPenalty ? 25 : 0;
          const totalPts = allFourPoints + penalty + tiePts;
          const penaltyMsg = penalty > 0 ? tr(' [¡TRANCA CASTIGADA! +25 pts por trancar perdiendo]', ' [PUNISHED LOCK! +25 penalty pts for locking and losing]') : '';
          const tieMsg = tiePts > 0 ? tr(` (+${tiePts} pts de Mano Brava)`, ` (+${tiePts} Mano Brava pts)`) : '';
          setGameOver(
            tr(
              `¡TRANQUE DOMINICANO! Cerró ${playerNames[closerIdx]} (${closerPts} pts) vs ${playerNames[nextOpponentIdx]} (${opponentPts} pts). Ganó ${winnerTeamLabel} y suma +${totalPts} pts${penaltyMsg}${tieMsg}.`,
              `DOMINICAN LOCK (TRANQUE)! ${playerNames[closerIdx]} (${closerPts} pts) vs ${playerNames[nextOpponentIdx]} (${opponentPts} pts). ${winnerTeamLabel} wins +${totalPts} pts${penaltyMsg}${tieMsg}.`
            )
          );
          if (nextIsOurTeam) {
            confetti({ particleCount: 100, spread: 70 });
            setGameScores((prev) => [prev[0] + totalPts, prev[1]]);
          } else {
            setGameScores((prev) => [prev[0], prev[1] + totalPts]);
          }
        } else {
          // Tie
          if (ruleTranqueEmpateMode === 'manobrava') {
            setAccumulatedTiePoints((prev) => prev + allFourPoints);
            setLastWinnerIndex(closerIdx);
            setGameOver(
              tr(
                `¡MANO BRAVA (TRANQUE EMPATADO)! ${playerNames[closerIdx]} y ${playerNames[nextOpponentIdx]} empataron a ${closerPts} pts. Nadie anota y los ${allFourPoints} pts se acumulan para la próxima mano.`,
                `TIED LOCK (MANO BRAVA)! ${playerNames[closerIdx]} and ${playerNames[nextOpponentIdx]} tied at ${closerPts} pts. Zero awarded now—${allFourPoints} pts carry over to the next hand.`
              )
            );
          } else {
            const winnerTeamLabel = closerIsOurTeam ? tr('Nosotros', 'Us') : tr('Ellos', 'Them');
            setLastWinnerIndex(closerIdx);
            if (tiePts > 0) setAccumulatedTiePoints(0);
            const totalPts = allFourPoints + tiePts;
            const tieMsg = tiePts > 0 ? tr(` (+${tiePts} pts de Mano Brava)`, ` (+${tiePts} Mano Brava pts)`) : '';
            setGameOver(
              tr(
                `¡TRANQUE EMPATADO! Empate a ${closerPts} pts. Por regla oficial FEDODO gana quien cerró (${playerNames[closerIdx]}). Suma +${totalPts} pts para ${winnerTeamLabel}${tieMsg}.`,
                `TIED LOCK! Tied at ${closerPts} pts. By official FEDODO rules, the closer (${playerNames[closerIdx]}) wins +${totalPts} pts for ${winnerTeamLabel}${tieMsg}.`
              )
            );
            if (closerIsOurTeam) {
              confetti({ particleCount: 100, spread: 70 });
              setGameScores((prev) => [prev[0] + totalPts, prev[1]]);
            } else {
              setGameScores((prev) => [prev[0], prev[1] + totalPts]);
            }
          }
        }
      } else {
        // Classic Partnership Comparison: Compare Team Us (0+2) vs Team Them (1+3), award all 4 hands' points
        const teamUsPoints = handPts[0] + handPts[2];
        const teamThemPoints = handPts[1] + handPts[3];

        if (teamUsPoints < teamThemPoints) {
          const winnerIdx = handPts[0] <= handPts[2] ? 0 : 2;
          setLastWinnerIndex(winnerIdx);
          if (tiePts > 0) setAccumulatedTiePoints(0);
          const totalPts = allFourPoints + tiePts;
          const tieMsg = tiePts > 0 ? tr(` (+${tiePts} pts acumulados de Mano Brava)`, ` (+${tiePts} carried Mano Brava pts)`) : '';
          setGameOver(
            tr(
              `¡TRANQUE POR PAREJAS! Ganó tu equipo (${teamUsPoints} vs ${teamThemPoints} pts) y suma +${totalPts} pts (total de los 4 jugadores${tieMsg}).`,
              `PARTNERSHIP LOCK! Your team won (${teamUsPoints} vs ${teamThemPoints} pts) for +${totalPts} pts (all 4 hands${tieMsg}).`
            )
          );
          confetti({ particleCount: 100, spread: 70 });
          setGameScores((prev) => [prev[0] + totalPts, prev[1]]);
        } else if (teamThemPoints < teamUsPoints) {
          const winnerIdx = handPts[1] <= handPts[3] ? 1 : 3;
          setLastWinnerIndex(winnerIdx);
          if (tiePts > 0) setAccumulatedTiePoints(0);
          const totalPts = allFourPoints + tiePts;
          const tieMsg = tiePts > 0 ? tr(` (+${tiePts} pts acumulados de Mano Brava)`, ` (+${tiePts} carried Mano Brava pts)`) : '';
          setGameOver(
            tr(
              `¡TRANQUE POR PAREJAS! Ganó el equipo rival (${teamThemPoints} vs ${teamUsPoints} pts) y suma +${totalPts} pts (total de los 4 jugadores${tieMsg}).`,
              `PARTNERSHIP LOCK! Opponents won (${teamThemPoints} vs ${teamUsPoints} pts) for +${totalPts} pts (all 4 hands${tieMsg}).`
            )
          );
          setGameScores((prev) => [prev[0], prev[1] + totalPts]);
        } else {
          if (ruleTranqueEmpateMode === 'manobrava') {
            setAccumulatedTiePoints((prev) => prev + allFourPoints);
            setLastWinnerIndex(closerIdx);
            setGameOver(
              tr(
                `¡MANO BRAVA (TRANQUE EMPATADO)! Empate a ${teamUsPoints} pts por pareja. Nadie anota y los ${allFourPoints} pts se acumulan para la próxima mano.`,
                `TIED LOCK (MANO BRAVA)! Pairs tied at ${teamUsPoints} pts. Zero awarded—${allFourPoints} pts carry over to the next hand.`
              )
            );
          } else {
            const closerIsOurTeam = closerIdx === 0 || closerIdx === 2;
            const winnerTeamLabel = closerIsOurTeam ? tr('tu equipo', 'your team') : tr('el equipo rival', 'the opposing team');
            setLastWinnerIndex(closerIdx);
            if (tiePts > 0) setAccumulatedTiePoints(0);
            const totalPts = allFourPoints + tiePts;
            setGameOver(
              tr(
                `¡TRANQUE EMPATADO! Empate a ${teamUsPoints} pts por pareja. Gana quien cerró (${playerNames[closerIdx]}). Suma +${totalPts} pts para ${winnerTeamLabel}.`,
                `TIED LOCK! Pairs tied at ${teamUsPoints} pts. Closer (${playerNames[closerIdx]}) takes +${totalPts} pts for ${winnerTeamLabel}.`
              )
            );
            if (closerIsOurTeam) {
              confetti({ particleCount: 100, spread: 70 });
              setGameScores((prev) => [prev[0] + totalPts, prev[1]]);
            } else {
              setGameScores((prev) => [prev[0], prev[1] + totalPts]);
            }
          }
        }
      }
      return;
    }

    setTurn(nextPlayer);
  };

  // Automated AI turn for players 1, 2, 3 using Dominican Tactical Heuristic
  useEffect(() => {
    if (turn === 0 || gameOver) return;

    const timer = setTimeout(() => {
      const currentHand = hands[turn];
      const playable = getPlayableMoves(currentHand, boardEnds, handNumber, ruleFirstHandSalida);

      if (playable.length === 0) {
        handlePass(turn);
      } else {
        const salidaValues = board[centerIdx]?.tile ? [...board[centerIdx].tile] : [];
        const evaluation = evaluateMovesForSeat({
          seatIdx: turn,
          hands,
          boardEnds,
          passedSuits,
          handNumber,
          ruleFirstHandSalida,
          salidorIndex,
          boardLength: board.length,
          salidaValues,
          lang,
        });

        if (evaluation.options.length > 0) {
          const best = evaluation.options[0];
          const targetEnd = best.end === 'any' ? 'left' : best.end;
          makePlay(turn, best.tile, targetEnd);
        } else {
          const fallback = playable[0];
          const targetEnd =
            fallback.end === 'both' || fallback.end === 'any' ? 'left' : fallback.end;
          makePlay(turn, fallback.tile, targetEnd);
        }
      }
    }, 900);

    return () => clearTimeout(timer);
  }, [turn, boardEnds, hands, gameOver, passedSuits, handNumber, ruleFirstHandSalida, salidorIndex, board, centerIdx]);

  const playableForMe = getPlayableMoves(hands[0], boardEnds, handNumber, ruleFirstHandSalida);

  // Live HUD Calculations (Tactical Coach & 28-Tile Probability Matrix)
  const playedTileKeys = new Set(
    board.map((b) => `${Math.min(b.tile[0], b.tile[1])}-${Math.max(b.tile[0], b.tile[1])}`)
  );
  const handTileKeys = new Set(
    hands[0].map((t) => `${Math.min(t[0], t[1])}-${Math.max(t[0], t[1])}`)
  );

  const totalPlayedCount = board.length;
  const unplayedCount = Math.max(0, 28 - totalPlayedCount - hands[0].length);

  const partnerPassed = passedSuits[2] || [];
  const partnerPassCount = partnerPassed.length;
  const partnerSignalingPct = boardEnds
    ? partnerPassed.includes(boardEnds[0]) && partnerPassed.includes(boardEnds[1])
      ? 15
      : partnerPassed.includes(boardEnds[0]) || partnerPassed.includes(boardEnds[1])
      ? 48
      : 76
    : 50;

  const tranqueRiskPct = boardEnds
    ? Math.min(
        95,
        Math.max(
          12,
          Math.round(
            ((board.filter((b) => b.tile[0] === boardEnds[0] || b.tile[1] === boardEnds[0]).length +
              board.filter((b) => b.tile[0] === boardEnds[1] || b.tile[1] === boardEnds[1]).length) /
              14) *
              100
          )
        )
      )
    : 12;

  const playerSuits = hands[0].flatMap((t) => [t[0], t[1]]);
  const dominantSuit =
    playerSuits.length > 0
      ? playerSuits.reduce(
          (acc, curr, _, arr) =>
            arr.filter((v) => v === curr).length > arr.filter((v) => v === acc).length ? curr : acc,
          0
        )
      : 0;
  const dominantSuitCount = hands[0].filter((t) => t[0] === dominantSuit || t[1] === dominantSuit).length;
  const salidaPct = Math.min(100, Math.max(25, Math.round((dominantSuitCount / 7) * 100)));

  return (
    <div className="space-y-4">
      {/* Configurable Dominican Rules Panel */}
      {showRulesConfig && (
        <div className="p-4 rounded-xl bg-slate-900/95 border border-blue-500/40 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-4 text-xs relative">
          {/* Panel Header & Red Close Button */}
          <div className="md:col-span-3 flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-white text-sm">
                {tr('Configuración de Reglas Dominicanas', 'Dominican Rules Configuration')}
              </span>
            </div>
            <button
              onClick={() => setShowRulesConfig(false)}
              className="w-7 h-7 rounded-lg bg-rose-500/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/50 flex items-center justify-center transition shadow-sm"
              title={tr('Cerrar panel de reglas', 'Close rules panel')}
              aria-label={tr('Cerrar panel de reglas', 'Close rules panel')}
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Rule 1: First Pass 25 pts */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2">
            <div>
              <div className="font-bold text-white flex items-center justify-between">
                <span>{tr('Paso en la Salida (+25 pts)', 'Opening Lead Pass (+25 pts)')}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ruleFirstPass25 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {ruleFirstPass25 ? tr('ACTIVO', 'ACTIVE') : tr('INACTIVO', 'INACTIVE')}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-1">
                {tr(
                  'Si el jugador que sigue al salidor no tiene fichas para responder en el primer turno, la pareja del salidor gana 25 pts inmediatos.',
                  'If the player immediately following the leader passes on the first turn, the leader’s pair immediately scores +25 pts.'
                )}
              </p>
            </div>
            <button
              onClick={() => setRuleFirstPass25(!ruleFirstPass25)}
              className="w-full py-1.5 rounded-lg font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              {ruleFirstPass25 ? tr('Desactivar regla', 'Disable rule') : tr('Activar regla', 'Enable rule')}
            </button>
          </div>

          {/* Rule 2: Capicúa Bonus */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2">
            <div>
              <div className="font-bold text-white flex items-center justify-between">
                <span>{tr('Bono de Capicúa', 'Capicúa Bonus')}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ruleCapicuaBonus > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {ruleCapicuaBonus > 0 ? `+${ruleCapicuaBonus} PTS` : tr('DESACTIVADO', 'DISABLED')}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-1">
                {tr(
                  'Pegarse con ficha mixta (no doble) que encaja en ambas puntas abiertas de la mesa.',
                  'Going out on the last mixed (non-double) tile matching both open board ends.'
                )}
              </p>
            </div>
            <div className="flex gap-1.5">
              {[
                { val: 0, label: 'Off' },
                { val: 25, label: '+25 pts' },
                { val: 50, label: '+50 pts' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setRuleCapicuaBonus(opt.val)}
                  className={`flex-1 py-1 rounded-lg font-bold transition text-[11px] ${
                    ruleCapicuaBonus === opt.val
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rule 3: Pase Corrido / Triple Paso */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2">
            <div>
              <div className="font-bold text-white flex items-center justify-between">
                <span>{tr('Triple Paso (+25 pts)', 'Triple Pass (+25 pts)')}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ruleTriplePaso25 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {ruleTriplePaso25 ? tr('ACTIVO', 'ACTIVE') : tr('INACTIVO', 'INACTIVE')}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-1">
                {tr(
                  'Cuando 3 jugadores pasan de largo consecutivamente y le dan la vuelta limpia a la mesa al mismo jugador.',
                  'When 3 players pass consecutively, wrapping a clean turn back to the last player (+25 pts).'
                )}
              </p>
            </div>
            <button
              onClick={() => setRuleTriplePaso25(!ruleTriplePaso25)}
              className="w-full py-1.5 rounded-lg font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              {ruleTriplePaso25 ? tr('Desactivar regla', 'Disable rule') : tr('Activar regla', 'Enable rule')}
            </button>
          </div>

          {/* Rule 4: Tranque Comparison Mode */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2">
            <div>
              <div className="font-bold text-white flex items-center justify-between">
                <span>{tr('Modo de Tranque (Cierre)', 'Lock Mode (Tranque)')}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                  {ruleTranqueMode === 'individual'
                    ? tr('DOMINICANO (1 vs 1)', 'DOMINICAN (1v1)')
                    : tr('PAREJAS (2 vs 2)', 'PAIRS (2v2)')}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-1">
                {ruleTranqueMode === 'individual'
                  ? tr(
                      'Se comparan solo los puntos de quien trancó vs el que le sigue (de la pareja contraria). El ganador suma los de los 4.',
                      'Compares only the closer’s pips vs the next rival in turn. The winning side collects all 4 players’ remaining pips.'
                    )
                  : tr(
                      'Se comparan los puntos totales sumados de ambas parejas completas.',
                      'Compares combined pip totals across both complete partnerships.'
                    )}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setRuleTranqueMode('individual')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition ${
                  ruleTranqueMode === 'individual'
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tr('Dominicano (1 vs 1)', 'Dominican (1v1)')}
              </button>
              <button
                onClick={() => setRuleTranqueMode('parejas')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition ${
                  ruleTranqueMode === 'parejas'
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tr('Por Parejas', 'By Pairs')}
              </button>
            </div>
          </div>

          {/* Rule 5: Empate en el Tranque */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2">
            <div>
              <div className="font-bold text-white flex items-center justify-between">
                <span>{tr('Empate en Tranque', 'Tied Lock Resolution')}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                  {ruleTranqueEmpateMode === 'cerrador'
                    ? tr('OFICIAL FEDODO', 'OFFICIAL FEDODO')
                    : 'MANO BRAVA'}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-1">
                {ruleTranqueEmpateMode === 'cerrador'
                  ? tr(
                      'Regla de Torneo: Si hay empate exacto de puntos, gana quien tuvo la iniciativa de cerrar.',
                      'Tournament Rule: On an exact pip tie, the player who closed the board wins the lock.'
                    )
                  : tr(
                      'Regla Callejera: Los puntos de la mano se acumulan y los cobra quien gane la siguiente mano.',
                      'Street Rule: Tied lock points roll over and are awarded to whoever wins the next hand.'
                    )}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setRuleTranqueEmpateMode('cerrador')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition ${
                  ruleTranqueEmpateMode === 'cerrador'
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tr('Gana Cerrador', 'Closer Wins')}
              </button>
              <button
                onClick={() => setRuleTranqueEmpateMode('manobrava')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition ${
                  ruleTranqueEmpateMode === 'manobrava'
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Mano Brava
              </button>
            </div>
          </div>

          {/* Rule 6: Tranca Castigada */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2">
            <div>
              <div className="font-bold text-white flex items-center justify-between">
                <span>{tr('Tranca Castigada', 'Punished Lock')}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ruleTrancaCastigada ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {ruleTrancaCastigada ? tr('ACTIVA (+25 PTS)', 'ACTIVE (+25 PTS)') : tr('INACTIVA', 'INACTIVE')}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-1">
                {tr(
                  'Si un jugador decide trancar la mesa pero pierde el conteo, se le penaliza otorgando +25 pts extra a los rivales.',
                  'If the closing player loses the lock pip count, opponents receive an extra +25 penalty points.'
                )}
              </p>
            </div>
            <button
              onClick={() => setRuleTrancaCastigada(!ruleTrancaCastigada)}
              className="w-full py-1.5 rounded-lg font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              {ruleTrancaCastigada
                ? tr('Desactivar castigo', 'Disable penalty')
                : tr('Activar castigo (+25 pts)', 'Enable penalty (+25 pts)')}
            </button>
          </div>

          {/* Rule 7: Salida Mano #1 */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2">
            <div>
              <div className="font-bold text-white flex items-center justify-between">
                <span>{tr('Salida Mano #1', 'Hand #1 Mandatory Lead')}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                  {ruleFirstHandSalida === '66'
                    ? tr('DOBLE SEIS [6:6]', 'DOUBLE SIX [6:6]')
                    : tr('DOBLE BLANCO [0:0]', 'DOUBLE BLANK [0:0]')}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-1">
                {tr(
                  'Ficha obligatoria para abrir el primer juego (0-0) del partido completo.',
                  'Mandatory opening tile for the very first hand (0-0) of the match.'
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setRuleFirstHandSalida('66');
                  if (handNumber === 1 && board.length === 0) {
                    const holder = hands.findIndex((h) => h.some(([a, b]) => a === 6 && b === 6));
                    if (holder !== -1) {
                      setSalidorIndex(holder);
                      setTurn(holder);
                      setLastPlayerWhoPlayed(holder);
                    }
                  }
                }}
                className={`flex-1 py-1.5 rounded-lg font-bold transition ${
                  ruleFirstHandSalida === '66'
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tr('[6:6] Oficial', '[6:6] Official')}
              </button>
              <button
                onClick={() => {
                  setRuleFirstHandSalida('00');
                  if (handNumber === 1 && board.length === 0) {
                    const holder = hands.findIndex((h) => h.some(([a, b]) => a === 0 && b === 0));
                    if (holder !== -1) {
                      setSalidorIndex(holder);
                      setTurn(holder);
                      setLastPlayerWhoPlayed(holder);
                    }
                  }
                }}
                className={`flex-1 py-1.5 rounded-lg font-bold transition ${
                  ruleFirstHandSalida === '00'
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                [0:0] "La Chiva"
              </button>
            </div>
          </div>

          {/* Rule 8: Target Score 100 or 200 */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2">
            <div>
              <div className="font-bold text-white flex items-center justify-between">
                <span>{tr('Meta del Partido', 'Match Target Score')}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                  {targetScore} {tr('PUNTOS', 'POINTS')}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-1">
                {tr(
                  'Límite de puntos acordado para ganar el partido completo.',
                  'Agreed point target required to win the match.'
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTargetScore(100)}
                className={`flex-1 py-1.5 rounded-lg font-bold transition ${
                  targetScore === 100
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tr('A 100 Pts', 'To 100 Pts')}
              </button>
              <button
                onClick={() => setTargetScore(200)}
                className={`flex-1 py-1.5 rounded-lg font-bold transition ${
                  targetScore === 200
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tr('A 200 Pts', 'To 200 Pts')}
              </button>
              <button
                onClick={resetFullMatch}
                className="px-2.5 py-1.5 rounded-lg font-bold bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-700/50 transition"
                title={tr('Reiniciar marcador a 0 - 0', 'Reset match score to 0 - 0')}
              >
                0-0
              </button>
            </div>
          </div>

          {/* Rule 9: Zapato / Pela de Chivo */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2">
            <div>
              <div className="font-bold text-white flex items-center justify-between">
                <span>Zapato / Pela de Chivo</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ruleZapatoAlert ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {ruleZapatoAlert ? tr('ACTIVO', 'ACTIVE') : tr('INACTIVO', 'INACTIVE')}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-1">
                {tr(
                  'Alerta y celebración especial cuando una pareja gana el partido completo blanqueando al rival (ej. 100-0 o 200-0).',
                  'Special shutout banner when one pair sweeps the entire match holding opponents at zero (e.g., 100-0 or 200-0).'
                )}
              </p>
            </div>
            <button
              onClick={() => setRuleZapatoAlert(!ruleZapatoAlert)}
              className="w-full py-1.5 rounded-lg font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              {ruleZapatoAlert ? tr('Desactivar alerta', 'Disable alert') : tr('Activar alerta', 'Enable alert')}
            </button>
          </div>

          {/* Rule 10: No Win by Bonus Points (75+ in 100 / 175+ in 200) */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2">
            <div>
              <div className="font-bold text-white flex items-center justify-between">
                <span>{tr(`Límite de Bono (${targetScore - 25}+ pts)`, `Bonus Cap (${targetScore - 25}+ pts)`)}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ruleNoWinByBonus ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {ruleNoWinByBonus ? tr('ACTIVO', 'ACTIVE') : tr('INACTIVO', 'INACTIVE')}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-1">
                {tr(
                  `No se gana el partido con puntos extras (Capicúa, Paso en Salida o Triple Paso). Con ${targetScore - 25}+ pts no se suman; con ≤${targetScore - 26} pts sí aplican.`,
                  `Matches cannot be closed out by bonus points (Capicúa, Lead Pass, Triple Pass). Blocked at ${targetScore - 25}+ pts; active at ≤${targetScore - 26} pts.`
                )}
              </p>
            </div>
            <button
              onClick={() => setRuleNoWinByBonus(!ruleNoWinByBonus)}
              className="w-full py-1.5 rounded-lg font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              {ruleNoWinByBonus ? tr('Desactivar límite', 'Disable cap') : tr('Activar límite', 'Enable cap')}
            </button>
          </div>

          {/* Rule 11: Salida Rule Info Banner */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2 md:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-white text-xs">
                {tr('Orden de Salida ("El que gana sale")', 'Opening Lead Order ("Winner Leads")')}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                {tr('REGLA OFICIAL FIJA', 'FIXED OFFICIAL RULE')}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {lang === 'en' ? (
                <>
                  • <b>Hand #1:</b> Whoever holds the configured mandatory lead opens ({ruleFirstHandSalida === '00' ? '[0:0] La Chiva' : '[6:6] Double Six'}).<br />
                  • <b>Hand #2 onward:</b> The <b>individual player who won the previous hand</b> always leads first.
                </>
              ) : (
                <>
                  • <b>Mano #1:</b> Sale quien tenga la ficha obligatoria configurada ({ruleFirstHandSalida === '00' ? '[0:0] La Chiva' : '[6:6] Doble Seis'}).<br />
                  • <b>Mano #2 en adelante:</b> Siempre sale de primero el <b>último jugador individual que ganó la mano anterior</b> (por pegada o por tranque con menos puntos).
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Bonus Alert Banner (e.g., +25 pts on first pass) */}
      {bonusBanner && (
        <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-200 text-xs font-semibold flex items-center justify-between">
          <span>{bonusBanner}</span>
          <button
            onClick={() => setBonusBanner(null)}
            className="text-emerald-400 hover:text-white text-[11px] underline ml-4"
          >
            {tr('Cerrar', 'Dismiss')}
          </button>
        </div>
      )}

      {/* Full Match Winner Banner */}
      {matchWinner && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-emerald-500/20 border-2 border-amber-400 text-center space-y-2 shadow-xl">
          <div className="text-base font-black text-amber-300">{matchWinner}</div>
          <div className="text-xs text-slate-300 font-mono">
            {tr(
              `Marcador Final: Nosotros ${gameScores[0]} pts — Ellos ${gameScores[1]} pts (Meta: ${targetScore} pts)`,
              `Final Score: Us ${gameScores[0]} pts — Them ${gameScores[1]} pts (Target: ${targetScore} pts)`
            )}
          </div>
          <button
            onClick={resetFullMatch}
            className="px-4 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs hover:bg-amber-300 transition shadow"
          >
            {tr('Iniciar Nuevo Partido (0 - 0)', 'Start New Match (0 - 0)')}
          </button>
        </div>
      )}

      {/* 3-Column Tournament Cockpit Layout (Left HUD, Center Table Arena, Right Matrix HUD) */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-3 sm:gap-4 items-start">
        {/* LEFT HUD: Entrenador Táctico (EN VIVO) */}
        <div className="xl:col-span-3 flex flex-col gap-3 order-2 xl:order-1">
          <div className="p-4 rounded-2xl glass-panel-elevated space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white tracking-wide">
                    {tr('Entrenador Táctico', 'Tactical Coach')}
                  </h3>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black tracking-wider flex items-center gap-1 border border-emerald-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {tr('EN VIVO', 'LIVE')}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {tr('Estrategia de dominó dominicano', 'Dominican dominoes strategy')}
                </p>
              </div>
            </div>

            {/* La Salida Section */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{tr('La Salida', 'Opening Lead')}</span>
                <span className="text-[10px] text-amber-400 font-mono font-bold">
                  {tr('Salidor:', 'Leader:')} {playerNames[salidorIndex]}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">{tr('Control de pinta dominante', 'Dominant suit control')}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-emerald-400">{tr('Pinta Dominante:', 'Dominant Suit:')} {salidaPct}%</span>
                  <span className="text-slate-400">{tr('Rival:', 'Opponents:')} {100 - salidaPct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden flex">
                  <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${salidaPct}%` }} />
                  <div className="bg-rose-500/80 h-full transition-all duration-300" style={{ width: `${100 - salidaPct}%` }} />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-500 pt-1">
                  <span>1</span>
                  <span>3</span>
                  <span>5</span>
                  <span>10</span>
                  <span>5</span>
                </div>
              </div>
            </div>

            {/* Partner Signaling Section */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{tr('Señales del Compañero', 'Partner Signals')}</span>
                <span className="text-[11px] font-mono font-bold text-emerald-400">{partnerSignalingPct}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-300"
                  style={{ width: `${partnerSignalingPct}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">
                {partnerPassCount > 0
                  ? tr(`Compañero pasó a ${partnerPassCount} número(s)`, `Partner passed on ${partnerPassCount} suit(s)`)
                  : tr('Alineación táctica y lectura activa', 'Tactical alignment & active read')}
              </p>
            </div>

            {/* Tranca Risk Section */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{tr('Riesgo de Tranque', 'Lock Risk')}</span>
                <span className={`text-[11px] font-mono font-bold ${tranqueRiskPct > 50 ? 'text-rose-400' : 'text-amber-400'}`}>
                  {tranqueRiskPct}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${tranqueRiskPct > 50 ? 'bg-rose-500' : 'bg-amber-400'}`}
                  style={{ width: `${tranqueRiskPct}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">
                {tr('Puntas abiertas:', 'Open ends:')} [{boardEnds ? `${boardEnds[0]} : ${boardEnds[1]}` : tr('Sin abrir', 'Waiting for lead')}]
              </p>
            </div>

            {/* Live Advice & Breakdown */}
            {isCoachActive && coachAdvice && (
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{tr('Doctrina Táctica', 'Tactical Doctrine')}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-200">
                  {coachAdvice}
                </p>
                {coachOptions.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {coachOptions.slice(0, 3).map((o, i) => (
                      <div key={i} className="p-1.5 rounded-lg bg-slate-950/80 border border-white/5 text-[10px]">
                        <div className="flex justify-between font-bold text-white">
                          <span>{i + 1}. {o.label}</span>
                          <span className="text-amber-300 font-mono">{o.total}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CENTER ARENA: Virtual Domino Table */}
        <div className="xl:col-span-6 w-full order-1 xl:order-2 flex flex-col justify-between items-center min-h-[580px] sm:min-h-[640px] relative px-2">
          {/* Subtle Center Table Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
            <div className="w-80 h-80 rounded-full border-8 border-white flex items-center justify-center">
              <span className="font-black text-7xl tracking-widest text-white uppercase">DOMINÓ</span>
            </div>
          </div>

          {/* Minimal Floating Table Controls */}
          <div className="w-full flex items-center justify-between gap-2 px-3 py-1 mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRulesConfig(!showRulesConfig)}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-black/40 hover:bg-black/60 text-slate-300 border border-white/10 flex items-center gap-1.5 transition"
              >
                <Settings2 className="w-3.5 h-3.5 text-amber-400" />
                <span>{tr('Reglas', 'Rules')}</span>
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowPlayerBadges(!showPlayerBadges)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition ${
                  showPlayerBadges
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-black/40 text-slate-400 border-white/10'
                }`}
                title={tr('Mostrar qué jugador jugó cada ficha', 'Show player badge on each tile')}
              >
                {tr('Autor', 'Player')} {showPlayerBadges ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => setShowPlayOrder(!showPlayOrder)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition ${
                  showPlayOrder
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-black/40 text-slate-400 border-white/10'
                }`}
                title={tr('Mostrar orden numérico de jugadas', 'Show numeric play order')}
              >
                {tr('Orden', 'Order')} {showPlayOrder ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

        {/* Top Player (Compañero) */}
        <div className="flex flex-col items-center">
          <div className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 ${
            turn === 2 && !gameOver ? 'bg-amber-400 text-slate-950 shadow-lg scale-105 animate-pulse' : 'bg-slate-950/70 text-slate-300 border border-slate-700'
          }`}>
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-cyan-400 inline-block" />
            <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>
              {tr('Compañero', 'Partner')} • {hands[2].length} {tr('fichas', 'tiles')}
              {gameOver && ` (${hands[2].reduce((s, [a, b]) => s + a + b, 0)} pts)`}
            </span>
            {salidorIndex === 2 && (
              <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow border border-amber-600/40">
                {tr('Salidor', 'Leader')}
              </span>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-1 sm:gap-1.5">
            {gameOver
              ? hands[2].map(([top, bottom], i) => (
                  <DominoTile key={i} top={top} bottom={bottom} size="sm" orientation="vertical" disabled />
                ))
              : hands[2].map((_, i) => (
                  <div
                    key={i}
                    className="w-5 h-8 sm:w-6 sm:h-9 bg-gradient-to-b from-[#fdfbf7] via-[#f7f2e7] to-[#e4dbc9] rounded border border-[#c4b59f] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.95)] transform -skew-x-1"
                  />
                ))}
          </div>
        </div>

        {/* Mobile Compact Rivals Row (< md) */}
        <div className="grid grid-cols-2 gap-2 my-2 md:hidden">
          {/* Mobile Left Rival */}
          <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
            turn === 3 && !gameOver ? 'bg-amber-400/20 border-amber-400 text-amber-200' : 'bg-slate-950/60 border-slate-800 text-slate-300'
          }`}>
            <div className="flex items-center gap-1 text-[10px] font-bold">
              <span className="w-2 h-2 rounded-full bg-orange-500 inline-block shrink-0" />
              <span className="truncate">{tr('Rival Izq.', 'Left Rival')} ({hands[3].length})</span>
              {salidorIndex === 3 && (
                <span className="px-1 rounded bg-amber-400 text-slate-950 text-[8px] font-black uppercase">{tr('Salidor', 'Leader')}</span>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-0.5">
              {gameOver
                ? hands[3].map(([top, bottom], i) => (
                    <DominoTile key={i} top={top} bottom={bottom} size="sm" orientation="vertical" disabled />
                  ))
                : hands[3].map((_, i) => (
                    <div key={i} className="w-3 h-4.5 bg-white rounded-sm border border-slate-300" />
                  ))}
            </div>
          </div>

          {/* Mobile Right Rival */}
          <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
            turn === 1 && !gameOver ? 'bg-amber-400/20 border-amber-400 text-amber-200' : 'bg-slate-950/60 border-slate-800 text-slate-300'
          }`}>
            <div className="flex items-center gap-1 text-[10px] font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block shrink-0" />
              <span className="truncate">{tr('Rival Der.', 'Right Rival')} ({hands[1].length})</span>
              {salidorIndex === 1 && (
                <span className="px-1 rounded bg-amber-400 text-slate-950 text-[8px] font-black uppercase">{tr('Salidor', 'Leader')}</span>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-0.5">
              {gameOver
                ? hands[1].map(([top, bottom], i) => (
                    <DominoTile key={i} top={top} bottom={bottom} size="sm" orientation="vertical" disabled />
                  ))
                : hands[1].map((_, i) => (
                    <div key={i} className="w-3 h-4.5 bg-white rounded-sm border border-slate-300" />
                  ))}
            </div>
          </div>
        </div>

        {/* Center: Left Rival (md+), Domino Board Chain, Right Rival (md+) */}
        <div className="flex items-center justify-between my-2 sm:my-4 px-0 sm:px-2">
          {/* Left Rival (Rival Izquierda - Desktop/Tablet) */}
          <div className="hidden md:flex flex-col items-center w-36 shrink-0">
            <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex flex-wrap items-center justify-center gap-1.5 mb-2 text-center ${
              turn === 3 && !gameOver ? 'bg-amber-400 text-slate-950 shadow-lg scale-105 animate-pulse' : 'bg-slate-950/70 text-slate-300 border border-slate-700'
            }`}>
              <span className="w-2 h-2 rounded-full bg-orange-500 inline-block shrink-0" />
              <User className="w-3 h-3 shrink-0" />
              <span>
                {tr('Rival Izquierda', 'Left Rival')} ({hands[3].length})
                {gameOver && ` • ${hands[3].reduce((s, [a, b]) => s + a + b, 0)} pts`}
              </span>
              {salidorIndex === 3 && (
                <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow border border-amber-600/40">
                  {tr('Salidor', 'Leader')}
                </span>
              )}
            </div>
            <div className="flex flex-col items-center gap-1.5">
              {gameOver
                ? hands[3].map(([top, bottom], i) => (
                    <DominoTile key={i} top={top} bottom={bottom} size="sm" orientation="horizontal" disabled />
                  ))
                : hands[3].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-5 sm:w-9 sm:h-6 bg-gradient-to-r from-[#fdfbf7] via-[#f7f2e7] to-[#e4dbc9] rounded border border-[#c4b59f] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.95)]"
                    />
                  ))}
            </div>
          </div>

          {/* Board Center Chain - Directly on Felt Table */}
          <div className="flex-1 min-w-0 max-w-4xl mx-0 md:mx-4 p-2 sm:p-4 min-h-[240px] sm:min-h-[300px] flex flex-col items-center justify-center relative">
            {board.length === 0 ? (
              <div className="text-center text-emerald-200/50 text-xs font-mono">
                {tr('La mesa está vacía. Esperando la salida de', 'Board is empty. Waiting for the opening lead from')}{' '}
                <b className="text-amber-400">{playerNames[salidorIndex]}</b>...
              </div>
            ) : (
              <div className="w-full flex justify-center py-2">

                {(() => {
                  const centerItem = board[centerIdx];
                  const centerTile = centerItem.tile;
                  const centerVertical = centerTile[0] === centerTile[1];
                  const centerW = centerVertical ? TILE_SHORT : TILE_LONG;
                  const centerH = centerVertical ? TILE_LONG : TILE_SHORT;
                  const rightOut = board.slice(centerIdx + 1);
                  // left arm tiles are stored [outer, chain]; flip to chain-first, ordered outward
                  const leftOut = board
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

                  const rawW = maxX - minX + 12;
                  const rawH = maxY - minY + 12;
                  const availW = viewportW < 640 ? viewportW - 68 : rawW;
                  const scale = rawW > availW ? Math.max(0.5, availW / rawW) : 1;

                  return (
                    <div className="w-full overflow-x-auto py-2 sm:py-3 flex justify-center">
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
                          {/* Layer 1: Independent Contact Shadows */}
                          <div data-testid="board-shadows-layer" className="absolute inset-0 pointer-events-none z-0">
                            {all.map((p, i) => (
                              <div
                                key={i}
                                className="absolute rounded-lg bg-black/70 blur-[6px] translate-y-[4px]"
                                style={{
                                  left: p.left - minX + 6,
                                  top: p.top - minY + 6,
                                  width: p.vertical ? TILE_SHORT : TILE_LONG,
                                  height: p.vertical ? TILE_LONG : TILE_SHORT,
                                }}
                              />
                            ))}
                          </div>
                          {/* Layer 2: Board Tiles */}
                          <div data-testid="board-tiles-layer" className="relative z-10 w-full h-full">
                            {all.map((p, i) => {
                              const badgeInfo = playerBadges[p.playedBy];
                              return (
                                <div
                                  key={i}
                                  className="absolute"
                                  style={{ left: p.left - minX + 6, top: p.top - minY + 6 }}
                                >
                                  <DominoTile
                                    top={p.tile[0]}
                                    bottom={p.tile[1]}
                                    size="sm"
                                    orientation={p.vertical ? 'vertical' : 'horizontal'}
                                    className={i === 0 ? 'ring-2 ring-amber-400/70' : ''}
                                    badge={showPlayerBadges ? badgeInfo.tag : undefined}
                                    badgeColor={badgeInfo.color}
                                    orderBadge={showPlayOrder ? p.playOrder : undefined}
                                    boardMode
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              </div>
            )}

            {passedSuits.some((l) => l.length > 0) && (
              <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px]">
                {passedSuits.map((list, i) =>
                  list.length > 0 ? (
                    <span key={i} className="px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-700/60">
                      {playerNames[i]} {tr('pasó a:', 'passed on:')} {list.join(', ')}
                    </span>
                  ) : null
                )}
              </div>
            )}

            {gameOver && (
              <div className="mt-3 p-3 sm:p-3.5 bg-amber-950/80 border border-amber-500/60 rounded-xl text-center space-y-1.5 shadow-lg">
                <div className="text-xs sm:text-sm font-bold text-amber-300">{gameOver}</div>
                {lastWinnerIndex !== null && (
                  <div className="text-[11px] sm:text-xs text-amber-100/90 font-medium">
                    {lang === 'en' ? (
                      <>
                        ⚡ <b>Next Lead:</b> <b className="text-amber-300 font-bold">{playerNames[lastWinnerIndex]}</b> opens the next hand (winner of this round).
                      </>
                    ) : (
                      <>
                        ⚡ <b>Próxima Salida:</b> Abre la mano <b className="text-amber-300 font-bold">{playerNames[lastWinnerIndex]}</b> (por haber ganado esta mano).
                      </>
                    )}
                  </div>
                )}
                <button
                  onClick={() => startNewRound()}
                  className="mt-2 px-5 py-1.5 text-xs font-bold rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-300 transition shadow active:scale-95"
                >
                  {tr(`Jugar Mano #${handNumber + 1}`, `Play Hand #${handNumber + 1}`)}
                </button>
              </div>
            )}
          </div>

          {/* Right Rival (Rival Derecha - Desktop/Tablet) */}
          <div className="hidden md:flex flex-col items-center w-36 shrink-0">
            <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex flex-wrap items-center justify-center gap-1.5 mb-2 text-center ${
              turn === 1 && !gameOver ? 'bg-amber-400 text-slate-950 shadow-lg scale-105 animate-pulse' : 'bg-slate-950/70 text-slate-300 border border-slate-700'
            }`}>
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block shrink-0" />
              <User className="w-3 h-3 shrink-0" />
              <span>
                {tr('Rival Derecha', 'Right Rival')} ({hands[1].length})
                {gameOver && ` • ${hands[1].reduce((s, [a, b]) => s + a + b, 0)} pts`}
              </span>
              {salidorIndex === 1 && (
                <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow border border-amber-600/40">
                  {tr('Salidor', 'Leader')}
                </span>
              )}
            </div>
            <div className="flex flex-col items-center gap-1.5">
              {gameOver
                ? hands[1].map(([top, bottom], i) => (
                    <DominoTile key={i} top={top} bottom={bottom} size="sm" orientation="horizontal" disabled />
                  ))
                : hands[1].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-5 sm:w-9 sm:h-6 bg-gradient-to-r from-[#fdfbf7] via-[#f7f2e7] to-[#e4dbc9] rounded border border-[#c4b59f] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.95)]"
                    />
                  ))}
            </div>
          </div>
        </div>

        {/* Bottom: Player (You) Hand */}
        <div className="flex flex-col items-center space-y-2">
          {/* Turn indicator */}
          <div className={`px-3.5 sm:px-4 py-1 rounded-full text-[11px] sm:text-xs font-bold flex items-center gap-2 ${
            turn === 0 && !gameOver ? 'bg-amber-400 text-slate-950 shadow-lg scale-105' : 'bg-slate-950/70 text-slate-300 border border-slate-700'
          }`}>
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 inline-block" />
            <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>
              {gameOver
                ? tr(
                    `Mano terminada • Tú (${hands[0].length} fichas • ${hands[0].reduce((s, [a, b]) => s + a + b, 0)} pts)`,
                    `Hand finished • You (${hands[0].length} tiles • ${hands[0].reduce((s, [a, b]) => s + a + b, 0)} pts)`
                  )
                : turn === 0
                ? tr('¡Tu Turno de Jugar!', 'Your Turn to Play!')
                : tr(`Esperando turno de ${playerNames[turn]}...`, `Waiting for ${playerNames[turn]}...`)}
            </span>
            {salidorIndex === 0 && (
              <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow border border-amber-600/40">
                {tr('Salidor', 'Leader')}
              </span>
            )}
          </div>

          {/* 3D Tournament Rack Tray */}
          <div className="relative mx-auto mt-2 px-3 sm:px-6 py-2.5 sm:py-3.5 rounded-2xl bg-gradient-to-t from-[#0e131b] via-[#161f2b] to-[#252f3f] border border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.8),inset_0_1.5px_2px_rgba(255,255,255,0.2)] flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Rack Groove Highlight & Depth */}
            <div className="absolute inset-x-3 bottom-1.5 h-1.5 rounded-full bg-black/60 blur-[1px] pointer-events-none" />
            {hands[0].map(([top, bottom], idx) => {
              const isPlayable = turn === 0 && playableForMe.some(
                (m) => (m.tile[0] === top && m.tile[1] === bottom) || (m.tile[0] === bottom && m.tile[1] === top)
              );

              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <DominoTile
                    top={top}
                    bottom={bottom}
                    size="md"
                    disabled={turn !== 0 || !isPlayable}
                    highlighted={isPlayable}
                    onClick={() => {
                      if (!isPlayable) return;
                      const move = playableForMe.find(
                        (m) => (m.tile[0] === top && m.tile[1] === bottom) || (m.tile[0] === bottom && m.tile[1] === top)
                      );
                      if (move) {
                        if (move.end === 'both') {
                          setPendingTile([top, bottom]);
                          return;
                        }
                        const target = move.end === 'any' ? 'left' : move.end;
                        makePlay(0, [top, bottom], target);
                      }
                    }}
                  />
                </div>
              );
            })}

            {turn === 0 && pendingTile && boardEnds && !gameOver && (
              <div className="w-full flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-2">
                <span className="text-xs text-slate-300">
                  [{pendingTile[0]}:{pendingTile[1]}] {tr('¿por qué punta?', 'which end?')}
                </span>
                <button
                  onClick={() => makePlay(0, pendingTile, 'left')}
                  className="px-3 py-1.5 bg-amber-400 text-slate-950 font-bold text-xs rounded-lg active:scale-95"
                >
                  {tr('Izquierda', 'Left')} ({boardEnds[0]})
                </button>
                <button
                  onClick={() => makePlay(0, pendingTile, 'right')}
                  className="px-3 py-1.5 bg-amber-400 text-slate-950 font-bold text-xs rounded-lg active:scale-95"
                >
                  {tr('Derecha', 'Right')} ({boardEnds[1]})
                </button>
                <button
                  onClick={() => setPendingTile(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg active:scale-95"
                >
                  {tr('Cancelar', 'Cancel')}
                </button>
              </div>
            )}

            {turn === 0 && playableForMe.length === 0 && !gameOver && (
              <button
                onClick={() => handlePass(0)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95"
              >
                {tr('Paso Obligado', 'Forced Pass')}
              </button>
            )}
          </div>
        </div>

        {/* Bottom Floating Actions */}
        <div className="w-full flex items-center justify-between gap-2 px-3 pt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCoachActive(!isCoachActive)}
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-xl flex items-center gap-1.5 border backdrop-blur-md transition ${
                isCoachActive
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                  : 'bg-black/40 text-slate-400 border-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isCoachActive ? tr('Coach Activo', 'Coach Active') : tr('Coach Oculto', 'Coach Hidden')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {accumulatedTiePoints > 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-extrabold animate-pulse">
                🔥 Mano Brava: +{accumulatedTiePoints} pts
              </span>
            )}
            <span className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-amber-300 text-[11px] font-mono font-bold backdrop-blur-md">
              {tr('Mano #', 'Hand #')}{handNumber}
            </span>
            <button
              onClick={() => startNewRound()}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{tr('Nueva Mano', 'New Hand')}</span>
            </button>
          </div>
        </div>
      </div>

    {/* RIGHT HUD: Matriz de Probabilidad (28 Fichas) */}
    <div className="xl:col-span-3 flex flex-col gap-3 order-3">
      <div className="p-4 rounded-2xl glass-panel-elevated space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div>
            <h3 className="text-sm font-black text-white tracking-wide">
              {tr('Matriz de Probabilidad (28 Fichas)', 'Probability Matrix (28 Tiles)')}
            </h3>
            <p className="text-[10px] text-slate-400">
              {tr('Rastreo en vivo de las 28 fichas', 'Live tracking of all 28 tiles')}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-bold">
          <div className="py-1 px-2 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
            {tr('Verdes:', 'Green:')} {unplayedCount} {tr('Libres', 'Free')}
          </div>
          <div className="py-1 px-2 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-500/40">
            {tr('Ámbar:', 'Amber:')} {totalPlayedCount + hands[0].length} {tr('Vistas', 'Seen')}
          </div>
        </div>

        {/* Matrix Heat Grid */}
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/[0.06] space-y-1">
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px] text-slate-500 pb-1 border-b border-white/5">
            {[0, 1, 2, 3, 4, 5, 6].map((num) => (
              <span key={num}>:{num}</span>
            ))}
          </div>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="grid grid-cols-7 gap-1">
              {[0, 1, 2, 3, 4, 5, 6].map((j) => {
                if (j < i) return <div key={j} className="h-5 rounded bg-transparent opacity-0" />;
                const key = `${i}-${j}`;
                const isOnBoard = playedTileKeys.has(key);
                const isInHand = handTileKeys.has(key);
                return (
                  <div
                    key={j}
                    title={`[${i}:${j}] ${
                      isOnBoard
                        ? tr('En Mesa', 'On Board')
                        : isInHand
                        ? tr('En Tu Mano', 'In Your Hand')
                        : tr('Oculta / Por Salir', 'Unplayed / Hidden')
                    }`}
                    className={`h-5 rounded flex items-center justify-center font-mono text-[9px] font-black transition-all ${
                      isInHand
                        ? 'bg-amber-400 text-slate-950 ring-1 ring-amber-300 shadow-sm'
                        : isOnBoard
                        ? 'bg-amber-900/60 text-amber-300/80 border border-amber-500/30'
                        : 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/40 shadow-[0_0_6px_rgba(16,185,129,0.2)]'
                    }`}
                  >
                    {i}:{j}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Card Counting Metrics */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-white/[0.06] space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-300">
            <span>{tr('Conteo de Fichas (Libres):', 'Tile Count (Unplayed):')}</span>
            <span className="font-mono font-bold text-white">{unplayedCount} / 28</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>{tr('Rastreador Esmeralda:', 'Emerald Tracker:')}</span>
            <span className="font-mono font-bold text-emerald-400">{tr('Activo', 'Active')}</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>{tr('Puntos en Tu Mano:', 'Pips in Your Hand:')}</span>
            <span className="font-mono font-bold text-amber-400">{hands[0].reduce((s, [a, b]) => s + a + b, 0)} pts</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
            <div
              className="bg-gradient-to-r from-emerald-400 to-amber-400 h-full transition-all duration-300"
              style={{ width: `${Math.round(((totalPlayedCount + hands[0].length) / 28) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
    </div>
  );
};
