import { Chess } from 'chess.js';
import type { Color, PieceSymbol, Square, InteractionNode, InteractionEdge, NetworkGraph } from '../types/chess';
import { getPieceLabel, PIECE_NAMES, PIECE_VALUES } from '../utils/pieceSvgs';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

function fileRankToSquare(fileIdx: number, rankIdx: number): Square | null {
  if (fileIdx < 0 || fileIdx > 7 || rankIdx < 0 || rankIdx > 7) return null;
  return `${FILES[fileIdx]}${rankIdx + 1}` as Square;
}

function squareToFileRank(sq: string): [number, number] {
  const f = sq.charCodeAt(0) - 97;
  const r = parseInt(sq[1], 10) - 1;
  return [f, r];
}

export function computePieceInteractionGraph(
  chess: Chess,
  focusedSquare: Square | null = null
): NetworkGraph {
  const board = chess.board();
  const rawNodesMap = new Map<Square, {
    square: Square;
    piece: PieceSymbol;
    color: Color;
    label: string;
    attackers: number;
    defenders: number;
  }>();

  // 1. Gather all active pieces on the board
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      const sq = fileRankToSquare(c, 7 - r);
      if (!sq) continue;

      rawNodesMap.set(sq, {
        square: sq,
        piece: piece.type as PieceSymbol,
        color: piece.color as Color,
        label: getPieceLabel(piece.type, piece.color as Color),
        attackers: 0,
        defenders: 0,
      });
    }
  }

  const rawEdges: InteractionEdge[] = [];

  // Helper to add edge
  function addInteraction(
    fromSq: Square,
    toSq: Square,
    type: 'attacks' | 'defends'
  ) {
    const from = rawNodesMap.get(fromSq);
    const to = rawNodesMap.get(toSq);
    if (!from || !to) return;

    if (type === 'attacks') {
      to.attackers++;
    } else {
      to.defenders++;
    }

    const label = type === 'attacks' ? 'attacks (red)' : 'defends (green)';
    rawEdges.push({
      id: `${fromSq}->${toSq}:${type}`,
      fromSquare: fromSq,
      toSquare: toSq,
      fromLabel: from.label,
      toLabel: to.label,
      fromColor: from.color,
      toColor: to.color,
      type,
      label,
    });
  }

  // Helper to check ray directions for slider pieces
  function scanRays(fromSq: Square, f: number, r: number, directions: [number, number][], color: Color) {
    for (const [df, dr] of directions) {
      let curF = f + df;
      let curR = r + dr;
      while (curF >= 0 && curF <= 7 && curR >= 0 && curR <= 7) {
        const targetSq = fileRankToSquare(curF, curR);
        if (targetSq && rawNodesMap.has(targetSq)) {
          const target = rawNodesMap.get(targetSq)!;
          if (target.color === color) {
            addInteraction(fromSq, targetSq, 'defends');
          } else {
            addInteraction(fromSq, targetSq, 'attacks');
          }
          break; // Ray blocked
        }
        curF += df;
        curR += dr;
      }
    }
  }

  // 2. Scan every piece to detect attacks & defends
  for (const [sq, item] of rawNodesMap.entries()) {
    const [f, r] = squareToFileRank(sq);

    switch (item.piece) {
      case 'p': {
        const forward = item.color === 'w' ? 1 : -1;
        // Pawns attack diagonally forward
        for (const df of [-1, 1]) {
          const targetSq = fileRankToSquare(f + df, r + forward);
          if (targetSq && rawNodesMap.has(targetSq)) {
            const target = rawNodesMap.get(targetSq)!;
            addInteraction(sq, targetSq, target.color === item.color ? 'defends' : 'attacks');
          }
        }
        break;
      }
      case 'n': {
        const knightDeltas = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1],
        ];
        for (const [df, dr] of knightDeltas) {
          const targetSq = fileRankToSquare(f + df, r + dr);
          if (targetSq && rawNodesMap.has(targetSq)) {
            const target = rawNodesMap.get(targetSq)!;
            addInteraction(sq, targetSq, target.color === item.color ? 'defends' : 'attacks');
          }
        }
        break;
      }
      case 'b': {
        scanRays(sq, f, r, [[1, 1], [1, -1], [-1, 1], [-1, -1]], item.color);
        break;
      }
      case 'r': {
        scanRays(sq, f, r, [[1, 0], [-1, 0], [0, 1], [0, -1]], item.color);
        break;
      }
      case 'q': {
        scanRays(sq, f, r, [
          [1, 0], [-1, 0], [0, 1], [0, -1],
          [1, 1], [1, -1], [-1, 1], [-1, -1],
        ], item.color);
        break;
      }
      case 'k': {
        for (let df = -1; df <= 1; df++) {
          for (let dr = -1; dr <= 1; dr++) {
            if (df === 0 && dr === 0) continue;
            const targetSq = fileRankToSquare(f + df, r + dr);
            if (targetSq && rawNodesMap.has(targetSq)) {
              const target = rawNodesMap.get(targetSq)!;
              addInteraction(sq, targetSq, target.color === item.color ? 'defends' : 'attacks');
            }
          }
        }
        break;
      }
    }
  }

  // 3. Filter and select the most focal tactical subgraph
  // If focusedSquare is given, filter for all interactions involving focusedSquare
  let filteredEdges: InteractionEdge[] = [];
  if (focusedSquare && rawNodesMap.has(focusedSquare)) {
    filteredEdges = rawEdges.filter(
      (e) => e.fromSquare === focusedSquare || e.toSquare === focusedSquare
    );
  }

  // If no square is selected or selected has few edges, find the square under the most intense tension (attacks + defends)
  if (filteredEdges.length === 0) {
    let maxTensionSq: Square | null = null;
    let maxTension = -1;

    for (const [sq, node] of rawNodesMap.entries()) {
      // Focus on squares with both attackers and defenders (tactical clash like in the JPG wireframe)
      const tension = (node.attackers * 2) + node.defenders;
      if (tension > maxTension) {
        maxTension = tension;
        maxTensionSq = sq;
      }
    }

    if (maxTensionSq && maxTension > 0) {
      filteredEdges = rawEdges.filter(
        (e) => e.fromSquare === maxTensionSq || e.toSquare === maxTensionSq
      );
    } else {
      // Fallback: Show first 6-8 interactions
      filteredEdges = rawEdges.slice(0, 8);
    }
  }

  // Gather unique nodes present in filtered edges
  const involvedSquares = new Set<Square>();
  for (const edge of filteredEdges) {
    involvedSquares.add(edge.fromSquare);
    involvedSquares.add(edge.toSquare);
  }

  // If still empty (e.g. very early game with no contact yet), add central pawns and knights
  if (involvedSquares.size === 0) {
    const defaultPieces = ['e4', 'e5', 'd4', 'd5', 'c3', 'f3', 'c6', 'f6'];
    for (const sq of defaultPieces) {
      if (rawNodesMap.has(sq as Square)) {
        involvedSquares.add(sq as Square);
      }
    }
  }

  // 4. Compute 2D coordinates for visual network graph
  // Matches the sketch layout: central contested node with defenders above and attackers branching below/left/right!
  const nodes: InteractionNode[] = [];
  const squareArr = Array.from(involvedSquares);

  // Identify central focal node (most connected in this subgraph)
  let centerSquare = squareArr[0];
  let maxDegree = -1;
  for (const sq of squareArr) {
    const degree = filteredEdges.filter(e => e.fromSquare === sq || e.toSquare === sq).length;
    if (degree > maxDegree) {
      maxDegree = degree;
      centerSquare = sq;
    }
  }

  const width = 500;
  const height = 280;
  const centerX = width / 2;
  const centerY = height / 2 + 10;

  // Position nodes
  squareArr.forEach((sq, idx) => {
    const raw = rawNodesMap.get(sq)!;
    let x = centerX;
    let y = centerY;

    if (sq === centerSquare) {
      // Focal node in center (like bP in sketch)
      x = centerX;
      y = centerY;
    } else {
      // Check relationship with centerSquare
      const edgeToCenter = filteredEdges.find(e => e.toSquare === centerSquare && e.fromSquare === sq);
      const edgeFromCenter = filteredEdges.find(e => e.fromSquare === centerSquare && e.toSquare === sq);

      if (edgeToCenter?.type === 'defends') {
        // Defenders positioned at top (like bK in sketch)
        x = centerX + (idx % 2 === 0 ? 0 : (idx % 2 === 1 ? -60 : 60));
        y = centerY - 80;
      } else if (edgeToCenter?.type === 'attacks') {
        // Attackers positioned at bottom left / right (like wB and wQ in sketch)
        const isLeft = idx % 2 === 0;
        x = isLeft ? centerX - 120 : centerX + 120;
        y = centerY + 70;
      } else {
        // Circular distribution for others
        const angle = (idx / (squareArr.length - 1 || 1)) * 2 * Math.PI - Math.PI / 2;
        x = centerX + Math.cos(angle) * 125;
        y = centerY + Math.sin(angle) * 80;
      }
    }

    nodes.push({
      id: sq,
      square: sq,
      piece: raw.piece,
      color: raw.color,
      label: raw.label,
      name: `${raw.color === 'w' ? 'White' : 'Black'} ${PIECE_NAMES[raw.piece]} (${sq})`,
      value: PIECE_VALUES[raw.piece],
      x,
      y,
      attackersCount: raw.attackers,
      defendersCount: raw.defenders,
    });
  });

  return {
    nodes,
    edges: filteredEdges,
  };
}
