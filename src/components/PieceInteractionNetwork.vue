<script setup lang="ts">
import { ref, computed } from 'vue';
import type { NetworkGraph, InteractionNode, InteractionEdge } from '../types/chess';
import { getPieceSvg } from '../utils/pieceSvgs';
import { Info, X, Shield, Swords, Sparkles, HelpCircle } from 'lucide-vue-next';

const props = defineProps<{
  graph: NetworkGraph;
  selectedSquare: string | null;
  focusedSquare: string | null;
}>();

const emit = defineEmits<{
  (e: 'select-square', square: string): void;
}>();

const showLegendModal = ref(false);
const activeFilter = ref<'all' | 'attacks' | 'defends'>('all');

const filteredEdges = computed(() => {
  if (activeFilter.value === 'all') return props.graph.edges;
  return props.graph.edges.filter((e) => e.type === activeFilter.value);
});

// Calculate arrow path and midpoint for label
function calculateArrow(edge: InteractionEdge) {
  const from = props.graph.nodes.find((n) => n.square === edge.fromSquare);
  const to = props.graph.nodes.find((n) => n.square === edge.toSquare);
  if (!from || !to) return null;

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return null;

  // Offset start and end to touch outer circle edge (radius ~24px)
  const nodeRadius = 26;
  const startX = from.x + (dx / dist) * nodeRadius;
  const startY = from.y + (dy / dist) * nodeRadius;
  const endX = to.x - (dx / dist) * (nodeRadius + 6);
  const endY = to.y - (dy / dist) * (nodeRadius + 6);

  // Slight curve for clarity
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  // Perpendicular curve offset
  const perpX = -dy / dist * 14;
  const perpY = dx / dist * 14;
  const controlX = midX + perpX;
  const controlY = midY + perpY;

  return {
    path: `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`,
    labelX: controlX,
    labelY: controlY - 4,
    color: edge.type === 'attacks' ? '#ef4444' : '#10b981',
    markerId: edge.type === 'attacks' ? 'arrow-red' : 'arrow-green',
  };
}

function handleNodeClick(square: string) {
  emit('select-square', square);
}
</script>

