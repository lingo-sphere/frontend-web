// Tiện ích dùng chung định dạng tiền tệ, số, thời gian tương đối, ngày tháng và thông điệp lỗi
export function formatCurrency(amount?: number | null, fallback = '0 ₫'): string {
  if (amount === undefined || amount === null) return fallback
  if (amount <= 0 && fallback !== '0 ₫') return fallback
  return `${amount.toLocaleString('vi-VN')} ₫`
}

export function formatNumber(value?: number | null): string {
  if (value === undefined || value === null) return '0'
  return value.toLocaleString('vi-VN')
}

export function formatRelativeTime(dateInput: string | Date, isVietnamese = true): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return isVietnamese ? 'Vừa xong' : 'Just now'
  if (diffMins < 60) return isVietnamese ? `${diffMins}m trước` : `${diffMins}m ago`
  if (diffHours < 24) return isVietnamese ? `${diffHours}h trước` : `${diffHours}h ago`
  if (diffDays < 7) return isVietnamese ? `${diffDays}d trước` : `${diffDays}d ago`
  return date.toLocaleDateString(isVietnamese ? 'vi-VN' : 'en-US')
}

export function formatDate(
  dateInput: string | Date,
  isVietnamese = true,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  return date.toLocaleDateString(
    isVietnamese ? 'vi-VN' : 'en-US',
    options || {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }
  )
}

export function formatDateTime(dateInput: string | Date, isVietnamese = true): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  const time = date.toLocaleTimeString(isVietnamese ? 'vi-VN' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const d = formatDate(date, isVietnamese)
  return `${time} · ${d}`
}

export function truncateText(text: string, maxLength = 120): string {
  if (!text || text.length <= maxLength) return text || ''
  return text.slice(0, maxLength) + '...'
}

export function getErrorMessage(error: unknown, fallback = 'Đã có lỗi xảy ra'): string {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'string' && error.trim()) return error
  return fallback
}
