<template>
  <div class="post-page">
    <ProgressBar v-if="post" />

    <!-- 浮动返回按钮 -->
    <a v-if="post" class="floating-back" @click="goBack" title="返回">
      <i class="bi bi-arrow-left"></i>
    </a>

    <div v-if="loading" class="loading-spinner">
      <div class="spinner-ring"></div>
    </div>

    <div v-else-if="post" class="post-layout" :class="{ 'has-toc': hasHeadings }">
      <TocNav v-if="hasHeadings" />

      <article class="article-container">
        <!-- 封面图 -->
        <img
          v-if="post.cover_image"
          :src="post.cover_image"
          class="article-cover"
          alt=""
        />

        <!-- 标题区 -->
        <header class="article-header">
          <router-link
            v-if="post.category_name"
            :to="{ path: '/', query: { category: post.category_slug || post.category_name } }"
            class="article-category-badge"
          >
            {{ post.category_name }}
          </router-link>
          <h1 class="article-title">{{ post.title }}</h1>
          <div class="article-meta">
            <img
              :src="post.author_avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${post.author_name || 'user'}`"
              class="article-meta-avatar"
              alt=""
            />
            <span class="article-meta-item">{{ post.author_name }}</span>
            <span class="article-meta-divider"></span>
            <span class="article-meta-item">{{ formatDate(post.created_at) }}</span>
            <span class="article-meta-divider"></span>
            <span class="article-meta-item">
              <i class="bi bi-clock"></i> {{ readingTime }}
            </span>
            <span class="article-meta-divider"></span>
            <span class="article-meta-item">
              <i class="bi bi-eye"></i> {{ post.view_count }} 阅读
            </span>
          </div>
        </header>

        <!-- 正文 -->
        <div class="article-content" ref="contentRef" v-html="renderedContent"></div>

        <!-- 标签 -->
        <div v-if="post.tags?.length" class="article-tags">
          <span class="article-tags-label"><i class="bi bi-tags"></i></span>
          <router-link
            v-for="tag in post.tags"
            :key="tag.id"
            :to="{ path: '/', query: { tag: tag.slug } }"
            class="tag-pill"
          >
            {{ tag.name }}
          </router-link>
        </div>

        <!-- 底部操作栏 -->
        <div class="article-actions">
          <button class="action-btn" :class="{ active: liked }" @click="toggleLike">
            <i class="bi" :class="liked ? 'bi-heart-fill' : 'bi-heart'"></i>
            <span>{{ post.like_count }} 赞</span>
          </button>
          <button class="action-btn" @click="sharePost">
            <i class="bi" :class="shareDone ? 'bi-check-lg' : 'bi-share'"></i>
            <span>{{ shareDone ? '已复制' : '分享' }}</span>
          </button>
        </div>

        <!-- 上一篇 / 下一篇 -->
        <nav class="post-pagination">
          <router-link
            v-if="prevPost"
            :to="'/post/' + prevPost.slug"
            class="post-pagination-link prev"
          >
            <span class="post-pagination-label"><i class="bi bi-arrow-left"></i> 上一篇</span>
            <span class="post-pagination-title">{{ prevPost.title }}</span>
          </router-link>
          <span v-else class="post-pagination-link prev disabled">
            <span class="post-pagination-label"><i class="bi bi-arrow-left"></i> 上一篇</span>
            <span class="post-pagination-title">没有了</span>
          </span>
          <router-link
            v-if="nextPost"
            :to="'/post/' + nextPost.slug"
            class="post-pagination-link next"
          >
            <span class="post-pagination-label">下一篇 <i class="bi bi-arrow-right"></i></span>
            <span class="post-pagination-title">{{ nextPost.title }}</span>
          </router-link>
          <span v-else class="post-pagination-link next disabled">
            <span class="post-pagination-label">下一篇 <i class="bi bi-arrow-right"></i></span>
            <span class="post-pagination-title">没有了</span>
          </span>
        </nav>

        <!-- 评论 -->
        <section class="article-comments">
          <h2 class="section-title">评论 ({{ commentsTotal }})</h2>
          <CommentBox
            :post-id="post.id"
            :comments="comments"
            :total="commentsTotal"
            @refresh="fetchPost(true)"
          />
        </section>

        <!-- 相关推荐 -->
        <RelatedPosts
          v-if="post.tags?.length || post.category_id"
          :tags="post.tags"
          :category-id="post.category_id"
          :exclude-id="post.id"
        />
      </article>

      <ImageLightbox :images="lightboxImages" v-model="lightboxOpen" />
    </div>

    <div v-else class="empty-state">
      <div class="empty-state-icon"><i class="bi bi-file-earmark-x"></i></div>
      <p>文章不存在</p>
      <router-link to="/" class="btn-ghost">返回首页</router-link>
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
const hasHeadings = computed(() => {
  if (!post.value?.content) return false
  return /^#{2,3}\s/m.test(post.value.content)
})
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

    const code = pre.querySelector('code')
    let lang = ''
    if (code) {
      const cls = code.className || ''
      const m = cls.match(/language-(\w+)/)
      if (m) lang = m[1]
    }
    if (lang) {
      const label = document.createElement('div')
      label.className = 'code-lang-label'
      label.textContent = lang
      pre.appendChild(label)
    }

    const text = code?.textContent || pre.textContent || ''
    const lines = text.split('\n')
    if (lines.length > 3) {
      const nums = document.createElement('div')
      nums.className = 'code-line-nums'
      nums.innerHTML = lines.map((_, i) => `<span>${i + 1}</span>`).join('\n')
      pre.insertBefore(nums, pre.firstChild)
      pre.style.paddingLeft = '48px'
    }

    const btn = document.createElement('button')
    btn.className = 'code-copy-btn'
    btn.innerHTML = '<i class="bi bi-clipboard"></i>'
    btn.title = '复制代码'
    btn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(text)
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

function setupLightbox() {
  const imgs = document.querySelectorAll('.article-content img')
  lightboxImages.value = Array.from(imgs).map(img => img.src)
  imgs.forEach(img => {
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

async function fetchPost(silent = false) {
  if (!silent) loading.value = true
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
    setupLightbox()
    highlightSearch()
  } catch (e) {
    console.error('Post fetchPost error:', e)
    post.value = null
  } finally {
    loading.value = false
  }
}

async function toggleLike() {
  if (!authStore.isLoggedIn) return window.$toast.warning('请先登录')
  try {
    const res = await postAPI.likePost(post.value.id)
    liked.value = res.data.liked
    if (post.value) post.value.like_count = res.data.likeCount
  } catch (e) {
    window.$toast.error(e.response?.data?.error || '操作失败')
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

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

watch(() => route.params.slug, fetchPost, { immediate: true })

onMounted(() => {
  if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>
