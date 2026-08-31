import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CourseCardData } from '@/types/course'

interface WishlistState {
  items: CourseCardData[]
  addItem: (course: CourseCardData) => void
  removeItem: (courseId: string) => void
  toggleItem: (course: CourseCardData) => void
  isInWishlist: (courseId: string) => boolean
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (course) => {
        if (!get().isInWishlist(course.id)) {
          set((state) => ({ items: [...state.items, course] }))
        }
      },

      removeItem: (courseId) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== courseId) }))
      },

      toggleItem: (course) => {
        if (get().isInWishlist(course.id)) {
          get().removeItem(course.id)
        } else {
          get().addItem(course)
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
