// Component hiển thị thông báo trạng thái 403, 404, 500 sử dụng Ant Design Result cho toàn bộ web.
'use client'

import React from 'react'
import { Result, Button } from 'antd'
import Link from 'next/link'

export interface AppResultProps {
  status: '403' | '404' | '500' | 'error' | 'warning'
  title?: React.ReactNode
  subTitle?: React.ReactNode
  backUrl?: string
  backText?: string
  onBack?: () => void
  extra?: React.ReactNode
}

export function AppResult({
  status,
  title,
  subTitle,
  backUrl = '/home',
  backText = 'Về Trang Chủ (Back Home)',
  onBack,
  extra,
}: AppResultProps) {
  const defaultTitle =
    status === '403' ? '403' : status === '404' ? '404' : status === '500' ? '500' : 'Thông báo'

  const defaultSubTitle =
    status === '403'
      ? 'Xin lỗi, bạn không có quyền truy cập vào nội dung này.'
      : status === '404'
        ? 'Xin lỗi, nội dung bạn tìm kiếm không tồn tại hoặc đã được chuyển đi.'
        : status === '500'
          ? 'Đã xảy ra sự cố trong quá trình xử lý yêu cầu.'
          : undefined

  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center p-4">
      <Result
        status={status}
        title={title || defaultTitle}
        subTitle={subTitle || defaultSubTitle}
        extra={
          extra || (
            onBack ? (
              <Button type="primary" size="large" className="font-semibold" onClick={onBack}>
                {backText}
              </Button>
            ) : (
              <Link href={backUrl}>
                <Button type="primary" size="large" className="font-semibold">
                  {backText}
                </Button>
              </Link>
            )
          )
        }
      />
    </div>
  )
}
