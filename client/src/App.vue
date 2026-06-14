<template>
  <div id="app-layout">
    <div id="nprogress-bar"></div>
    <template v-if="$route.path.startsWith('/admin')">
      <router-view />
    </template>
    <template v-else>
      <AppHeader v-if="!isAuthPage" />
      <main :class="{ 'no-header': isAuthPage }">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </template>
    <BackToTop />
    <ToastContainer />
  </div>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue'
import BackToTop from '@/components/BackToTop.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import { useAuthStore } from '@/stores/auth'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const authStore = useAuthStore()
const isAuthPage = computed(() => ['/login', '/register'].includes(route.path))

onMounted(() => { authStore.checkAuth() })
</script>

<style>
#app { min-height: 100vh; }
#app-layout > main { padding-top: 60px }
#app-layout > main.no-header { padding-top: 0 }
#nprogress-bar { position: fixed; top: 0; left: 0; width: 0; height: 3px; background: linear-gradient(90deg, var(--color-accent), var(--color-primary)); z-index: 100000; transition: none; pointer-events: none }
.page-fade-enter-active { transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.22, 0.61, 0.36, 1) }
.page-fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease }
.page-fade-enter-from { opacity: 0; transform: translateY(24px) scale(0.98) }
.page-fade-leave-to { opacity: 0; transform: translateY(-12px) }
</style>