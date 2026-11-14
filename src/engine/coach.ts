import { Tile } from '../types/domino';

export type CoachLanguage = 'es' | 'en';

export interface PlayableMove {
  tile: Tile;
  end: 'left' | 'right' | 'both' | 'any';
}

export interface CoachOption {
  tile: Tile;
  end: 'left' | 'right' | 'any';
  label: string;
  total: number;
  breakdown: { label: string; pts: number }[];
}

export interface CoachEvaluation {
  options: CoachOption[];
  advice: string;
}

const sameTile = (a: Tile, b: Tile): boolean =>
  (a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0]);

/**
 * Computes all legal plays for a given hand against the current open board ends.
 */
export function getPlayableMoves(
  hand: Tile[],
  ends: [number, number] | null,
  handNumber: number,
  ruleFirstHandSalida: '66' | '00'
): PlayableMove[] {
  if (!ends) {
    if (handNumber === 1) {
      const targetDouble = ruleFirstHandSalida === '00' ? 0 : 6;
      const hasDouble = hand.find(([a, b]) => a === targetDouble && b === targetDouble);
      if (hasDouble) {
        return [{ tile: hasDouble, end: 'any' }];
      }
    }
    return hand.map((t) => ({ tile: t, end: 'any' }));
  }

  const moves: PlayableMove[] = [];
  hand.forEach((tile) => {
    const matchesLeft = tile[0] === ends[0] || tile[1] === ends[0];
    const matchesRight = tile[0] === ends[1] || tile[1] === ends[1];

    if (matchesLeft && matchesRight && ends[0] !== ends[1]) {
      moves.push({ tile, end: 'both' });
    } else if (matchesLeft) {
      moves.push({ tile, end: 'left' });
    } else if (matchesRight) {
      moves.push({ tile, end: 'right' });
    }
  });
  return moves;
}

/**
 * Evaluates and ranks legal moves for any seat (0..3) using Dominican 2v2 heuristics.
 */
