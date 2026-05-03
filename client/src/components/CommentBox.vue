<template>
  <div>
    <div class="section-header" style="text-align:left;margin-bottom:24px">
      <div class="section-label">Discussion</div>
      <h3 style="font-size:1.3rem;font-weight:700;margin:0">评论 ({{ total }})</h3>
    </div>

    <div style="background:var(--color-surface);border-radius:var(--radius-md);padding:20px;border:1px solid var(--color-border-light);margin-bottom:20px">
      <form @submit.prevent="authStore.isLoggedIn ? submitComment() : submitGuestComment()">
        <div v-if="!authStore.isLoggedIn" style="display:flex;gap:12px;margin-bottom:10px">
          <input v-model="guestName" class="input-elegant" placeholder="昵称 *" required style="flex:1">
          <input v-model="guestEmail" type="email" class="input-elegant" placeholder="邮箱 (选填)" style="flex:1">
        </div>
        <div style="position:relative">
          <textarea
            v-model="content"
            class="textarea-elegant"
            rows="2"
            placeholder="写下你的评论..."
            required
            style="min-height:80px;padding-right:50px"
          ></textarea>
          <div style="position:absolute;bottom:8px;right:8px">
            <EmojiPicker @insert="e => content += e" />
          </div>
        </div>
        <div style="text-align:right;margin-top:10px">
          <button type="submit" class="btn-prime" style="padding:8px 20px;font-size:0.84rem">
            <i class="bi bi-send"></i> 发表
          </button>
        </div>
      </form>
    </div>

    <div v-if="comments.length === 0" style="text-align:center;padding:32px;color:var(--color-text-muted);font-size:0.9rem">
      暂无评论，来说两句吧~
    </div>

    <div v-for="comment in comments" :key="comment.id" style="padding:16px 0;border-bottom:1px solid var(--color-border-light)">
      <div style="display:flex;gap:12px">
        <img :src="comment.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.username || comment.guest_name || '?')}&background=c9a96e&color=fff&size=64`" style="width:36px;height:36px;border-radius:50%;object-fit:cover" alt="">
        <div style="flex:1">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <strong style="font-size:0.88rem">{{ comment.displayName || comment.username || '匿名' }}</strong>
            <small style="color:var(--color-text-muted);font-size:0.78rem">{{ formatDate(comment.created_at) }}</small>
          </div>
          <p style="margin:0;font-size:0.9rem;line-height:1.6;color:var(--color-text-secondary)">{{ comment.content }}</p>
          <div style="display:flex;gap:16px;align-items:center;margin-top:6px">
            <button
              v-if="authStore.isLoggedIn"
              style="border:none;background:none;color:var(--color-text-muted);font-size:0.78rem;cursor:pointer;padding:2px 0;transition:color 0.2s"
              @mouseenter="$event.target.style.color='var(--color-accent)'"
              @mouseleave="$event.target.style.color='var(--color-text-muted)'"
              @click="replyTo(comment)"
            >
              <i class="bi bi-reply"></i> 回复
            </button>
            <button
              v-if="authStore.isLoggedIn"
              style="border:none;background:none;font-size:0.78rem;cursor:pointer;padding:2px 0;transition:color 0.2s"
              :style="{ color: comment.userLiked ? '#e74c3c' : 'var(--color-text-muted)' }"
              @click="toggleCommentLike(comment)"
            >
              <i class="bi" :class="comment.userLiked ? 'bi-heart-fill' : 'bi-heart'"></i>
              <span v-if="comment.like_count > 0" style="margin-left:2px">{{ comment.like_count }}</span>
            </button>
          </div>

          <div v-if="replyingTo === comment.id" style="margin-top:10px">
            <form @submit.prevent="submitReply(comment.id)">
              <textarea v-model="replyContent" class="textarea-elegant" rows="2" placeholder="回复..." required style="min-height:60px"></textarea>
              <div style="display:flex;gap:8px;margin-top:8px">
                <button type="submit" class="btn-prime" style="padding:6px 16px;font-size:0.8rem">回复</button>
                <button type="button" class="btn-ghost" style="padding:6px 16px;font-size:0.8rem" @click="cancelReply">取消</button>
              </div>
            </form>
          </div>

          <div v-if="comment.replies?.length" style="margin-top:12px;padding-left:18px;border-left:2px solid var(--color-accent-light)">
            <div v-for="reply in comment.replies" :key="reply.id" style="padding:8px 0">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                <strong style="font-size:0.82rem">{{ reply.displayName || reply.username }}</strong>
                <small style="color:var(--color-text-muted);font-size:0.74rem">{{ formatDate(reply.created_at) }}</small>
              </div>
              <p style="margin:0;font-size:0.84rem;color:var(--color-text-secondary);line-height:1.5">{{ reply.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { postAPI } from '@/api'
import EmojiPicker from '@/components/EmojiPicker.vue'

const props = defineProps({ postId: Number, comments: Array, total: Number })
const emit = defineEmits(['refresh'])

const authStore = useAuthStore()
const content = ref('')
const guestName = ref('')
const guestEmail = ref('')
const replyingTo = ref(null)
const replyContent = ref('')

async function submitComment() {
  try {
    await postAPI.createComment({ postId: props.postId, content: content.value })
    content.value = ''
    emit('refresh')
  } catch (e) {
    window.$toast.error(e.response?.data?.error || '评论失败')
  }
}

async function submitGuestComment() {
  if (!guestName.value.trim()) return window.$toast.warning('请填写昵称')
  try {
    await postAPI.createComment({
      postId: props.postId,
      content: content.value,
      guestName: guestName.value.trim(),
      guestEmail: guestEmail.value.trim() || undefined
    })
    content.value = ''
    guestName.value = ''
    guestEmail.value = ''
    emit('refresh')
  } catch (e) {
    window.$toast.error(e.response?.data?.error || '评论失败')
  }
}

function replyTo(comment) { replyingTo.value = comment.id }

function cancelReply() {
  replyingTo.value = null
  replyContent.value = ''
}

async function submitReply(parentId) {
  try {
    await postAPI.createComment({ postId: props.postId, content: replyContent.value, parentId })
    replyContent.value = ''
    replyingTo.value = null
    emit('refresh')
  } catch (e) {
    window.$toast.error(e.response?.data?.error || '回复失败')
  }
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('zh-CN') : ''
}

async function toggleCommentLike(comment) {
  try {
    const res = await postAPI.likeComment(comment.id)
    comment.userLiked = res.data.liked
    comment.like_count = res.data.likeCount
  } catch (_) {}
}
</script>
