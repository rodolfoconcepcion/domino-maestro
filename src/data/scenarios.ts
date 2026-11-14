import { PuzzleScenario } from '../types/domino';

export const SCENARIOS: PuzzleScenario[] = [
  {
    id: 'salida-respaldo',
    title: '1. La Salida Óptima: El Doble Respaldado (Salida Libre)',
    chapter: 'Capítulo 1: La Filosofía de la Salida',
    difficulty: 'Principiante',
    situation:
      'Estamos en la segunda mano del partido (Marcador 25 - 0, por lo que ya tienes "Salida Libre" y no estás obligado a salir con el doble seis como en la primera mano 0-0). Miras tus 7 fichas y ves que tienes el Doble Seis [6:6], pero es tu único seis. Al mismo tiempo, tienes cuatro fichas de cinco: [5:5], [5:4], [5:2] y [5:0], además de [3:2] y [1:0]. ¿Con cuál ficha debes salir?',
    context: {
      salidaBy: 'Tú',
      boardEnds: [0, 0],
      centerIdx: 0,
      boardTiles: [],
      myHand: [
        [6, 6],
        [5, 5],
        [5, 4],
        [5, 2],
        [5, 0],
        [3, 2],
        [1, 0],
      ],
      knownPasses: [],
      notes: [
        'Excepción Dominicana: Solo en la 1ra mano del partido (0-0) es obligatorio salir con el [6:6]. En las demás manos la salida es libre.',
        'Tienes el doble mayor [6:6] sin acompañamiento ("ahorcado").',
        'Tienes un monopolio de 4 cincos, incluyendo el [5:5].',
      ],
    },
    question: 'En salida libre (2da mano en adelante), ¿con cuál ficha debes iniciar y por qué?',
    options: [
      {
        id: 'opt-66',
        tile: [6, 6],
        isCorrect: false,
        tacticalPrinciple: 'Error en Salida Libre: "Botar el doble mayor sin respaldo"',
        explanation:
          '¡Ojo! En la 1ra mano del partido (0-0) sí estarías obligado por regla dominicana a salir con el [6:6]. Pero en salida libre (2da mano en adelante), salir con el [6:6] solo (sin más seises) le entrega el control de la mesa a los contrarios.',
      },
      {
        id: 'opt-55',
        tile: [5, 5],
        isCorrect: true,
        tacticalPrinciple: 'Regla del Monopolio con Doble Respaldado',
        explanation:
          '¡Excelente! En salida libre, "la salida manda". Al salir con [5:5] teniendo 4 cincos en mano, solo quedan 3 cincos repartidos entre los otros 3 jugadores. Tienes el control absoluto del número y obligas a los rivales a gastar sus cincos en desventaja.',
      },
      {
        id: 'opt-54',
        tile: [5, 4],
        isCorrect: false,
        tacticalPrinciple: 'Salida mixta innecesaria teniendo el doble',
        explanation:
          'Teniendo el [5:5] con 3 respaldos, salir mixto [5:4] es un desperdicio: permites que un rival te tranque el doble 5 o te castigue la salida antes de afirmar tu juego.',
      },
    ],
    tacticalTip:
      'En el dominó dominicano, el [6:6] solo es obligatorio en la primera mano de todo el partido (0-0). A partir de la segunda mano (salida libre), jamás salgas con un doble alto sin respaldo si tienes un número largo respaldado por su doble.',
  },
  {
    id: 'respeto-salida',
    title: '2. Respeto Sagrado a la Salida del Compañero',
    chapter: 'Capítulo 2: El Binomio y el Lenguaje de las Fichas',
    difficulty: 'Principiante',
    situation:
      'Tu compañero (al frente) salió con [4:4] (su número dominante). Siguiendo el orden de juego a la derecha, el rival de tu izquierda jugó [4:1]. En la mesa los extremos abiertos son Punta Izquierda [4] y Punta Derecha [1]. Tu mano contiene tus 7 fichas: [4:3], [1:6], [1:5], [3:2], [6:0], [3:0], [2:0]. ¿Cómo respondes a esta jugada?',
    context: {
      salidaBy: 'Compañero',
      boardEnds: [4, 1],
      centerIdx: 0,
      boardTiles: [
        { tile: [4, 4], playedBy: 2, playOrder: 1 }, // Salida del Compañero
        { tile: [4, 1], playedBy: 3, playOrder: 2 }, // Jugó Rival Izquierda
      ],
      myHand: [
        [4, 3],
        [1, 6],
        [1, 5],
        [3, 2],
        [6, 0],
        [3, 0],
        [2, 0],
      ],
      knownPasses: [],
      notes: [
        'Tu compañero es el salidor e impuso los cuatros con el [4:4].',
        'El rival de la izquierda intentó matar el 4 jugando [4:1].',
        'Puntas abiertas en mesa: Punta Izquierda (4) y Punta Derecha (1).',
      ],
    },
    question: '¿Por cuál punta juegas y con cuál ficha?',
    options: [
      {
        id: 'opt-43',
        tile: [4, 3],
        targetEnd: 4,
        isCorrect: false,
        tacticalPrinciple: 'Castigar la salida del compañero',
        explanation:
          '¡Prohibido! Si juegas el [4:3] por la Punta Izquierda (4), estás tapando la salida de tu propio compañero. A esto se le llama "traicionar la salida". Dejas a tu compañero sin su punta abierta.',
      },
      {
        id: 'opt-16',
        tile: [1, 6],
        targetEnd: 1,
        isCorrect: true,
        tacticalPrinciple: 'Regla de Oro: Castigar al rival y respetar la punta del compañero',
        explanation:
          '¡Jugada de maestro! Juegas [1:6] por la Punta Derecha (1) matando el 1 del rival de la izquierda y dejando la Punta Izquierda (4) de tu compañero intacta y abierta para que repita en su próximo turno.',
      },
      {
        id: 'opt-15',
        tile: [1, 5],
        targetEnd: 1,
        isCorrect: true,
        tacticalPrinciple: 'Castigo del número contrario protegiendo la salida',
        explanation:
          '¡Correcto también! Juegas [1:5] por la Punta Derecha (1) para mantener viva la Punta Izquierda (4) de tu compañero.',
      },
    ],
    tacticalTip:
      'El compañero del salidor no inventa ni improvisa en la primera vuelta: castiga la ficha del contrario y mantiene abierta la puerta que abrió su pareja.',
  },
  {
    id: 'estrangulacion-derecha',
    title: '3. La Estrangulación del Rival de la Derecha',
    chapter: 'Capítulo 3: Táctica Defensiva y el Corte',
    difficulty: 'Intermedio',
    situation:
      'El rival de tu derecha es el jugador que recibe tu juego (le toca inmediatamente después de ti). Ha mostrado peligro en los treses y busca adueñarse de ese número. En la mesa hay dos extremos abiertos: un [3] y un [2]. Tu mano es: [3:2], [2:6], [6:4], [0:0]. Tienes la ficha llave [3:2] que conecta ambas puntas. ¿Cuál es tu decisión?',
    context: {
      salidaBy: 'Rival Derecha',
      boardEnds: [3, 2], // [Punta Izquierda: 3, Punta Derecha: 2]
      centerIdx: 3,
      boardTiles: [
        { tile: [3, 6], playedBy: 3, playOrder: 6 }, // Rival Izquierda devuelve el 3 a su compañero
        { tile: [6, 1], playedBy: 0, playOrder: 4 }, // Tú abres el 6 (Rival Derecha luego pasa)
        { tile: [1, 3], playedBy: 2, playOrder: 2 }, // Compañero
        { tile: [3, 3], playedBy: 1, playOrder: 1 }, // Salida Rival Derecha (número dominante: 3)
        { tile: [3, 5], playedBy: 3, playOrder: 3 }, // Rival Izquierda
        { tile: [5, 2], playedBy: 2, playOrder: 5 }, // Compañero
      ],
      myHand: [
        [3, 2],
        [2, 6],
        [6, 4],
        [0, 0],
      ],
      knownPasses: [
        { player: 'Rival Derecha', suit: 6 },
      ],
      notes: [
        'Rival Derecha salió con [3:3] imponiendo los treses como su número fuerte.',
        'El rival de tu derecha no tiene seises (ya pasó cuando abriste el 6 en la jugada #4).',
        'Si juegas por la Punta Derecha (2), dejas el 3 vivo y le entregas la mesa servida al rival de tu derecha.',
        'Puntas abiertas en mesa: Punta Izquierda (3) y Punta Derecha (2).',
      ],
    },
    question: '¿Por cuál punta juegas para neutralizar al rival de tu derecha?',
    options: [
      {
        id: 'opt-26',
        tile: [2, 6],
        targetEnd: 2,
        isCorrect: false,
        tacticalPrinciple: 'Dejar vivo el número dominante del rival',
        explanation:
          'Jugar el [2:6] por la Punta Derecha (2) deja el 3 de la Punta Izquierda abierto, permitiéndole a la vuelta siguiente continuar su ofensiva y hacerle daño a tu compañero.',
      },
      {
        id: 'opt-32-on-right-2',
        tile: [3, 2],
        targetEnd: 2,
        isCorrect: false,
        tacticalPrinciple: 'Cuadrar al número dominante del rival (Error Fatal)',
        explanation:
          'Jugar el [3:2] por la Punta Derecha (2) mata el 2 y deja un 3, ¡cuadrando la mesa a treses en ambas puntas! Le acabas de servir la mesa en bandeja de plata al rival de tu derecha en su número dominante para que descargue o tranque a su favor.',
      },
      {
        id: 'opt-32-on-3-then-6',
        tile: [3, 2],
        targetEnd: 3,
        isCorrect: true,
        tacticalPrinciple: 'Estrangulación: Matar el número del rival de la derecha',
        explanation:
          '¡Exacto! Juegas [3:2] por la Punta Izquierda (3) matando el 3 del rival de tu derecha. Le quitas su iniciativa y obligas a la mesa a jugar sobre números que él no domina.',
      },
    ],
    tacticalTip:
      'Al jugador de tu derecha se le corta el aire: su número preferido se le asfixia de inmediato. Cada turno que le dejes su número abierto es un punto que le regalas a su pareja.',
  },
  {
    id: 'ciencia-tranque',
    title: '4. La Ciencia del Tranque (Cálculo Aritmético)',
    chapter: 'Capítulo 4: El Tranque y el Cierre Quirúrgico',
    difficulty: 'Intermedio',
    situation:
      'Quedan pocas fichas en la mano de cada jugador. Los extremos abiertos de la mesa son Punta Izquierda [2] y Punta Derecha [1]. En tu turno tienes únicamente 2 fichas livianas: [2:1] (3 pts) y [1:0] (1 pt), sumando apenas 4 puntos en total. Ambos rivales jugaron fichas altas y ya pasaron a unos anteriormente. Si juegas [2:1] por la Punta Izquierda (2), cuadras y trancas la mesa a unos (con 1 solo punto restante en tu mano). ¿Cómo procedes?',
    context: {
      salidaBy: 'Tú',
      boardEnds: [2, 1], // [Punta Izquierda: 2, Punta Derecha: 1]
      centerIdx: 5,
      boardTiles: [
        { tile: [2, 3], playedBy: 3, playOrder: 8 },
        { tile: [3, 6], playedBy: 2, playOrder: 7 },
        { tile: [6, 5], playedBy: 1, playOrder: 6 },
        { tile: [5, 3], playedBy: 0, playOrder: 5 },
        { tile: [3, 4], playedBy: 3, playOrder: 4 },
        { tile: [4, 4], playedBy: 0, playOrder: 1 }, // Salida de Tú
        { tile: [4, 6], playedBy: 1, playOrder: 2 },
        { tile: [6, 1], playedBy: 2, playOrder: 3 },
      ],
      myHand: [
        [2, 1],
        [1, 0],
      ],
      knownPasses: [
        { player: 'Rival Derecha', suit: 1 },
        { player: 'Rival Izquierda', suit: 1 },
      ],
      notes: [
        'Rival Derecha pasó a unos.',
        'Rival Izquierda pasó a unos.',
        'Tus fichas suman únicamente 4 puntos: [2:1] (3 pts) y [1:0] (1 pt). Al jugar [2:1], te quedas con 1 solo punto ([1:0]).',
        'Puntas abiertas en mesa: Punta Izquierda (2) y Punta Derecha (1).',
      ],
    },
    question: 'Si juegas [2:1] por la Punta Izquierda (2), dejas la mesa a unos en ambos extremos provocando el Tranque. ¿Debes trancar?',
    options: [
      {
        id: 'opt-trancar',
        tile: [2, 1],
        targetEnd: 2,
        isCorrect: true,
        tacticalPrinciple: 'Tranque Matemático Seguro',
        explanation:
          '¡Magistral! Juegas [2:1] por la Punta Izquierda (2) dejando ambos extremos a unos y trancando la mesa con solo 1 punto en mano ([1:0]). Como ambos rivales pasaron a unos, aseguras la victoria en el conteo.',
      },
      {
        id: 'opt-esperar',
        tile: [1, 0],
        targetEnd: 1,
        isCorrect: false,
        tacticalPrinciple: 'Dejar escapar la victoria garantizada',
        explanation:
          'Jugar [1:0] por la Punta Derecha (1) sin trancar cuando te quedarías con 1 punto en mano y los rivales no tienen unos es un error grave: abres el 0 y les das oportunidad de descargarse de sus fichas pesadas.',
      },
    ],
    tacticalTip:
      'El tranque no es suerte: es álgebra simple. Si la suma de tu mano es mínima y conoces los números muertos de los contrarios, el tranque es una ejecución perfecta.',
  },
  {
    id: 'deduccion-doble-oculto',
    title: '5. Deducción del Doble Oculto por Faltas',
    chapter: 'Capítulo 5: Lectura Avanzada y Memoria Dinámica',
    difficulty: 'Maestro',
    situation:
      'En la mesa ya se han jugado 4 de los siete 4s de la baraja: [4:2], [1:4], [5:4] y [4:3]. Además, tú tienes en tu mano otros 2 cuatros: el [4:6] y el [4:0] (6 cuatros ubicados en total). El único cuatro que falta en toda la partida es el Doble Cuatro [4:4]. En rondas anteriores, tanto el Rival Derecha como el Rival Izquierda pasaron al número 4. ¿Quién tiene obligatoriamente el [4:4] y cómo debes jugar?',
    context: {
      salidaBy: 'Rival Izquierda',
      boardEnds: [6, 3], // [Punta Izquierda: 6, Punta Derecha: 3]
      centerIdx: 3,
      boardTiles: [
        { tile: [6, 5], playedBy: 3, playOrder: 7 },
        { tile: [5, 4], playedBy: 0, playOrder: 5 },
        { tile: [4, 2], playedBy: 0, playOrder: 2 },
        { tile: [2, 2], playedBy: 3, playOrder: 1 }, // Salida Rival Izquierda
        { tile: [2, 1], playedBy: 1, playOrder: 3 },
        { tile: [1, 4], playedBy: 2, playOrder: 4 },
        { tile: [4, 3], playedBy: 2, playOrder: 6 },
      ],
      myHand: [
        [4, 6],
        [4, 0],
        [3, 0],
      ],
      knownPasses: [
        { player: 'Rival Derecha', suit: 4 },
        { player: 'Rival Izquierda', suit: 4 },
      ],
      notes: [
        '4 cuatros en mesa ([4:2], [1:4], [5:4], [4:3]) + 2 en tu mano ([4:6], [4:0]) = 6 cuatros ubicados.',
        'Solo falta 1 cuatro en toda la partida: el [4:4].',
        'Ambos rivales pasaron a cuatros.',
        'Puntas abiertas en mesa: Punta Izquierda (6) y Punta Derecha (3).',
      ],
    },
    question: '¿Quién tiene el [4:4] y por cuál punta debes jugar?',
    options: [
      {
        id: 'opt-play-46-free-partner',
        tile: [4, 6],
        targetEnd: 6,
        isCorrect: true,
        tacticalPrinciple: 'Liberar el doble del compañero por deducción absoluta',
        explanation:
          '¡Deducción perfecta! Como ambos rivales pasaron a cuatros y tú tienes [4:6] y [4:0], el [4:4] está 100% seguro en manos de tu compañero. Al jugar [4:6] por la Punta Izquierda (6), abres el 4 para que tu compañero acueste su [4:4] y domine la mano.',
      },
      {
        id: 'opt-play-30',
        tile: [3, 0],
        targetEnd: 3,
        isCorrect: false,
        tacticalPrinciple: 'Ignorar la ficha asfixiada del compañero',
        explanation:
          'Jugar [3:0] por la Punta Derecha (3) deja al compañero con el [4:4] atorado ("ahorcado") en la mano sin poder acostarlo.',
      },
    ],
    tacticalTip:
      'En el dominó no hay fichas invisibles. El jugador que lleva la cuenta en la cabeza sabe exactamente qué ficha tiene su compañero antes de que la ponga en la mesa.',
  },
  {
    id: 'falso-tranque-peligro',
    title: '6. El Falso Tranque: Peligro de Cierre Cargado',
    chapter: 'Capítulo 6: Errores Fatales en el Final de Partida',
    difficulty: 'Maestro',
    situation:
      'La partida está muy reñida. La mesa tiene dos extremos abiertos: Punta Izquierda (6) y Punta Derecha (5). Tienes en tu mano [6:5] y [6:4]. Si juegas [6:5] por la Punta Derecha (5), dejas la mesa a seises y provocas el cierre. Pero tus puntos son 11 ([6:5]) y 10 ([6:4]) = 21 puntos. No conoces la mano exacta de tu compañero, y los rivales han estado jugando fichas livianas (blancas, unos y doses). ¿Trancas la partida?',
    context: {
      salidaBy: 'Rival Derecha',
      boardEnds: [6, 5], // [Punta Izquierda: 6, Punta Derecha: 5]
      centerIdx: 3,
      boardTiles: [
        { tile: [6, 2], playedBy: 3, playOrder: 7 },
        { tile: [2, 0], playedBy: 0, playOrder: 4 },
        { tile: [0, 1], playedBy: 3, playOrder: 3 },
        { tile: [1, 1], playedBy: 1, playOrder: 1 }, // Salida Rival Derecha
        { tile: [1, 2], playedBy: 2, playOrder: 2 },
        { tile: [2, 3], playedBy: 1, playOrder: 5 },
        { tile: [3, 5], playedBy: 2, playOrder: 6 },
      ],
      myHand: [
        [6, 5],
        [6, 4],
      ],
      knownPasses: [],
      notes: [
        'Tu mano está extremadamente cargada: sumas 21 puntos (y te quedarías con 10 pts del [6:4]).',
        'Los contrarios han estado descargando fichas de poco peso ([1:1], [0:1], [2:3]).',
        'Trancar ahora significa arriesgar un conteo desfavorable con 10 puntos en tu mano frente al Rival Derecha.',
        'Puntas abiertas en mesa: Punta Izquierda (6) y Punta Derecha (5).',
      ],
    },
    question: '¿Qué jugada debes realizar por cuál punta?',
    options: [
      {
        id: 'opt-trancar-desesperado',
        tile: [6, 5],
        targetEnd: 5,
        isCorrect: false,
        tacticalPrinciple: 'El Suicidio del Tranque Cargado',
        explanation:
          '¡Desastre! Jugar [6:5] por la Punta Derecha (5) para trancar cargado con más de 20 puntos en la mano es regalarle la partida a los contrarios. Tu equipo perderá el conteo.',
      },
      {
        id: 'opt-abrir-descarga',
        tile: [6, 4],
        targetEnd: 6,
        isCorrect: true,
        tacticalPrinciple: 'Descarga de peso y mantener el juego fluido',
        explanation:
          '¡Correcto! Juegas el [6:4] por la Punta Izquierda (6) dejando la punta abierta en 4. Descargas peso sin forzar un tranque suicida.',
      },
    ],
    tacticalTip:
      'El que tranca cargado de puntos se ahorca con su propia soga. El tranque es el arma del jugador liviano, no del que tiene piedras en la mano.',
  },
  {
    id: 'acostar-doble-primero',
    title: '7. Primero se Acuesta el Doble y Después se Corre',
    chapter: 'Capítulo 7: Administración de los Dobles',
    difficulty: 'Principiante',
    situation:
      'Tu compañero (al frente) salió con [4:4]. El Rival Izquierda jugó [4:6], tú respondiste [6:1], el Rival Derecha jugó [1:3], tu compañero jugó [3:2] abriendo el [2] por la derecha, y el Rival Izquierda acaba de pasar. Las puntas son Punta Izquierda [4] y Punta Derecha [2]. En tu mano tienes únicamente dos doses: el doble [2:2] y el [2:5], además de [5:0], [3:0], [1:0] y [0:0]. ¿Cómo juegas por la Punta Derecha (2)?',
    context: {
      salidaBy: 'Compañero',
      boardEnds: [4, 2],
      centerIdx: 0,
      boardTiles: [
        { tile: [4, 4], playedBy: 2, playOrder: 1 },
        { tile: [4, 6], playedBy: 3, playOrder: 2 },
        { tile: [6, 1], playedBy: 0, playOrder: 3 },
        { tile: [1, 3], playedBy: 1, playOrder: 4 },
        { tile: [3, 2], playedBy: 2, playOrder: 5 },
      ],
      myHand: [
        [2, 2],
        [2, 5],
        [5, 0],
        [3, 0],
        [1, 0],
        [0, 0],
      ],
      knownPasses: [
        { player: 'Rival Izquierda', suit: 4 },
        { player: 'Rival Izquierda', suit: 2 },
      ],
      notes: [
        'Solo tienes un acompañante ([2:5]) para tu doble [2:2].',
        'Rival Izquierda acaba de pasar a 4 y 2.',
        'Puntas abiertas en mesa: Punta Izquierda (4) y Punta Derecha (2).',
      ],
    },
    question: '¿Juegas primero la ficha mixta [2:5] o acuestas el doble [2:2]?',
    options: [
      {
        id: 'opt-acostar-22',
        tile: [2, 2],
        targetEnd: 2,
        isCorrect: true,
        tacticalPrinciple: 'Ley de Oro: Primero se acuesta el doble y después se corre',
        explanation:
          '¡Exacto! Cuando solo tienes un respaldo para tu doble, debes acostar el [2:2] en cuanto se abra la puerta. Te quitas un doble de encima, mantienes la punta en 2 y conservas el [2:5] como llave.',
      },
      {
        id: 'opt-correr-25',
        tile: [2, 5],
        targetEnd: 2,
        isCorrect: false,
        tacticalPrinciple: 'Error clásico: Matar tu propia puerta y ahorcar el doble',
        explanation:
          '¡Peligro mortal! Si juegas primero [2:5] teniendo solo dos doses, tú mismo matas el 2 y te quedas con el [2:2] sin respaldo ("ahorcado") en la mano a merced de que nadie vuelva a abrir el 2.',
      },
    ],
    tacticalTip:
      'Con un solo acompañante jamás se guarda el doble: «primero se acuesta el doble y después se corre la ficha mixta».',
  },
  {
    id: 'ficha-puente-llave',
    title: '8. El Poder de la Ficha Puente (Cuadre al Pase)',
    chapter: 'Capítulo 8: El Cuadre y la Ficha Llave',
    difficulty: 'Intermedio',
    situation:
      'Saliste con [5:5] e hiciste pasar al Rival Derecha en cincos. Tu compañero jugó [5:4] y el Rival Izquierda jugó [4:2]. Ahora las puntas abiertas son Punta Izquierda [5] y Punta Derecha [2]. Tienes en tu mano la Ficha Puente [5:2] que conecta ambos extremos, además de [5:1], [5:0], [3:1], [3:0] y [1:0]. ¿Qué jugada realizas?',
    context: {
      salidaBy: 'Tú',
      boardEnds: [5, 2],
      centerIdx: 0,
      boardTiles: [
        { tile: [5, 5], playedBy: 0, playOrder: 1 },
        { tile: [5, 4], playedBy: 2, playOrder: 2 },
        { tile: [4, 2], playedBy: 3, playOrder: 3 },
      ],
      myHand: [
        [5, 2],
        [5, 1],
        [5, 0],
        [3, 1],
        [3, 0],
        [1, 0],
      ],
      knownPasses: [
        { player: 'Rival Derecha', suit: 5 },
      ],
      notes: [
        'Rival Derecha ya pasó a cincos en la primera vuelta.',
        'Tienes la ficha puente [5:2] que conecta ambas puntas (5 y 2).',
        'Además conservas dos cincos más ([5:1] y [5:0]).',
        'Puntas abiertas en mesa: Punta Izquierda (5) y Punta Derecha (2).',
      ],
    },
    question: '¿Cómo utilizas la Ficha Puente [5:2] para dominar la mesa?',
    options: [
      {
        id: 'opt-puente-derecha-2',
        tile: [5, 2],
        targetEnd: 2,
        isCorrect: true,
        tacticalPrinciple: 'Usar la Ficha Puente para cuadrar al pase del Rival Derecha',
        explanation:
          '¡Jugada demoledora! Juegas [5:2] por la Punta Derecha (2) matando el 2 y cuadrando la mesa a cincos (5 y 5). Como el Rival Derecha ya pasó al 5, vuelve a pasar obligatoriamente, tu compañero juega libre y tú conservas [5:1] y [5:0].',
      },
      {
        id: 'opt-puente-izquierda-5',
        tile: [5, 2],
        targetEnd: 5,
        isCorrect: false,
        tacticalPrinciple: 'Cuadrar al número equivocado matando tu propia fuerza',
        explanation:
          '¡Error grave! Si juegas [5:2] por la Punta Izquierda (5), matas tu propio 5 y cuadras la mesa a doses (2 y 2), perdiendo el castigo sobre el Rival Derecha y quedándote sin doses.',
      },
      {
        id: 'opt-abrir-51',
        tile: [5, 1],
        targetEnd: 5,
        isCorrect: false,
        tacticalPrinciple: 'Desperdiciar el cuadre dejando dos puertas al rival',
        explanation:
          'Jugar [5:1] por la Punta Izquierda (5) quita el 5 de la mesa y deja abiertas las puntas 1 y 2 para que el Rival Derecha entre cómodamente en juego.',
      },
    ],
    tacticalTip:
      'Quien tiene la Ficha Puente tiene el timón de la mano: úsala siempre para cuadrar al número donde el Rival Derecha ya pasó o donde tengas mayoría.',
  },
  {
    id: 'cambio-de-mando',
    title: '9. El Cambio de Mando (Excepción de la Mano Mayor)',
    chapter: 'Capítulo 2: El Binomio y el Lenguaje de las Fichas',
    difficulty: 'Intermedio',
    situation:
      'Estamos en la Mano #1 del partido (marcador 0 - 0). Por regla dominicana obligatoria, tu compañero (al frente) tuvo que abrir con el Doble Seis [6:6]. El Rival Izquierda jugó [6:4], dejando abiertas Punta Izquierda [6] y Punta Derecha [4]. Miras tus 7 fichas y tienes una mano monstruosa de 6 treses: [6:3], [3:3], [3:5], [3:2], [3:1], [3:0], más el [4:1]. ¿Qué haces?',
    context: {
      salidaBy: 'Compañero',
      boardEnds: [6, 4],
      centerIdx: 0,
      boardTiles: [
        { tile: [6, 6], playedBy: 2, playOrder: 1 },
        { tile: [6, 4], playedBy: 3, playOrder: 2 },
      ],
      myHand: [
        [6, 3],
        [3, 3],
        [3, 5],
        [3, 2],
        [3, 1],
        [3, 0],
        [4, 1],
      ],
      knownPasses: [],
      notes: [
        'En la Mano #1 (0-0), el [6:6] de tu compañero fue una salida obligatoria por reglamento, no una salida libre.',
        'Posees 6 de los 7 treses de toda la baraja (incluyendo el [3:3]).',
        'Puntas abiertas en mesa: Punta Izquierda (6) y Punta Derecha (4).',
      ],
    },
    question: '¿Respetas el 6 obligatorio de tu compañero o ejecutas el Cambio de Mando?',
    options: [
      {
        id: 'opt-cambio-mando-63',
        tile: [6, 3],
        targetEnd: 6,
        isCorrect: true,
        tacticalPrinciple: 'Excepción de la Mano Mayor: Imponer monopolio de 6 fichas',
        explanation:
          '¡Decisión magistral! El [6:6] en 0-0 fue salida obligatoria. Como tú eres dueño de 6 de los 7 treses de la baraja, aplicas la Excepción de la Mano Mayor: juegas [6:3] por la Punta Izquierda (6) para abrir tu número invencible y adueñarte de la mano.',
      },
      {
        id: 'opt-respeto-ciego-41',
        tile: [4, 1],
        targetEnd: 4,
        isCorrect: false,
        tacticalPrinciple: 'Respeto ciego que encierra una mano ganadora de 6 fichas',
        explanation:
          'Si juegas [4:1] por la Punta Derecha (4), dejas la mesa en 6 y 1 (números de los que ya no te queda ninguna ficha) y dejas tus 6 treses encerrados sin abrir.',
      },
    ],
    tacticalTip:
      'La salida del compañero es sagrada, salvo en una única excepción: cuando fue salida forzada (0-0) o cuando tú tienes 5 o 6 fichas de otro número con su doble.',
  },
  {
    id: 'lectura-la-pensada',
    title: '10. Psicología de Mesa: Lectura de «La Pensada»',
    chapter: 'Capítulo 9: Lectura de Tiempos y Deducción',
    difficulty: 'Maestro',
    situation:
      'Tu compañero salió con [0:0]. En la jugada #3 tú abriste el 5 jugando [5:0] por la izquierda, y el Rival Derecha no tocó el 5 (jugó [3:2] por la derecha). Con puntas [5] y [2], tu compañero se detuvo a pensar durante 12 segundos antes de jugar [4:5] por la izquierda. En cambio, el Rival Izquierda tiró al instante sin pensar el [2:1] por la derecha. Hoy las puntas son Punta Izquierda [4] y Punta Derecha [1]. Tu mano es: [1:5], [4:3] y [1:6]. ¿Qué juegas?',
    context: {
      salidaBy: 'Compañero',
      boardEnds: [4, 1],
      centerIdx: 2,
      boardTiles: [
        { tile: [4, 5], playedBy: 2, playOrder: 5 },
        { tile: [5, 0], playedBy: 0, playOrder: 3 },
        { tile: [0, 0], playedBy: 2, playOrder: 1 },
        { tile: [0, 3], playedBy: 3, playOrder: 2 },
        { tile: [3, 2], playedBy: 1, playOrder: 4 },
        { tile: [2, 1], playedBy: 3, playOrder: 6 },
      ],
      myHand: [
        [1, 5],
        [4, 3],
        [1, 6],
      ],
      knownPasses: [],
      notes: [
        '«Ficha única no se piensa»: Tu compañero pensó 12 segundos antes de jugar [4:5] sobre el 5.',
        'Esa pensada revela que tu compañero tenía al menos otro 5 en la mano (como el [5:5]) y dudó cuál jugar.',
        'Rival Izquierda tiró [2:1] al instante (tiro obligado sin más opciones).',
        'Puntas abiertas en mesa: Punta Izquierda (4) y Punta Derecha (1).',
      ],
    },
    question: '¿Cómo aprovechas la información de la pensada de tu compañero?',
    options: [
      {
        id: 'opt-devolver-15',
        tile: [1, 5],
        targetEnd: 1,
        isCorrect: true,
        tacticalPrinciple: 'Lectura de «La Pensada»: Reabrir el número donde el compañero dudó',
        explanation:
          '¡Lectura de maestro! Quien tiene una sola ficha jugable tira sin pensar. Al haber pensado largo rato en el 5 antes de soltar [4:5], tu compañero te avisó que se quedó con más cincos (probablemente el [5:5]). Juegas [1:5] por la Punta Derecha (1) para reabrirle el 5.',
      },
      {
        id: 'opt-matar-43',
        tile: [4, 3],
        targetEnd: 4,
        isCorrect: false,
        tacticalPrinciple: 'Matar el 4 que dejó el compañero e ignorar su pensada',
        explanation:
          'Jugar [4:3] por la Punta Izquierda (4) le mata el 4 que tu propio compañero acaba de poner y además no le devuelve el 5 que se quedó guardando.',
      },
      {
        id: 'opt-abrir-16',
        tile: [1, 6],
        targetEnd: 1,
        isCorrect: false,
        tacticalPrinciple: 'Abrir un número nuevo teniendo la devolución exacta del compañero',
        explanation:
          'Jugar [1:6] abre los seises a ciegas en vez de devolverle el 5 donde tu compañero demostró tener respaldo.',
      },
    ],
    tacticalTip:
      'En el dominó de alto nivel se juega con los ojos y con el oído: el jugador que tira al toque lleva carta única; el que piensa lleva opciones en ese número.',
  },
  {
    id: 'defensa-ley-de-una',
    title: '11. Emergencia: Rival «A Ley de Una» (1 Ficha)',
    chapter: 'Capítulo 10: Defensa Extrema en Cierre',
    difficulty: 'Maestro',
    situation:
      '¡Alarma en la mesa! El Rival Derecha (que juega inmediatamente después de ti) se acaba de quedar con 1 sola ficha en la mano («a ley de una» para pegarse). Las puntas son Punta Izquierda [4] y Punta Derecha [2]. Ves 4 cuatros jugados en la mesa ([4:4], [1:4], [4:3], [4:0]), y tú tienes en tu mano los otros 3 cuatros restantes de la baraja: [4:2], [4:5] y [4:6], además del [2:5]. ¿Cómo impides con 100% de certeza que se pegue?',
    context: {
      salidaBy: 'Rival Derecha',
      boardEnds: [4, 2],
      centerIdx: 3,
      boardTiles: [
        { tile: [4, 0], playedBy: 1, playOrder: 5 },
        { tile: [0, 1], playedBy: 0, playOrder: 4 },
        { tile: [1, 4], playedBy: 2, playOrder: 2 },
        { tile: [4, 4], playedBy: 1, playOrder: 1 },
        { tile: [4, 3], playedBy: 3, playOrder: 3 },
        { tile: [3, 2], playedBy: 2, playOrder: 6 },
      ],
      myHand: [
        [4, 2],
        [4, 5],
        [4, 6],
        [2, 5],
      ],
      knownPasses: [
        { player: 'Rival Izquierda', suit: 4 },
        { player: 'Rival Izquierda', suit: 2 },
      ],
      notes: [
        'Rival Derecha tiene 1 sola ficha en la mano (si toca mesa, hace Dominó).',
        '4 cuatros en mesa + 3 cuatros en tu mano ([4:2], [4:5], [4:6]) = ¡7 cuatros completos!',
        'Nadie más en la mesa tiene un solo cuatro.',
        'Puntas abiertas en mesa: Punta Izquierda (4) y Punta Derecha (2).',
      ],
    },
    question: '¿Qué ficha juegas y por cuál punta para bloquear al Rival Derecha?',
    options: [
      {
        id: 'opt-cuadrar-a-4-muerto',
        tile: [4, 2],
        targetEnd: 2,
        isCorrect: true,
        tacticalPrinciple: 'Cuadrar al número muerto contra rival a ley de una',
        explanation:
          '¡Bloqueo quirúrgico perfecto! Al jugar [4:2] por la Punta Derecha (2), matas el 2 y cuadras la mesa a cuatros (4 y 4). Como tú tienes los últimos cuatros de la baraja ([4:5] y [4:6]), hay 0% de probabilidad de que el Rival Derecha tenga un 4. ¡Pasa obligado con 1 ficha en la mano!',
      },
      {
        id: 'opt-cuadrar-a-2-vivo',
        tile: [4, 2],
        targetEnd: 4,
        isCorrect: false,
        tacticalPrinciple: 'Error fatal: Cuadrar a un número vivo cuando tienes el número muerto',
        explanation:
          'Si juegas [4:2] por la Punta Izquierda (4), cuadras la mesa a doses (2 y 2), donde todavía quedan 4 doses vivos afuera. Le das puerta abierta para que se pegue.',
      },
      {
        id: 'opt-dejar-descuadrado-25',
        tile: [2, 5],
        targetEnd: 2,
        isCorrect: false,
        tacticalPrinciple: 'Dejar dos puntas distintas abiertas al jugador de 1 ficha',
        explanation:
          'Jugar [2:5] por la Punta Derecha (2) abre el 5, que puede ser exactamente la última ficha que tiene el Rival Derecha en la mano.',
      },
    ],
    tacticalTip:
      'Contra un rival a ley de una ficha jamás dejes dos puntas distintas abiertas: cuadra siempre la mesa al número más gastado o donde tengas el control total.',
  },
  {
    id: 'descuadre-defensivo',
    title: '12. El Descuadre Defensivo: Darle Aire al Compañero',
    chapter: 'Capítulo 8: El Cuadre y la Ficha Llave',
    difficulty: 'Intermedio',
    situation:
      'Tu compañero (al frente) viene sufriendo en la mano: ya pasó al 6 y al 5 en turnos previos. En la mesa las puntas abiertas son Punta Izquierda [3] y Punta Derecha [1]. En tu mano tienes la ficha puente [3:1], además de [3:4] y [1:6]. Quieres maximizar la probabilidad de que tu compañero pueda jugar en esta vuelta sin volver a pasar. ¿Qué juegas?',
    context: {
      salidaBy: 'Rival Izquierda',
      boardEnds: [3, 1],
      centerIdx: 1,
      boardTiles: [
        { tile: [3, 6], playedBy: 1, playOrder: 3 },
        { tile: [6, 6], playedBy: 3, playOrder: 1 },
        { tile: [6, 2], playedBy: 0, playOrder: 2 },
        { tile: [2, 1], playedBy: 3, playOrder: 4 },
      ],
      myHand: [
        [3, 4],
        [3, 1],
        [1, 6],
      ],
      knownPasses: [
        { player: 'Compañero', suit: 6 },
        { player: 'Compañero', suit: 5 },
      ],
      notes: [
        'Tu compañero ya pasó al 6 y al 5.',
        'Cuando el compañero está corto de números, cuadrar la mesa le reduce las puertas a la mitad.',
        'Puntas abiertas en mesa: Punta Izquierda (3) y Punta Derecha (1).',
      ],
    },
    question: '¿Cuadras la mesa o la mantienes descuadrada con números frescos?',
    options: [
      {
        id: 'opt-descuadrar-34',
        tile: [3, 4],
        targetEnd: 3,
        isCorrect: true,
        tacticalPrinciple: 'Descuadre Defensivo: Abrir dos puertas frescas al compañero',
        explanation:
          '¡Gran juego en equipo! Al jugar [3:4] por la Punta Izquierda (3), dejas la mesa descuadrada en dos números frescos (4 y 1) en los que tu compañero no ha pasado, dándole el doble de opciones para entrar en juego.',
      },
      {
        id: 'opt-cuadrar-31',
        tile: [3, 1],
        targetEnd: 3,
        isCorrect: false,
        tacticalPrinciple: 'Asfixiar al compañero cuadrando la mesa sin necesidad',
        explanation:
          'Si juegas el puente [3:1], dejas ambas puntas a unos (1 y 1). Cuando tu compañero viene pasando, dejar un solo número en mesa aumenta enormemente el riesgo de hacerle pasar otra vez.',
      },
      {
        id: 'opt-repetir-pase-16',
        tile: [1, 6],
        targetEnd: 1,
        isCorrect: false,
        tacticalPrinciple: 'Poner en mesa el número donde ya pasó tu propio compañero',
        explanation:
          '¡Prohibido! Tu compañero ya pasó al 6. Jugar [1:6] por la Punta Derecha (1) le vuelve a poner en la mesa un número muerto para él.',
      },
    ],
    tacticalTip:
      'Cuando tu pareja domina, cuadra para asfixiar al rival; cuando tu compañero sufre pases, descuadra y abre números nuevos para darle aire.',
  },
];
