<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { Chess, type Square } from 'chess.js';
import ChessBoard from './ChessBoard.vue';
import PieceInteractionNetwork from './PieceInteractionNetwork.vue';
import TelemetryMetrics from './TelemetryMetrics.vue';
import { searchBestMove } from '../engine/chessEngine';
import { computePieceInteractionGraph } from '../engine/interactionNetwork';
import type { EngineTelemetry, NetworkGraph } from '../types/chess';
import {
  RotateCcw,
  Bot,
  User,
  Sliders,
  Home,
  Volume2,
  VolumeX,
  ChevronDown,
  RefreshCw,
  Trophy,
  AlertCircle
} from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    initialPlayerColor?: 'w' | 'b';
  }>(),
  {
    initialPlayerColor: 'w',
  }
);

const emit = defineEmits<{
  (e: 'go-home'): void;
}>();

// Sound effects generator using Web Audio API
let audioCtx: AudioContext | null = null;
const isMuted = ref(false);

function playChime(type: 'move' | 'capture' | 'check' | 'gameover') {
  if (isMuted.value) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    if (type === 'move') {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'capture') {
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.12);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.start(now);
      osc.stop(now + 0.14);
    } else if (type === 'check') {
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.setValueAtTime(950, now + 0.08);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else {
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (e) {
    // Audio context fallback ignored
  }
}

// Game State
const chess = ref(new Chess());
const playerColor = ref<'w' | 'b'>(props.initialPlayerColor);
const searchDepth = ref(5); // Default Depth = 5 matching sketch
const autoFlip = ref(true); // Rule in JPG: "Board will automatically flip according to the player's colour"
const isEngineThinking = ref(false);
const selectedSquare = ref<string | null>(null);
const lastMove = ref<{ from: string; to: string } | null>(null);

// Clocks (10:00 in sketch)
const initialTimeSeconds = 600; // 10 minutes
const engineTime = ref(initialTimeSeconds);
const playerTime = ref(initialTimeSeconds);
let timerInterval: number | null = null;

// Telemetry state
const telemetry = ref<EngineTelemetry>({
  evalScore: 0,
  evalText: '0.00',
  nodesVisited: 0,
  prunedBranches: 0,
  latencyMs: 0,
  moveOrdering: [],
  depthSearched: 5,
  isSearching: false,
});

// Dropdowns
const showNewGameMenu = ref(false);
const showDepthMenu = ref(false);

// Material balance calculation (e.g. Player ♟️ +3 in sketch)
const materialDifference = computed(() => {
  const board = chess.value.board();
  const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
  let whiteMaterial = 0;
  let blackMaterial = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || p.type === 'k') continue;
      if (p.color === 'w') {
        whiteMaterial += values[p.type] || 0;
      } else {
        blackMaterial += values[p.type] || 0;
      }
    }
  }

  const diff = playerColor.value === 'w' ? whiteMaterial - blackMaterial : blackMaterial - whiteMaterial;
  return diff;
});

// Board orientation
const boardOrientation = computed<'w' | 'b'>(() => {
  if (autoFlip.value) {
    return playerColor.value;
  }
  return 'w';
});

// Legal moves for selected square
const legalMoves = computed<string[]>(() => {
  if (!selectedSquare.value) return [];
  const moves = chess.value.moves({
    square: selectedSquare.value as Square,
    verbose: true,
  });
  return moves.map((m) => m.to);
});

// Piece Interaction Network
const interactionGraph = ref<NetworkGraph>({ nodes: [], edges: [] });

function refreshInteractionGraph() {
  interactionGraph.value = computePieceInteractionGraph(
    chess.value,
    selectedSquare.value
  );
}

// Clock format mm:ss
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Clock tick handler
function startClock() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = window.setInterval(() => {
    if (chess.value.isGameOver()) return;
    const currentTurn = chess.value.turn();
    const isPlayerTurn = currentTurn === playerColor.value;

    if (isPlayerTurn) {
      if (playerTime.value > 0) playerTime.value--;
    } else {
      if (engineTime.value > 0) engineTime.value--;
    }
  }, 1000);
}

