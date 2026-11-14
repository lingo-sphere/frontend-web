'use client'

// Component hiển thị kết quả học từ vựng chuẩn hóa UX/UI Promax
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChevronRight,
  RotateCcw,
  Home,
  Award,
  Sparkles,
  BookOpen,
  Volume2,
  AlertTriangle,
  CheckCircle2,
  Headphones,
  FileText,
  Brain,
  ArrowLeft,
} from 'lucide-react'
import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import { Badge } from '@/components/badge'
import { useNavigate } from '@/lib/navigation'
import { speakWord } from '@/features/practice/lib/audio.utils'
import type { LearningResult, VocabularyItem } from '@/features/vocabulary/types/vocabulary.learn'
import { Analytics } from '@/lib/posthog'

interface LearningResultViewProps {
  result: LearningResult
  onRetry: () => void
  onBackToHome: () => void
  onAction: (message: string) => void
  onReviewWeakWords?: () => void
}

export function LearningResultView({
  result,
  onRetry,
  onBackToHome,
  onAction,
  onReviewWeakWords,
}: LearningResultViewProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const navigate = useNavigate()

  const { totalWords, correctAnswers, accuracy, skillBreakdown, weakWords } = result
  const safeTotalWords = Math.max(0, totalWords || 0)
  const safeCorrectAnswers = Math.min(result.totalItems ?? safeTotalWords, Math.max(0, correctAnswers || 0))
  const safeAccuracy = Math.min(100, Math.max(0, accuracy || 0))
  const isPassed = safeAccuracy >= 80

  useEffect(() => {
    Analytics.vocabSessionCompleted({
      cardsReviewed: safeTotalWords,
      accuracyRate: safeAccuracy,
    })
  }, [safeTotalWords, safeAccuracy])

  const getAccuracyColor = (acc: number) => {
    if (acc >= 80) return 'text-emerald-600 dark:text-emerald-400'
    if (acc >= 60) return 'text-amber-600 dark:text-amber-400'
    return 'text-rose-600 dark:text-rose-400'
  }

  const getAccuracyBorder = (acc: number) => {
    if (acc >= 80) return 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20'
    if (acc >= 60) return 'border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20'
    return 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20'
  }

  const getAccuracyMessage = (acc: number) => {
    if (acc >= 90) return isVietnamese ? 'Xuất sắc!' : 'Outstanding!'
    if (acc >= 80) return isVietnamese ? 'Làm rất tốt!' : 'Great Job!'
    if (acc >= 70) return isVietnamese ? 'Tiến bộ rõ rệt!' : 'Good Progress!'
    if (acc >= 50) return isVietnamese ? 'Cần củng cố thêm' : 'Keep Practicing'
    return isVietnamese ? 'Hãy nỗ lực hơn nhé!' : "Don't Give Up!"
  }

  const handleReviewWeakWords = () => {
    if (onReviewWeakWords) {
      onReviewWeakWords()
    } else {
      navigate('/vocabulary/learn/wrong-words')
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl space-y-5 px-4 py-6 sm:px-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-text-secondary hover:text-text-primary transition cursor-pointer"
        >
          <ArrowLeft size={16} />
          {isVietnamese ? 'Về kho từ vựng' : 'Back to Vocabulary'}
        </button>

        <div className="flex items-center gap-2">
          {isPassed && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <Sparkles size={12} className="text-emerald-500" />
              {isVietnamese ? 'Đạt mục tiêu' : 'Goal Met'}
            </span>
          )}
          <Badge variant="secondary" className="text-xs">
            {isVietnamese ? 'Phiên học hoàn thành' : 'Session Completed'}
          </Badge>
        </div>
      </div>

      {/* Hero Score Card (Promax, đồng bộ với hệ thống) */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Left: Score Badge & Title */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div
              className={`relative flex h-22 w-22 sm:h-24 sm:w-24 shrink-0 flex-col items-center justify-center rounded-2xl border p-2 shadow-xs ${getAccuracyBorder(
                safeAccuracy
              )}`}
            >
              <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${getAccuracyColor(safeAccuracy)}`}>
                {accuracy === null ? '—' : `${safeAccuracy}%`}
              </span>
              <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                {isVietnamese ? 'Chính xác' : 'Accuracy'}
              </span>
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {result.assessmentType === 'SELF_REPORTED'
                    ? isVietnamese
                      ? 'Tự đánh giá thẻ nhớ'
                      : 'Self-reported Review'
                    : isVietnamese
                    ? 'Luyện tập từ vựng'
                    : 'Vocabulary Practice'}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
                {result.assessmentType === 'LEGACY'
                  ? isVietnamese
                    ? 'Kết quả phiên học'
                    : 'Session Results'
                  : getAccuracyMessage(safeAccuracy)}
              </h1>

              {/* Quick Metrics Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-text-secondary">
                <span className="inline-flex items-center gap-1 rounded-md bg-surface-subtle px-2 py-0.5">
                  <BookOpen size={12} className="text-primary" />
                  <strong className="text-text-primary">{safeTotalWords}</strong> {isVietnamese ? 'từ đã luyện' : 'words'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 border border-emerald-200 dark:border-emerald-900/50">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  <strong>{result.firstTryCorrectCount ?? safeCorrectAnswers}</strong> {isVietnamese ? 'thuộc ngay lần 1' : 'first-try recall'}
                </span>
                {(result.recoveredCount ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 border border-amber-200 dark:border-amber-900/50">
                    <RotateCcw size={12} className="text-amber-500" />
                    <strong>{result.recoveredCount}</strong> {isVietnamese ? 'đã phục hồi' : 'recovered'}
                    {result.recoveryBonusXp ? (
                      <span className="ml-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        (+{result.recoveryBonusXp} XP)
                      </span>
                    ) : null}
                  </span>
                )}
                {weakWords.length > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-2 py-0.5 border border-rose-200 dark:border-rose-900/50">
                    <AlertTriangle size={12} className="text-rose-500" />
                    <strong>{weakWords.length}</strong> {isVietnamese ? 'từ cần củng cố' : 'need review'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 border border-emerald-200 dark:border-emerald-900/50">
                    <Sparkles size={12} className="text-emerald-500" />
                    {isVietnamese ? 'Nhớ trọn vẹn 100%' : '100% Mastered'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-2.5 sm:self-center">
            {weakWords.length > 0 && (
              <Button
                onClick={handleReviewWeakWords}
                className="flex-1 sm:flex-initial flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white shadow-sm cursor-pointer"
              >
                {isVietnamese ? 'Ôn ngay từ yếu' : 'Review Weak Words'}
                <ChevronRight size={16} />
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onRetry}
              className="flex-1 sm:flex-initial flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={15} />
              {isVietnamese ? 'Luyện lại' : 'Try Again'}
            </Button>
            <Button
              variant="outline"
              onClick={onBackToHome}
              className="flex-1 sm:flex-initial flex items-center gap-1.5 cursor-pointer"
            >
              <Home size={15} />
              {isVietnamese ? 'Hoàn tất' : 'Done'}
            </Button>
          </div>
        </div>

        {/* Motivational / Contextual Feedback Snippet */}
        <div className="mt-4 rounded-xl border border-border/80 bg-surface-subtle/40 p-3.5 text-xs sm:text-sm text-text-secondary">
          <p className="leading-relaxed">
            <span className="font-semibold text-text-primary mr-1">
              {isPassed ? '🎉 Đánh giá:' : '💡 Lời khuyên:'}
            </span>
            {isPassed
              ? isVietnamese
                ? 'Phản xạ từ vựng của bạn rất nhanh và chính xác. Các từ này đã được lưu vào lịch ôn Spaced Repetition để nhắc lại đúng thời điểm vàng.'
                : 'Great retention and quick recognition! Words are scheduled in your Spaced Repetition queue for optimal retention.'
              : isVietnamese
              ? 'Một số từ bạn còn nhầm lẫn về chính tả hoặc ngữ cảnh. Hãy xem các thẻ từ vựng bên dưới và luyện lại để khắc sâu trí nhớ nhé.'
              : 'Some words need extra reinforcement. Review the cards below and re-practice to solidify memory.'}
          </p>
        </div>
      </section>

      {/* Weak Words Section (Hiển thị Smart Vocab Cards trực quan) */}
      {weakWords.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                <AlertTriangle size={15} />
              </div>
              <h2 className="text-base font-bold text-text-primary">
                {isVietnamese ? 'Từ cần củng cố' : 'Words to Review'} ({weakWords.length})
              </h2>
            </div>
            <span className="text-xs text-text-secondary">
              {isVietnamese ? 'Bấm nút loa để nghe lại phát âm chuẩn' : 'Click audio icon to listen'}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {weakWords.map((word: VocabularyItem) => (
              <div
                key={word.id}
                className={`rounded-xl border bg-surface p-3.5 space-y-2 shadow-xs transition ${
                  word.recovered
                    ? 'border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-300 dark:hover:border-emerald-800'
                    : 'border-rose-200 dark:border-rose-900/50 hover:border-rose-300 dark:hover:border-rose-800'
                }`}
              >
                {/* Word header: Word + Pronunciation + Part of speech + Audio Button */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-bold text-text-primary">{word.word}</span>
                      {word.partOfSpeech && (
                        <span className="rounded bg-surface-subtle px-1.5 py-0.5 text-[11px] font-semibold text-text-secondary italic">
                          ({word.partOfSpeech})
                        </span>
                      )}
                      {word.cefrLevel && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {word.cefrLevel}
                        </Badge>
                      )}
                      {word.recovered ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 size={10} className="text-emerald-500" />
                          {isVietnamese ? 'Đã phục hồi (+3 XP)' : 'Recovered (+3 XP)'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300">
                          <AlertTriangle size={10} className="text-rose-500" />
                          {isVietnamese ? 'Cần luyện thêm' : 'Needs review'}
                        </span>
                      )}
                    </div>
                    {(word.pronunciation || word.pronunciation_uk) && (
                      <p className="text-xs text-text-secondary font-mono mt-0.5">
                        {word.pronunciation || word.pronunciation_uk}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (word.word) speakWord(word.word)
                      onAction(
                        `${isVietnamese ? 'Phát âm:' : 'Audio:'} ${word.word}${
                          word.meaningVi ? ` - ${word.meaningVi}` : ''
                        }`
                      )
                    }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition cursor-pointer"
                    title={isVietnamese ? 'Nghe phát âm' : 'Listen pronunciation'}
                  >
                    <Volume2 size={16} />
                  </button>
                </div>

                {/* Meaning */}
                {word.meaningVi && (
                  <p className="text-sm font-semibold text-text-primary border-t border-border/50 pt-1.5">
                    {word.meaningVi}
                  </p>
                )}

                {/* Example sentence */}
                {word.example && (
                  <div className="rounded-lg bg-surface-subtle/50 p-2 text-xs text-text-secondary space-y-0.5">
                    <p className="italic">“{word.example}”</p>
                    {word.exampleMeaningVi && (
                      <p className="text-text-tertiary">({word.exampleMeaningVi})</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="flex flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20 p-8 text-center">
          <CheckCircle2 size={42} className="text-emerald-500 mb-3" />
          <h2 className="text-base font-bold text-emerald-800 dark:text-emerald-300">
            {isVietnamese ? 'Tuyệt đối 100%! Bạn đã nắm vững toàn bộ từ' : '100% Perfect! All words mastered'}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-text-secondary max-w-md">
            {isVietnamese
              ? 'Không có từ nào bị trả lời sai hoặc cần ôn lại trong phiên này. Hãy tiếp tục duy trì chuỗi học tập nhé!'
              : 'No missed words in this session. Keep up your streak!'}
          </p>
        </section>
      )}

      {/* Progress & 4 Subskills Breakdown (Gọn gàng & Trực quan) */}
      <section className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Brain size={15} />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-text-primary">
              {isVietnamese ? 'Tiến bộ theo 4 khía cạnh ghi nhớ' : 'Memory Dimensions Progress'}
            </h2>
          </div>
          <span className="text-xs text-text-secondary">
            {isVietnamese ? 'Độ chính xác từng kỹ năng' : 'Subskill accuracy'}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <SkillCard
            icon={<BookOpen size={16} className="text-primary" />}
            label={isVietnamese ? 'Nhận diện nghĩa' : 'Meaning Recognition'}
            value={skillBreakdown.meaning}
            isVietnamese={isVietnamese}
          />
          <SkillCard
            icon={<FileText size={16} className="text-primary" />}
            label={isVietnamese ? 'Chính tả & Gõ từ' : 'Spelling & Typing'}
            value={skillBreakdown.spelling}
            isVietnamese={isVietnamese}
          />
          <SkillCard
            icon={<Headphones size={16} className="text-primary" />}
            label={isVietnamese ? 'Nghe hiểu âm thanh' : 'Listening & Audio'}
            value={skillBreakdown.listening}
            isVietnamese={isVietnamese}
          />
          <SkillCard
            icon={<Sparkles size={16} className="text-primary" />}
            label={isVietnamese ? 'Vận dụng ngữ cảnh' : 'Context Application'}
            value={skillBreakdown.context}
            isVietnamese={isVietnamese}
          />
        </div>
      </section>

      {/* Bottom Sticky Action Footer */}
      <section className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 pt-4">
        <Button variant="outline" size="sm" onClick={onBackToHome}>
          {isVietnamese ? 'Về kho từ vựng' : 'Back to Vocabulary'}
        </Button>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={onRetry} className="flex items-center gap-1.5 cursor-pointer">
            <RotateCcw size={14} />
            {isVietnamese ? 'Luyện lại phiên này' : 'Try Again'}
          </Button>
          {weakWords.length > 0 && (
            <Button
              size="sm"
              onClick={handleReviewWeakWords}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white shadow-sm cursor-pointer"
            >
              {isVietnamese ? `Ôn ${weakWords.length} từ yếu` : `Review ${weakWords.length} Words`}
              <ChevronRight size={15} />
            </Button>
          )}
        </div>
      </section>
    </main>
  )
}

function SkillCard({
  icon,
  label,
  value,
  isVietnamese,
}: {
  icon: React.ReactNode
  label: string
  value: number | null
  isVietnamese: boolean
}) {
  const getColor = (val: number) => {
    if (val >= 80) return 'bg-emerald-500'
    if (val >= 60) return 'bg-amber-500'
    return 'bg-rose-500'
  }

  const getTextColor = (val: number) => {
    if (val >= 80) return 'text-emerald-600 dark:text-emerald-400'
    if (val >= 60) return 'text-amber-600 dark:text-amber-400'
    return 'text-rose-600 dark:text-rose-400'
  }

  const isTested = value !== null && value !== undefined

  return (
    <div className="rounded-xl border border-border/70 bg-surface-subtle/40 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-semibold text-text-primary">{label}</span>
        </div>
        <span className={`text-xs font-bold ${isTested ? getTextColor(value) : 'text-text-secondary'}`}>
          {isTested ? `${value}%` : isVietnamese ? 'Chưa kiểm tra' : 'Not tested'}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/60">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isTested ? getColor(value) : 'bg-transparent'}`}
          style={{ width: `${isTested ? value : 0}%` }}
        />
      </div>
    </div>
  )
}
