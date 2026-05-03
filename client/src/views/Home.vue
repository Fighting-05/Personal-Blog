<template>
<div class="home-root">

  <!-- Hero - Immersive Stardust -->
  <section class="hero-immersive" ref="heroSectionRef">
    <StardustScene />
    <div class="hero-layer" ref="heroRef" :style="heroStyle">
      <div class="hero-inner">
        <div class="hero-badge">Digital Nomad · Writer · Coder</div>
        <div class="hero-icon-float">✧</div>
        <h1 class="hero-title">
          用文字记录 <span ref="typedRef"></span>
        </h1>
        <p class="hero-subtitle">分享技术笔记、生活感悟与项目实战经验</p>
        <div class="hero-actions">
          <router-link to="/archive" class="btn-prime btn-magnetic"><i class="bi bi-compass"></i> 探索</router-link>
          <a href="#posts" class="btn-ghost btn-magnetic" @click.prevent="scrollToPosts"><i class="bi bi-arrow-down"></i> 最新文章</a>
        </div>
      </div>
    </div>
  </section>

  <!-- Bento Grid: Stats + Featured -->
  <div class="bento-row">
    <div class="bento-stats">
      <div class="bento-stat"><i class="bi bi-file-text"></i><b>{{ stats.totalPosts }}</b><span>篇文章</span></div>
      <div class="bento-stat"><i class="bi bi-folder"></i><b>{{ stats.totalCategories }}</b><span>个分类</span></div>
      <div class="bento-stat"><i class="bi bi-tags"></i><b>{{ stats.totalTags }}</b><span>个标签</span></div>
      <div class="bento-stat"><i class="bi bi-people"></i><b>7</b><span>位作者</span></div>
    </div>
    <div class="bento-featured" v-if="featured.length">
      <FeaturedSwiper :featured="featured" />
    </div>
  </div>

  <!-- Main content: Posts + Sidebar -->
  <div class="main-layout" id="posts">
    <div class="main-posts">
      <div class="section-header" style="text-align:left"><div class="section-label">Latest Articles</div><h2 class="section-title">最新文章</h2></div>
      <div v-if="loading"><SkeletonCard v-for="i in 3" :key="i" /></div>
      <div v-if="posts.length > 0 && !loading"><PostCard v-for="(p, i) in posts" :key="p.id" :post="p" :index="i" /></div>
      <div v-if="posts.length === 0 && !loading" class="empty-state"><div class="empty-state-icon"><i class="bi bi-inbox"></i></div><p>暂无文章</p></div>
      <Pagination v-if="totalPages > 1" :page="currentPage" :total-pages="totalPages" @change="goPage" />
    </div>
    <aside class="main-sidebar">
      <div class="side-card">
        <h4><i class="bi bi-fire"></i> 热门文章</h4>
        <router-link v-for="h in hotPosts" :key="h.id" :to="'/post/' + h.slug" class="side-link">{{ h.title }} <span>{{ h.view_count }} 阅读</span></router-link>
      </div>
      <div class="side-card">
        <h4><i class="bi bi-folder2"></i> 分类</h4>
        <div class="side-tags">
          <router-link v-for="c in categories" :key="c.id" :to="{ path: '/', query: { category: c.slug } }" class="side-tag">{{ c.name }} <em>{{ c.post_count }}</em></router-link>
        </div>
        <div class="side-divider"></div>
        <h4><i class="bi bi-tags"></i> 标签</h4>
        <div class="side-tags">
          <router-link v-for="t in tags" :key="t.id" :to="{ path: '/', query: { tag: t.slug } }" class="side-tag side-tag--small">{{ t.name }} <em>{{ t.post_count }}</em></router-link>
        </div>
      </div>
      <div class="side-card">
        <h4><i class="bi bi-envelope"></i> 订阅</h4>
        <form @submit.prevent="subscribe" class="side-sub"><input v-model="subEmail" type="email" placeholder="your@email.com" required><button><i class="bi bi-send"></i></button></form>
        <p v-if="subMsg" style="font-size:0.74rem;color:var(--color-success);margin:6px 0 0">{{ subMsg }}</p>
      </div>
    </aside>
  </div>
