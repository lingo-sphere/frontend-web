/**
 * @file course.sidebar.final.exam.card.tsx
 * @description Card kích hoạt và hiển thị trạng thái bài thi tốt nghiệp cuối khóa trong thanh bên
 */

import { CheckCircle2, Crown, FileText, Lock, Mic, RotateCcw, Trophy, Volume2 } from 'lucide-react'

interface CourseSidebarFinalExamCardProps {
  finalTestQuestionsCount: number
  finalTestScore?: number
  finalTestAttempts?: any[]
  finalTestAudioUrl?: string
  finalTestSpeakingPrompt?: string
  finalTestSpeakingFileUrl?: string
  finalTestWritingPrompt?: string
  finalTestWritingFileUrl?: string
  allChaptersPassed: boolean
  isEnrolled: boolean
  onTakeTest?: () => void
}

export function CourseSidebarFinalExamCard({
  finalTestQuestionsCount,
  finalTestScore,
  finalTestAttempts = [],
  finalTestAudioUrl,
  finalTestSpeakingPrompt,
  finalTestSpeakingFileUrl,
  finalTestWritingPrompt,
  finalTestWritingFileUrl,
  allChaptersPassed,
  isEnrolled,
  onTakeTest,
}: CourseSidebarFinalExamCardProps) {
  if (finalTestQuestionsCount <= 0) return null

  return (
    <div className="pt-2">
      <div
        onClick={onTakeTest}
        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
          !allChaptersPassed
            ? 'border-amber-500/25 bg-amber-500/5 opacity-80'
            : finalTestScore !== undefined && finalTestScore > 0
              ? 'border-emerald-500/50 bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-surface hover:border-emerald-500/70 shadow-xs'
              : 'border-emerald-500/40 bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-surface hover:border-emerald-500/60 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-xs ${
              !allChaptersPassed
                ? 'bg-amber-500/80'
                : finalTestScore !== undefined && finalTestScore > 0
                  ? 'bg-emerald-600 shadow-emerald-600/30'
                  : 'bg-emerald-600 shadow-emerald-600/30'
            }`}
          >
            {!allChaptersPassed ? (
              <Lock size={14} />
            ) : finalTestScore !== undefined && finalTestScore > 0 ? (
              <CheckCircle2 size={16} />
            ) : (
              <Trophy size={16} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`text-xs font-bold transition-colors whitespace-nowrap ${
                  finalTestScore !== undefined && finalTestScore > 0
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-text-primary group-hover:text-emerald-600'
                }`}
              >
                Bài thi tốt nghiệp cuối khóa (Exit Test)
              </span>
              {!allChaptersPassed ? (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Lock size={9} />
                  Khóa
                </span>
              ) : finalTestScore !== undefined && finalTestScore > 0 ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                  <Crown size={10} className="text-amber-500 shrink-0" />
                  <span>Kỷ lục: {finalTestScore}%</span>
                </span>
              ) : null}
              {Boolean(finalTestAudioUrl) && (
                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 shrink-0">
                  <Volume2 size={9} className="text-indigo-500" />
                  <span>Audio đề thi</span>
                </span>
              )}
              {Boolean(finalTestSpeakingPrompt || finalTestSpeakingFileUrl) && (
                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200/60 shrink-0">
                  <Mic size={9} className="text-pink-500" />
                  <span>Speaking</span>
                </span>
              )}
              {Boolean(finalTestWritingPrompt || finalTestWritingFileUrl) && (
                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 shrink-0">
                  <FileText size={9} className="text-purple-500" />
                  <span>Writing</span>
                </span>
              )}
            </div>
            <p className="text-[10px] text-text-tertiary mt-0.5 truncate">
              {!allChaptersPassed
                ? 'Khóa • Cần vượt qua bài test thử thách của tất cả các chương để mở khóa'
                : finalTestScore !== undefined && finalTestScore > 0
                  ? `👑 Kỷ lục cao nhất: ${finalTestScore}%${Array.isArray(finalTestAttempts) && finalTestAttempts.length > 0 ? ` • ${finalTestAttempts.length} lần thi` : ''} • Bấm để xem lịch sử & thi lại`
                  : `${finalTestQuestionsCount} câu • Đánh giá năng lực toàn khóa để cấp chứng chỉ`}
            </p>
          </div>
        </div>

        {isEnrolled ? (
          !allChaptersPassed ? (
            <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center gap-1 whitespace-nowrap shrink-0">
              <Lock size={11} /> Khóa
            </span>
          ) : finalTestScore !== undefined && finalTestScore > 0 ? (
            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-500/30 transition-all whitespace-nowrap shrink-0 flex items-center gap-1">
              <RotateCcw size={12} />
              <span>Thi lại</span>
            </span>
          ) : (
            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 transition-all whitespace-nowrap shrink-0 flex items-center gap-1">
              <Trophy size={12} />
              <span>Bắt đầu làm</span>
            </span>
          )
        ) : (
          <span className="px-2.5 py-1 rounded-xl bg-slate-500/15 text-slate-400 font-bold text-xs flex items-center gap-1 whitespace-nowrap shrink-0">
            <Lock size={11} /> Khóa
          </span>
        )}
      </div>
    </div>
  )
}
