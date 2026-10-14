// Bố cục và metadata tối ưu hóa SEO cho trung tâm luyện thi đề TOEIC trực tuyến
import type { Metadata } from 'next'
import { SITE_CONFIG } from '@/config/site.config'

export const metadata: Metadata = {
  title: 'Thi Thử TOEIC Online Có Đáp Án & Giải Thích Chi Tiết | LingoSphere',
  description:
    'Luyện đề thi TOEIC trực tuyến chuẩn format ETS mới nhất. Đầy đủ 7 Part Listening & Reading, chấm điểm tự động và phân tích điểm yếu tức thì.',
  alternates: {
    canonical: `${SITE_CONFIG.url}/toeic`,
  },
  openGraph: {
    title: 'Thi Thử TOEIC Online Có Đáp Án & Giải Thích Chi Tiết | LingoSphere',
    description:
      'Ngân hàng đề thi TOEIC ETS mô phỏng thực tế với audio chuẩn, bấm giờ tự động và báo cáo năng lực chi tiết.',
    url: `${SITE_CONFIG.url}/toeic`,
  },
}

export default function ToeicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
