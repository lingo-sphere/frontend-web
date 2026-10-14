// Bố cục và metadata SEO cho phòng luyện nói tiếng Anh tương tác với Whisper AI
import type { Metadata } from 'next'
import { SITE_CONFIG } from '@/config/site.config'

export const metadata: Metadata = {
  title: 'Luyện Nói Tiếng Anh & TOEIC Speaking Với Whisper AI | LingoSphere',
  description:
    'Luyện phản xạ nói tiếng Anh và phát âm chuẩn xác với công nghệ nhận diện giọng nói Whisper AI và gia sư thông minh.',
  alternates: {
    canonical: `${SITE_CONFIG.url}/speaking`,
  },
}

export default function SpeakingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
