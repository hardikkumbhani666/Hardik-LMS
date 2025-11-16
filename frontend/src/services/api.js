import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  refreshToken: (data) => api.post('/auth/refresh', data),
  getMe: () => api.get('/auth/me'),
}

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getBalance: () => api.get('/users/balance'),
  updateBalance: (userId, data) => api.put(`/users/${userId}/balance`, data),
  getUsers: (params) => api.get('/users', { params }),
}

// Leave APIs
export const leaveAPI = {
  create: (data) => {
    // Check if data is FormData
    if (data instanceof FormData) {
      return api.post('/leaves', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    }
    return api.post('/leaves', data)
  },
  getAll: (params) => api.get('/leaves', { params }),
  getOne: (id) => api.get(`/leaves/${id}`),
  update: (id, data) => api.put(`/leaves/${id}`, data),
  cancel: (id) => api.delete(`/leaves/${id}`),
  approve: (id, data) => api.post(`/leaves/${id}/approve`, data),
  reject: (id, data) => api.post(`/leaves/${id}/reject`, data),
  override: (id, data) => api.put(`/leaves/${id}/override`, data),
  bulkApprove: (data) => api.post('/leaves/bulk-approve', data),
}

// Report APIs
export const reportAPI = {
  getSummary: (params) => api.get('/reports/summary', { params }),
  exportCSV: (params) => api.get('/reports/export/csv', { params, responseType: 'blob' }),
  exportPDF: (params) => api.get('/reports/export/pdf', { params, responseType: 'blob' }),
  getAuditLogs: (params) => api.get('/audit', { params }),
}

export default api