// Trigger Engine Move
async function triggerEngineMove() {
  if (chess.value.isGameOver() || isEngineThinking.value) return;

  isEngineThinking.value = true;
  telemetry.value.isSearching = true;

  // Let UI paint thinking state
  await new Promise((resolve) => setTimeout(resolve, 80));

  const result = searchBestMove(chess.value, searchDepth.value);
  telemetry.value = result.telemetry;

  if (result.bestMove) {
    const moveRes = chess.value.move(result.bestMove);
    if (moveRes) {
      lastMove.value = { from: moveRes.from, to: moveRes.to };
      if (moveRes.captured) {
        playChime('capture');
      } else if (chess.value.inCheck()) {
        playChime('check');
      } else {
        playChime('move');
      }
    }
  }

  isEngineThinking.value = false;
  refreshInteractionGraph();

  if (chess.value.isGameOver()) {
    playChime('gameover');
  }
}

// Player makes a move
function handleMakeMove(move: { from: string; to: string }) {
  if (isEngineThinking.value || chess.value.isGameOver()) return;

  try {
    const moveResult = chess.value.move({
      from: move.from as Square,
      to: move.to as Square,
      promotion: 'q', // Auto queen promotion
    });

    if (moveResult) {
      lastMove.value = { from: moveResult.from, to: moveResult.to };
      selectedSquare.value = null;

      if (moveResult.captured) {
        playChime('capture');
      } else if (chess.value.inCheck()) {
        playChime('check');
      } else {
        playChime('move');
      }

      refreshInteractionGraph();

      // Trigger engine response if game active
      if (!chess.value.isGameOver()) {
        setTimeout(() => {
          triggerEngineMove();
        }, 150);
      } else {
        playChime('gameover');
      }
    }
  } catch (e) {
    // Invalid move rejected
  }
}

function handleSelectSquare(square: string) {
  selectedSquare.value = square || null;
  refreshInteractionGraph();
}

// Start New Game
function resetGame(color: 'w' | 'b' = 'w') {
  chess.value = new Chess();
  playerColor.value = color;
  selectedSquare.value = null;
  lastMove.value = null;
  playerTime.value = initialTimeSeconds;
  engineTime.value = initialTimeSeconds;
  showNewGameMenu.value = false;
  showDepthMenu.value = false;

  refreshInteractionGraph();
  startClock();

  // If player chose Black, engine moves first as White
  if (color === 'b') {
    setTimeout(() => {
      triggerEngineMove();
    }, 400);
  }
}

// Change Search Depth
function setDepth(depth: number) {
  searchDepth.value = depth;
  showDepthMenu.value = false;
}

watch(selectedSquare, () => {
  refreshInteractionGraph();
});

