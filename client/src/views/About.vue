<template>
  <div class="nomad-about-root">
    <!-- Error Fallback -->
    <div v-if="loadError" class="error-fallback">
      <p>⚠️ {{ loadError }}</p>
      <button @click="forceRender">重试</button>
    </div>

    <!-- 3D Globe Canvas -->
    <canvas v-else ref="globeCanvas" class="globe-canvas"></canvas>

    <!-- Floating Decorations -->
    <div class="lottie-deco lottie-deco-1" ref="lottie1"></div>
    <div class="lottie-deco lottie-deco-2" ref="lottie2"></div>

    <!-- Hero Section with Typed.js -->
    <section class="nomad-hero">
      <div class="hero-content">
        <div class="hero-avatar-wrap">
          <div class="avatar-ring"></div>
          <el-avatar :size="96" src="" class="hero-avatar">
            <span style="font-size:2.5rem">📚</span>
          </el-avatar>
        </div>
        <div class="hero-greeting">Hey there, I'm</div>
        <h1 class="hero-name gradient-text">27考研人 · 22408选手</h1>
        <div class="hero-typed-wrap">
          <span ref="typedTarget" class="hero-typed"></span>
        </div>
        <div class="hero-actions">
          <button class="btn-magnetic nomad-btn-prime" @click="scrollToSection('journey')">
            <span>🗺️</span> 我的足迹
          </button>
          <button class="btn-magnetic nomad-btn-ghost" @click="scrollToSection('connect')">
            <span>💬</span> 找到我
          </button>
        </div>
      </div>
      <div class="scroll-indicator">
        <div class="scroll-mouse">
          <div class="scroll-wheel"></div>
        </div>
        <span>向下滚动探索更多</span>
      </div>
    </section>

    <!-- Stats with CountUp -->
    <section class="nomad-section nomad-stats-section" ref="statsSection">
      <div class="nomad-section-label">By The Numbers</div>
      <div class="nomad-stats-grid">
        <div class="stat-card aurora-glass" v-for="stat in stats" :key="stat.key">
          <div class="stat-icon">{{ stat.icon }}</div>
          <div class="stat-value-wrap">
            <span class="stat-value" :ref="el => setStatRef(stat.key, el)"></span>
            <span class="stat-suffix">{{ stat.suffix }}</span>
          </div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </section>

    <!-- Now Section with 3D Tilt Cards -->
    <section class="nomad-section" ref="nowSection">
      <div class="nomad-section-label">Right Now</div>
      <h2 class="nomad-section-title">此刻状态</h2>
      <div class="now-grid">
        <div class="tilt-card aurora-glass" v-for="item in nowItems" :key="item.label" :data-tilt data-tilt-max="15" data-tilt-speed="400" data-tilt-glare data-tilt-max-glare="0.2" data-tilt-scale="1.05">
          <div class="tilt-card-inner">
            <div class="tilt-card-emoji">{{ item.emoji }}</div>
            <div class="tilt-card-content">
              <div class="tilt-card-label">{{ item.label }}</div>
              <div class="tilt-card-value">{{ item.value }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Skills 3D Tag Cloud — 考研书单 -->
    <section class="nomad-section nomad-skills-section">
      <div class="nomad-section-label">Book List</div>
      <h2 class="nomad-section-title">22408 备考书单</h2>
      <div class="tagcloud-wrap">
        <div ref="tagCloud" class="tagcloud"></div>
      </div>
      <div class="skills-legend">
        <div class="legend-item" v-for="level in bookLevels" :key="level">
          <span class="legend-dot" :class="level"></span>
          <span>{{ level }}</span>
        </div>
      </div>
    </section>

    <!-- Journey Carousel with Swiper -->
    <section class="nomad-section nomad-timeline-section" ref="timelineSection" id="journey">
      <div class="nomad-section-label">Journey</div>
      <h2 class="nomad-section-title">足迹</h2>
      <p class="section-desc">走过的每一段路，都是成长的印记</p>
      <div class="timeline-swiper-wrap">
        <swiper 
          :modules="[SwiperFreeMode, SwiperPagination]"
          :free-mode="{ enabled: true, momentum: true }"
          :slides-per-view="'auto'"
          :space-between="20"
          :pagination="{ clickable: true }"
          :loop="false"
          class="journey-swiper"
        >
          <swiper-slide v-for="evt in timelineEvents" :key="evt.year" class="timeline-slide">
            <div class="timeline-card aurora-glass">
              <div class="timeline-year">{{ evt.year }}</div>
              <div class="timeline-dot" :style="{ background: evt.color }"></div>
              <div class="timeline-content">
                <h3>{{ evt.title }}</h3>
                <p>{{ evt.desc }}</p>
                <div class="timeline-tags">
                  <span class="tl-tag" v-for="tag in evt.tags" :key="tag">{{ tag }}</span>
                </div>
              </div>
            </div>
          </swiper-slide>
        </swiper>
      </div>
      <div class="timeline-hint">← 左右滑动探索 →</div>
    </section>

    <!-- Writing with interactive cards -->
    <section class="nomad-section">
      <div class="nomad-section-label">Life</div>
      <h2 class="nomad-section-title">我的日常</h2>
      <div class="writing-grid">
        <div class="writing-card aurora-glass" v-for="c in contentItems" :key="c.title" @mouseenter="onWritingHover(c, true)" @mouseleave="onWritingHover(c, false)">
          <div class="writing-card-accent" :style="{ background: c.color }"></div>
          <div class="writing-card-icon">{{ c.icon }}</div>
          <h3>{{ c.title }}</h3>
          <p>{{ c.desc }}</p>
          <div class="writing-card-arrow">
            <span>→</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact with 3D tilt -->
    <section class="nomad-section nomad-contact-section" id="connect">
      <div class="nomad-section-label">Let's Connect</div>
      <h2 class="nomad-section-title">找到我</h2>
      <div class="contact-grid">
        <div class="contact-card aurora-glass" v-for="link in contactLinks" :key="link.label" :data-tilt data-tilt-max="20" data-tilt-speed="400" data-tilt-glare data-tilt-max-glare="0.15" data-tilt-scale="1.08" @click="openLink(link.url)">
          <div class="contact-icon">{{ link.icon }}</div>
          <strong>{{ link.label }}</strong>
          <span>{{ link.desc }}</span>
        </div>
      </div>
    </section>

    <!-- Quote -->
    <div class="nomad-quote">
      <div class="quote-mark">"</div>
      <p class="quote-text" ref="quoteText">长风破浪会有时，直挂云帆济沧海。</p>
      <span class="quote-author">— 李白《行路难》</span>
    </div>

    <!-- Back to top -->
    <button class="back-to-top" @click="scrollToTop" v-show="showBackTop">↑</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { postAPI } from '@/api'
import { ElAvatar } from 'element-plus'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { FreeMode as SwiperFreeMode, Pagination as SwiperPagination } from 'swiper/modules'
import 'swiper/css'

import VanillaTilt from 'vanilla-tilt'
import TagCloud from 'TagCloud'
import { CountUp } from 'countup.js'
import lottie from 'lottie-web'
import Typed from 'typed.js'
import * as THREE from 'three'
import { gsap } from 'gsap'

const loadError = ref(null)

// ==================== 3D Globe ====================
const globeCanvas = ref(null)
let scene, camera, renderer, globe, globeAnimId

function initGlobe() {
  try {
    const canvas = globeCanvas.value
    if (!canvas) return

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5

    const particleCount = 2000
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / particleCount)
      const theta = Math.sqrt(particleCount * Math.PI) * phi
      const r = 1.8
      positions[i * 3] = r * Math.cos(theta) * Math.sin(phi)
      positions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi)
      positions[i * 3 + 2] = r * Math.cos(phi)

      const c = new THREE.Color().setHSL(0.08 + Math.random() * 0.08, 0.6, 0.6 + Math.random() * 0.3)
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 0.025,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    })

    globe = new THREE.Points(geometry, material)
    scene.add(globe)

    let mouseX = 0, mouseY = 0
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1
    })

    function animate() {
      globeAnimId = requestAnimationFrame(animate)
      globe.rotation.y += 0.002
      globe.rotation.x = mouseY * 0.3
      globe.rotation.y += mouseX * 0.005
      renderer.render(scene, camera)
    }
    animate()
  } catch (e) {
    console.warn('Globe init failed:', e)
  }
}

