<template>
  <div>
    <ProgressBar v-if="post" />

    <div v-if="loading" class="loading-spinner">
      <div class="spinner-ring"></div>
    </div>

    <div v-else-if="post" :class="hasHeadings ? 'article-layout' : ''">
      <TocNav v-if="hasHeadings" />

      <article class="article-container" data-aos="fade-up">
        <img v-if="post.cover_image" :src="post.cover_image" class="article-cover" alt="">

        <header class="article-header">
          <h1 class="article-title">{{ post.title }}</h1>
          <div class="article-meta">
            <img :src="post.author_avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${post.author_name || 'user'}`" style="width:28px;height:28px;border-radius:50%;object-fit:cover" alt="">
            <span>{{ post.author_name }}</span>
            <span style="opacity:0.3">·</span>
            <span>{{ formatDate(post.created_at) }}</span>
            <span style="opacity:0.3">·</span>
            <span><i class="bi bi-eye"></i> {{ post.view_count }} 阅读</span>
            <span v-if="readingTime" style="opacity:0.3">·</span>
            <span v-if="readingTime"><i class="bi bi-clock"></i> {{ readingTime }}</span>
            <span v-if="post.category_name" style="opacity:0.3">·</span>
            <span v-if="post.category_name">{{ post.category_name }}</span>
          </div>
        </header>

        <div class="article-content" ref="contentRef" v-html="renderedContent"></div>

        <div class="article-tags" v-if="post.tags?.length">
          <router-link v-for="tag in post.tags" :key="tag.id" :to="{ path: '/', query: { tag: tag.slug } }" class="tag-pill">
            #{{ tag.name }}
          </router-link>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:32px;padding-top:24px;border-top:1px solid var(--color-border-light)">
          <button class="like-btn" :class="{ liked }" @click="toggleLike">
            <i class="bi" :class="liked ? 'bi-heart-fill' : 'bi-heart'"></i>
            {{ post.like_count }} 赞
          </button>
          <button class="like-btn" @click="sharePost">
            <i class="bi" :class="shareDone ? 'bi-check-lg' : 'bi-share'"></i>
            {{ shareDone ? '已复制' : '分享' }}
          </button>
          <div class="post-nav-links">
            <div class="post-nav-item prev" @mouseenter="hoverPrev = true" @mouseleave="hoverPrev = false">
              <router-link v-if="prevPost" :to="'/post/' + prevPost.slug" class="post-nav-link">
                <span><i class="bi bi-chevron-left"></i> 上一篇</span>
                <span class="post-nav-title">{{ prevPost.title }}</span>
              </router-link>
            </div>
            <div class="post-nav-item next" @mouseenter="hoverNext = true" @mouseleave="hoverNext = false">
              <router-link v-if="nextPost" :to="'/post/' + nextPost.slug" class="post-nav-link">
                <span>下一篇 <i class="bi bi-chevron-right"></i></span>
                <span class="post-nav-title">{{ nextPost.title }}</span>
              </router-link>
            </div>
          </div>
        </div>

        <div style="margin-top:48px">
          <CommentBox :post-id="post.id" :comments="comments" :total="commentsTotal" @refresh="fetchPost" />
        </div>

        <RelatedPosts
          v-if="post.tags?.length || post.category_id"
          :tags="post.tags" :category-id="post.category_id" :exclude-id="post.id"
        />
      </article>

      <ImageLightbox :images="lightboxImages" v-model="lightboxOpen" />
    </div>

    <div v-else class="empty-state">
      <div class="empty-state-icon"><i class="bi bi-file-earmark-x"></i></div>
      <p>文章不存在</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { postAPI } from '@/api'
import { marked } from 'marked'
import { useAuthStore } from '@/stores/auth'
import CommentBox from '@/components/CommentBox.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import TocNav from '@/components/TocNav.vue'
import RelatedPosts from '@/components/RelatedPosts.vue'
import ImageLightbox from '@/components/ImageLightbox.vue'

const route = useRoute()
const authStore = useAuthStore()
const post = ref(null)
const comments = ref([])
const commentsTotal = ref(0)
const prevPost = ref(null)
const nextPost = ref(null)
const liked = ref(false)
const loading = ref(true)
const contentRef = ref(null)
const hasHeadings = ref(false)
const lightboxImages = ref([])
const lightboxOpen = ref(false)
const shareDone = ref(false)

