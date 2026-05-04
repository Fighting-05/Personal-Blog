<template>
  <div class="rp-block" v-if="$slots.default">
    <h3>{{ title }}</h3>
    <slot />
  </div>
</template>
<script setup>
defineProps({ title: String })
</script>