// ==================== Typed.js ====================
const typedTarget = ref(null)
let typedInstance

function initTyped() {
  try {
    if (typedTarget.value) {
      typedInstance = new Typed(typedTarget.value, {
        strings: [
          '备战 22408 · 一战成硕 💪',
          '九江学院 · 大三在读',
          '数据结构 / 组成原理 / 操作系统 / 计算机网络',
          '每天一杯咖啡，刷题到深夜 ☕',
        ],
        typeSpeed: 50,
        backSpeed: 30,
        loop: true,
        showCursor: true,
        cursorChar: '|',
      })
    }
  } catch (e) {
    console.warn('Typed init failed:', e)
  }
}

// ==================== Lottie ====================
const lottie1 = ref(null)
const lottie2 = ref(null)

// ==================== Vanilla Tilt ====================
function initTilt() {
  try {
    const tiltElements = document.querySelectorAll('[data-tilt]')
    if (tiltElements.length > 0) {
      VanillaTilt.init(tiltElements, {
        max: 15,
        speed: 400,
        glare: true,
        'max-glare': 0.2,
        scale: 1.05,
      })
    }
  } catch (e) {
    console.warn('Tilt init failed:', e)
  }
}

// ==================== TagCloud ====================
const tagCloud = ref(null)

function initTagCloud() {
  try {
    if (tagCloud.value) {
      const texts = books.map(b => b.name)
      TagCloud(tagCloud.value, texts, {
        radius: 180,
        maxFont: 28,
        minFont: 14,
        color: () => {
          const h = 200 + Math.random() * 40
          return `hsl(${h}, 60%, 55%)`
        },
      })
    }
  } catch (e) {
    console.warn('TagCloud init failed:', e)
  }
}

