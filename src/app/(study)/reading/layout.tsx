// Bố cục và metadata SEO cho phòng luyện đọc hiểu TOEIC Part 5, 6, 7
import type { Metadata } from 'next'
import { SITE_CONFIG } from '@/config/site.config'

export const metadata: Metadata = {
  title: 'Luyện Kỹ Năng Đọc Hiểu TOEIC Part 5, 6, 7 Chuyên Sâu | LingoSphere',
  description:
    'Chiến thuật xử lý nhanh bài đọc TOEIC Reading, mẹo tránh bẫy ngữ pháp Part 5 và phương pháp đọc quét từ khóa Part 7 hiệu quả.',
  alternates: {
    canonical: `${SITE_CONFIG.url}/reading`,
  },
}

export default function ReadingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
