// Quản lý Query Key tập trung cho module danh sách yêu thích trong frontend-web.
export const wishlistKeys = {
  all: ['wishlist'] as const,
  mine: () => [...wishlistKeys.all, 'mine'] as const,
}
