<template>
  <div class="swiper-wrap">
    <div class="section-header" data-aos="fade-down" style="text-align:center;margin-bottom:24px">
      <div class="section-label">Editor's Picks</div>
      <h2 class="section-title">精选推荐</h2>
    </div>
    <Swiper :modules="modules" :slides-per-view="1.2" :space-between="20" :loop="loopSlides.length >= 3"
      :speed="550" :grab-cursor="true" :autoplay="{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }"
      :pagination="{ clickable: true, dynamicBullets: true }"
      :breakpoints="{ '640': { slidesPerView: 1.5, spaceBetween: 20 }, '768': { slidesPerView: 2, spaceBetween: 24 }, '1024': { slidesPerView: 3, spaceBetween: 28 } }"
      style="padding-bottom:48px">
      <SwiperSlide v-for="p in loopSlides" :key="p._key">
        <router-link :to="'/post/' + p.slug" class="feat-slide">
          <div class="feat-slide-rank">{{ p.rank }}</div>
          <h4>{{ p.title }}</h4>
          <p>{{ p.summary }}</p>
          <div class="feat-slide-meta">
            <span><i class="bi bi-person"></i> {{ p.author_name }}</span>
            <span><i class="bi bi-eye"></i> {{ p.view_count }} 阅读</span>
          </div>
        </router-link>
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

const props = defineProps({ featured: Array })
const modules = [Autoplay, Pagination]
const loopSlides = computed(() => {
  const list = props.featured || []
  if (!list.length) return []
  const dup = []
  for (let i = 0; i < 6; i++) dup.push({ ...list[i % list.length], _key: `${list[i % list.length].id}-${i}` })
  return dup
})
</script>

<style scoped>
.swiper-wrap { padding: 16px 0 40px; max-width: 1050px; margin: 0 auto }
.feat-slide {
  display: flex; flex-direction: column; gap: 12px; padding: 28px 24px;
  border-radius: var(--radius-lg); background: var(--color-surface);
  border: 1.5px solid var(--color-border-light); text-decoration: none;
  min-height: 210px; transition: all 0.35s cubic-bezier(0.22, 0.61, 0.36, 1);
  box-shadow: var(--shadow-sm);
}
.feat-slide:hover { box-shadow: 0 20px 60px rgba(139,115,85,0.15); border-color: var(--color-accent); transform: translateY(-4px) }
.feat-slide-rank { font-size: 3.5rem; font-weight: 900; line-height: 1; background: linear-gradient(135deg, var(--color-accent), var(--color-primary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; opacity: 0.45 }
.feat-slide h4 { font-size: 1rem; font-weight: 700; color: var(--color-text); margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden }
.feat-slide p { font-size: 0.82rem; color: var(--color-text-muted); margin: 0; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden }
.feat-slide-meta { display: flex; gap: 14px; font-size: 0.76rem; color: var(--color-text-muted); margin-top: auto; padding-top: 10px; border-top: 1px solid var(--color-border-light) }
:deep(.swiper-pagination-bullet) { width: 8px; height: 8px; background: var(--color-accent); opacity: 0.25; transition: all 0.3s }
:deep(.swiper-pagination-bullet-active) { opacity: 1; width: 22px; border-radius: 4px }
</style>
