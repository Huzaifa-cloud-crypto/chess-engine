<script setup lang="ts">
import { computed } from 'vue';
import { Chess, type Square } from 'chess.js';
import { getPieceSvg } from '../utils/pieceSvgs';

const props = defineProps<{
  chess: Chess;
  orientation: 'w' | 'b';
  selectedSquare: string | null;
  legalMoves: string[];
  lastMove: { from: string; to: string } | null;
  isEngineThinking: boolean;
}>();

const emit = defineEmits<{
  (e: 'select-square', square: string): void;
  (e: 'make-move', move: { from: string; to: string }): void;
}>();

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

// Displayed ranks and files based on board orientation (auto-flip according to player color)
const displayedRanks = computed(() => {
  return props.orientation === 'w' ? ranks : [...ranks].reverse();
});

const displayedFiles = computed(() => {
  return props.orientation === 'w' ? files : [...files].reverse();
});

// Flat array of 64 board squares in rendered order
const boardSquares = computed(() => {
  const squares: {
    square: Square;
    file: string;
    rank: string;
    isLight: boolean;
    piece: { type: string; color: 'w' | 'b' } | null;
  }[] = [];

  for (let r = 0; r < 8; r++) {
    const rank = displayedRanks.value[r];
    for (let f = 0; f < 8; f++) {
      const file = displayedFiles.value[f];
      const sq = `${file}${rank}` as Square;
      const fileIdx = file.charCodeAt(0) - 97;
      const rankIdx = parseInt(rank, 10) - 1;
      const isLight = (fileIdx + rankIdx) % 2 !== 0;
      const piece = props.chess.get(sq);

      squares.push({
        square: sq,
        file,
        rank,
        isLight,
        piece: piece ? { type: piece.type, color: piece.color } : null,
      });
    }
  }

  return squares;
});

// Identify if King is in check
const kingInCheckSquare = computed<string | null>(() => {
  if (!props.chess.inCheck()) return null;
  const turn = props.chess.turn();
  const board = props.chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'k' && p.color === turn) {
        const file = String.fromCharCode(97 + c);
        const rank = (8 - r).toString();
        return `${file}${rank}`;
      }
    }
  }
  return null;
});

function handleSquareClick(square: string) {
  if (props.isEngineThinking) return;

  // If a square is already selected and clicked square is in legalMoves, emit make-move
  if (props.selectedSquare && props.legalMoves.includes(square)) {
    emit('make-move', {
      from: props.selectedSquare,
      to: square,
    });
    return;
  }

  // Otherwise select the piece if it belongs to current player turn
  const piece = props.chess.get(square as Square);
  if (piece && piece.color === props.chess.turn()) {
    emit('select-square', square);
  } else {
    emit('select-square', '');
  }
}
</script>

<template>
  <div class="relative w-full max-w-[440px] mx-auto select-none">
    <!-- 8x8 Grid Container with Algebraic Border Labels matching sketch -->
    <div class="relative bg-slate-950 p-2 sm:p-3 rounded-lg border-2 border-slate-800 shadow-2xl">
      <!-- Left Rank Numbers (8 down to 1) matching sketch wireframe -->
      <div class="absolute left-0.5 sm:left-1 top-2 bottom-6 sm:top-3 sm:bottom-7 w-3 sm:w-4 flex flex-col justify-around items-center text-[10px] sm:text-[11px] font-mono text-slate-400 font-semibold pointer-events-none z-10">
        <span v-for="rank in displayedRanks" :key="'rank-' + rank">
          {{ rank }}
        </span>
      </div>

      <!-- Chessboard Grid with 64 Squares -->
      <div class="grid grid-cols-8 grid-rows-8 ml-3.5 sm:ml-4 mb-3.5 sm:mb-4 border border-slate-800 rounded overflow-hidden aspect-square">
        <div
          v-for="cell in boardSquares"
          :key="cell.square"
          @click="handleSquareClick(cell.square)"
          :class="[
            cell.isLight
              ? 'bg-[#e2d6b5] hover:bg-[#eae0c8]'
              : 'bg-[#b88b4a] hover:bg-[#c29655]',
            cell.square === selectedSquare ? '!bg-[#f6f669]/90 ring-2 ring-amber-400 z-10' : '',
            lastMove && (cell.square === lastMove.from || cell.square === lastMove.to) ? 'brightness-110 !bg-[#d5b066]' : '',
            cell.square === kingInCheckSquare ? '!bg-red-600/90 ring-4 ring-red-500 animate-pulse z-10' : ''
          ]"
          class="relative flex items-center justify-center transition-colors duration-150 cursor-pointer aspect-square"
          :data-square="cell.square"
        >
          <!-- Piece Rendering via SVG Staunton Asset matching sketch -->
          <div
            v-if="cell.piece"
            v-html="getPieceSvg(cell.piece.type, cell.piece.color)"
            class="w-[84%] h-[84%] flex items-center justify-center pointer-events-none transition-transform duration-100 hover:scale-105"
          ></div>

          <!-- Legal Move Dot (empty square) -->
          <div
            v-if="legalMoves.includes(cell.square) && !cell.piece"
            class="w-3.5 h-3.5 rounded-full bg-slate-900/40 pointer-events-none border border-slate-900/60"
          ></div>

          <!-- Legal Capture Ring (piece present) -->
          <div
            v-if="legalMoves.includes(cell.square) && cell.piece"
            class="absolute inset-0.5 border-4 border-slate-900/40 rounded-full pointer-events-none animate-pulse"
          ></div>
        </div>
      </div>

      <!-- Bottom File Letters (a to h) matching sketch wireframe -->
      <div class="absolute bottom-0.5 sm:bottom-1 left-5 right-2 sm:left-6 sm:right-3 h-3 sm:h-4 flex justify-around items-center text-[10px] sm:text-[11px] font-mono text-slate-400 font-semibold pointer-events-none z-10">
        <span v-for="file in displayedFiles" :key="'file-' + file">
          {{ file }}
        </span>
      </div>
    </div>
  </div>
</template>
