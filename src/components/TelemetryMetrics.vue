<script setup lang="ts">
import { computed } from 'vue';
import type { EngineTelemetry } from '../types/chess';
import { Cpu, Activity, GitFork, Gauge, Zap } from 'lucide-vue-next';

const props = defineProps<{
  telemetry: EngineTelemetry;
  depth: number;
  isEngineThinking: boolean;
}>();

// Format numbers with commas (e.g. 14,290)
function formatNumber(num: number): string {
  return num.toLocaleString();
}

// Compute eval advantage bar percentage (clamped between 5% and 95%)
const whiteAdvantagePct = computed(() => {
  const score = props.telemetry.evalScore;
  // Map [-5.0, +5.0] to [0%, 100%]
  const clamped = Math.max(-5, Math.min(5, score));
  return 50 + (clamped / 5) * 45;
});
</script>

<template>
  <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
    <!-- Header matching sketch -->
    <div class="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
      <div class="flex items-center gap-2">
        <h2 class="text-sm md:text-base font-bold tracking-wide text-slate-100 uppercase">
          Telemetry / Metrics
        </h2>
        <span
          v-if="isEngineThinking"
          class="flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60 animate-pulse"
        >
          <Zap class="w-3 h-3 text-cyan-400" /> Thinking...
        </span>
        <span
          v-else
          class="text-[11px] font-mono text-slate-400"
        >
          Depth = {{ depth }}
        </span>
      </div>

      <span class="text-xs font-mono text-slate-400">
        Alpha-Beta Minimax
      </span>
    </div>

    <!-- Main 2-column split matching sketch -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
      <!-- Left Column: Metrics List matching sketch -->
      <div class="bg-slate-950/70 p-4 rounded-lg border border-slate-800/80 flex flex-col justify-between space-y-3">
        <div class="space-y-2.5 text-xs">
          <!-- Eval Score -->
          <div class="flex items-center justify-between">
            <span class="text-slate-400 flex items-center gap-1.5 font-medium">
              <span class="text-cyan-400">•</span> Eval Score:
            </span>
            <span
              class="font-mono font-bold text-sm tabular-nums"
              :class="[
                telemetry.evalScore > 0 ? 'text-emerald-400' : (telemetry.evalScore < 0 ? 'text-rose-400' : 'text-slate-200')
              ]"
            >
              {{ telemetry.evalText }}
            </span>
          </div>

          <!-- Evaluation visual gauge bar -->
          <div class="w-full h-1.5 bg-rose-950/80 rounded-full overflow-hidden flex">
            <div
              class="h-full bg-emerald-500 transition-all duration-300"
              :style="{ width: `${whiteAdvantagePct}%` }"
              title="Advantage Balance (White vs Black)"
            ></div>
          </div>

          <!-- Nodes Visited -->
          <div class="flex items-center justify-between pt-1">
            <span class="text-slate-400 flex items-center gap-1.5 font-medium">
              <span class="text-cyan-400">•</span> Nodes Visited:
            </span>
            <span class="font-mono font-semibold text-slate-100 tabular-nums">
              {{ formatNumber(telemetry.nodesVisited) }}
            </span>
          </div>

          <!-- Pruned Branches -->
          <div class="flex items-center justify-between">
            <span class="text-slate-400 flex items-center gap-1.5 font-medium">
              <span class="text-cyan-400">•</span> Pruned Branches:
            </span>
            <span class="font-mono font-semibold text-amber-400 tabular-nums">
              {{ formatNumber(telemetry.prunedBranches) }}
            </span>
          </div>

          <!-- Latency -->
          <div class="flex items-center justify-between">
            <span class="text-slate-400 flex items-center gap-1.5 font-medium">
              <span class="text-cyan-400">•</span> Latency:
            </span>
            <span class="font-mono font-semibold text-cyan-300 tabular-nums">
              {{ telemetry.latencyMs }} ms
            </span>
          </div>
        </div>

        <!-- Pruning efficiency ratio badge -->
        <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span class="flex items-center gap-1 text-slate-500 font-mono">
            <GitFork class="w-3 h-3 text-slate-500" /> Prune Ratio:
          </span>
          <span class="font-mono text-slate-300">
            {{ telemetry.nodesVisited > 0 ? ((telemetry.prunedBranches / (telemetry.nodesVisited + telemetry.prunedBranches)) * 100).toFixed(1) : 0 }}% cutoffs
          </span>
        </div>
      </div>

      <!-- Right Column: Move Ordering matching sketch -->
      <div class="bg-slate-950/70 p-4 rounded-lg border border-slate-800/80 flex flex-col">
        <div class="flex items-center justify-between pb-2 border-b border-slate-800/60 mb-2">
          <span class="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Move Ordering
          </span>
          <span class="text-[11px] text-slate-400 font-mono">Ranked</span>
        </div>

        <!-- Ordered moves list (1. Nf3, 2. e4, 3. d4) matching sketch -->
        <div class="space-y-1.5 flex-1 overflow-y-auto max-h-[140px] pr-1">
          <div
            v-for="(move, index) in telemetry.moveOrdering"
            :key="move.san + index"
            class="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-900/60 border border-slate-800/40 hover:border-slate-700 transition-colors"
          >
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-cyan-400 w-4 text-[11px]">
                {{ index + 1 }}.
              </span>
              <span class="font-mono font-semibold text-slate-100 text-xs">
                {{ move.san }}
              </span>
              <span
                v-if="move.captured"
                class="text-[10px] text-rose-400 font-mono bg-rose-950/50 px-1 py-0.2 rounded"
              >
                x{{ move.captured.toUpperCase() }}
              </span>
            </div>
            <span class="font-mono text-[11px] text-slate-400 tabular-nums">
              {{ move.score > 0 ? `+${move.score.toFixed(2)}` : move.score.toFixed(2) }}
            </span>
          </div>

          <!-- Empty fallback if no moves -->
          <div
            v-if="telemetry.moveOrdering.length === 0"
            class="h-full flex items-center justify-center text-slate-500 text-xs py-4"
          >
            Awaiting engine calculation...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
