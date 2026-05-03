<template>
  <div style="display:flex;justify-content:center;padding:40px 0">
    <div style="background:var(--color-surface);border-radius:var(--radius-lg);padding:36px;width:100%;max-width:420px;border:1px solid var(--color-border-light);box-shadow:var(--shadow-lg)">
      <div class="text-center" style="margin-bottom:28px">
        <div style="font-size:2rem;color:var(--color-accent);margin-bottom:8px">✧</div>
        <h2 style="font-size:1.5rem;font-weight:700;margin:0;letter-spacing:-0.02em">创建账号</h2>
        <p style="color:var(--color-text-muted);font-size:0.84rem;margin:6px 0 0">加入我们的博客社区</p>
      </div>

      <div v-if="success" style="padding:10px 16px;background:#e8f0e4;color:var(--color-success);border-radius:var(--radius-sm);margin-bottom:20px;font-size:0.84rem;text-align:center">{{ success }}</div>
      <div v-if="error" style="padding:10px 16px;background:#fce8e8;color:var(--color-danger);border-radius:var(--radius-sm);margin-bottom:20px;font-size:0.84rem;text-align:center">{{ error }}</div>

      <form @submit.prevent="handleRegister">
        <div style="margin-bottom:14px">
          <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--color-text-muted);margin-bottom:5px">用户名</label>
          <input v-model="form.username" class="input-elegant" placeholder="输入用户名" required>
        </div>
        <div style="margin-bottom:14px">
          <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--color-text-muted);margin-bottom:5px">邮箱</label>
          <input v-model="form.email" type="email" class="input-elegant" placeholder="输入邮箱" required>
        </div>
        <div style="margin-bottom:14px">
          <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--color-text-muted);margin-bottom:5px">密码</label>
          <input v-model="form.password" type="password" class="input-elegant" placeholder="至少6位" required>
        </div>
        <div style="margin-bottom:20px">
          <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--color-text-muted);margin-bottom:5px">确认密码</label>
          <input v-model="form.confirmPassword" type="password" class="input-elegant" placeholder="再次输入密码" required>
        </div>
        <button type="submit" class="btn-prime" style="width:100%;justify-content:center" :disabled="loading">
          <span v-if="loading" class="spinner-ring" style="width:16px;height:16px;border-width:2px"></span>
          注册
        </button>
      </form>

      <p style="text-align:center;margin:20px 0 0;font-size:0.84rem;color:var(--color-text-muted)">
        已有账号？<router-link to="/login" style="color:var(--color-accent);font-weight:600">立即登录</router-link>
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
const form = reactive({ username: '', email: '', password: '', confirmPassword: '' })
const error = ref('')
const success = ref('')
const loading = ref(false)

async function handleRegister() {
  error.value = ''
  success.value = ''
  if (form.password !== form.confirmPassword) {
    error.value = '两次密码不一致'
    return
  }
  if (form.password.length < 6) {
    error.value = '密码长度至少6位'
    return
  }
  loading.value = true
  const result = await authStore.register(form.username, form.email, form.password)
  loading.value = false
  if (result.success) {
    success.value = '注册成功！去登录吧。'
    setTimeout(() => router.push('/login'), 1500)
  } else {
    error.value = result.error
  }
}
</script>
