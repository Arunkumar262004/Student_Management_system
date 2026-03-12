import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config, response } = error
    const isAuthRoute = config?.url?.includes('/auth/')

    if (response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default api

export const authAPI = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me:       ()     => api.get('/auth/me'),
}

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } }

// Students API for get data 
export const studentsAPI = {
  getAll:       (params)   => api.get('/students', { params }),
  getOne:       (id)       => api.get(`/students/${id}`),
  create:       (data)     => api.post('/students', data, multipart),
  update:       (id, data) => api.put(`/students/${id}`, data, multipart),
  delete:       (id)       => api.delete(`/students/${id}`),
  getClasses:   ()         => api.get('/students/classes'),
  getDashboard: ()         => api.get('/students/dashboard'),
  exportExcel:  ()         => api.get('/students/export', { responseType: 'blob' }),
  importExcel: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/students/import', form, multipart)
  },
}

// this is for log APi
export const auditAPI = {
  getAll: (params) => api.get('/audit-logs', { params }),
}