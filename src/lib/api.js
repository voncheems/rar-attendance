import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// Attach token on every request if present
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('rar_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Global error normaliser
api.interceptors.response.use(
  r => r,
  err => {
    const msg = err.response?.data?.message || err.message || 'Request failed'
    return Promise.reject(new Error(msg))
  }
)

export default api