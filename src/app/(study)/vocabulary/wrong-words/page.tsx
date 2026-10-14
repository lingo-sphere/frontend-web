'use client'

/**
 * @file wrong-words/page.tsx
 * @description Trang quản lý bộ sưu tập từ sai (Wrong Words Collection)
 * Hỗ trợ hiển thị hạn mức Quota (100 từ), phân loại lỗi (SPELLING/DISTRACTOR), tiến độ phục hồi 2 lần liên tiếp, và ôn tập.
 */

import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  Volume2,
  ArrowLeft,
  Layers,
  Sparkles,
  HelpCircle,
  Clock,
  ShieldCheck,
  Search,
  BookOpen,
} from 'lucide-react'
import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import { Pagination } from '@/components/pagination'
import { SectionHeading } from '@/features/dashboard/components/section.heading'
import { useNavigate } from '@/lib/navigation'
import { useApp } from '@/contexts/app.context'
import { vocabularyService } from '@/features/vocabulary/services/vocabulary.service'
import { speakWord } from '@/features/practice/lib/audio.utils'

export default function WrongWordsPage() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const { showAction } = useApp()

  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'RECOVERED' | 'ALL'>('ACTIVE')
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const PAGE_SIZE = 12

  // Query danh sách từ sai từ Backend
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['vocabulary', 'wrong-words', activeTab, page],
    queryFn: async () => {
      const statusParam = activeTab === 'ALL' ? undefined : activeTab
      return vocabularyService.getWrongWords({
        status: statusParam,
        page,
        limit: PAGE_SIZE,
      })
    },
    staleTime: 30 * 1000,
  })

  const items = data?.items || []
  const pagination = data?.pagination || {
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    total_pages: 1,
    quota_used: 0,
    max_quota: 100,
  }

  const quotaUsed = pagination.quota_used || 0
  const maxQuota = pagination.max_quota || 100
  const quotaPercent = Math.min(Math.round((quotaUsed / maxQuota) * 100), 100)

  // Lọc tìm kiếm phía client nếu có từ khóa
  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const word = String(item.word || '').toLowerCase()
    const meaning = String(item.meaning_vi || '').toLowerCase()
    return word.includes(q) || meaning.includes(q)
  })

  const handleStartReview = () => {
    if (quotaUsed === 0 && activeTab === 'ACTIVE') {
      showAction(
        isVietnamese
          ? 'Bạn không có từ sai nào cần củng cố!'
          : 'You have no wrong words to review!'
      )
      return
    }
    navigate('/vocabulary/learn/wrong-words')
  }

  const handleSpeak = (e: React.MouseEvent, word: string) => {
    e.stopPropagation()
    speakWord(word)
  }

  return (
    <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            onClick={() => navigate('/vocabulary')}
            className="mb-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-text-secondary hover:text-text-primary transition"
          >
            <ArrowLeft size={14} />
            <span>{isVietnamese ? 'Quay lại kho từ vựng' : 'Back to Vocabulary'}</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle size={24} />
            </div>
            <div>
              <SectionHeading
                eyebrow={isVietnamese ? 'Củng cố kiến thức' : 'Retention Recovery'}
                title={isVietnamese ? 'Bộ ôn lại từ sai' : 'Wrong Words Collection'}
                description={
                  isVietnamese
                    ? 'Tập trung luyện tập các từ bạn từng làm sai hoặc nhầm lẫn chính tả cho tới khi thành thạo'
                    : 'Focus on practicing words you missed or misspelled until fully mastered'
                }
              />
            </div>
          </div>
        </div>

        {/* NÚT BẮT ĐẦU ÔN TẬP */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleStartReview}
            disabled={quotaUsed === 0}
            className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-md px-5 py-2.5 rounded-xl transition"
          >
            <Play size={16} fill="currentColor" />
            <span>{isVietnamese ? 'Bắt đầu ôn từ sai' : 'Start Review'}</span>
          </Button>
        </div>
      </div>

      {/* OVERVIEW CARDS: QUOTA & STATS */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {/* Card 1: Hạn mức lưu trữ Quota */}
        <Card className="border-border/80 shadow-sm sm:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-text-primary">
                  {isVietnamese ? 'Hạn mức bộ từ sai (Quota)' : 'Wrong Words Quota'}
                </span>
                <span
                  title={
                    isVietnamese
                      ? 'Hệ thống tự động lưu tối đa 100 từ sai. Khi đầy, các từ đã phục hồi hoặc ít khẩn cấp nhất sẽ được dọn dẹp tự động.'
                      : 'Holds up to 100 missed words. Auto-evicts recovered or least urgent items when full.'
                  }
                  className="cursor-help text-text-tertiary hover:text-text-primary"
                >
                  <HelpCircle size={13} />
                </span>
              </div>
              <span className="text-[12px] font-bold text-text-secondary">
                {quotaUsed} / {maxQuota} {isVietnamese ? 'từ' : 'words'}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-border/60">
              <div
                className={`h-full transition-all duration-500 ${
                  quotaPercent > 80 ? 'bg-destructive' : quotaPercent > 50 ? 'bg-amber-500' : 'bg-primary'
                }`}
                style={{ width: `${quotaPercent}%` }}
              />
            </div>

            <p className="mt-2.5 text-[11px] text-text-tertiary">
              {isVietnamese
                ? '💡 Khi bạn trả lời đúng liên tiếp 2 lần trong các bài tập củng cố, từ sẽ tự động được đánh dấu là "Đã phục hồi"!'
                : '💡 Answer correctly 2 consecutive times in review exercises to graduate the word into "Recovered"!'}
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Trạng thái & Cơ chế phục hồi */}
        <Card className="border-border/80 shadow-sm flex flex-col justify-between">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
              {isVietnamese ? 'Cơ chế thích ứng' : 'Adaptive Recovery'}
            </span>
            <div className="my-2 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck size={22} />
              </div>
              <div>
                <div className="text-[14px] font-bold text-text-primary">
                  {isVietnamese ? 'Scaffolding Fading' : 'Scaffolding Fading'}
                </div>
                <div className="text-[11px] text-text-secondary">
                  {isVietnamese ? 'Bắt đầu từ Flashcard/MC, nâng dần lên Gõ từ' : 'Flashcard -> MC -> Reverse -> Typing'}
                </div>
              </div>
            </div>
            <span className="text-[10px] text-text-tertiary">
              {isVietnamese ? 'Đồng bộ trực tiếp thuật toán SRS' : 'Synced with core SRS memory engine'}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* FILTER TABS & SEARCH */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3">
        {/* TABS */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setActiveTab('ACTIVE')
              setPage(1)
            }}
            className={`rounded-xl px-3.5 py-1.5 text-[12.5px] font-bold transition ${
              activeTab === 'ACTIVE'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-surface-subtle text-text-secondary hover:bg-surface-hover hover:text-text-primary'
            }`}
          >
            {isVietnamese ? 'Cần củng cố (Active)' : 'Active Missed'}
          </button>
          <button
            onClick={() => {
              setActiveTab('RECOVERED')
              setPage(1)
            }}
            className={`rounded-xl px-3.5 py-1.5 text-[12.5px] font-bold transition ${
              activeTab === 'RECOVERED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-surface-subtle text-text-secondary hover:bg-surface-hover hover:text-text-primary'
            }`}
          >
            {isVietnamese ? 'Đã phục hồi (Recovered)' : 'Recovered'}
          </button>
          <button
            onClick={() => {
              setActiveTab('ALL')
              setPage(1)
            }}
            className={`rounded-xl px-3.5 py-1.5 text-[12.5px] font-bold transition ${
              activeTab === 'ALL'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-subtle text-text-secondary hover:bg-surface-hover hover:text-text-primary'
            }`}
          >
            {isVietnamese ? 'Tất cả' : 'All'}
          </button>
        </div>

        {/* SEARCH BOX */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isVietnamese ? 'Tìm từ vựng hoặc nghĩa...' : 'Search word or meaning...'}
            className="w-full rounded-xl border border-border bg-surface py-1.5 pl-8 pr-3 text-[12.5px] text-text-primary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* ITEMS LIST */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3">
            <CheckCircle2 size={30} />
          </div>
          <h3 className="text-[16px] font-bold text-text-primary">
            {activeTab === 'ACTIVE'
              ? isVietnamese
                ? 'Tuyệt vời! Bạn không có từ sai nào cần củng cố'
                : 'Great! You have no missed words to review'
              : isVietnamese
              ? 'Không tìm thấy từ vựng nào'
              : 'No vocabulary items found'}
          </h3>
          <p className="mt-1 text-[12px] text-text-secondary max-w-sm">
            {isVietnamese
              ? 'Khi bạn học từ vựng và gặp câu hỏi khó hoặc sai sót chính tả, hệ thống sẽ tự động lưu vào đây để bạn luyện tập.'
              : 'When you make mistakes or encounter spelling issues during learning sessions, words will be automatically collected here.'}
          </p>
          <Button
            onClick={() => navigate('/vocabulary')}
            className="mt-4 gap-2 bg-primary hover:bg-primary-hover text-white text-[12px] font-bold rounded-xl"
          >
            <BookOpen size={14} />
            <span>{isVietnamese ? 'Khám phá bộ thẻ từ vựng' : 'Explore Decks'}</span>
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const isRecovered = item.status === 'RECOVERED'
            const consecutiveCorrect = item.consecutive_correct || 0
            const wrongCount = item.wrong_count || 1
            const lastMistakeType = item.last_mistake_type || 'UNKNOWN'

            let mistakeBadgeText = isVietnamese ? 'Sai đáp án' : 'Incorrect'
            let mistakeBadgeColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'

            if (lastMistakeType === 'SPELLING') {
              mistakeBadgeText = isVietnamese ? 'Lỗi chính tả' : 'Spelling'
              mistakeBadgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
            } else if (lastMistakeType === 'DISTRACTOR') {
              mistakeBadgeText = isVietnamese ? 'Nhầm lựa chọn' : 'Distractor'
              mistakeBadgeColor = 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20'
            }

            return (
              <Card
                key={item._id}
                className="dashboard-card border-border/80 shadow-sm flex flex-col justify-between overflow-hidden transition hover:border-amber-500/40 hover:shadow-md"
              >
                <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
                  <div>
                    {/* Header Thẻ: Từ + Nút Loa + Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[18px] font-extrabold text-text-primary tracking-tight">
                            {item.word}
                          </span>
                          <button
                            onClick={(e) => handleSpeak(e, item.word)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-subtle text-text-secondary hover:bg-primary/10 hover:text-primary transition"
                            title={isVietnamese ? 'Phát âm' : 'Pronounce'}
                          >
                            <Volume2 size={14} />
                          </button>
                        </div>

                        {/* Phiên âm IPA + Từ loại */}
                        <div className="mt-1 flex items-center gap-2 text-[12px] text-text-tertiary">
                          {item.ipa && <span className="font-mono text-primary">{item.ipa}</span>}
                          {item.part_of_speech && (
                            <span className="rounded bg-surface-subtle px-1.5 py-0.5 text-[10px] font-semibold uppercase text-text-secondary">
                              {item.part_of_speech}
                            </span>
                          )}
                          {item.cefr_level && (
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                              {item.cefr_level}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Trạng thái Phục hồi / Cần sửa */}
                      <div className="flex flex-col items-end gap-1">
                        {isRecovered ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={10} />
                            {isVietnamese ? 'Đã phục hồi' : 'Recovered'}
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${mistakeBadgeColor}`}>
                            <AlertTriangle size={10} />
                            {mistakeBadgeText}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Nghĩa Tiếng Việt */}
                    <div className="mt-3 rounded-xl bg-surface-subtle p-2.5">
                      <p className="text-[13px] font-semibold text-text-primary leading-snug">
                        {item.meaning_vi || isVietnamese ? 'Chưa có bản dịch' : 'No translation'}
                      </p>
                      {item.example_en && (
                        <p className="mt-1.5 text-[11px] italic text-text-secondary leading-normal">
                          &ldquo;{item.example_en}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* THÔNG TIN PHỤC HỒI: STREAK VÀ SỐ LẦN SAI */}
                  <div className="mt-4 border-t border-border/70 pt-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-text-tertiary">
                        {isVietnamese ? 'Tiến độ phục hồi (chuỗi đúng):' : 'Recovery streak:'}
                      </span>
                      <span className="font-bold text-text-primary">
                        {consecutiveCorrect} / 2 {isVietnamese ? 'lần' : 'times'}
                      </span>
                    </div>

                    {/* Thanh Streak Indicator (2 nấc) */}
                    <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                      <div
                        className={`h-1.5 rounded-full transition ${
                          consecutiveCorrect >= 1 ? 'bg-emerald-500' : 'bg-border'
                        }`}
                      />
                      <div
                        className={`h-1.5 rounded-full transition ${
                          consecutiveCorrect >= 2 ? 'bg-emerald-500' : 'bg-border'
                        }`}
                      />
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[10.5px] text-text-tertiary">
                      <span>
                        {isVietnamese ? `Đã sai: ${wrongCount} lần` : `Missed: ${wrongCount}x`}
                      </span>
                      {item.last_reviewed_at && (
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(item.last_reviewed_at).toLocaleDateString(isVietnamese ? 'vi-VN' : 'en-US')}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* PAGINATION */}
      {pagination.total_pages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={pagination.total_pages}
            onPageChange={setPage}
          />
        </div>
      )}
    </main>
  )
}
