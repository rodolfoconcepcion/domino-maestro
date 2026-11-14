import React, { useState } from 'react';
import { BookOpen, Shield, Flame, Target, Compass, Award, CheckCircle, Layers, GitMerge, Key, Clock, AlertOctagon } from 'lucide-react';
import { DominoTile } from './DominoTile';
import { useLanguage } from '../i18n/LanguageContext';

type DoctrineTab =
  | 'salidas'
  | 'pareja'
  | 'corte'
  | 'tranque'
  | 'conteo'
  | 'dobles'
  | 'cuadre'
  | 'puente'
  | 'tiempos'
  | 'defensa1';

export const PrinciplesLibrary: React.FC = () => {
  const { lang, tr } = useLanguage();
  const [activeTab, setActiveTab] = useState<DoctrineTab>('salidas');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-lg">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
          {tr('Compendio Teórico Dominicano', 'Dominican Theoretical Compendium')}
        </span>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          {tr(
            'Doctrina Táctica del Dominó Competitivo (10 Leyes Maestras)',
            'Competitive Dominoes Tactical Doctrine (10 Master Laws)'
          )}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {tr(
            'Las leyes estratégicas, matemáticas y psicológicas que diferencian al jugador casual del maestro de torneo.',
            'Strategic, mathematical, and psychological laws separating casual players from tournament masters.'
          )}
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 sm:gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'salidas', label: tr('1. Teoría de la Salida', '1. Opening Lead Theory'), icon: Compass },
          { id: 'pareja', label: tr('2. Respeto al Salidor', '2. Respect the Leader'), icon: Shield },
          { id: 'corte', label: tr('3. Corte a la Derecha', '3. Cut the Right Rival'), icon: Target },
          { id: 'tranque', label: tr('4. Ciencia del Tranque', '4. Science of the Tranque'), icon: Flame },
          { id: 'conteo', label: tr('5. La Regla de las 7', '5. The Rule of 7'), icon: Award },
          { id: 'dobles', label: tr('6. Uso de los Dobles', '6. Managing Doubles'), icon: Layers },
          { id: 'cuadre', label: tr('7. Cuadre vs Descuadre', '7. Square vs Unsquare'), icon: GitMerge },
          { id: 'puente', label: tr('8. La Ficha Puente', '8. The Bridge Tile'), icon: Key },
          { id: 'tiempos', label: tr('9. «La Pensada»', '9. “La Pensada” (Tempo)'), icon: Clock },
          { id: 'defensa1', label: tr('10. Rival a Ley de Una', '10. Rival on 1 Tile'), icon: AlertOctagon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DoctrineTab)}
              className={`px-2.5 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1.5 sm:gap-2 min-w-0 transition active:scale-95 ${
                isActive
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content based on Active Tab */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          {activeTab === 'salidas' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400" />
                {tr('La Filosofía de la Salida: El Salidor Manda', 'Philosophy of the Lead: The Leader Commands')}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {lang === 'en' ? (
                  <>
                    This guide dismantles the street myth of “leading the highest double just to dump points” on an open lead. In technical dominoes, the opening lead is not for fleeing pips, but for <b>claiming ownership of a suit</b> and dictating the entire hand.
                  </>
                ) : (
                  <>
                    Esta guía desmonta el mito callejero de «salir con el doble más alto para botar puntos» cuando tienes salida libre. En el dominó técnico, la salida no es para huir de los puntos, sino para <b>adueñarse de un número</b> y marcar el destino de la mano.
                  </>
                )}
              </p>

              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-slate-200 space-y-1">
                <span className="font-bold text-amber-400 uppercase tracking-wide block">
                  {tr('Regla Oficial Dominicana: Mano #1 vs. Salida Libre', 'Official Dominican Rule: Hand #1 vs. Open Lead')}
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {lang === 'en' ? (
                    <>
                      • <b>First Hand of Match (0 - 0):</b> Whoever holds <b>Double Six [6:6]</b> must lead it automatically.<br />
                      • <b>Hand #2 onward (Open Lead / “Salida Libre”):</b> Whoever won the previous hand (by going out or winning the lock) leads any tile first. That is where full optimal lead theory applies.
                    </>
                  ) : (
                    <>
                      • <b>Primera Mano del Partido (0 - 0):</b> Sale obligatoriamente el jugador que tenga el <b>Doble Seis [6:6]</b>.<br />
                      • <b>Segunda Mano en adelante (Salida Libre):</b> El jugador que gana la mano anterior (por dominó o por tranque con menos puntos) es siempre quien sale de primero ("el que gana sale"). Ahí aplica toda la teoría de la salida óptima.
                    </>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                    {tr('La Salida Perfecta: Doble Respaldado', 'The Perfect Lead: Supported Double')}
                  </div>
                  <div className="flex gap-2 py-1">
                    <DominoTile top={5} bottom={5} size="sm" />
                    <DominoTile top={5} bottom={4} size="sm" />
                    <DominoTile top={5} bottom={2} size="sm" />
                    <DominoTile top={5} bottom={0} size="sm" />
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">
                    {tr(
                      'Tienes 4 fichas del mismo número incluyendo el doble. Solo quedan 3 cincos en toda la mesa. Tienes el monopolio garantizado.',
                      'You hold 4 tiles of the same suit including the double. Only 3 fives remain across all other players—monopoly secured.'
                    )}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/30 space-y-2">
                  <div className="text-xs font-bold text-rose-400 uppercase tracking-wide">
                    {tr('El Error Fatal: El Doble Ahorcado', 'Fatal Error: Naked High Double')}
                  </div>
                  <div className="flex gap-2 py-1">
                    <DominoTile top={6} bottom={6} size="sm" />
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">
                    {tr(
                      'Salir con [6:6] sin ningún otro seis en la mano es regalar el control. Quien tenga 3 seises asfixiará tu mesa inmediatamente.',
                      'Leading [6:6] with zero backup sixes hands over table control. Whoever holds 3 sixes will strangle your hand at once.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pareja' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                {tr('El Respeto Sagrado al Salidor', 'Sacred Respect for the Leader')}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {tr(
                  'Una causa frecuente de perder manos es que el compañero del salidor mata la salida de su propia pareja en lugar de castigar al rival.',
                  'A frequent reason pairs lose hands is when the leader’s partner kills their own partner’s suit instead of punishing the opponent.'
                )}
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300 leading-relaxed">
                    {lang === 'en' ? (
                      <>
                        <b className="text-white">Two-Round Rule:</b> During the first two passes around the table, the leader’s partner must keep the opening suit open and consistently attack the suit played by the left-hand rival (who acted right after the leader).
                      </>
                    ) : (
                      <>
                        <b className="text-white">Regla de las Dos Vueltas:</b> Durante las primeras dos rondas de juego, el compañero debe mantener abierta la punta de la salida y matar siempre la ficha que jugó el rival de la izquierda (quien jugó inmediatamente después del salidor).
                      </>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300 leading-relaxed">
                    {lang === 'en' ? (
                      <>
                        <b className="text-white">Sole Exception (The Dominant Long Suit):</b> Switching off your partner’s lead is only justified when you hold 5 or 6 tiles of another suit, making you the true commander of the hand.
                      </>
                    ) : (
                      <>
                        <b className="text-white">Excepción Única (La Mano Mayor):</b> Solo se permite cambiar el número de la salida si tú tienes 5 o 6 fichas de otro número, lo que te convierte a ti en el verdadero dueño de la mano.
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'corte' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                {tr('El Corte y la Estrangulación del Rival de la Derecha', 'Cutting Suits & Strangling the Right-Hand Rival')}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {tr(
                  'Tu objetivo primordial en defensa no es ganar individualmente, sino neutralizar al jugador que recibe tu juego inmediatamente después de ti (el rival de tu derecha).',
                  'Your prime defensive objective is not individual heroics, but neutralizing the player sitting immediately counter-clockwise to your right.'
                )}
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1">
                  <span className="font-bold text-amber-400">{tr('Nunca le regales su número fuerte:', 'Never feed their dominant suit:')}</span>
                  <p>
                    {tr(
                      'Si el jugador de la derecha inició con treses, cada vez que tengas oportunidad de taparle el tres, debes hacerlo sin titubear.',
                      'If the player to your right opened with threes, every time you get a chance to cap the 3, close it without hesitation.'
                    )}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1">
                  <span className="font-bold text-amber-400">{tr('Producir el "Paso":', 'Forcing the Pass:')}</span>
                  <p>
                    {tr(
                      'Provocar que el rival de la derecha pase rompe la simetría de la partida y le permite a tu equipo colocar dos fichas seguidas en mesa.',
                      'Making your right-hand rival pass breaks table symmetry and allows your partnership to place two consecutive plays onto the felt.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tranque' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                {tr('La Ciencia del Tranque (Cálculo Aritmético)', 'The Science of the Tranque (Pip Arithmetic)')}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {tr(
                  'El tranque es la jugada matemática por excelencia. En el juego técnico, jamás se tranca por azar ni por salir del paso.',
                  'The board lock (tranque) is pure mathematical execution. In technical play, you never lock by guesswork or desperation.'
                )}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-600/50 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase">{tr('Tranque Seguro', 'Safe Lock (Tranque)')}</span>
                  <ul className="text-xs text-slate-300 space-y-1">
                    <li>• {tr('Tienes menos de 6 puntos en mano.', 'You hold under 6 pips remaining in hand.')}</li>
                    <li>• {tr('Los contrarios pasaron a ese número.', 'Opponents already passed on that suit.')}</li>
                    <li>• {tr('Aseguras la victoria por conteo neto.', 'You lock in a guaranteed count victory.')}</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-600/50 space-y-2">
                  <span className="text-xs font-bold text-rose-400 uppercase">{tr('Tranque Prohibido', 'Forbidden Lock')}</span>
                  <ul className="text-xs text-slate-300 space-y-1">
                    <li>• {tr('Tienes fichas pesadas (seises, cincos, cuatros).', 'You carry heavy tiles (sixes, fives, fours).')}</li>
                    <li>• {tr('Tu mano suma más de 12 puntos.', 'Your remaining hand exceeds 12 points.')}</li>
                    <li>• {tr('Los rivales vienen descargando blancas y unos.', 'Rivals have been shedding blanks and ones.')}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'conteo' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                {tr('La Regla de las 7 Fichas y la Memoria Dinámica', 'The Rule of 7 Tiles & Dynamic Counting')}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {tr(
                  'Cada uno de los 7 números (0, 1, 2, 3, 4, 5, 6) cuenta con exactamente 7 fichas en el juego de dominó. Un jugador de élite lleva el inventario mental en todo momento.',
                  'Each of the 7 suits (0, 1, 2, 3, 4, 5, 6) has exactly 7 tiles in a double-six set. Elite players track the running inventory at every turn.'
                )}
              </p>

              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 text-xs text-slate-300 space-y-2">
                <span className="font-bold text-amber-400">{tr('La Fórmula de Deducción Absoluta:', 'Absolute Deduction Formula:')}</span>
                <p className="font-mono bg-slate-900 p-2.5 rounded-lg text-emerald-400 border border-slate-800">
                  {tr(
                    '7 - (Fichas en tu Mano + Fichas en Mesa) = Fichas Repartidas entre 3 Jugadores',
                    '7 - (Tiles in Your Hand + Tiles on Board) = Tiles Held Across Other 3 Players'
                  )}
                </p>
                <p className="text-slate-400">
                  {lang === 'en' ? (
                    <>
                      If you already see 6 tiles of a suit (board + your hand) and both opponents passed on that suit, <b className="text-slate-200">the missing 7th tile is 100% guaranteed to sit in your partner’s hand</b>.
                    </>
                  ) : (
                    <>
                      Si ya ves 6 fichas de un número (entre la mesa y tu mano) y ambos rivales pasaron a ese número, <b className="text-slate-200">la ficha restante está 100% garantizada en la mano de tu compañero</b>.
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'dobles' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                {tr(
                  'Administración de Dobles: «Primero se Acuesta y Después se Corre»',
                  'Managing Doubles: “Drop the Double First, Then Run”'
                )}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {tr(
                  'Un doble solo tiene una puerta de entrada. Retener un doble en la mano cuando solo tienes un acompañante (una sola ficha mixta de ese número) es una de las causas más frecuentes de quedarse con el doble «ahorcado».',
                  'A double has only one matching value. Holding back a double when you carry only one companion tile is the quickest way to get stranded ("ahorcado") with dead pips.'
                )}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-600/50 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase">
                    {tr('Regla General (Con 1 o 2 acompañantes)', 'General Rule (With 1 or 2 Backups)')}
                  </span>
                  <div className="flex gap-2 py-1">
                    <DominoTile top={2} bottom={2} size="sm" />
                    <DominoTile top={2} bottom={5} size="sm" />
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lang === 'en' ? (
                      <>
                        As soon as suit 2 opens on the table, <b>drop [2:2] first</b> and retain [2:5] as your exit key for the next turn. Never play [2:5] first and seal your own door.
                      </>
                    ) : (
                      <>
                        En cuanto se abra el número 2 en la mesa, <b>acuesta primero el [2:2]</b> y conserva el [2:5] como llave de salida para la siguiente vuelta. Jamás juegues primero el [2:5] matando tu propia puerta.
                      </>
                    )}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2">
                  <span className="text-xs font-bold text-amber-400 uppercase">
                    {tr('Excepción de Monopolio (4 o 5 fichas)', 'Monopoly Exception (4 or 5 Tiles)')}
                  </span>
                  <div className="flex gap-2 py-1">
                    <DominoTile top={3} bottom={3} size="sm" />
                    <DominoTile top={3} bottom={6} size="sm" />
                    <DominoTile top={3} bottom={4} size="sm" />
                    <DominoTile top={3} bottom={1} size="sm" />
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {tr(
                      'Solo cuando posees 4 o 5 fichas del mismo número puedes darte el lujo de «correr» primero una ficha mixta para cuadrar o forzar pases, sabiendo que tú mismo controlarás la reapertura de ese número.',
                      'Only when holding 4 or 5 tiles of the same suit can you afford to run a mixed tile first to square or induce passes, knowing you control reopening the suit.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cuadre' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <GitMerge className="w-5 h-5 text-amber-400" />
                {tr('El Cuadre Táctico vs. El Descuadre Defensivo', 'Tactical Squaring vs. Defensive Unsquaring')}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {lang === 'en' ? (
                  <>
                    <b>Squaring</b> (“Cuadrar”) means leaving both open board ends on the same suit (e.g., 5 and 5). <b>Unsquaring</b> (“Descuadrar”) keeps two distinct suits active.
                  </>
                ) : (
                  <>
                    <b>Cuadrar</b> significa dejar ambos extremos de la mesa con el mismo número (ej. Punta Izquierda 5 y Punta Derecha 5). <b>Descuadrar</b> significa mantener dos números distintos abiertos.
                  </>
                )}
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs text-slate-300 leading-relaxed space-y-1">
                  <span className="font-bold text-emerald-400">{tr('¿Cuándo debes Cuadrar la mesa?', 'When should you Square the table?')}</span>
                  <p>
                    {lang === 'en' ? (
                      <>
                        • When you square to a suit where <b>Right Rival already passed</b> (forcing another pass and freeing your partner).
                      </>
                    ) : (
                      <>
                        • Cuando cuadras al número en el que el <b>Rival Derecha ya pasó</b> (lo obligas a pasar de nuevo y tu compañero juega libre).
                      </>
                    )}
                  </p>
                  <p>
                    •{' '}
                    {tr(
                      'Cuando cuadras a la salida original de tu compañero o a un número donde tienes mayoría absoluta.',
                      'When you square onto your partner’s original opening lead or a suit where you hold total majority.'
                    )}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 text-xs text-slate-300 leading-relaxed space-y-1">
                  <span className="font-bold text-amber-400">
                    {tr('¿Cuándo debes Descuadrar (Abrir dos puertas)?', 'When should you Unsquare (Keep Two Doors Open)?')}
                  </span>
                  <p>
                    •{' '}
                    {tr(
                      'Cuando tu compañero viene sufriendo pases y está corto de juego: dejar dos números distintos y frescos duplica sus probabilidades de no pasar.',
                      'When your partner has been passing and runs short on options: two fresh suits double their odds of finding a legal play.'
                    )}
                  </p>
                  <p>
                    •{' '}
                    {tr(
                      'Cuando los rivales tienen la iniciativa ofensiva y no quieres que acuesten sus dobles gratis.',
                      'When opponents hold offensive momentum and you want to deny them free double drops.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'puente' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                {tr('La Ley de la Ficha Puente («Ficha Llave»)', 'Law of the Bridge Tile (“Key Tile”)')}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {lang === 'en' ? (
                  <>
                    If the open ends on the felt are <b>[5]</b> and <b>[2]</b>, tile <b>[5:2]</b> is the <b>Bridge / Key Tile</b> because it links both open ends.
                  </>
                ) : (
                  <>
                    Si las puntas abiertas en la mesa son <b>[5]</b> y <b>[2]</b>, la ficha <b>[5:2]</b> se denomina la <b>Ficha Puente o Ficha Llave</b> porque conecta ambos extremos activos de la mesa.
                  </>
                )}
              </p>

              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <DominoTile top={5} bottom={2} size="sm" orientation="horizontal" />
                  <span className="font-bold text-amber-400">{tr('El Timón de las Dos Puntas:', 'Steering Both Ends:')}</span>
                </div>
                <p className="leading-relaxed">
                  {lang === 'en' ? (
                    <>
                      • Playing <b>[5:2] on the 2 end</b> kills the 2 and <b>squares the board to fives (5 - 5)</b>.<br />
                      • Playing <b>[5:2] on the 5 end</b> kills the 5 and <b>squares the board to twos (2 - 2)</b>.<br />
                      • Whoever holds the Bridge Tile unilaterally chooses which suit gets squared. Never spend it without checking which suit suffocates Right Rival.
                    </>
                  ) : (
                    <>
                      • Si juegas <b>[5:2] por la punta del 2</b>, matas el 2 y <b>cuadras la mesa a cincos (5 - 5)</b>.<br />
                      • Si juegas <b>[5:2] por la punta del 5</b>, matas el 5 y <b>cuadras la mesa a doses (2 - 2)</b>.<br />
                      • Quien posee la ficha puente decide unilateralmente a qué número se va a cuadrar la mesa. Nunca la malgastes sin antes verificar cuál de los dos números asfixia al Rival Derecha.
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'tiempos' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                {tr('Psicología de Mesa: Lectura de «La Pensada»', 'Table Psychology: Reading “The Hesitation”')}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {tr(
                  'En el dominó dominicano de alto nivel, el ritmo con el que cada jugador coloca su ficha transmite información matemática legítima que todo maestro sabe descifrar:',
                  'In high-level Dominican dominoes, the cadence with which a player places a tile broadcasts legitimate inference every master reads:'
                )}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-cyan-400 uppercase">{tr('Tiro Instantáneo («Al Toque»)', 'Instant Snap Play')}</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lang === 'en' ? (
                      <>
                        When two distinct ends are open (e.g. <b>[6]</b> and <b>[1]</b>) and a player snaps onto 6 immediately, it usually signals <b>their sole legal play</b> (zero ones and no other sixes).
                      </>
                    ) : (
                      <>
                        Cuando hay dos puntas distintas en la mesa (ej. <b>[6]</b> y <b>[1]</b>) y un jugador tira al instante por el 6 sin dudar un segundo, casi siempre significa que <b>era su única ficha jugable</b> (no lleva ningún 1 ni más seises).
                      </>
                    )}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-2">
                  <span className="text-xs font-bold text-amber-400 uppercase">{tr('Tiro Pensado («La Pensada»)', 'Considered Play (“La Pensada”)')}</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lang === 'en' ? (
                      <>
                        “A forced single option takes zero thought.” If a player pauses before playing onto <b>[5]</b> and <b>[3]</b>, they just confirmed holding <b>at least one other compatible option</b> in hand (another 5, another 3, or a guarded double).
                      </>
                    ) : (
                      <>
                        «Ficha única no se piensa». Si un jugador se detiene a meditar antes de jugar con puntas <b>[5]</b> y <b>[3]</b>, te acaba de confirmar que <b>tiene al menos otra ficha compatible</b> en la mano (otro 5, otro 3, o un doble que decidió reservar).
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'defensa1' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-400" />
                {tr(
                  'Protocolo de Emergencia: Rival «A Ley de Una» (1 Ficha)',
                  'Emergency Protocol: Opponent on 1 Tile ("A Ley de Una")'
                )}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {lang === 'en' ? (
                  <>
                    Once an opponent drops down to <b>1 single tile in hand</b>, all normal priorities yield to one mission: stop them from going out.
                  </>
                ) : (
                  <>
                    Cuando un rival se queda con <b>una sola ficha en la mano</b>, todas las reglas ordinarias pasan a segundo plano: la prioridad absoluta de la pareja es impedir que se pegue.
                  </>
                )}
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs text-slate-200 leading-relaxed space-y-1.5">
                  <span className="font-bold text-rose-400 uppercase block">
                    {tr('Las 3 Reglas de Oro contra el Jugador de 1 Ficha:', '3 Golden Rules Against a 1-Tile Opponent:')}
                  </span>
                  {lang === 'en' ? (
                    <>
                      <p>1. <b>Never leave split ends:</b> Leaving two different numbers open (e.g., 4 and 2) doubles their exits. <b>Always square the board to a single suit</b>.</p>
                      <p>2. <b>Square to the deadest suit:</b> If you see 6 fours across felt and hand, square to fours—the odds they hold the final 4 drop near zero.</p>
                      <p>3. <b>Exploit known passes:</b> Squaring onto a suit where that rival already passed guarantees 100% they cannot domino this turn.</p>
                    </>
                  ) : (
                    <>
                      <p>1. <b>Jamás dejes la mesa descuadrada:</b> Si dejas dos números distintos abiertos (ej. 4 y 2), le das el doble de puertas para pegarse. <b>Cuadra siempre la mesa a un solo número</b>.</p>
                      <p>2. <b>Cuadra al número más escaso o muerto:</b> Si ves 6 cuatros entre la mesa y tu mano, cuadra a cuatros: su probabilidad de tener el último 4 es casi nula.</p>
                      <p>3. <b>Revisa sus pases previos:</b> Cuadrar a un número donde ese rival ya pasó garantiza al 100% que no podrá pegarse en ese turno.</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Quick Tips */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              {tr('Mandamientos de Mesa Dominicana', 'Dominican Table Commandments')}
            </span>

            <ul className="text-xs text-slate-300 space-y-2.5 list-disc pl-4 leading-relaxed">
              {lang === 'en' ? (
                <>
                  <li><b>Always count to 7:</b> Every suit contains exactly 7 tiles in the deck.</li>
                  <li><b>Drop the double first:</b> If a double has just one backup tile, play the double immediately.</li>
                  <li><b>A forced tile isn’t thought over:</b> Watch who hesitates—hesitation reveals extra options.</li>
                  <li><b>Choke your right rival:</b> Cut their strong suit and square onto suits they passed on.</li>
                  <li><b>Opponent on 1 tile:</b> Always square the table to the deadest suit or a known pass.</li>
                  <li><b>Sum before you lock:</b> A tranque is pure arithmetic, never guesswork.</li>
                </>
              ) : (
                <>
                  <li><b>Cuenta siempre a 7:</b> Cada número tiene exactamente 7 fichas en la baraja.</li>
                  <li><b>Primero se acuesta el doble:</b> Si tienes el doble con un solo respaldo, acuéstalo en la primera oportunidad.</li>
                  <li><b>Ficha única no se piensa:</b> Observa quién piensa antes de tirar; ahí sabes quién tiene más de una opción.</li>
                  <li><b>Al de la derecha, ni agua:</b> Córtale su número dominante y cuádrale a los números donde ya pasó.</li>
                  <li><b>Rival a ley de una:</b> Cuadra siempre la mesa al número más jugado o donde ya haya pasado.</li>
                  <li><b>Antes de trancar, suma:</b> El tranque es álgebra pura, nunca adivinanza.</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
