<template>
  <div>
    <h2 style="font-size:1.5rem;font-weight:700;margin:0 0 24px;letter-spacing:-0.02em">评论管理</h2>

    <div style="background:var(--color-surface);border-radius:var(--radius-lg);border:1px solid var(--color-border-light);overflow:hidden">
      <table style="width:100%;border-collapse:collapse;font-size:0.84rem">
        <thead>
          <tr style="background:#faf8f5;border-bottom:1px solid var(--color-border)">
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--color-text-muted);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em">ID</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--color-text-muted);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em">内容</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--color-text-muted);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em">用户</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--color-text-muted);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em">文章</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--color-text-muted);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in comments" :key="c.id" style="border-bottom:1px solid var(--color-border-light);transition:background 0.15s" @mouseenter="$event.target.style.background='#faf8f5'" @mouseleave="$event.target.style.background=''">
            <td style="padding:12px 16px;color:var(--color-text-muted)">{{ c.id }}</td>
            <td style="padding:12px 16px;max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ c.content }}</td>
            <td style="padding:12px 16px;color:var(--color-text-secondary)">{{ c.username }}</td>
            <td style="padding:12px 16px;color:var(--color-text-muted)">{{ c.post_title?.substring(0, 15) }}</td>
            <td style="padding:12px 16px">
              <button @click="askDelete(c.id)" style="padding:4px 10px;border:1.5px solid #f0dada;border-radius:6px;font-size:0.78rem;background:transparent;color:#d4a0a0;cursor:pointer;transition:all 0.2s;font-family:var(--font-sans)" @mouseenter="$event.target.style.borderColor='var(--color-danger)';$event.target.style.color='var(--color-danger)'" @mouseleave="$event.target.style.borderColor='#f0dada';$event.target.style.color='#d4a0a0'"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ConfirmModal ref="cmRef" />
    <Pagination :page="page" :total-pages="totalPages" @change="goPage" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminAPI } from '@/api'
import Pagination from '@/components/Pagination.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

const comments = ref([])
const page = ref(1)
const totalPages = ref(0)
const delTarget = ref(null)
const cmRef = ref(null)

async function fetchComments(p = 1) {
  try {
    const res = await adminAPI.getComments({ page: p })
    comments.value = res.data.comments
    page.value = res.data.page
    totalPages.value = res.data.totalPages
  } catch (e) { console.error(e) }
}

function goPage(p) { fetchComments(p) }
function askDelete(id) { delTarget.value = id; cmRef.value.show({ title: '确认删除', message: '删除后无法恢复，确定要删除这条评论吗？' }).then(ok => { if (ok && delTarget.value) del(); else delTarget.value = null }) }

async function del() {
  if (!delTarget.value) return
  await adminAPI.deleteComment(delTarget.value)
  delTarget.value = null
  fetchComments(page.value)
}

onMounted(() => fetchComments())
</script>

