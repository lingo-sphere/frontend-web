/**
 * @file cart.store.ts
 * @description Mã nguồn thành phần cart-store.ts
 */

import { create } from 'zustand'
import { cartService } from '@/services/cart.service'
import type { Cart, CartItem } from '@/types/cart'

interface CartState {
  cart: Cart | null
  isLoading: boolean
  fetchCart: () => Promise<void>
  addToCart: (courseId: string) => Promise<{ success: boolean; message?: string }>
  removeFromCart: (courseId: string) => Promise<void>
  clearCart: () => Promise<void>
  isInCart: (courseId: string) => boolean
  getItems: () => CartItem[]
  getTotalAmount: () => number
  getTotalItems: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,

  fetchCart: async () => {
    if (get().isLoading) return
    set({ isLoading: true })
    try {
      const res = await cartService.getCart()
      set({ cart: res, isLoading: false })
    } catch {
      set({ cart: null, isLoading: false })
    }
  },

  addToCart: async (courseId: string) => {
    set({ isLoading: true })
    try {
      const res = await cartService.addToCart(courseId)
      set({ cart: res })
      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể thêm vào giỏ hàng'
      return { success: false, message }
    } finally {
      set({ isLoading: false })
    }
  },

  removeFromCart: async (courseId: string) => {
    set({ isLoading: true })
    try {
      const res = await cartService.removeFromCart(courseId)
      set({ cart: res })
    } catch {
      const current = get().cart
      if (current) {
        const filtered = current.items.filter((i) => i.course_id !== courseId)
        set({
          cart: {
            ...current,
            items: filtered,
            total_items: filtered.length,
            total_amount: filtered.reduce(
              (acc, it) => acc + (it.discount_price && it.discount_price > 0 ? it.discount_price : it.price),
              0
            ),
          },
        })
      }
    } finally {
      set({ isLoading: false })
    }
  },

  clearCart: async () => {
    set({ isLoading: true })
    try {
      const res = await cartService.clearCart()
      set({ cart: res })
    } catch {
      set({ cart: null })
    } finally {
      set({ isLoading: false })
    }
  },

  isInCart: (courseId: string) => {
    const current = get().cart
    if (!current || !Array.isArray(current.items)) return false
    return current.items.some((i) => i.course_id === courseId)
  },

  getItems: () => {
    return get().cart?.items || []
  },

  getTotalAmount: () => {
    return get().cart?.total_amount || 0
  },

  getTotalItems: () => {
    return get().cart?.total_items || get().cart?.items?.length || 0
  },
}))
