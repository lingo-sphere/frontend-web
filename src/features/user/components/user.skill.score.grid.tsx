// Component hiển thị lưới điểm chi tiết 4 kỹ năng Listening, Reading, Speaking và Writing.

import { Headphones, BookOpen, Mic, FileEdit } from 'lucide-react'

interface UserSkillScoreGridProps {
  listeningScore: number
  readingScore: number
  speakingScore: number
  writingScore: number
  hasTested: boolean
  selectedSkillsType: '2SKILLS' | '4SKILLS'
}

export function UserSkillScoreGrid({
  listeningScore,
  readingScore,
  speakingScore,
  writingScore,
  hasTested,
  selectedSkillsType,
}: UserSkillScoreGridProps) {
  const is4Skills = selectedSkillsType === '4SKILLS'

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Chi tiết điểm từng kỹ năng:
        </h4>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Đang xem:{' '}
          <strong className="text-teal-700 dark:text-teal-300">
            {is4Skills ? 'TOEIC 4 Kỹ Năng' : 'TOEIC 2 Kỹ Năng'}
          </strong>
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/30 dark:bg-indigo-950/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-indigo-500" />
            <div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 block">Listening</span>
              <span className="text-[10px] text-slate-400">Tối đa 495</span>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
            {hasTested && listeningScore > 0 ? `${listeningScore} / 495` : 'Chưa có'}
          </span>
        </div>

        <div className="p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/30 dark:bg-indigo-950/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 block">Reading</span>
              <span className="text-[10px] text-slate-400">Tối đa 495</span>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
            {hasTested && readingScore > 0 ? `${readingScore} / 495` : 'Chưa có'}
          </span>
        </div>

        <div
          className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
            is4Skills
              ? 'border-teal-200 dark:border-teal-900/50 bg-teal-50/40 dark:bg-teal-950/30'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 opacity-85'
          }`}
        >
          <div className="flex items-center gap-2">
            <Mic
              className={`w-4 h-4 ${is4Skills ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}
            />
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 block">Speaking</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 font-bold">
                  4KN
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Tối đa 200</span>
            </div>
          </div>
          <span
            className={`text-xs font-bold ${
              is4Skills ? 'text-teal-700 dark:text-teal-300' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {hasTested && speakingScore > 0
              ? `${speakingScore} / 200`
              : is4Skills
                ? 'Chưa có'
                : 'Chưa đánh giá'}
          </span>
        </div>

        <div
          className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
            is4Skills
              ? 'border-teal-200 dark:border-teal-900/50 bg-teal-50/40 dark:bg-teal-950/30'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 opacity-85'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileEdit
              className={`w-4 h-4 ${is4Skills ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}
            />
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 block">Writing</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 font-bold">
                  4KN
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Tối đa 200</span>
            </div>
          </div>
          <span
            className={`text-xs font-bold ${
              is4Skills ? 'text-teal-700 dark:text-teal-300' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {hasTested && writingScore > 0
              ? `${writingScore} / 200`
              : is4Skills
                ? 'Chưa có'
                : 'Chưa đánh giá'}
          </span>
        </div>
      </div>
    </div>
  )
}
