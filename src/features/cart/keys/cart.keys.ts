// Quản lý Query Key tập trung cho module giỏ hàng trong frontend-web.
export const cartKeys = {
  all: ['cart'] as const,
  mine: () => [...cartKeys.all, 'mine'] as const,
}
