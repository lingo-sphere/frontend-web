/**
 * @file course.sidebar.challenge.test.card.tsx
 * @description Thành phần hiển thị card bài thi thử thách mở khóa chương học trong thanh bên
 */

import { CheckCircle2, Crown, FileText, Lock, Mic, RotateCcw, Trophy, Volume2, Zap } from 'lucide-react'
import type { Chapter } from '@/types/course'

interface CourseSidebarChallengeTestCardProps {
  chapter: Chapter
  chIdx: number
  questionsCount: number
  passingScore: number
  challengeScore: number
  isPassedChallenge: boolean
  hasTakenChallenge: boolean
  isChapterLocked: boolean
  isEnrolled: boolean
  prevChapterOrder: number | string
  onTakeTest?: () => void
}

export function CourseSidebarChallengeTestCard({
  chapter,
  chIdx,
  questionsCount,
  passingScore,
  challengeScore,
  isPassedChallenge,
  hasTakenChallenge,
  isChapterLocked,
  isEnrolled,
  prevChapterOrder,
  onTakeTest,
}: CourseSidebarChallengeTestCardProps) {
  if (questionsCount <= 0) return null

  return (
    <div
      onClick={onTakeTest}
      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
        isChapterLocked
          ? 'border-amber-500/25 bg-amber-500/5 opacity-80'
          : isPassedChallenge
            ? 'border-emerald-500/50 bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-surface hover:border-emerald-500/70 shadow-xs'
            : hasTakenChallenge
              ? 'border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-surface hover:border-amber-500/60 shadow-xs'
              : 'border-primary/40 bg-gradient-to-r from-primary/15 via-primary/5 to-surface hover:border-primary/60 hover:shadow-xs'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-xs ${
            isChapterLocked
              ? 'bg-amber-500/80'
              : isPassedChallenge
                ? 'bg-emerald-600 shadow-emerald-600/30'
                : hasTakenChallenge
                  ? 'bg-amber-500 shadow-amber-500/30'
                  : 'bg-primary shadow-primary/30'
          }`}
        >
          {isChapterLocked ? (
            <Lock size={14} />
          ) : isPassedChallenge ? (
            <CheckCircle2 size={16} />
          ) : hasTakenChallenge ? (
            <RotateCcw size={15} />
          ) : isEnrolled ? (
            <Trophy size={15} />
          ) : (
            <Lock size={14} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-xs font-bold transition-colors whitespace-nowrap ${
                isPassedChallenge
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : hasTakenChallenge
                    ? 'text-amber-700 dark:text-amber-300'
                    : 'text-text-primary group-hover:text-primary'
              }`}
            >
              Bài test thử thách cuối chương
            </span>
            {isPassedChallenge ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                <Crown size={10} className="text-amber-500 shrink-0" />
                <span>Đạt {challengeScore}%</span>
              </span>
            ) : hasTakenChallenge ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-emerald-500/30 shrink-0">
                <RotateCcw size={10} className="text-amber-500 shrink-0" />
                <span>Chưa đạt ({challengeScore}%)</span>
              </span>
            ) : (
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                Yêu cầu {passingScore}%
              </span>
            )}
            {Boolean(
              chapter.test_audio_url || chapter.challenge_audio_url || chapter.audio_url
            ) && (
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 shrink-0">
                <Volume2 size={9} className="text-indigo-500" />
                <span>Audio bài thi</span>
              </span>
            )}
            {Boolean(
              chapter.test_speaking_prompt || chapter.test_speaking_file_url
            ) && (
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200/60 shrink-0">
                <Mic size={9} className="text-pink-500" />
                <span>Speaking</span>
              </span>
            )}
            {Boolean(
              chapter.test_writing_prompt || chapter.test_writing_file_url
            ) && (
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 shrink-0">
                <FileText size={9} className="text-purple-500" />
                <span>Writing</span>
              </span>
            )}
          </div>
          <p className="text-[10px] text-text-tertiary mt-0.5 truncate">
            {isChapterLocked
              ? `Cần vượt qua bài test của Chương ${prevChapterOrder} để mở khóa`
              : isPassedChallenge
                ? `👑 Kỷ lục: ${challengeScore}% • Đã hoàn thành thử thách & mở khóa chương tiếp theo`
                : hasTakenChallenge
                  ? `Cần tối thiểu ${passingScore}% để mở khóa chương tiếp theo • Bấm để làm lại`
                  : `${questionsCount} câu hỏi • Vượt qua ${passingScore}% để mở khóa chương tiếp theo`}
          </p>
        </div>
      </div>

      {isChapterLocked ? (
        <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-[11px] flex items-center gap-1 whitespace-nowrap shrink-0">
          <Lock size={11} /> Khóa
        </span>
      ) : isEnrolled ? (
        isPassedChallenge ? (
          <span className="px-3 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-500/30 transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-2xs">
            <RotateCcw size={11} />
            <span>Luyện lại</span>
          </span>
        ) : hasTakenChallenge ? (
          <span className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-xs transition-all whitespace-nowrap shrink-0 flex items-center gap-1">
            <RotateCcw size={11} />
            <span>Làm lại ngay</span>
          </span>
        ) : (
          <span className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-[11px] shadow-xs transition-all whitespace-nowrap shrink-0 flex items-center gap-1">
            <Zap size={11} />
            <span>Làm thử thách</span>
          </span>
        )
      ) : (
        <span className="px-2.5 py-1 rounded-xl bg-slate-500/15 text-slate-400 font-bold text-[11px] flex items-center gap-1 whitespace-nowrap shrink-0">
          <Lock size={11} /> Khóa
        </span>
      )}
    </div>
  )
}
