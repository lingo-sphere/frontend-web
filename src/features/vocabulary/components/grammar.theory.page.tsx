'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, BookOpen, ChevronDown } from 'lucide-react'
import { Button } from '@/components/button'
import { Badge } from '@/components/badge'
import { useGrammarPointsQuery } from '../hooks/use.vocabulary.query'
import type { BackendGrammarPoint } from '../schemas/vocabulary.schema'
import { grammarCategoryLabel, grammarDescription, grammarFormula, grammarTitle, handbookReturnUrl } from '../lib/grammar-handbook'
import { GrammarDiagram, GrammarPhoto } from './grammar.illustration'
import { GrammarTheoryPractice } from './grammar.theory.practice'
import { useGrammarTheoryPractice } from '../hooks/use.grammar.theory.practice'
import type { ReactNode } from 'react'

type Example = BackendGrammarPoint['examples'][number]

function HighlightedSentence({ example }: { example: Example }) {
  const fragments = (example.highlight || '').split(/\s*(?:\.{3}|…)\s*/).filter(Boolean)
  if (!fragments.length) return <>{example.sentence_en}</>
  const escaped = fragments.map(value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const matches = new RegExp(`(\\b(?:${escaped.join('|')})\\b)`, 'gi')
  return <>{example.sentence_en.split(matches).map((part, index) => index % 2 ? <mark key={index} className="rounded bg-primary-soft px-0.5 font-semibold text-primary-hover dark:text-primary">{part}</mark> : part)}</>
}

function ExampleBlock({ example, vi }: { example: Example; vi: boolean }) {
  return (
    <div className="border-l-2 border-primary/50 pl-4 text-[15px] leading-7">
      <p lang="en" className="text-text-primary"><HighlightedSentence example={example} /></p>
      {example.sentence_vi && <p lang="vi" className="mt-1 text-sm leading-6 text-text-secondary">{example.sentence_vi}</p>}
      {example.explanation && <p className="mt-2 text-sm text-text-secondary">{vi ? 'Giải thích: ' : 'Explanation: '}{example.explanation}</p>}
    </div>
  )
}

const englishFormLabels: Record<string, string> = { AFFIRMATIVE: 'Affirmative (+)', NEGATIVE: 'Negative (−)', INTERROGATIVE: 'Question (?)', WH_QUESTION: 'Wh-question', SPECIAL: 'Special pattern' }

function TheoryReader({ point, vi, practice }: { point: BackendGrammarPoint; vi: boolean; practice: ReactNode }) {
  const description = grammarDescription(point, vi)
  const rule = vi ? point.rule_vi || point.rule_en : point.rule_en || point.rule_vi
  const formulas = point.formula_details
  const pattern = grammarFormula(point)
  const entries = [
    { id: 'overview', label: vi ? 'Khi nào dùng?' : 'When to use it' },
    ...(formulas.length || pattern ? [{ id: 'formulas', label: vi ? 'Công thức' : 'Formulas' }] : []),
    ...(point.examples.length ? [{ id: 'examples', label: vi ? 'Ví dụ' : 'Examples' }] : []),
    ...(point.common_mistakes || point.usage_notes ? [{ id: 'notes', label: vi ? 'Lưu ý & lỗi thường gặp' : 'Notes & common mistakes' }] : []),
    { id: 'practice', label: vi ? 'Bài luyện tương ứng' : 'Matching practice' },
  ]
  const sectionClass = 'scroll-mt-28 rounded-xl border border-border bg-surface p-5 sm:p-6'
  return (
    <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_210px]">
      <nav aria-label={vi ? 'Mục lục cấu trúc' : 'Structure contents'} className="order-first rounded-xl border border-border bg-surface p-5 xl:sticky xl:top-24 xl:order-last">
        <h2 className="mb-3 text-sm font-semibold">{vi ? 'Trong bài này' : 'In this article'}</h2>
        <ol className="grid grid-cols-2 gap-1 xl:grid-cols-1">
          {entries.map((entry, index) => <li key={entry.id} className="min-w-0"><a className="flex min-h-11 items-start gap-2 rounded-lg px-2 py-2 text-sm leading-6 text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary focus-visible:outline-2 focus-visible:outline-primary" href={`#${entry.id}`}><span className="shrink-0 text-xs leading-6 text-text-tertiary" aria-hidden="true">0{index + 1}</span><span className="min-w-0 flex-1 text-balance">{entry.label}</span></a></li>)}
        </ol>
        <p className="mt-3 text-xs leading-5 text-balance text-text-secondary">{vi ? 'Chọn mục để xem nhanh.' : 'Choose a section to read.'}</p>
      </nav>
      <article className="min-w-0 space-y-5 [&_p]:text-pretty">
        <section id="overview" aria-labelledby="overview-heading" className={sectionClass}>
          <h2 id="overview-heading" className="mb-3 text-xl font-semibold">{vi ? 'Khi nào dùng?' : 'When to use it'}</h2>
          {!description && !rule && !pattern && <p className="text-sm leading-6 text-text-secondary">{vi ? "Nội dung giải thích đang được cập nhật. Bạn có thể chọn cấu trúc khác trong thư viện." : "The explanation is being updated. You can choose another structure in the library."}</p>}
          <GrammarDiagram point={point} vi={vi} />
          {rule && <div className="max-w-[68ch]"><h3 className="mb-2 text-sm font-semibold text-text-primary">{vi ? 'Điểm cần nhớ' : 'Remember this'}</h3><p className="text-[15px] leading-7 text-pretty text-text-secondary">{rule}</p></div>}
        </section>

        {(formulas.length > 0 || pattern) && <section id="formulas" aria-labelledby="formulas-heading" className={sectionClass}>
          <h2 id="formulas-heading" className="mb-2 text-xl font-semibold">{vi ? 'Công thức' : 'Formulas'}</h2>
          <p className="mb-5 text-sm leading-6 text-text-secondary">{vi ? 'Học từng dạng một. Mở dạng khác khi bạn đã hiểu ví dụ đầu tiên.' : 'Take one form at a time. Open another after you understand the first example.'}</p>
          {formulas.length ? <div className="space-y-3">{formulas.map((form, index) => <details key={`${form.form_type}-${index}`} open={index === 0} className="group rounded-lg bg-surface-subtle p-4">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-semibold [&::-webkit-details-marker]:hidden"><span>{vi ? form.form_label : englishFormLabels[form.form_type] || 'Additional pattern'}</span><ChevronDown size={18} aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" /></summary>
            <div className="pt-2"><p className="rounded-lg bg-surface p-3 font-mono text-sm leading-7 wrap-anywhere text-text-primary">{form.pattern}</p>{form.explanation && <p className="mt-3 max-w-[68ch] text-sm leading-6 text-text-secondary">{form.explanation}</p>}
              {form.examples[0] && <div className="mt-4"><ExampleBlock example={form.examples[0]} vi={vi} /></div>}
              {form.examples.length > 1 && <details className="mt-4"><summary className="min-h-11 cursor-pointer py-2 text-sm font-medium text-primary-hover dark:text-primary">{vi ? `Xem thêm ${form.examples.length - 1} ví dụ` : `${form.examples.length - 1} more examples`}</summary><div className="mt-3 space-y-5">{form.examples.slice(1).map((example, i) => <ExampleBlock key={i} example={example} vi={vi} />)}</div></details>}
            </div>
          </details>)}</div> : <p className="rounded-lg bg-surface-subtle p-4 font-mono text-sm leading-7 wrap-anywhere">{pattern}</p>}
          <p className="mt-4 text-xs leading-6 text-text-secondary">{vi ? 'Ký hiệu: S = chủ ngữ · V = động từ · O = tân ngữ · Adj = tính từ · N = danh từ.' : 'Key: S = subject · V = verb · O = object · Adj = adjective · N = noun.'}</p>
        </section>}

        {point.examples.length > 0 && <section id="examples" aria-labelledby="examples-heading" className={sectionClass}>
          <h2 id="examples-heading" className="mb-3 text-xl font-semibold">{vi ? 'Ví dụ trong ngữ cảnh' : 'Examples in context'}</h2>
          <p className="mb-5 text-sm leading-6 text-text-secondary">{vi ? 'Đọc câu tiếng Anh trước. Thử giải thích vì sao dùng cấu trúc này, rồi đối chiếu bản dịch.' : 'Read the English sentence first. Explain why this structure is used, then compare the translation.'}</p>
          <div className="space-y-5">{point.examples.slice(0, 2).map((example, index) => <ExampleBlock key={index} example={example} vi={vi} />)}</div>
          {point.examples.length > 2 && <details className="mt-5"><summary className="min-h-11 cursor-pointer py-2 text-sm font-medium text-primary-hover dark:text-primary">{vi ? `Xem thêm ${point.examples.length - 2} ví dụ` : `${point.examples.length - 2} more examples`}</summary><div className="mt-3 space-y-5">{point.examples.slice(2).map((example, index) => <ExampleBlock key={index} example={example} vi={vi} />)}</div></details>}
        </section>}

        {(point.common_mistakes || point.usage_notes) && <section id="notes" aria-labelledby="notes-heading" className={sectionClass}>
          <h2 id="notes-heading" className="mb-4 text-xl font-semibold">{vi ? 'Lưu ý & lỗi thường gặp' : 'Notes & common mistakes'}</h2>
          {point.common_mistakes && <div className="max-w-[68ch]"><h3 className="mb-2 text-sm font-semibold">{vi ? 'Tránh lỗi này' : 'Avoid this mistake'}</h3><p className="text-[15px] leading-7 text-pretty text-text-secondary">{point.common_mistakes}</p></div>}
          {point.usage_notes && <details className="mt-4 border-t border-border pt-3"><summary className="min-h-11 cursor-pointer py-2 text-sm font-medium text-primary-hover dark:text-primary">{vi ? 'Dấu hiệu nhận biết & cách dùng thêm' : 'More usage notes'}</summary><p className="mt-2 max-w-[68ch] text-[15px] leading-7 text-pretty text-text-secondary">{point.usage_notes}</p></details>}
        </section>}

        {practice}
      </article>
    </div>
  )
}

