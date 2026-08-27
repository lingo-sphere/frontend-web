import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { API_CONFIG } from '@/config/api.config'
import type { ApiResponse } from '@/types/api.types'

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true,
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
        const res = await axios.post<ApiResponse<{ access_token: string }>>(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN}`,
          {},
          {
            withCredentials: true,
          },
        )

        const responseData = res.data as unknown as { data?: { access_token?: string }; access_token?: string }
        const newAccessToken = responseData?.data?.access_token ? responseData.data.access_token : responseData?.access_token

        if (newAccessToken) {
          localStorage.setItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, newAccessToken)

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
          localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER)
          window.dispatchEvent(new CustomEvent('lingosphere:unauthorized'))
        }
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    let errorMessage: string | string[] = 'Đã xảy ra lỗi khi kết nối tới máy chủ'
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error
    } else if (error.message) {
      errorMessage = error.message
    }

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
