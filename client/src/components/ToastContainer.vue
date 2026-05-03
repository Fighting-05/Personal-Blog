<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div v-for="t in toasts" :key="t.id" :class="['toast-item', 'toast-' + t.type]" @click="remove(t.id)">
          <i :class="iconMap[t.type]"></i>
          <span>{{ t.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const toasts = ref([])
let id = 0

const iconMap = {
  success: 'bi bi-check-circle-fill',
  error: 'bi bi-x-circle-fill',
  warning: 'bi bi-exclamation-triangle-fill',
  info: 'bi bi-info-circle-fill'
}

window.$toast = function (message, type = 'info') {
  const item = { id: ++id, message, type }
  toasts.value.push(item)
  setTimeout(() => remove(item.id), 3500)
}

window.$toast.success = (m) => window.$toast(m, 'success')
window.$toast.error = (m) => window.$toast(m, 'error')
window.$toast.warning = (m) => window.$toast(m, 'warning')

function remove(id) {
  const i = toasts.value.findIndex(t => t.id === id)
  if (i > -1) toasts.value.splice(i, 1)
}
</script>

<style scoped>
.toast-container {
  position: fixed; top: 80px; right: 20px; z-index: 99999;
  display: flex; flex-direction: column; gap: 8px; pointer-events: none;
}
.toast-item {
  pointer-events: auto;
  display: flex; align-items: center; gap: 10px;
  padding: 12px 20px; border-radius: 10px; font-size: 0.86rem;
  font-weight: 500; cursor: pointer;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  animation: toast-slide 0.35s ease;
}
.toast-success { background: rgba(107,155,122,0.92); color: #fff }
.toast-error { background: rgba(220,107,107,0.92); color: #fff }
.toast-warning { background: rgba(201,169,110,0.92); color: #fff }
.toast-info { background: rgba(45,45,45,0.9); color: #fff }
@keyframes toast-slide { from { transform: translateX(120%); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
.toast-enter-active { animation: toast-slide 0.35s ease }
.toast-leave-active { transition: all 0.3s ease }
.toast-leave-to { opacity: 0; transform: translateX(120%) }
</style>
