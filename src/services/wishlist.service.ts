import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'
import type { Wishlist } from '@/types/wishlist'

export const wishlistService = {
  async getWishlist(): Promise<Wishlist> {
    return api.get<Wishlist>(API_CONFIG.ENDPOINTS.WISHLIST.GET)
  },

  async addToWishlist(courseId: string): Promise<Wishlist> {
    return api.post<Wishlist>(API_CONFIG.ENDPOINTS.WISHLIST.ADD, { course_id: courseId })
  },

  async removeFromWishlist(courseId: string): Promise<Wishlist> {
    return api.delete<Wishlist>(API_CONFIG.ENDPOINTS.WISHLIST.REMOVE(courseId))
  },

  async toggleWishlist(courseId: string): Promise<{ is_wishlisted: boolean; wishlist: Wishlist }> {
    return api.post<{ is_wishlisted: boolean; wishlist: Wishlist }>(API_CONFIG.ENDPOINTS.WISHLIST.TOGGLE(courseId))
  },
}
