import type { Metadata } from 'next'
import { GrammarTheoryPage } from '@/features/vocabulary/components/grammar.theory.page'

export const metadata: Metadata = {
  title: 'Tra cứu cấu trúc ngữ pháp',
  description: 'Học cấu trúc ngữ pháp qua sơ đồ, công thức, ví dụ song ngữ và tự kiểm tra trí nhớ.',
  alternates: { canonical: './' },
}

export default async function GrammarHandbookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <GrammarTheoryPage slug={slug} />
}
