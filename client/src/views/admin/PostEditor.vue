<template>
  <div>
    <h2 style="font-size:1.5rem;font-weight:700;margin:0 0 24px;letter-spacing:-0.02em">{{ isEdit ? '编辑文章' : '写文章' }}</h2>

    <div v-if="msg" :style="msgType === 'success' ? 'padding:12px 18px;background:#e8f0e4;color:var(--color-success);border-radius:var(--radius-sm);margin-bottom:20px;font-size:0.84rem' : 'padding:12px 18px;background:#fce8e8;color:var(--color-danger);border-radius:var(--radius-sm);margin-bottom:20px;font-size:0.84rem'">
      {{ msg }}
    </div>

    <form @submit.prevent="submitPost()" style="background:var(--color-surface);border-radius:var(--radius-lg);padding:28px;border:1px solid var(--color-border-light)">
      <div style="margin-bottom:20px">
        <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--color-text-muted);margin-bottom:6px">标题 *</label>
        <input v-model="form.title" class="input-elegant" placeholder="文章标题" required>
      </div>

      <div style="margin-bottom:20px">
        <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--color-text-muted);margin-bottom:6px">摘要</label>
        <input v-model="form.summary" class="input-elegant" placeholder="简短描述这篇文章...">
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:20px">
        <div>
          <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--color-text-muted);margin-bottom:6px">分类</label>
          <select v-model="form.categoryId" style="width:100%;padding:10px 14px;border:1.5px solid var(--color-border);border-radius:var(--radius-sm);font-family:var(--font-sans);font-size:0.88rem;background:var(--color-surface);color:var(--color-text);outline:none">
            <option :value="null">无分类</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div>
          <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--color-text-muted);margin-bottom:6px">状态</label>
          <select v-model="form.status" style="width:100%;padding:10px 14px;border:1.5px solid var(--color-border);border-radius:var(--radius-sm);font-family:var(--font-sans);font-size:0.88rem;background:var(--color-surface);color:var(--color-text);outline:none">
            <option value="published">发布</option>
            <option value="draft">草稿</option>
          </select>
        </div>
        <div>
          <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--color-text-muted);margin-bottom:6px">标签 (逗号分隔)</label>
          <input v-model="form.tags" class="input-elegant" :placeholder="availableTags.join(', ')">
        </div>
      </div>

      <div style="margin-bottom:20px">
        <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--color-text-muted);margin-bottom:6px">封面图片</label>
        <input type="file" @change="onCoverChange" accept="image/*" style="font-family:var(--font-sans);font-size:0.84rem">
        <img v-if="form.coverImage" :src="form.coverImage" style="display:block;max-width:200px;margin-top:10px;border-radius:var(--radius-sm)" alt="">
      </div>

      <div style="margin-bottom:20px">
        <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--color-text-muted);margin-bottom:6px">
          内容 (Markdown) *
          <button type="button" class="btn-ghost" style="padding:2px 10px;font-size:0.72rem;margin-left:8px" @click="previewMode = !previewMode">
            <i class="bi" :class="previewMode ? 'bi-pencil' : 'bi-eye'"></i> {{ previewMode ? '编辑' : '预览' }}
          </button>
        </label>
        <div :style="previewMode ? {} : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }">
          <textarea
            v-model="form.content" ref="editorRef"
            class="textarea-elegant"
            rows="18"
            placeholder="支持 Markdown 语法... 支持拖拽/粘贴图片"
            required
            @paste="onPaste"
            @drop.prevent="onDrop"
            @dragover.prevent
            style="font-family:var(--font-mono);font-size:0.88rem;line-height:1.7"
          ></textarea>
          <div v-if="!previewMode" class="editor-preview" v-html="previewHtml"></div>
          <div v-if="previewMode" class="editor-preview editor-preview-full" v-html="previewHtml"></div>
        </div>
      </div>

      <div style="display:flex;gap:10px">
        <button type="button" class="btn-ghost" :disabled="loading" @click="submitPost('draft')">
          <span v-if="loading && form.status === 'draft'" class="spinner-ring" style="width:16px;height:16px;border-width:2px"></span>
          <i class="bi bi-journal-bookmark"></i> 保存草稿
        </button>
        <button type="submit" class="btn-prime" :disabled="loading" style="flex:0 0 auto">
          <span v-if="loading && form.status !== 'draft'" class="spinner-ring" style="width:16px;height:16px;border-width:2px"></span>
          {{ isEdit ? '更新文章' : '发布文章' }}
        </button>
        <router-link to="/admin/posts" class="btn-ghost">取消</router-link>
        <span v-if="autoSaveTime" style="font-size:0.72rem;color:var(--color-text-muted);align-self:center;margin-left:auto">
          <i class="bi bi-check2"></i> 已自动保存 {{ autoSaveTime }}
        </span>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { postAPI } from '@/api'
