<template>
  <div v-if="posts.length > 0" class="related-section">
    <div class="section-header" style="text-align:left;margin-bottom:20px">
      <div class="section-label">You might also like</div>
      <h3 style="font-size:1.15rem;font-weight:700;margin:0">相关推荐</h3>
    </div>
    <div class="related-grid">
      <router-link v-for="p in posts" :key="p.id" :to="'/post/' + p.slug" class="related-card">
        <div class="related-cover" v-if="p.cover_image">
          <img :src="p.cover_image" alt="" loading="lazy">
        </div>
        <div class="related-info">
          <h4>{{ p.title }}</h4>
          <div class="related-meta">
            <span><i class="bi bi-eye"></i> {{ p.view_count }}</span>
            <span><i class="bi bi-calendar3"></i> {{ formatDate(p.created_at) }}</span>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { postAPI } from '@/api'

const props = defineProps({ tags: Array, categoryId: Number, excludeId: Number })
const posts = ref([])

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('zh-CN') : ''
}

onMounted(async () => {
  const tag = props.tags?.[0]?.slug
  const category = props.categoryId
  try {
    const res = await postAPI.getPosts({ limit: 4, tag, category })
    posts.value = (res.data.posts || []).filter(p => p.id !== props.excludeId).slice(0, 3)
  } catch (_) {}
})
</script>

<style scoped>
.related-section { margin-top: 48px; padding-top: 32px; border-top: 1px solid var(--color-border-light) }
.related-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px }
@media (max-width: 768px) { .related-grid { grid-template-columns: 1fr } }
.related-card {
  background: var(--color-surface); border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md); overflow: hidden; text-decoration: none;
  transition: all 0.3s ease; display: block;
}
.related-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: var(--color-accent) }
.related-cover img { width: 100%; height: 120px; object-fit: cover; display: block }
.related-info { padding: 12px 14px }
.related-info h4 {
  font-size: 0.88rem; font-weight: 600; color: var(--color-text);
  margin: 0 0 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  line-height: 1.4;
}
.related-meta {
  display: flex; gap: 12px; font-size: 0.74rem; color: var(--color-text-muted);
}
.related-meta i { margin-right: 3px }
</style>
