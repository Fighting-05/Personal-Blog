<template>
  <div class="skeleton-card">
    <div class="sk-img"></div>
    <div class="sk-body">
      <div class="sk-line sk-title"></div>
      <div class="sk-line sk-text"></div>
      <div class="sk-line sk-text short"></div>
      <div class="sk-line sk-text xshort"></div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  background: var(--color-surface); border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light); overflow: hidden;
  padding: 0; margin-bottom: 20px;
}
.sk-img { height: 180px; background: linear-gradient(90deg, var(--color-border-light) 25%, #f0ece6 50%, var(--color-border-light) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite }
.sk-body { padding: 20px }
.sk-line { height: 14px; background: var(--color-border-light); border-radius: 6px; margin-bottom: 10px; background: linear-gradient(90deg, var(--color-border-light) 25%, #f0ece6 50%, var(--color-border-light) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite }
.sk-title { width: 65%; height: 20px }
.sk-text { width: 90% }
.sk-text.short { width: 70% }
.sk-text.xshort { width: 40% }
@keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
</style>
