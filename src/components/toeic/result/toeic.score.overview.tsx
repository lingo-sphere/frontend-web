// Hiển thị tổng quan điểm số TOEIC quy đổi ETS và các kỹ năng Listening, Reading, Speaking, Writing.

'use client'

import {
  Trophy,
  Sparkles,
  Headphones,
  BookOpen,
  Award,
  Mic,
  PenTool,
} from 'lucide-react'
import type { ExamResultMetrics } from '@/components/toeic/toeic.exam.result'

interface ToeicScoreOverviewProps {
  results: ExamResultMetrics
  levelLabel?: string
  targetBand?: string
  isVietnamese: boolean
}

export function ToeicScoreOverview({
  results,
  levelLabel,
  targetBand,
  isVietnamese,
}: ToeicScoreOverviewProps) {
  const listeningPercentage =
    results.listeningTotal > 0 ? Math.round((results.listeningCorrect / results.listeningTotal) * 100) : 0
  const readingPercentage =
    results.readingTotal > 0 ? Math.round((results.readingCorrect / results.readingTotal) * 100) : 0

  return (
    <div className="bg-gradient-to-b from-primary/10 via-primary/5 to-transparent p-6 sm:p-10 text-center border-b border-border/80">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold mb-4">
        <Sparkles className="w-3.5 h-3.5" />
        <span>{isVietnamese ? 'KẾT QUẢ ĐÁNH GIÁ NĂNG LỰC TOEIC' : 'TOEIC PLACEMENT RESULT'}</span>
      </div>

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary tracking-tight">
        {levelLabel
          ? isVietnamese
            ? `Trình Độ Hiện Tại: ${levelLabel}`
            : `Current Proficiency: ${levelLabel}`
          : isVietnamese
            ? 'Hoàn Thành Bài Kiểm Tra Đánh Giá Năng Lực'
            : 'Exam Assessment Completed'}
      </h1>

      <p className="mx-auto mt-2 max-w-2xl text-xs sm:text-sm text-text-secondary leading-relaxed">
        {isVietnamese
          ? 'Hệ thống LingoSphere đã phân tích kết quả bài làm và quy đổi sang thang điểm TOEIC chuẩn ETS (10 - 990 điểm) để định vị lộ trình học tập phù hợp nhất.'
          : 'LingoSphere system analyzed your submission and calculated your official ETS TOEIC scaled score (10 - 990) to match suitable learning pathways.'}
      </p>

      <div className="mt-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-stretch">
          <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 p-5 flex flex-col justify-between text-left shadow-2xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  <Headphones className="w-4 h-4" />
                  <span>{isVietnamese ? 'KỸ NĂNG NGHE' : 'LISTENING'}</span>
                </span>
                <span className="text-[11px] font-semibold text-text-tertiary">Thang điểm 495</span>
              </div>

              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                  {results.estimatedListening}
                </span>
                <span className="text-xs font-bold text-text-tertiary">/ 495</span>
              </div>

              <p className="mt-1 text-xs text-text-secondary">
                {isVietnamese ? 'Số câu trả lời đúng:' : 'Correct answers:'}{' '}
                <strong className="text-text-primary font-bold">
                  {results.listeningCorrect} / {results.listeningTotal}
                </strong>
              </p>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] font-medium text-text-tertiary mb-1">
                <span>{isVietnamese ? 'Độ chính xác' : 'Accuracy'}</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{listeningPercentage}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
                  style={{ width: `${listeningPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-primary/40 bg-surface p-6 flex flex-col justify-between items-center text-center shadow-md relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-primary to-emerald-500" />

            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2">
              <Trophy className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-wider text-text-tertiary block">
                {isVietnamese ? 'TỔNG ĐIỂM TOEIC QUY ĐỔI' : 'TOTAL ESTIMATED TOEIC'}
              </span>

              <div className="my-2 flex items-baseline justify-center gap-1.5">
                <span className="text-5xl sm:text-6xl font-black text-primary tracking-tight">
                  {results.estimatedTotal}
                </span>
                <span className="text-sm sm:text-base font-bold text-text-tertiary">/ 990</span>
              </div>

              {targetBand && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  <Award className="w-3.5 h-3.5" />
                  <span>Mục tiêu: {targetBand}</span>
                </span>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 w-full text-center">
              <span className="text-[11px] font-medium text-text-tertiary">
                {isVietnamese
                  ? `Quy đổi ETS chuẩn (${results.percentage}% độ chính xác toàn bài)`
                  : `ETS Scaled (${results.percentage}% overall accuracy)`}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 flex flex-col justify-between text-left shadow-2xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <BookOpen className="w-4 h-4" />
                  <span>{isVietnamese ? 'KỸ NĂNG ĐỌC' : 'READING'}</span>
                </span>
                <span className="text-[11px] font-semibold text-text-tertiary">Thang điểm 495</span>
              </div>

              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                  {results.estimatedReading}
                </span>
                <span className="text-xs font-bold text-text-tertiary">/ 495</span>
              </div>

              <p className="mt-1 text-xs text-text-secondary">
                {isVietnamese ? 'Số câu trả lời đúng:' : 'Correct answers:'}{' '}
                <strong className="text-text-primary font-bold">
                  {results.readingCorrect} / {results.readingTotal}
                </strong>
              </p>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] font-medium text-text-tertiary mb-1">
                <span>{isVietnamese ? 'Độ chính xác' : 'Accuracy'}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{readingPercentage}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-500"
                  style={{ width: `${readingPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {(results.estimatedSpeaking !== undefined || results.estimatedWriting !== undefined) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-left">
            {results.estimatedSpeaking !== undefined && (
              <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                      {isVietnamese ? 'Kỹ Năng Nói (Speaking)' : 'Speaking Skill'}
                    </p>
                    <p className="text-[11px] text-text-secondary">
                      {results.speakingCompleted ?? 0}/{results.speakingTotal ?? 0} bài đã nộp
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    {results.estimatedSpeaking}
                  </span>
                  <span className="text-xs font-semibold text-text-tertiary"> / 200</span>
                </div>
              </div>
            )}

            {results.estimatedWriting !== undefined && (
              <div className="p-4 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-purple-800 dark:text-purple-300">
                      {isVietnamese ? 'Kỹ Năng Viết (Writing)' : 'Writing Skill'}
                    </p>
                    <p className="text-[11px] text-text-secondary">
                      {results.writingCompleted ?? 0}/{results.writingTotal ?? 0} bài đã nộp
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                    {results.estimatedWriting}
                  </span>
                  <span className="text-xs font-semibold text-text-tertiary"> / 200</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
