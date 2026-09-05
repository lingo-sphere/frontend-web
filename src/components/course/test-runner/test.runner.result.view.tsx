/**
 * @file test.runner.result.view.tsx
 * @description Giao diện hiển thị kết quả bài thi, điểm số đạt được, tỷ lệ chính xác và phân tích chi tiết
 */

'use client'

import {
  CheckCircle2,
  AlertCircle,
  History,
  RotateCcw,
  Crown,
  TrendingUp,
  Bot,
  ChevronDown,
  ChevronUp,
  Loader2,
  Target,
  XCircle,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  TestAttemptItem,
  WrongQuestionItem,
  AiExplanationsData,
} from './test.runner.types'

interface TestRunnerResultViewProps {
  scoreResult: {
    correctCount: number
    totalQuestions: number
    score: number
    isPassed: boolean
  }
  testType: string
  passingScore: number
  bestScore: number
  isNewHighScore: boolean
  progressionNote: string | null
  growthDiff: { scoreDiff: number; percent: number } | null
  wrongQuestionsList: WrongQuestionItem[]
  isLoadingAi: boolean
  showAiDetails: boolean
  aiExplanations: AiExplanationsData | null
  attemptsCount: number
  onShowHistory: () => void
  onRetry: () => void
  onExplainMistakes: () => void
  onToggleAiDetails: () => void
}