export function GrammarTheoryPage({ slug }: { slug: string }) {
  const { i18n } = useTranslation()
  const vi = i18n.language.startsWith('vi')
  const params = useSearchParams()
  const query = useGrammarPointsQuery()
  const point = query.data?.find(item => item.slug === slug)
  const back = handbookReturnUrl(new URLSearchParams(params))
  const hasPracticeLinks = Boolean(point?.practice_links?.length)
  const practice = useGrammarTheoryPractice(slug, hasPracticeLinks, vi)
  return (
    <main className="mx-auto w-full max-w-[1280px] px-5 py-7 text-text-primary sm:px-8">
      {practice.sourceIssue && practice.sourceQuery.data && <aside className="mb-5 space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-text-primary"><p className="font-semibold">{vi ? 'Lý thuyết từ lỗi của bạn' : 'Theory linked to your feedback'}</p><p className="break-words">“{practice.sourceIssue.original}” → “{practice.sourceIssue.corrected}”</p><Link href={`/${practice.sourceQuery.data.source_kind === 'WRITING' ? 'writing' : 'speaking'}/result/${encodeURIComponent(practice.sourceQuery.data.attempt_id)}`} className="inline-flex min-h-11 items-center text-primary underline underline-offset-4">{vi ? 'Quay lại kết quả bài làm' : 'Back to submission result'}</Link></aside>}
      <nav aria-label={vi ? 'Đường dẫn' : 'Breadcrumb'} className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-secondary">
        <Link href={back} className="inline-flex min-h-11 items-center gap-2 rounded-md font-medium text-primary-hover underline-offset-4 hover:underline dark:text-primary"><ArrowLeft size={16} aria-hidden="true" />{vi ? 'Thư viện ngữ pháp' : 'Grammar library'}</Link>
        {point && <><span aria-hidden="true">/</span><span aria-current="page">{grammarTitle(point, vi)}</span></>}
      </nav>
      {query.isPending ? <div role="status" className="py-12 text-sm text-text-secondary">{vi ? 'Đang mở cấu trúc…' : 'Opening the structure…'}</div> : query.isError ? <div role="alert" className="rounded-xl border border-border bg-surface p-6"><h1 className="text-xl font-semibold">{vi ? 'Chưa tải được cấu trúc' : 'Could not load this structure'}</h1><p className="my-3 text-sm text-text-secondary">{vi ? 'Bạn có thể thử lại hoặc quay về thư viện.' : 'Retry or return to the library.'}</p><Button variant="outline" onClick={() => void query.refetch()}>{vi ? 'Thử lại' : 'Retry'}</Button></div> : !point ? <div className="rounded-xl border border-border bg-surface p-6"><BookOpen size={32} aria-hidden="true" className="mb-4 text-text-tertiary" /><h1 className="text-xl font-semibold">{vi ? 'Không tìm thấy cấu trúc này' : 'Structure not found'}</h1><p className="mt-3 text-sm text-text-secondary">{vi ? 'Bài có thể đã được đổi tên hoặc ngừng xuất bản. Hãy chọn cấu trúc khác trong thư viện.' : 'This article may have been renamed or unpublished. Choose another structure in the library.'}</p></div> : <>
        <header className="mb-7 grid items-center gap-7 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div><div className="mb-3 flex flex-wrap gap-2"><Badge variant="secondary">{point.cefr_level}</Badge><Badge variant="secondary" className="text-wrap">{grammarCategoryLabel(point.category, vi)}</Badge></div><h1 className="text-[26px] leading-tight font-bold tracking-tight text-pretty sm:text-3xl">{grammarTitle(point, vi)}</h1><p className="mt-3 text-base text-text-secondary">{vi ? point.title_en : point.title_vi}</p><p className="mt-4 max-w-[60ch] text-sm leading-6 text-pretty text-text-secondary">{grammarDescription(point, vi) || (vi ? 'Tra cứu công thức, cách dùng và ví dụ của cấu trúc này.' : 'Look up formulas, usage and examples for this structure.')}</p><GrammarTheoryPractice state={practice} hasLinks={hasPracticeLinks} vi={vi} compact /></div>
          <GrammarPhoto key={point._id} point={point} vi={vi} eager className="h-[180px] w-full rounded-xl" />
        </header>
        <TheoryReader key={point._id} point={point} vi={vi} practice={<GrammarTheoryPractice state={practice} hasLinks={hasPracticeLinks} vi={vi} />} />
        <div className="mt-7 border-t border-border pt-5"><Link href={back} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-hover underline-offset-4 hover:underline dark:text-primary">{vi ? 'Chọn cấu trúc khác' : 'Choose another structure'}<ArrowRight size={16} aria-hidden="true" /></Link></div>
      </>}
    </main>
  )
}
