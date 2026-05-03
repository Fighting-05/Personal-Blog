import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/post/:slug',
    name: 'Post',
    component: () => import('@/views/Post.vue')
  },
  {
    path: '/archive',
    name: 'Archive',
    component: () => import('@/views/Timeline.vue')
  },
  {
    path: '/tags',
    redirect: '/categories'
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('@/views/CategoriesPage.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', name: 'Dashboard', component: () => import('@/views/admin/Dashboard.vue') },
      { path: 'posts', name: 'AdminPosts', component: () => import('@/views/admin/Posts.vue') },
      { path: 'posts/new', name: 'NewPost', component: () => import('@/views/admin/PostEditor.vue') },
      { path: 'posts/edit/:id', name: 'EditPost', component: () => import('@/views/admin/PostEditor.vue') },
      { path: 'comments', name: 'AdminComments', component: () => import('@/views/admin/Comments.vue') },
      { path: 'categories', name: 'AdminCategories', component: () => import('@/views/admin/Categories.vue') },
      { path: 'users', name: 'AdminUsers', component: () => import('@/views/admin/Users.vue') }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('user')
  const user = token ? JSON.parse(token) : null

  // 路由切换进度条
  const bar = document.getElementById('nprogress-bar')
  if (bar && to.path !== from.path) {
    bar.style.transition = 'none'
    bar.style.width = '0'
    requestAnimationFrame(() => {
      bar.style.transition = 'width 0.4s ease'
      bar.style.width = '60%'
    })
  }

  if (to.meta.requiresAuth && !user) {
    next('/login')
  } else if (to.meta.requiresAdmin && user?.role !== 'admin') {
    next('/')
  } else {
    next()
  }
})

router.afterEach(() => {
  const bar = document.getElementById('nprogress-bar')
  if (bar) {
    bar.style.width = '100%'
    setTimeout(() => { bar.style.width = '0'; bar.style.transition = 'none' }, 300)
  }
})

export default router
