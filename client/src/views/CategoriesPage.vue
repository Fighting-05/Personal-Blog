<template>
<div>
  <div class="page-hero" style="background:linear-gradient(135deg,#eaf4ea 0%,#dce8dc 50%,#e8f0e4 100%)">
    <div class="section-label">Categories</div>
    <h2 style="font-size:1.8rem;font-weight:700;margin:0">分类浏览</h2>
    <p style="color:var(--color-text-muted);font-size:0.88rem;margin:8px 0 0">按主题探索内容</p>
  </div>
  <div class="cat-grid">
    <router-link v-for="(c,i) in categories" :key="c.id" :to="{path:'/',query:{category:c.slug}}" class="cat-card" :data-aos="'fade-up'" :data-aos-delay="i*80">
      <div class="cat-icon"><i :class="catIcons[c.slug]||'bi bi-folder'"></i></div>
      <div class="cat-info"><h3>{{c.name}}</h3><p>{{c.description}}</p><span class="cat-count">{{c.post_count}} 篇文章</span></div>
      <div class="cat-arrow"><i class="bi bi-chevron-right"></i></div>
    </router-link>
  </div>
</div>
</template>
<script setup>import {ref,onMounted} from 'vue';import {postAPI} from '@/api';const categories=ref([]);const catIcons={tech:'bi bi-code-slash',frontend:'bi bi-window-stack',backend:'bi bi-server',ai:'bi bi-cpu',life:'bi bi-cup-hot',project:'bi bi-rocket-takeoff',reading:'bi bi-book',design:'bi bi-palette'};onMounted(async()=>{try{categories.value=(await postAPI.getCategories()).data}catch(_){}})</script>
<style scoped>.cat-grid{max-width:780px;margin:0 auto;padding:0 24px 80px;display:flex;flex-direction:column;gap:12px}.cat-card{display:flex;align-items:center;gap:20px;padding:24px 28px;border-radius:var(--radius-lg);background:var(--color-surface);border:1.5px solid var(--color-border-light);text-decoration:none;transition:all .3s ease;position:relative;overflow:hidden}.cat-card:hover{box-shadow:var(--shadow-lg);border-color:var(--color-accent);transform:translateX(6px)}.cat-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(to bottom,var(--color-accent),var(--color-primary));opacity:0;transition:opacity .3s}.cat-card:hover::before{opacity:1}.cat-icon{width:52px;height:52px;border-radius:14px;flex-shrink:0;background:#faf7f2;display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:var(--color-accent)}.cat-info{flex:1}.cat-info h3{font-size:1.05rem;font-weight:700;color:var(--color-text);margin:0 0 4px}.cat-info p{font-size:.82rem;color:var(--color-text-muted);margin:0 0 6px}.cat-count{font-size:.78rem;color:var(--color-accent);font-weight:600}.cat-arrow{color:var(--color-text-muted);font-size:.9rem;transition:transform .3s}.cat-card:hover .cat-arrow{transform:translateX(4px);color:var(--color-accent)}</style>
