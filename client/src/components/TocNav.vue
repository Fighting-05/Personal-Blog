<template>
  <nav v-if="headings.length > 0" class="toc-nav">
    <div class="toc-title">目录</div>
    <ul class="toc-list">
      <li v-for="h in headings" :key="h.id" :style="{ paddingLeft: (h.level - 1) * 16 + 'px' }">
        <a :href="'#' + h.id" :class="{ active: activeId === h.id }" @click.prevent="scrollTo(h.id)">
          {{ h.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({ contentSelector: { type: String, default: '.article-content' } })
const headings = ref([])
const activeId = ref('')

function extractHeadings() {
  const container = document.querySelector(props.contentSelector)
  if (!container) return
  const hs = container.querySelectorAll('h2, h3')
  headings.value = Array.from(hs).map((h, i) => {
    const id = 'heading-' + i
    h.id = id
    return { id, text: h.textContent, level: parseInt(h.tagName[1]) }
  })
}

let observer = null

function setupObserver() {
  const hs = document.querySelectorAll('.article-content h2[id], .article-content h3[id]')
  if (hs.length === 0) return
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          activeId.value = e.target.id
          break
        }
      }
    },
    { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
  )
  hs.forEach(h => observer.observe(h))
}

function scrollTo(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  activeId.value = id
}

onMounted(async () => {
  await nextTick()
  extractHeadings()
  setupObserver()
})

onUnmounted(() => observer?.disconnect())
</script>

<style scoped>
.toc-nav {
  position: sticky;
  top: 100px;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  padding-right: 8px;
}
.toc-title {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin-bottom: 12px;
}
.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.toc-list li {
  margin-bottom: 4px;
}
.toc-list a {
  display: block;
  font-size: 0.82rem;
  color: var(--color-text-muted);
  text-decoration: none;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  border-left: 2px solid transparent;
  line-height: 1.4;
}
.toc-list a:hover {
  color: var(--color-text);
  background: var(--color-border-light);
}
.toc-list a.active {
  color: var(--color-primary);
  border-left-color: var(--color-accent);
  background: rgba(201, 169, 110, 0.08);
  font-weight: 600;
}
</style>
