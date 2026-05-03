<template>
  <canvas ref="canvasRef" class="particle-bg"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const canvasRef = ref(null)
let animationId = null

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas || !canvas.parentElement) return

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(60, canvas.parentElement.offsetWidth / canvas.parentElement.offsetHeight, 0.1, 100)
  camera.position.z = 15

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setSize(canvas.parentElement.offsetWidth, canvas.parentElement.offsetHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const particlesCount = 120
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particlesCount * 3)
  const colors = new Float32Array(particlesCount * 3)
  const sizes = new Float32Array(particlesCount)

  const palette = [
    new THREE.Color('#c9a96e'),
    new THREE.Color('#d4b886'),
    new THREE.Color('#e0cba0'),
    new THREE.Color('#8b7355'),
    new THREE.Color('#a68b6e')
  ]

  for (let i = 0; i < particlesCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20
    positions[i * 3 + 1] = (Math.random() - 0.5) * 14
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6

    const color = palette[Math.floor(Math.random() * palette.length)]
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b

    sizes[i] = Math.random() * 4 + 1
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

  const material = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.6
  })

  const particles = new THREE.Points(geometry, material)
  scene.add(particles)

  let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0

  function onMouseMove(e) {
    targetX = (e.clientX / window.innerWidth - 0.5) * 2
    targetY = (e.clientY / window.innerHeight - 0.5) * 2
  }

  function onResize() {
    if (canvas.parentElement) {
      renderer.setSize(canvas.parentElement.offsetWidth, canvas.parentElement.offsetHeight)
      camera.aspect = canvas.parentElement.offsetWidth / canvas.parentElement.offsetHeight
      camera.updateProjectionMatrix()
    }
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('resize', onResize)

  function animate() {
    animationId = requestAnimationFrame(animate)

    mouseX += (targetX - mouseX) * 0.05
    mouseY += (targetY - mouseY) * 0.05

    particles.rotation.x += 0.0002
    particles.rotation.y += 0.0003
    particles.position.x += (mouseX * 0.5 - particles.position.x) * 0.01
    particles.position.y += (-mouseY * 0.3 - particles.position.y) * 0.01

    renderer.render(scene, camera)
  }

  animate()

  onUnmounted(() => {
    cancelAnimationFrame(animationId)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('resize', onResize)
    geometry.dispose()
    material.dispose()
    renderer.dispose()
  })
})
</script>

<style scoped>
.particle-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>
