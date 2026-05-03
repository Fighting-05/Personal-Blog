<template>
  <aside>
    <div class="sidebar-card">
      <div class="sidebar-card-title"><i class="bi bi-folder"></i> 分类</div>
      <router-link
        v-for="cat in categories" :key="cat.id"
        :to="{ path: '/', query: { category: cat.slug } }"
        class="sidebar-link"
      >
        {{ cat.name }}
        <span class="sidebar-badge">{{ cat.post_count }}</span>
      </router-link>
    </div>

    <div class="sidebar-card">
      <div class="sidebar-card-title"><i class="bi bi-fire"></i> 热门文章</div>
      <router-link
        v-for="post in hotPosts" :key="post.id"
        :to="'/post/' + post.slug"
        class="sidebar-link"
      >
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ post.title }}</span>
        <span class="sidebar-badge">{{ post.view_count }}</span>
      </router-link>
    </div>

    <div class="sidebar-card">
      <div class="sidebar-card-title"><i class="bi bi-tags"></i> 标签</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        <router-link
          v-for="tag in tags" :key="tag.id"
          :to="{ path: '/', query: { tag: tag.slug } }"
          class="tag-pill"
        >
          {{ tag.name }} ({{ tag.post_count }})
        </router-link>
      </div>
    </div>

    <div class="sidebar-card">
      <div class="sidebar-card-title"><i class="bi bi-archive"></i> 归档</div>
      <router-link
        v-for="item in archive" :key="item.year + item.month"
        :to="{ path: '/archive', query: { year: item.year, month: item.month } }"
        class="sidebar-link"
      >
        {{ item.year }}年{{ item.month }}月
        <span class="sidebar-badge">{{ item.count }}</span>
      </router-link>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { postAPI } from '@/api'

const categories = ref([])
const hotPosts = ref([])
const tags = ref([])
const archive = ref([])

async function fetchSidebar() {
  try {
    const [catRes, hotRes, tagRes, archRes] = await Promise.all([
      postAPI.getCategories(),
      postAPI.getHotPosts(5),
      postAPI.getTags(),
      postAPI.getArchive()
    ])
    categories.value = catRes.data
    hotPosts.value = hotRes.data
    tags.value = tagRes.data
    archive.value = archRes.data.archive || []
  } catch (e) { /* ignore */ }
}

onMounted(fetchSidebar)
</script>
