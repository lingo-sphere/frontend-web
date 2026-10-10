'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Bookmark, Eye, Search, Filter, ArrowLeft, Users, Globe, Check, Loader2 } from 'lucide-react'
import { useNavigate } from '@/lib/navigation'
import { useQueryClient } from '@tanstack/react-query'

import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import { Pagination } from '@/components/pagination'
import { SectionHeading } from '@/features/dashboard/components/section.heading'
import { useApp } from '@/contexts/app.context'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { vocabularyService } from '@/features/vocabulary/services/vocabulary.service'
import {
  usePublicDecksQuery,
  useMyVocabularyEnrollmentsQuery,
} from '@/features/vocabulary/hooks/use.vocabulary.query'
import { vocabularyKeys } from '@/features/vocabulary/keys/vocabulary.keys'
import type { Deck } from '@/features/vocabulary/schemas/vocabulary.schema'

interface FormattedDeck {
  id: string
  title: string
  author: string
  authorAvatar: string
  wordCount: number
  views: number
  saves: number
  topic: string
  creatorId?: string | null
}

type SortOption = 'views' | 'saves'

export default function PublicDecksAppPage() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const { showAction } = useApp()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((state) => state.user)

  const { data: liveDecks = [], isLoading } = usePublicDecksQuery()
  const { data: myEnrollments = [] } = useMyVocabularyEnrollmentsQuery()
  const [savingDeckId, setSavingDeckId] = useState<string | null>(null)

  const enrolledDeckIdSet = useMemo(() => {
    return new Set(
      myEnrollments.map((d: any) => String(d._id || d.deck_id || ''))
    )
  }, [myEnrollments])

  const [sortBy, setSortBy] = useState<SortOption>('views')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBand, setSelectedBand] = useState<string>('ALL')

  const decks: (FormattedDeck & { band?: string; part?: string })[] = useMemo(() => {
    if (!Array.isArray(liveDecks)) return []
    // CHỈ lấy các bộ thẻ do người dùng/học viên tạo và chia sẻ (creator_type === 'USER')
    // Loại bỏ 250 Units TOEIC của hệ thống (creator_type === 'SYSTEM')
    const userSharedDecks = liveDecks.filter((d: Deck) => d.creator_type === 'USER')

    return userSharedDecks.map((d: Deck, i: number) => {
      const targetBand = typeof d.settings?.target_band === 'string' ? d.settings.target_band : undefined
      const examPart = typeof d.settings?.exam_part === 'string' ? d.settings.exam_part : undefined
      const authorName = (d as any).creator_name || (d as any).author || (isVietnamese ? 'Học viên LingoSphere' : 'Community Learner')

      return {
        id: (d._id || (d as any).deck_id || `deck-${i}`) as string,
        title: (isVietnamese && d.name_vi) ? d.name_vi : (d.name || 'Community Deck'),
        author: authorName,
        authorAvatar: ['#6b5ce7', '#00b894', '#0984e3', '#fdcb6e', '#e17055'][i % 5],
        wordCount: d.card_count || 0,
        views: d.total_users || 0,
        saves: d.save_count || 0,
        topic: d.category || (isVietnamese ? 'Cộng đồng' : 'Community'),
        band: targetBand,
        part: examPart,
        creatorId: d.creator_id,
      }
    })
  }, [liveDecks, isVietnamese])

  const filteredDecks = useMemo(() => {
    return decks
      .filter((deck) => {
        if (selectedBand !== 'ALL' && deck.band !== selectedBand) return false
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          return (
            deck.title.toLowerCase().includes(query) ||
            deck.author.toLowerCase().includes(query) ||
            deck.topic.toLowerCase().includes(query)
          )
        }
        return true
      })
      .sort((a, b) => b[sortBy] - a[sortBy])
  }, [decks, searchQuery, selectedBand, sortBy])

  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 9

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedBand, searchQuery, sortBy])

  const totalPages = Math.ceil(filteredDecks.length / PAGE_SIZE)

  const paginatedDecks = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredDecks.slice(start, start + PAGE_SIZE)
  }, [filteredDecks, currentPage])

  const handleSaveDeck = async (deck: FormattedDeck) => {
    if (currentUser?.user_id && deck.creatorId === currentUser.user_id) {
      showAction(
        isVietnamese
          ? 'Đây là bộ thẻ do chính bạn tạo, đã có sẵn trong danh sách của bạn'
          : 'You are the creator of this deck'
      )
      return
    }

    try {
      setSavingDeckId(deck.id)
      await vocabularyService.enrollDeck(deck.id)
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.all })
      showAction(
        isVietnamese
          ? `Đã lưu bộ thẻ "${deck.title}" về bộ thẻ của bạn`
          : `Saved deck "${deck.title}" to your decks`
      )
    } catch {
      showAction(isVietnamese ? 'Không thể lưu bộ thẻ. Vui lòng thử lại' : 'Failed to save deck')
    } finally {
      setSavingDeckId(null)
    }
  }

  const handleStudyDeck = (deck: FormattedDeck) => {
    if (!enrolledDeckIdSet.has(deck.id)) {
      vocabularyService.enrollDeck(deck.id).then(() => {
        queryClient.invalidateQueries({ queryKey: vocabularyKeys.all })
      }).catch(() => {})
    }
    navigate(`/vocabulary/learn/${deck.id}`)
  }

  return (
    <>
      <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl text-text-secondary hover:text-text-primary"
            onClick={() => navigate('/vocabulary')}
          >
            <ArrowLeft size={16} />
            <span>{isVietnamese ? 'Quay về Từ vựng' : 'Back to Vocabulary'}</span>
          </Button>
        </div>

        <SectionHeading
          eyebrow={isVietnamese ? 'Cộng đồng LingoSphere' : 'Community Space'}
          title={isVietnamese ? 'Bộ thẻ cộng đồng (User Public Decks)' : 'Community Shared Decks'}
          description={
            isVietnamese
              ? 'Nơi chia sẻ và giao lưu các bộ flashcard do chính học viên biên soạn và công khai cho cộng đồng'
              : 'Discover and learn vocabulary flashcards created and published by learners'
          }
        />

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder={isVietnamese ? 'Tìm kiếm theo tên deck, tác giả, chủ đề...' : 'Search by deck name, author, topic...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-[13px] text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-text-tertiary" />
            <span className="text-[13px] text-text-secondary">
              {isVietnamese ? 'Sắp xếp:' : 'Sort by:'}
            </span>
            <div className="flex gap-1 rounded-xl bg-surface-subtle p-1">
              <button
                onClick={() => setSortBy('views')}
                className={`rounded-lg px-3 py-1 text-[12px] font-medium transition-all ${
                  sortBy === 'views'
                    ? 'bg-surface text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {isVietnamese ? 'Xem nhiều' : 'Most Viewed'}
              </button>
              <button
                onClick={() => setSortBy('saves')}
                className={`rounded-lg px-3 py-1 text-[12px] font-medium transition-all ${
                  sortBy === 'saves'
                    ? 'bg-surface text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {isVietnamese ? 'Lưu nhiều' : 'Most Saved'}
              </button>
            </div>
          </div>
        </div>

        {/* Categories / Tags filter nếu có */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[12px] font-medium text-text-tertiary">
            {isVietnamese ? 'Bộ lọc:' : 'Filter:'}
          </span>
          {[
            { id: 'ALL', label: isVietnamese ? 'Tất cả' : 'All' },
            { id: '350-500', label: 'Band 350-500' },
            { id: '500-650', label: 'Band 500-650' },
            { id: '650-800', label: 'Band 650-800' },
            { id: '800-990', label: 'Band 800-990' },
          ].map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBand(b.id)}
              className={`rounded-full px-3 py-1 text-[12px] font-semibold transition-all ${
                selectedBand === b.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-subtle text-text-secondary hover:bg-surface-hover hover:text-text-primary'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        <p className="mt-4 text-[13px] text-text-secondary">
          {isVietnamese ? 'Tìm thấy' : 'Found'}{' '}
          <span className="font-semibold text-text-primary">
            {filteredDecks.length}
          </span>{' '}
          {isVietnamese ? 'bộ thẻ' : 'decks'}
        </p>

        {isLoading ? (
          <div className="mt-12 flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filteredDecks.length > 0 ? (
          <>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedDecks.map((deck) => (
                <Card
                  key={deck.id}
                  className="dashboard-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-[15px] font-semibold text-text-primary line-clamp-1">
                        {deck.title}
                      </h4>
                      <div className="flex shrink-0 items-center gap-1">
                        {deck.part && (
                          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                            {deck.part.replace('_', ' ')}
                          </span>
                        )}
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          {deck.topic}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ backgroundColor: deck.authorAvatar }}
                      >
                        {deck.author.charAt(0)}
                      </div>
                      <span className="text-[12px] text-text-secondary">
                        {deck.author}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                      <span className="text-[12px] text-text-tertiary">
                        {deck.wordCount} {isVietnamese ? 'từ' : 'words'}
                      </span>
                      <div className="flex items-center gap-3 text-[12px] text-text-tertiary">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {deck.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bookmark className="h-3.5 w-3.5" />
                          {deck.saves.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      {Boolean(currentUser?.user_id) &&
                      deck.creatorId === currentUser?.user_id ? (
                        <div className="flex flex-1 items-center justify-center rounded-lg bg-amber-500/10 py-1.5 text-[12px] font-semibold text-amber-600 dark:text-amber-400">
                          {isVietnamese ? "👑 Bộ thẻ của bạn" : "👑 Your Deck"}
                        </div>
                      ) : enrolledDeckIdSet.has(deck.id) ? (
                        <div className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-500/10 py-1.5 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <Check size={13} />
                          <span>{isVietnamese ? "Đã lưu" : "Enrolled"}</span>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={savingDeckId === deck.id}
                          className="flex-1 gap-1 text-[12px]"
                          onClick={() => handleSaveDeck(deck)}
                        >
                          {savingDeckId === deck.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Bookmark size={13} />
                          )}
                          <span>{isVietnamese ? "Lưu" : "Save"}</span>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        className="flex-1 bg-primary text-[12px] hover:bg-primary-hover"
                        onClick={() => handleStudyDeck(deck)}
                      >
                        {isVietnamese ? 'Học ngay' : 'Study'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={PAGE_SIZE}
                  totalItems={filteredDecks.length}
                />
              </div>
            )}
          </>
        ) : (
          <div className="mt-12 rounded-2xl border border-dashed border-border bg-surface/50 p-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-info/10 text-info">
              <Globe size={32} />
            </div>
            <h4 className="text-[16px] font-bold text-text-primary">
              {isVietnamese ? 'Chưa có bộ thẻ nào được chia sẻ từ cộng đồng' : 'No community shared decks yet'}
            </h4>
            <p className="mx-auto mt-2 max-w-md text-[13px] text-text-secondary">
              {isVietnamese
                ? 'Đây là nơi trưng bày các bộ flashcard do học viên tự tạo và bật công khai. Hiện tại chưa có bộ thẻ nào của thành viên được chia sẻ.'
                : 'This space showcases flashcard decks created and publicly shared by learners. No member decks have been shared yet.'}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/vocabulary')}
              >
                {isVietnamese ? 'Học bộ thẻ TOEIC Official' : 'Practice TOEIC Official Decks'}
              </Button>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
