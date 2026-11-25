// Hook React Query truy vấn danh sách thẻ ưu đãi giảm giá của học viên
import { useQuery } from '@tanstack/react-query'
import { voucherService } from '@/features/vouchers/services/voucher.service'

export function useMyVouchers(enabled = true) {
  return useQuery({
    queryKey: ['vouchers', 'my'],
    queryFn: () => voucherService.getMyVouchers(),
    enabled,
    staleTime: 60 * 1000,
  })
}
