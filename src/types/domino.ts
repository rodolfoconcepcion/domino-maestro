export type Tile = [number, number];

export interface ScenarioBoardTile {
  tile: Tile;
  playedBy: number; // 0: Tú, 1: Rival Derecha, 2: Compañero, 3: Rival Izquierda
  playOrder?: number;
}

export interface PuzzleScenario {
  id: string;
  title: string;
  chapter: string;
  difficulty: 'Principiante' | 'Intermedio' | 'Maestro';
  situation: string;
  context: {
    salidaBy: 'Tú' | 'Compañero' | 'Rival Derecha' | 'Rival Izquierda';
    boardEnds: [number, number]; // [Punta Izquierda, Punta Derecha]
    boardTiles?: ScenarioBoardTile[];
    centerIdx?: number;
    myHand: Tile[];
    knownPasses: {
      player: string;
      suit: number;
    }[];
    notes: string[];
  };
  question: string;
  options: {
    id: string;
    tile: Tile;
    targetEnd?: number;
    explanation: string;
    isCorrect: boolean;
    tacticalPrinciple: string;
  }[];
  tacticalTip: string;
}

export type PlayerPosition = 'bottom' | 'top' | 'left' | 'right';

export interface GamePlayer {
  id: string;
  name: string;
  role: 'Tú' | 'Compañero' | 'Rival Derecha' | 'Rival Izquierda';
  position: PlayerPosition;
  hand: Tile[];
  passedSuits: number[];
  score: number;
}
