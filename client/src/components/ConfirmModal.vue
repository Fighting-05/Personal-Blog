<template>
  <Teleport to="body">
    <div v-if="visible" class="cm-overlay" @click.self="onCancel">
      <div class="cm-box">
        <div class="cm-icon"><i class="bi bi-exclamation-triangle-fill"></i></div>
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <div class="cm-actions">
          <button class="cm-btn cm-btn-cancel" @click="onCancel">{{ cancelText }}</button>
          <button class="cm-btn cm-btn-danger" @click="onConfirm">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)
const title = ref('确认操作')
const message = ref('确定要执行此操作吗？')
const confirmText = ref('确认')
const cancelText = ref('取消')
let resolvePromise = null

function show(opts = {}) {
  title.value = opts.title || '确认操作'
  message.value = opts.message || '确定要执行此操作吗？'
  confirmText.value = opts.confirmText || '确认'
  cancelText.value = opts.cancelText || '取消'
  visible.value = true
  return new Promise((resolve) => { resolvePromise = resolve })
}

function onConfirm() {
  visible.value = false
  if (resolvePromise) resolvePromise(true)
}

function onCancel() {
  visible.value = false
  if (resolvePromise) resolvePromise(false)
}

defineExpose({ show })
</script>

<style scoped>
.cm-overlay {
  position: fixed; inset: 0; z-index: 99999;
  background: rgba(0,0,0,0.3); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  animation: cmFadeIn 0.2s ease;
}
.cm-box {
  background: var(--color-surface); border-radius: 16px;
  padding: 36px 32px 24px; text-align: center;
  max-width: 360px; width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  animation: cmScaleIn 0.25s ease;
}
.cm-icon { font-size: 2.5rem; color: var(--color-danger); margin-bottom: 12px }
.cm-box h3 { font-size: 1.1rem; font-weight: 700; margin: 0 0 8px; color: var(--color-text) }
.cm-box p { font-size: 0.86rem; color: var(--color-text-muted); margin: 0 0 24px; line-height: 1.5 }
.cm-actions { display: flex; gap: 10px; justify-content: center }
.cm-btn {
  padding: 10px 28px; border-radius: 10px; font-size: 0.86rem;
  font-weight: 600; cursor: pointer; border: none; font-family: var(--font-sans);
  transition: all 0.2s;
}
.cm-btn-cancel { background: var(--color-border-light); color: var(--color-text-secondary) }
.cm-btn-cancel:hover { background: var(--color-border) }
.cm-btn-danger { background: var(--color-danger); color: #fff }
.cm-btn-danger:hover { opacity: 0.9; transform: translateY(-1px) }
@keyframes cmFadeIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes cmScaleIn { from { opacity: 0; transform: scale(0.92) } to { opacity: 1; transform: scale(1) } }
</style>
