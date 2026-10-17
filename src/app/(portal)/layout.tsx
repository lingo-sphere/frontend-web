// Bố cục không gian cá nhân của học viên với cờ noindex ngăn công cụ tìm kiếm lập chỉ mục dữ liệu riêng tư
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