// ==================== Swiper + GSAP Timeline ====================
const timelineSection = ref(null)

function initTimelineAnimations() {
  try {
    const cards = document.querySelectorAll('.timeline-card')
    if (cards.length > 0) {
      gsap.from(cards, {
        opacity: 0,
        y: 60,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power3.out',
      })
    }
  } catch (e) {
    console.warn('GSAP timeline failed:', e)
  }
}

// ==================== CountUp ====================
const statsSection = ref(null)
const statRefs = {}
let countUpInstances = []
let statsAnimated = false

function setStatRef(key, el) {
  if (el) statRefs[key] = el
}

function initCountUp() {
  try {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !statsAnimated) {
          statsAnimated = true
          stats.forEach(stat => {
            const el = statRefs[stat.key]
            if (el) {
              const instance = new CountUp(el, stat.target, {
                duration: 2.5,
                separator: ',',
                suffix: '',
              })
              instance.start()
              countUpInstances.push(instance)
            }
          })
        }
      })
    }, { threshold: 0.3 })

    if (statsSection.value) observer.observe(statsSection.value)
  } catch (e) {
    console.warn('CountUp init failed:', e)
  }
}

// ==================== Quote Animation ====================
const quoteText = ref(null)

function animateQuote() {
  try {
    if (quoteText.value) {
      gsap.from(quoteText.value, {
        opacity: 0,
        y: 40,
        duration: 1.2,
        ease: 'power3.out',
      })
    }
  } catch (e) {
    console.warn('Quote animation failed:', e)
  }
}

// ==================== Data ====================
const tags = ['考研党', '22408选手', '前端爱好者', '算法刷题', '咖啡成瘾']

const nowItems = [
  { emoji: '📍', label: '所在城市', value: '九江 · 江西' },
  { emoji: '📖', label: '在学', value: '22408 全套备考' },
  { emoji: '🎯', label: '目标', value: '一战成硕！' },
  { emoji: '🎧', label: '在听', value: '考研数学网课' },
  { emoji: '☕', label: '在喝', value: '美式，续命必备' },
  { emoji: '💻', label: '在做', value: 'LeetCode + 408真题' },
]

