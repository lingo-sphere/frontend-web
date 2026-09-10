/**
 * @file wishlist.ts
 * @description Định nghĩa kiểu dữ liệu TypeScript cho hệ thống giao diện Web
 */

export interface WishlistItem {
  course_id: string
  title: string
  thumbnail_url?: string
  instructor_name?: string
  price: number
  discount_price?: number
  category?: string
  level?: string
  added_at?: string
}

export interface Wishlist {
  user_id: string
  items: WishlistItem[]
  total_items: number
}
