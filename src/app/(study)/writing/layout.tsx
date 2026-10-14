// Bố cục và metadata SEO cho phòng luyện viết tiếng Anh và TOEIC Writing có chấm điểm AI
import type { Metadata } from 'next'
import { SITE_CONFIG } from '@/config/site.config'

export const metadata: Metadata = {
  title: 'Luyện Viết Tiếng Anh & TOEIC Writing Có Chấm Điểm AI | LingoSphere',
  description:
    'Rèn luyện kỹ năng viết câu, viết thư tín thương mại và bài luận tiếng Anh với phản hồi ngữ pháp chi tiết từ AI.',
  alternates: {
    canonical: `${SITE_CONFIG.url}/writing`,
  },
}

export default function WritingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
