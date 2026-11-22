// Màn hình chính phân hệ Reading Practice với 4 danh mục phụ và danh sách bài đọc hỗ trợ đa ngôn ngữ.
'use client'

import { Suspense, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Icon } from '@/components/icon.map'
import { Button } from '@/components/button'
import { Pagination } from '@/components/pagination'
import { ReadingPassageCard } from '@/features/practice/components/reading.passage.card'
import { ReadingContextNavigation } from '@/features/practice/components/reading.context.navigation'
import { ReadingWorkspace } from '@/features/practice/components/reading.workspace'
import { ReadingTimeModeSelector } from '@/features/practice/components/reading.time-mode-selector'
import { readingPracticeService } from '@/features/practice/services/reading-practice.service'
import { useLanguage } from '@/hooks/use.language'
import type {
  ReadingPassage,
  ReadingType,
  TimerPresetMode,
} from '@/features/practice/types/reading'

const ITEMS_PER_PAGE = 9

export default function ReadingPracticePage() {
  return (
    <Suspense fallback={<p className="p-6">Loading...</p>}>
      <ReadingPractice />
    </Suspense>
  )
}

function ReadingPractice() {
  const params = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isVietnamese } = useLanguage()
  const isVi = isVietnamese

  const tabs: Array<{
    id: ReadingType
    label: string
    icon: string
    description: string
  }> = [
    {
      id: 'PART_6',
      label: 'TOEIC Part 6',
      icon: 'fileText',
      description: isVi
        ? 'Điền từ, cụm từ hoặc cả câu hoàn chỉnh vào các vị trí đục lỗ [1], [2], [3] trong đoạn văn'
        : 'Fill in words, phrases, or full sentences into blanks [1], [2], [3] in passages',
    },
    {
      id: 'PART_7',
      label: 'TOEIC Part 7',
      icon: 'bookOpen',
      description: isVi
        ? 'Đọc hiểu tài liệu thực tế (Email, Notice, Article, Advertisement, Schedule...)'
        : 'Reading comprehension of authentic texts (Email, Notice, Article, Ad, Schedule...)',
    },
    {
      id: 'REAL_WORLD_TASK',
      label: 'Real-World Task',
      icon: 'target',
      description: isVi
        ? 'Đọc và lọc thông tin từ bộ thẻ dữ liệu thực tế để hoàn thành kịch bản nhiệm vụ'
        : 'Scan and extract info from authentic data cards to complete task scenarios',
    },
    {
      id: 'INFO_MATCHING',
      label: 'Information Matching',
      icon: 'puzzle',
      description: isVi
        ? 'Đọc 4-5 đoạn thông tin ngắn [A], [B], [C], [D] và ghép phát biểu tương ứng'
        : 'Read 4-5 short texts [A], [B], [C], [D] and match corresponding statements',
    },
  ]

  const userId = useAuthStore((state) => state.user?.user_id)
  const activeTab = tabs.some((tab) => tab.id === params.get('tab'))
    ? (params.get('tab') as ReadingType)
    : 'PART_7'
  const selectedContextId = params.get('context_id') || null
  const pageParam = Number(params.get('page') || 1)
  const currentPage = Number.isSafeInteger(pageParam) && pageParam > 0 ? pageParam : 1
  const sessionId = params.get('session')
  const attemptId = params.get('attempt')
  const historyView = params.get('view') === 'history'

  const [pendingPassage, setPendingPassage] = useState<ReadingPassage | null>(null)
  const [error, setError] = useState('')
  const [starting, setStarting] = useState(false)
  const startRef = useRef<{ key: string; id: string } | null>(null)
  const startingRef = useRef(false)

  const navigate = (patch: Record<string, string | null>, options?: { scroll?: boolean }) => {
    const next = new URLSearchParams(params.toString())
    for (const [name, value] of Object.entries(patch)) {
      if (value === null) next.delete(name)
      else next.set(name, value)
    }
    router.push('/reading?' + next.toString(), options)
  }

  const login = () =>
    window.dispatchEvent(new CustomEvent('lingosphere:open-auth-modal'))

  const catalog = useQuery({
    queryKey: ['reading-passages', activeTab, selectedContextId, currentPage, ITEMS_PER_PAGE],
    queryFn: () =>
      readingPracticeService.getPassages({
        reading_type: activeTab,
        context_id: selectedContextId || undefined,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      }),
    enabled: !sessionId && !attemptId && !historyView,
  })

  const active = useQuery({
    queryKey: ['reading-active', userId],
    queryFn: () => readingPracticeService.activeSessions(),
    enabled: Boolean(userId) && !sessionId && !attemptId,
    staleTime: 0,
  })

  const session = useQuery({
    queryKey: ['reading-session', userId, sessionId],
    queryFn: () => readingPracticeService.getSession(sessionId!),
    enabled: Boolean(userId && sessionId),
    retry: false,
    refetchOnWindowFocus: false,
  })

  const review = useQuery({
    queryKey: ['reading-review', userId, attemptId],
    queryFn: () => readingPracticeService.reviewAttempt(attemptId!),
    enabled: Boolean(userId && attemptId),
    retry: false,
  })

  const history = useQuery({
    queryKey: ['reading-history', userId, currentPage],
    queryFn: () =>
      readingPracticeService.getAttemptHistory(undefined, {
        limit: 20,
        page: currentPage,
      }),
    enabled: Boolean(userId && historyView),
    staleTime: 0,
  })

  const home = () => {
    void queryClient.invalidateQueries({ queryKey: ['reading-active'] })
    void queryClient.invalidateQueries({ queryKey: ['reading-history'] })
    navigate({ session: null, attempt: null })
  }

  const begin = async (mode: TimerPresetMode) => {
    if (!pendingPassage || startingRef.current) return
    if (!userId) {
      login()
      return
    }
    startingRef.current = true
    setStarting(true)
    setError('')
    const key = pendingPassage._id + ':' + mode
    if (startRef.current?.key !== key)
      startRef.current = { key, id: crypto.randomUUID() }
    try {
      const result = await readingPracticeService.startSession({
        passage_id: pendingPassage._id,
        time_mode: mode,
        session_key: startRef.current.id,
      })
      queryClient.setQueryData(
        ['reading-session', userId, result.session_id],
        result
      )
      navigate({ session: result.session_id, attempt: null, view: null })
      setPendingPassage(null)
      startRef.current = null
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : (isVi ? 'Chưa mở được phiên luyện. Hãy thử lại.' : 'Failed to start practice session. Please try again.')
      )
    } finally {
      startingRef.current = false
      setStarting(false)
    }
  }

  if (sessionId || attemptId) {
    if (!userId)
      return (
        <main className="p-6">
          <p>{isVi ? 'Đăng nhập để mở bài Reading của bạn.' : 'Sign in to access your Reading passage.'}</p>
          <Button onClick={login}>{isVi ? 'Đăng nhập' : 'Sign In'}</Button>
        </main>
      )
    const query = sessionId ? session : review
    if (query.isPending)
      return (
        <p role="status" className="p-6">
          {isVi ? 'Đang tải bài Reading…' : 'Loading Reading passage…'}
        </p>
      )
    if (query.error)
      return (
        <main role="alert" className="p-6">
          <p>{query.error.message}</p>
          <Button onClick={() => void query.refetch()}>{isVi ? 'Thử lại' : 'Retry'}</Button>
          <Button onClick={home}>{isVi ? 'Về danh sách' : 'Back to list'}</Button>
        </main>
      )
    if (sessionId && session.data)
      return (
        <ReadingWorkspace
          key={userId + sessionId}
          passage={session.data.passage}
          session={session.data}
          timeLimitSeconds={session.data.time_limit_seconds}
          onBack={home}
          onComplete={home}
        />
      )
    if (attemptId && review.data)
      return (
        <ReadingWorkspace
          key={userId + attemptId}
          passage={review.data.passage}
          initialResult={review.data.result}
          timeLimitSeconds={0}
          onBack={home}
          onComplete={home}
        />
      )
  }

  return (
    <main className="w-full space-y-6 px-4 py-5 sm:px-6 sm:py-7">
      <header className="rounded-3xl bg-primary p-6 text-white">
        <h1 className="text-2xl font-bold">{isVi ? 'Luyện đọc Reading' : 'Reading Practice Studio'}</h1>
        <p className="mt-2 text-sm">
          {isVi
            ? 'Part 6, Part 7, nhiệm vụ thực tế và nối thông tin.'
            : 'Part 6, Part 7, real-world tasks, and information matching.'}
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={historyView ? 'outline' : 'default'}
          onClick={() => navigate({ view: null, page: null })}
        >
          {isVi ? 'Danh sách bài đọc' : 'Reading Passages'}
        </Button>
        <Button
          variant={historyView ? 'default' : 'outline'}
          onClick={() => {
            if (!userId) login()
            else navigate({ view: 'history', page: null })
          }}
        >
          {isVi ? 'Lịch sử làm bài' : 'Attempt History'}
        </Button>
      </div>
      {historyView ? (
        <section className="space-y-3">
          <h2 className="font-bold">{isVi ? 'Lịch sử Reading' : 'Reading History'}</h2>
          {history.isPending ? (
            <p>{isVi ? 'Đang tải lịch sử…' : 'Loading history…'}</p>
          ) : history.error ? (
            <div role="alert">
              {history.error.message}
              <Button onClick={() => void history.refetch()}>{isVi ? 'Thử lại' : 'Retry'}</Button>
            </div>
          ) : history.data?.length ? (
            history.data.map((attempt) => (
              <button
                type="button"
                key={attempt._id}
                onClick={() =>
                  navigate({ attempt: attempt._id, session: null })
                }
                className="flex w-full items-center justify-between rounded-xl border border-border p-4 text-left"
              >
                <span>
                  {new Date(attempt.completed_at).toLocaleString(isVi ? 'vi-VN' : 'en-US')} ·{' '}
                  {attempt.correct_count}/{attempt.total_questions} {isVi ? 'câu đúng' : 'correct'}
                </span>
                <strong>{attempt.score_percent}% · {isVi ? 'Xem lại' : 'Review'}</strong>
              </button>
            ))
          ) : (
            <p>{isVi ? 'Chưa có bài Reading đã hoàn tất.' : 'No completed reading attempts yet.'}</p>
          )}
          <div className="flex gap-3">
            <Button
              disabled={currentPage === 1}
              onClick={() => navigate({ page: String(currentPage - 1) })}
            >
              {isVi ? 'Trang trước' : 'Previous'}
            </Button>
            <span>{isVi ? 'Trang ' : 'Page '}{currentPage}</span>
            <Button
              disabled={(history.data?.length || 0) < 20}
              onClick={() => navigate({ page: String(currentPage + 1) })}
            >
              {isVi ? 'Trang sau' : 'Next'}
            </Button>
          </div>
        </section>
      ) : (
        <>
          {active.data && active.data.length > 0 && (
            <section className="space-y-2 rounded-xl border border-primary/30 p-4">
              <h2 className="font-bold">{isVi ? 'Bài đang làm' : 'In Progress'}</h2>
              {active.data.map((row) => (
                <div
                  key={row.session_id}
                  className="flex items-center justify-between gap-3"
                >
                  <span>{row.passage_title}</span>
                  <Button
                    onClick={() =>
                      navigate({ session: row.session_id, attempt: null })
                    }
                  >
                    {isVi ? 'Tiếp tục' : 'Resume'}
                  </Button>
                </div>
              ))}
            </section>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  navigate({ tab: tab.id, context_id: null, page: null })
                }
                className={
                  'rounded-xl border p-4 text-left ' +
                  (activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'border-border')
                }
              >
                <Icon name={tab.icon} size={20} />
                <h2 className="mt-2 text-sm font-bold">{tab.label}</h2>
                <p className="mt-1 text-xs">{tab.description}</p>
              </button>
            ))}
          </div>
          <ReadingContextNavigation
            selectedContextId={selectedContextId}
            onSelectContext={(id) => navigate({ context_id: id, page: null })}
          />
          <h2 className="font-bold">
            {isVi ? 'Danh sách bài đọc' : 'Reading Passages'} ({catalog.data?.pagination.total ?? 0})
          </h2>
          {catalog.isPending ? (
            <p role="status">{isVi ? 'Đang tải danh sách…' : 'Loading passages…'}</p>
          ) : catalog.error ? (
            <div role="alert" className="rounded-xl border border-red-300 p-4">
              {isVi ? 'Không tải được danh sách: ' : 'Failed to load list: '}{catalog.error.message}
              <Button onClick={() => void catalog.refetch()}>{isVi ? 'Thử lại' : 'Retry'}</Button>
            </div>
          ) : !catalog.data?.passages.length ? (
            <p>{isVi ? 'Chưa có bài đọc nào phù hợp bộ lọc.' : 'No reading passages match the selected filter.'}</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {catalog.data.passages.map((passage) => (
                <ReadingPassageCard
                  key={passage._id}
                  passage={passage}
                  onStartPractice={(selected) => {
                    if (!userId) login()
                    else {
                      setPendingPassage(selected)
                      setError('')
                    }
                  }}
                />
              ))}
            </div>
          )}
          {!catalog.isPending && !catalog.error && catalog.data && catalog.data.pagination.total_pages > 1 && (
            <nav aria-label={isVi ? 'Phân trang bài đọc' : 'Reading pagination'} className="mt-8 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={catalog.data.pagination.total_pages}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={catalog.data.pagination.total}
                onPageChange={(newPage) => {
                  navigate({ page: String(newPage) }, { scroll: false })
                  window.scrollTo({ top: 120, behavior: 'smooth' })
                }}
              />
            </nav>
          )}
        </>
      )}
      {pendingPassage && (
        <ReadingTimeModeSelector
          questionCount={pendingPassage.question_count || 0}
          passageTitle={isVi ? (pendingPassage.title_vi || pendingPassage.title) : (pendingPassage.title || pendingPassage.title_vi)}
          onSelect={(mode) => {
            void begin(mode)
          }}
          onCancel={() => {
            if (!starting) {
              setPendingPassage(null)
              startRef.current = null
            }
          }}
          isStarting={starting}
          error={error}
        />
      )}
    </main>
  )
}
