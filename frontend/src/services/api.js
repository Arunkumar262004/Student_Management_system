import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})


api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.includes('/auth/')

    if (error.response?.status === 401 && !isAuthRoute) {
      // Only clear session and redirect if it's a protected route
      // (e.g. token expired), NOT during login/register attempts
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default api

// ── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:    (data) => api.post('/auth/login',    data),
  register: (data) => api.post('/auth/register', data),
  me:       ()     => api.get('/auth/me'),
}

// ── Students ─────────────────────────────────────────────────────────────────
export const studentsAPI = {
  getAll:       (params)   => api.get('/students',          { params }),
  getOne:       (id)       => api.get(`/students/${id}`),
  create:       (data)     => api.post('/students',         data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:       (id, data) => api.put(`/students/${id}`,    data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:       (id)       => api.delete(`/students/${id}`),
  getClasses:   ()         => api.get('/students/classes'),
  getDashboard: ()         => api.get('/students/dashboard'),
  exportExcel:  ()         => api.get('/students/export',   { responseType: 'blob' }),
  importExcel:  (file)     => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/students/import', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
}

// ── Audit Logs ───────────────────────────────────────────────────────────────
export const auditAPI = {
  getAll: (params) => api.get('/audit-logs', { params }),
}