import { SCENARIOS } from '../data/scenarios';
import { PuzzleScenario } from '../types/domino';
import { Language } from './LanguageContext';

interface ScenarioTranslation {
  title: string;
  chapter: string;
  situation: string;
  notes: string[];
  knownPassesPlayers?: Record<string, string>;
  question: string;
  options: Record<string, { tacticalPrinciple: string; explanation: string }>;
  tacticalTip: string;
}

const PLAYER_EN_MAP: Record<string, string> = {
  'Tú': 'You',
  'Compañero': 'Partner',
  'Rival Derecha': 'Right Rival',
  'Rival Izquierda': 'Left Rival',
};

const SCENARIO_EN_TRANSLATIONS: Record<string, ScenarioTranslation> = {
  'salida-respaldo': {
    title: '1. The Optimal Lead: Supported Double (Open Lead)',
    chapter: 'Chapter 1: Philosophy of the Opening Lead',
    situation:
      'We are in the second hand of the match (Score 25 - 0, so you have an "Open Lead" and are not forced to lead [6:6] like in hand #1 at 0-0). You look at your 7 tiles and see Double Six [6:6], but it is your only six. At the same time, you hold four fives: [5:5], [5:4], [5:2], and [5:0], plus [3:2] and [1:0]. Which tile should you lead?',
    notes: [
      'Dominican Exception: Only on Hand #1 of the match (0-0) is leading [6:6] mandatory. On subsequent hands, any tile may be led.',
      'Your highest double [6:6] is naked (singleton / "ahorcado").',
      'You hold a monopoly of 4 fives, backed by the [5:5].',
    ],
    question: 'With an open lead (hand #2 onward), which tile should you play first and why?',
    options: {
      'opt-66': {
        tacticalPrinciple: 'Open Lead Mistake: "Wasting an unsupported high double"',
        explanation:
          'Careful! On Hand #1 (0-0), Dominican rules do force you to lead [6:6]. But on an open lead (hand #2 onward), leading [6:6] alone with no other sixes hands table control directly to your opponents.',
      },
      'opt-55': {
        tacticalPrinciple: 'Monopoly Rule with Supported Double',
        explanation:
          'Excellent! On an open lead, "the lead commands the table." Leading [5:5] while holding 4 fives leaves only 3 fives split among the other 3 players. You own the suit and force opponents to spend their fives at a disadvantage.',
      },
      'opt-54': {
        tacticalPrinciple: 'Unnecessary mixed lead while holding the double',
        explanation:
          'Holding [5:5] with 3 backups, leading mixed [5:4] is a waste: you let an opponent block your double five or punish the suit before you establish your hand.',
      },
    },
    tacticalTip:
      'In Dominican dominoes, [6:6] is only mandatory on the very first hand of the match (0-0). From hand #2 onward (open lead), never lead a naked high double when you have a long suit backed by its double.',
  },
  'respeto-salida': {
    title: '2. Sacred Respect for Your Partner’s Lead',
    chapter: 'Chapter 2: The Partnership & Language of Tiles',
    situation:
      'Your partner (across from you) led [4:4] (their dominant suit). Counter-clockwise to your left, Left Rival played [4:1]. The open ends on the table are Left End [4] and Right End [1]. Your hand holds 7 tiles: [4:3], [1:6], [1:5], [3:2], [6:0], [3:0], [2:0]. How do you answer?',
    notes: [
      'Your partner is the leader and established fours with [4:4].',
      'Left Rival tried to kill the 4 by playing [4:1].',
      'Open board ends: Left End (4) and Right End (1).',
    ],
    question: 'Which end do you play on, and with which tile?',
    options: {
      'opt-43': {
        tacticalPrinciple: 'Killing your partner’s opening suit',
        explanation:
          'Forbidden! Playing [4:3] on the Left End (4) blocks your own partner’s opening suit ("betraying the lead"). You shut down your partner’s open door.',
      },
      'opt-16': {
        tacticalPrinciple: 'Golden Rule: Punish the rival and protect your partner’s end',
        explanation:
          'Master play! Play [1:6] on the Right End (1), killing Left Rival’s 1 while leaving your partner’s Left End (4) untouched so they can hammer fours on their next turn.',
      },
      'opt-15': {
        tacticalPrinciple: 'Punish opponent suit while keeping partner’s lead alive',
        explanation:
          'Also correct! Playing [1:5] on the Right End (1) keeps your partner’s Left End (4) open and active.',
      },
    },
    tacticalTip:
      'The leader’s partner never improvises on the first round: punish the opponent’s tile and protect the door your partner opened.',
  },
  'estrangulacion-derecha': {
    title: '3. Strangling the Right-Hand Rival',
    chapter: 'Chapter 3: Defensive Tactics & Cutting Suits',
    situation:
      'Your Right Rival receives your play (they act immediately after you). They have shown strength in threes and want to dominate that suit. Two ends are open: [3] and [2]. Your hand is: [3:2], [2:6], [6:4], [0:0]. You hold the bridge tile [3:2] connecting both ends. What is your decision?',
    notes: [
      'Right Rival led [3:3], asserting threes as their dominant suit.',
      'Right Rival holds no sixes (passed when you opened 6 on move #4).',
      'Playing on the Right End (2) leaves the 3 alive and hands the table to Right Rival.',
      'Open board ends: Left End (3) and Right End (2).',
    ],
    question: 'Which end should you play to neutralize Right Rival?',
    options: {
      'opt-26': {
        tacticalPrinciple: 'Leaving the rival’s dominant suit alive',
        explanation:
          'Playing [2:6] on the Right End (2) leaves the Left End (3) wide open, letting Right Rival keep attacking next turn and hurting your partner.',
      },
      'opt-32-on-right-2': {
        tacticalPrinciple: 'Squaring to the rival’s dominant suit (Fatal Error)',
        explanation:
          'Playing [3:2] on the Right End (2) kills the 2 and leaves 3s on BOTH ends! You just served Right Rival their best suit on a silver platter to dump or block.',
      },
      'opt-32-on-3-then-6': {
        tacticalPrinciple: 'Strangulation: Kill Right Rival’s suit',
        explanation:
          'Spot on! Play [3:2] on the Left End (3) to cut off Right Rival’s 3. You strip their initiative and steer the table onto suits they do not control.',
      },
    },
    tacticalTip:
      'Cut off the air of the player to your right: suffocate their preferred suit immediately. Every turn you leave their suit open gives points to their pair.',
  },
  'ciencia-tranque': {
    title: '4. The Science of the Tranque (Pip Arithmetic)',
    chapter: 'Chapter 4: Blocking (Tranque) & Surgical Closing',
    situation:
      'Few tiles remain in each player’s hand. The open ends on the table are Left End [2] and Right End [1]. On your turn you hold only 2 lightweight tiles: [2:1] (3 pts) and [1:0] (1 pt), totaling just 4 points. Both opponents have played heavy tiles and previously passed on ones. If you play [2:1] on the Left End (2), you square and lock the board to ones with just 1 point left in your hand. How do you proceed?',
    notes: [
      'Right Rival passed on ones.',
      'Left Rival passed on ones.',
      'Your hand totals only 4 points: [2:1] (3 pts) and [1:0] (1 pt). Playing [2:1] leaves you with 1 single point ([1:0]).',
      'Open board ends: Left End (2) and Right End (1).',
    ],
    question: 'Playing [2:1] on the Left End (2) leaves ones on both ends and locks the board (Tranque). Should you lock it?',
    options: {
      'opt-trancar': {
        tacticalPrinciple: 'Guaranteed Mathematical Tranque',
        explanation:
          'Masterful! You play [2:1] on the Left End (2), locking both ends to ones with just 1 pip ([1:0]) in hand. Since both opponents already passed on ones, victory in the pip count is guaranteed.',
      },
      'opt-esperar': {
        tacticalPrinciple: 'Throwing away a guaranteed win',
        explanation:
          'Playing [1:0] on the Right End (1) instead of locking when you hold 1 pip and opponents have no ones is a grave error: you open 0 and let them unload heavy tiles.',
      },
    },
    tacticalTip:
      'A tranque is not luck—it is basic arithmetic. When your remaining pip weight is minimal and opponents hold dead suits, locking the board is a clean execution.',
  },
  'deduccion-doble-oculto': {
    title: '5. Deducing the Hidden Double via Passes',
    chapter: 'Chapter 5: Advanced Reading & Dynamic Counting',
    situation:
      'Four of the seven 4s have already hit the table: [4:2], [1:4], [5:4], and [4:3]. You hold 2 more fours in hand: [4:6] and [4:0] (6 fours accounted for). The sole missing four is Double Four [4:4]. In prior rounds, both Right Rival and Left Rival passed on 4. Who definitely holds [4:4] and how must you play?',
    notes: [
      '4 fours on board ([4:2], [1:4], [5:4], [4:3]) + 2 in your hand ([4:6], [4:0]) = 6 fours located.',
      'Only 1 four remains unaccounted for: [4:4].',
      'Both opponents already passed on fours.',
      'Open board ends: Left End (6) and Right End (3).',
    ],
    question: 'Who holds [4:4] and which end must you play on?',
    options: {
      'opt-play-46-free-partner': {
        tacticalPrinciple: 'Freeing your partner’s double through absolute deduction',
        explanation:
          'Perfect deduction! Since both rivals passed on 4 and you hold [4:6] and [4:0], [4:4] is 100% in your partner’s hand. Playing [4:6] on the Left End (6) opens the 4 so your partner can drop [4:4] and take control.',
      },
      'opt-play-30': {
        tacticalPrinciple: 'Leaving your partner’s double stranded',
        explanation:
          'Playing [3:0] on the Right End (3) leaves your partner trapped ("ahorcado") with [4:4] unable to get down.',
      },
    },
    tacticalTip:
      'There are no invisible tiles in dominoes. A player who counts knows exactly what tile their partner holds before it ever touches the felt.',
  },
  'falso-tranque-peligro': {
    title: '6. The False Tranque: Danger of a Heavy Lock',
    chapter: 'Chapter 6: Fatal Endgame Mistakes',
    situation:
      'The match is razor-close. Two ends are open: Left End (6) and Right End (5). You hold [6:5] and [6:4]. If you play [6:5] on the Right End (5), you square both ends to sixes and lock the table. But your tiles weigh 11 ([6:5]) and 10 ([6:4]) = 21 points. You do not know your partner’s exact hand, and opponents have been shedding light tiles (blanks, ones, twos). Do you lock the board?',
    notes: [
      'Your hand is dangerously heavy: 21 points total (leaving 10 pts on [6:4]).',
      'Opponents have been dumping low-pip tiles ([1:1], [0:1], [2:3]).',
      'Locking now risks losing the count with 10 points against Right Rival.',
      'Open board ends: Left End (6) and Right End (5).',
    ],
    question: 'Which tile should you play and on which end?',
    options: {
      'opt-trancar-desesperado': {
        tacticalPrinciple: 'Heavy-Lock Suicide',
        explanation:
          'Disaster! Playing [6:5] on the Right End (5) to lock while carrying heavy sixes hands the round directly to the opponents. Your pair will lose the count.',
      },
      'opt-abrir-descarga': {
        tacticalPrinciple: 'Shedding weight and keeping play flowing',
        explanation:
          'Correct! Play [6:4] on the Left End (6), switching the end to 4. You shed heavy weight without forcing a suicidal lock.',
      },
    },
    tacticalTip:
      'Whoever locks with heavy pips hangs themselves with their own rope. The tranque is a weapon for lightweight hands, not brick-heavy sixes.',
  },
  'acostar-doble-primero': {
    title: '7. Drop the Double First, Then Run the Mixed Tile',
    chapter: 'Chapter 7: Managing Doubles',
    situation:
      'Your partner (across) led [4:4]. Left Rival played [4:6], you answered [6:1], Right Rival played [1:3], your partner opened [2] on the right with [3:2], and Left Rival just passed. Open ends are Left End [4] and Right End [2]. You hold only two twos: double [2:2] and [2:5], plus [5:0], [3:0], [1:0], and [0:0]. How do you play on Right End (2)?',
    notes: [
      'You have only one companion ([2:5]) for your double [2:2].',
      'Left Rival just passed on both 4 and 2.',
      'Open board ends: Left End (4) and Right End (2).',
    ],
    question: 'Do you play the mixed tile [2:5] first or drop the double [2:2]?',
    options: {
      'opt-acostar-22': {
        tacticalPrinciple: 'Golden Law: Lay down the double first, then run the bridge',
        explanation:
          'Exact! With only one backup for a double, drop [2:2] the instant the suit opens. You shed a dangerous double, keep the end on 2, and keep [2:5] as your control key.',
      },
      'opt-correr-25': {
        tacticalPrinciple: 'Classic error: Closing your own door and stranding the double',
        explanation:
          'Mortal danger! Playing [2:5] first while holding only two twos closes your own 2 and traps [2:2] unsupported ("ahorcado") at the mercy of others reopening twos.',
      },
    },
    tacticalTip:
      'With a single companion, never hold back the double: "lay down the double first, then run the mixed tile."',
  },
  'ficha-puente-llave': {
    title: '8. Power of the Bridge Tile (Squaring to a Pass)',
    chapter: 'Chapter 8: Squaring the Ends & Key Tiles',
    situation:
      'You led [5:5] and forced Right Rival to pass on fives. Your partner played [5:4] and Left Rival played [4:2]. Open ends are now Left End [5] and Right End [2]. You hold Bridge Tile [5:2] connecting both ends, plus [5:1], [5:0], [3:1], [3:0], and [1:0]. What do you play?',
    notes: [
      'Right Rival already passed on fives in round one.',
      'You hold bridge tile [5:2] connecting both open ends (5 and 2).',
      'You also hold two more fives ([5:1] and [5:0]).',
      'Open board ends: Left End (5) and Right End (2).',
    ],
    question: 'How do you use Bridge Tile [5:2] to control the table?',
    options: {
      'opt-puente-derecha-2': {
        tacticalPrinciple: 'Using the Bridge Tile to square onto Right Rival’s pass',
        explanation:
          'Crushing play! Play [5:2] on the Right End (2), killing the 2 and squaring both ends to fives (5 and 5). Because Right Rival already passed on 5, they pass again automatically, freeing your partner while you retain [5:1] and [5:0].',
      },
      'opt-puente-izquierda-5': {
        tacticalPrinciple: 'Squaring to the wrong suit and killing your own strength',
        explanation:
          'Grave mistake! Playing [5:2] on the Left End (5) kills your own 5 and squares the board to twos (2 and 2), letting Right Rival off the hook while you hold zero twos.',
      },
      'opt-abrir-51': {
        tacticalPrinciple: 'Wasting the square and leaving two doors open for the rival',
        explanation:
          'Playing [5:1] on the Left End (5) takes 5 off the board and leaves 1 and 2 wide open for Right Rival to play comfortably.',
      },
    },
    tacticalTip:
      'Whoever holds the Bridge Tile steers the hand: always use it to square onto the suit where Right Rival passed or where your side holds the majority.',
  },
  'cambio-de-mando': {
    title: '9. Change of Command (Long-Suit Override Exception)',
    chapter: 'Chapter 2: The Partnership & Language of Tiles',
    situation:
      'We are on Hand #1 of the match (0 - 0). By mandatory Dominican rules, your partner (across) had to open with Double Six [6:6]. Left Rival played [6:4], leaving Left End [6] and Right End [4] open. You look at your 7 tiles and hold a monster 6-three hand: [6:3], [3:3], [3:5], [3:2], [3:1], [3:0], plus [4:1]. What do you do?',
    notes: [
      'On Hand #1 (0-0), your partner’s [6:6] was a mandatory rule-based lead, not a free choice.',
      'You own 6 of all 7 threes in the set (including [3:3]).',
      'Open board ends: Left End (6) and Right End (4).',
    ],
    question: 'Do you obey your partner’s mandatory 6 or execute a Change of Command?',
    options: {
      'opt-cambio-mando-63': {
        tacticalPrinciple: 'Long-Suit Exception: Asserting a 6-tile monopoly',
        explanation:
          'Master decision! [6:6] at 0-0 was forced. Since you hold 6 of the 7 threes in the deck, apply the Long-Suit Exception: play [6:3] on the Left End (6) to unleash your unbeatable suit and take command of the hand.',
      },
      'opt-respeto-ciego-41': {
        tacticalPrinciple: 'Blind loyalty trapping a winning 6-tile monopoly',
        explanation:
          'Playing [4:1] on the Right End (4) leaves the board at 6 and 1 (suits you cannot sustain) and locks your 6 threes in your hand unopened.',
      },
    },
    tacticalTip:
      'Your partner’s lead is sacred, with one rare exception: when it was forced (0-0) or when you hold 5 or 6 tiles of another suit backed by its double.',
  },
  'lectura-la-pensada': {
    title: '10. Table Psychology: Reading "The Hesitation" (La Pensada)',
    chapter: 'Chapter 9: Tempo Reading & Inference',
    situation:
      'Your partner led [0:0]. On play #3 you opened 5 with [5:0] on the left, and Right Rival ignored the 5 (playing [3:2] on the right). With ends [5] and [2], your partner paused to think for 12 seconds before playing [4:5] on the left. Left Rival snapped down [2:1] on the right without hesitation. Open ends are now Left End [4] and Right End [1]. Your hand is: [1:5], [4:3], and [1:6]. What do you play?',
    notes: [
      '"A forced tile takes zero thought": Your partner paused 12 seconds before playing [4:5] on the 5.',
      'That pause signals your partner still holds at least one more 5 (likely [5:5]) and debated which five to play.',
      'Left Rival snapped [2:1] instantly (forced play with no alternative).',
      'Open board ends: Left End (4) and Right End (1).',
    ],
    question: 'How do you capitalize on the information in your partner’s hesitation?',
    options: {
      'opt-devolver-15': {
        tacticalPrinciple: 'Reading "La Pensada": Reopening the suit where partner hesitated',
        explanation:
          'Master read! A player with one legal tile plays instantly. By pausing on the 5 before playing [4:5], your partner signaled extra fives in hand (likely [5:5]). Play [1:5] on the Right End (1) to reopen fives for them.',
      },
      'opt-matar-43': {
        tacticalPrinciple: 'Killing partner’s 4 and ignoring their tempo signal',
        explanation:
          'Playing [4:3] on the Left End (4) kills the 4 your partner just placed and fails to return the 5 they kept behind.',
      },
      'opt-abrir-16': {
        tacticalPrinciple: 'Opening an unknown suit instead of returning partner’s signaled suit',
        explanation:
          'Playing [1:6] opens sixes blindly instead of feeding back the 5 your partner clearly protected.',
      },
    },
    tacticalTip:
      'High-level dominoes is played with your eyes and ears: snap plays mean a forced single option; long pauses reveal multiple choices in that suit.',
  },
  'defensa-ley-de-una': {
    title: '11. Emergency: Opponent on 1 Tile ("A Ley de Una")',
    chapter: 'Chapter 10: Extreme Endgame Defense',
    situation:
      'Table alarm! Right Rival (acting right after you) just dropped down to 1 single tile ("a ley de una" to domino). Open ends are Left End [4] and Right End [2]. Four 4s are already on the felt ([4:4], [1:4], [4:3], [4:0]), and you hold the other 3 remaining fours in the deck: [4:2], [4:5], and [4:6], plus [2:5]. How do you guarantee 100% that they cannot go out?',
    notes: [
      'Right Rival has 1 tile left (if playable, they go out immediately).',
      '4 fours on board + 3 fours in your hand ([4:2], [4:5], [4:6]) = all 7 fours accounted for!',
      'Nobody else at the table holds a single four.',
      'Open board ends: Left End (4) and Right End (2).',
    ],
    question: 'Which tile and end do you play to lock out Right Rival?',
    options: {
      'opt-cuadrar-a-4-muerto': {
        tacticalPrinciple: 'Squaring to a dead suit against a 1-tile opponent',
        explanation:
          'Surgical lockdown! Playing [4:2] on the Right End (2) kills the 2 and squares both ends to fours (4 and 4). Since you hold the final remaining fours ([4:5] and [4:6]), Right Rival has 0% chance of holding a 4 and is forced to pass with 1 tile!',
      },
      'opt-cuadrar-a-2-vivo': {
        tacticalPrinciple: 'Fatal error: Squaring to a live suit while holding the dead suit',
        explanation:
          'Playing [4:2] on the Left End (4) squares the board to twos (2 and 2), where 4 twos are still unaccounted for—giving Right Rival a wide-open exit.',
      },
      'opt-dejar-descuadrado-25': {
        tacticalPrinciple: 'Leaving two different ends open to a 1-tile opponent',
        explanation:
          'Playing [2:5] on the Right End (2) opens 5, which could be the exact last tile sitting in Right Rival’s hand.',
      },
    },
    tacticalTip:
      'Against an opponent on 1 tile, never leave two different suits open: always square the table to the deadest suit or the one you completely control.',
  },
  'descuadre-defensivo': {
    title: '12. Defensive Unsquaring: Giving Your Partner Breathing Room',
    chapter: 'Chapter 8: Squaring the Ends & Key Tiles',
    situation:
      'Your partner (across) is struggling in this hand: they already passed on 6 and 5 in earlier turns. Open ends are Left End [3] and Right End [1]. In hand you hold bridge tile [3:1], plus [3:4] and [1:6]. You want to maximize the chance your partner can play this round without passing again. What do you play?',
    notes: [
      'Your partner already passed on 6 and 5.',
      'When your partner is short on suits, squaring the table cuts their chances in half.',
      'Open board ends: Left End (3) and Right End (1).',
    ],
    question: 'Do you square the table or keep it split across fresh suits?',
    options: {
      'opt-descuadrar-34': {
        tacticalPrinciple: 'Defensive Unsquaring: Opening two fresh doors for partner',
        explanation:
          'Great teamwork! Playing [3:4] on the Left End (3) keeps the board split onto two fresh suits (4 and 1) that your partner has not passed on, doubling their odds of staying alive.',
      },
      'opt-cuadrar-31': {
        tacticalPrinciple: 'Choking your own partner by needlessly squaring',
        explanation:
          'If you play bridge [3:1], you square both ends to ones (1 and 1). When your partner is already struggling with passes, locking both ends to one suit spikes the risk of another pass.',
      },
      'opt-repetir-pase-16': {
        tacticalPrinciple: 'Placing a suit where your own partner already passed',
        explanation:
          'Forbidden! Your partner already passed on 6. Playing [1:6] on the Right End (1) puts a dead suit right back onto their table.',
      },
    },
    tacticalTip:
      'When your pair dominates, square to choke the opponent; when your partner suffers passes, un-square and open fresh suits to give them oxygen.',
  },
};

export function getScenarios(lang: Language): PuzzleScenario[] {
  if (lang === 'es') {
    return SCENARIOS;
  }

  return SCENARIOS.map((scenario) => {
    const t = SCENARIO_EN_TRANSLATIONS[scenario.id];
    if (!t) return scenario;

    return {
      ...scenario,
      title: t.title,
      chapter: t.chapter,
      situation: t.situation,
      context: {
        ...scenario.context,
        knownPasses: scenario.context.knownPasses.map((kp) => ({
          ...kp,
          player: PLAYER_EN_MAP[kp.player] ?? kp.player,
        })),
        notes: t.notes,
      },
      question: t.question,
      options: scenario.options.map((opt) => {
        const optEn = t.options[opt.id];
        return optEn
          ? {
              ...opt,
              tacticalPrinciple: optEn.tacticalPrinciple,
              explanation: optEn.explanation,
            }
          : opt;
      }),
      tacticalTip: t.tacticalTip,
    };
  });
}
