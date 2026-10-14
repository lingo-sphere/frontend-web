// Tiện ích dùng chung định dạng tiền tệ, số, thời gian tương đối, ngày tháng và thông điệp lỗi tự động theo ngôn ngữ hiện hành
import i18n from '@/i18n/i18n.config'

function isCurrentLanguageVi(): boolean {
  return (i18n.language || 'vi').toLowerCase().startsWith('vi')
}

export function formatCurrency(amount?: number | null, fallback?: string): string {
  const isVi = isCurrentLanguageVi()
  const defaultFallback = isVi ? '0 ₫' : '0 VND'
  const finalFallback = fallback !== undefined ? fallback : defaultFallback

  if (amount === undefined || amount === null) return finalFallback
  if (amount <= 0 && fallback !== undefined && fallback !== defaultFallback) return fallback
  return isVi ? `${amount.toLocaleString('vi-VN')} ₫` : `${amount.toLocaleString('en-US')} VND`
}

export function formatNumber(value?: number | null): string {
  if (value === undefined || value === null) return '0'
  return value.toLocaleString(isCurrentLanguageVi() ? 'vi-VN' : 'en-US')
}

export function formatRelativeTime(dateInput: string | Date, isVietnamese = isCurrentLanguageVi()): string {
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
  isVietnamese = isCurrentLanguageVi(),
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

export function formatDateTime(dateInput: string | Date, isVietnamese = isCurrentLanguageVi()): string {
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

export function getErrorMessage(error: unknown, fallback?: string): string {
  const isVi = isCurrentLanguageVi()
  const defaultFallback = isVi ? 'Đã có lỗi xảy ra' : 'An error occurred'
  const finalFallback = fallback !== undefined ? fallback : defaultFallback

  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'string' && error.trim()) return error
  return finalFallback
}
