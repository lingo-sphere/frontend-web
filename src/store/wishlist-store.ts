import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { wishlistService } from '@/services/wishlist.service'
import type { CourseCardData } from '@/types/course'
import type { WishlistItem } from '@/types/wishlist'

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
  toggleItem: (course: CourseCardData) => Promise<void>
  isInWishlist: (courseId: string) => boolean
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      fetchWishlist: async () => {
        set({ isLoading: true })
        try {
          const res = await wishlistService.getWishlist()
          if (res && Array.isArray(res.items)) {
            const mapped = res.items.map(mapWishlistItemToCourseCard)
            set({ items: mapped })
          }
        } catch {
        } finally {
          set({ isLoading: false })
        }
      },

      addItem: async (course) => {
        if (!get().isInWishlist(course.id)) {
          set((state) => ({ items: [...state.items, course] }))
        }
        try {
          const res = await wishlistService.addToWishlist(course.id)
          if (res && Array.isArray(res.items)) {
            set({ items: res.items.map(mapWishlistItemToCourseCard) })
          }
        } catch {
        }
      },

      removeItem: async (courseId) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== courseId) }))
        try {
          const res = await wishlistService.removeFromWishlist(courseId)
          if (res && Array.isArray(res.items)) {
            set({ items: res.items.map(mapWishlistItemToCourseCard) })
          }
        } catch {
        }
      },

      toggleItem: async (course) => {
        const isCurrentlyIn = get().isInWishlist(course.id)
        if (isCurrentlyIn) {
          set((state) => ({ items: state.items.filter((i) => i.id !== course.id) }))
        } else {
          set((state) => ({ items: [...state.items, course] }))
        }

        try {
          const res = await wishlistService.toggleWishlist(course.id)
          if (res?.wishlist && Array.isArray(res.wishlist.items)) {
            set({ items: res.wishlist.items.map(mapWishlistItemToCourseCard) })
          }
        } catch {
        }
      },

      isInWishlist: (courseId) => {
        return get().items.some((i) => i.id === courseId)
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'lingosphere-user-wishlist',
    }
  )
)
