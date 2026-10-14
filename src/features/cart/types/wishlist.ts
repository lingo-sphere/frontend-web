// Định nghĩa kiểu dữ liệu Wishlist cho giao diện Web.

export interface WishlistItem {
  course_id: string
  title: string
  thumbnail_url?: string
  instructor_name?: string
  price: number
  discount_price?: number
  category?: string
  level?: string
  students_count?: number
  added_at?: string
}

export interface Wishlist {
  user_id: string
  items: WishlistItem[]
  total_items: number
}
