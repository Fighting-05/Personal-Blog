<template>
  <div class="post-card-3d">
    <div class="post-card-inner">
      <img v-if="post.cover_image" :src="post.cover_image" class="post-card-cover" alt="">
      <div class="post-card-meta">
        <span class="post-card-tag" v-if="post.category_name">{{ post.category_name }}</span>
        <img :src="post.author_avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${post.author_name || 'user'}`" alt="">
        <span>{{ post.author_name }}</span>
        <span style="opacity:0.4">·</span>
        <span>{{ formatDate(post.created_at) }}</span>
      </div>
      <div class="post-card-body">
        <h3><router-link :to="'/post/' + post.slug">{{ post.title }}</router-link></h3>
        <p>{{ post.summary }}</p>
      </div>
      <div class="post-card-footer">
        <span><i class="bi bi-eye"></i> {{ post.view_count }} 阅读</span>
        <span><i class="bi bi-chat-dots"></i> {{ post.comment_count || 0 }} 评论</span>
        <span><i class="bi bi-heart"></i> {{ post.like_count || 0 }} 赞</span>
        <router-link :to="'/post/' + post.slug" class="btn-ghost" style="padding:6px 16px;font-size:0.82rem">
          阅读 <i class="bi bi-arrow-right"></i>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ post: Object, index: Number })
function formatDate(d) { return d ? new Date(d).toLocaleDateString('zh-CN') : '' }
</script>

<style scoped>
.post-card-3d { margin-bottom: 20px }
.post-card-inner {
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.5);
  border-radius: var(--radius-lg);
  padding: 28px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.03);
  transition: box-shadow 0.4s cubic-bezier(0.22, 0.61, 0.36, 1), border-color 0.3s;
  position: relative;
  overflow: hidden;
}
.post-card-inner::before {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.02'/%3E%3C/svg%3E");
  opacity: 0.5;
  pointer-events: none;
}
.post-card-3d:hover .post-card-inner { box-shadow: 0 12px 40px rgba(0,0,0,0.06), 0 0 0 1px rgba(201,169,110,0.15); border-color: var(--color-accent) }
.post-card-cover { width: 100%; height: 180px; object-fit: cover; border-radius: var(--radius-md); margin-bottom: 16px; position: relative; z-index: 1 }
.post-card-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 0.8rem; color: var(--color-text-muted); position: relative; z-index: 1 }
.post-card-meta img { width: 22px; height: 22px; border-radius: 50%; object-fit: cover }
.post-card-tag { background: rgba(201,169,110,0.12); color: var(--color-accent); padding: 2px 10px; border-radius: 12px; font-size: 0.72rem; font-weight: 600 }
.post-card-body h3 { font-size: 1.1rem; font-weight: 700; margin: 0 0 8px; line-height: 1.3; position: relative; z-index: 1 }
.post-card-body h3 a { color: var(--color-text); text-decoration: none }
.post-card-body h3 a:hover { color: var(--color-accent) }
.post-card-body p { font-size: 0.85rem; color: var(--color-text-muted); margin: 0; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; position: relative; z-index: 1 }
.post-card-footer { display: flex; align-items: center; gap: 14px; margin-top: 16px; padding-top: 14px; border-top: 1px solid rgba(0,0,0,0.04); font-size: 0.78rem; color: var(--color-text-muted); flex-wrap: wrap; position: relative; z-index: 1 }
.post-card-footer .btn-ghost { margin-left: auto }
</style>
