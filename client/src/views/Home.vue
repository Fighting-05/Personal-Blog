<template>
  <div class="home-root">
    <div class="cursor-glow" ref="glowRef"></div>
    <section class="hero-section" ref="heroSectionRef" @mousemove="onHeroMove" @mouseleave="onHeroLeave">
      <ParticleBackground />
      <div class="hero-content" ref="heroRef" :style="heroStyle">
        <div class="hero-icon-float">✧</div>
        <div class="hero-greeting">Personal Blog</div>
        <h1 class="hero-title">用文字记录<br><span ref="typedRef"></span></h1>
        <p class="hero-subtitle">分享技术笔记、生活感悟与项目实战经验。<br>在这里，每一篇文章都是一次认真的记录。</p>
        <div style="display:flex;gap:12px;justify-content:center">
          <router-link to="/archive" class="btn-prime"><i class="bi bi-archive"></i> 浏览归档</router-link>
          <a href="#posts" class="btn-ghost" @click.prevent="scrollToPosts"><i class="bi bi-arrow-down"></i> 最新文章</a>
        </div>
      </div>
    </section>

    <div class="content-wrapper"><div class="about-section scroll-reveal">
      <div class="about-card card-3d"><div class="about-card-icon" style="background:rgba(201,169,110,0.12);color:var(--color-accent)"><i class="bi bi-file-text"></i></div><div class="about-card-value">{{ stats.totalPosts }}</div><div class="about-card-label">篇文章</div></div>
      <div class="about-card card-3d"><div class="about-card-icon" style="background:rgba(139,115,85,0.1);color:var(--color-primary)"><i class="bi bi-folder"></i></div><div class="about-card-value">{{ stats.totalCategories }}</div><div class="about-card-label">个分类</div></div>
      <div class="about-card card-3d"><div class="about-card-icon" style="background:rgba(107,155,122,0.1);color:var(--color-success)"><i class="bi bi-tags"></i></div><div class="about-card-value">{{ stats.totalTags }}</div><div class="about-card-label">个标签</div></div>
    </div></div>

    <div class="content-wrapper scroll-reveal" v-if="featured.length"><FeaturedSwiper :featured="featured" /></div>

    <div class="content-wrapper"><div v-if="searchQuery || currentCategory || currentTag" style="display:flex;align-items:center;gap:8px;margin-bottom:24px;padding:12px 18px;background:var(--color-surface);border-radius:var(--radius-md);border:1px solid var(--color-border-light)"><span style="color:var(--color-text-muted);font-size:0.85rem">筛选结果：<strong style="color:var(--color-text)">{{ searchQuery || currentCategory || '#' + currentTag }}</strong></span><router-link to="/" class="btn-ghost" style="padding:3px 12px;font-size:0.78rem;margin-left:auto">清除</router-link></div></div>

    <div class="content-wrapper scroll-reveal" id="posts">
      <div class="section-header"><div class="section-label">Latest Articles</div><h2 class="section-title">最新文章</h2></div>
      <div v-if="loading"><SkeletonCard v-for="i in 3" :key="i" /></div>
      <div v-if="posts.length > 0 && !loading"><PostCard v-for="(p, i) in posts" :key="p.id" :post="p" :index="i" /></div>
      <div v-if="posts.length === 0 && !loading" class="empty-state"><div class="empty-state-icon"><i class="bi bi-inbox"></i></div><p>暂无文章</p></div>
      <Pagination v-if="totalPages > 1" :page="currentPage" :total-pages="totalPages" @change="goPage" />
    </div>

    <div class="content-wrapper scroll-reveal" style="margin-top:48px;text-align:center">
      <div style="background:linear-gradient(135deg,#faf7f2 0%,#f0ece6 100%);border-radius:var(--radius-lg);padding:40px;border:1px solid var(--color-border-light)">
        <div style="font-size:1.5rem;margin-bottom:8px">📬</div>
        <h3 style="font-size:1.2rem;font-weight:700;margin:0 0 8px">订阅更新</h3>
        <p style="color:var(--color-text-muted);font-size:0.88rem;margin:0 0 20px">新文章发布时，邮件通知你</p>
        <form @submit.prevent="subscribe" style="display:flex;gap:10px;max-width:420px;margin:0 auto"><input v-model="subEmail" type="email" class="input-elegant" placeholder="your@email.com" required style="flex:1"><button type="submit" class="btn-prime" style="padding:10px 24px;font-size:0.84rem;white-space:nowrap">{{ subLoading ? '...' : '订阅' }}</button></form>
        <p v-if="subMsg" style="margin-top:12px;font-size:0.82rem;color:var(--color-success)">{{ subMsg }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { postAPI, subscribeAPI } from '@/api'
import PostCard from '@/components/PostCard.vue'
import Pagination from '@/components/Pagination.vue'
import ParticleBackground from '@/components/ParticleBackground.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import FeaturedSwiper from '@/components/FeaturedSwiper.vue'
import Typed from 'typed.js'
import gsap from 'gsap'

const route = useRoute()
const posts = ref([]), loading = ref(false), currentPage = ref(1), totalPages = ref(0)
const stats = ref({ totalPosts: 0, totalCategories: 0, totalTags: 0 }), featured = ref([])
const subEmail = ref(''), subLoading = ref(false), subMsg = ref('')
const heroRef = ref(null), heroSectionRef = ref(null), glowRef = ref(null), typedRef = ref(null)
const searchQuery = computed(() => route.query.search || '')
const currentCategory = computed(() => route.query.category || '')
const currentTag = computed(() => route.query.tag || '')

const heroStyle = reactive({ transform: '', transition: 'transform 0.15s ease-out' })

function onHeroMove(e) {
  if (glowRef.value) { const r = heroSectionRef.value.getBoundingClientRect(); glowRef.value.style.setProperty('--x', (e.clientX - r.left) + 'px'); glowRef.value.style.setProperty('--y', (e.clientY - r.top) + 'px'); glowRef.value.style.opacity = '1' }
  if (heroRef.value) { const r = heroSectionRef.value.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5; const y = (e.clientY - r.top) / r.height - 0.5; heroStyle.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg)` }
}
function onHeroLeave() { if (glowRef.value) glowRef.value.style.opacity = '0'; heroStyle.transform = 'perspective(800px) rotateY(0) rotateX(0)' }

function setupScrollReveal() {
  const ob = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) { gsap.to(e.target, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }) } }) }, { threshold: 0.15 })
  document.querySelectorAll('.scroll-reveal').forEach(el => ob.observe(el))
}

async function fetchPosts(page = 1) {
  loading.value = true
  try { const p = { page, limit: 6 }; if (searchQuery.value) p.search = searchQuery.value; if (currentCategory.value) p.category = currentCategory.value; if (currentTag.value) p.tag = currentTag.value; const res = await postAPI.getPosts(p); posts.value = res.data.posts; currentPage.value = res.data.page; totalPages.value = res.data.totalPages; await nextTick(); setupScrollReveal() } catch (e) {}
  finally { loading.value = false }
}

async function fetchStats() {
  try { const [cr, tr, hr] = await Promise.all([postAPI.getCategories(), postAPI.getTags(), postAPI.getPosts({ limit: 3 })]); stats.value = { totalPosts: tr.data.reduce((s, t) => s + t.post_count, 0), totalCategories: cr.data.length, totalTags: tr.data.length }; featured.value = (hr.data.posts || []).slice(0, 3).map((p, i) => ({ ...p, rank: i + 1 })); await nextTick(); setupScrollReveal() } catch (e) {}
}

function goPage(p) { currentPage.value = p; fetchPosts(p); window.scrollTo({ top: 400, behavior: 'smooth' }) }
function scrollToPosts() { document.getElementById('posts')?.scrollIntoView({ behavior: 'smooth' }) }
async function subscribe() { subLoading.value = true; try { await subscribeAPI.subscribe(subEmail.value); subMsg.value = '订阅成功！'; subEmail.value = '' } catch (e) { subMsg.value = e.response?.data?.error || '失败' } finally { subLoading.value = false } }

watch([searchQuery, currentCategory, currentTag], () => fetchPosts(1), { immediate: true })

onMounted(() => {
  fetchStats()
  new Typed(typedRef.value, { strings: ['思考与成长', '代码与生活', '热爱与坚持'], typeSpeed: 80, backSpeed: 40, backDelay: 2000, loop: true, showCursor: true, cursorChar: '|' })
})
</script>
