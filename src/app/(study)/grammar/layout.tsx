// Bố cục và metadata SEO cho hệ thống ngữ pháp tiếng Anh CEFR A1 - C1
import type { Metadata } from 'next'
import { SITE_CONFIG } from '@/config/site.config'

export const metadata: Metadata = {
  title: 'Tổng Hợp Ngữ Pháp TOEIC Trọng Tâm & Bài Tập Tự Luyện | LingoSphere',
  description:
    'Tra cứu và luyện tập các chủ điểm ngữ pháp TOEIC then chốt từ cơ bản đến nâng cao (thì động từ, câu điều kiện, mệnh đề quan hệ, dạng giả định) kèm giải thích chi tiết.',
  alternates: {
    canonical: `${SITE_CONFIG.url}/grammar`,
  },
  openGraph: {
    title: 'Tổng Hợp Ngữ Pháp TOEIC Trọng Tâm & Bài Tập Tự Luyện | LingoSphere',
    description:
      'Tra cứu và luyện tập ngữ pháp TOEIC then chốt với bài tập tương tác có giải thích chi tiết.',
    url: `${SITE_CONFIG.url}/grammar`,
  },
}

export default function GrammarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
