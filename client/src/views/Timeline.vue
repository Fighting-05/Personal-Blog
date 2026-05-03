<template>
<div class="archive-root">
  <section class="archive-hero">
    <div class="archive-badge">Archive</div>
    <h1>文章归档</h1>
    <p v-if="totalPosts">共 {{ totalPosts }} 篇文章，按时间线浏览</p>
  </section>

  <div class="archive-list" v-if="groups.length">
    <div v-for="group in groups" :key="`${group.year}-${group.month}`" class="archive-group" data-aos="fade-up">
      <div class="archive-month-header">
        <span class="archive-year-dot"></span>
        <span class="archive-month-label">{{ group.year }} 年 {{ group.month }} 月</span>
        <span class="archive-month-count">{{ group.count }} 篇</span>
      </div>
      <div class="archive-items">
        <router-link
          v-for="p in group.posts"
          :key="p.id"
          :to="'/post/' + p.slug"
          class="archive-item"
        >
          <time class="archive-day">{{ formatDay(p.created_at) }}</time>
          <span class="archive-line"></span>
          <div class="archive-item-body">
            <h3>{{ p.title }}</h3>
            <span class="archive-meta">
              <i class="bi bi-eye"></i> {{ p.view_count || 0 }} 阅读
            </span>
          </div>
        </router-link>
      </div>
    </div>
  </div>

  <div v-else-if="loading" class="loading-spinner">
    <div class="spinner-ring"></div>
  </div>

  <div v-else class="empty-state" style="padding:80px 0">
    <div class="empty-state-icon"><i class="bi bi-inbox"></i></div>
    <p>暂无归档文章</p>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { postAPI } from '@/api'

const groups = ref([])
const totalPosts = ref(0)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await postAPI.getArchive({ full: 1 })
    if (res.data.groups) {
      groups.value = res.data.groups
      totalPosts.value = res.data.groups.reduce((s, g) => s + g.count, 0)
    }
  } catch (e) {
    console.error('Archive fetch error:', e)
  } finally {
    loading.value = false
  }
})

function formatDay(d) {
  if (!d) return ''
  const date = new Date(d)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}
</script>

<style scoped>
.archive-root {
  max-width: 780px;
  margin: 0 auto;
  padding: 0 24px 80px;
}

.archive-hero {
  text-align: center;
  padding: 60px 0 48px;
}

.archive-badge {
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
  margin-bottom: 16px;
}

.archive-hero h1 {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 8px;
  color: var(--color-text);
}

.archive-hero p {
  font-size: 0.92rem;
  color: var(--color-text-muted);
  margin: 0;
}

/* Month Group */
.archive-group {
  margin-bottom: 36px;
}

.archive-month-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--color-border-light);
}

.archive-year-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 8px rgba(201,169,110,0.4);
  flex-shrink: 0;
}

.archive-month-label {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text);
}

.archive-month-count {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  background: rgba(0,0,0,0.04);
  padding: 2px 10px;
  border-radius: 10px;
  margin-left: auto;
}

/* Items */
.archive-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.archive-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 10px;
  text-decoration: none;
  transition: background 0.2s;
}

.archive-item:hover {
  background: rgba(0,0,0,0.02);
}

.archive-day {
  flex-shrink: 0;
  width: 56px;
  font-size: 0.78rem;
  color: var(--color-text-muted);
  text-align: right;
  padding-top: 2px;
  font-variant-numeric: tabular-nums;
}

.archive-line {
  flex-shrink: 0;
  width: 2px;
  align-self: stretch;
  background: var(--color-border-light);
  border-radius: 1px;
}

.archive-item-body {
  flex: 1;
  min-width: 0;
}

.archive-item-body h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 4px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s;
}

.archive-item:hover .archive-item-body h3 {
  color: var(--color-accent);
}

.archive-meta {
  font-size: 0.76rem;
  color: var(--color-text-muted);
}

.archive-meta i {
  margin-right: 3px;
}

@media (max-width: 640px) {
  .archive-hero { padding: 40px 0 32px }
  .archive-hero h1 { font-size: 1.5rem }
  .archive-day { width: 44px; font-size: 0.72rem }
  .archive-item { padding: 10px 12px; gap: 10px }
}
</style>
