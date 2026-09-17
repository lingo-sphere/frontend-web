// Trang thông báo 404 Không tìm thấy trang sử dụng Ant Design Result cho học viên LingoSphere.
'use client'

import { AppResult } from '@/components/status/app.result'

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-16">
      <AppResult
        status="404"
        title="404"
        subTitle="Xin lỗi, trang bạn truy cập không tồn tại hoặc đã được chuyển đi. (Sorry, the page you visited does not exist.)"
        backUrl="/home"
        backText="Về Trang Chủ (Back Home)"
      />
    </main>
  )
}