const books = [
  { name: '数据结构', level: '核心' },
  { name: '计算机组成原理', level: '核心' },
  { name: '操作系统', level: '核心' },
  { name: '计算机网络', level: '核心' },
  { name: '高等数学', level: '重点' },
  { name: '线性代数', level: '重点' },
  { name: '概率论', level: '重点' },
  { name: '英语真题', level: '日常' },
  { name: '政治肖秀荣', level: '冲刺' },
  { name: '王道考研408', level: '必备' },
  { name: '张宇高数', level: '推荐' },
  { name: '李永乐线代', level: '推荐' },
  { name: 'LeetCode', level: '刷题' },
  { name: '天勤数据结构', level: '参考' },
  { name: '汤家凤数学', level: '参考' },
]

const bookLevels = ['核心', '重点', '日常', '冲刺', '推荐', '刷题', '参考']

const timelineEvents = [
  { year: '2023', title: '踏入九江学院', desc: '带着对大学的憧憬来到九江，开始计算机专业的学习之旅。', color: '#c9a96e', tags: ['九江学院', '大一', '计算机专业'] },
  { year: '2024', title: '南昌之行', desc: '第一次出远门到南昌，登滕王阁、逛万寿宫，感受赣鄱文化。', color: '#6b9b7a', tags: ['南昌', '滕王阁', '万寿宫'] },
  { year: '2024', title: '庐山徒步', desc: '和同学一起爬庐山，看三叠泉瀑布，感受"不识庐山真面目"的诗意。', color: '#7b8ca8', tags: ['庐山', '三叠泉', '徒步'] },
  { year: '2025', title: '黄山日出', desc: '暑假和好友奔赴黄山，凌晨爬山看日出，云海翻涌，终身难忘。', color: '#dc6b6b', tags: ['黄山', '日出', '云海'] },
  { year: '2025', title: '深圳探索', desc: '第一次来到一线城市，感受大湾区的科技氛围，逛华强北、打卡深圳湾。', color: '#06b6d4', tags: ['深圳', '大湾区', '科技之城'] },
  { year: '2025', title: '广州漫游', desc: '登广州塔、逛珠江、上下九吃美食，感受岭南文化的独特魅力。', color: '#8b5cf6', tags: ['广州', '小蛮腰', '珠江夜游'] },
  { year: '2025', title: '扎根自习室', desc: '大二下学期开始准备考研，固定座位，每天图书馆闭馆才走。', color: '#8b7355', tags: ['图书馆', '备战', '自律'] },
  { year: '2026', title: '冲刺22408', desc: '进入全面备考阶段，四轮复习，真题刷了三遍，向着目标全力冲刺。', color: '#a68b6e', tags: ['22408', '真题', '冲刺'] },
]

const contentItems = [
  { icon: '📝', title: '考研日记', desc: '记录每天的复习进度、错题总结和心态变化。', color: '#409eff' },
  { icon: '💡', title: '经验分享', desc: '22408 备考方法、资料推荐和时间规划心得。', color: '#67c23a' },
  { icon: '📸', title: '江西游记', desc: '南昌、庐山、黄山...大学期间走过的大好河山。', color: '#e6a23c' },
  { icon: '☕', title: '日常碎片', desc: '自习室的晨光、深夜的台灯、一杯咖啡的陪伴。', color: '#f56c6c' },
]

const contactLinks = [
  { icon: '📧', label: 'Email', desc: 'student@email.com', url: 'mailto:student@email.com' },
  { icon: '🐙', label: 'GitHub', desc: '算法题解 & 项目', url: 'https://github.com' },
  { icon: '📱', label: '微信', desc: '考研交流群主', url: '#' },
  { icon: '📡', label: '知乎', desc: '备考干货分享', url: 'https://zhihu.com' },
  { icon: '📺', label: 'B站', desc: '学习vlog', url: 'https://bilibili.com' },
  { icon: '🏔️', label: '小红书', desc: '江西旅行指南', url: 'https://xiaohongshu.com' },
]

