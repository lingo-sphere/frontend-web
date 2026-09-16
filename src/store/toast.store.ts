// Quản lý thông báo Toast dạng pub-sub phản ứng không phụ thuộc thư viện ngoài
'use client'

import { useSyncExternalStore } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
}

interface ToastState {
  toasts: ToastItem[]
  addToast: (toast: Omit<ToastItem, 'id'>) => string
  removeToast: (id: string) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
}

const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

const addToast = (item: Omit<ToastItem, 'id'>): string => {
  const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  const duration = item.duration ?? 4000
  state = { ...state, toasts: [...state.toasts, { ...item, id }] }
  notifyListeners()

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }
  return id
}

const removeToast = (id: string): void => {
  state = { ...state, toasts: state.toasts.filter((t) => t.id !== id) }
  notifyListeners()
}

const success = (message: string, title?: string): void => {
  addToast({ type: 'success', title, message })
}

const error = (message: string, title?: string): void => {
  addToast({ type: 'error', title, message })
}

const warning = (message: string, title?: string): void => {
  addToast({ type: 'warning', title, message })
}

const info = (message: string, title?: string): void => {
  addToast({ type: 'info', title, message })
}

let state: ToastState = {
  toasts: [],
  addToast,
  removeToast,
  success,
  error,
  warning,
  info,
}

export const toastStore = {
  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  getState: (): ToastState => state,
  getInitialState: (): ToastState => state,
}

export function useToastStore(): ToastState
export function useToastStore<T>(selector: (state: ToastState) => T): T
export function useToastStore<T>(selector?: (state: ToastState) => T): T | ToastState {
  return useSyncExternalStore(
    toastStore.subscribe,
    () => (selector ? selector(state) : state),
    () => (selector ? selector(state) : state),
  )
}

export const toast = {
  success,
  error,
  warning,
  info,
}
