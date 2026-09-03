'use client'

/**
 * @file CourseTestRunnerModal.tsx
 * @description Modal làm bài kiểm tra / trắc nghiệm chương sử dụng dữ liệu thực tế do giáo viên tạo,
 * tự động lưu kết quả đánh giá tiến độ vào backend, hiển thị so sánh cải thiện qua các giai đoạn
 * và phân tích chi tiết câu sai bằng AI.
 */

import { useState, useMemo } from 'react'
import {
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Trophy,
  ArrowRight,
  RotateCcw,
  FileQuestion,
  TrendingUp,
  Bot,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Chapter } from '@/types/course'
import { courseService } from '@/services/course.service'

export interface CourseTestQuestion {
  id?: string
  question_text?: string
  question?: string
  options?: string[]
  answers?: string[]
  correct_answer?: string | number
  correct_index?: number
  explanation?: string
  media_url?: string
}

interface CourseTestRunnerModalProps {
  isOpen: boolean
  courseId: string
  chapter?: Chapter | null
  testType: 'challenge' | 'exercise' | 'post-mini' | 'final-test'
  finalTestQuestions?: CourseTestQuestion[]
  onClose: () => void
  onComplete: (score: number, isPassed: boolean, resultData?: unknown) => void
}

/**
 * Xác định chính xác vị trí đáp án đúng do giáo viên cài đặt
 * Hỗ trợ các định dạng: 'A' | 'B' | 'C' | 'D', index số 0..3, hoặc chuỗi văn bản khớp với options
 */
function getCorrectOptionIndex(q: CourseTestQuestion, options: string[]): number {
  if (typeof q.correct_index === 'number' && q.correct_index >= 0) {
    return q.correct_index
  }
  if (typeof q.correct_answer === 'number' && q.correct_answer >= 0) {
    return q.correct_answer
  }
  if (typeof q.correct_answer === 'string') {
    const trimmed = q.correct_answer.trim()
    const upper = trimmed.toUpperCase()
    if (upper === 'A') return 0
    if (upper === 'B') return 1
    if (upper === 'C') return 2
    if (upper === 'D') return 3

    const num = parseInt(trimmed, 10)
    if (!isNaN(num) && num >= 0 && num < options.length) {
      return num
    }

    const textMatchIdx = options.findIndex(
      (opt) => opt.trim().toLowerCase() === trimmed.toLowerCase()
    )
    if (textMatchIdx !== -1) return textMatchIdx
  }
  return 0
}

