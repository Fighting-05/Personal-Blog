<template>
  <canvas ref="canvasRef" class="particle-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'

const canvasRef = ref(null)
let renderer, scene, camera, particles
let animationId

onMounted(() => {
  if (!canvasRef.value) return

  // 获取父容器尺寸
  const parent = canvasRef.value.parentElement
  const width = parent.offsetWidth
  const height = parent.offsetHeight

  // 初始化场景
  scene = new THREE.Scene()
  
  // 初始化相机
  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100)
  camera.position.z = 5

  // 初始化渲染器
  renderer = new THREE.WebGLRenderer({ 
    canvas: canvasRef.value, 
    alpha: true, 
    antialias: true 
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  // 生成粒子
  const count = 500
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const material = new THREE.PointsMaterial({
    size: 0.08,
    color: '#c9a96e',
    transparent: true,
    opacity: 0.8,
    depthWrite: false
  })

  particles = new THREE.Points(geometry, material)
  scene.add(particles)

  // 动画循环
  const animate = () => {
    animationId = requestAnimationFrame(animate)
    particles.rotation.y += 0.001
    particles.rotation.x += 0.0005
    renderer.render(scene, camera)
  }
  animate()

  // 窗口大小响应
  const handleResize = () => {
    const w = parent.offsetWidth
    const h = parent.offsetHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
})
</script>

<style scoped>
.particle-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>
