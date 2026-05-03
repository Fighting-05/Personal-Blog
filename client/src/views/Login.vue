<template>
  <div style="display:flex;justify-content:center;padding:40px 0">
    <div style="background:var(--color-surface);border-radius:var(--radius-lg);padding:36px;width:100%;max-width:420px;border:1px solid var(--color-border-light);box-shadow:var(--shadow-lg)">
      <div class="text-center" style="margin-bottom:28px">
        <div style="font-size:2rem;color:var(--color-accent);margin-bottom:8px">✧</div>
        <h2 style="font-size:1.5rem;font-weight:700;margin:0;letter-spacing:-0.02em">欢迎回来</h2>
        <p style="color:var(--color-text-muted);font-size:0.84rem;margin:6px 0 0">登录你的博客账号</p>
      </div>

      <div v-if="error" style="padding:10px 16px;background:#fce8e8;color:var(--color-danger);border-radius:var(--radius-sm);margin-bottom:20px;font-size:0.84rem;text-align:center">{{ error }}</div>

      <form @submit.prevent="handleLogin">
        <div style="margin-bottom:16px">
          <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--color-text-muted);margin-bottom:5px">用户名</label>
          <input v-model="form.username" class="input-elegant" placeholder="输入用户名" required>
        </div>
        <div style="margin-bottom:20px">
          <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--color-text-muted);margin-bottom:5px">密码</label>
          <input v-model="form.password" type="password" class="input-elegant" placeholder="输入密码" required>
        </div>
        <button type="submit" class="btn-prime" style="width:100%;justify-content:center" :disabled="loading">
          <span v-if="loading" class="spinner-ring" style="width:16px;height:16px;border-width:2px"></span>
          登录
        </button>
      </form>

      <p style="text-align:center;margin:20px 0 0;font-size:0.84rem;color:var(--color-text-muted)">
        没有账号？<router-link to="/register" style="color:var(--color-accent);font-weight:600">立即注册</router-link>
      </p>
      <p style="text-align:center;margin:4px 0 0;font-size:0.76rem;color:var(--color-text-muted)">
        演示账号: admin / admin123
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const form = reactive({ username: '', password: '' })
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  const result = await authStore.login(form.username, form.password)
  loading.value = false
  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error
  }
}
</script>
