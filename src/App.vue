<script setup lang="ts">
import { ref } from 'vue';
import HomeLanding from './components/HomeLanding.vue';
import ChessEngineView from './components/ChessEngineView.vue';

type AppView = 'landing' | 'engine';

const currentView = ref<AppView>('landing');
const initialPlayerColor = ref<'w' | 'b'>('w');

function handleStartGame(color: 'w' | 'b' = 'w') {
  initialPlayerColor.value = color;
  currentView.value = 'engine';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleGoHome() {
  currentView.value = 'landing';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
    <!-- View 1: Homepage / Landing Page -->
    <HomeLanding
      v-if="currentView === 'landing'"
      @start-game="handleStartGame"
    />

    <!-- View 2: Wireframe Chess Engine Dashboard matching sketch -->
    <ChessEngineView
      v-else-if="currentView === 'engine'"
      :initial-player-color="initialPlayerColor"
      @go-home="handleGoHome"
    />
  </div>
</template>
