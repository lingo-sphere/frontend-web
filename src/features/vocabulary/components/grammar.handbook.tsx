'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, BookOpen, Search } from 'lucide-react'
import { Card } from '@/components/card'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Badge } from '@/components/badge'
import { Pagination } from '@/components/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select'
import { useGrammarPointsQuery } from '../hooks/use.vocabulary.query'
import { grammarCategoryLabel, grammarFormula, grammarTitle, handbookReturnUrl, normalizeGrammarSearch } from '../lib/grammar-handbook'
import { GrammarPhoto } from './grammar.illustration'

const PAGE_SIZE = 12

export function GrammarHandbook({ vi }: { vi: boolean }) {
  const query = useGrammarPointsQuery()
  const params = useSearchParams()
  const search = params.get('search') || ''
  const category = params.get('category') || 'ALL'
  const level = params.get('cefr') || 'ALL'
  const points = query.data || []
  const term = normalizeGrammarSearch(search)
  const filtered = points.filter(point =>
    (category === 'ALL' || point.category === category) &&
    (level === 'ALL' || point.cefr_level === level) &&
    normalizeGrammarSearch(`${point.title_vi} ${point.title_en}`).includes(term)
  )
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const requestedPage = Number(params.get('page'))
  const page = Math.min(Math.max(1, Number.isSafeInteger(requestedPage) ? requestedPage : 1), Math.max(1, totalPages))
  const categories = [...new Set(points.map(point => point.category))].sort((a, b) => grammarCategoryLabel(a, vi).localeCompare(grammarCategoryLabel(b, vi)))
  const levels = [...new Set(points.map(point => point.cefr_level))].sort()

  function update(patch: Record<string, string | null>) {
    const next = new URLSearchParams(handbookReturnUrl(new URLSearchParams(params)).split('?')[1])
    next.delete('page')
    for (const [key, value] of Object.entries(patch)) {
      if (!value || value === 'ALL') next.delete(key)
      else next.set(key, value)
    }
    window.history.replaceState(null, '', `/grammar?${next}`)
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_220px_160px]">
        <div className="relative sm:col-span-2 xl:col-span-1">
          <Search size={18} aria-hidden="true" className="pointer-events-none absolute top-3.5 left-3 text-text-tertiary" />
          <Input aria-label={vi ? 'Tìm cấu trúc' : 'Search structures'} placeholder={vi ? 'Tìm cấu trúc ngữ pháp…' : 'Find a grammar structure…'} value={search} onChange={event => update({ search: event.target.value })} className="h-11 bg-surface pl-10 text-base shadow-none md:text-sm" />
        </div>
        <Select value={category} onValueChange={value => update({ category: value })}>
          <SelectTrigger size="default" aria-label={vi ? 'Nhóm ngữ pháp' : 'Grammar category'} className="h-11 w-full rounded-lg font-normal shadow-none"><SelectValue /></SelectTrigger>
          <SelectContent className="max-h-[min(360px,var(--radix-select-content-available-height))] [&_[data-radix-select-viewport]]:max-h-72"><SelectItem value="ALL">{vi ? 'Tất cả nhóm' : 'All categories'}</SelectItem>{categories.map(value => <SelectItem key={value} value={value}>{grammarCategoryLabel(value, vi)}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={level} onValueChange={value => update({ cefr: value })}>
          <SelectTrigger size="default" aria-label={vi ? 'Cấp độ' : 'Level'} className="h-11 w-full rounded-lg font-normal shadow-none"><SelectValue /></SelectTrigger>
          <SelectContent className="max-h-[min(360px,var(--radix-select-content-available-height))] [&_[data-radix-select-viewport]]:max-h-72"><SelectItem value="ALL">{vi ? 'Mọi cấp độ' : 'All levels'}</SelectItem>{levels.map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm font-semibold text-text-primary">{query.isPending ? (vi ? 'Đang tải cấu trúc…' : 'Loading structures…') : `${filtered.length} ${vi ? 'cấu trúc' : 'structures'}`}</p>
        <p className="text-xs text-text-secondary">{vi ? 'Bấm vào cấu trúc để đọc' : 'Select a structure to read'}</p>
      </div>

      {query.isError ? (
        <div role="alert" className="rounded-xl border border-border bg-surface px-6 py-12 text-center">
          <BookOpen className="mx-auto mb-4 text-text-tertiary" size={32} aria-hidden="true" />
          <h2 className="text-lg font-semibold">{vi ? 'Chưa tải được thư viện' : 'The library could not be loaded'}</h2>
          <p className="mt-2 mb-5 text-sm text-text-secondary">{vi ? 'Vui lòng thử tải lại để tiếp tục tra cứu.' : 'Please retry to continue reading.'}</p>
          <Button variant="outline" onClick={() => void query.refetch()}>{vi ? 'Thử lại' : 'Retry'}</Button>
        </div>
      ) : query.isPending ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">{[0, 1, 2].map(i => <div key={i} className="h-80 animate-pulse rounded-xl bg-surface-subtle motion-reduce:animate-none" />)}</div>
      ) : !filtered.length ? (
        <div className="rounded-xl border border-border bg-surface px-6 py-12 text-center">
          <Search className="mx-auto mb-4 text-text-tertiary" size={32} aria-hidden="true" />
          <h2 className="text-lg font-semibold">{vi ? 'Chưa tìm thấy cấu trúc phù hợp' : 'No matching structures'}</h2>
          <p className="mt-2 mb-5 text-sm text-text-secondary">{vi ? 'Thử tên tiếng Anh hoặc thay đổi bộ lọc.' : 'Try an English title or change the filters.'}</p>
          <Button variant="outline" onClick={() => update({ search: null, category: null, cefr: null })}>{vi ? 'Xóa bộ lọc' : 'Clear filters'}</Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(point => (
            <Link key={point._id} href={`/grammar/handbook/${encodeURIComponent(point.slug)}?${handbookReturnUrl(new URLSearchParams(params)).split('?')[1]}`} className="group block min-w-0 rounded-xl outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary" aria-label={`${vi ? 'Đọc cấu trúc' : 'Read'}: ${grammarTitle(point, vi)}`}>
              <Card className="h-full gap-0 py-0 shadow-none transition-colors group-hover:bg-surface-subtle">
                <GrammarPhoto point={point} vi={vi} className="h-[132px] w-full max-sm:h-40" />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex flex-wrap gap-2"><Badge variant="secondary">{point.cefr_level}</Badge><Badge variant="secondary" className="text-wrap">{grammarCategoryLabel(point.category, vi)}</Badge></div>
                  <h2 className="mt-3 text-[17px] leading-6 font-semibold text-pretty text-text-primary">{grammarTitle(point, vi)}</h2>
                  <p className="mt-2 text-sm leading-5 text-pretty text-text-secondary">{vi ? point.title_en : point.title_vi}</p>
                  {grammarFormula(point) && <div className="mt-3 rounded-lg bg-surface-subtle p-3"><p className="line-clamp-2 font-mono text-xs leading-5 wrap-anywhere text-text-secondary">{grammarFormula(point)}</p></div>}
                  <span className="mt-auto flex items-center gap-2 pt-4 text-sm font-semibold text-primary-hover dark:text-primary">{vi ? 'Đọc cấu trúc' : 'Read structure'}<ArrowRight size={16} aria-hidden="true" /></span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
      {!query.isError && <Pagination currentPage={page} totalPages={totalPages} onPageChange={value => update({ page: String(value) })} itemsPerPage={PAGE_SIZE} totalItems={filtered.length} className="pt-1 [&_button.bg-primary]:bg-primary-hover dark:[&_button.bg-primary]:bg-primary [&_button]:min-h-11" />}
    </div>
  )
}
