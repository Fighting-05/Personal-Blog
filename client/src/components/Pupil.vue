<template>
  <div ref="pupilEl" :style="{
    width: size + 'px',
    height: size + 'px',
    backgroundColor: color,
    borderRadius: '50%',
    transform: `translate(${offset.x}px, ${offset.y}px)`,
    transition: 'transform 0.1s ease-out',
  }"></div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  size: { type: Number, default: 12 },
  maxDist: { type: Number, default: 5 },
  color: { type: String, default: '#2D2D2D' },
  forceLookX: { type: Number, default: undefined },
  forceLookY: { type: Number, default: undefined },
})

const mouseX = ref(0)
const mouseY = ref(0)
const pupilEl = ref(null)

const onMove = (e) => { mouseX.value = e.clientX; mouseY.value = e.clientY }

onMounted(() => window.addEventListener('mousemove', onMove))
onBeforeUnmount(() => window.removeEventListener('mousemove', onMove))

const offset = computed(() => {
  if (props.forceLookX !== undefined && props.forceLookY !== undefined) {
    return { x: props.forceLookX, y: props.forceLookY }
  }
  if (!pupilEl.value) return { x: 0, y: 0 }
  const r = pupilEl.value.getBoundingClientRect()
  const cx = r.left + r.width / 2
  const cy = r.top + r.height / 2
  const dx = mouseX.value - cx
  const dy = mouseY.value - cy
  const dist = Math.min(Math.sqrt(dx * dx + dy * dy), props.maxDist)
  const angle = Math.atan2(dy, dx)
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist }
})
</script>
