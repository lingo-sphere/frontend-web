// Store Zustand quản lý trạng thái danh sách khóa học yêu thích
import { create } from 'zustand'
import { wishlistService } from '@/services/wishlist.service'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import type { CourseCardData } from '@/types/course'
import type { WishlistItem } from '@/types/wishlist'

storage.remove(STORAGE_KEYS.WISHLIST)

const mapWishlistItemToCourseCard = (item: WishlistItem): CourseCardData => ({
  id: item.course_id,
  title: item.title,
  thumbnail: item.thumbnail_url || '',
  instructor: item.instructor_name || 'LingoSphere Academic Team',
  price: item.price,
  discountPrice: item.discount_price,
  category: item.category || 'TOEIC_2_SKILLS',
  level: item.level || 'BEGINNER',
  description: '',
  duration: '10 giờ',
  totalLessons: 0,
  chapters: 0,
  students: 0,
  rating: 4.8,
  ratingCount: 0,
})

interface WishlistState {
  items: CourseCardData[]
  isLoading: boolean
  fetchWishlist: () => Promise<void>
  addItem: (course: CourseCardData) => Promise<void>
  removeItem: (courseId: string) => Promise<void>
  toggleItem: (course: CourseCardData) => Promise<{ success: boolean; isWishlisted?: boolean; message?: string }>
  isInWishlist: (courseId: string) => boolean
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchWishlist: async () => {
    if (get().isLoading) return
    set({ isLoading: true })
    try {
      const res = await wishlistService.getWishlist()
      if (res && Array.isArray(res.items)) {
        const mapped = res.items.map(mapWishlistItemToCourseCard)
        set({ items: mapped, isLoading: false })
      } else {
        set({ items: [], isLoading: false })
      }
    } catch {
      set({ items: [], isLoading: false })
    }
  },

  addItem: async (course) => {
    try {
      const res = await wishlistService.addToWishlist(course.id)
      if (res && Array.isArray(res.items)) {
        set({ items: res.items.map(mapWishlistItemToCourseCard) })
      } else {
        await get().fetchWishlist()
      }
    } catch (err) {
      console.error('Lỗi khi thêm vào danh sách yêu thích:', err)
      throw err
    }
  },

  removeItem: async (courseId) => {
    try {
      const res = await wishlistService.removeFromWishlist(courseId)
      if (res && Array.isArray(res.items)) {
        set({ items: res.items.map(mapWishlistItemToCourseCard) })
      } else {
        await get().fetchWishlist()
      }
    } catch (err) {
      console.error('Lỗi khi xóa khỏi danh sách yêu thích:', err)
      throw err
    }
  },

  toggleItem: async (course) => {
    try {
      const res = await wishlistService.toggleWishlist(course.id)
      if (res?.wishlist && Array.isArray(res.wishlist.items)) {
        const mapped = res.wishlist.items.map(mapWishlistItemToCourseCard)
        set({ items: mapped })
        return { success: true, isWishlisted: res.is_wishlisted }
      }
      await get().fetchWishlist()
      return { success: true, isWishlisted: get().isInWishlist(course.id) }
    } catch (err: unknown) {
      console.error('Lỗi khi chuyển đổi yêu thích:', err)
      const msg = err instanceof Error ? err.message : 'Không thể cập nhật danh sách yêu thích'
      return { success: false, message: msg }
    }
  },

  isInWishlist: (courseId) => {
    return get().items.some((i) => i.id === courseId)
  },

  clearWishlist: () => set({ items: [] }),
}))
