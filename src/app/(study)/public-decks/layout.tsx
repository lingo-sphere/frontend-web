// Bố cục và metadata SEO cho thư viện bộ thẻ flashcard từ vựng cộng đồng
import type { Metadata } from 'next'
import { SITE_CONFIG } from '@/config/site.config'

export const metadata: Metadata = {
  title: 'Thư Viện Flashcard Từ Vựng TOEIC Cộng Đồng | LingoSphere',
  description:
    'Khám phá hàng trăm bộ flashcard từ vựng tiếng Anh và luyện thi TOEIC được chia sẻ bởi cộng đồng học viên LingoSphere.',
  alternates: {
    canonical: `${SITE_CONFIG.url}/public-decks`,
  },
}

export default function PublicDecksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
