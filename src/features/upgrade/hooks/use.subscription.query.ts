// Hook TanStack Query truy vấn danh sách gói cước nâng cấp tài khoản VIP.

import { useQuery } from '@tanstack/react-query'
import { subscriptionService } from '@/features/upgrade/services/subscription.service'
import type { SubscriptionPlanDto } from '@/features/upgrade/schemas/subscription.schema'

export const subscriptionKeys = {
  all: ['subscription'] as const,
  plans: () => [...subscriptionKeys.all, 'plans'] as const,
}

export function useSubscriptionPlansQuery() {
  return useQuery<SubscriptionPlanDto[]>({
    queryKey: subscriptionKeys.plans(),
    queryFn: () => subscriptionService.getPlans(),
    staleTime: 10 * 60 * 1000,
  })
}
