// Trang chủ phân tích học tập LingoSphere thiết kế theo phong cách dashboard Cuba Next.js hiện đại.
'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useNavigate } from '@/lib/navigation'
import { useProgressData } from '@/features/progress/hooks/use.progress.data'
import { useProgressGrowthAnalytics } from '@/features/progress/hooks/use.progress.growth.analytics'
import {
  useSkillsSummaryQuery,
  useWeaknessesQuery,
  usePracticeDashboardQuery,
} from '@/features/progress/hooks/use.progress.query'
import { useVocabularyDashboard } from '@/features/vocabulary/hooks/use.vocabulary.dashboard'
import { GogoWelcomeHero } from '@/features/dashboard/components/gogo/gogo.welcome.hero'
import { GogoStatsGrid } from '@/features/dashboard/components/gogo/gogo.stats.grid'
import { GogoGrowthChartCard } from '@/features/dashboard/components/gogo/gogo.growth.chart.card'
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
import { GogoRecentAssessmentsCard } from '@/features/dashboard/components/gogo/gogo.recent.assessments.card'

export default function HomeAppPage() {
  const navigate = useNavigate()
  const [selectedPeriod, setSelectedPeriod] = useState<string>('7d')

  const {
    isLoading,
    activeUser,
    enrolledCourseCards,
    metrics,
    recentActivities,
    vocabStats,
    listeningScore,
    readingScore,
    speakingScore,
    writingScore,
    toeicAttempts,
    testAttempts,
    coursesMap,
    placementSkillsType,
  } = useProgressData(navigate)

  const userId = activeUser?.user_id
  const { data: skillsSummaryRes } = useSkillsSummaryQuery(userId, selectedPeriod, Boolean(userId))
  const { data: allWeaknessesRes } = useWeaknessesQuery(userId, 10, Boolean(userId))
  const { data: practiceDashboardRes } = usePracticeDashboardQuery(userId, selectedPeriod, Boolean(userId))
  const { data: vocabDashboardData } = useVocabularyDashboard()

  const skillsSummary = skillsSummaryRes || null
  const allWeaknesses = allWeaknessesRes || []
  const practiceDashboard = practiceDashboardRes || null

  const baselineScore = Number(activeUser?.placement_test_score) || (listeningScore + readingScore)

  const growthAnalytics = useProgressGrowthAnalytics({
    enrolledCourseCards,
    testAttempts,
    toeicAttempts,
    coursesMap,
    baselineScore,
    listeningScore,
    readingScore,
    speakingScore,
    writingScore,
    placementSkillsType,
  })

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
        targetScore={metrics.targetScore}
        currentStreak={metrics.streak}
        xp={metrics.xp}
        selectedPeriod={selectedPeriod}
        onPeriodChange={(p) => setSelectedPeriod(p)}
        onPractice={() => navigate('/toeic')}
        onVocab={() => navigate('/vocabulary')}
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <GogoGrowthChartCard
            data2K={growthAnalytics.chapter2SkillsPoints}
            stats2K={{
              latestScore: growthAnalytics.latestChapter2SkillsScore,
              avgScore: growthAnalytics.avgChapter2SkillsScore,
              passed: growthAnalytics.passRateChapter2Skills >= 70,
            }}
            data4K={growthAnalytics.chapter4SkillsPoints}
            stats4K={{
              latestScore: growthAnalytics.latestChapter4SkillsScore,
              avgScore: growthAnalytics.avgChapter4SkillsScore,
              passed: growthAnalytics.passRateChapter4Skills >= 70,
            }}
            toeicData={growthAnalytics.toeicTimelinePoints}
            toeicStats={{
              latestScore: growthAnalytics.latestToeicScore,
              avgScore: growthAnalytics.peakToeicScore,
              passed: true,
            }}
            toeicSeries={growthAnalytics.toeicChartSeries}
          />
        </div>

        <div className="lg:col-span-4 flex flex-col">
          <GogoConfigurationCard
            targetScore={metrics.targetScore}
            currentScore={metrics.currentScore}
            baselineScore={baselineScore}
            currentStreak={metrics.streak}
            xp={metrics.xp}
            onPractice={() => navigate('/toeic')}
            onVocab={() => navigate('/vocabulary')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <GogoRollingPerformanceCard
          rolling={rolling}
          onViewDetails={() => navigate('/progress?tab=SKILLS')}
        />

        <GogoSalesCapsuleCard dailyBreakdown={dailyBreakdown} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <GogoDailyPracticeCard
            dailyBreakdown={dailyBreakdown}
            onViewAll={() => navigate('/progress?tab=SKILLS')}
          />
        </div>

        <div className="lg:col-span-4 flex flex-col">
          <GogoGrowthVelocityCard
            timeGrowth={timeGrowth}
            activityOverview={activityOverview}
            onViewDetails={() => navigate('/progress?tab=GROWTH_ANALYTICS')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <GogoCurrenciesCard
          listeningScore={listeningScore}
          readingScore={readingScore}
          speakingScore={speakingScore}
          writingScore={writingScore}
          skillsSummary={skillsSummary}
          skillsDelta={timeGrowth?.skills_delta}
        />

        <GogoRecentAssessmentsCard activities={recentActivities} />
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
