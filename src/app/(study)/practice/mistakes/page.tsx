// Trang giao diện Sổ tay câu sai (Mistake Vault) và ôn tập lặp lại ngắt quãng SRS hỗ trợ đa ngôn ngữ.
'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  BookmarkCheck,
  RotateCcw,
  Flame,
  Award,
  Calendar,
  Filter,
  Loader2,
  CheckCircle2,
  BookOpen,
  Mic,
  PenTool,
  CheckSquare,
} from 'lucide-react'
import { useWritingSrsQuery } from '@/features/practice/hooks/use.writing.srs'
import { useMounted } from '@/hooks/use.mounted'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { Button } from '@/components/button'
import { AppSelect } from '@/components/select'
import {
  useMyMistakesQuery,
  useDueMistakesQuery,
  useDeleteMistakeMutation,
  useSpeakingMistakesQuery,
} from '@/features/practice/hooks/use.mistake.query'
import { toast } from '@/store/toast.store'
import { MistakeVaultCard } from '@/features/practice/components/mistake.vault.card'
import { MistakeReviewModal } from '@/features/practice/components/mistake.review.modal'
import { TopicDrillModal } from '@/features/practice/components/topic.drill.modal'
import { SpeakingMistakesView } from '@/features/practice/components/speaking.mistakes.view'
import { WritingMistakesView } from '@/features/practice/components/writing.mistakes.view'
import { useNavigate, useSearchParams } from '@/lib/navigation'
import { useLanguage } from '@/hooks/use.language'
import type { UserMistakeItem } from '@/features/practice/types/mistake'
import { MistakeStatus } from '@/features/practice/types/mistake'

type MainMistakeSection = 'OBJECTIVE' | 'SPEAKING' | 'WRITING'

