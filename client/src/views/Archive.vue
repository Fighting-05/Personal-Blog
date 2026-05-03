<template>
  <div class="content-wrapper" style="padding-top:40px">
    <div class="section-header" style="text-align:left">
      <div class="section-label">Archive</div>
      <h2 style="font-size:1.8rem;font-weight:800;margin:0;letter-spacing:-0.02em">
        <i class="bi bi-archive" style="color:var(--color-accent)"></i> 文章归档
      </h2>
    </div>

    <!-- Filtered View -->
    <div v-if="year && month" style="margin-bottom:24px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
        <span style="font-size:1.1rem;font-weight:700">{{ year }}年{{ month }}月</span>
        <span style="padding:3px 12px;border-radius:12px;background:#f5f0e8;color:var(--color-primary);font-size:0.8rem;font-weight:600">{{ posts.length }} 篇</span>
        <router-link to="/archive" class="btn-ghost" style="padding:6px 16px;font-size:0.82rem;margin-left:auto">返回归档</router-link>
      </div>
      <div style="background:var(--color-surface);border-radius:var(--radius-lg);border:1px solid var(--color-border-light);overflow:hidden">
        <router-link v-for="p in posts" :key="p.id" :to="'/post/' + p.slug"
          style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;border-bottom:1px solid var(--color-border-light);color:var(--color-text);transition:background 0.15s;text-decoration:none"
          @mouseenter="$event.target.style.background='#faf8f5'" @mouseleave="$event.target.style.background='transparent'"
        >
          <span style="font-weight:500">{{ p.title }}</span>
          <small style="color:var(--color-text-muted)">{{ formatDate(p.created_at) }}</small>
        </router-link>
      </div>
    </div>

    <!-- Year Filtered View -->
    <div v-else-if="year" style="margin-bottom:24px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
        <span style="font-size:1.1rem;font-weight:700">{{ year }}年</span>
        <router-link to="/archive" class="btn-ghost" style="padding:6px 16px;font-size:0.82rem;margin-left:auto">返回归档</router-link>
      </div>
      <div style="background:var(--color-surface);border-radius:var(--radius-lg);border:1px solid var(--color-border-light);overflow:hidden">
        <router-link v-for="p in posts" :key="p.id" :to="'/post/' + p.slug"
          style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;border-bottom:1px solid var(--color-border-light);color:var(--color-text);transition:background 0.15s;text-decoration:none"
          @mouseenter="$event.target.style.background='#faf8f5'" @mouseleave="$event.target.style.background='transparent'"
        >
          <span style="font-weight:500">{{ p.title }}</span>
          <small style="color:var(--color-text-muted)">{{ formatDate(p.created_at) }}</small>
        </router-link>
      </div>
    </div>

    <!-- Archive Grid -->
    <div v-else style="display:grid;grid-template-columns:repeat(auto-fill, minmax(220px,1fr));gap:16px">
      <router-link
        v-for="item in archiveData" :key="item.year + item.month"
        :to="{ path: '/archive', query: { year: item.year, month: item.month } }"
        style="background:var(--color-surface);border-radius:var(--radius-lg);padding:24px;border:1px solid var(--color-border-light);transition:all 0.3s ease;text-decoration:none;display:block"
        @mouseenter="$event.target.style.transform='translateY(-3px)';$event.target.style.boxShadow='var(--shadow-lg)';$event.target.style.borderColor='var(--color-accent-light)'"
        @mouseleave="$event.target.style.transform='';$event.target.style.boxShadow='';$event.target.style.borderColor='var(--color-border-light)'"
      >
        <div style="font-size:1.1rem;font-weight:700;color:var(--color-text);margin-bottom:6px">{{ item.year }}年{{ item.month }}月</div>
        <span style="padding:3px 12px;border-radius:12px;background:#f5f0e8;color:var(--color-primary);font-size:0.8rem;font-weight:600">{{ item.count }} 篇文章</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { postAPI } from '@/api'

const route = useRoute()
const archiveData = ref([])
const posts = ref([])

const year = computed(() => route.query.year || '')
const month = computed(() => route.query.month || '')

async function fetchArchive() {
  try {
    const params = {}
    if (year.value) params.year = year.value
    if (month.value) params.month = month.value
    const res = await postAPI.getArchive(params)
    archiveData.value = res.data.archive || []
    posts.value = res.data.posts || []
  } catch (e) {
    console.error(e)
  }
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('zh-CN') : ''
}

watch([year, month], fetchArchive, { immediate: true })
</script>
