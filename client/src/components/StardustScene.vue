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

  const canvas = canvasRef.value
  const width = window.innerWidth
  const height = window.innerHeight

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
    const w = window.innerWidth
    const h = window.innerHeight
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
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 0;
}
</style>