const stats = [
  { key: 'study', label: '备考天数', icon: '📅', target: 100, suffix: '+' },
  { key: 'leets', label: 'LeetCode', icon: '💻', target: 286, suffix: '题' },
  { key: 'places', label: '去过城市', icon: '📍', target: 8, suffix: '个' },
  { key: 'coffee', label: '喝掉咖啡', icon: '☕', target: 520, suffix: '杯' },
]

const showBackTop = ref(false)

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openLink(url) {
  if (url.startsWith('http')) window.open(url, '_blank')
  else if (url.startsWith('mailto')) location.href = url
}

function onWritingHover(item, isEnter) {
  // Add GSAP hover effect if needed
}

function forceRender() {
  loadError.value = null
  nextTick(() => {
    initGlobe()
    initTyped()
    initTilt()
    initTagCloud()
    initCountUp()
    initTimelineAnimations()
    animateQuote()
  })
}

// ==================== Lifecycle ====================
onMounted(async () => {
  try {
    initGlobe()
    initTyped()
    initTilt()
    initTagCloud()
    initCountUp()
    initTimelineAnimations()
    animateQuote()
  } catch (e) {
    loadError.value = '页面加载失败: ' + (e.message || '未知错误')
    console.error('About page mount error:', e)
  }

  try {
    const [p, c, t] = await Promise.all([
      postAPI.getPosts({ limit: 1 }),
      postAPI.getCategories(),
      postAPI.getTags(),
    ])
    const postCount = p.data?.total || 0
    stats[0].target = 100
    stats[1].target = 286
    stats[2].target = 8
    stats[3].target = 520
  } catch {}

  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  if (globeAnimId) cancelAnimationFrame(globeAnimId)
  if (typedInstance) typedInstance.destroy()
  window.removeEventListener('scroll', handleScroll)
})

function handleScroll() {
  showBackTop.value = window.scrollY > 600
}
</script>

<style scoped>
/* ==================== Error Fallback ==================== */
.error-fallback {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  background: #0a0a0a;
  color: #f5f0e8;
  font-size: 1.1rem;
}
.error-fallback button {
  padding: 10px 24px;
  border: 1px solid var(--color-accent);
  background: transparent;
  color: var(--color-accent);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
}
.error-fallback button:hover {
  background: var(--color-accent);
  color: #0a0a0a;
}

/* ==================== Root ==================== */
.nomad-about-root {
  position: relative;
  overflow-x: hidden;
  background: #0a0a0a;
  color: #f5f0e8;
  min-height: 100vh;
}

/* ==================== 3D Globe Canvas ==================== */
.globe-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  opacity: 0.6;
}

/* ==================== Decorations ==================== */
.lottie-deco { display: none; }

/* ==================== Hero ==================== */
.nomad-hero {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 24px;
}

.hero-content {
  max-width: 700px;
}

.hero-avatar-wrap {
  position: relative;
  display: inline-block;
  margin-bottom: 28px;
}

.avatar-ring {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px solid var(--color-accent);
  animation: ringPulse 2.5s ease-in-out infinite;
}

@keyframes ringPulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 0.3; }
}

.hero-avatar {
  border: 3px solid var(--color-accent) !important;
  background: rgba(201, 169, 110, 0.15) !important;
}

.hero-greeting {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-accent);
  margin-bottom: 10px;
}

.hero-name {
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 900;
  line-height: 1.2;
  margin: 0 0 18px;
  letter-spacing: -0.03em;
}

.hero-typed-wrap {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  color: rgba(245, 240, 232, 0.7);
  margin-bottom: 36px;
  min-height: 1.6em;
}