onMounted(() => {
  resetGame(playerColor.value);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
    <!-- TOP BAR matching sketch wireframe: ChessEngine | New Game v | Depth = 5 v -->
    <header class="bg-slate-900 border-b border-slate-800 px-4 md:px-8 py-3 sticky top-0 z-40 shadow-md">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <!-- Brand / Title: ChessEngine -->
        <div class="flex items-center gap-3">
          <button
            @click="emit('go-home')"
            title="Return to Homepage"
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <Home class="w-5 h-5" />
          </button>
          <div class="flex items-baseline gap-2">
            <span class="text-xl font-extrabold tracking-tight text-white font-mono flex items-center gap-1.5">
              <span class="text-emerald-400">♟</span> ChessEngine
            </span>
            <span class="hidden sm:inline-block text-[11px] text-slate-400 font-mono">
              NED SE Dept
            </span>
          </div>
        </div>

        <!-- Right Controls: New Game v & Depth = 5 v matching sketch -->
        <div class="flex items-center gap-3">
          <!-- Audio Toggle -->
          <button
            @click="isMuted = !isMuted"
            :title="isMuted ? 'Unmute Sound' : 'Mute Sound'"
            class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/60"
          >
            <VolumeX v-if="isMuted" class="w-4 h-4 text-rose-400" />
            <Volume2 v-else class="w-4 h-4 text-emerald-400" />
          </button>

          <!-- New Game dropdown matching sketch: [New Game v] -->
          <div class="relative">
            <button
              @click="showNewGameMenu = !showNewGameMenu; showDepthMenu = false"
              class="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-1.5 border border-slate-700 transition-all shadow-sm"
            >
              <RotateCcw class="w-3.5 h-3.5 text-cyan-400" />
              <span>New Game</span>
              <ChevronDown class="w-3.5 h-3.5 text-slate-400" />
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="showNewGameMenu"
              class="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95"
            >
              <div class="text-[11px] font-semibold text-slate-400 px-3 py-1 uppercase tracking-wider">
                Select Your Side
              </div>
              <button
                @click="resetGame('w')"
                class="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-800 flex items-center justify-between text-slate-200"
              >
                <span class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-white border border-slate-400"></span>
                  Play as White (First move)
                </span>
                <span v-if="playerColor === 'w'" class="text-emerald-400 text-xs">✓</span>
              </button>
              <button
                @click="resetGame('b')"
                class="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-800 flex items-center justify-between text-slate-200"
              >
                <span class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-slate-800 border border-slate-500"></span>
                  Play as Black (Engine first)
                </span>
                <span v-if="playerColor === 'b'" class="text-emerald-400 text-xs">✓</span>
              </button>
              <div class="border-t border-slate-800 my-1"></div>
              <button
                @click="autoFlip = !autoFlip"
                class="w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-slate-800 flex items-center justify-between text-slate-400"
              >
                <span>Auto-flip perspective</span>
                <span :class="autoFlip ? 'text-emerald-400 font-bold' : 'text-slate-500'">
                  {{ autoFlip ? 'ON' : 'OFF' }}
                </span>
              </button>
            </div>
          </div>

          <!-- Depth dropdown matching sketch: [Depth = 5 v] -->
          <div class="relative">
            <button
              @click="showDepthMenu = !showDepthMenu; showNewGameMenu = false"
              class="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-xs md:text-sm font-mono font-semibold flex items-center gap-1.5 border border-slate-700 transition-all shadow-sm"
            >
              <Sliders class="w-3.5 h-3.5 text-amber-400" />
              <span>Depth = {{ searchDepth }}</span>
              <ChevronDown class="w-3.5 h-3.5 text-slate-400" />
            </button>

            <!-- Depth Menu -->
            <div
              v-if="showDepthMenu"
              class="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95"
            >
              <div class="text-[11px] font-semibold text-slate-400 px-3 py-1 uppercase tracking-wider">
                Minimax Search Depth
              </div>
              <div class="space-y-0.5">
                <button
                  v-for="d in [1, 2, 3, 4, 5, 6, 7]"
                  :key="d"
                  @click="setDepth(d)"
                  class="w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-slate-800 flex items-center justify-between"
                  :class="searchDepth === d ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-300'"
                >
                  <span class="font-mono">Depth {{ d }}</span>
                  <span class="text-[10px] text-slate-500">
                    {{ d <= 3 ? 'Fast' : (d <= 5 ? 'Balanced' : 'Deep') }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- MAIN BODY: Grid layout matching sketch -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- LEFT COLUMN: Sticky Left Card with Board, Opponent & Player clocks (sketch exact layout) -->
        <div class="lg:col-span-5 lg:sticky lg:top-20 z-10 space-y-3">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
            <!-- Opponent Header: [Avatar Engine] ··· [Clock 10:00] matching sketch -->
            <div class="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 shadow-inner">
                  <Bot class="w-5 h-5" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-sm text-slate-100">Engine</span>
                    <span class="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-800/60">
                      Depth {{ searchDepth }}
                    </span>
                  </div>
                  <span class="text-[11px] text-slate-400 font-mono">
                    {{ playerColor === 'w' ? 'Black' : 'White' }} pieces
                  </span>
                </div>
              </div>

              <!-- Engine Clock: [10:00] matching sketch -->
              <div
                class="px-3.5 py-1.5 rounded-lg font-mono font-bold text-base md:text-lg border tabular-nums transition-colors shadow-inner"
                :class="[
                  chess.turn() !== playerColor
                    ? 'bg-amber-950/40 text-amber-300 border-amber-600/60 ring-2 ring-amber-500/20 animate-pulse'
                    : 'bg-slate-950 text-slate-300 border-slate-800'
                ]"
              >
                {{ formatTime(engineTime) }}
              </div>
            </div>

            <!-- CHESSBOARD (Real piece assets, 1-8 and a-h coordinates) matching sketch -->
            <div class="py-1">
              <ChessBoard
                :chess="chess"
                :orientation="boardOrientation"
                :selected-square="selectedSquare"
                :legal-moves="legalMoves"
                :last-move="lastMove"
                :is-engine-thinking="isEngineThinking"
                @select-square="handleSelectSquare"
                @make-move="handleMakeMove"
              />
            </div>

            <!-- Player Header: [Avatar Player & +3] ··· [Clock 10:00] matching sketch -->
            <div class="flex items-center justify-between pt-3 border-t border-slate-800/80 mt-3">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shadow-inner">
                  <User class="w-5 h-5" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-sm text-slate-100">Player</span>
                    <!-- Material Score Badge (e.g. ♟️ +3 in sketch) -->
                    <span
                      v-if="materialDifference !== 0"
                      class="text-[11px] font-mono font-semibold px-1.5 py-0.2 rounded"
                      :class="materialDifference > 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'"
                    >
                      {{ materialDifference > 0 ? `+${materialDifference}` : materialDifference }}
                    </span>
                  </div>
                  <span class="text-[11px] text-slate-400 font-mono">
                    {{ playerColor === 'w' ? 'White' : 'Black' }} pieces (You)
                  </span>
                </div>
              </div>

              <!-- Player Clock: [10:00] matching sketch -->
              <div
                class="px-3.5 py-1.5 rounded-lg font-mono font-bold text-base md:text-lg border tabular-nums transition-colors shadow-inner"
                :class="[
                  chess.turn() === playerColor
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-600/60 ring-2 ring-emerald-500/20'
                    : 'bg-slate-950 text-slate-300 border-slate-800'
                ]"
              >
                {{ formatTime(playerTime) }}
              </div>
            </div>

            <!-- Game Status Alert (Check / Checkmate / Draw) -->
            <div
              v-if="chess.isGameOver() || chess.inCheck()"
              class="mt-3 p-2.5 rounded-xl text-xs flex items-center gap-2 font-medium"
              :class="[
                chess.isCheckmate()
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                  : (chess.isDraw()
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                    : 'bg-cyan-950/80 text-cyan-300 border border-cyan-800')
              ]"
            >
              <AlertCircle class="w-4 h-4 shrink-0" />
              <span v-if="chess.isCheckmate()">
                Checkmate! {{ chess.turn() === playerColor ? 'Engine wins.' : 'You win!' }}
              </span>
              <span v-else-if="chess.isDraw()">
                Game ended in a draw (Stalemate / Repetition).
              </span>
              <span v-else-if="chess.inCheck()">
                Check on {{ chess.turn() === 'w' ? 'White' : 'Black' }} King!
              </span>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: Stack of 2 Cards matching sketch -->
        <div class="lg:col-span-7 flex flex-col gap-6">
          <!-- Card 1: PIECE INTERACTION NETWORK matching sketch -->
          <div class="min-h-[350px]">
            <PieceInteractionNetwork
              :graph="interactionGraph"
              :selected-square="selectedSquare"
              :focused-square="selectedSquare"
              @select-square="handleSelectSquare"
            />
          </div>

          <!-- Card 2: TELEMETRY / METRICS matching sketch -->
          <div>
            <TelemetryMetrics
              :telemetry="telemetry"
              :depth="searchDepth"
              :is-engine-thinking="isEngineThinking"
            />
          </div>
        </div>
      </div>
    </main>

    <!-- FOOTER matching sketch bottom banner: NED University SE Department | SE-25038, SE-25090 -->
    <footer class="bg-slate-900/90 border-t border-slate-800 mt-auto py-3 px-4 md:px-8">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
        <div class="flex items-center gap-2 font-medium">
          <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
          <span class="text-slate-200 font-semibold tracking-wide">
            NED University SE Department
          </span>
        </div>
        <div class="font-mono text-cyan-400/90 tracking-wider">
          SE-25038, SE-25090
        </div>
      </div>
    </footer>
  </div>
</template>
