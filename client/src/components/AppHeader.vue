<template>
  <nav class="glass-nav" ref="navbarRef">
    <div class="nav-container">
      <router-link to="/" class="nav-brand">
        <span class="brand-dot"></span>
        个人博客
      </router-link>

      <ul class="nav-links">
        <li><router-link to="/" :class="{ active: $route.path === '/' }">首页</router-link></li>
        <li><router-link to="/archive" :class="{ active: $route.path === '/archive' }">归档</router-link></li>
        <li><router-link to="/categories" :class="{ active: $route.path === '/categories' }">分类</router-link></li>
        <li><router-link to="/tags" :class="{ active: $route.path === '/tags' }">标签</router-link></li>
        <li><router-link to="/about" :class="{ active: $route.path === '/about' }">关于</router-link></li>
      </ul>

      <div style="display:flex;align-items:center;gap:16px">
        <form class="d-flex" @submit.prevent="search" style="position:relative">
          <input
            v-model="keyword"
            type="search"
            placeholder="搜索..."
            style="width:160px;padding:7px 36px 7px 14px;border:1.5px solid var(--color-border);border-radius:24px;font-size:0.85rem;font-family:var(--font-sans);outline:none;transition:all 0.3s;background:rgba(255,255,255,0.5)"
            @focus="$event.target.style.width='220px';$event.target.style.borderColor='var(--color-accent)'"
            @blur="$event.target.style.width='160px';$event.target.style.borderColor='var(--color-border)'"
          >
          <button type="submit" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--color-text-muted);cursor:pointer">
            <i class="bi bi-search"></i>
          </button>
        </form>

        <template v-if="authStore.isLoggedIn">
          <div class="nav-dropdown">
            <img :src="authStore.user?.avatar || '/images/default-avatar.png'" class="nav-avatar" alt="">
            <div class="nav-dropdown-menu">
              <router-link to="/profile" class="dropdown-item"><i class="bi bi-person"></i> 个人中心</router-link>
              <router-link v-if="authStore.isAdmin" to="/admin" class="dropdown-item"><i class="bi bi-gear"></i> 管理后台</router-link>
              <div class="dropdown-divider"></div>
              <a class="dropdown-item" href="#" @click.prevent="handleLogout"><i class="bi bi-box-arrow-right"></i> 退出</a>
            </div>
          </div>
        </template>
        <template v-else>
          <router-link to="/login" class="btn-ghost" style="padding:6px 16px;font-size:0.84rem">登录</router-link>
          <router-link to="/register" class="btn-prime" style="padding:6px 16px;font-size:0.84rem">注册</router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const keyword = ref('')
const navbarRef = ref(null)

function search() {
  if (keyword.value.trim()) {
    router.push({ path: '/', query: { search: keyword.value.trim() } })
  }
}

async function handleLogout() {
  await authStore.logout()
  router.push('/')
}

let scrollHandler
onMounted(() => {
  scrollHandler = () => {
    if (navbarRef.value) {
      navbarRef.value.classList.toggle('scrolled', window.scrollY > 30)
    }
  }
  window.addEventListener('scroll', scrollHandler, { passive: true })
})
onUnmounted(() => {
  window.removeEventListener('scroll', scrollHandler)
})
</script>
