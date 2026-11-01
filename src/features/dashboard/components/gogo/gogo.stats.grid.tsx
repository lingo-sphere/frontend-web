// Component lưới 6 thẻ chỉ số học tập tổng quan theo phong cách Gogo Analytics.
'use client'

import React from 'react'
import { Target, BookOpen, Flame, Award, Layers, Compass, TrendingUp } from 'lucide-react'
import type { ProgressMetrics, VocabStatsSummary } from '@/features/progress/hooks/use.progress.data'

interface GogoStatsGridProps {
  metrics: ProgressMetrics
  vocabStats?: VocabStatsSummary | null
  listeningScore?: number
  readingScore?: number
  speakingScore?: number
  writingScore?: number
  placementSkillsType?: '2SKILLS' | '4SKILLS'
}

export function GogoStatsGrid({
  metrics,
  vocabStats,
  listeningScore = 0,
  readingScore = 0,
  speakingScore = 0,
  writingScore = 0,
  placementSkillsType = '2SKILLS',
}: GogoStatsGridProps) {
  const cards = [
    {
      id: 'target-score',
      title: 'Điểm Số Mục Tiêu',
      primaryValue: `${metrics.currentScore}`,
      secondaryValue: `/ ${metrics.targetScore}`,
      description: `Đạt ${metrics.scoreProgressPercent}% chặng đường TOEIC`,
      progress: Math.min(100, metrics.scoreProgressPercent),
      progressColor: 'bg-emerald-500',
      icon: Target,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-500/15',
    },
    {
      id: 'course-progress',
      title: 'Tiến Độ Khóa Học',
      primaryValue: `${metrics.avgProgress}%`,
      secondaryValue: `trung bình`,
      description: `${metrics.completedCourses}/${metrics.totalCourses} khóa học đã hoàn thành`,
      progress: Math.min(100, metrics.avgProgress),
      progressColor: 'bg-teal-500',
      icon: BookOpen,
      iconColor: 'text-teal-600 dark:text-teal-400',
      iconBg: 'bg-teal-50 dark:bg-teal-500/15',
    },
    {
      id: 'streak-days',
      title: 'Chuyên Cần & Streak',
      primaryValue: `${metrics.streak}`,
      secondaryValue: 'ngày liên tiếp',
      description: `Tích lũy ${metrics.xp.toLocaleString('vi-VN')} XP • Cấp độ ${metrics.level}`,
      progress: Math.min(100, (metrics.streak / 30) * 100),
      progressColor: 'bg-amber-500',
      icon: Flame,
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-50 dark:bg-amber-500/15',
    },
    {
      id: 'assessment',
      title: 'Khảo Thí & Đánh Giá',
      primaryValue: `${metrics.totalAttemptsCount}`,
      secondaryValue: 'lần làm bài',
      description: `Tỷ lệ đạt chuẩn: ${metrics.passRate}% bài thi`,
      progress: Math.min(100, metrics.passRate),
      progressColor: 'bg-purple-500',
      icon: Award,
      iconColor: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-50 dark:bg-purple-500/15',
    },
    {
      id: 'vocab-srs',
      title: 'Từ Vựng SRS Đã Thuộc',
      primaryValue: `${(vocabStats?.learned_words ?? 0).toLocaleString('vi-VN')}`,
      secondaryValue: 'từ vựng',
      description: `${vocabStats?.review_due ?? 0} thẻ đến hạn ôn hôm nay`,
      progress: vocabStats?.total_cards ? Math.min(100, Math.round(((vocabStats.learned_words || 0) / vocabStats.total_cards) * 100)) : 0,
      progressColor: 'bg-cyan-500',
      icon: Layers,
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      iconBg: 'bg-cyan-50 dark:bg-cyan-500/15',
    },
    {
      id: 'skills-readiness',
      title: 'Hồ Sơ Năng Lực',
      primaryValue: placementSkillsType === '4SKILLS' ? '4 Kỹ Năng' : '2 Kỹ Năng',
      secondaryValue: 'TOEIC',
      description: `Nghe ${listeningScore} • Đọc ${readingScore} • Nói ${speakingScore} • Viết ${writingScore}`,
      progress: Math.min(100, Math.round(((listeningScore + readingScore + speakingScore + writingScore) / 4)), 100),
      progressColor: 'bg-indigo-500',
      icon: Compass,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-50 dark:bg-indigo-500/15',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => {
        const IconComponent = card.icon
        return (
          <div
            key={card.id}
            className="rounded-2xl bg-surface border border-border p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-text-secondary truncate">
                  {card.title}
                </span>
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg} ${card.iconColor} group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-4 h-4" />
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-2xl font-extrabold text-text-primary tracking-tight">
                  {card.primaryValue}
                </span>
                <span className="text-[11px] font-medium text-text-tertiary truncate">
                  {card.secondaryValue}
                </span>
              </div>

              <p className="text-[11px] text-text-secondary line-clamp-1 mb-3">
                {card.description}
              </p>
            </div>

            <div className="w-full bg-surface-subtle rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${card.progressColor}`}
                style={{ width: `${card.progress}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

