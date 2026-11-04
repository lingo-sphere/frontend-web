// Trang chủ tổng quan phân tích học tập toàn diện kết hợp chỉ số phong độ, kỹ năng và từ vựng SRS.
'use client'

import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useNavigate } from '@/lib/navigation'
import { useProgressData } from '@/features/progress/hooks/use.progress.data'
import {
  useSkillsSummaryQuery,
  useWeaknessesQuery,
  usePracticeDashboardQuery,
} from '@/features/progress/hooks/use.progress.query'
import { useVocabularyDashboard } from '@/features/vocabulary/hooks/use.vocabulary.dashboard'
import { GogoWelcomeHero } from '@/features/dashboard/components/gogo/gogo.welcome.hero'
import { GogoStatsGrid } from '@/features/dashboard/components/gogo/gogo.stats.grid'
import { GogoRollingPerformanceCard } from '@/features/dashboard/components/gogo/gogo.rolling.performance.card'
import { GogoGrowthVelocityCard } from '@/features/dashboard/components/gogo/gogo.growth.velocity.card'
import { GogoDailyPracticeCard } from '@/features/dashboard/components/gogo/gogo.daily.practice.card'
import { GogoConfigurationCard } from '@/features/dashboard/components/gogo/gogo.configuration.card'
import { GogoSalesCapsuleCard } from '@/features/dashboard/components/gogo/gogo.sales.capsule.card'
import { GogoCurrenciesCard } from '@/features/dashboard/components/gogo/gogo.currencies.card'
import { GogoVocabularyDonutCard } from '@/features/dashboard/components/gogo/gogo.vocabulary.donut.card'
import { GogoLearningProcessesCard } from '@/features/dashboard/components/gogo/gogo.learning.processes.card'
import { GogoSkillsRadarCard } from '@/features/dashboard/components/gogo/gogo.skills.radar.card'
import { GogoWeaknessStatusCard } from '@/features/dashboard/components/gogo/gogo.weakness.status.card'

export default function HomeAppPage() {
  const navigate = useNavigate()
  const [selectedPeriod, setSelectedPeriod] = useState<string>('7d')

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

  const userId = activeUser?.user_id
  const { data: skillsSummaryRes } = useSkillsSummaryQuery(userId, selectedPeriod, Boolean(userId))
  const { data: allWeaknessesRes } = useWeaknessesQuery(userId, 10, Boolean(userId))
  const { data: practiceDashboardRes } = usePracticeDashboardQuery(userId, selectedPeriod, Boolean(userId))
  const { data: vocabDashboardData } = useVocabularyDashboard()

  const skillsSummary = skillsSummaryRes || null
  const allWeaknesses = allWeaknessesRes || []
  const practiceDashboard = practiceDashboardRes || null

  if (isLoading) {
    return (
      <main className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3 text-text-secondary">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs font-semibold">Đang chuẩn bị bảng phân tích học tập LingoSphere...</p>
      </main>
    )
  }

  const rolling = practiceDashboard?.growth_analytics?.rolling_performance
  const timeGrowth = practiceDashboard?.growth_analytics?.time_growth
  const activityOverview = practiceDashboard?.growth_analytics?.activity_overview
  const dailyBreakdown = timeGrowth?.daily_breakdown_7d || []

  return (
    <main
      aria-labelledby="learner-analytics-dashboard"
      className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8 space-y-6"
    >
      <GogoWelcomeHero
        user={activeUser}
        selectedPeriod={selectedPeriod}
        onPeriodChange={(p) => setSelectedPeriod(p)}
      />

      <GogoStatsGrid
        metrics={metrics}
        vocabStats={vocabStats}
        skillsSummary={skillsSummary}
        listeningScore={listeningScore}
        readingScore={readingScore}
        speakingScore={speakingScore}
        writingScore={writingScore}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <GogoRollingPerformanceCard
          rolling={rolling}
          onViewDetails={() => navigate('/progress?tab=SKILLS')}
        />

        <GogoGrowthVelocityCard
          timeGrowth={timeGrowth}
          activityOverview={activityOverview}
          onViewDetails={() => navigate('/progress?tab=GROWTH_ANALYTICS')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <GogoDailyPracticeCard
            dailyBreakdown={dailyBreakdown}
            onViewAll={() => navigate('/progress?tab=SKILLS')}
          />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <GogoSalesCapsuleCard dailyBreakdown={dailyBreakdown} />

        <GogoCurrenciesCard
          listeningScore={listeningScore}
          readingScore={readingScore}
          speakingScore={speakingScore}
          writingScore={writingScore}
          skillsSummary={skillsSummary}
          skillsDelta={timeGrowth?.skills_delta}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <GogoVocabularyDonutCard
          vocabStats={vocabStats}
          dashboardData={vocabDashboardData}
          onNavigate={(p) => navigate(p)}
        />

        <GogoLearningProcessesCard
          metrics={metrics}
          vocabStats={vocabStats}
          courses={enrolledCourseCards}
          toeicAttemptsCount={toeicAttempts.length}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <GogoSkillsRadarCard
          listeningScore={listeningScore}
          readingScore={readingScore}
          speakingScore={speakingScore}
          writingScore={writingScore}
          grammarScore={skillsSummary?.skills?.grammar?.accuracy ?? 0}
          pronunciationScore={skillsSummary?.skills?.pronunciation?.accuracy ?? 0}
        />

        <GogoWeaknessStatusCard
          weaknesses={allWeaknesses}
          onViewAll={() => navigate('/progress?tab=SKILLS')}
          onPractice={() => navigate('/toeic')}
        />
      </div>
    </main>
  )
}
