// Bố cục và metadata SEO cho phòng luyện nghe TOEIC và nghe chép chính tả Dictation
import type { Metadata } from 'next'
import { SITE_CONFIG } from '@/config/site.config'

export const metadata: Metadata = {
  title: 'Luyện Nghe TOEIC & Nghe Chép Chính Tả Dictation | LingoSphere',
  description:
    'Cải thiện kỹ năng nghe phản xạ tiếng Anh và TOEIC Part 1, 2, 3, 4 qua phương pháp nghe chép chính tả Dictation với audio giọng đọc chuẩn bản xứ Anh - Mỹ.',
  alternates: {
    canonical: `${SITE_CONFIG.url}/listening`,
  },
}

export default function ListeningLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
