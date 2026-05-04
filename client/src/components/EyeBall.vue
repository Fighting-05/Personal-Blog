<template>
  <div ref="eyeRef" class="eyeball" :style="{
    width: size + 'px',
    height: isBlinking ? '2px' : size + 'px',
    backgroundColor: eyeColor,
  }">
    <div v-if="!isBlinking" class="pupil-inner" :style="{
      width: pupilSize + 'px',
      height: pupilSize + 'px',
      backgroundColor: pupilColor,
      transform: `translate(${offset.x}px, ${offset.y}px)`,
    }"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  size: { type: Number, default: 18 },
  pupilSize: { type: Number, default: 7 },
  maxDist: { type: Number, default: 5 },
  eyeColor: { type: String, default: '#fff' },
  pupilColor: { type: String, default: '#2D2D2D' },
  isBlinking: { type: Boolean, default: false },
  forceLookX: { type: Number, default: undefined },
  forceLookY: { type: Number, default: undefined },
})

const mouseX = ref(0)
const mouseY = ref(0)
const eyeRef = ref(null)

const onMove = (e) => { mouseX.value = e.clientX; mouseY.value = e.clientY }
onMounted(() => window.addEventListener('mousemove', onMove))
onBeforeUnmount(() => window.removeEventListener('mousemove', onMove))

const offset = computed(() => {
  if (props.forceLookX !== undefined && props.forceLookY !== undefined) {
    return { x: props.forceLookX, y: props.forceLookY }
  }
  if (!eyeRef.value) return { x: 0, y: 0 }
  const eye = eyeRef.value.getBoundingClientRect()
  const eyeCenterX = eye.left + eye.width / 2
  const eyeCenterY = eye.top + eye.height / 2
  const deltaX = mouseX.value - eyeCenterX
  const deltaY = mouseY.value - eyeCenterY
  const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), props.maxDist)
  const angle = Math.atan2(deltaY, deltaX)
  return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance }
})
</script>

<style scoped>
.eyeball { border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: height 0.15s; overflow: hidden }
.pupil-inner { border-radius: 50%; transition: transform 0.1s ease-out }
</style>
