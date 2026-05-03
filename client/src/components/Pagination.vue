<template>
  <nav v-if="totalPages > 1" style="display:flex;justify-content:center;margin-top:36px">
    <div style="display:flex;align-items:center;gap:4px">
      <button
        :disabled="page <= 1"
        @click="$emit('change', page - 1)"
        style="padding:6px 12px;border:1.5px solid var(--color-border);border-radius:8px;background:var(--color-surface);color:var(--color-text-secondary);cursor:pointer;font-family:var(--font-sans);font-size:0.82rem;font-weight:500;transition:all 0.2s"
        :style="page <= 1 ? 'opacity:0.4;cursor:default' : ''"
        @mouseenter="!$event.target.disabled && ($event.target.style.borderColor='var(--color-accent)')"
        @mouseleave="$event.target.style.borderColor='var(--color-border)'"
      >
        <i class="bi bi-chevron-left"></i>
      </button>
      <button
        v-for="i in totalPages" :key="i"
        @click="$emit('change', i)"
        style="padding:6px 14px;border:1.5px solid transparent;border-radius:8px;cursor:pointer;font-family:var(--font-sans);font-size:0.84rem;font-weight:500;transition:all 0.2s"
        :style="i === page
          ? 'background:var(--color-text);color:#fff;border-color:var(--color-text)'
          : 'background:transparent;color:var(--color-text-secondary)'"
        @mouseenter="i !== page && ($event.target.style.background='#f5f0e8')"
        @mouseleave="i !== page && ($event.target.style.background='transparent')"
      >
        {{ i }}
      </button>
      <button
        :disabled="page >= totalPages"
        @click="$emit('change', page + 1)"
        style="padding:6px 12px;border:1.5px solid var(--color-border);border-radius:8px;background:var(--color-surface);color:var(--color-text-secondary);cursor:pointer;font-family:var(--font-sans);font-size:0.82rem;font-weight:500;transition:all 0.2s"
        :style="page >= totalPages ? 'opacity:0.4;cursor:default' : ''"
        @mouseenter="!$event.target.disabled && ($event.target.style.borderColor='var(--color-accent)')"
        @mouseleave="$event.target.style.borderColor='var(--color-border)'"
      >
        <i class="bi bi-chevron-right"></i>
      </button>
    </div>
  </nav>
</template>

<script setup>
defineProps({ page: Number, totalPages: Number })
defineEmits(['change'])
</script>
