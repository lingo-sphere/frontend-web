/**
 * @file api.client.ts
 * @description Service API client kết nối backend cho api-client
 */

import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { API_CONFIG } from '@/config/api.config'
import type { ApiResponse } from '@/types/api.types'
import type { ZodType } from 'zod'

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

    if (error.response?.status === 401 && originalRequest) {
      const rawMsg = error.response.data?.message
      const errorMsg = Array.isArray(rawMsg) ? rawMsg.join(', ') : (rawMsg || '')
      const isKickout = errorMsg.includes('thiết bị khác') || errorMsg.includes('đăng nhập trên một thiết bị')

      const isAuthEndpoint =
        originalRequest.url?.includes(API_CONFIG.ENDPOINTS.AUTH.LOGIN) ||
        originalRequest.url?.includes(API_CONFIG.ENDPOINTS.AUTH.REGISTER) ||
        originalRequest.url?.includes(API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL_OTP) ||
        originalRequest.url?.includes(API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL_TOKEN) ||
        originalRequest.url?.includes(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD) ||
        originalRequest.url?.includes(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD) ||
        originalRequest.url?.includes(API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN)

      if (isKickout) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN)
          localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER)
          window.dispatchEvent(new CustomEvent('lingosphere:session_terminated', { detail: { message: errorMsg } }))
        }
        return Promise.reject(new Error(errorMsg || 'Phiên đăng nhập đã bị đăng xuất từ thiết bị khác'))
      }

      if (isAuthEndpoint) {
        return Promise.reject(new Error(errorMsg || 'Thông tin xác thực không chính xác'))
      }

      if (!originalRequest._retry) {
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
  }

    let rawError = error.response?.data?.message || error.response?.data?.error || error.response?.data || error.message
    const rawStr = Array.isArray(rawError) ? rawError.join(', ') : String(rawError || '')

    let cleanMessage = rawStr
    if (
      !cleanMessage ||
      cleanMessage.includes('ECONNREFUSED') ||
      cleanMessage.includes('is unavailable') ||
      cleanMessage.includes('Network Error') ||
      cleanMessage.includes('Failed to fetch') ||
      cleanMessage.includes('ENOTFOUND')
    ) {
      cleanMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại dịch vụ hoặc kết nối mạng.'
    } else if (cleanMessage.includes('timeout') || cleanMessage.includes('ETIMEDOUT')) {
      cleanMessage = 'Yêu cầu xử lý quá thời gian quy định. Vui lòng thử lại.'
    } else if (cleanMessage.includes('Internal server error') || cleanMessage.includes('Internal Server Error')) {
      cleanMessage = 'Hệ thống đang bận hoặc xảy ra sự cố khi xử lý dữ liệu. Vui lòng thử lại sau.'
    } else if (cleanMessage.includes('<!DOCTYPE') || cleanMessage.includes('<html')) {
      cleanMessage = 'Dịch vụ tạm thời không phản hồi. Vui lòng thử lại sau ít phút.'
    } else if (cleanMessage.includes('Request failed with status code 401')) {
      cleanMessage = 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!'
    } else if (cleanMessage.includes('Request failed with status code 403')) {
      cleanMessage = 'Bạn không có quyền thực hiện thao tác này.'
    } else if (cleanMessage.includes('Request failed with status code 404')) {
      cleanMessage = 'Không tìm thấy dữ liệu yêu cầu.'
    }

    return Promise.reject(new Error(cleanMessage))
  },
)

function parseWithSchema<T>(data: unknown, schema?: ZodType<T>, endpoint = ''): T {
  if (!schema) return data as T
  let parsed = schema.safeParse(data)
  if (!parsed.success && data === '') {
    parsed = schema.safeParse(null)
  }
  if (!parsed.success) {
    const errorDetails = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
      .join('; ')
    console.error(`[ZodValidationError] Endpoint ${endpoint}: ${errorDetails}`, parsed.error.issues)
    throw new Error(`Dữ liệu từ máy chủ không đúng định dạng (${endpoint}): ${errorDetails}`)
  }
  return parsed.data
}

export const api = {
  async get<T>(url: string, params?: Record<string, unknown>, schema?: ZodType<T>): Promise<T> {
    const res = await apiClient.get<ApiResponse<T> | T>(url, { params })
    const raw = (res.data as ApiResponse<T>)?.data !== undefined ? (res.data as ApiResponse<T>).data : (res.data as T)
    return parseWithSchema<T>(raw, schema, url)
  },

  async post<T>(url: string, data?: unknown, schema?: ZodType<T>): Promise<T> {
    const res = await apiClient.post<ApiResponse<T> | T>(url, data)
    const raw = (res.data as ApiResponse<T>)?.data !== undefined ? (res.data as ApiResponse<T>).data : (res.data as T)
    return parseWithSchema<T>(raw, schema, url)
  },

  async put<T>(url: string, data?: unknown, schema?: ZodType<T>): Promise<T> {
    const res = await apiClient.put<ApiResponse<T> | T>(url, data)
    const raw = (res.data as ApiResponse<T>)?.data !== undefined ? (res.data as ApiResponse<T>).data : (res.data as T)
    return parseWithSchema<T>(raw, schema, url)
  },

  async patch<T>(url: string, data?: unknown, schema?: ZodType<T>): Promise<T> {
    const res = await apiClient.patch<ApiResponse<T> | T>(url, data)
    const raw = (res.data as ApiResponse<T>)?.data !== undefined ? (res.data as ApiResponse<T>).data : (res.data as T)
    return parseWithSchema<T>(raw, schema, url)
  },

  async delete<T>(url: string, schema?: ZodType<T>): Promise<T> {
    const res = await apiClient.delete<ApiResponse<T> | T>(url)
    const raw = (res.data as ApiResponse<T>)?.data !== undefined ? (res.data as ApiResponse<T>).data : (res.data as T)
    return parseWithSchema<T>(raw, schema, url)
  },

  async upload<T>(
    url: string,
    file: File | Blob,
    additionalData?: Record<string, string>,
    onProgress?: (percent: number, loaded: number, total: number) => void,
    schema?: ZodType<T>
  ): Promise<T> {
    const formData = new FormData()
    const fileName = file instanceof File ? file.name : 'audio_recording.webm'
    formData.append('file', file, fileName)
    if (additionalData) {
      Object.entries(additionalData).forEach(([k, v]) => formData.append(k, v))
    }
    const fileSize = file instanceof File ? file.size : file.size || 0
    const res = await apiClient.post<ApiResponse<T> | T>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const loaded = progressEvent.loaded
        const total = progressEvent.total || fileSize
        if (total > 0) {
          const percent = Math.min(99, Math.round((loaded * 100) / total))
          onProgress?.(percent, loaded, total)
        }
      },
    })
    onProgress?.(100, fileSize, fileSize)
    const raw = (res.data as ApiResponse<T>)?.data !== undefined ? (res.data as ApiResponse<T>).data : (res.data as T)
    return parseWithSchema<T>(raw, schema, url)
  },
}
