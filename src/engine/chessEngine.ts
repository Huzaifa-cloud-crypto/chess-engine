import { Chess } from 'chess.js';
import type { MoveEvaluation, EngineTelemetry } from '../types/chess';

// Standard piece values (centipawns)
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece Square Tables (from White's perspective, index 0 = a8, index 63 = h1)
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0,
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
];

const ROOK_TABLE = [
   0,  0,  0,  0,  0,  0,  0,  0,
   5, 10, 10, 10, 10, 10, 10,  5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
   0,  0,  0,  5,  5,  0,  0,  0,
];

const QUEEN_TABLE = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20,
];

const KING_TABLE = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20,
];

function getSquareIndex(square: string): number {
  const file = square.charCodeAt(0) - 97; // 'a' -> 0, 'h' -> 7
  const rank = 8 - parseInt(square[1], 10); // '8' -> 0, '1' -> 7
  return rank * 8 + file;
}

export function evaluateBoard(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -20000 : 20000;
  }
  if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition()) {
    return 0;
  }

  let totalScore = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const baseVal = PIECE_VALUES[piece.type] || 0;
      const idx = r * 8 + c;
      const flippedIdx = (7 - r) * 8 + c;

      let posBonus = 0;
      switch (piece.type) {
        case 'p':
          posBonus = piece.color === 'w' ? PAWN_TABLE[idx] : PAWN_TABLE[flippedIdx];
          break;
        case 'n':
          posBonus = piece.color === 'w' ? KNIGHT_TABLE[idx] : KNIGHT_TABLE[flippedIdx];
          break;
        case 'b':
          posBonus = piece.color === 'w' ? BISHOP_TABLE[idx] : BISHOP_TABLE[flippedIdx];
          break;
        case 'r':
          posBonus = piece.color === 'w' ? ROOK_TABLE[idx] : ROOK_TABLE[flippedIdx];
          break;
        case 'q':
          posBonus = piece.color === 'w' ? QUEEN_TABLE[idx] : QUEEN_TABLE[flippedIdx];
          break;
        case 'k':
          posBonus = piece.color === 'w' ? KING_TABLE[idx] : KING_TABLE[flippedIdx];
          break;
      }

      const pieceTotal = baseVal + posBonus;
      if (piece.color === 'w') {
        totalScore += pieceTotal;
      } else {
        totalScore -= pieceTotal;
      }
    }
  }

  return totalScore;
}

// Move Ordering heuristic to maximize alpha-beta pruning efficiency
function scoreMoveForOrdering(chess: Chess, move: { from: string; to: string; captured?: string; promotion?: string }): number {
  let score = 0;
  const targetPiece = chess.get(move.to as any);
  const attackerPiece = chess.get(move.from as any);

  // MVV-LVA: Capture of high value by low value
  if (targetPiece && attackerPiece) {
    const victimVal = PIECE_VALUES[targetPiece.type] || 0;
    const attackerVal = PIECE_VALUES[attackerPiece.type] || 0;
    score += victimVal * 10 - attackerVal;
  }

  // Promotion bonus
  if (move.promotion) {
    score += 800;
  }

  // Central squares bonus
  if (['d4', 'd5', 'e4', 'e5'].includes(move.to)) {
    score += 30;
  }

  return score;
}

export function searchBestMove(
  chess: Chess,
  depth: number = 4
): { bestMove: any; telemetry: EngineTelemetry } {
  const startTime = performance.now();
  let nodesVisited = 0;
  let prunedBranches = 0;

  const isMaximizing = chess.turn() === 'w';
  const moves = chess.moves({ verbose: true });

  if (moves.length === 0) {
    return {
      bestMove: null,
      telemetry: {
        evalScore: 0,
        evalText: '0.00',
        nodesVisited: 0,
        prunedBranches: 0,
        latencyMs: 0,
        moveOrdering: [],
        depthSearched: depth,
        isSearching: false,
      },
    };
  }

  // Sort candidate moves with heuristic
  const scoredCandidateMoves = moves.map(m => ({
    move: m,
    heuristicScore: scoreMoveForOrdering(chess, m),
  })).sort((a, b) => b.heuristicScore - a.heuristicScore);

  let bestMove = scoredCandidateMoves[0].move;
  let bestScore = isMaximizing ? -Infinity : Infinity;
  const moveEvaluations: MoveEvaluation[] = [];

  function minimax(
    d: number,
    alpha: number,
    beta: number,
    maximizing: boolean
  ): number {
    nodesVisited++;

    if (d === 0 || chess.isGameOver()) {
      return evaluateBoard(chess);
    }

    const currentMoves = chess.moves({ verbose: true });
    // Sort moves for pruning
    currentMoves.sort((a, b) => scoreMoveForOrdering(chess, b) - scoreMoveForOrdering(chess, a));

    if (maximizing) {
      let maxEval = -Infinity;
      for (const m of currentMoves) {
        chess.move(m);
        const evalScore = minimax(d - 1, alpha, beta, false);
        chess.undo();

        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) {
          prunedBranches++;
          break; // Beta cutoff
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const m of currentMoves) {
        chess.move(m);
        const evalScore = minimax(d - 1, alpha, beta, true);
        chess.undo();

        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) {
          prunedBranches++;
          break; // Alpha cutoff
        }
      }
      return minEval;
    }
  }

  let alpha = -Infinity;
  let beta = Infinity;

  for (const candidate of scoredCandidateMoves) {
    chess.move(candidate.move);
    const score = minimax(depth - 1, alpha, beta, !isMaximizing);
    chess.undo();

    moveEvaluations.push({
      san: candidate.move.san,
      from: candidate.move.from,
      to: candidate.move.to,
      score: score / 100, // in pawns
      captured: candidate.move.captured,
    });

    if (isMaximizing) {
      if (score > bestScore) {
        bestScore = score;
        bestMove = candidate.move;
      }
      alpha = Math.max(alpha, score);
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = candidate.move;
      }
      beta = Math.min(beta, score);
    }
  }

  // Sort candidate move ordering
  moveEvaluations.sort((a, b) => (isMaximizing ? b.score - a.score : a.score - b.score));

  const endTime = performance.now();
  const latencyMs = Math.round(endTime - startTime);
  const evalScorePawn = bestScore / 100;
  const evalFormatted = evalScorePawn > 0 ? `+${evalScorePawn.toFixed(2)}` : evalScorePawn.toFixed(2);

  return {
    bestMove,
    telemetry: {
      evalScore: evalScorePawn,
      evalText: evalFormatted,
      nodesVisited,
      prunedBranches,
      latencyMs,
      moveOrdering: moveEvaluations.slice(0, 5),
      depthSearched: depth,
      isSearching: false,
      bestMoveSan: bestMove?.san,
    },
  };
}