<template>
  <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col h-full relative overflow-hidden">
    <!-- Header matching sketch -->
    <div class="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
      <div class="flex items-center gap-2">
        <h2 class="text-sm md:text-base font-bold tracking-wide text-slate-100 uppercase">
          Piece Interaction Network
        </h2>
        <span class="text-xs text-slate-400 font-mono">
          ({{ graph.nodes.length }} pieces · {{ graph.edges.length }} links)
        </span>
      </div>

      <div class="flex items-center gap-2">
        <!-- Filter segmented buttons -->
        <div class="hidden sm:flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            @click="activeFilter = 'all'"
            class="px-2.5 py-1 rounded transition-colors"
            :class="activeFilter === 'all' ? 'bg-slate-800 text-slate-100 font-medium' : 'text-slate-400 hover:text-slate-200'"
          >
            All
          </button>
          <button
            @click="activeFilter = 'attacks'"
            class="px-2.5 py-1 rounded flex items-center gap-1 transition-colors"
            :class="activeFilter === 'attacks' ? 'bg-red-950/80 text-red-300 font-medium' : 'text-slate-400 hover:text-red-400'"
          >
            <Swords class="w-3 h-3 text-red-400" /> Attacks
          </button>
          <button
            @click="activeFilter = 'defends'"
            class="px-2.5 py-1 rounded flex items-center gap-1 transition-colors"
            :class="activeFilter === 'defends' ? 'bg-emerald-950/80 text-emerald-300 font-medium' : 'text-slate-400 hover:text-emerald-400'"
          >
            <Shield class="w-3 h-3 text-emerald-400" /> Defends
          </button>
        </div>

        <!-- Info button (i) matching sketch -->
        <button
          @click="showLegendModal = true"
          title="How to read the Interaction Network"
          class="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors border border-slate-700/80 shadow-sm"
          aria-label="Network Legend"
        >
          <Info class="w-4 h-4 text-cyan-400" />
        </button>
      </div>
    </div>

    <!-- Active Selection Subtext -->
    <div class="flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
      <span v-if="selectedSquare">
        Focused on piece at <span class="font-mono text-cyan-400 font-semibold uppercase">{{ selectedSquare }}</span>
      </span>
      <span v-else>
        Click any piece on board or graph to inspect its network
      </span>
      <span class="text-[11px] text-slate-500 font-mono">Real-time directed graph</span>
    </div>

    <!-- SVG Graph Canvas -->
    <div class="relative flex-1 min-h-[260px] md:min-h-[290px] bg-slate-950/70 rounded-lg border border-slate-800/80 overflow-hidden flex items-center justify-center p-2">
      <svg
        viewBox="0 0 500 280"
        class="w-full h-full max-h-[300px] select-none"
      >
        <!-- Arrowhead Marker Definitions -->
        <defs>
          <marker
            id="arrow-red"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
          </marker>
          <marker
            id="arrow-green"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
          </marker>
          <!-- Subtle Grid Pattern -->
          <pattern id="net-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#1e293b" opacity="0.6" />
          </pattern>
        </defs>

        <!-- Background grid -->
        <rect width="500" height="280" fill="url(#net-grid)" />

        <!-- Directed Edges with Text Labels matching sketch -->
        <g v-for="edge in filteredEdges" :key="edge.id">
          <!-- Edge Line with Marker -->
          <path
            v-if="calculateArrow(edge)"
            :d="calculateArrow(edge)!.path"
            fill="none"
            :stroke="calculateArrow(edge)!.color"
            stroke-width="2"
            :marker-end="`url(#${calculateArrow(edge)!.markerId})`"
            class="transition-all duration-300 opacity-90 hover:opacity-100 hover:stroke-[3]"
          />

          <!-- Edge Description (e.g. "attacks (red)", "defends (green)") matching sketch -->
          <text
            v-if="calculateArrow(edge)"
            :x="calculateArrow(edge)!.labelX"
            :y="calculateArrow(edge)!.labelY"
            text-anchor="middle"
            font-size="9"
            font-family="monospace"
            font-weight="600"
            :fill="calculateArrow(edge)!.color"
            class="pointer-events-none drop-shadow"
          >
            {{ edge.label }}
          </text>
        </g>

        <!-- Piece Nodes with Real Piece SVGs and Labels matching sketch -->
        <g
          v-for="node in graph.nodes"
          :key="node.id"
          :transform="`translate(${node.x}, ${node.y})`"
          @click="handleNodeClick(node.square)"
          class="cursor-pointer group"
        >
          <!-- Outer Ring for selected square -->
          <circle
            r="26"
            :class="[
              node.square === selectedSquare
                ? 'stroke-cyan-400 stroke-[3] fill-cyan-950/40 animate-pulse'
                : 'stroke-slate-700 stroke-[1.5] fill-slate-900 group-hover:stroke-slate-500'
            ]"
            class="transition-colors duration-200"
          />

          <!-- Inner piece avatar background -->
          <circle
            r="19"
            :fill="node.color === 'w' ? '#f8fafc' : '#1e293b'"
            :stroke="node.color === 'w' ? '#cbd5e1' : '#334155'"
            stroke-width="1"
          />

          <!-- Embedded Real Piece SVG Asset matching sketch requirements -->
          <foreignObject
            x="-14"
            y="-14"
            width="28"
            height="28"
            class="pointer-events-none"
          >
            <div
              v-html="getPieceSvg(node.piece, node.color)"
              class="w-full h-full flex items-center justify-center p-0.5"
            ></div>
          </foreignObject>

          <!-- Node Label matching sketch (e.g. bK, bP, wB, wQ) -->
          <text
            x="0"
            y="-30"
            text-anchor="middle"
            font-size="11"
            font-weight="700"
            font-family="monospace"
            :fill="node.color === 'w' ? '#f1f5f9' : '#94a3b8'"
            class="pointer-events-none drop-shadow"
          >
            {{ node.label }}
            <tspan fill="#06b6d4" font-size="9">({{ node.square }})</tspan>
          </text>
        </g>
      </svg>

      <!-- Empty state if no contact yet -->
      <div
        v-if="graph.nodes.length === 0"
        class="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-xs"
      >
        <Sparkles class="w-6 h-6 mb-1 text-slate-600" />
        <span>No active tactical interactions yet.</span>
        <span>Make a move to see piece threat vectors!</span>
      </div>
    </div>

    <!-- Quick Footer hint -->
    <div class="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
      <div class="flex items-center gap-3">
        <span class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span>Defends</span>
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
          <span>Attacks</span>
        </span>
      </div>
      <span class="text-slate-500 font-mono">NED University SE Dept</span>
    </div>

    <!-- Legend Modal triggered by (i) button matching sketch -->
    <div
      v-if="showLegendModal"
      class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="showLegendModal = false"
    >
      <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <!-- Close button -->
        <button
          @click="showLegendModal = false"
          class="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>

        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <HelpCircle class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-100">
              Piece Interaction Network Legend
            </h3>
            <p class="text-xs text-slate-400">
              Interpretation guide for graph nodes, tactical vectors, and colors
            </p>
          </div>
        </div>

        <div class="space-y-4 text-xs text-slate-300">
          <!-- Vector Arrow Meanings -->
          <div class="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <h4 class="font-semibold text-slate-200 text-xs uppercase tracking-wider">
              1. Arrow Colors &amp; Direction
            </h4>
            <div class="grid grid-cols-2 gap-3 pt-1">
              <div class="flex items-start gap-2.5">
                <span class="w-3 h-3 rounded-full bg-emerald-500 mt-0.5 shrink-0"></span>
                <div>
                  <span class="font-bold text-emerald-400 font-mono">defends (green)</span>
                  <p class="text-[11px] text-slate-400">Friendly piece guarding or reinforcing another friendly piece (e.g. bK defends bP).</p>
                </div>
              </div>
              <div class="flex items-start gap-2.5">
                <span class="w-3 h-3 rounded-full bg-red-500 mt-0.5 shrink-0"></span>
                <div>
                  <span class="font-bold text-red-400 font-mono">attacks (red)</span>
                  <p class="text-[11px] text-slate-400">Hostile piece attacking an enemy target (e.g. wB or wQ attacks bP).</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Node Labels -->
          <div class="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <h4 class="font-semibold text-slate-200 text-xs uppercase tracking-wider">
              2. Piece Node Glyphs &amp; Labels
            </h4>
            <p class="text-[11px] text-slate-400">
              Each circle node contains real vector Staunton chess assets with algebraic notations:
            </p>
            <div class="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
              <span class="px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700"><strong class="text-white">wK</strong> = White King</span>
              <span class="px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700"><strong class="text-white">wQ</strong> = White Queen</span>
              <span class="px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700"><strong class="text-white">wB</strong> = White Bishop</span>
              <span class="px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700"><strong class="text-slate-400">bK</strong> = Black King</span>
              <span class="px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700"><strong class="text-slate-400">bP</strong> = Black Pawn</span>
              <span class="px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700"><strong class="text-slate-400">bN</strong> = Black Knight</span>
            </div>
          </div>

          <!-- How to Use -->
          <div class="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5">
            <h4 class="font-semibold text-slate-200 text-xs uppercase tracking-wider">
              3. Interactive Inspection
            </h4>
            <p class="text-[11px] text-slate-400">
              • Click any piece on the left chessboard to instantly filter and isolate its tactical interaction network.<br />
              • Click any node inside this graph to select that piece on the chessboard.<br />
              • Contested pieces (like <span class="text-cyan-300 font-mono">bP</span> attacked by 2 pieces and defended by 1) become the focal anchor of the diagram.
            </p>
          </div>
        </div>

        <div class="mt-5 flex justify-end">
          <button
            @click="showLegendModal = false"
            class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-xs font-semibold transition-colors"
          >
            Got it, close legend
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
