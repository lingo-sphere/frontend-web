'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SectionHeading } from '@/components/dashboard/SectionHeading'
import { Icon } from '@/components/icons/icon-map'
import { Pagination } from '@/components/common/Pagination'
import { vocabularyService, type BackendGrammarPoint } from '@/services/vocabulary.service'

const ITEMS_PER_PAGE = 12

function GrammarCard({ grammar, isVietnamese }: { grammar: BackendGrammarPoint; isVietnamese: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="dashboard-card cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <CardContent className="p-5" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary font-medium">
                {grammar.cefr_level || 'B1'}
              </span>
              <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-xs text-text-secondary">
                {grammar.category}
              </span>
            </div>
            <h4 className="text-[16px] font-semibold text-text-primary line-clamp-1">
              {isVietnamese ? (grammar.title_vi || grammar.title_en) : grammar.title_en}
            </h4>
            <p className="text-[12px] text-text-secondary">{isVietnamese ? grammar.title_en : grammar.title_vi}</p>
          </div>
          <Icon
            name={isExpanded ? 'chevronDown' : 'chevronRight'}
            size={18}
            className="flex-shrink-0 text-text-tertiary"
          />
        </div>

        {grammar.structure_form && (
          <div className="mt-3 rounded-lg bg-surface-subtle p-2">
            <p className="text-[12px] text-text-secondary">{isVietnamese ? 'Cấu trúc:' : 'Structure:'}</p>
            <p className="font-mono text-[13px] font-medium text-primary">
              {grammar.structure_form}
            </p>
          </div>
        )}

        {isExpanded && (
          <div className="mt-4 space-y-4 border-t border-border pt-4">
            <div>
              <p className="text-[12px] font-medium text-text-secondary">{isVietnamese ? 'Mô tả & Định nghĩa:' : 'Description:'}</p>
              <p className="mt-1 text-[13px] text-text-primary">
                {isVietnamese ? (grammar.description_vi || grammar.description_en) : grammar.description_en}
              </p>
            </div>

            {grammar.rule_vi && (
              <div>
                <p className="text-[12px] font-medium text-text-secondary">{isVietnamese ? 'Quy tắc ngữ pháp:' : 'Rule:'}</p>
                <p className="mt-1 text-[13px] text-text-primary">
                  {isVietnamese ? grammar.rule_vi : grammar.rule_en}
                </p>
              </div>
            )}

            {grammar.examples && grammar.examples.length > 0 && (
              <div>
                <p className="text-[12px] font-medium text-text-secondary">{isVietnamese ? 'Ví dụ minh họa:' : 'Examples:'}</p>
                <div className="mt-2 space-y-2">
                  {grammar.examples.map((ex, idx) => (
                    <div key={idx} className="rounded-lg bg-surface-subtle p-2.5">
                      <p className="text-[13px] font-medium text-text-primary">{ex.sentence_en}</p>
                      <p className="mt-0.5 text-[12px] text-text-secondary">{ex.sentence_vi}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {grammar.usage_notes && (
              <div className="rounded-lg bg-info/10 p-3">
                <p className="text-[12px] font-semibold text-info">{isVietnamese ? 'Lưu ý ứng dụng TOEIC:' : 'TOEIC Exam Notes:'}</p>
                <p className="mt-1 text-[12px] text-text-primary">{grammar.usage_notes}</p>
              </div>
            )}

            {grammar.common_mistakes && (
              <div className="rounded-lg bg-warning/10 p-3">
                <p className="text-[12px] font-semibold text-warning">{isVietnamese ? 'Lỗi sai thường gặp:' : 'Common Mistakes:'}</p>
                <p className="mt-1 text-[12px] text-text-primary">{grammar.common_mistakes}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function GrammarAppPage() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [grammarItems, setGrammarItems] = useState<BackendGrammarPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    let isMounted = true
    const fetchGrammar = async () => {
      try {
        setIsLoading(true)
        const items = await vocabularyService.getGrammarPoints()
        if (isMounted && Array.isArray(items)) {
          setGrammarItems(items)
        }
      } catch (err) {
        console.error('Failed to load grammar points:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    fetchGrammar()
    return () => {
      isMounted = false
    }
  }, [])

  const filteredGrammarPoints = useMemo(() => {
    return grammarItems.filter((item) => {
      const matchesType = selectedType === 'ALL' || item.category === selectedType
      const matchesSearch =
        searchQuery.trim() === '' ||
        (item.title_en && item.title_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.title_vi && item.title_vi.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.rule_en && item.rule_en.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesType && matchesSearch
    })
  }, [grammarItems, selectedType, searchQuery])

  const totalPages = Math.ceil(filteredGrammarPoints.length / ITEMS_PER_PAGE) || 1
  const paginatedGrammarPoints = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredGrammarPoints.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredGrammarPoints, currentPage])

  return (
    <Layout>
      <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <SectionHeading
          eyebrow={t('practice.title')}
          title={isVietnamese ? 'Ngữ pháp tiếng Anh' : 'English Grammar Guide'}
          description={
            isVietnamese
              ? 'Tổng hợp các chủ điểm ngữ pháp trọng tâm kèm ví dụ thực tế và giải thích chi tiết'
              : 'Comprehensive grammar points with real examples and exam application notes'
          }
        />

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Input
              type="text"
              placeholder={isVietnamese ? 'Tìm kiếm ngữ pháp...' : 'Search grammar points...'}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10"
            />
            <Icon
              name="search"
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {['ALL', 'TENSES', 'PASSIVE_VOICE', 'MODALS', 'CLAUSES'].map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedType(type)
                  setCurrentPage(1)
                }}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="mt-12 flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filteredGrammarPoints.length > 0 ? (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedGrammarPoints.map((item) => (
                <GrammarCard key={item._id} grammar={item} isVietnamese={isVietnamese} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="mt-12 text-center text-text-secondary">
            {isVietnamese ? 'Không tìm thấy chủ điểm ngữ pháp nào phù hợp.' : 'No grammar points found.'}
          </div>
        )}
      </main>
    </Layout>
  )
}
