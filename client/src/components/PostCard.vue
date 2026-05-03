<template>
  <div class="post-card-3d" ref="cardRef" @mousemove="onMouseMove" @mouseleave="onMouseLeave">
    <div class="post-card-inner" ref="innerRef">
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
          阅读更多 <i class="bi bi-arrow-right"></i>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
defineProps({ post: Object, index: Number })
const cardRef = ref(null), innerRef = ref(null)
function onMouseMove(e) {
  const card = cardRef.value, inner = innerRef.value
  if (!card || !inner) return
  const rect = card.getBoundingClientRect()
  const x = e.clientX - rect.left, y = e.clientY - rect.top
  const cx = rect.width / 2, cy = rect.height / 2
  const rx = ((y - cy) / cy) * -6, ry = ((x - cx) / cx) * 8
  inner.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(10px)`
}
function onMouseLeave() {
  if (innerRef.value) innerRef.value.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0)'
}
function formatDate(d) { return d ? new Date(d).toLocaleDateString('zh-CN') : '' }
</script>