const renderedContent = computed(() => {
  if (!post.value?.content) return ''
  return marked.parse(post.value.content)
})

const readingTime = computed(() => {
  if (!post.value?.content) return ''
  const charCount = post.value.content.replace(/[\s\n]/g, '').length
  const minutes = Math.max(1, Math.ceil(charCount / 400))
  return `约 ${minutes} 分钟`
})

function injectCopyButtons() {
  const blocks = document.querySelectorAll('.article-content pre')
  blocks.forEach(pre => {
    if (pre.querySelector('.code-copy-btn')) return
    pre.style.position = 'relative'
    const btn = document.createElement('button')
    btn.className = 'code-copy-btn'
    btn.innerHTML = '<i class="bi bi-clipboard"></i>'
    btn.title = '复制代码'
    btn.onclick = async () => {
      const code = pre.querySelector('code')?.textContent || pre.textContent
      try {
        await navigator.clipboard.writeText(code)
        btn.innerHTML = '<i class="bi bi-check-lg"></i>'
        btn.classList.add('copied')
        setTimeout(() => { btn.innerHTML = '<i class="bi bi-clipboard"></i>'; btn.classList.remove('copied') }, 2000)
      } catch {
        btn.innerHTML = '<i class="bi bi-x-lg"></i>'
        setTimeout(() => { btn.innerHTML = '<i class="bi bi-clipboard"></i>' }, 1500)
      }
    }
    pre.appendChild(btn)
  })
}

function detectHeadings() {
  const container = document.querySelector('.article-content')
  if (container) {
    hasHeadings.value = container.querySelectorAll('h2, h3').length > 0
  }
}

function setupLightbox() {
  const imgs = document.querySelectorAll('.article-content img')
  lightboxImages.value = Array.from(imgs).map(img => img.src)
  imgs.forEach((img, i) => {
    img.style.cursor = 'zoom-in'
    img.addEventListener('click', () => {
      lightboxOpen.value = true
      lightboxImages.value = Array.from(document.querySelectorAll('.article-content img')).map(img => img.src)
    })
  })
}

function highlightSearch() {
  const q = new URLSearchParams(location.search).get('q') || new URLSearchParams(location.search).get('search')
  if (!q) return
  const container = document.querySelector('.article-content')
  if (!container) return
  const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  function walk(node) {
    if (node.nodeType === 3 && node.textContent.match(regex)) {
      const span = document.createElement('span')
      span.innerHTML = node.textContent.replace(regex, '<mark style="background:#fef08a;color:#1c1917;padding:1px 3px;border-radius:3px">$1</mark>')
      node.parentNode.replaceChild(span, node)
    } else if (node.nodeType === 1 && node.childNodes && !['SCRIPT','STYLE','PRE','CODE','MARK'].includes(node.tagName)) {
      Array.from(node.childNodes).forEach(walk)
    }
  }
  walk(container)
}

async function fetchPost() {
  loading.value = true
  try {
    const res = await postAPI.getPost(route.params.slug)
    post.value = res.data.post
    comments.value = res.data.comments.comments || (Array.isArray(res.data.comments) ? res.data.comments : [])
    commentsTotal.value = res.data.comments.total || 0
    prevPost.value = res.data.prevPost
    nextPost.value = res.data.nextPost
    liked.value = res.data.userLiked
    await nextTick()
    injectCopyButtons()
    detectHeadings()
    setupLightbox()
    highlightSearch()
  } catch (e) {
    post.value = null
  } finally {
    loading.value = false
  }
}

async function toggleLike() {
  if (!authStore.isLoggedIn) return $toast.warning('请先登录')
  try {
    const res = await postAPI.likePost(post.value.id)
    liked.value = res.data.liked
    if (post.value) post.value.like_count = res.data.likeCount
  } catch (e) {
    $toast.error(e.response?.data?.error || '操作失败')
  }
}

async function sharePost() {
  try {
    await navigator.clipboard.writeText(location.href)
    shareDone.value = true
    setTimeout(() => { shareDone.value = false }, 2000)
  } catch (_) {}
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('zh-CN') : ''
}

watch(() => route.params.slug, fetchPost, { immediate: true })

onMounted(() => {
  if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>
