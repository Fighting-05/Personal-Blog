import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data)
}

export const postAPI = {
  getPosts: (params) => api.get('/posts', { params }),
  getPost: (slug) => api.get(`/posts/${slug}`),
  getStats: () => api.get('/posts/stats'),
  createPost: (data) => api.post('/posts', data),
  updatePost: (id, data) => api.put(`/posts/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`),
  togglePin: (id) => api.post(`/posts/${id}/toggle-pin`),
  likePost: (postId) => api.post('/posts/like', { postId }),
  getHotPosts: (limit) => api.get('/posts/hot', { params: { limit } }),
  getArchive: (params) => api.get('/posts/archive', { params }),
  getTags: () => api.get('/posts/tags'),
  getCategories: () => api.get('/posts/categories'),
  createComment: (data) => api.post('/posts/comments', data),
  deleteComment: (id) => api.delete(`/posts/comments/${id}`),
  likeComment: (id) => api.post(`/posts/comments/${id}/like`),
  uploadImage: (data) => api.post('/tools/upload-image', data, { headers: { 'Content-Type': 'multipart/form-data' } })
}

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getPosts: (params) => api.get('/admin/posts', { params }),
  getComments: (params) => api.get('/admin/comments', { params }),
  deleteComment: (id) => api.delete(`/admin/comments/${id}`),
  getUsers: (params) => api.get('/admin/users', { params }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  batchPosts: (data) => api.post('/tools/posts/batch', data),
  exportPosts: (format) => api.get('/tools/posts', { params: { format }, responseType: format === 'markdown' ? 'blob' : 'json' })
}

export const subscribeAPI = {
  subscribe: (email) => api.post('/subscribe', { email }),
  count: () => api.get('/subscribe/count')
}

export default api
