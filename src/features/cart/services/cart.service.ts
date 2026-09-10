/**
 * @file cart.service.ts
 * @description Service xử lý các logic nghiệp vụ chính cho dịch vụ cart
 */

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import type { Cart } from '@/features/cart/types/cart'

export const cartService = {
  async getCart(): Promise<Cart> {
    return api.get<Cart>(API_CONFIG.ENDPOINTS.CART.GET)
  },

  async addToCart(courseId: string): Promise<Cart> {
    return api.post<Cart>(API_CONFIG.ENDPOINTS.CART.ADD, { course_id: courseId })
  },

  async removeFromCart(courseId: string): Promise<Cart> {
    return api.delete<Cart>(API_CONFIG.ENDPOINTS.CART.REMOVE(courseId))
  },

  async clearCart(): Promise<Cart> {
    return api.delete<Cart>(API_CONFIG.ENDPOINTS.CART.CLEAR)
  },
}
