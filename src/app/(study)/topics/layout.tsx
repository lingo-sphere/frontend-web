// Bố cục và metadata SEO cho chuyên trang các chủ đề từ vựng tiếng Anh thông dụng
import type { Metadata } from 'next'
import { SITE_CONFIG } from '@/config/site.config'

export const metadata: Metadata = {
  title: 'Chủ Đề Từ Vựng Tiếng Anh & TOEIC Thông Dụng | LingoSphere',
  description:
    'Khám phá danh sách các chủ đề từ vựng tiếng Anh và luyện thi TOEIC thực chiến: kinh doanh, đàm phán, nhân sự, tài chính, du lịch và công nghệ.',
  alternates: {
    canonical: `${SITE_CONFIG.url}/topics`,
  },
  openGraph: {
    title: 'Chủ Đề Từ Vựng Tiếng Anh & TOEIC Thông Dụng | LingoSphere',
    description:
      'Danh sách các chủ đề từ vựng tiếng Anh và luyện thi TOEIC thực chiến.',
    url: `${SITE_CONFIG.url}/topics`,
  },
}

export default function TopicsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
