// Quản lý Query Key tập trung cho module khóa học trong frontend-web.
export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (params?: Record<string, unknown>) => [...courseKeys.lists(), params ?? {}] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
  bestsellers: (category?: string) => [...courseKeys.all, 'bestsellers', category ?? 'all'] as const,
  enrollments: () => [...courseKeys.all, 'enrollments'] as const,
}
