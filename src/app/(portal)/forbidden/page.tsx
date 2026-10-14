// Trang điều hướng /forbidden hiển thị thông báo 403 không có quyền truy cập.
'use client'

import { AppResult } from '@/components/status/app.result'

export default function ForbiddenRoutePage() {
  return (
    <main className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-16">
      <AppResult
        status="403"
        title="403"
        subTitle="Xin lỗi, bạn không có quyền truy cập vào trang hoặc tài nguyên này. (Sorry, you are not authorized to access this page.)"
        backUrl="/home"
        backText="Về Trang Chủ (Back Home)"
      />
    </main>
  )
}
