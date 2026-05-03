<template>
  <div class="emoji-picker-wrapper">
    <button type="button" class="emoji-trigger" @click="open = !open" title="插入表情">
      <i class="bi bi-emoji-smile"></i>
    </button>
    <div v-if="open" class="emoji-panel">
      <button v-for="e in emojis" :key="e" type="button" class="emoji-item" @click="insert(e)">{{ e }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['insert'])
const open = ref(false)

const emojis = ['😀','😂','🤣','😍','🥰','😘','😜','🤔','😎','🥳','😢','😡','👍','👎','🎉','🔥','💯','❤️','💔','⭐','✨','💡','📝','🎨','☕','🍕','🌍','🚀','💻','🎵']

function insert(emoji) {
  emit('insert', emoji)
  open.value = false
}

function closeOutside(e) {
  if (!e.target.closest('.emoji-picker-wrapper')) open.value = false
}
onMounted(() => document.addEventListener('click', closeOutside))
onUnmounted(() => document.removeEventListener('click', closeOutside))
</script>

<style scoped>
.emoji-picker-wrapper { position: relative; display: inline-block }
.emoji-trigger {
  background: none; border: 1.5px solid var(--color-border); border-radius: var(--radius-sm);
  color: var(--color-text-muted); cursor: pointer; padding: 8px 12px; font-size: 1rem;
  transition: all 0.2s;
}
.emoji-trigger:hover { border-color: var(--color-accent); color: var(--color-accent) }
.emoji-panel {
  position: absolute; bottom: 100%; left: 0; margin-bottom: 8px;
  background: var(--color-surface); border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md); box-shadow: var(--shadow-xl);
  padding: 8px; display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px;
  z-index: 100; width: 260px;
}
.emoji-item {
  background: none; border: none; font-size: 1.3rem; cursor: pointer;
  padding: 4px; border-radius: 6px; transition: background 0.15s;
}
.emoji-item:hover { background: var(--color-border-light) }
</style>
