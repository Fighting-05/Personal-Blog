<template>
  <div>
    <h2 style="font-size:1.5rem;font-weight:700;margin:0 0 24px;letter-spacing:-0.02em">用户管理</h2>

    <div style="background:var(--color-surface);border-radius:var(--radius-lg);border:1px solid var(--color-border-light);overflow:hidden">
      <table style="width:100%;border-collapse:collapse;font-size:0.84rem">
        <thead>
          <tr style="background:#faf8f5;border-bottom:1px solid var(--color-border)">
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--color-text-muted);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em">ID</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--color-text-muted);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em">头像</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--color-text-muted);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em">用户名</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--color-text-muted);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em">邮箱</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--color-text-muted);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em">角色</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--color-text-muted);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id" style="border-bottom:1px solid var(--color-border-light);transition:background 0.15s" @mouseenter="$event.target.style.background='#faf8f5'" @mouseleave="$event.target.style.background=''">
            <td style="padding:12px 16px;color:var(--color-text-muted)">{{ u.id }}</td>
            <td style="padding:12px 16px"><img :src="u.avatar || '/images/default-avatar.png'" style="width:32px;height:32px;border-radius:50%;object-fit:cover" alt=""></td>
            <td style="padding:12px 16px;font-weight:500">{{ u.username }}</td>
            <td style="padding:12px 16px;color:var(--color-text-secondary)">{{ u.email }}</td>
            <td style="padding:12px 16px">
              <span :style="u.role === 'admin' ? 'background:#f0e0e0;color:var(--color-danger)' : 'background:#f0ece6;color:var(--color-text-muted)'" style="padding:3px 10px;border-radius:12px;font-size:0.75rem;font-weight:600">
                {{ u.role === 'admin' ? '管理员' : '用户' }}
              </span>
            </td>
            <td style="padding:12px 16px">
              <button v-if="u.role !== 'admin'" @click="delUser(u.id)" style="padding:4px 10px;border:1.5px solid #f0dada;border-radius:6px;font-size:0.78rem;background:transparent;color:#d4a0a0;cursor:pointer;transition:all 0.2s;font-family:var(--font-sans)" @mouseenter="$event.target.style.borderColor='var(--color-danger)';$event.target.style.color='var(--color-danger)'" @mouseleave="$event.target.style.borderColor='#f0dada';$event.target.style.color='#d4a0a0'"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination :page="page" :total-pages="totalPages" @change="goPage" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminAPI } from '@/api'
import Pagination from '@/components/Pagination.vue'

const users = ref([])
const page = ref(1)
const totalPages = ref(0)

async function fetchUsers(p = 1) {
  try {
    const res = await adminAPI.getUsers({ page: p })
    users.value = res.data.users
    page.value = res.data.page
    totalPages.value = res.data.totalPages
  } catch (e) { console.error(e) }
}

function goPage(p) { fetchUsers(p) }

async function delUser(id) {
  if (!confirm('确认删除该用户?')) return
  try {
    await adminAPI.deleteUser(id)
    fetchUsers(page.value)
  } catch (e) { $toast.error(e.response?.data?.error || '删除失败') }
}

onMounted(() => fetchUsers())
</script>
