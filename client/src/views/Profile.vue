<template>
  <div style="max-width:560px;margin:0 auto;padding:40px 0">
    <!-- Profile Card -->
    <div style="background:var(--color-surface);border-radius:var(--radius-lg);padding:32px;border:1px solid var(--color-border-light);margin-bottom:24px">
      <h3 style="font-size:1.15rem;font-weight:700;margin:0 0 20px;display:flex;align-items:center;gap:8px">
        <i class="bi bi-person" style="color:var(--color-accent)"></i> 个人资料
      </h3>

      <div v-if="msg" :style="msgType === 'success' ? 'padding:10px 16px;background:#e8f0e4;color:var(--color-success);border-radius:var(--radius-sm);margin-bottom:20px;font-size:0.84rem' : 'padding:10px 16px;background:#fce8e8;color:var(--color-danger);border-radius:var(--radius-sm);margin-bottom:20px;font-size:0.84rem'">
        {{ msg }}
      </div>

      <form @submit.prevent="updateProfile">
        <div style="text-align:center;margin-bottom:24px">
          <img :src="profileForm.avatar || '/images/default-avatar.png'" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid var(--color-accent);box-shadow:0 0 0 6px rgba(201,169,110,0.15)" alt="">
          <div style="margin-top:12px">
            <input type="file" @change="onFileChange" accept="image/*" style="font-family:var(--font-sans);font-size:0.82rem">
          </div>
        </div>

        <div style="margin-bottom:14px">
          <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--color-text-muted);margin-bottom:5px">用户名</label>
          <input v-model="profileForm.username" class="input-elegant" required>
        </div>
        <div style="margin-bottom:14px">
          <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--color-text-muted);margin-bottom:5px">邮箱</label>
          <input v-model="profileForm.email" type="email" class="input-elegant" required>
        </div>
        <div style="margin-bottom:20px">
          <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--color-text-muted);margin-bottom:5px">个人简介</label>
          <textarea v-model="profileForm.bio" class="textarea-elegant" rows="3" placeholder="介绍一下自己..."></textarea>
        </div>
        <button type="submit" class="btn-prime">保存修改</button>
      </form>
    </div>

    <!-- Password Card -->
    <div style="background:var(--color-surface);border-radius:var(--radius-lg);padding:32px;border:1px solid var(--color-border-light)">
      <h3 style="font-size:1.15rem;font-weight:700;margin:0 0 20px;display:flex;align-items:center;gap:8px">
        <i class="bi bi-lock" style="color:var(--color-accent)"></i> 修改密码
      </h3>

      <div v-if="pwdMsg" :style="pwdMsgType === 'success' ? 'padding:10px 16px;background:#e8f0e4;color:var(--color-success);border-radius:var(--radius-sm);margin-bottom:20px;font-size:0.84rem' : 'padding:10px 16px;background:#fce8e8;color:var(--color-danger);border-radius:var(--radius-sm);margin-bottom:20px;font-size:0.84rem'">
        {{ pwdMsg }}
      </div>

      <form @submit.prevent="updatePassword">
        <div style="margin-bottom:14px">
          <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--color-text-muted);margin-bottom:5px">当前密码</label>
          <input v-model="pwdForm.current" type="password" class="input-elegant" required>
        </div>
        <div style="margin-bottom:20px">
          <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--color-text-muted);margin-bottom:5px">新密码</label>
          <input v-model="pwdForm.newPass" type="password" class="input-elegant" required>
        </div>
        <button type="submit" class="btn-prime">修改密码</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { authAPI } from '@/api'

const authStore = useAuthStore()
const profileForm = reactive({ username: '', email: '', bio: '', avatar: '' })
const pwdForm = reactive({ current: '', newPass: '' })
const msg = ref('')
const msgType = ref('success')
const pwdMsg = ref('')
const pwdMsgType = ref('success')
const avatarFile = ref(null)

onMounted(() => {
  if (authStore.user) {
    profileForm.username = authStore.user.username
    profileForm.email = authStore.user.email
    profileForm.bio = authStore.user.bio || ''
    profileForm.avatar = authStore.user.avatar || ''
  }
})

function onFileChange(e) { avatarFile.value = e.target.files[0] }

async function updateProfile() {
  msg.value = ''
  const formData = new FormData()
  formData.append('username', profileForm.username)
  formData.append('email', profileForm.email)
  formData.append('bio', profileForm.bio)
  if (avatarFile.value) {
    formData.append('avatar', avatarFile.value)
  } else {
    formData.append('avatar', profileForm.avatar)
  }
  const result = await authStore.updateProfile(formData)
  if (result.success) {
    msg.value = '资料更新成功'
    msgType.value = 'success'
    if (authStore.user) {
      profileForm.username = authStore.user.username
      profileForm.email = authStore.user.email
      profileForm.bio = authStore.user.bio || ''
      profileForm.avatar = authStore.user.avatar || ''
    }
    avatarFile.value = null
  } else {
    msg.value = result.error
    msgType.value = 'error'
  }
}

async function updatePassword() {
  pwdMsg.value = ''
  try {
    await authAPI.updatePassword({ currentPassword: pwdForm.current, newPassword: pwdForm.newPass })
    pwdMsg.value = '密码修改成功'
    pwdMsgType.value = 'success'
    pwdForm.current = ''
    pwdForm.newPass = ''
  } catch (e) {
    pwdMsg.value = e.response?.data?.error || '修改失败'
    pwdMsgType.value = 'error'
  }
}
</script>
