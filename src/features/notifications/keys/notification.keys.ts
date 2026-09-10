// Định nghĩa danh mục Query Key tập trung cho module thông báo.
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  mine: (params?: { is_read?: boolean; category?: string }) =>
    [...notificationKeys.all, 'mine', params ?? {}] as const,
}