export function evaluateMovesForSeat(params: {
  seatIdx: number;
  hands: Tile[][];
  boardEnds: [number, number] | null;
  passedSuits: number[][];
  handNumber: number;
  ruleFirstHandSalida: '66' | '00';
  salidorIndex: number;
  boardLength: number;
  salidaValues?: number[];
  lang?: CoachLanguage;
}): CoachEvaluation {
  const {
    seatIdx,
    hands,
    boardEnds,
    passedSuits,
    handNumber,
    ruleFirstHandSalida,
    salidorIndex,
    boardLength,
    salidaValues = [],
    lang = 'es',
  } = params;

  const myHand = hands[seatIdx] || [];
  if (myHand.length === 0) {
    return { options: [], advice: '' };
  }

  const partnerSeat = (seatIdx + 2) % 4;
  const nextRivalSeat = (seatIdx + 1) % 4;
  const prevRivalSeat = (seatIdx + 3) % 4;

  const playable = getPlayableMoves(myHand, boardEnds, handNumber, ruleFirstHandSalida);

  if (!boardEnds) {
    if (handNumber === 1) {
      const options: CoachOption[] =
        playable.length > 0
          ? [
              {
                tile: playable[0].tile,
                end: 'any',
                label:
                  lang === 'en'
                    ? `[${playable[0].tile[0]}:${playable[0].tile[1]}] Mandatory Hand #1 Lead`
                    : `[${playable[0].tile[0]}:${playable[0].tile[1]}] Salida obligatoria Mano #1`,
                total: 10,
                breakdown: [
                  {
                    label:
                      lang === 'en'
                        ? 'Official mandatory opening (0–0)'
                        : 'Apertura oficial obligatoria (0–0)',
                    pts: 10,
                  },
                ],
              },
            ]
          : [];

      const mandatoryLabel =
        ruleFirstHandSalida === '00'
          ? lang === 'en'
            ? 'Double Blank [0:0] ("La Chiva")'
            : 'el Doble Blanco [0:0] ("La Chiva")'
          : lang === 'en'
          ? 'Double Six [6:6]'
          : 'el Doble Seis [6:6]';

      const advice =
        lang === 'en'
          ? `🎯 Match Hand #1 (Mandatory Lead): In Dominican dominoes, the opening play at 0–0 must be ${mandatoryLabel}.`
          : `🎯 Mano #1 del Partido (Salida Obligatoria): En el dominó dominicano, la primera jugada de todo el partido (0-0) es obligatoriamente con ${mandatoryLabel}.`;

      return { options, advice };
    }

    const openingRanked = myHand
      .map((t) => {
        const isDouble = t[0] === t[1];
        const suitA = myHand.filter(([a, b]) => a === t[0] || b === t[0]).length;
        const suitB = isDouble ? suitA : myHand.filter(([a, b]) => a === t[1] || b === t[1]).length;
        const maxSuit = Math.max(suitA, suitB);
        const breakdown: { label: string; pts: number }[] = [];
        let score = 0;

        const suitPts = maxSuit * 3;
        score += suitPts;
        breakdown.push({
          label:
            lang === 'en'
              ? `Suit dominance (${maxSuit} tiles)`
              : `Fuerza del número (${maxSuit} fichas)`,
          pts: suitPts,
        });

        if (isDouble) {
          score += 4;
          breakdown.push({
            label: lang === 'en' ? 'Backed double lead' : 'Salida con doble respaldado',
            pts: 4,
          });
        }

        const weightPts = Math.round(((t[0] + t[1]) / 3) * 10) / 10;
        if (weightPts > 0) {
          score += weightPts;
          breakdown.push({
            label: lang === 'en' ? `Offload ${t[0] + t[1]} pips` : `Descarga ${t[0] + t[1]} puntos`,
            pts: weightPts,
          });
        }

        return {
          tile: t,
          end: 'any' as const,
          isDouble,
          maxSuit,
          total: Math.round(score * 10) / 10,
          label:
            lang === 'en'
              ? `[${t[0]}:${t[1]}] Free Opening Lead`
              : `[${t[0]}:${t[1]}] Salida libre`,
          breakdown,
        };
      })
      .sort((x, y) => y.total - x.total);

    const best = openingRanked[0];
    const reason = best.isDouble
      ? lang === 'en'
        ? `You hold ${best.maxSuit} tiles of suit ${best.tile[0]} including its double [${best.tile[0]}:${best.tile[0]}]. On a free opening, leading this double establishes suit control.`
        : `Tienes ${best.maxSuit} fichas del número ${best.tile[0]} incluyendo su doble [${best.tile[0]}:${best.tile[0]}]. En salida libre, salir con este doble impone tu monopolio.`
      : lang === 'en'
      ? `Free opening with your strongest suit (${best.maxSuit} tiles) to dictate the hand.`
      : `Salida libre con tu número más fuerte (${best.maxSuit} fichas) para armar tu juego.`;

    const advice =
      lang === 'en'
        ? `🎯 Free Opening Advice (Hand #${handNumber}): Play [${best.tile[0]}:${best.tile[1]}]. ${reason}`
        : `🎯 Recomendación en Salida Libre (Mano #${handNumber}): Juega [${best.tile[0]}:${best.tile[1]}]. ${reason}`;

    return {
      options: openingRanked.map((o) => ({
        tile: o.tile,
        end: o.end,
        label: o.label,
        total: o.total,
        breakdown: o.breakdown,
      })),
      advice,
    };
  }

  if (playable.length === 0) {
    return {
      options: [],
      advice:
        lang === 'en'
          ? `⚠️ You have no tiles matching [${boardEnds[0]}] or [${boardEnds[1]}]. You must pass.`
          : `⚠️ No tienes fichas compatibles con [${boardEnds[0]}] ni [${boardEnds[1]}]. Debes pasar.`,
    };
  }

  interface InternalOption {
    tile: Tile;
    end: 'left' | 'right';
    newEnd: number;
    otherEnd: number;
    score: number;
    reasons: string[];
    breakdown: { label: string; pts: number }[];
  }

  const options: InternalOption[] = [];
  const pips = (t: Tile) => t[0] + t[1];

  playable.forEach((m) => {
    const sides: ('left' | 'right')[] =
      m.end === 'both' ? ['left', 'right'] : [m.end === 'any' ? 'left' : m.end];

    sides.forEach((side) => {
      const idx = side === 'left' ? 0 : 1;
      const covered = boardEnds[idx];
      const newEnd = m.tile[0] === covered ? m.tile[1] : m.tile[0];
      const otherEnd = boardEnds[1 - idx];
      const rest = myHand.filter((t) => !sameTile(t, m.tile));
      const owned = (n: number) => rest.filter((t) => t[0] === n || t[1] === n).length;

      let score = 0;
      const reasons: string[] = [];
      const breakdown: { label: string; pts: number }[] = [];
      const add = (label: string, pts: number) => {
        score += pts;
        if (pts !== 0) breakdown.push({ label, pts });
      };

      const endsOwned = owned(newEnd) + (newEnd !== otherEnd ? owned(otherEnd) : 0);
      add(
        lang === 'en'
          ? `Held tiles on open ends (${endsOwned})`
          : `Fichas que conservas de las puntas (${endsOwned})`,
        endsOwned * 3
      );

      if (newEnd === otherEnd && owned(newEnd) > 0) {
        add(lang === 'en' ? 'Squares board (same ends)' : 'Cuadra la mesa (puntas iguales)', 4);
        reasons.push(
          lang === 'en'
            ? `squares the board to ${newEnd}s while you still hold ${owned(newEnd)} ${newEnd}(s)`
            : `cuadra la mesa a ${newEnd}s (ambas puntas iguales) y todavía tienes ${owned(newEnd)} ficha(s) de ${newEnd}`
        );
      } else if (owned(newEnd) > 0) {
        reasons.push(
          lang === 'en'
            ? `leaves the end at ${newEnd}, where you still hold ${owned(newEnd)} tile(s)`
            : `deja la punta en ${newEnd}, número del que conservas ${owned(newEnd)} ficha(s)`
        );
      }

      const weightScore = Math.round((pips(m.tile) / 3) * 10) / 10;
      add(
        lang === 'en' ? `Offloads ${pips(m.tile)} pips` : `Descarga ${pips(m.tile)} puntos`,
        weightScore
      );
      if (pips(m.tile) >= 9) {
        reasons.push(lang === 'en' ? 'dumps heavy pips early' : 'descarga una ficha pesada');
      }

      if (m.tile[0] === m.tile[1]) {
        add(lang === 'en' ? 'Clears a double' : 'Te quitas un doble', 3);
        reasons.push(lang === 'en' ? 'clears a double from your hand' : 'te quita un doble de la mano');
      }

      if ((passedSuits[partnerSeat] || []).includes(newEnd)) {
        add(lang === 'en' ? 'Partner passed on this suit' : 'Compañero pasó a ese número', -5);
        reasons.push(
          lang === 'en'
            ? `careful: your partner passed on ${newEnd}s`
            : `ojo: tu compañero pasó a ${newEnd}s`
        );
      }
      if ((passedSuits[nextRivalSeat] || []).includes(newEnd)) {
        add(
          lang === 'en' ? 'Next rival passed on this suit' : 'Rival siguiente pasó a ese número',
          5
        );
        reasons.push(
          lang === 'en'
            ? `the rival playing right after you passed on ${newEnd}s, likely passing again`
            : `el rival que juega después de ti pasó a ${newEnd}s, así que probablemente vuelva a pasar`
        );
      }
      if ((passedSuits[prevRivalSeat] || []).includes(newEnd)) {
        add(
          lang === 'en' ? 'Previous rival passed on this suit' : 'Rival anterior pasó a ese número',
          1
        );
      }

      // Respect partner's Salida in early turns by keeping their opening suit alive on the other end
      if (boardLength <= 8 && salidorIndex === partnerSeat && salidaValues.includes(otherEnd)) {
        add(
          lang === 'en' ? "Respect partner's opening lead" : 'Respeta la salida del compañero',
          2
        );
        reasons.push(
          lang === 'en'
            ? "preserves your partner's opening suit"
            : 'mantiene viva la salida de tu compañero'
        );
      }

      options.push({ tile: m.tile, end: side, newEnd, otherEnd, score, reasons, breakdown });
    });
  });

  options.sort((x, y) => y.score - x.score);

  const mappedOptions: CoachOption[] = options.map((o) => {
    const leftVal = o.end === 'left' ? o.newEnd : o.otherEnd;
    const rightVal = o.end === 'left' ? o.otherEnd : o.newEnd;
    const sideLabel =
      lang === 'en'
        ? o.end === 'left'
          ? 'left'
          : 'right'
        : o.end === 'left'
        ? 'izquierda'
        : 'derecha';
    return {
      tile: o.tile,
      end: o.end,
      label:
        lang === 'en'
          ? `[${o.tile[0]}:${o.tile[1]}] on ${sideLabel} → ends ${leftVal} & ${rightVal}`
          : `[${o.tile[0]}:${o.tile[1]}] por la ${sideLabel} → puntas ${leftVal} y ${rightVal}`,
      total: Math.round(o.score * 10) / 10,
      breakdown: o.breakdown,
    };
  });

  const best = options[0];
  const sideName =
    lang === 'en'
      ? best.end === 'left'
        ? 'left'
        : 'right'
      : best.end === 'left'
      ? 'izquierda'
      : 'derecha';
  const leftEnd = best.end === 'left' ? best.newEnd : best.otherEnd;
  const rightEnd = best.end === 'left' ? best.otherEnd : best.newEnd;
  const coveredPip = boardEnds[best.end === 'left' ? 0 : 1];
  const why =
    best.reasons.length > 0
      ? best.reasons.join('; ')
      : lang === 'en'
      ? 'is the most balanced play'
      : 'es la opción más equilibrada';

  const advice =
    lang === 'en'
      ? `💡 Coach Advice: Play [${best.tile[0]}:${best.tile[1]}] on the ${sideName} end (${coveredPip}). Open ends become ${leftEnd} and ${rightEnd}: ${why}.`
      : `💡 Consejo del Coach: Juega [${best.tile[0]}:${best.tile[1]}] por la punta ${sideName} (${coveredPip}). Las puntas quedarían en ${leftEnd} y ${rightEnd}: ${why}.`;

  return { options: mappedOptions, advice };
}
