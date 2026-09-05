/**
 * @file toast.store.ts
 * @description Store quản lý thông báo Toast cho frontend-web
 */

'use client'

import { useSyncExternalStore } from 'react'
import { createStore } from 'zustand/vanilla'

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

export const toastStore = createStore<ToastState>()((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const duration = toast.duration ?? 4000

    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }))

    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id)
      }, duration)
    }

    return id
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },

  success: (message, title) => {
    get().addToast({ type: 'success', title, message })
  },

  error: (message, title) => {
    get().addToast({ type: 'error', title, message })
  },

  warning: (message, title) => {
    get().addToast({ type: 'warning', title, message })
  },

  info: (message, title) => {
    get().addToast({ type: 'info', title, message })
  },
}))

export function useToastStore<T>(selector: (state: ToastState) => T): T {
  return useSyncExternalStore(
    toastStore.subscribe,
    () => selector(toastStore.getState()),
    () => selector(toastStore.getInitialState()),
  )
}

export const toast = {
  success: (msg: string, title?: string) => toastStore.getState().success(msg, title),
  error: (msg: string, title?: string) => toastStore.getState().error(msg, title),
  warning: (msg: string, title?: string) => toastStore.getState().warning(msg, title),
  info: (msg: string, title?: string) => toastStore.getState().info(msg, title),
}
