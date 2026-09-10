// Store Zustand quản lý trạng thái giỏ hàng đồng bộ với TanStack Query.
import { create } from 'zustand'
import { cartService } from '@/features/cart/services/cart.service'
import { getQueryClient } from '@/config/query.config'
import { cartKeys } from '@/features/cart/keys/cart.keys'
import type { Cart, CartItem } from '@/features/cart/types/cart'

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
      getQueryClient().setQueryData(cartKeys.mine(), res)
    } catch {
      set({ cart: null, isLoading: false })
    }
  },

  addToCart: async (courseId: string) => {
    set({ isLoading: true })
    try {
      const res = await cartService.addToCart(courseId)
      set({ cart: res })
      getQueryClient().setQueryData(cartKeys.mine(), res)
      getQueryClient().invalidateQueries({ queryKey: cartKeys.all })
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
      getQueryClient().setQueryData(cartKeys.mine(), res)
      getQueryClient().invalidateQueries({ queryKey: cartKeys.all })
    } catch {
      const current = get().cart
      if (current) {
        const filtered = current.items.filter((i) => i.course_id !== courseId)
        const updated = {
          ...current,
          items: filtered,
          total_items: filtered.length,
          total_amount: filtered.reduce(
            (acc, it) => acc + (it.discount_price && it.discount_price > 0 ? it.discount_price : it.price),
            0
          ),
        }
        set({ cart: updated })
        getQueryClient().setQueryData(cartKeys.mine(), updated)
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
      getQueryClient().setQueryData(cartKeys.mine(), res)
      getQueryClient().invalidateQueries({ queryKey: cartKeys.all })
    } catch {
      set({ cart: null })
      getQueryClient().invalidateQueries({ queryKey: cartKeys.all })
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