.hero-typed .typed-cursor {
  color: var(--color-accent);
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.nomad-btn-prime,
.nomad-btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: var(--radius-lg);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.nomad-btn-prime {
  background: var(--color-accent);
  color: #0a0a0a;
  border: none;
}
.nomad-btn-prime:hover {
  background: #e8d5b0;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(201, 169, 110, 0.3);
}

.nomad-btn-ghost {
  background: transparent;
  color: var(--color-accent);
  border: 1.5px solid var(--color-accent);
}
.nomad-btn-ghost:hover {
  background: rgba(201, 169, 110, 0.1);
  transform: translateY(-2px);
}

/* Scroll Indicator */
.scroll-indicator {
  position: absolute;
  bottom: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: rgba(245, 240, 232, 0.5);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
}

.scroll-mouse {
  width: 24px;
  height: 38px;
  border: 2px solid rgba(245, 240, 232, 0.4);
  border-radius: 12px;
  position: relative;
}

.scroll-wheel {
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 8px;
  background: var(--color-accent);
  border-radius: 2px;
  animation: scrollWheel 1.5s ease-in-out infinite;
}

@keyframes scrollWheel {
  0% { transform: translateX(-50%) translateY(0); opacity: 1; }
  100% { transform: translateX(-50%) translateY(12px); opacity: 0; }
}

/* ==================== Sections ==================== */
.nomad-section {
  position: relative;
  z-index: 1;
  padding: 80px 24px;
  max-width: 1100px;
  margin: 0 auto;
}

.nomad-section-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--color-accent);
  margin-bottom: 8px;
}

.nomad-section-title {
  font-size: clamp(1.5rem, 3vw, 2.2rem);
  font-weight: 800;
  margin: 0 0 12px;
  letter-spacing: -0.02em;
}

.section-desc {
  font-size: 0.95rem;
  color: rgba(245, 240, 232, 0.5);
  margin: 0 0 36px;
}

/* ==================== Stats ==================== */
.nomad-stats-section {
  padding-top: 60px;
}

.nomad-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  text-align: center;
  padding: 32px 24px;
  transition: transform 0.35s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.stat-card:hover {
  transform: translateY(-6px);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 12px;
}

.stat-value-wrap {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--color-accent);
  letter-spacing: -0.03em;
}

.stat-suffix {
  font-size: 1.2rem;
  color: var(--color-accent);
  font-weight: 700;
}

.stat-label {
  font-size: 0.85rem;
  color: rgba(245, 240, 232, 0.6);
  margin-top: 6px;
}

/* ==================== Now Grid ==================== */
.now-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.tilt-card {
  padding: 24px;
  cursor: pointer;
}

.tilt-card-inner {
  display: flex;
  align-items: center;
  gap: 18px;
}

.tilt-card-emoji {
  font-size: 2.2rem;
  flex-shrink: 0;
}

