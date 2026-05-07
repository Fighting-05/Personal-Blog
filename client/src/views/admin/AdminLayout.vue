<template>
  <div class="admin-layout">
    <aside class="admin-sidebar-new">
      <div class="admin-sidebar-brand">
        <div class="brand-icon"><i class="bi bi-speedometer2"></i></div>
        管理后台
      </div>

      <div class="admin-nav-section">主菜单</div>
      <router-link to="/admin" class="admin-nav-item"><i class="bi bi-grid-1x2"></i> 仪表盘</router-link>
      <router-link to="/admin/posts" class="admin-nav-item"><i class="bi bi-file-text"></i> 文章管理</router-link>
      <router-link to="/admin/posts/new" class="admin-nav-item"><i class="bi bi-plus-circle"></i> 新建文章</router-link>

      <div class="admin-nav-section">管理</div>
      <router-link to="/admin/comments" class="admin-nav-item"><i class="bi bi-chat-dots"></i> 评论管理</router-link>
      <router-link to="/admin/categories" class="admin-nav-item"><i class="bi bi-folder"></i> 分类管理</router-link>
      <router-link to="/admin/users" class="admin-nav-item"><i class="bi bi-people"></i> 用户管理</router-link>

      <div style="margin-top:auto">
        <router-link to="/" class="admin-nav-item" style="margin-bottom:8px">
          <i class="bi bi-eye"></i> 查看博客
        </router-link>
        <a href="#" @click.prevent="logout" class="admin-nav-item" style="color:#dc6b6b">
          <i class="bi bi-box-arrow-right"></i> 退出登录
        </a>
      </div>
    </aside>
    <div class="admin-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

async function logout() {
  await authStore.logout()
  router.push('/')
}
</script>
