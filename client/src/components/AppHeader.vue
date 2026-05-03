<template>
  <nav class="glass-nav" ref="navbarRef" :class="{ scrolled: isScrolled }">
    <div class="nav-container">
      <router-link to="/" class="nav-brand">
        <span class="brand-dot"></span> 个人博客
      </router-link>

      <ul class="nav-links">
        <li><router-link to="/" exact-active-class="active">首页</router-link></li>
        <li><router-link to="/archive" active-class="active">归档</router-link></li>
        <li><router-link to="/categories" active-class="active">分类</router-link></li>
        <li><router-link to="/about" active-class="active">关于</router-link></li>
      </ul>

      <div class="nav-actions">
        <form @submit.prevent="search" class="nav-search">
          <i class="bi bi-search"></i>
          <input v-model="keyword" type="search" placeholder="搜索..." @focus="searchFocused = true" @blur="searchFocused = false" :class="{ focused: searchFocused }">
        </form>

        <template v-if="authStore.isLoggedIn">
          <div class="nav-dropdown">
            <img :src="authStore.user?.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${authStore.user?.username || 'user'}`" class="nav-avatar" alt="">
            <div class="nav-dropdown-menu">
              <router-link to="/profile" class="dropdown-item"><i class="bi bi-person"></i> 个人中心</router-link>
              <router-link v-if="authStore.isAdmin" to="/admin" class="dropdown-item"><i class="bi bi-gear"></i> 管理后台</router-link>
              <div class="dropdown-divider"></div>
              <a class="dropdown-item" href="#" @click.prevent="handleLogout"><i class="bi bi-box-arrow-right"></i> 退出</a>
            </div>
          </div>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-login">登录</router-link>
          <router-link to="/register" class="nav-signup">注册</router-link>
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
const searchFocused = ref(false)
const isScrolled = ref(false)

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
  isScrolled.value = window.scrollY > 20
  scrollHandler = () => { isScrolled.value = window.scrollY > 20 }
  window.addEventListener('scroll', scrollHandler, { passive: true })
})
onUnmounted(() => { window.removeEventListener('scroll', scrollHandler) })
</script>

<style scoped>
.glass-nav {
  position: sticky; top: 0; z-index: 999;
  padding: 0 24px; height: 60px;
  display: flex; align-items: center;
  background: transparent;
  transition: background 0.35s ease, box-shadow 0.35s ease;
}
.glass-nav.scrolled {
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  box-shadow: 0 1px 0 rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.04);
}

.nav-container {
  width: 100%; max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr auto 1fr;
  align-items: center; gap: 24px;
}

/* Brand - left */
.nav-brand {
  display: flex; align-items: center; gap: 8px;
  font-size: 1.05rem; font-weight: 700; color: var(--color-text);
  text-decoration: none; white-space: nowrap;
  transition: opacity 0.3s;
}
.nav-brand:hover { opacity: 0.7 }
.brand-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 8px rgba(201,169,110,0.5);
}

/* Nav links - center */
.nav-links {
  display: flex; gap: 6px; list-style: none; margin: 0; padding: 0;
}
.nav-links a {
  display: inline-block; padding: 7px 14px; border-radius: 8px;
  font-size: 0.88rem; font-weight: 500; color: var(--color-text-secondary);
  text-decoration: none; position: relative;
  transition: color 0.25s, transform 0.25s;
}
.nav-links a:hover { color: var(--color-text); transform: translateY(-1px) }
.nav-links a.active {
  color: var(--color-primary); font-weight: 600;
}
.nav-links a.active::after {
  content: ''; position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%);
  width: 20px; height: 2.5px; border-radius: 2px;
  background: var(--color-accent);
}

/* Actions - right */
.nav-actions {
  display: flex; align-items: center; gap: 14px; justify-content: flex-end;
}
.nav-search {
  position: relative; display: flex; align-items: center;
}
.nav-search i {
  position: absolute; left: 12px; font-size: 0.8rem; color: var(--color-text-muted);
  pointer-events: none; z-index: 1;
}
.nav-search input {
  width: 150px; padding: 8px 14px 8px 34px;
  border: 1.5px solid var(--color-border); border-radius: 22px;
  font-size: 0.82rem; font-family: var(--font-sans);
  outline: none; background: rgba(255,255,255,0.5);
  color: var(--color-text);
  transition: all 0.3s;
}
.nav-search input.focused { width: 200px; border-color: var(--color-accent); background: var(--color-surface) }
.nav-search input::placeholder { color: var(--color-text-muted) }

.nav-login {
  font-size: 0.84rem; color: var(--color-text-secondary); text-decoration: none;
  padding: 6px 14px; border-radius: 8px; transition: all 0.25s; font-weight: 500;
}
.nav-login:hover { color: var(--color-text); background: rgba(0,0,0,0.04); transform: translateY(-1px) }
.nav-signup {
  font-size: 0.84rem; color: #fff; text-decoration: none;
  padding: 7px 18px; border-radius: 20px;
  background: var(--color-primary);
  transition: all 0.25s; font-weight: 500;
}
.nav-signup:hover { background: var(--color-accent); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(139,115,85,0.3) }

/* Dropdown */
.nav-dropdown { position: relative }
.nav-avatar {
  width: 34px; height: 34px; border-radius: 50%; object-fit: cover;
  cursor: pointer; border: 2px solid transparent;
  transition: border-color 0.25s, transform 0.25s;
}
.nav-avatar:hover { border-color: var(--color-accent); transform: scale(1.05) }
.nav-dropdown-menu {
  position: absolute; top: calc(100% + 8px); right: 0;
  background: var(--color-surface); border-radius: var(--radius-md);
  box-shadow: var(--shadow-xl); border: 1px solid var(--color-border-light);
  padding: 8px; min-width: 180px; opacity: 0; visibility: hidden;
  transform: translateY(-8px); transition: all 0.2s ease;
}
.nav-dropdown:hover .nav-dropdown-menu { opacity: 1; visibility: visible; transform: translateY(0) }
.dropdown-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; border-radius: 6px;
  color: var(--color-text-secondary); font-size: 0.88rem;
  transition: all 0.15s; text-decoration: none;
}
.dropdown-item:hover { background: #faf7f2; color: var(--color-text) }
.dropdown-divider { height: 1px; background: var(--color-border-light); margin: 6px 0 }

@media (max-width: 800px) {
  .nav-container { grid-template-columns: auto 1fr auto }
  .nav-links { display: none }
}
</style>
