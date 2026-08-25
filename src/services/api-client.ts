import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { API_CONFIG } from '@/config/api.config'
import type { ApiResponse } from '@/types/api.types'

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN)
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      if (config.headers && !config.headers['x-correlation-id']) {
        config.headers['x-correlation-id'] = `trace_web_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError<{ message?: string | string[]; error?: string; statusCode?: number }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {

        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN)
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const res = await axios.post<ApiResponse<{ access_token: string; refresh_token?: string }>>(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN}`,
          { refresh_token: refreshToken },
        )

        const payload = (res.data as ApiResponse<{ access_token: string; refresh_token?: string }>)?.data || (res.data as unknown as { access_token: string; refresh_token?: string })
        const newAccessToken = payload?.access_token
        const newRefreshToken = payload?.refresh_token

        if (newAccessToken) {

          localStorage.setItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, newAccessToken)
          if (newRefreshToken) {
            localStorage.setItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken)
          }

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          }

          processQueue(null, newAccessToken)

          return apiClient(originalRequest)
        } else {
          throw new Error('Invalid token response structure')
        }
      } catch (refreshErr) {

        processQueue(refreshErr, null)
        console.warn('Phiên đăng nhập học viên đã hết hạn. Đang đăng xuất...', refreshErr)

        if (typeof window !== 'undefined') {
          localStorage.removeItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN)
          localStorage.removeItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN)
          localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER)
          window.dispatchEvent(new CustomEvent('lingosphere:unauthorized'))
        }
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Đã xảy ra lỗi khi kết nối tới máy chủ'

    return Promise.reject(new Error(Array.isArray(errorMessage) ? errorMessage.join(', ') : String(errorMessage)))
  },
)

export const api = {
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const res = await apiClient.get<ApiResponse<T> | T>(url, { params })
    return (res.data as ApiResponse<T>)?.data !== undefined ? (res.data as ApiResponse<T>).data : (res.data as T)
  },

  async post<T>(url: string, data?: unknown): Promise<T> {
    const res = await apiClient.post<ApiResponse<T> | T>(url, data)
    return (res.data as ApiResponse<T>)?.data !== undefined ? (res.data as ApiResponse<T>).data : (res.data as T)
  },

  async put<T>(url: string, data?: unknown): Promise<T> {
    const res = await apiClient.put<ApiResponse<T> | T>(url, data)
    return (res.data as ApiResponse<T>)?.data !== undefined ? (res.data as ApiResponse<T>).data : (res.data as T)
  },

  async patch<T>(url: string, data?: unknown): Promise<T> {
    const res = await apiClient.patch<ApiResponse<T> | T>(url, data)
    return (res.data as ApiResponse<T>)?.data !== undefined ? (res.data as ApiResponse<T>).data : (res.data as T)
  },

  async delete<T>(url: string): Promise<T> {
    const res = await apiClient.delete<ApiResponse<T> | T>(url)
    return (res.data as ApiResponse<T>)?.data !== undefined ? (res.data as ApiResponse<T>).data : (res.data as T)
  },

  async upload<T>(url: string, file: File | Blob, additionalData?: Record<string, string>): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)
    if (additionalData) {
      Object.entries(additionalData).forEach(([k, v]) => formData.append(k, v))
    }
    const res = await apiClient.post<ApiResponse<T> | T>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return (res.data as ApiResponse<T>)?.data !== undefined ? (res.data as ApiResponse<T>).data : (res.data as T)
  },
}