import { marked } from 'marked'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const msg = ref('')
const msgType = ref('success')
const coverFile = ref(null)
const categories = ref([])
const availableTags = ref([])
const autoSaveTime = ref('')
const editorRef = ref(null)
const previewMode = ref(false)
let autoSaveTimer = null
const AUTO_SAVE_KEY = 'blog_draft_autosave'

const form = reactive({
  title: '', content: '', summary: '', categoryId: null, status: 'published', tags: '', coverImage: ''
})

const previewHtml = computed(() => {
  if (!form.content) return '<p style="color:var(--color-text-muted);font-size:0.84rem">预览将显示在这里...</p>'
  return marked.parse(form.content)
})

function saveToLocal() {
  if (form.title || form.content) {
    localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify({
      title: form.title, content: form.content, summary: form.summary,
      categoryId: form.categoryId, status: form.status, tags: form.tags,
      timestamp: Date.now()
    }))
  }
}

function loadFromLocal() {
  if (isEdit.value) return
  const saved = localStorage.getItem(AUTO_SAVE_KEY)
  if (!saved) return
  try {
    const data = JSON.parse(saved)
    if (Date.now() - data.timestamp > 7 * 24 * 3600 * 1000) {
      localStorage.removeItem(AUTO_SAVE_KEY)
      return
    }
    if (data.title) form.title = data.title
    if (data.content) form.content = data.content
    if (data.summary) form.summary = data.summary
    if (data.categoryId) form.categoryId = data.categoryId
    if (data.status) form.status = data.status
    if (data.tags) form.tags = data.tags
    msg.value = '已恢复上次未保存的内容'
    msgType.value = 'success'
  } catch (_) {}
}

function clearLocal() {
  localStorage.removeItem(AUTO_SAVE_KEY)
  autoSaveTime.value = ''
}

function startAutoSave() {
  stopAutoSave()
  autoSaveTimer = setInterval(() => {
    saveToLocal()
    autoSaveTime.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }, 30000)
}

function stopAutoSave() {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
    autoSaveTimer = null
  }
}

onMounted(async () => {
  loadFromLocal()
  startAutoSave()

  try {
    const [catRes, tagRes] = await Promise.all([postAPI.getCategories(), postAPI.getTags()])
    categories.value = catRes.data
    availableTags.value = tagRes.data.map(t => t.name)
  } catch (e) { console.error(e) }

  if (isEdit.value) {
    const res = await postAPI.getPosts({ status: '' })
    const post = res.data.posts.find(p => p.id == route.params.id)
    if (post) {
      const detail = await postAPI.getPost(post.slug)
      form.title = detail.data.post.title
      form.content = detail.data.post.content
      form.summary = detail.data.post.summary || ''
      form.categoryId = detail.data.post.category_id
      form.status = detail.data.post.status
      form.coverImage = detail.data.post.cover_image || ''
      form.tags = detail.data.post.tags?.map(t => t.name).join(', ') || ''
    }
  }
})

onUnmounted(() => stopAutoSave())

function onCoverChange(e) { coverFile.value = e.target.files[0] }

async function uploadAndInsert(file) {
  const fd = new FormData()
  fd.append('image', file)
  try {
    const res = await postAPI.uploadImage(fd)
    const url = res.data.url
    const textarea = editorRef.value
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const mdImg = `\n![image](${url})\n`
      form.content = form.content.slice(0, start) + mdImg + form.content.slice(end)
      setTimeout(() => { textarea.selectionStart = textarea.selectionEnd = start + mdImg.length }, 0)
    }
  } catch (e) {
    msg.value = '图片上传失败'
    msgType.value = 'error'
  }
}

function onPaste(e) {
  const items = e.clipboardData?.items
  if (!items) return
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault()
      uploadAndInsert(item.getAsFile())
      return
    }
  }
}

function onDrop(e) {
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    uploadAndInsert(file)
  }
}

async function submitPost(overrideStatus) {
  msg.value = ''
  loading.value = true
  if (overrideStatus) form.status = overrideStatus
  try {
    const fd = new FormData()
    fd.append('title', form.title)
    fd.append('content', form.content)
    fd.append('summary', form.summary)
    fd.append('categoryId', form.categoryId || '')
    fd.append('status', form.status)
    fd.append('tags', form.tags)
    fd.append('coverImage', form.coverImage)
    if (coverFile.value) fd.append('coverImage', coverFile.value)

    if (isEdit.value) {
      await postAPI.updatePost(route.params.id, fd)
    } else {
      await postAPI.createPost(fd)
    }
    clearLocal()
    const label = overrideStatus === 'draft' ? '草稿已保存' : (isEdit.value ? '更新成功' : '发布成功')
    msg.value = label
    msgType.value = 'success'
    if (form.status === 'published') {
      setTimeout(() => router.push('/admin/posts'), 1000)
    }
  } catch (e) {
    msg.value = e.response?.data?.error || '操作失败'
    msgType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>
