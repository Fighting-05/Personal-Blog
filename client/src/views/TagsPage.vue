<template>
<div>
  <div class="page-hero" style="background:linear-gradient(135deg,#fdf2e9 0%,#f8e5d6 50%,#fcefe0 100%)">
    <div class="section-label">Topics</div>
    <h2 style="font-size:1.8rem;font-weight:700;margin:0">标签云</h2>
    <p style="color:var(--color-text-muted);font-size:0.88rem;margin:8px 0 0">拖拽旋转探索所有标签</p>
  </div>
  <div class="tag-3d-wrap" v-if="tags.length"><div ref="cloudRef" class="tag-3d-cloud"></div></div>
  <div class="tag-simple" v-else><router-link v-for="tag in tags" :key="tag.id" :to="{path:'/',query:{tag:tag.slug}}" class="tag-pill" :style="{fontSize:(0.75+tag.post_count/maxCount*1.2)+'rem'}">#{{tag.name}}<span>({{tag.post_count}})</span></router-link></div>
</div>
</template>
<script setup>import {ref,computed,onMounted} from 'vue';import {postAPI} from '@/api';import TagCloud from 'TagCloud';const tags=ref([]),cloudRef=ref(null);const maxCount=computed(()=>Math.max(...tags.value.map(t=>t.post_count),1));onMounted(async()=>{try{tags.value=(await postAPI.getTags()).data}catch(_){};setTimeout(()=>{if(tags.value.length&&cloudRef.value){TagCloud(cloudRef.value,tags.value.map(t=>t.name),{radius:Math.min(220,window.innerWidth*.3),maxSpeed:'slow',initSpeed:'slow',keep:true})}},100)})</script>
<style scoped>.tag-3d-wrap{max-width:600px;margin:0 auto}.tag-3d-cloud{width:100%;height:500px;cursor:grab}.tag-3d-cloud:active{cursor:grabbing}.tag-simple{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;padding:20px 24px 80px;max-width:800px;margin:0 auto}.tag-simple .tag-pill{text-decoration:none;padding:8px 18px;border-radius:24px;background:var(--color-surface);border:1.5px solid var(--color-border-light);color:var(--color-text-secondary);font-weight:500;transition:all .25s;font-size:.9rem}.tag-simple .tag-pill:hover{border-color:var(--color-accent);color:var(--color-primary);transform:translateY(-2px)}.tag-simple .tag-pill span{font-size:.65em;opacity:.6;margin-left:2px}</style>
