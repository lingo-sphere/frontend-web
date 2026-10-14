// Bố cục và metadata tối ưu SEO cho chuyên mục Blog & Cẩm nang luyện thi TOEIC LingoSphere
import type { Metadata } from 'next'
import { SITE_CONFIG } from '@/config/site.config'

export const metadata: Metadata = {
  title: 'Cẩm Nang & Lộ Trình Tự Học TOEIC Từ A - Z | LingoSphere Blog',
  description:
    'Kho kiến thức luyện thi TOEIC chuyên sâu: mẹo giải đề Part 1 - 7, phương pháp học 3000 từ vựng Spaced Repetition SRS, lộ trình lấy lại gốc tiếng Anh và kinh nghiệm bứt phá 650 - 850+.',
  alternates: {
    canonical: `${SITE_CONFIG.url}/blog`,
  },
  openGraph: {
    title: 'Cẩm Nang & Lộ Trình Tự Học TOEIC Từ A - Z | LingoSphere Blog',
    description:
      'Kho kiến thức luyện thi TOEIC chuyên sâu: mẹo giải đề Part 1 - 7, phương pháp học 3000 từ vựng SRS và lộ trình bứt phá điểm số.',
    url: `${SITE_CONFIG.url}/blog`,
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
