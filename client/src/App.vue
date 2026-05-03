<template>
  <div id="app-layout">
    <div id="nprogress-bar"></div>
    <template v-if="$route.path.startsWith('/admin')">
      <router-view />
    </template>
    <template v-else>
      <AppHeader />
      <main>
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
      <AppFooter />
    </template>
    <BackToTop />
    <ToastContainer />
  </div>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import BackToTop from '@/components/BackToTop.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'
const authStore = useAuthStore()
onMounted(() => { authStore.checkAuth() })
</script>

<style>
#nprogress-bar { position: fixed; top: 0; left: 0; width: 0; height: 3px; background: linear-gradient(90deg, var(--color-accent), var(--color-primary)); z-index: 100000; transition: none; pointer-events: none }
.page-fade-enter-active { transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.22, 0.61, 0.36, 1) }
.page-fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease }
.page-fade-enter-from { opacity: 0; transform: translateY(24px) scale(0.98) }
.page-fade-leave-to { opacity: 0; transform: translateY(-12px) }
</style>