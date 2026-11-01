// Trang chủ phân tích học tập và năng lực kỹ năng học viên mô phỏng toàn diện theo mẫu Gogo Analytics.
'use client'

import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useNavigate } from '@/lib/navigation'
import { useProgressData } from '@/features/progress/hooks/use.progress.data'
import { progressService } from '@/features/progress/services/progress.service'
import type { SkillsSummary, WeaknessAnalysis, PracticeDashboardData } from '@/features/progress/services/progress.service'
import { GogoWelcomeHero } from '@/features/dashboard/components/gogo/gogo.welcome.hero'
import { GogoStatsGrid } from '@/features/dashboard/components/gogo/gogo.stats.grid'
import { GogoSalesCapsuleCard } from '@/features/dashboard/components/gogo/gogo.sales.capsule.card'
import { GogoConfigurationCard } from '@/features/dashboard/components/gogo/gogo.configuration.card'
import { GogoCurrenciesCard } from '@/features/dashboard/components/gogo/gogo.currencies.card'
import { GogoLearningProcessesCard } from '@/features/dashboard/components/gogo/gogo.learning.processes.card'
import { GogoVocabularyDonutCard } from '@/features/dashboard/components/gogo/gogo.vocabulary.donut.card'
import { GogoSkillsRadarCard } from '@/features/dashboard/components/gogo/gogo.skills.radar.card'
import { GogoWeaknessStatusCard } from '@/features/dashboard/components/gogo/gogo.weakness.status.card'

export default function HomeAppPage() {
  const navigate = useNavigate()
  const [selectedPeriod, setSelectedPeriod] = useState<string>('7d')
  const [skillsSummary, setSkillsSummary] = useState<SkillsSummary | null>(null)
  const [allWeaknesses, setAllWeaknesses] = useState<WeaknessAnalysis[]>([])
  const [practiceDashboard, setPracticeDashboard] = useState<PracticeDashboardData | null>(null)

  const {
    isLoading,
    activeUser,
    enrolledCourseCards,
    metrics,
    vocabStats,
    listeningScore,
    readingScore,
    speakingScore,
    writingScore,
    toeicAttempts,
  } = useProgressData(navigate)

  useEffect(() => {
    const userId = activeUser?.user_id
    if (!userId) return

    progressService
      .getSkillsSummary(userId, selectedPeriod as any)
      .then((data) => setSkillsSummary(data))
      .catch(() => setSkillsSummary(null))

    progressService
      .getAllWeaknesses(userId, 10)
      .then((data) => setAllWeaknesses(data || []))
      .catch(() => setAllWeaknesses([]))

    progressService
      .getPracticeDashboard(userId, selectedPeriod)
      .then((data) => setPracticeDashboard(data))
      .catch(() => setPracticeDashboard(null))
  }, [activeUser?.user_id, selectedPeriod])

  if (isLoading) {
    return (
      <main className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3 text-text-secondary">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs font-semibold">Đang chuẩn bị bảng phân tích học tập Gogo Analytics...</p>
      </main>
    )
  }

  const dailyBreakdown = practiceDashboard?.growth_analytics?.time_growth?.daily_breakdown_7d || []

  return (
    <main
      aria-labelledby="learner-gogo-analytics-dashboard"
      className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8 space-y-6"
    >
      <GogoWelcomeHero
        user={activeUser}
        selectedPeriod={selectedPeriod}
        onPeriodChange={(p) => setSelectedPeriod(p)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 flex flex-col justify-between gap-6">
          <GogoStatsGrid
            metrics={metrics}
            vocabStats={vocabStats}
            skillsSummary={skillsSummary}
            listeningScore={listeningScore}
            readingScore={readingScore}
            speakingScore={speakingScore}
            writingScore={writingScore}
          />

          <GogoSalesCapsuleCard dailyBreakdown={dailyBreakdown} />
        </div>

        <div className="lg:col-span-4 flex flex-col">
          <GogoConfigurationCard
            targetScore={metrics.targetScore}
            currentStreak={metrics.streak}
            xp={metrics.xp}
            onPractice={() => navigate('/toeic')}
            onVocab={() => navigate('/vocabulary')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6 flex flex-col">
          <GogoCurrenciesCard
            listeningScore={listeningScore}
            readingScore={readingScore}
            skillsSummary={skillsSummary}
          />
        </div>

        <div className="lg:col-span-6 flex flex-col">
          <GogoLearningProcessesCard
            metrics={metrics}
            vocabStats={vocabStats}
            courses={enrolledCourseCards}
            toeicAttemptsCount={toeicAttempts.length}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="flex flex-col">
          <GogoVocabularyDonutCard vocabStats={vocabStats} />
        </div>

        <div className="flex flex-col">
          <GogoSkillsRadarCard
            listeningScore={listeningScore}
            readingScore={readingScore}
            speakingScore={speakingScore}
            writingScore={writingScore}
            grammarScore={skillsSummary?.skills?.grammar?.accuracy ?? 85}
          />
        </div>

        <div className="flex flex-col">
          <GogoWeaknessStatusCard
            weaknesses={allWeaknesses}
            onViewAll={() => navigate('/progress?tab=SKILLS')}
          />
        </div>
      </div>
    </main>
  )
}