export default function MistakeVaultPage() {
  const navigate = useNavigate()
  const mounted = useMounted()
  const { isVietnamese } = useLanguage()
  const isVi = isVietnamese
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isAuthLoading = useAuthStore((s) => s.isLoading)
  const searchParams = useSearchParams()
  const urlTopic = searchParams.get('topic')
  const urlDomain = searchParams.get('domain')
  const urlSection = searchParams.get('section')?.toUpperCase()

  const [activeSection, setActiveSection] = useState<MainMistakeSection>(
    urlSection === 'SPEAKING' || urlSection === 'WRITING'
      ? (urlSection as MainMistakeSection)
      : 'OBJECTIVE'
  )

  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [selectedTopic, setSelectedTopic] = useState<string>(urlTopic || 'ALL')
  const [selectedDomain, setSelectedDomain] = useState<string>(
    urlDomain || 'ALL'
  )
  const [activeReviewMistake, setActiveReviewMistake] =
    useState<UserMistakeItem | null>(null)
  const [activeDrillTopic, setActiveDrillTopic] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const deleteMutation = useDeleteMistakeMutation()

  useEffect(() => {
    if (mounted && !isAuthLoading && !isAuthenticated) {
      if (useAuthStore.getState().isKickedOut) return
      toast.warning(isVi ? 'Vui lòng đăng nhập để xem sổ tay lỗi sai!' : 'Please sign in to view your Mistake Vault!')
      navigate('/login?returnUrl=/practice/mistakes')
    }
  }, [mounted, isAuthLoading, isAuthenticated, navigate, isVi])

  useEffect(() => {
    if (urlTopic) setSelectedTopic(urlTopic)
    if (urlDomain) setSelectedDomain(urlDomain)
    if (urlSection === 'SPEAKING' || urlSection === 'WRITING' || urlSection === 'OBJECTIVE') {
      setActiveSection(urlSection as MainMistakeSection)
    }
  }, [urlTopic, urlDomain, urlSection])

  const queryParams = useMemo(() => {
    return {
      status:
        selectedStatus !== 'ALL' && selectedStatus !== 'DUE'
          ? (selectedStatus as MistakeStatus)
          : undefined,
      due_only: selectedStatus === 'DUE' ? true : undefined,
      topic: selectedTopic !== 'ALL' ? selectedTopic : undefined,
      domain: selectedDomain !== 'ALL' ? selectedDomain : undefined,
      limit: 50,
    }
  }, [selectedStatus, selectedTopic, selectedDomain])

  const isQueryEnabled = Boolean(mounted && isAuthenticated)
  const { data, isLoading, refetch } = useMyMistakesQuery(queryParams, isQueryEnabled && activeSection === 'OBJECTIVE')
  const { data: dueData, refetch: refetchDue } = useDueMistakesQuery(isQueryEnabled && activeSection === 'OBJECTIVE')
  const { data: speakingData } = useSpeakingMistakesQuery(isQueryEnabled)
  const { data: writingData } = useWritingSrsQuery({ status: 'DUE', kind: '', context_id: '', search: '', page: 1 }, isQueryEnabled && activeSection === 'WRITING')
  const changeSection = (section: MainMistakeSection) => {
    setActiveSection(section)
    const next = new URLSearchParams(searchParams.toString())
    next.set('section', section)
    navigate(`/practice/mistakes?${next}`)
  }

  const mistakes = data?.items || []
  const summary = data?.summary || {
    total_all: 0,
    total_due_today: 0,
    total_need_practice: 0,
    total_practicing: 0,
    total_mastered: 0,
  }
  const topicGroups = data?.topic_groups || []

  const handleStartDueReview = () => {
    const dueItems = dueData?.items || []
    if (dueItems.length > 0) {
      setActiveReviewMistake(dueItems[0])
    }
  }

  const handleReviewSuccess = () => {
    refetch()
    refetchDue()
  }

  const handleDeleteMistake = (mistake: UserMistakeItem) => {
    setDeletingId(mistake._id)
    deleteMutation.mutate(mistake._id, {
      onSuccess: () => {
        toast.success(isVi ? 'Đã xóa câu hỏi khỏi sổ tay thành công!' : 'Removed question from mistake vault successfully!')
        setDeletingId(null)
      },
      onError: () => {
        toast.error(isVi ? 'Không thể xóa câu hỏi. Vui lòng thử lại sau!' : 'Failed to remove question. Please try again later!')
        setDeletingId(null)
      },
    })
  }

  return (
    <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8 space-y-6">
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-surface border border-border shadow-xs max-w-fit">
        <button
          type="button"
          onClick={() => changeSection('OBJECTIVE')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSection === 'OBJECTIVE'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
          }`}
        >
          <CheckSquare size={16} />
          <span>{isVi ? 'Câu hỏi & Trắc nghiệm' : 'Questions & Quizzes'}</span>
          {summary.total_due_today > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
              {summary.total_due_today}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => changeSection('SPEAKING')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSection === 'SPEAKING'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
          }`}
        >
          <Mic size={16} />
          <span>{isVi ? 'Luyện nói (Speaking)' : 'Speaking Practice'}</span>
          {speakingData?.summary?.total_due_today ? (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
              {speakingData.summary.total_due_today}
            </span>
          ) : null}
        </button>

        <button
          type="button"
          onClick={() => changeSection('WRITING')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSection === 'WRITING'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
          }`}
        >
          <PenTool size={16} />
          <span>{isVi ? 'Luyện viết (Writing)' : 'Writing Practice'}</span>
          {!!writingData?.summary.due && <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs">{writingData.summary.due}</span>}
        </button>
      </div>

      {activeSection === 'OBJECTIVE' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white shadow-xl border border-emerald-500/20">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-white/10 text-emerald-200">
                  <BookmarkCheck size={20} />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Spaced Repetition System (SRS SM-2)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {isVi ? 'Sổ tay lỗi sai & Khắc phục kiến thức trắc nghiệm' : 'Mistake Vault & Quiz Remediation'}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                {isVi
                  ? 'Mỗi câu bạn từng làm sai trong bài thi hoặc bài tập trắc nghiệm được lên lịch nhắc lại ngắt quãng vào ngày 1, ngày 3, ngày 7. Khi trả lời đúng 3 lần liên tiếp, câu hỏi sẽ được đánh dấu đã làm chủ vĩnh viễn.'
                  : 'Questions missed during tests or practice are scheduled for spaced reviews at Day 1, Day 3, and Day 7. Answering correctly 3 consecutive times marks the item as mastered.'}
              </p>
            </div>

            {summary.total_due_today > 0 && (
              <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                <div className="px-3.5 py-1.5 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-bold flex items-center gap-1.5">
                  <Calendar size={14} className="text-rose-400" />
                  <span>
                    {isVi ? `Hôm nay có ${summary.total_due_today} câu đến hạn ôn tập!` : `You have ${summary.total_due_today} questions due today!`}
                  </span>
                </div>
                <Button
                  onClick={handleStartDueReview}
                  size="lg"
                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/30 gap-2 cursor-pointer"
                >
                  <RotateCcw size={16} />
                  <span>{isVi ? 'Bắt đầu ôn tập ngay' : 'Start Review Now'} ({summary.total_due_today})</span>
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                <BookOpen size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>{isVi ? 'Tổng câu đã ghi nhận' : 'Total Recorded'}</span>
              </div>
              <div className="text-2xl font-black text-text-primary">
                {summary.total_all}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                <Calendar size={14} />
                <span>{isVi ? 'Cần ôn hôm nay' : 'Due Today'}</span>
              </div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {summary.total_due_today}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                <Flame size={14} />
                <span>{isVi ? 'Đang rèn luyện' : 'In Practice'}</span>
              </div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {summary.total_practicing + summary.total_need_practice}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <Award size={14} />
                <span>{isVi ? 'Đã làm chủ hoàn toàn' : 'Mastered'}</span>
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {summary.total_mastered}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface border border-border">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedStatus('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === 'ALL'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-surface-secondary text-text-secondary hover:bg-surface-hover'
                }`}
              >
                {isVi ? 'Tất cả' : 'All'} ({summary.total_all})
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('DUE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === 'DUE'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-surface-secondary text-text-secondary hover:bg-surface-hover'
                }`}
              >
                {isVi ? 'Đến hạn ôn' : 'Due Today'} ({summary.total_due_today})
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus(MistakeStatus.PRACTICING)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === MistakeStatus.PRACTICING
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-surface-secondary text-text-secondary hover:bg-surface-hover'
                }`}
              >
                {isVi ? 'Đang rèn luyện' : 'In Practice'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus(MistakeStatus.MASTERED)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === MistakeStatus.MASTERED
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-surface-secondary text-text-secondary hover:bg-surface-hover'
                }`}
              >
                {isVi ? 'Đã làm chủ' : 'Mastered'} ({summary.total_mastered})
              </button>
            </div>

            <div className="flex items-center gap-1.5 border-l border-border pl-3 ml-1">
              <span className="text-[10px] text-text-tertiary font-medium">
                {isVi ? 'Kỹ năng:' : 'Skill:'}
              </span>
              <button
                type="button"
                onClick={() => setSelectedDomain('ALL')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedDomain === 'ALL'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-surface-secondary text-text-secondary hover:bg-surface-hover'
                }`}
              >
                {isVi ? 'Tất cả' : 'All'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedDomain('LISTENING')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedDomain === 'LISTENING'
                    ? 'bg-blue-600 text-white'
                    : 'bg-surface-secondary text-text-secondary hover:bg-surface-hover'
                }`}
              >
                {isVi ? 'Nghe' : 'Listening'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedDomain('READING')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedDomain === 'READING'
                    ? 'bg-green-600 text-white'
                    : 'bg-surface-secondary text-text-secondary hover:bg-surface-hover'
                }`}
              >
                {isVi ? 'Đọc' : 'Reading'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedDomain('GRAMMAR')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedDomain === 'GRAMMAR'
                    ? 'bg-orange-600 text-white'
                    : 'bg-surface-secondary text-text-secondary hover:bg-surface-hover'
                }`}
              >
                {isVi ? 'Ngữ pháp' : 'Grammar'}
              </button>
            </div>

            {topicGroups.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-text-tertiary shrink-0" />
                <AppSelect
                  value={selectedTopic}
                  onChange={(val) => setSelectedTopic(val)}
                  options={[
                    { value: 'ALL', label: isVi ? `Tất cả chủ điểm (${topicGroups.length})` : `All Topics (${topicGroups.length})` },
                    ...topicGroups.map((g) => ({
                      value: g.topic,
                      label: `${g.topic} (${g.count})`,
                    })),
                  ]}
                  size="sm"
                  ariaLabel={isVi ? 'Lọc theo chủ điểm' : 'Filter by topic'}
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <Loader2 size={32} className="animate-spin text-emerald-600" />
                <p className="text-xs text-text-secondary">
                  {isVi ? 'Đang tải danh sách câu hỏi trong sổ tay...' : 'Loading mistake vault items...'}
                </p>
              </div>
            ) : mistakes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 p-8 rounded-3xl bg-surface border border-border">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-base font-bold text-text-primary">
                  {selectedStatus === 'DUE'
                    ? (isVi ? 'Tuyệt vời! Bạn đã hoàn thành toàn bộ câu ôn tập của hôm nay!' : 'Great job! You completed all reviews due today!')
                    : (isVi ? 'Sổ tay lỗi sai trắc nghiệm hiện đang trống' : 'Mistake vault is currently empty')}
                </h3>
                <p className="text-xs text-text-secondary max-w-md">
                  {selectedStatus === 'DUE'
                    ? (isVi ? 'Hãy quay lại vào ngày mai để tiếp tục chu kỳ ghi nhớ ngắt quãng nhé.' : 'Check back tomorrow to continue your spaced repetition cycle.')
                    : (isVi ? 'Khi bạn làm bài kiểm tra hoặc bài tập trắc nghiệm trong khóa học, bất kỳ câu nào bạn làm chưa đúng sẽ tự động được thu thập tại đây kèm theo giải thích AI.' : 'When you make mistakes on quizzes or tests, items are automatically collected here with AI explanations.')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {mistakes.map((item) => (
                  <MistakeVaultCard
                    key={item._id}
                    mistake={item}
                    onReview={(m) => setActiveReviewMistake(m)}
                    onDrillTopic={(topic) => setActiveDrillTopic(topic)}
                    onPracticeTopic={(m) => {
                      const snapshot = m.classification_snapshot
                      const domain = (
                        snapshot?.domain || 'LISTENING'
                      ).toUpperCase()
                      const contextId = snapshot?.context_id || ''
                      const grammarKnowledgeId = snapshot?.grammar_knowledge_id || ''
                      const exerciseType = snapshot?.exercise_type || ''
                      const rawTopic = m.topic_name_vi || m.topic_tags?.[0] || ''
                      const topicName =
                        rawTopic &&
                        !rawTopic.startsWith('Chương') &&
                        !rawTopic.startsWith('Chapter')
                          ? rawTopic
                          : ''

                      if (!contextId && !(domain === 'GRAMMAR' && grammarKnowledgeId)) {
                        toast.warning(
                          isVi ? 'Câu hỏi này chưa được gắn chủ đề luyện tập cụ thể.' : 'This question is not linked to a specific practice topic.'
                        )
                        return
                      }

                      let targetUrl = '/listening'
                      if (domain === 'READING') {
                        targetUrl = '/reading'
                      } else if (domain === 'SPEAKING') {
                        targetUrl = '/speaking'
                      } else if (domain === 'WRITING') {
                        targetUrl = '/writing'
                      } else if (domain === 'GRAMMAR') {
                        targetUrl = '/grammar'
                      } else if (domain === 'VOCABULARY') {
                        targetUrl = '/vocabulary'
                      }

                      const params = new URLSearchParams()
                      if (contextId) params.set('context_id', contextId)
                      if (grammarKnowledgeId) params.set('grammar_knowledge_id', grammarKnowledgeId)
                      if (exerciseType) params.set('exercise_type', exerciseType)
                      if (topicName) params.set('topic_name', topicName)

                      const queryString = params.toString()
                      navigate(
                        queryString ? `${targetUrl}?${queryString}` : targetUrl
                      )
                    }}
                    onDelete={handleDeleteMistake}
                    isDeleting={deletingId === item._id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSection === 'SPEAKING' && <SpeakingMistakesView />}

      {activeSection === 'WRITING' && (
        <WritingMistakesView />
      )}

      {activeReviewMistake && (
        <MistakeReviewModal
          open={Boolean(activeReviewMistake)}
          onClose={() => setActiveReviewMistake(null)}
          mistake={activeReviewMistake}
          onSuccess={handleReviewSuccess}
        />
      )}

      {activeDrillTopic && (
        <TopicDrillModal
          open={Boolean(activeDrillTopic)}
          onClose={() => setActiveDrillTopic(null)}
          topicTag={activeDrillTopic}
        />
      )}
    </main>
  )
}
