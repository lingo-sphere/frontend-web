// Bố cục và metadata SEO cho bảng ký hiệu phiên âm quốc tế IPA và luyện phát âm
import type { Metadata } from 'next'
import { SITE_CONFIG } from '@/config/site.config'

export const metadata: Metadata = {
  title: 'Bảng Phiên Âm Quốc Tế IPA & Luyện Phát Âm Tiếng Anh Chuẩn | LingoSphere',
  description:
    'Học chuẩn 44 âm trong bảng phiên âm quốc tế IPA với âm thanh mẫu khẩu hình miệng, so sánh cặp âm dễ nhầm lẫn và công nghệ nhận diện giọng nói Whisper AI.',
  alternates: {
    canonical: `${SITE_CONFIG.url}/ipa`,
  },
  openGraph: {
    title: 'Bảng Phiên Âm Quốc Tế IPA & Luyện Phát Âm Tiếng Anh Chuẩn | LingoSphere',
    description:
      'Học chuẩn 44 âm IPA với âm thanh mẫu và nhận diện giọng nói Whisper AI.',
    url: `${SITE_CONFIG.url}/ipa`,
  },
}

export default function IpaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