</div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { postAPI, subscribeAPI } from '@/api'
import PostCard from '@/components/PostCard.vue'
import Pagination from '@/components/Pagination.vue'
import StardustScene from '@/components/StardustScene.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import FeaturedSwiper from '@/components/FeaturedSwiper.vue'
import Typed from 'typed.js'
import gsap from 'gsap'

const route = useRoute()
const posts = ref([]), loading = ref(false), currentPage = ref(1), totalPages = ref(0)
const stats = ref({}), featured = ref([]), hotPosts = ref([]), categories = ref([]), tags = ref([])
const subEmail = ref(''), subLoading = ref(false), subMsg = ref('')
const heroRef = ref(null), heroSectionRef = ref(null), typedRef = ref(null)
const searchQuery = computed(() => route.query.search || '')
const currentCategory = computed(() => route.query.category || '')
const currentTag = computed(() => route.query.tag || '')
const heroStyle = reactive({ transform: '', transition: 'transform 0.2s ease-out' })

function onHeroMove(e) {
  if (heroRef.value && heroSectionRef.value) {
    const r = heroSectionRef.value.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width - 0.5) * 3
    const y = ((e.clientY - r.top) / r.height - 0.5) * -2
    heroStyle.transform = `perspective(1200px) rotateY(${x}deg) rotateX(${y}deg) translateZ(10px)`
  }
}
function onHeroLeave() {
  heroStyle.transform = 'perspective(1200px) rotateY(0) rotateX(0) translateZ(0)'
}

function setupScrollReveal() {
  document.querySelectorAll('.scroll-reveal').forEach(el => {
    el.style.opacity = '0'; el.style.transform = 'translateY(30px)'; el.style.transition = 'opacity 0.7s ease, transform 0.7s ease'
    new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.style.opacity = '1'; el.style.transform = 'translateY(0)' } }, { threshold: 0.1 }).observe(el)
  })
}

async function fetchPosts(p = 1) {
  loading.value = true
  try { const param = { page: p, limit: 8 }; if (searchQuery.value) param.search = searchQuery.value; if (currentCategory.value) param.category = currentCategory.value; if (currentTag.value) param.tag = currentTag.value; const res = await postAPI.getPosts(param); posts.value = res.data.posts; currentPage.value = res.data.page; totalPages.value = res.data.totalPages; await nextTick(); setupScrollReveal() } catch (e) { console.error('Home fetchPosts error:', e) }
  finally { loading.value = false }
}

async function fetchAll() {
  try {
    const [cr, tr, fr, hr] = await Promise.all([postAPI.getCategories(), postAPI.getTags(), postAPI.getPosts({ limit: 3 }), postAPI.getHotPosts(5)])
    stats.value = { totalPosts: tr.data.reduce((s, t) => s + t.post_count, 0), totalCategories: cr.data.length, totalTags: tr.data.length }
    featured.value = (fr.data.posts || []).slice(0, 3).map((p, i) => ({ ...p, rank: i + 1 }))
    hotPosts.value = hr.data || []
    categories.value = cr.data || []
    tags.value = tr.data || []
    await nextTick(); setupScrollReveal()
  } catch (e) { console.error('Home fetchAll error:', e) }
}
function goPage(p) { currentPage.value = p; fetchPosts(p) }
function scrollToPosts() { document.getElementById('posts')?.scrollIntoView({ behavior: 'smooth' }) }
async function subscribe() { subLoading.value = true; try { await subscribeAPI.subscribe(subEmail.value); subMsg.value = '订阅成功！'; subEmail.value = '' } catch (e) { subMsg.value = e.response?.data?.error } finally { subLoading.value = false } }

