<template>
<div class="cat-root">
  <section class="cat-hero">
    <div class="cat-badge">Explore</div>
    <h1>分类 & 标签</h1>
    <p>按主题分类浏览，或通过标签探索感兴趣的内容</p>
  </section>

  <div class="tag-cloud-wrap" v-if="tags.length">
    <div ref="cloudRef" class="tag-3d-cloud"></div>
  </div>

  <div class="cat-section">
    <div class="cat-section-title"><span>文章分类</span></div>
    <div class="cat-grid" v-if="categories.length">
      <router-link
        v-for="c in categories"
        :key="c.id"
        :to="{ path: '/', query: { category: c.slug } }"
        class="cat-card"
      >
        <div class="cat-icon"><i :class="catIcons[c.slug] || 'bi bi-folder'"></i></div>
        <div class="cat-body">
          <h3>{{ c.name }}</h3>
          <p v-if="c.description">{{ c.description }}</p>
        </div>
        <div class="cat-meta">
          <span class="cat-count">{{ c.post_count }} 篇</span>
          <span class="cat-arrow"><i class="bi bi-arrow-right"></i></span>
        </div>
      </router-link>
    </div>

    <div v-if="categories.length === 0 && !loading" class="empty-state">
      <div class="empty-state-icon"><i class="bi bi-inbox"></i></div>
      <p>暂无分类</p>
    </div>

    <div class="cat-stats" v-if="statsData">
      <div class="cat-stats-header">
        <h2><i class="bi bi-bar-chart"></i> 数据看板</h2>
        <div class="cat-stats-summary">
          <span><i class="bi bi-file-text"></i> {{ statsData.totalPosts }} 篇文章</span>
          <span><i class="bi bi-eye"></i> {{ statsData.totalViews }} 次阅读</span>
          <span><i class="bi bi-chat-dots"></i> {{ statsData.totalComments }} 条评论</span>
        </div>
      </div>

      <div class="cat-charts">
        <div class="cat-chart-card">
          <h3>分类分布</h3>
          <Doughnut v-if="doughnutData" :data="doughnutData" :options="doughnutOptions" />
        </div>
        <div class="cat-chart-card">
          <h3>近12月发文趋势</h3>
          <Bar v-if="barData" :data="barData" :options="barOptions" />
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { postAPI } from '@/api'
import TagCloud from 'TagCloud'
import { Doughnut, Bar } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const categories = ref([])
const tags = ref([])
const cloudRef = ref(null)
const loading = ref(true)
const statsData = ref(null)
let cloudInstance = null

const colors = ['#6C3FF5', '#FF9B6B', '#E8D754', '#06b6d4', '#42b883', '#3178c6', '#e66b5b', '#f59e0b', '#8e44ad', '#2ecc71']

const doughnutData = computed(() => {
  if (!statsData.value?.categories?.length) return null
  return {
    labels: statsData.value.categories.map(c => c.name),
    datasets: [{
      data: statsData.value.categories.map(c => c.count),
      backgroundColor: colors.slice(0, statsData.value.categories.length),
      borderWidth: 0,
    }],
  }
})

const doughnutOptions = { responsive: true, plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } } } }

const barData = computed(() => {
  if (!statsData.value?.monthly?.length) return null
  return {
    labels: statsData.value.monthly.map(m => m.month),
    datasets: [{
      label: '文章数',
      data: statsData.value.monthly.map(m => m.count),
      backgroundColor: '#6C3FF5',
      borderRadius: 6,
    }],
  }
})

const barOptions = { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }

const catIcons = {
  tech: 'bi bi-code-slash',
  frontend: 'bi bi-window-stack',
  backend: 'bi bi-server',
  ai: 'bi bi-cpu',
  life: 'bi bi-cup-hot',
  project: 'bi bi-rocket-takeoff',
  reading: 'bi bi-book',
  design: 'bi bi-palette'
}

