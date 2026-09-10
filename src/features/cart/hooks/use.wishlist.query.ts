// Custom hook quản lý truy vấn và đột biến danh sách yêu thích với Optimistic Update bằng TanStack Query.
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { wishlistService } from '@/features/cart/services/wishlist.service'
import { wishlistKeys } from '@/features/cart/keys/wishlist.keys'
import type { Wishlist } from '@/features/cart/types/wishlist'

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
