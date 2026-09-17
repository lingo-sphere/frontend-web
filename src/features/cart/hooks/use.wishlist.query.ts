// Custom hook quản lý truy vấn và đột biến danh sách yêu thích bằng TanStack Query v5 với Optimistic Update.
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { wishlistService } from '@/features/cart/services/wishlist.service'
import { wishlistKeys } from '@/features/cart/keys/wishlist.keys'
import type { Wishlist, WishlistItem } from '@/features/cart/types/wishlist'
import type { CourseCardData } from '@/features/courses/types/course'

export const mapWishlistItemToCourseCard = (item: WishlistItem): CourseCardData => ({
  id: item.course_id,
  title: item.title,
  thumbnail: item.thumbnail_url || '',
  instructor: item.instructor_name || 'LingoSphere Academic Team',
  price: item.price,
  discountPrice: item.discount_price,
  category: item.category || 'TOEIC_2_SKILLS',
  description: '',
  duration: '10 giờ',
  totalLessons: 0,
  chapters: 0,
  students: 0,
  rating: 4.8,
  ratingCount: 0,
})

export function useWishlistQuery(enabled = true) {
  return useQuery<Wishlist>({
    queryKey: wishlistKeys.mine(),
    queryFn: () => wishlistService.getWishlist(),
    enabled,
    staleTime: 60 * 1000,
  })
}

export function useToggleWishlistMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseId: string) => wishlistService.toggleWishlist(courseId),
    onMutate: async (courseId: string) => {
      await queryClient.cancelQueries({ queryKey: wishlistKeys.mine() })
      const previousWishlist = queryClient.getQueryData<Wishlist>(wishlistKeys.mine())
      if (previousWishlist) {
        const exists = previousWishlist.items.some((i) => i.course_id === courseId)
        const updatedItems = exists
          ? previousWishlist.items.filter((i) => i.course_id !== courseId)
          : [...previousWishlist.items, { course_id: courseId, title: '', price: 0 }]
        queryClient.setQueryData<Wishlist>(wishlistKeys.mine(), {
          ...previousWishlist,
          items: updatedItems,
          total_items: updatedItems.length,
        })
      }
      return { previousWishlist }
    },
    onError: (_err, _courseId, context) => {
      if (context?.previousWishlist !== undefined) {
        queryClient.setQueryData(wishlistKeys.mine(), context.previousWishlist)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all })
    },
  })
}

export function useRemoveWishlistMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseId: string) => wishlistService.removeFromWishlist(courseId),
    onMutate: async (courseId: string) => {
      await queryClient.cancelQueries({ queryKey: wishlistKeys.mine() })
      const previousWishlist = queryClient.getQueryData<Wishlist>(wishlistKeys.mine())
      if (previousWishlist) {
        const updatedItems = previousWishlist.items.filter((i) => i.course_id !== courseId)
        queryClient.setQueryData<Wishlist>(wishlistKeys.mine(), {
          ...previousWishlist,
          items: updatedItems,
          total_items: updatedItems.length,
        })
      }
      return { previousWishlist }
    },
    onError: (_err, _courseId, context) => {
      if (context?.previousWishlist !== undefined) {
        queryClient.setQueryData(wishlistKeys.mine(), context.previousWishlist)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all })
    },
  })
}

export function useWishlist(enabled = true) {
  const query = useWishlistQuery(enabled)
  const toggleMutation = useToggleWishlistMutation()
  const removeMutation = useRemoveWishlistMutation()

  const wishlist = query.data ?? null
  const items = wishlist?.items ?? []
  const courseCards = items.map(mapWishlistItemToCourseCard)
  const totalItems = wishlist?.total_items ?? items.length

  const isInWishlist = (courseId: string) => items.some((i) => i.course_id === courseId)

  return {
    ...query,
    wishlist,
    items,
    courseCards,
    totalItems,
    isInWishlist,
    toggleWishlist: toggleMutation.mutateAsync,
    removeFromWishlist: removeMutation.mutateAsync,
    isToggling: toggleMutation.isPending,
    isRemoving: removeMutation.isPending,
  }
}
