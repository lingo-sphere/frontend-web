// Bố cục các trang xác thực tài khoản học viên ngăn chặn index vào kết quả tìm kiếm
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
