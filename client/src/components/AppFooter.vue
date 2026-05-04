<template>
  <footer class="app-footer">
    <div class="footer-grid">
      <div class="footer-col">
        <div class="footer-brand">✦ 个人博客</div>
        <p class="footer-desc">用文字记录思考与成长。<br>分享技术、生活与读书。</p>
        <div class="footer-stats">
          <span><i class="bi bi-file-text"></i> {{ stats.posts }} 篇文章</span>
          <span><i class="bi bi-chat-dots"></i> {{ stats.comments }} 条评论</span>
        </div>
      </div>
      <div class="footer-col">
        <h4>导航</h4>
        <router-link to="/">首页</router-link>
        <router-link to="/categories">分类</router-link>
        <router-link to="/resume">简历</router-link>
        <a href="/rss.xml" target="_blank">RSS 订阅</a>
      </div>
      <div class="footer-col">
        <h4>订阅</h4>
        <form @submit.prevent="doSubscribe" class="footer-sub">
          <input v-model="email" type="email" placeholder="your@email.com" required>
          <button type="submit"><i class="bi bi-send"></i></button>
        </form>
        <p v-if="subMsg" class="footer-sub-msg">{{ subMsg }}</p>
      </div>
    </div>
    <div class="footer-bottom">
      &copy; 2026 个人博客 · Powered by Node.js + Vue 3
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { subscribeAPI, adminAPI, postAPI } from '@/api'

const email = ref('')
const subMsg = ref('')
const stats = ref({ posts: 0, comments: 0 })

onMounted(async () => {
  try { stats.value.posts = (await postAPI.getPosts({ limit: 1 })).data.total || 0 } catch (_) {}
  try { stats.value.comments = (await adminAPI.getComments({})).data.total || 0 } catch (_) {}
})

async function doSubscribe() {
  try {
    await subscribeAPI.subscribe(email.value)
    subMsg.value = '订阅成功！'
    email.value = ''
  } catch (e) {
    subMsg.value = e.response?.data?.error || '订阅失败'
  }
}
</script>

<style scoped>
.app-footer {
  margin-top: 80px; border-top: 1px solid var(--color-border-light);
  background: linear-gradient(to bottom, #faf8f5, #f5f0e8);
  padding: 48px 24px 24px;
}
.footer-grid {
  max-width: 960px; margin: 0 auto;
  display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 40px;
}
@media (max-width: 768px) { .footer-grid { grid-template-columns: 1fr; gap: 28px } }
.footer-brand { font-size: 1.2rem; font-weight: 700; color: var(--color-text); margin-bottom: 8px }
.footer-desc { font-size: 0.84rem; color: var(--color-text-muted); line-height: 1.6; margin-bottom: 12px }
.footer-stats { display: flex; gap: 16px; font-size: 0.78rem; color: var(--color-text-muted) }
.footer-stats i { margin-right: 4px; color: var(--color-accent) }
.footer-col h4 {
  font-size: 0.82rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.06em; color: var(--color-text-muted); margin-bottom: 12px;
}
.footer-col a, .footer-col .router-link-exact-active {
  display: block; font-size: 0.84rem; color: var(--color-text-secondary);
  text-decoration: none; margin-bottom: 6px; transition: color 0.2s;
}
.footer-col a:hover { color: var(--color-accent) }
.footer-sub { display: flex; gap: 6px }
.footer-sub input {
  flex: 1; padding: 8px 12px; border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm); font-size: 0.84rem; font-family: var(--font-sans);
  outline: none; background: var(--color-surface); color: var(--color-text);
  transition: border-color 0.2s;
}
.footer-sub input:focus { border-color: var(--color-accent) }
.footer-sub button {
  width: 38px; height: 38px; border-radius: var(--radius-sm);
  background: var(--color-primary); border: none; color: #fff; cursor: pointer;
  font-size: 0.9rem; display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.footer-sub button:hover { background: var(--color-accent) }
.footer-sub-msg { font-size: 0.76rem; color: var(--color-success); margin-top: 6px }
.footer-bottom {
  max-width: 960px; margin: 32px auto 0; padding-top: 20px;
  border-top: 1px solid var(--color-border-light);
  text-align: center; font-size: 0.78rem; color: var(--color-text-muted);
}
</style>
