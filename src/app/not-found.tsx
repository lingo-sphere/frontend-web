/**
 * @file not-found.tsx
 * @description Trang giao diện người dùng (Next.js App Router) cho tuyến not-found.tsx
 */

import Link from 'next/link'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/icons/icon-map'

export default function NotFound() {
  return (
    <Layout>
      <main className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-16 text-center">
        <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-inner">
          <Icon name="helpCircle" size={48} />
          <div className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-error text-xs font-bold text-white shadow-md">
            404
          </div>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
          Không Tìm Thấy Trang
        </h1>
        <p className="mt-3 max-w-md text-sm text-text-secondary">
          Đường dẫn bạn truy cập không tồn tại hoặc đã được thay đổi. Hãy kiểm tra lại URL hoặc quay về các khu vực học tập bên dưới.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/home">
            <Button className="gap-2 bg-primary px-5 font-semibold text-white shadow-md hover:bg-primary/90">
              <Icon name="home" size={16} />
              Trang Chủ Dashboard
            </Button>
          </Link>
          <Link href="/courses">
            <Button variant="outline" className="gap-2">
              <Icon name="book" size={16} />
              Khám Phá Khóa Học
            </Button>
          </Link>
          <Link href="/toeic">
            <Button variant="outline" className="gap-2">
              <Icon name="fileText" size={16} />
              Đề Thi TOEIC
            </Button>
          </Link>
        </div>
      </main>
    </Layout>
  )
}
