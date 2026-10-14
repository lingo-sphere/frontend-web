// Bố cục và metadata SEO cho thư viện từ vựng tiếng Anh và luyện tập Flashcard SRS
import type { Metadata } from 'next'
import { SITE_CONFIG } from '@/config/site.config'

export const metadata: Metadata = {
  title: 'Học 3000 Từ Vựng TOEIC Cốt Lõi Theo Phương Pháp Spaced Repetition | LingoSphere',
  description:
    'Kho từ vựng TOEIC theo chủ đề kinh tế, văn phòng, du lịch. Tích hợp phiên âm IPA, phát âm bản xứ và thuật toán lặp lại ngắt quãng SRS tối ưu trí nhớ dài hạn.',
  alternates: {
    canonical: `${SITE_CONFIG.url}/vocabulary`,
  },
  openGraph: {
    title: 'Học 3000 Từ Vựng TOEIC Cốt Lõi Theo Phương Pháp Spaced Repetition | LingoSphere',
    description:
      'Kho từ vựng TOEIC theo chủ đề tích hợp phiên âm IPA, phát âm bản xứ và thuật toán SRS.',
    url: `${SITE_CONFIG.url}/vocabulary`,
  },
}

export default function VocabularyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
