<template>
  <div>
    <h2 style="font-size:1.5rem;font-weight:700;margin:0 0 28px;letter-spacing:-0.02em">仪表盘</h2>

    <div v-if="loading" class="loading-spinner"><div class="spinner-ring"></div></div>

    <div v-else>
      <div class="admin-stat-grid">
        <div v-for="s in statsItems" :key="s.label" class="admin-stat-card">
          <div class="admin-stat-icon" :style="{ background: s.bg, color: s.color }">
            <i :class="s.icon"></i>
          </div>
          <div class="admin-stat-value">{{ s.value }}</div>
          <div class="admin-stat-label">{{ s.label }}</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
        <div style="background:var(--color-surface);border-radius:var(--radius-lg);padding:24px;border:1px solid var(--color-border-light)">
          <h4 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--color-text-muted);margin:0 0 16px">最近文章</h4>
          <div v-for="p in recentPosts" :key="p.id" style="padding:12px 0;border-bottom:1px solid var(--color-border-light);display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:0.88rem;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;margin-right:12px">{{ p.title }}</span>
            <span style="font-size:0.78rem;color:var(--color-text-muted);white-space:nowrap">{{ p.author_name }}</span>
          </div>
        </div>
        <div style="background:var(--color-surface);border-radius:var(--radius-lg);padding:24px;border:1px solid var(--color-border-light)">
          <h4 style="font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--color-text-muted);margin:0 0 16px">最近评论</h4>
          <div v-for="c in recentComments" :key="c.id" style="padding:12px 0;border-bottom:1px solid var(--color-border-light);display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:0.84rem;color:var(--color-text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;margin-right:12px">{{ c.content?.substring(0, 40) }}</span>
            <span style="font-size:0.78rem;color:var(--color-text-muted);white-space:nowrap">{{ c.username }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminAPI } from '@/api'

const loading = ref(true)
const stats = ref({})
const recentPosts = ref([])
const recentComments = ref([])

const statsItems = computed(() => [
  { label: '文章总数', value: stats.value.postCount || 0, icon: 'bi bi-file-text', bg: 'rgba(139,115,85,0.1)', color: 'var(--color-primary)' },
  { label: '评论总数', value: stats.value.commentCount || 0, icon: 'bi bi-chat-dots', bg: 'rgba(107,155,122,0.1)', color: 'var(--color-success)' },
  { label: '用户总数', value: stats.value.userCount || 0, icon: 'bi bi-people', bg: 'rgba(123,140,168,0.1)', color: 'var(--color-info)' },
  { label: '分类数量', value: stats.value.categoryCount || 0, icon: 'bi bi-folder', bg: 'rgba(201,169,110,0.12)', color: 'var(--color-accent)' },
  { label: '总访问量', value: stats.value.totalViews || 0, icon: 'bi bi-graph-up', bg: 'rgba(220,107,107,0.1)', color: 'var(--color-danger)' }
])

onMounted(async () => {
  try {
    const res = await adminAPI.getDashboard()
    stats.value = res.data.stats
    recentPosts.value = res.data.recentPosts
    recentComments.value = res.data.recentComments
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
