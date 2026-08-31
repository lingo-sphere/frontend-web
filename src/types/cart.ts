export interface CartItem {
  course_id: string
  title: string
  thumbnail_url?: string
  instructor_name?: string
  price: number
  discount_price?: number
  added_at?: string
}

export interface Cart {
  user_id: string
  items: CartItem[]
  total_amount: number
  total_items: number
}