onMounted(async () => {
  try {
    const [cr, tr] = await Promise.all([
      postAPI.getCategories(),
      postAPI.getTags(),
    ])
    categories.value = cr.data || []
    tags.value = tr.data || []
  } catch (e) {
    console.error('Categories fetch error:', e)
  }

  try {
    const sr = await postAPI.getStats()
    statsData.value = sr.data
  } catch {}

  loading.value = false

  await nextTick()
  if (tags.value.length && cloudRef.value) {
    cloudInstance = TagCloud(cloudRef.value, tags.value.map(t => t.name), {
      radius: 200,
      maxSpeed: 'normal',
      initSpeed: 'normal',
      keep: true
    })
  }
})

onBeforeUnmount(() => {
  if (cloudInstance?.destroy) cloudInstance.destroy()
})
</script>

<style scoped>
.cat-root { max-width: 880px; margin: 0 auto; padding: 0 24px 80px }

/* Hero */
.cat-hero {
  text-align: center;
  padding: 56px 0 36px;
}

.cat-badge {
  display: inline-block;
  padding: 6px 18px;
  border-radius: 20px;
  background: rgba(201,169,110,0.1);
  border: 1px solid rgba(201,169,110,0.2);
  color: var(--color-accent);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 14px;
}

.cat-hero h1 {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0 0 8px;
}

.cat-hero p {
  font-size: 0.92rem;
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.6;
}

/* 3D Tag Cloud */
.tag-cloud-wrap {
  width: 420px;
  height: 420px;
  margin: 0 auto 24px;
  overflow: hidden;
  clip-path: inset(0);
}

.tag-3d-cloud {
  width: 100%;
  height: 100%;
  cursor: grab;
}

.tag-3d-cloud:active {
  cursor: grabbing;
}

/* Category Section Title */
.cat-section-title {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.cat-section-title span {
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.cat-section-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border-light);
}

/* Category Grid */
.cat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.cat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 22px;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: 1.5px solid var(--color-border-light);
  text-decoration: none;
  transition: all 0.3s ease;
  animation: catFadeIn 0.5s ease both;
}

@keyframes catFadeIn {
  from { opacity: 0; transform: translateY(12px) }
  to { opacity: 1; transform: translateY(0) }
}

.cat-card:hover {
  box-shadow: var(--shadow-lg);
  border-color: var(--color-accent);
  transform: translateY(-2px);
}

.cat-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  flex-shrink: 0;
  background: #faf7f2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: var(--color-accent);
  transition: background 0.3s, color 0.3s;
}

.cat-card:hover .cat-icon {
  background: rgba(201,169,110,0.12);
}

.cat-body {
  flex: 1;
  min-width: 0;
}

.cat-body h3 {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 3px;
  transition: color 0.2s;
}

.cat-card:hover .cat-body h3 {
  color: var(--color-accent);
}

.cat-body p {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Stats Dashboard */
.cat-stats { margin-top: 48px }
.cat-stats-header { margin-bottom: 24px }
.cat-stats-header h2 { font-size: 1.15rem; font-weight: 800; margin: 0 0 12px; display: flex; align-items: center; gap: 10px }
.cat-stats-header h2 i { color: var(--color-accent) }
.cat-stats-summary { display: flex; gap: 24px; flex-wrap: wrap }
.cat-stats-summary span { font-size: 0.82rem; color: var(--color-text-muted); display: flex; align-items: center; gap: 6px }
.cat-stats-summary i { color: var(--color-accent) }
.cat-charts { display: grid; grid-template-columns: 1fr 1fr; gap: 20px }
.cat-chart-card {
  background: var(--color-surface); border: 1px solid var(--color-border-light);
  border-radius: 14px; padding: 24px;
}
.cat-chart-card h3 { font-size: 0.88rem; font-weight: 700; margin: 0 0 16px; color: var(--color-text) }

@media (max-width: 680px) {
  .cat-charts { grid-template-columns: 1fr }
  .cat-grid { grid-template-columns: 1fr }
  .tag-cloud-wrap { width: 300px; height: 300px }
  .cat-hero { padding: 40px 0 24px }
  .cat-hero h1 { font-size: 1.5rem }
}
</style>
