// Service xử lý API lấy danh sách và xác thực thẻ ưu đãi của học viên
import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import type { UserVoucher, ValidateVoucherResponse } from '@/features/vouchers/types/voucher'

export const voucherService = {
  async getMyVouchers(): Promise<UserVoucher[]> {
    return api.get<UserVoucher[]>(API_CONFIG.ENDPOINTS.VOUCHERS.MY)
  },

  async validateVoucher(
    voucherCode: string,
    orderType: 'COURSE' | 'SUBSCRIPTION',
    amount: number
  ): Promise<ValidateVoucherResponse> {
    return api.post<ValidateVoucherResponse>(API_CONFIG.ENDPOINTS.VOUCHERS.VALIDATE, {
      voucher_code: voucherCode,
      order_type: orderType,
      amount,
    })
  },
}
