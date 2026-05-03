<template>
<div>
  <div class="page-hero" style="background:linear-gradient(135deg,#f5f0e8 0%,#e8e0d5 50%,#f0e6d8 100%)">
    <div class="section-label">Timeline</div>
    <h2 style="font-size:1.8rem;font-weight:700;margin:0">文章归档</h2>
    <p style="color:var(--color-text-muted);font-size:0.88rem;margin:8px 0 0">按时间浏览所有文章</p>
  </div>
  <div class="timeline" v-if="archive.length">
    <div v-for="group in archive" :key="group.key" class="tl-group" data-aos="fade-up">
      <div class="tl-year">{{group.year}} 年 {{group.month}} 月</div>
      <div class="tl-items">
        <router-link v-for="p in group.posts" :key="p.id" :to="'/post/'+p.slug" class="tl-item">
          <div class="tl-dot"></div>
          <div class="tl-content"><span class="tl-date">{{formatDay(p.created_at)}}</span><h4>{{p.title}}</h4><div class="tl-meta"><span><i class="bi bi-eye"></i>{{p.view_count}}</span></div></div>
        </router-link>
      </div>
    </div>
  </div>
  <div v-else class="empty-state" style="padding:80px 0"><div class="empty-state-icon"><i class="bi bi-inbox"></i></div><p>暂无文章</p></div>
</div>
</template>
<script setup>import {ref,onMounted} from 'vue';import {postAPI} from '@/api';const archive=ref([]);onMounted(async()=>{try{const res=await postAPI.getArchive({});const arch=res.data.archive||[];for(const item of arch){const d=await postAPI.getArchive({year:item.year,month:item.month});const ps=d.data.posts||[];if(ps.length)archive.value.push({key:`${item.year}-${item.month}`,year:item.year,month:item.month,posts:ps})}}catch(_){}});function formatDay(d){return d?new Date(d).getDate()+'日':''}</script>
<style scoped>.timeline{max-width:680px;margin:0 auto;padding:0 24px 80px}.tl-group{margin-bottom:40px}.tl-year{font-size:1.1rem;font-weight:700;color:var(--color-text);margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid var(--color-border);display:flex;align-items:center;gap:8px}.tl-items{position:relative;padding-left:24px}.tl-items::before{content:'';position:absolute;left:5px;top:0;bottom:0;width:2px;background:var(--color-border-light)}.tl-item{position:relative;display:flex;align-items:flex-start;gap:16px;padding:10px 0;text-decoration:none;border-radius:8px;transition:background .2s}.tl-item:hover{background:#faf8f5}.tl-dot{position:absolute;left:-19px;top:16px;width:10px;height:10px;border-radius:50%;background:var(--color-accent);border:2px solid #fff;box-shadow:0 0 0 2px var(--color-accent-light)}.tl-content{flex:1}.tl-date{font-size:.74rem;color:var(--color-text-muted);margin-bottom:2px;display:inline-block}.tl-content h4{font-size:.92rem;font-weight:600;color:var(--color-text);margin:0 0 4px;line-height:1.4}.tl-meta{font-size:.74rem;color:var(--color-text-muted)}.tl-meta i{margin-right:2px}</style>
