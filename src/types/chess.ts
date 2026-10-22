export type PieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Color = 'w' | 'b';
export type Square = string;

export interface MoveEvaluation {
  san: string;
  from: string;
  to: string;
  score: number;
  captured?: string;
  isCheck?: boolean;
}

export interface EngineTelemetry {
  evalScore: number;
  evalText: string;
  nodesVisited: number;
  prunedBranches: number;
  latencyMs: number;
  moveOrdering: MoveEvaluation[];
  depthSearched: number;
  isSearching: boolean;
  bestMoveSan?: string;
}

export interface InteractionNode {
  id: string;
  square: Square;
  piece: PieceSymbol;
  color: Color;
  label: string; // e.g. "bK", "bP", "wB", "wQ"
  name: string;
  value: number;
  x: number;
  y: number;
  attackersCount: number;
  defendersCount: number;
}

export interface InteractionEdge {
  id: string;
  fromSquare: Square;
  toSquare: Square;
  fromLabel: string;
  toLabel: string;
  fromColor: Color;
  toColor: Color;
  type: 'attacks' | 'defends' | 'pins';
  label: string; // e.g. "attacks (red)", "defends (green)"
}

export interface NetworkGraph {
  nodes: InteractionNode[];
  edges: InteractionEdge[];
}

export interface GameSettings {
  playerColor: Color;
  depth: number;
  autoFlip: boolean;
  timeControlMinutes: number;
}