export function CourseTestRunnerModal({
  isOpen,
  courseId,
  chapter,
  testType,
  finalTestQuestions,
  onClose,
  onComplete,
}: CourseTestRunnerModalProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [scoreResult, setScoreResult] = useState<{
    correctCount: number
    totalQuestions: number
    score: number
    isPassed: boolean
  } | null>(null)

  // Backend saving state & progression comparison note
  const [isSaving, setIsSaving] = useState(false)
  const [progressionNote, setProgressionNote] = useState<string | null>(null)
  const [growthDiff, setGrowthDiff] = useState<{ scoreDiff: number; percent: number } | null>(null)

  // AI Mistake Explanation State
  const [isLoadingAi, setIsLoadingAi] = useState(false)
  const [showAiDetails, setShowAiDetails] = useState(false)
  const [aiExplanations, setAiExplanations] = useState<{
    summary?: string
    overall_advice?: string
    explanations: Array<{
      question_number: number
      question_text: string
      user_selected: string
      correct_answer: string
      why_wrong: string
      why_correct: string
      recommended_topic: string
    }>
  } | null>(null)
  const [wrongQuestionsList, setWrongQuestionsList] = useState<
    Array<{
      question_number: number
      question_text: string
      user_selected_answer: string
      correct_answer: string
      category?: string
    }>
  >([])

  // Trích xuất CHÍNH XÁC danh sách câu hỏi do giáo viên đã tải lên từ cơ sở dữ liệu
  const rawQuestions: CourseTestQuestion[] = useMemo(() => {
    if (testType === 'final-test') {
      if (Array.isArray(finalTestQuestions) && finalTestQuestions.length > 0) {
        return finalTestQuestions as CourseTestQuestion[]
      }
    }
    if (testType === 'challenge') {
      if (Array.isArray(chapter?.challenge_questions) && chapter.challenge_questions.length > 0) {
        return chapter.challenge_questions as CourseTestQuestion[]
      }
      if (Array.isArray(chapter?.test_questions) && chapter.test_questions.length > 0) {
        return chapter.test_questions as CourseTestQuestion[]
      }
    }
    if (testType === 'post-mini') {
      if (Array.isArray(chapter?.post_mini_questions) && chapter.post_mini_questions.length > 0) {
        return chapter.post_mini_questions as CourseTestQuestion[]
      }
      if (Array.isArray(chapter?.test_questions) && chapter.test_questions.length > 0) {
        return chapter.test_questions as CourseTestQuestion[]
      }
    }
    if (testType === 'exercise') {
      if (Array.isArray(chapter?.test_questions) && chapter.test_questions.length > 0) {
        return chapter.test_questions as CourseTestQuestion[]
      }
      if (Array.isArray(chapter?.post_mini_questions) && chapter.post_mini_questions.length > 0) {
        return chapter.post_mini_questions as CourseTestQuestion[]
      }
    }
    return []
  }, [chapter, testType, finalTestQuestions])

  if (!isOpen) return null

  const passingScore =
    testType === 'challenge'
      ? chapter?.challengeTest?.passingScore || 80
      : testType === 'final-test'
      ? 70
      : 60

  const testTitle =
    testType === 'challenge'
      ? `Bài kiểm tra đầu chương (Challenge Test)`
      : testType === 'post-mini'
      ? `Bài kiểm tra cuối chương (Post-Mini Test)`
      : testType === 'final-test'
      ? `Bài thi tốt nghiệp cuối khóa (Final Test)`
      : `Bài tập trắc nghiệm thực hành`

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (isSubmitted) return
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }))
  }

  const handleSubmitTest = async () => {
    let correct = 0
    const wrongs: Array<{
      question_number: number
      question_text: string
      user_selected_answer: string
      correct_answer: string
      category?: string
    }> = []

    rawQuestions.forEach((q, idx) => {
      const chosen = selectedAnswers[idx]
      const options = q.options || q.answers || ['A', 'B', 'C', 'D']
      const correctIdx = getCorrectOptionIndex(q, options)

      if (chosen === correctIdx) {
        correct += 1
      } else {
        wrongs.push({
          question_number: idx + 1,
          question_text: q.question_text || q.question || `Câu hỏi số ${idx + 1}`,
          user_selected_answer:
            chosen !== undefined ? options[chosen] || String.fromCharCode(65 + chosen) : 'Chưa chọn',
          correct_answer: options[correctIdx] || String.fromCharCode(65 + correctIdx),
          category: chapter?.title || 'Kiến thức chung',
        })
      }
    })

    const total = rawQuestions.length
    const scorePercent = total > 0 ? Math.round((correct / total) * 100) : 100
    const isPassed = scorePercent >= passingScore

    setWrongQuestionsList(wrongs)
    setScoreResult({
      correctCount: correct,
      totalQuestions: total,
      score: scorePercent,
      isPassed,
    })
    setIsSubmitted(true)

    // Call Backend Progress Evaluation API
    setIsSaving(true)
    let backendResult: any = null
    try {
      if (testType === 'challenge' && chapter?.id) {
        backendResult = await courseService.submitModuleChallenge(courseId, String(chapter.id), {
          score: scorePercent,
          passing_score: passingScore,
        })
        if (backendResult?.message) {
          setProgressionNote(backendResult.message)
        }
      } else if ((testType === 'post-mini' || testType === 'exercise') && chapter?.id) {
        backendResult = await courseService.submitModulePostMini(courseId, String(chapter.id), {
          score: scorePercent,
        })
        if (backendResult?.progression_comparison) {
          const comp = backendResult.progression_comparison
          setProgressionNote(comp.comparison_note)
          setGrowthDiff({
            scoreDiff: comp.score_diff,
            percent: comp.percentage_improvement,
          })
        }
      } else if (testType === 'final-test') {
        backendResult = await courseService.submitCourseFinalTest(courseId, {
          score: scorePercent,
        })
        if (backendResult?.total_score_growth !== undefined) {
          setGrowthDiff({
            scoreDiff: backendResult.total_score_growth,
            percent: backendResult.total_growth_percentage,
          })
          setProgressionNote(
            backendResult.baseline_score > 0
              ? `Tốt nghiệp khóa học! Tiến bộ tổng thể ${backendResult.total_score_growth >= 0 ? '+' : ''}${backendResult.total_score_growth} điểm (+${backendResult.total_growth_percentage}%) so với Baseline ban đầu.`
              : 'Chúc mừng bạn đã hoàn thành bài thi tốt nghiệp cuối khóa!'
          )
        }
      }
    } catch (err) {
      console.warn('Could not save test to backend:', err)
    } finally {
      setIsSaving(false)
    }

    onComplete(scorePercent, isPassed, backendResult)
  }

  const handleRetry = () => {
    setSelectedAnswers({})
    setIsSubmitted(false)
    setScoreResult(null)
    setProgressionNote(null)
    setGrowthDiff(null)
    setAiExplanations(null)
    setShowAiDetails(false)
    setWrongQuestionsList([])
  }

  const handleAskAiForExplanations = async () => {
    if (wrongQuestionsList.length === 0 || isLoadingAi) return
    setIsLoadingAi(true)
    setShowAiDetails(true)
    try {
      const res = await courseService.explainTestMistakes(courseId, {
        test_title: testTitle,
        test_type: testType.toUpperCase(),
        wrong_questions: wrongQuestionsList,
      })
      if (res) {
        setAiExplanations(res)
      }
    } catch (err) {
      console.warn('Error calling AI explanation:', err)
    } finally {
      setIsLoadingAi(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-surface border border-border shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-surface-subtle/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Trophy size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">{testTitle}</h3>
              <p className="text-xs text-text-secondary">
                {chapter ? chapter.title : 'Khóa học'} • Điểm đạt:{' '}
                <span className="font-bold text-primary">{passingScore}%</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-tertiary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Test Body Questions */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {rawQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-subtle text-text-tertiary">
                <FileQuestion size={32} />
              </div>
              <h4 className="text-sm font-bold text-text-primary">Chưa có dữ liệu câu hỏi</h4>
              <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
                Giáo viên chưa cập nhật danh sách câu hỏi cho phần này của khóa học.
              </p>
            </div>
          ) : (
            <>
              {/* Result Banner after submit */}
              {isSubmitted && scoreResult && (
                <div className="space-y-3.5">
                  <div
                    className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300 ${
                      scoreResult.isPassed
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                          scoreResult.isPassed
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                            : 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                        }`}
                      >
                        {scoreResult.isPassed ? (
                          <CheckCircle2 size={24} />
                        ) : (
                          <AlertCircle size={24} />
                        )}
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold">
                          {scoreResult.isPassed
                            ? '🎉 Chúc mừng! Bạn đã vượt qua bài test!'
                            : '⚡ Chưa đạt điểm chuẩn!'}
                        </h4>
                        <p className="text-xs opacity-90 mt-0.5">
                          Đúng {scoreResult.correctCount}/{scoreResult.totalQuestions} câu (
                          {scoreResult.score}%).{' '}
                          {scoreResult.isPassed
                            ? 'Tiến độ và điểm số đã được tự động lưu vào hệ thống!'
                            : `Cần đạt tối thiểu ${passingScore}% để vượt qua.`}
                        </p>
                      </div>
                    </div>

                    {!scoreResult.isPassed && (
                      <Button
                        onClick={handleRetry}
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 shrink-0 flex items-center gap-1.5 cursor-pointer text-xs"
                      >
                        <RotateCcw size={14} />
                        <span>Làm lại</span>
                      </Button>
                    )}
                  </div>

                  {/* Progression Comparison Note from Backend */}
                  {progressionNote && (
                    <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                        <TrendingUp size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                            Đánh giá tiến độ giai đoạn:
                          </span>
                          {growthDiff && (
                            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                              {growthDiff.scoreDiff >= 0 ? `+${growthDiff.scoreDiff}` : growthDiff.scoreDiff} điểm ({growthDiff.percent >= 0 ? `+${growthDiff.percent}` : growthDiff.percent}%)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-indigo-800/90 dark:text-indigo-300/90 mt-1 leading-relaxed">
                          {progressionNote}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* AI Mistake Analysis Action Card */}
                  {wrongQuestionsList.length > 0 && (
                    <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-purple-600 text-white shrink-0 shadow-xs">
                            <Bot size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-purple-900 dark:text-purple-200">
                              Trợ lý AI phân tích {wrongQuestionsList.length} câu sai
                            </p>
                            <p className="text-[11px] text-purple-700/80 dark:text-purple-300/80">
                              Giải thích nguyên nhân sai, phân tích lỗi ngữ pháp và hướng dẫn ôn tập
                            </p>
                          </div>
                        </div>

                        {!aiExplanations ? (
                          <Button
                            onClick={handleAskAiForExplanations}
                            disabled={isLoadingAi}
                            size="sm"
                            className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            {isLoadingAi ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                <span>Đang phân tích...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles size={13} />
                                <span>Phân tích lỗi sai bằng AI</span>
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button
                            onClick={() => setShowAiDetails(!showAiDetails)}
                            variant="ghost"
                            size="sm"
                            className="rounded-xl text-purple-700 dark:text-purple-300 text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                          >
                            <span>{showAiDetails ? 'Thu gọn' : 'Xem chi tiết'}</span>
                            {showAiDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </Button>
                        )}
                      </div>

                      {/* Render AI Detailed Mistake Explanations */}
                      {showAiDetails && aiExplanations && (
                        <div className="pt-3 border-t border-purple-200/60 dark:border-purple-800/40 space-y-3 animate-in fade-in duration-200">
                          {aiExplanations.overall_advice && (
                            <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-purple-200/50 text-xs text-purple-900 dark:text-purple-200 font-medium">
                              💡 <strong>Lời khuyên tổng thể:</strong> {aiExplanations.overall_advice}
                            </div>
                          )}

                          <div className="space-y-2.5">
                            {aiExplanations.explanations.map((item, exIdx) => (
                              <div
                                key={exIdx}
                                className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-900/80 border border-purple-200/60 dark:border-purple-800/50 space-y-2 text-xs"
                              >
                                <div className="flex items-center justify-between font-bold text-text-primary">
                                  <span>Câu {item.question_number}: {item.question_text}</span>
                                  {item.recommended_topic && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                                      {item.recommended_topic}
                                    </span>
                                  )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                  <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200/50 text-rose-700 dark:text-rose-300">
                                    <span className="font-bold block">Bạn đã chọn: {item.user_selected}</span>
                                    <span className="opacity-90">{item.why_wrong}</span>
                                  </div>
                                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 text-emerald-700 dark:text-emerald-300">
                                    <span className="font-bold block">Đáp án đúng: {item.correct_answer}</span>
                                    <span className="opacity-90">{item.why_correct}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Question List */}
              {rawQuestions.map((q, qIdx) => {
                const chosenIdx = selectedAnswers[qIdx]
                const options = q.options || q.answers || ['A', 'B', 'C', 'D']
                const correctIdx = isSubmitted ? getCorrectOptionIndex(q, options) : -1

                return (
                  <div
                    key={q.id || `q-${qIdx}`}
                    className={`p-5 rounded-2xl border transition-all ${
                      isSubmitted
                        ? chosenIdx === correctIdx
                          ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/10'
                          : 'border-rose-500/40 bg-rose-500/5 dark:bg-rose-950/10'
                        : 'border-border bg-surface'
                    }`}
                  >
                    {/* Question Header */}
                    <div className="flex items-start gap-3 mb-3.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-extrabold text-xs">
                        {qIdx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary leading-relaxed">
                          {q.question_text || q.question || `Câu hỏi ${qIdx + 1}`}
                        </p>
                        {q.media_url && (
                          <div className="mt-2.5 max-w-md rounded-xl overflow-hidden border border-border">
                            {q.media_url.endsWith('.mp3') || q.media_url.endsWith('.wav') ? (
                              <audio controls src={q.media_url} className="w-full" />
                            ) : (
                              <img
                                src={q.media_url}
                                alt={`Question ${qIdx + 1}`}
                                className="w-full object-cover max-h-56"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-2 pl-9">
                      {options.map((opt, optIdx) => {
                        const isSelected = chosenIdx === optIdx
                        const isCorrectAnswer = isSubmitted && optIdx === correctIdx
                        const isWrongSelected = isSubmitted && isSelected && optIdx !== correctIdx

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={isSubmitted}
                            onClick={() => handleSelectOption(qIdx, optIdx)}
                            className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-3 cursor-pointer ${
                              isCorrectAnswer
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold'
                                : isWrongSelected
                                ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 line-through'
                                : isSelected
                                ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                                : 'border-border/70 hover:border-primary/50 bg-surface-subtle/30 text-text-secondary hover:text-text-primary'
                            }`}
                          >
                            <div
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[10px] font-bold ${
                                isCorrectAnswer
                                  ? 'bg-emerald-500 text-white border-emerald-500'
                                  : isWrongSelected
                                  ? 'bg-rose-500 text-white border-rose-500'
                                  : isSelected
                                  ? 'bg-primary text-white border-primary'
                                  : 'border-border text-text-tertiary bg-surface'
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </div>
                            <span className="flex-1 leading-snug">{opt}</span>
                          </button>
                        )
                      })}
                    </div>

                    {/* Explanation */}
                    {isSubmitted && q.explanation && (
                      <div className="mt-3.5 p-3 rounded-xl bg-surface-subtle border border-border/60 text-[11px] text-text-secondary space-y-1 pl-9">
                        <span className="font-bold text-primary flex items-center gap-1">
                          <HelpCircle size={12} /> Giải thích chi tiết:
                        </span>
                        <p className="leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border bg-surface-subtle/50 flex items-center justify-between shrink-0">
          <div className="text-xs text-text-tertiary flex items-center gap-1.5">
            <Clock size={14} />
            <span>
              Đã chọn: {Object.keys(selectedAnswers).length}/{rawQuestions.length} câu
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              onClick={onClose}
              className="rounded-xl text-xs font-semibold cursor-pointer"
            >
              {isSubmitted || rawQuestions.length === 0 ? 'Đóng' : 'Hủy bỏ'}
            </Button>

            {rawQuestions.length > 0 && !isSubmitted && (
              <Button
                onClick={handleSubmitTest}
                disabled={Object.keys(selectedAnswers).length === 0 || isSaving}
                className="rounded-xl bg-primary text-white hover:bg-primary-hover px-5 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Đang lưu kết quả...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Nộp bài & Chấm điểm</span>
                  </>
                )}
              </Button>
            )}

            {rawQuestions.length > 0 && isSubmitted && (
              <Button
                onClick={onClose}
                className="rounded-xl bg-primary text-white hover:bg-primary-hover px-5 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer"
              >
                <span>Tiếp tục học</span>
                <ArrowRight size={14} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
