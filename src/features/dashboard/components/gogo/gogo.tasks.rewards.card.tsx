// Component thẻ nhiệm vụ học tập hàng ngày và phần thưởng chuỗi chuyên cần theo phong cách Gogo Tasks Card hỗ trợ đa ngôn ngữ.
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckSquare, Flame, Gift, Check } from 'lucide-react'
import { useLanguage } from '@/hooks/use.language'

interface GogoTasksRewardsCardProps {
  currentStreak: number
  onAction?: (msg: string) => void
}

export function GogoTasksRewardsCard({ currentStreak = 0, onAction }: GogoTasksRewardsCardProps) {
  const { isVietnamese } = useLanguage()
  const isVi = isVietnamese

  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    'task-vocab': false,
    'task-dictation': false,
    'task-speaking': false,
  })

  const toggleTask = (id: string) => {
    const next = !completedTasks[id]
    setCompletedTasks((prev) => ({ ...prev, [id]: next }))
    if (next && onAction) {
      onAction(isVi ? 'Đã ghi nhận hoàn thành mục tiêu học tập!' : 'Recorded daily study objective completion!')
    }
  }

  const tasks = [
    {
      id: 'task-vocab',
      label: isVi ? 'Ôn 10 từ vựng Spaced Repetition' : 'Review 10 SRS vocabulary cards',
      time: isVi ? '5 phút' : '5 mins',
      href: '/vocabulary',
    },
    {
      id: 'task-dictation',
      label: isVi ? 'Luyện 1 bài nghe chép chính tả' : 'Complete 1 dictation exercise',
      time: isVi ? '10 phút' : '10 mins',
      href: '/listening',
    },
    {
      id: 'task-speaking',
      label: isVi ? 'Luyện phát âm AI Whisper' : 'Practice AI pronunciation with Whisper',
      time: isVi ? '10 phút' : '10 mins',
      href: '/speaking',
    },
  ]

  const milestones = [
    { days: 3, reward: '+50 XP', isDone: currentStreak >= 3 },
    { days: 7, reward: '+150 XP', isDone: currentStreak >= 7 },
    { days: 14, reward: isVi ? 'Huy hiệu Chiến Binh' : 'Warrior Badge', isDone: currentStreak >= 14 },
    { days: 30, reward: isVi ? 'Gói VIP 7 ngày' : '7-Day VIP Access', isDone: currentStreak >= 30 },
  ]

  return (
    <div className="rounded-3xl bg-surface border border-border p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <CheckSquare className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-base font-bold text-text-primary">
              {isVi ? 'Nhiệm Vụ & Thưởng Streak' : 'Daily Tasks & Streak Rewards'}
            </h3>
            <p className="text-xs text-text-secondary">
              {isVi ? 'Mục tiêu học tập duy trì chuỗi mỗi ngày' : 'Daily goals to maintain your streak'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/15 px-2.5 py-1 rounded-xl">
          <Flame className="w-3.5 h-3.5" />
          <span>{currentStreak} {isVi ? 'ngày' : 'days'}</span>
        </div>
      </div>

      <div className="space-y-2.5 mb-5">
        {tasks.map((t) => {
          const isDone = completedTasks[t.id]
          return (
            <div
              key={t.id}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                isDone
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-300'
                  : 'bg-surface-subtle/50 hover:bg-surface-subtle border-border/80 text-text-primary'
              }`}
              onClick={() => toggleTask(t.id)}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                    isDone
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-border bg-surface'
                  }`}
                >
                  {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className={`text-xs font-semibold ${isDone ? 'line-through opacity-70' : ''}`}>
                  {t.label}
                </span>
              </div>

              <Link
                href={t.href}
                onClick={(e) => e.stopPropagation()}
                className="text-[11px] text-primary hover:underline font-bold shrink-0"
              >
                {isVi ? 'Vào học' : 'Start'}
              </Link>
            </div>
          )
        })}
      </div>

      <div className="pt-3 border-t border-border">
        <div className="flex items-center justify-between text-xs font-bold text-text-secondary mb-2.5">
          <span className="flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-amber-500" />
            <span>{isVi ? 'Cột mốc chuỗi chuyên cần' : 'Streak Milestones'}</span>
          </span>
          <span className="text-[11px] text-text-tertiary">{isVi ? 'Mở khóa quà' : 'Unlock Gifts'}</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {milestones.map((m) => (
            <div
              key={m.days}
              className={`p-2 rounded-xl border text-center transition-all ${
                m.isDone
                  ? 'bg-amber-50 dark:bg-amber-500/15 border-amber-300 dark:border-amber-700/60 text-amber-700 dark:text-amber-300'
                  : 'bg-surface-subtle border-border/60 text-text-tertiary opacity-70'
              }`}
            >
              <div className="text-[10px] font-bold uppercase">{m.days} {isVi ? 'ngày' : 'days'}</div>
              <div className="text-[11px] font-extrabold truncate mt-0.5">{m.reward}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
