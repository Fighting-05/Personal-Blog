<template>
  <div>
    <h2 style="font-size:1.5rem;font-weight:700;margin:0 0 24px;letter-spacing:-0.02em">分类管理</h2>

    <div style="background:var(--color-surface);border-radius:var(--radius-lg);padding:20px;border:1px solid var(--color-border-light);margin-bottom:24px">
      <form @submit.prevent="createCat" style="display:flex;gap:12px;align-items:flex-end">
        <div style="flex:1">
          <label style="display:block;font-size:0.78rem;font-weight:600;color:var(--color-text-muted);margin-bottom:4px">分类名称</label>
          <input v-model="newCat.name" class="input-elegant" placeholder="输入分类名称" required>
        </div>
        <div style="flex:2">
          <label style="display:block;font-size:0.78rem;font-weight:600;color:var(--color-text-muted);margin-bottom:4px">描述</label>
          <input v-model="newCat.description" class="input-elegant" placeholder="可选描述">
        </div>
        <button type="submit" class="btn-prime" style="padding:10px 24px;font-size:0.84rem;white-space:nowrap">
          <i class="bi bi-plus-lg"></i> 添加
        </button>
      </form>
    </div>

    <div style="background:var(--color-surface);border-radius:var(--radius-lg);border:1px solid var(--color-border-light);overflow:hidden">
      <table style="width:100%;border-collapse:collapse;font-size:0.84rem">
        <thead>
          <tr style="background:#faf8f5;border-bottom:1px solid var(--color-border)">
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--color-text-muted);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em">ID</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--color-text-muted);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em">名称</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--color-text-muted);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em">别名</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--color-text-muted);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em">文章数</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--color-text-muted);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in categories" :key="c.id" style="border-bottom:1px solid var(--color-border-light);transition:background 0.15s" @mouseenter="$event.target.style.background='#faf8f5'" @mouseleave="$event.target.style.background=''">
            <td style="padding:12px 16px;color:var(--color-text-muted)">{{ c.id }}</td>
            <td style="padding:12px 16px;font-weight:500">
              <span v-if="editingId !== c.id">{{ c.name }}</span>
              <input v-else v-model="editForm.name" class="input-elegant" style="padding:6px 10px;font-size:0.82rem;width:140px">
            </td>
            <td style="padding:12px 16px;color:var(--color-text-muted)">{{ c.slug }}</td>
            <td style="padding:12px 16px">
              <span style="padding:3px 10px;border-radius:12px;background:#f5f0e8;color:var(--color-primary);font-size:0.75rem;font-weight:600">{{ c.post_count }}</span>
            </td>
            <td style="padding:12px 16px">
              <template v-if="editingId !== c.id">
                <button @click="startEdit(c)" style="padding:4px 10px;border:1.5px solid var(--color-border);border-radius:6px;font-size:0.78rem;background:transparent;color:var(--color-text-secondary);cursor:pointer;transition:all 0.2s;font-family:var(--font-sans);margin-right:6px" @mouseenter="$event.target.style.borderColor='var(--color-accent)';$event.target.style.color='var(--color-primary)'" @mouseleave="$event.target.style.borderColor='var(--color-border)';$event.target.style.color='var(--color-text-secondary)'"><i class="bi bi-pencil"></i></button>
                <button @click="delCat(c.id)" style="padding:4px 10px;border:1.5px solid #f0dada;border-radius:6px;font-size:0.78rem;background:transparent;color:#d4a0a0;cursor:pointer;transition:all 0.2s;font-family:var(--font-sans)" @mouseenter="$event.target.style.borderColor='var(--color-danger)';$event.target.style.color='var(--color-danger)'" @mouseleave="$event.target.style.borderColor='#f0dada';$event.target.style.color='#d4a0a0'"><i class="bi bi-trash"></i></button>
              </template>
              <template v-else>
                <button @click="saveEdit" style="padding:4px 10px;border:1.5px solid var(--color-success);border-radius:6px;font-size:0.78rem;background:rgba(107,155,122,0.1);color:var(--color-success);cursor:pointer;font-family:var(--font-sans);margin-right:6px"><i class="bi bi-check"></i></button>
                <button @click="editingId = null" style="padding:4px 10px;border:1.5px solid var(--color-border);border-radius:6px;font-size:0.78rem;background:transparent;color:var(--color-text-muted);cursor:pointer;font-family:var(--font-sans)"><i class="bi bi-x"></i></button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { adminAPI } from '@/api'

const categories = ref([])
const editingId = ref(null)
const editForm = reactive({ name: '', description: '' })
const newCat = reactive({ name: '', description: '' })

async function fetch() {
  try {
    const res = await adminAPI.getCategories()
    categories.value = res.data
  } catch (e) { console.error(e) }
}

async function createCat() {
  await adminAPI.createCategory({ name: newCat.name, description: newCat.description })
  newCat.name = ''
  newCat.description = ''
  fetch()
}

function startEdit(cat) {
  editingId.value = cat.id
  editForm.name = cat.name
  editForm.description = cat.description || ''
}

async function saveEdit() {
  await adminAPI.updateCategory(editingId.value, { name: editForm.name, description: editForm.description })
  editingId.value = null
  fetch()
}

async function delCat(id) {
  if (!confirm('确认删除?')) return
  await adminAPI.deleteCategory(id)
  fetch()
}

onMounted(fetch)
</script>