export function TestRunnerResultView({
  scoreResult,
  testType,
  passingScore,
  bestScore,
  isNewHighScore,
  progressionNote,
  growthDiff,
  wrongQuestionsList,
  isLoadingAi,
  showAiDetails,
  aiExplanations,
  attemptsCount,
  onShowHistory,
  onRetry,
  onExplainMistakes,
  onToggleAiDetails,
}: TestRunnerResultViewProps) {
  return (
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
            {scoreResult.isPassed ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base font-extrabold">
                {scoreResult.isPassed
                  ? testType === 'challenge'
                    ? '🎉 Xuất sắc! Bạn đã vượt qua bài test thử thách của chương!'
                    : testType === 'final-test'
                    ? '🎉 Chúc mừng bạn đã hoàn thành bài thi tốt nghiệp cuối khóa!'
                    : '🎉 Chúc mừng! Bạn đã hoàn thành bài test!'
                  : testType === 'challenge'
                  ? `⚡ Chưa đạt yêu cầu để mở khóa chương sau (Cần tối thiểu ${passingScore}%)`
                  : '⚡ Chưa đạt điểm chuẩn!'}
              </h4>
              {isNewHighScore && (
                <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                  <Crown size={12} /> Kỷ lục mới!
                </span>
              )}
            </div>
            <p className="text-xs opacity-90 mt-0.5">
              Lần thi này: Đúng {scoreResult.correctCount}/{scoreResult.totalQuestions} câu (
              <strong>{scoreResult.score}%</strong>) • Điểm yêu cầu:{' '}
              <strong>{passingScore}%</strong> • 👑 Điểm cao nhất:{' '}
              <strong>{bestScore}%</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button
            type="button"
            onClick={onShowHistory}
            variant="outline"
            size="sm"
            className="rounded-xl border-border hover:bg-surface text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <History size={13} className="text-primary" />
            <span>Lịch sử ({attemptsCount})</span>
          </Button>

          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className={`rounded-xl shrink-0 flex items-center gap-1.5 cursor-pointer text-xs font-bold ${
              scoreResult.isPassed
                ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10'
                : 'border-amber-500/60 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15 ring-1 ring-amber-500/30'
            }`}
          >
            <RotateCcw size={14} />
            <span>{scoreResult.isPassed ? 'Luyện tập lại' : 'Làm lại thử thách ngay'}</span>
          </Button>
        </div>
      </div>

      {isNewHighScore && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/5 border border-amber-500/30 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs shrink-0">
            <Crown size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-extrabold text-amber-900 dark:text-amber-200">
              Kỷ lục mới! Điểm số cao nhất từ trước đến nay!
            </h5>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
              Bạn đã thiết lập cột mốc điểm cao nhất mới: <strong>{bestScore}%</strong>. Điểm kỷ
              lục này đã được cập nhật vào hồ sơ khóa học của bạn.
            </p>
          </div>
        </div>
      )}

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
                  {growthDiff.scoreDiff >= 0 ? `+${growthDiff.scoreDiff}` : growthDiff.scoreDiff}{' '}
                  điểm ({growthDiff.percent >= 0 ? `+${growthDiff.percent}` : growthDiff.percent}%)
                </span>
              )}
            </div>
            <p className="text-xs text-indigo-800 dark:text-indigo-300 mt-1 leading-relaxed font-medium">
              {progressionNote}
            </p>
          </div>
        </div>
      )}

      {wrongQuestionsList.length > 0 && (
        <div className="p-4 rounded-2xl bg-purple-50/90 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-600 text-white shadow-xs">
                <Bot size={18} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-purple-950 dark:text-purple-200 flex items-center gap-2">
                  <span>Gia sư AI: Giải thích lỗi sai & Hướng dẫn học tập</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200/80 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 font-semibold">
                    {wrongQuestionsList.length} câu chưa đúng
                  </span>
                </h5>
                <p className="text-[11px] text-purple-700 dark:text-purple-300 mt-0.5">
                  {isLoadingAi
                    ? 'Đang phân tích nguyên nhân sai và đề xuất nội dung bạn nên chú trọng học thêm...'
                    : aiExplanations?.summary ||
                      'Hệ thống đã phân tích chi tiết lỗi sai và chủ điểm kiến thức cần ôn tập.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={onExplainMistakes}
                disabled={isLoadingAi}
                variant="outline"
                size="sm"
                className="rounded-xl border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 text-xs font-semibold cursor-pointer h-8 px-2.5"
                title="Phân tích lại bằng AI"
              >
                <RotateCcw size={12} className={isLoadingAi ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Phân tích lại</span>
              </Button>
              {aiExplanations && (
                <Button
                  onClick={onToggleAiDetails}
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-purple-700 dark:text-purple-300 text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer h-8 px-2.5"
                >
                  <span>{showAiDetails ? 'Thu gọn' : 'Xem toàn bộ'}</span>
                  {showAiDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </Button>
              )}
            </div>
          </div>

          {isLoadingAi && !aiExplanations && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-purple-200/60 text-xs text-purple-800 dark:text-purple-300 animate-pulse">
              <Loader2
                size={15}
                className="animate-spin text-purple-600 dark:text-purple-400 shrink-0"
              />
              <span>
                Gia sư AI đang đối chiếu đáp án, bóc tách nguyên nhân sai và đề xuất các chủ điểm bạn
                nên chú trọng học thêm...
              </span>
            </div>
          )}

          {aiExplanations && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {aiExplanations.overall_advice && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-100/90 to-indigo-100/90 dark:from-purple-900/40 dark:to-indigo-900/40 border border-purple-300/80 dark:border-purple-700/60 text-xs space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-1.5 font-bold text-purple-950 dark:text-purple-100">
                    <Target size={15} className="text-purple-600 dark:text-purple-400 shrink-0" />
                    <span>🎯 Nên chú trọng học thêm chỗ nào (Định hướng từ AI):</span>
                  </div>
                  <p className="text-[12px] text-purple-950 dark:text-purple-200 leading-relaxed font-medium pl-5">
                    {aiExplanations.overall_advice}
                  </p>
                </div>
              )}

              {showAiDetails && (
                <div className="pt-2 border-t border-purple-200/60 dark:border-purple-800/40 space-y-2.5">
                  <span className="text-[11px] font-bold text-purple-900 dark:text-purple-300 block uppercase tracking-wider">
                    Danh sách chi tiết các câu sai & Chủ điểm kiến thức:
                  </span>
                  {aiExplanations.explanations.map((item, exIdx) => (
                    <div
                      key={exIdx}
                      className="p-3.5 rounded-xl bg-white/95 dark:bg-slate-900/85 border border-purple-200/70 dark:border-purple-800/50 space-y-2 text-xs shadow-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-text-primary">
                        <span className="text-purple-950 dark:text-purple-200">
                          Câu {item.question_number}: {item.question_text}
                        </span>
                        {item.recommended_topic && (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/70 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700 flex items-center gap-1">
                            <Target size={10} className="text-purple-600 dark:text-purple-400" />
                            <span>Chủ điểm: {item.recommended_topic}</span>
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/50 text-rose-800 dark:text-rose-200 space-y-0.5">
                          <div className="flex items-center gap-1 font-bold text-rose-700 dark:text-rose-300">
                            <XCircle size={12} className="shrink-0" />
                            <span>❌ Bạn đã chọn: {item.user_selected}</span>
                          </div>
                          <p className="leading-relaxed opacity-95 pl-4">{item.why_wrong}</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-200 space-y-0.5">
                          <div className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300">
                            <CheckCircle size={12} className="shrink-0" />
                            <span>✅ Đáp án đúng: {item.correct_answer}</span>
                          </div>
                          <p className="leading-relaxed opacity-95 pl-4">{item.why_correct}</p>
                        </div>
                      </div>

                      {(item.study_focus || item.recommended_topic) && (
                        <div className="p-2.5 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 text-indigo-950 dark:text-indigo-200 text-[11px] leading-relaxed flex items-start gap-1.5">
                          <Target
                            size={12}
                            className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5"
                          />
                          <div>
                            <strong>Nên chú trọng học thêm: </strong>
                            {item.study_focus ||
                              `Cần ôn lại kỹ chủ điểm "${item.recommended_topic}" và luyện tập thêm bài tập liên quan.`}
                          </div>
                        </div>
                      )}

                      {item.trap_identified && (
                        <div className="px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 text-amber-900 dark:text-amber-200 text-[11px] flex items-center gap-1.5">
                          <span className="font-bold">⚠️ Bẫy cần tránh:</span>
                          <span>{item.trap_identified}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
