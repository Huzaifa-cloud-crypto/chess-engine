<script setup lang="ts">
import {
  Swords,
  Shield,
  Cpu,
  GitFork,
  Gauge,
  ArrowRight,
  BookOpen,
  Sparkles,
  Bot,
  User,
  GraduationCap
} from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'start-game', color?: 'w' | 'b'): void;
}>();
</script>

<template>
  <div class="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
    <!-- Top Bar Navigation Contract -->
    <header class="bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
        <!-- Zone 1: Brand Wordmark -->
        <div class="flex items-center gap-3 shrink-0">
          <div class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono text-base font-bold">
            ♟
          </div>
          <span class="text-lg font-bold tracking-tight text-white font-mono whitespace-nowrap shrink-0">
            ChessEngine
          </span>
        </div>

        <!-- Zone 2: Navigation Links -->
        <nav class="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
          <a href="#overview" class="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0">Overview</a>
          <a href="#interaction-network" class="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0">Interaction Network</a>
          <a href="#telemetry" class="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0">Telemetry Engine</a>
          <a href="#academic" class="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0">Department Credits</a>
        </nav>

        <!-- Zone 3: Primary Action -->
        <div class="flex items-center gap-3 shrink-0">
          <button
            @click="emit('start-game', 'w')"
            class="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs md:text-sm rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap shrink-0"
          >
            <span>Play Engine</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>

    <!-- HERO SECTION -->
    <section id="overview" class="relative pt-12 md:pt-20 pb-16 px-6 max-w-7xl mx-auto w-full flex-1">
      <!-- Background Ambient Glow -->
      <div class="absolute -top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/10 blur-[120px] pointer-events-none rounded-full"></div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <!-- Hero Text -->
        <div class="lg:col-span-7 space-y-6">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <GraduationCap class="w-3.5 h-3.5 text-cyan-400" />
            <span class="text-slate-300 font-medium">NED University SE Department</span>
            <span class="text-slate-600">·</span>
            <span class="font-mono text-cyan-400">SE-25038, SE-25090</span>
          </div>

          <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.15] text-balance">
            Chess Engine with Graph-Theoretic
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400">
              Piece Interaction Network
            </span>
          </h1>

          <p class="text-base text-slate-400 leading-relaxed max-w-2xl">
            A research-driven chess interface designed for software engineering and algorithm analysis. Features an interactive directed piece interaction network, real-time Alpha-Beta pruning telemetry, and dynamic move ordering heuristics.
          </p>

          <!-- Action Buttons -->
          <div class="flex flex-wrap items-center gap-4 pt-2">
            <button
              @click="emit('start-game', 'w')"
              class="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl flex items-center gap-2 transition-all shadow-xl shadow-emerald-500/20 hover:scale-[1.02]"
            >
              <span>Play as White</span>
              <ArrowRight class="w-4 h-4" />
            </button>
            <button
              @click="emit('start-game', 'b')"
              class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl flex items-center gap-2 transition-all border border-slate-700 hover:border-slate-600"
            >
              <span>Play as Black</span>
            </button>
          </div>

          <!-- Feature Bullets (Metadata cleanly formatted) -->
          <div class="pt-4 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-400 font-mono">
            <span class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Minimax + Alpha-Beta
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span> Attacks &amp; Defends Graph
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Live Telemetry (xx ms)
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Auto-Flip Perspective
            </span>
          </div>
        </div>

        <!-- Hero Wireframe Interactive Mock Card -->
        <div class="lg:col-span-5">
          <div class="bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span class="font-bold text-slate-200 font-mono flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                Wireframe Model Preview
              </span>
              <span class="font-mono text-cyan-400 text-[11px]">Depth = 5</span>
            </div>

            <!-- Mini Graphic representing the sketch -->
            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3">
              <div class="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Piece Interaction Topology
              </div>

              <!-- Directed Arrow diagram matching sketch: bK defends bP, wB & wQ attack bP -->
              <div class="relative py-6 flex flex-col items-center justify-center">
                <!-- Top Node: bK -->
                <div class="flex flex-col items-center">
                  <div class="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center font-mono font-bold text-slate-300 text-xs shadow-md">
                    bK
                  </div>
                  <span class="text-[10px] text-emerald-400 font-mono mt-1 font-semibold">
                    ↑ defends (green)
                  </span>
                </div>

                <!-- Center Node: bP -->
                <div class="my-2">
                  <div class="w-12 h-12 rounded-full bg-cyan-950/80 border-2 border-cyan-400 flex items-center justify-center font-mono font-bold text-cyan-300 text-sm shadow-lg shadow-cyan-950">
                    bP
                  </div>
                </div>

                <!-- Bottom Nodes: wB and wQ attacking bP -->
                <div class="flex items-center justify-between w-full max-w-[240px] pt-1">
                  <div class="flex flex-col items-center">
                    <span class="text-[10px] text-red-400 font-mono mb-1 font-semibold">
                      attacks (red) ↗
                    </span>
                    <div class="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center font-mono font-bold text-slate-900 text-xs shadow-md">
                      wB
                    </div>
                  </div>

                  <div class="flex flex-col items-center">
                    <span class="text-[10px] text-red-400 font-mono mb-1 font-semibold">
                      ↖ attacks (red)
                    </span>
                    <div class="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center font-mono font-bold text-slate-900 text-xs shadow-md">
                      wQ
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mini Telemetry Strip -->
              <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                <div class="text-slate-400">
                  Eval: <strong class="text-emerald-400">+0.45</strong>
                </div>
                <div class="text-slate-400">
                  Latency: <strong class="text-cyan-400">24 ms</strong>
                </div>
              </div>
            </div>

            <!-- Launch Button -->
            <button
              @click="emit('start-game', 'w')"
              class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 border border-slate-700"
            >
              <span>Launch Full Wireframe Dashboard</span>
              <ArrowRight class="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 3 KEY PILLARS -->
    <section id="interaction-network" class="py-16 bg-slate-950/60 border-t border-slate-800/80 px-6">
      <div class="max-w-7xl mx-auto space-y-12">
        <div class="text-center max-w-2xl mx-auto space-y-3">
          <h2 class="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Architecture &amp; Department Specifications
          </h2>
          <p class="text-sm text-slate-400">
            Directly realizing the wireframe specifications created by NED University Software Engineering Department.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Pillar 1 -->
          <div class="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors space-y-4">
            <div class="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400">
              <Swords class="w-5 h-5" />
            </div>
            <h3 class="text-base font-bold text-slate-100">
              Piece Interaction Network
            </h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              Computes tactical ray attacks, knight leaps, and pawn threats in real-time. Displays directed attack vectors in red and defensive reinforcement vectors in green using genuine Staunton chess piece assets.
            </p>
            <div class="pt-2 text-[11px] text-cyan-400 font-mono">
              Legend modal accessible via (i) icon
            </div>
          </div>

          <!-- Pillar 2 -->
          <div class="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors space-y-4">
            <div class="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <Cpu class="w-5 h-5" />
            </div>
            <h3 class="text-base font-bold text-slate-100">
              Minimax &amp; Alpha-Beta Telemetry
            </h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              Provides live numeric telemetry: Evaluation Score (centipawns), Nodes Visited, Pruned Branches, and calculation Latency (ms), accompanied by MVV-LVA move ordering rankings.
            </p>
            <div class="pt-2 text-[11px] text-cyan-400 font-mono">
              Configurable search depths 1 to 7
            </div>
          </div>

          <!-- Pillar 3 -->
          <div class="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors space-y-4">
            <div class="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <Shield class="w-5 h-5" />
            </div>
            <h3 class="text-base font-bold text-slate-100">
              Adaptive Tournament Board
            </h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              Features full algebraic coordinates (1-8 and a-h), dual 10:00 active clocks, automatic board flip based on player color, and a viewport-sticky left card that stays anchored during page navigation.
            </p>
            <div class="pt-2 text-[11px] text-cyan-400 font-mono">
              Synchronized Web Audio feedback
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- DEPARTMENT FOOTER CREDITS matching sketch: NED University SE Department | SE-25038, SE-25090 -->
    <footer id="academic" class="bg-slate-900 border-t border-slate-800 py-6 px-6 mt-auto">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div class="flex items-center gap-3">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span class="font-bold text-slate-200 text-sm">
            NED University of Engineering &amp; Technology
          </span>
          <span class="text-slate-600">·</span>
          <span>Software Engineering Department</span>
        </div>

        <div class="flex items-center gap-4">
          <span class="text-slate-400">Project Researchers:</span>
          <span class="px-2.5 py-1 rounded bg-slate-950 text-cyan-400 font-mono font-semibold border border-slate-800">
            SE-25038, SE-25090
          </span>
        </div>
      </div>
    </footer>
  </div>
</template>
