// Định nghĩa kiểu dữ liệu cho thẻ ưu đãi giảm giá của học viên
export type VoucherStatus = 'AVAILABLE' | 'USED' | 'EXPIRED'
export type VoucherSource = 'REGISTRATION' | 'STREAK' | 'ADMIN'

export interface UserVoucher {
  _id: string
  user_id: string
  code: string
  title: string
  description: string
  discount_percent: number
  status: VoucherStatus
  applicable_to: string[]
  source: VoucherSource
  milestone_streak?: number
  expires_at: string
  used_at?: string
  used_in_order_code?: string
  created_at: string
  updated_at: string
}

export interface ValidateVoucherResponse {
  voucher: UserVoucher
  discountAmount: number
  finalAmount: number
}
