// Bố cục và metadata tối ưu hóa công cụ tìm kiếm cho danh mục khóa học LingoSphere
import type { Metadata } from 'next'
import { SITE_CONFIG } from '@/config/site.config'

export const metadata: Metadata = {
  title: 'Khóa Học TOEIC Online Chuẩn Quốc Tế Cấp Tốc | LingoSphere',
  description:
    'Danh mục khóa học luyện thi TOEIC 450, 650, 850+ bám sát cấu trúc ETS với video bài giảng HLS, đề thi mô phỏng và gia sư AI đồng hành.',
  alternates: {
    canonical: `${SITE_CONFIG.url}/courses`,
  },
  openGraph: {
    title: 'Khóa Học TOEIC Online Chuẩn Quốc Tế Cấp Tốc | LingoSphere',
    description:
      'Luyện thi TOEIC hiệu quả cùng LingoSphere. Khóa học bám sát ETS, thuật toán Spaced Repetition SRS và gia sư AI.',
    url: `${SITE_CONFIG.url}/courses`,
  },
}

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
