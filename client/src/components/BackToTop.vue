<template>
  <button v-show="visible" class="back-to-top" @click="scrollTop">
    <i class="bi bi-chevron-up"></i>
  </button>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const visible = ref(false)

function onScroll() {
  visible.value = window.scrollY > 400
}

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.back-to-top {
  position: fixed; bottom: 28px; right: 28px; z-index: 9998;
  width: 42px; height: 42px; border-radius: 50%;
  background: var(--color-surface); border: 1.5px solid var(--color-border);
  color: var(--color-text-muted); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}
.back-to-top:hover {
  color: var(--color-primary); border-color: var(--color-accent);
  transform: translateY(-3px); box-shadow: var(--shadow-lg);
}
</style>
