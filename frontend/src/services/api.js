import axios from 'axios'
import { handleMockRequest } from './mockApi'

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
const AUTH_PATHS = ['/auth/login/', '/auth/refresh/', '/auth/signup/']

const axiosApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

axiosApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

axiosApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const requestUrl = originalRequest?.url || ''
    const isAuthRequest = AUTH_PATHS.some((path) => requestUrl.includes(path))

    if (isAuthRequest) return Promise.reject(error)

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          return Promise.reject(error)
        }
        const res = await axios.post(`${API_URL}/auth/refresh/`, { refresh: refreshToken })
        localStorage.setItem('access_token', res.data.access)
        if (res.data.refresh) localStorage.setItem('refresh_token', res.data.refresh)
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`
        return axiosApi(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.assign('/login')
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

function normalizeUrl(url) {
  return (url || '').replace(API_URL, '').replace(/^\//, '')
}

const api = {
  get(url, config) {
    if (!USE_MOCK) return axiosApi.get(url, config)
    const path = normalizeUrl(url)
    return handleMockRequest('GET', path, config?.params)
  },
  post(url, data, config) {
    if (!USE_MOCK) return axiosApi.post(url, data, config)
    const path = normalizeUrl(url)
    return handleMockRequest('POST', path, data)
  },
  put(url, data, config) {
    if (!USE_MOCK) return axiosApi.put(url, data, config)
    const path = normalizeUrl(url)
    return handleMockRequest('PUT', path, data)
  },
  patch(url, data, config) {
    if (!USE_MOCK) return axiosApi.patch(url, data, config)
    const path = normalizeUrl(url)
    return handleMockRequest('PATCH', path, data)
  },
  delete(url, config) {
    if (!USE_MOCK) return axiosApi.delete(url, config)
    const path = normalizeUrl(url)
    return handleMockRequest('DELETE', path)
  },
}

export default api
