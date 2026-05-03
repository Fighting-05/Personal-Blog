<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
      <h2 style="font-size:1.5rem;font-weight:700;margin:0;letter-spacing:-0.02em">文章管理</h2>
      <div style="display:flex;gap:8px">
        <button class="btn-ghost" style="padding:8px 14px;font-size:0.8rem" @click="exportPosts('json')"><i class="bi bi-download"></i> JSON</button>
        <button class="btn-ghost" style="padding:8px 14px;font-size:0.8rem" @click="exportPosts('markdown')"><i class="bi bi-markdown"></i> MD</button>
        <router-link to="/admin/posts/new" class="btn-prime" style="padding:8px 18px;font-size:0.84rem">
          <i class="bi bi-plus-lg"></i> 写文章
        </router-link>
      </div>
    </div>

    <div style="display:flex;gap:12px;margin-bottom:16px;align-items:center">
      <select v-model="filter" @change="fetchPosts" style="padding:8px 16px;border:1.5px solid var(--color-border);border-radius:var(--radius-sm);font-family:var(--font-sans);font-size:0.84rem;outline:none;background:var(--color-surface);color:var(--color-text)">
        <option value="">全部状态</option>
        <option value="published">已发布</option>
        <option value="draft">草稿</option>
      </select>
      <button v-if="selectedIds.length > 0" class="btn-ghost" style="padding:6px 14px;font-size:0.8rem;color:var(--color-danger);border-color:#f0dada" @click="batchDelete">删除选中 ({{ selectedIds.length }})</button>
      <button v-if="selectedIds.length > 0" class="btn-ghost" style="padding:6px 14px;font-size:0.8rem" @click="batchPublish">发布选中</button>
      <button v-if="selectedIds.length > 0" class="btn-ghost" style="padding:6px 14px;font-size:0.8rem" @click="batchDraft">改为草稿</button>
    </div>

    <div style="background:var(--color-surface);border-radius:var(--radius-lg);border:1px solid var(--color-border-light);overflow:hidden">
      <table style="width:100%;border-collapse:collapse;font-size:0.84rem">
        <thead>
          <tr style="background:#faf8f5;border-bottom:1px solid var(--color-border)">
            <th style="padding:12px 12px;width:36px"><input type="checkbox" @change="toggleAll($event)" :checked="allSelected" style="cursor:pointer"></th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--color-text-muted);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em">ID</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--color-text-muted);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em">标题</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--color-text-muted);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em">作者</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--color-text-muted);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em">状态</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--color-text-muted);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em">阅读</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--color-text-muted);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in posts" :key="p.id" style="border-bottom:1px solid var(--color-border-light);transition:background 0.15s" @mouseenter="$event.target.style.background='#faf8f5'" @mouseleave="$event.target.style.background=''">
            <td style="padding:12px 12px"><input type="checkbox" :value="p.id" v-model="selectedIds" style="cursor:pointer"></td>
            <td style="padding:12px 16px;color:var(--color-text-muted)">{{ p.id }}</td>
            <td style="padding:12px 16px;font-weight:500;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ p.title }}</td>
            <td style="padding:12px 16px;color:var(--color-text-secondary)">{{ p.author_name }}</td>
            <td style="padding:12px 16px">
              <span :style="p.status === 'published' ? 'background:#e8f0e4;color:var(--color-success)' : 'background:#f0ece6;color:var(--color-text-muted)'" style="padding:3px 10px;border-radius:12px;font-size:0.75rem;font-weight:600">
                {{ p.status === 'published' ? '已发布' : '草稿' }}
              </span>
            </td>
            <td style="padding:12px 16px;color:var(--color-text-muted)">{{ p.view_count }}</td>
            <td style="padding:12px 16px">
              <div style="display:flex;gap:6px">
                <router-link :to="'/admin/posts/edit/' + p.id" style="padding:4px 10px;border:1.5px solid var(--color-border);border-radius:6px;font-size:0.78rem;color:var(--color-text-secondary);transition:all 0.2s" @mouseenter="$event.target.style.borderColor='var(--color-accent)';$event.target.style.color='var(--color-primary)'" @mouseleave="$event.target.style.borderColor='var(--color-border)';$event.target.style.color='var(--color-text-secondary)'"><i class="bi bi-pencil"></i></router-link>
                <button @click="togglePin(p.id)" style="padding:4px 10px;border:1.5px solid var(--color-border);border-radius:6px;font-size:0.78rem;background:transparent;color:var(--color-text-secondary);cursor:pointer;transition:all 0.2s;font-family:var(--font-sans)" @mouseenter="$event.target.style.borderColor='var(--color-accent)'" @mouseleave="$event.target.style.borderColor='var(--color-border)'"><i class="bi bi-pin"></i></button>
                <button @click="delPost(p.id)" style="padding:4px 10px;border:1.5px solid #f0dada;border-radius:6px;font-size:0.78rem;background:transparent;color:#d4a0a0;cursor:pointer;transition:all 0.2s;font-family:var(--font-sans)" @mouseenter="$event.target.style.borderColor='var(--color-danger)';$event.target.style.color='var(--color-danger)'" @mouseleave="$event.target.style.borderColor='#f0dada';$event.target.style.color='#d4a0a0'"><i class="bi bi-trash"></i></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination :page="page" :total-pages="totalPages" @change="goPage" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminAPI, postAPI } from '@/api'
import Pagination from '@/components/Pagination.vue'

const posts = ref([])
const page = ref(1)
const totalPages = ref(0)
const filter = ref('')
const selectedIds = ref([])

const allSelected = computed(() => posts.value.length > 0 && selectedIds.value.length === posts.value.length)

async function fetchPosts(p = 1) {
  try {
    const params = { page: p }
    if (filter.value) params.status = filter.value
    const res = await adminAPI.getPosts(params)
    posts.value = res.data.posts
    page.value = res.data.page
    totalPages.value = res.data.totalPages
    selectedIds.value = []
  } catch (e) { console.error(e) }
}

function goPage(p) { fetchPosts(p) }

async function delPost(id) {
  if (!confirm('确认删除?')) return
  await postAPI.deletePost(id)
  fetchPosts(page.value)
}

async function togglePin(id) {
  await postAPI.togglePin(id)
  fetchPosts(page.value)
}

onMounted(() => fetchPosts())

function toggleAll(e) {
  selectedIds.value = e.target.checked ? posts.value.map(p => p.id) : []
}

async function batchDelete() {
  if (!confirm(`确认删除 ${selectedIds.value.length} 篇文章?`)) return
  await adminAPI.batchPosts({ ids: selectedIds.value, action: 'delete' })
  fetchPosts(page.value)
}
async function batchPublish() {
  await adminAPI.batchPosts({ ids: selectedIds.value, action: 'status', status: 'published' })
  fetchPosts(page.value)
}
async function batchDraft() {
  await adminAPI.batchPosts({ ids: selectedIds.value, action: 'status', status: 'draft' })
  fetchPosts(page.value)
}

async function exportPosts(format) {
  try {
    const res = await adminAPI.exportPosts(format)
    if (format === 'markdown') {
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url; a.download = 'blog-posts.md'; a.click()
      URL.revokeObjectURL(url)
    } else {
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'blog-posts.json'; a.click()
      URL.revokeObjectURL(url)
    }
  } catch (e) { $toast.error('导出失败') }
}
</script>