watch([searchQuery, currentCategory, currentTag], () => fetchPosts(1), { immediate: true })
onMounted(() => {
  fetchAll()

  heroSectionRef.value?.addEventListener('mousemove', onHeroMove)
  heroSectionRef.value?.addEventListener('mouseleave', onHeroLeave)

  setTimeout(() => {
    if (typedRef.value) {
      new Typed(typedRef.value, {
        strings: ['思考与成长', '代码与生活', '热爱与坚持'],
        typeSpeed: 80,
        backSpeed: 40,
        backDelay: 2000,
        loop: true,
        showCursor: true,
        cursorChar: '|'
      })
    }

    // GSAP cinematic staggered entry
    const heroEl = heroRef.value?.querySelector('.hero-inner')
    if (heroEl) {
      const elements = heroEl.querySelectorAll('.hero-badge, .hero-icon-float, .hero-title, .hero-subtitle, .hero-actions')
      gsap.fromTo(elements,
        {
          opacity: 0,
          y: 40,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          delay: 0.3,
        }
      )
    }

    // Scroll hint pulse
    gsap.to('.hero-scroll-hint', {
      opacity: 0.7,
      y: 6,
      duration: 1.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
  }, 800)
})
</script>

<style scoped>
/* Hero Immersive */
.hero-immersive {
  position: relative;
  min-height: 72vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: transparent;
}

.hero-layer {
  position: relative;
  z-index: 2;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  will-change: transform;
}

.hero-inner {
  text-align: center;
  padding: 60px 24px 80px;
}

.hero-badge {
  display: inline-block;
  padding: 8px 22px;
  border-radius: 24px;
  background: rgba(201,169,110,0.1);
  border: 1px solid rgba(201,169,110,0.25);
  color: var(--color-accent);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 24px;
  backdrop-filter: blur(8px);
}

.hero-icon-float {
  font-size: 2.4rem;
  margin-bottom: 16px;
  color: var(--color-accent);
  animation: heroFloat 3.5s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(201,169,110,0.35));
}

.hero-title {
  font-size: 3.2rem;
  font-weight: 800;
  color: #fff !important;
  line-height: 1.2;
  letter-spacing: -0.03em;
  margin: 0 0 16px;
  opacity: 1 !important;
  visibility: visible !important;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: rgba(255,255,255,0.55) !important;
  line-height: 1.7;
  margin: 0 0 40px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  opacity: 1 !important;
  visibility: visible !important;
}

.hero-actions {
  display: flex;
  gap: 14px;
  justify-content: center;
  opacity: 1 !important;
  visibility: visible !important;
}

.hero-visible {
  opacity: 1 !important;
  visibility: visible !important;
}

.hero-actions {
  display: flex;
  gap: 14px;
  justify-content: center;
}

.hero-actions .btn-prime {
  background: var(--color-accent);
  color: #1a1510;
}
.hero-actions .btn-prime:hover {
  background: #d4b886;
  box-shadow: 0 0 40px rgba(201,169,110,0.25);
}

.hero-actions .btn-ghost {
  border-color: rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.7);
}
.hero-actions .btn-ghost:hover {
  border-color: rgba(201,169,110,0.5);
  color: var(--color-accent);
}

.hero-gradient-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 180px;
  background: linear-gradient(to top, var(--color-bg), transparent);
  z-index: 3;
  pointer-events: none;
}

.hero-scroll-hint {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 4;
  opacity: 0;
}

.scroll-line {
  width: 1px;
  height: 32px;
  background: linear-gradient(to bottom, rgba(201,169,110,0.5), transparent);
}

