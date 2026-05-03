<template>
  <Teleport to="body">
    <div v-if="visible" class="lightbox-overlay" @click="close" @wheel.prevent>
      <button class="lightbox-close" @click="close"><i class="bi bi-x-lg"></i></button>
      <button v-if="images.length > 1" class="lightbox-nav lightbox-prev" @click.stop="prev"><i class="bi bi-chevron-left"></i></button>
      <img :src="images[current]" class="lightbox-img" @click.stop alt="">
      <button v-if="images.length > 1" class="lightbox-nav lightbox-next" @click.stop="next"><i class="bi bi-chevron-right"></i></button>
      <div v-if="images.length > 1" class="lightbox-counter">{{ current + 1 }} / {{ images.length }}</div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ images: Array, modelValue: Boolean })
const emit = defineEmits(['update:modelValue'])
const visible = ref(false)
const current = ref(0)

watch(() => props.modelValue, v => {
  visible.value = v
  if (v) { current.value = 0; document.body.style.overflow = 'hidden' }
  else document.body.style.overflow = ''
})

function close() { emit('update:modelValue', false) }
function prev() { current.value = (current.value - 1 + props.images.length) % props.images.length }
function next() { current.value = (current.value + 1) % props.images.length }

function onKeydown(e) {
  if (!visible.value) return
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowLeft') prev()
  if (e.key === 'ArrowRight') next()
}

import { onMounted, onUnmounted } from 'vue'
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.lightbox-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.92);
  display: flex; align-items: center; justify-content: center;
  animation: lb-fade 0.2s ease;
}
@keyframes lb-fade { from { opacity: 0 } to { opacity: 1 } }
.lightbox-close {
  position: fixed; top: 20px; right: 20px; z-index: 1;
  background: rgba(255,255,255,0.1); border: none; color: #fff;
  width: 40px; height: 40px; border-radius: 50%; cursor: pointer;
  font-size: 1.2rem; display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.lightbox-close:hover { background: rgba(255,255,255,0.25) }
.lightbox-img {
  max-width: 90vw; max-height: 85vh; object-fit: contain; border-radius: 4px;
}
.lightbox-nav {
  position: fixed; top: 50%; transform: translateY(-50%);
  background: rgba(255,255,255,0.1); border: none; color: #fff;
  width: 44px; height: 44px; border-radius: 50%; cursor: pointer;
  font-size: 1.2rem; display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.lightbox-nav:hover { background: rgba(255,255,255,0.25) }
.lightbox-prev { left: 20px }
.lightbox-next { right: 20px }
.lightbox-counter {
  position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
  color: rgba(255,255,255,0.5); font-size: 0.82rem;
}
</style>
