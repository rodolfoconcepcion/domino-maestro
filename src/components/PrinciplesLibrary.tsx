import React, { useState } from 'react';
import { BookOpen, Shield, Flame, Target, Compass, Award, CheckCircle, Layers, GitMerge, Key, Clock, AlertOctagon } from 'lucide-react';
import { DominoTile } from './DominoTile';

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
  const [activeTab, setActiveTab] = useState<DoctrineTab>('salidas');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-lg">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
          Compendio Teórico Dominicano
        </span>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          Doctrina Táctica del Dominó Competitivo (10 Leyes Maestras)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Las leyes estratégicas, matemáticas y psicológicas que diferencian al jugador casual del maestro de torneo.
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 sm:gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'salidas', label: '1. Teoría de la Salida', icon: Compass },
          { id: 'pareja', label: '2. Respeto al Salidor', icon: Shield },
          { id: 'corte', label: '3. Corte a la Derecha', icon: Target },
          { id: 'tranque', label: '4. Ciencia del Tranque', icon: Flame },
          { id: 'conteo', label: '5. La Regla de las 7', icon: Award },
          { id: 'dobles', label: '6. Uso de los Dobles', icon: Layers },
          { id: 'cuadre', label: '7. Cuadre vs Descuadre', icon: GitMerge },
          { id: 'puente', label: '8. La Ficha Puente', icon: Key },
          { id: 'tiempos', label: '9. «La Pensada»', icon: Clock },
          { id: 'defensa1', label: '10. Rival a Ley de Una', icon: AlertOctagon },
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
                La Filosofía de la Salida: El Salidor Manda
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Esta guía desmonta el mito callejero de «salir con el doble más alto para botar puntos» cuando tienes salida libre.
                En el dominó técnico, la salida no es para huir de los puntos, sino para <b>adueñarse de un número</b> y
                marcar el destino de la mano.
              </p>

              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-slate-200 space-y-1">
                <span className="font-bold text-amber-400 uppercase tracking-wide block">
                  Regla Oficial Dominicana: Mano #1 vs. Salida Libre
                </span>
                <p className="text-slate-300 leading-relaxed">
                  • <b>Primera Mano del Partido (0 - 0):</b> Sale obligatoriamente el jugador que tenga el <b>Doble Seis [6:6]</b>.<br />
                  • <b>Segunda Mano en adelante (Salida Libre):</b> El jugador que gana la mano anterior (por dominó o por tranque con menos puntos) es siempre quien sale de primero ("el que gana sale"). Ahí aplica toda la teoría de la salida óptima.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                    La Salida Perfecta: Doble Respaldado
                  </div>
                  <div className="flex gap-2 py-1">
                    <DominoTile top={5} bottom={5} size="sm" />
                    <DominoTile top={5} bottom={4} size="sm" />
                    <DominoTile top={5} bottom={2} size="sm" />
                    <DominoTile top={5} bottom={0} size="sm" />
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">
                    Tienes 4 fichas del mismo número incluyendo el doble. Solo quedan 3 cincos en toda la mesa.
                    Tienes el monopolio garantizado.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/30 space-y-2">
                  <div className="text-xs font-bold text-rose-400 uppercase tracking-wide">
                    El Error Fatal: El Doble Ahorcado
                  </div>
                  <div className="flex gap-2 py-1">
                    <DominoTile top={6} bottom={6} size="sm" />
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">
                    Salir con [6:6] sin ningún otro seis en la mano es regalar el control. Quien tenga 3 seises
                    asfixiará tu mesa inmediatamente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pareja' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                El Respeto Sagrado al Salidor
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Una causa frecuente de perder manos es que el compañero del salidor
                mata la salida de su propia pareja en lugar de castigar al rival.
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300 leading-relaxed">
                    <b className="text-white">Regla de las Dos Vueltas:</b> Durante las primeras dos rondas de juego, el compañero debe mantener abierta la punta de la salida y matar siempre la ficha que jugó el rival de la izquierda (quien jugó inmediatamente después del salidor).
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300 leading-relaxed">
                    <b className="text-white">Excepción Única (La Mano Mayor):</b> Solo se permite cambiar el número de la salida si tú tienes 5 o 6 fichas de otro número, lo que te convierte a ti en el verdadero dueño de la mano.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'corte' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                El Corte y la Estrangulación del Rival de la Derecha
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Tu objetivo primordial en defensa no es ganar individualmente, sino neutralizar al jugador que recibe tu juego inmediatamente después de ti (el rival de tu derecha).
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1">
                  <span className="font-bold text-amber-400">Nunca le regales su número fuerte:</span>
                  <p>Si el jugador de la derecha inició con treses, cada vez que tengas oportunidad de taparle el tres, debes hacerlo sin titubear.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1">
                  <span className="font-bold text-amber-400">Producir el "Paso":</span>
                  <p>Provocar que el rival de la derecha pase rompe la simetría de la partida y le permite a tu equipo colocar dos fichas seguidas en mesa.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tranque' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                La Ciencia del Tranque (Cálculo Aritmético)
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                El tranque es la jugada matemática por excelencia. En el juego técnico, jamás se tranca por azar ni por salir del paso.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-600/50 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase">Tranque Seguro</span>
                  <ul className="text-xs text-slate-300 space-y-1">
                    <li>• Tienes menos de 6 puntos en mano.</li>
                    <li>• Los contrarios pasaron a ese número.</li>
                    <li>• Aseguras la victoria por conteo neto.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-600/50 space-y-2">
                  <span className="text-xs font-bold text-rose-400 uppercase">Tranque Prohibido</span>
                  <ul className="text-xs text-slate-300 space-y-1">
                    <li>• Tienes fichas pesadas (seises, cincos, cuatros).</li>
                    <li>• Tu mano suma más de 12 puntos.</li>
                    <li>• Los rivales vienen descargando blancas y unos.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'conteo' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                La Regla de las 7 Fichas y la Memoria Dinámica
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Cada uno de los 7 números (0, 1, 2, 3, 4, 5, 6) cuenta con exactamente 7 fichas en el juego de dominó.
                Un jugador de élite lleva el inventario mental en todo momento.
              </p>

              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 text-xs text-slate-300 space-y-2">
                <span className="font-bold text-amber-400">La Fórmula de Deducción Absoluta:</span>
                <p className="font-mono bg-slate-900 p-2.5 rounded-lg text-emerald-400 border border-slate-800">
                  7 - (Fichas en tu Mano + Fichas en Mesa) = Fichas Repartidas entre 3 Jugadores
                </p>
                  <p className="text-slate-400">
                    Si ya ves 6 fichas de un número (entre la mesa y tu mano) y ambos rivales pasaron a ese número, <b className="text-slate-200">la ficha restante está 100% garantizada en la mano de tu compañero</b>.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'dobles' && (
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  Administración de Dobles: «Primero se Acuesta y Después se Corre»
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Un doble solo tiene una puerta de entrada. Retener un doble en la mano cuando solo tienes un acompañante (una sola ficha mixta de ese número) es una de las causas más frecuentes de quedarse con el doble «ahorcado».
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-600/50 space-y-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase">Regla General (Con 1 o 2 acompañantes)</span>
                    <div className="flex gap-2 py-1">
                      <DominoTile top={2} bottom={2} size="sm" />
                      <DominoTile top={2} bottom={5} size="sm" />
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      En cuanto se abra el número 2 en la mesa, <b>acuesta primero el [2:2]</b> y conserva el [2:5] como llave de salida para la siguiente vuelta. Jamás juegues primero el [2:5] matando tu propia puerta.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2">
                    <span className="text-xs font-bold text-amber-400 uppercase">Excepción de Monopolio (4 o 5 fichas)</span>
                    <div className="flex gap-2 py-1">
                      <DominoTile top={3} bottom={3} size="sm" />
                      <DominoTile top={3} bottom={6} size="sm" />
                      <DominoTile top={3} bottom={4} size="sm" />
                      <DominoTile top={3} bottom={1} size="sm" />
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Solo cuando posees 4 o 5 fichas del mismo número puedes darte el lujo de «correr» primero una ficha mixta para cuadrar o forzar pases, sabiendo que tú mismo controlarás la reapertura de ese número.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'cuadre' && (
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <GitMerge className="w-5 h-5 text-amber-400" />
                  El Cuadre Táctico vs. El Descuadre Defensivo
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  <b>Cuadrar</b> significa dejar ambos extremos de la mesa con el mismo número (ej. Punta Izquierda 5 y Punta Derecha 5). <b>Descuadrar</b> significa mantener dos números distintos abiertos.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs text-slate-300 leading-relaxed space-y-1">
                    <span className="font-bold text-emerald-400">¿Cuándo debes Cuadrar la mesa?</span>
                    <p>• Cuando cuadras al número en el que el <b>Rival Derecha ya pasó</b> (lo obligas a pasar de nuevo y tu compañero juega libre).</p>
                    <p>• Cuando cuadras a la salida original de tu compañero o a un número donde tienes mayoría absoluta.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 text-xs text-slate-300 leading-relaxed space-y-1">
                    <span className="font-bold text-amber-400">¿Cuándo debes Descuadrar (Abrir dos puertas)?</span>
                    <p>• Cuando tu compañero viene sufriendo pases y está corto de juego: dejar dos números distintos y frescos duplica sus probabilidades de no pasar.</p>
                    <p>• Cuando los rivales tienen la iniciativa ofensiva y no quieres que acuesten sus dobles gratis.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'puente' && (
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-400" />
                  La Ley de la Ficha Puente («Ficha Llave»)
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Si las puntas abiertas en la mesa son <b>[5]</b> y <b>[2]</b>, la ficha <b>[5:2]</b> se denomina la <b>Ficha Puente o Ficha Llave</b> porque conecta ambos extremos activos de la mesa.
                </p>

                <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-3 text-xs text-slate-300">
                  <div className="flex items-center gap-3">
                    <DominoTile top={5} bottom={2} size="sm" orientation="horizontal" />
                    <span className="font-bold text-amber-400">El Timón de las Dos Puntas:</span>
                  </div>
                  <p className="leading-relaxed">
                    • Si juegas <b>[5:2] por la punta del 2</b>, matas el 2 y <b>cuadras la mesa a cincos (5 - 5)</b>.<br />
                    • Si juegas <b>[5:2] por la punta del 5</b>, matas el 5 y <b>cuadras la mesa a doses (2 - 2)</b>.<br />
                    • Quien posee la ficha puente decide unilateralmente a qué número se va a cuadrar la mesa. Nunca la malgastes sin antes verificar cuál de los dos números asfixia al Rival Derecha.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'tiempos' && (
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  Psicología de Mesa: Lectura de «La Pensada»
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  En el dominó dominicano de alto nivel, el ritmo con el que cada jugador coloca su ficha transmite información matemática legítima que todo maestro sabe descifrar:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-cyan-400 uppercase">Tiro Instantáneo («Al Toque»)</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Cuando hay dos puntas distintas en la mesa (ej. <b>[6]</b> y <b>[1]</b>) y un jugador tira al instante por el 6 sin dudar un segundo, casi siempre significa que <b>era su única ficha jugable</b> (no lleva ningún 1 ni más seises).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-2">
                    <span className="text-xs font-bold text-amber-400 uppercase">Tiro Pensado («La Pensada»)</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      «Ficha única no se piensa». Si un jugador se detiene a meditar antes de jugar con puntas <b>[5]</b> y <b>[3]</b>, te acaba de confirmar que <b>tiene al menos otra ficha compatible</b> en la mano (otro 5, otro 3, o un doble que decidió reservar).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'defensa1' && (
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-rose-400" />
                  Protocolo de Emergencia: Rival «A Ley de Una» (1 Ficha)
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Cuando un rival se queda con <b>una sola ficha en la mano</b>, todas las reglas ordinarias pasan a segundo plano: la prioridad absoluta de la pareja es impedir que se pegue.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs text-slate-200 leading-relaxed space-y-1.5">
                    <span className="font-bold text-rose-400 uppercase block">Las 3 Reglas de Oro contra el Jugador de 1 Ficha:</span>
                    <p>1. <b>Jamás dejes la mesa descuadrada:</b> Si dejas dos números distintos abiertos (ej. 4 y 2), le das el doble de puertas para pegarse. <b>Cuadra siempre la mesa a un solo número</b>.</p>
                    <p>2. <b>Cuadra al número más escaso o muerto:</b> Si ves 6 cuatros entre la mesa y tu mano, cuadra a cuatros: su probabilidad de tener el último 4 es casi nula.</p>
                    <p>3. <b>Revisa sus pases previos:</b> Cuadrar a un número donde ese rival ya pasó garantiza al 100% que no podrá pegarse en ese turno.</p>
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
                Mandamientos de Mesa Dominicana
              </span>

              <ul className="text-xs text-slate-300 space-y-2.5 list-disc pl-4 leading-relaxed">
                <li><b>Cuenta siempre a 7:</b> Cada número tiene exactamente 7 fichas en la baraja.</li>
                <li><b>Primero se acuesta el doble:</b> Si tienes el doble con un solo respaldo, acuéstalo en la primera oportunidad.</li>
                <li><b>Ficha única no se piensa:</b> Observa quién piensa antes de tirar; ahí sabes quién tiene más de una opción.</li>
                <li><b>Al de la derecha, ni agua:</b> Córtale su número dominante y cuádrale a los números donde ya pasó.</li>
                <li><b>Rival a ley de una:</b> Cuadra siempre la mesa al número más jugado o donde ya haya pasado.</li>
                <li><b>Antes de trancar, suma:</b> El tranque es álgebra pura, nunca adivinanza.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };
