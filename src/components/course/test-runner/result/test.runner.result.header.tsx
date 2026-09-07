// Hiển thị thông báo đạt hoặc chưa đạt, điểm số, kỷ lục và đánh giá tiến độ bài kiểm tra khóa học.

'use client'

import {
  CheckCircle2,
  AlertCircle,
  History,
  RotateCcw,
  Crown,
  Target,
  XCircle,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TestRunnerResultHeaderProps {
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
  attemptsCount: number
  progressionNote: string | null
  growthDiff: { scoreDiff: number; percent: number } | null
  onShowHistory: () => void
  onRetry: () => void
}

export function TestRunnerResultHeader({
  scoreResult,
  testType,
  passingScore,
  bestScore,
  isNewHighScore,
  attemptsCount,
  progressionNote,
  growthDiff,
  onShowHistory,
  onRetry,
}: TestRunnerResultHeaderProps) {
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Câu đúng</span>
            <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
              {scoreResult.correctCount}
              <span className="text-xs font-semibold text-emerald-600/80 dark:text-emerald-400/80 ml-1">
                / {scoreResult.totalQuestions} câu
              </span>
            </div>
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {scoreResult.totalQuestions > 0 ? Math.round((scoreResult.correctCount / scoreResult.totalQuestions) * 100) : 0}% chính xác
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 dark:bg-rose-950/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-rose-800 dark:text-rose-300">Câu sai</span>
            <div className="p-1 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400">
              <XCircle size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-rose-700 dark:text-rose-300">
              {Math.max(0, scoreResult.totalQuestions - scoreResult.correctCount)}
              <span className="text-xs font-semibold text-rose-600/80 dark:text-rose-400/80 ml-1">
                / {scoreResult.totalQuestions} câu
              </span>
            </div>
            <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
              {scoreResult.totalQuestions > 0 ? Math.round((Math.max(0, scoreResult.totalQuestions - scoreResult.correctCount) / scoreResult.totalQuestions) * 100) : 0}% cần cải thiện
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl border border-border bg-surface shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-text-secondary">Điểm số</span>
            <div className="p-1 rounded-lg bg-primary/10 text-primary">
              <Target size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-primary">
              {scoreResult.score}%
            </div>
            <p className="text-[11px] font-semibold text-text-tertiary mt-0.5">
              {scoreResult.isPassed ? 'Đạt chuẩn yêu cầu' : `Cần tối thiểu ${passingScore}%`}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Kỷ lục điểm</span>
            <div className="p-1 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Crown size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-amber-700 dark:text-amber-300">
              {bestScore}%
            </div>
            <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 mt-0.5">
              {isNewHighScore ? 'Kỷ lục mới vừa lập!' : 'Cột mốc cao nhất'}
            </p>
          </div>
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
    </div>
  )
}