.tilt-card-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tilt-card-label {
  font-size: 0.78rem;
  color: rgba(245, 240, 232, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}

.tilt-card-value {
  font-size: 1.05rem;
  font-weight: 700;
  color: #f5f0e8;
}

/* ==================== Tag Cloud ==================== */
.nomad-skills-section {
  text-align: center;
}

.tagcloud-wrap {
  display: flex;
  justify-content: center;
  margin: 32px 0 24px;
}

.tagcloud {
  max-width: 400px;
  height: 300px;
  --tag-cloud-color: var(--color-accent);
}

.skills-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: rgba(245, 240, 232, 0.6);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.legend-dot.核心 { background: #ef4444; }
.legend-dot.重点 { background: #f59e0b; }
.legend-dot.日常 { background: #22c55e; }
.legend-dot.冲刺 { background: #a855f7; }
.legend-dot.推荐 { background: #3b82f6; }
.legend-dot.刷题 { background: #06b6d4; }
.legend-dot.参考 { background: #6b7280; }

/* ==================== Timeline ==================== */
.nomad-timeline-section {
  text-align: center;
}

.timeline-swiper-wrap {
  overflow-x: auto;
  padding: 20px 24px 60px;
  margin: 0 -24px;
  scrollbar-width: thin;
  scrollbar-color: var(--color-accent) transparent;
}

.timeline-swiper-wrap::-webkit-scrollbar {
  height: 4px;
}
.timeline-swiper-wrap::-webkit-scrollbar-track {
  background: rgba(255,255,255,0.05);
  border-radius: 2px;
}
.timeline-swiper-wrap::-webkit-scrollbar-thumb {
  background: var(--color-accent);
  border-radius: 2px;
}

.journey-swiper {
  padding-bottom: 40px !important;
}

.timeline-slide {
  width: 300px !important;
  flex-shrink: 0;
}

.timeline-card {
  padding: 28px;
  text-align: left;
  position: relative;
  height: 100%;
}

.timeline-year {
  position: absolute;
  top: 16px;
  right: 20px;
  font-size: 2.5rem;
  font-weight: 900;
  color: rgba(201, 169, 110, 0.15);
  line-height: 1;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-bottom: 16px;
  box-shadow: 0 0 12px currentColor;
}

.timeline-content h3 {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 10px;
  color: #f5f0e8;
}

.timeline-content p {
  font-size: 0.88rem;
  color: rgba(245, 240, 232, 0.7);
  line-height: 1.65;
  margin: 0 0 14px;
}

.timeline-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tl-tag {
  font-size: 0.72rem;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(201, 169, 110, 0.12);
  color: var(--color-accent);
  border: 1px solid rgba(201, 169, 110, 0.2);
  font-weight: 500;
}

.timeline-hint {
  margin-top: 16px;
  font-size: 0.78rem;
  color: rgba(245, 240, 232, 0.4);
  letter-spacing: 0.05em;
}

/* ==================== Writing ==================== */
.writing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.writing-card {
  padding: 28px;
  position: relative;
  overflow: hidden;
  transition: transform 0.35s cubic-bezier(0.22, 0.61, 0.36, 1);
  cursor: pointer;
}
.writing-card:hover {
  transform: translateY(-4px);
}

.writing-card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
}

.writing-card-icon {
  font-size: 1.8rem;
  margin-bottom: 14px;
}

.writing-card h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 10px;
  color: #f5f0e8;
}

.writing-card p {
  font-size: 0.88rem;
  color: rgba(245, 240, 232, 0.7);
  line-height: 1.6;
  margin: 0 0 16px;
}

.writing-card-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(201, 169, 110, 0.15);
  color: var(--color-accent);
  transition: all 0.3s;
}
.writing-card:hover .writing-card-arrow {
  background: var(--color-accent);
  color: #0a0a0a;
  transform: translateX(4px);
}

/* ==================== Contact ==================== */
.nomad-contact-section {
  text-align: center;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 20px;
}

.contact-card {
  padding: 28px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.35s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.contact-card:hover {
  transform: translateY(-4px) scale(1.02);
}

.contact-icon {
  font-size: 2rem;
}

.contact-card strong {
  font-size: 0.9rem;
  color: #f5f0e8;
}

.contact-card span {
  font-size: 0.78rem;
  color: rgba(245, 240, 232, 0.6);
}

/* ==================== Quote ==================== */
.nomad-quote {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 80px 24px 100px;
  max-width: 700px;
  margin: 0 auto;
}

.quote-mark {
  font-size: 5rem;
  color: var(--color-accent);
  opacity: 0.3;
  line-height: 1;
  margin-bottom: -20px;
}

.quote-text {
  font-size: clamp(1.1rem, 2.5vw, 1.4rem);
  font-weight: 500;
  font-style: italic;
  color: rgba(245, 240, 232, 0.8);
  line-height: 1.7;
  margin: 0 0 16px;
}

.quote-author {
  font-size: 0.85rem;
  color: var(--color-accent);
  font-weight: 600;
}

/* ==================== Back to Top ==================== */
.back-to-top {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-accent);
  color: #0a0a0a;
  border: none;
  font-size: 1.3rem;
  cursor: pointer;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
  box-shadow: 0 4px 16px rgba(201, 169, 110, 0.4);
}
.back-to-top:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(201, 169, 110, 0.5);
}

/* ==================== Responsive ==================== */
@media (max-width: 768px) {
  .nomad-hero { min-height: 80vh; padding: 48px 20px; }
  .hero-name { font-size: 1.8rem; }
  .hero-actions { flex-direction: column; }
  .nomad-btn-prime, .nomad-btn-ghost { width: 100%; justify-content: center; }
  .now-grid { grid-template-columns: 1fr; }
  .writing-grid { grid-template-columns: 1fr; }
  .contact-grid { grid-template-columns: repeat(2, 1fr); }
  .timeline-slide { width: 280px !important; }
  .tagcloud { max-width: 300px; height: 250px; }
  .lottie-deco { width: 100px; height: 100px; }
}
</style>
