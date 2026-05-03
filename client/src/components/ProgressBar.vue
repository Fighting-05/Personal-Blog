<template>
  <div class="progress-bar" :style="{ width: progress + '%' }"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const progress = ref(0)

function updateProgress() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
  progress.value = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0
}

onMounted(() => window.addEventListener('scroll', updateProgress, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', updateProgress))
</script>

<style scoped>
.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-accent), var(--color-primary));
  z-index: 10000;
  transition: width 0.1s linear;
  border-radius: 0 2px 2px 0;
}
</style>
