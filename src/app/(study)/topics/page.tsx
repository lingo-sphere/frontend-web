/**
 * @file page.tsx
 * @description Trang giao diện người dùng (Next.js App Router) cho tuyến (study)/topics
 */

'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import { SectionHeading } from '@/features/dashboard/components/section.heading'
import { Pagination } from '@/components/pagination'
import { useApp } from '@/contexts/app.context'
import { vocabularyService, type BackendTopic } from '@/features/vocabulary/services/vocabulary.service'

const ITEMS_PER_PAGE = 6

export default function TopicsAppPage() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const { showAction } = useApp()
  const [topicList, setTopicList] = useState<BackendTopic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    let isMounted = true
    const fetchTopics = async () => {
      try {
        setIsLoading(true)
        const data = await vocabularyService.getTopics()
        if (isMounted && Array.isArray(data)) {
          setTopicList(data)
        }
      } catch (err) {
        console.error('Failed to load topics:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    fetchTopics()
    return () => {
      isMounted = false
    }
  }, [])

  const filteredTopics = useMemo(() => {
    return topicList.filter(
      (topic) =>
        (topic.name_en && topic.name_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (topic.name_vi && topic.name_vi.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [topicList, searchQuery])

  const totalPages = Math.ceil(filteredTopics.length / ITEMS_PER_PAGE) || 1
  const paginatedTopics = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredTopics.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredTopics, currentPage])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const featuredTopics = topicList.filter((t) => t.is_featured)

  return (
    <>
      <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <SectionHeading
          eyebrow={t('topics.title')}
          title={isVietnamese ? 'Chủ đề từ vựng' : 'Vocabulary Topics'}
          description={
            isVietnamese
              ? 'Khám phá các chủ đề phổ biến để mở rộng vốn từ vựng'
              : 'Explore popular topics to expand your vocabulary'
          }
        />

        {featuredTopics.length > 0 && (
          <section className="mt-6">
            <h3 className="mb-4 flex items-center gap-2 text-[14px] font-semibold uppercase tracking-wide text-text-tertiary">
              <Star className="h-4 w-4 text-warning" />
              {isVietnamese ? 'Nổi bật' : 'Featured'}
            </h3>
            <div className="flex flex-wrap gap-3">
              {featuredTopics.map((topic) => (
                <button
                  key={topic._id}
                  onClick={() => showAction(`${isVietnamese ? 'Đã mở' : 'Opened'} "${topic.name_vi || topic.name_en}"`)}
                  className="rounded-full bg-warning-soft px-4 py-2 text-[13px] font-medium text-warning transition-all hover:scale-105 hover:bg-warning/20"
                >
                  {topic.name_vi || topic.name_en}
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="mt-6 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder={isVietnamese ? 'Tìm kiếm chủ đề...' : 'Search topics...'}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-[13px] text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <p className="mt-4 text-[13px] text-text-secondary">
          {isVietnamese ? 'Tìm thấy' : 'Found'}{' '}
          <span className="font-semibold text-text-primary">
            {filteredTopics.length}
          </span>{' '}
          {isVietnamese ? 'chủ đề' : 'topics'}
        </p>

        {isLoading ? (
          <div className="mt-12 flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : paginatedTopics.length > 0 ? (
          <>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedTopics.map((topic) => (
                <Card
                  key={topic._id}
                  className={`dashboard-card cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                    topic.is_featured ? 'ring-2 ring-warning/30' : ''
                  }`}
                  onClick={() => showAction(`${isVietnamese ? 'Đã mở' : 'Opened'} "${topic.name_vi || topic.name_en}"`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-[16px] font-semibold text-text-primary">
                          {topic.name_vi || topic.name_en}
                        </h4>
                        <p className="text-[12px] text-text-secondary">
                          {topic.name_en}
                        </p>
                      </div>
                      {topic.is_featured && (
                        <Star className="h-4 w-4 shrink-0 text-warning" />
                      )}
                    </div>

                    <p className="mt-2 text-[12px] text-text-secondary line-clamp-2">
                      {isVietnamese ? (topic.description_vi || topic.description_en) : topic.description_en}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-[11px] font-medium text-text-tertiary">
                        {topic.cefr_level || 'B1'}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                      <span className="text-[12px] text-text-tertiary">
                        {topic.lexical_count || 10} {isVietnamese ? 'từ' : 'words'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={ITEMS_PER_PAGE}
                  totalItems={filteredTopics.length}
                />
              </div>
            )}
          </>
        ) : (
          <div className="mt-12 text-center">
            <p className="text-[14px] text-text-secondary">
              {isVietnamese ? 'Không tìm thấy chủ đề nào' : 'No topics found'}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => handleSearch('')}
            >
              {isVietnamese ? 'Xóa tìm kiếm' : 'Clear search'}
            </Button>
          </div>
        )}
      </main>
    </>
  )
}