.hero-scroll-hint span {
  font-size: 0.65rem;
  color: rgba(255,255,255,0.4);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

@media (max-width: 768px) {
  .hero-immersive { min-height: 55vh }
  .hero-title { font-size: 2rem }
  .hero-subtitle { font-size: 0.95rem }
  .hero-badge { font-size: 0.65rem; padding: 6px 14px }
}

/* Bento Grid: Aurora Glass Cards */
.bento-row { max-width: 1150px; margin: 0 auto; padding: 0 24px; display: grid; grid-template-columns: 1fr 1.8fr; gap: 24px; align-items: start }
@media (max-width: 900px) { .bento-row { grid-template-columns: 1fr } }
.bento-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 14px }
.bento-stat {
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.45);
  border-radius: var(--radius-lg);
  padding: 24px 18px;
  text-align: center;
  transition: all 0.35s cubic-bezier(0.22, 0.61, 0.36, 1);
  box-shadow: 0 2px 12px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.03);
  position: relative;
  overflow: hidden;
}
.bento-stat::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.02'/%3E%3C/svg%3E");
  opacity: 0.5;
  pointer-events: none;
}
.bento-stat:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.06), 0 0 0 1px rgba(201,169,110,0.15); border-color: var(--color-accent) }
.bento-stat i { display: block; font-size: 1.5rem; color: var(--color-accent); margin-bottom: 8px }
.bento-stat b { display: block; font-size: 1.8rem; font-weight: 800; color: var(--color-text); line-height: 1.2 }
.bento-stat span { font-size: 0.74rem; color: var(--color-text-muted) }
.bento-featured { overflow: hidden }
.bento-featured :deep(.swiper-wrap) { padding: 0 }
.bento-featured :deep(.featured-card) {
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.45);
  box-shadow: 0 2px 12px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.03);
}

/* Main Layout */
.main-layout { max-width: 1150px; margin: 48px auto 0; padding: 0 24px 80px; display: grid; grid-template-columns: 1fr 280px; gap: 32px; align-items: start }
@media (max-width: 900px) { .main-layout { grid-template-columns: 1fr } }

/* Sidebar: Aurora Glass */
.side-card {
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.5);
  border-radius: var(--radius-lg);
  padding: 22px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.03);
  position: relative;
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.side-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.02'/%3E%3C/svg%3E");
  opacity: 0.5;
  pointer-events: none;
}
.side-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.06), 0 0 0 1px rgba(201,169,110,0.12) }
.side-card h4 { font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); margin: 0 0 14px; display: flex; align-items: center; gap: 6px; position: relative }
.side-card h4 i { color: var(--color-accent) }
.side-link { display: block; font-size: 0.82rem; color: var(--color-text); text-decoration: none; padding: 6px 0; border-bottom: 1px solid var(--color-border-light); display: flex; justify-content: space-between; align-items: center; transition: color 0.2s; position: relative }
.side-link:last-child { border-bottom: none }
.side-link:hover { color: var(--color-accent) }
.side-link span { font-size: 0.72rem; color: var(--color-text-muted); flex-shrink: 0; margin-left: 12px }
.side-tags { display: flex; flex-wrap: wrap; gap: 6px }
.side-tag { text-decoration: none; font-size: 0.76rem; padding: 4px 10px; border-radius: 14px; background: rgba(250,247,242,0.8); color: var(--color-text-secondary); transition: all 0.2s }
.side-tag:hover { background: var(--color-accent-light); color: var(--color-primary) }
.side-tag em { font-style: normal; opacity: 0.5; margin-left: 3px; font-size: 0.7rem }
.side-tag--small { font-size: 0.72rem; padding: 3px 8px; border-radius: 10px }
.side-divider { height: 1px; background: var(--color-border-light); margin: 16px 0 14px }
.side-card h4 + .side-divider + h4 { margin-top: 0; font-size: 0.78rem }
.side-sub { display: flex; gap: 6px }
.side-sub input { flex: 1; padding: 8px 12px; border: 1.5px solid var(--color-border); border-radius: 8px; font-size: 0.8rem; font-family: var(--font-sans); outline: none; background: rgba(255,255,255,0.6); transition: border-color 0.2s }
.side-sub input:focus { border-color: var(--color-accent) }
.side-sub button { width: 36px; height: 36px; border-radius: 8px; background: var(--color-primary); border: none; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s }
.side-sub button:hover { background: var(--color-accent) }
</style>
