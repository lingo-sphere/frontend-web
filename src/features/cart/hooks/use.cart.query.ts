// Custom hook quản lý truy vấn và đột biến dữ liệu giỏ hàng với Optimistic Update bằng TanStack Query.
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cartService } from '@/features/cart/services/cart.service'
import { cartKeys } from '@/features/cart/keys/cart.keys'
import type { Cart } from '@/features/cart/types/cart'

export function useCartQuery(enabled = true) {
  return useQuery<Cart>({
    queryKey: cartKeys.mine(),
    queryFn: () => cartService.getCart(),
    enabled,
    staleTime: 60 * 1000,
  })
}

export function useAddToCartMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseId: string) => cartService.addToCart(courseId),
    onMutate: async (courseId: string) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.mine() })
      const previousCart = queryClient.getQueryData<Cart>(cartKeys.mine())
      if (previousCart) {
        const alreadyIn = previousCart.items.some((i) => i.course_id === courseId)
        if (!alreadyIn) {
          queryClient.setQueryData<Cart>(cartKeys.mine(), {
            ...previousCart,
            items: [
              ...previousCart.items,
              { course_id: courseId, title: '', price: 0 },
            ],
            total_items: previousCart.total_items + 1,
          })
        }
      }
      return { previousCart }
    },
    onError: (_err, _courseId, context) => {
      if (context?.previousCart !== undefined) {
        queryClient.setQueryData(cartKeys.mine(), context.previousCart)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all })
    },
  })
}

export function useRemoveFromCartMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseId: string) => cartService.removeFromCart(courseId),
    onMutate: async (courseId: string) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.mine() })
      const previousCart = queryClient.getQueryData<Cart>(cartKeys.mine())
      if (previousCart) {
        const filtered = previousCart.items.filter((i) => i.course_id !== courseId)
        const removedItem = previousCart.items.find((i) => i.course_id === courseId)
        const price = removedItem
          ? (removedItem.discount_price && removedItem.discount_price > 0
              ? removedItem.discount_price
              : removedItem.price)
          : 0
        queryClient.setQueryData<Cart>(cartKeys.mine(), {
          ...previousCart,
          items: filtered,
          total_items: filtered.length,
          total_amount: Math.max(0, previousCart.total_amount - price),
        })
      }
      return { previousCart }
    },
    onError: (_err, _courseId, context) => {
      if (context?.previousCart !== undefined) {
        queryClient.setQueryData(cartKeys.mine(), context.previousCart)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all })
    },
  })
}

export function useClearCartMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: cartKeys.mine() })
      const previousCart = queryClient.getQueryData<Cart>(cartKeys.mine())
      if (previousCart) {
        queryClient.setQueryData<Cart>(cartKeys.mine(), {
          ...previousCart,
          items: [],
          total_items: 0,
          total_amount: 0,
        })
      }
      return { previousCart }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCart !== undefined) {
        queryClient.setQueryData(cartKeys.mine(), context.previousCart)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all })
    },
  })
}
