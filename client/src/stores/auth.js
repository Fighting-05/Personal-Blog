import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function checkAuth() {
    const saved = localStorage.getItem('user')
    if (saved) {
      try {
        user.value = JSON.parse(saved)
        const res = await authAPI.me()
        user.value = res.data.user
        localStorage.setItem('user', JSON.stringify(res.data.user))
      } catch {
        user.value = null
        localStorage.removeItem('user')
      }
    }
  }

  async function login(username, password) {
    loading.value = true
    try {
      const res = await authAPI.login({ username, password })
      user.value = res.data.user
      localStorage.setItem('user', JSON.stringify(res.data.user))
      localStorage.setItem('token', res.data.token)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || '登录失败' }
    } finally {
      loading.value = false
    }
  }

  async function register(username, email, password) {
    loading.value = true
    try {
      await authAPI.register({ username, email, password })
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || '注册失败' }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await authAPI.logout()
    user.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  async function updateProfile(data) {
    try {
      const res = await authAPI.updateProfile(data)
      user.value = res.data.user
      localStorage.setItem('user', JSON.stringify(res.data.user))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || '更新失败' }
    }
  }

  return { user, loading, isLoggedIn, isAdmin, checkAuth, login, register, logout, updateProfile }
})
