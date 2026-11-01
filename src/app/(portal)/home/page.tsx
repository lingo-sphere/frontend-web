// Trang chủ bảng điều khiển học tập cá nhân theo phong cách Gogo Analytics Dashboard.
'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'
import { useNavigate } from '@/lib/navigation'
import { useApp } from '@/contexts/app.context'
import { useProgressData } from '@/features/progress/hooks/use.progress.data'
import { useProgressGrowthAnalytics } from '@/features/progress/hooks/use.progress.growth.analytics'
import { GogoWelcomeHero } from '@/features/dashboard/components/gogo/gogo.welcome.hero'
import { GogoStatsGrid } from '@/features/dashboard/components/gogo/gogo.stats.grid'
import { GogoGrowthChartCard } from '@/features/dashboard/components/gogo/gogo.growth.chart.card'
import { GogoLearningProcessesCard } from '@/features/dashboard/components/gogo/gogo.learning.processes.card'
import { GogoRecentAssessmentsCard } from '@/features/dashboard/components/gogo/gogo.recent.assessments.card'
import { GogoSkillsRadarCard } from '@/features/dashboard/components/gogo/gogo.skills.radar.card'
import { GogoVocabularyDonutCard } from '@/features/dashboard/components/gogo/gogo.vocabulary.donut.card'
import { GogoTasksRewardsCard } from '@/features/dashboard/components/gogo/gogo.tasks.rewards.card'

export default function HomeAppPage() {
  const navigate = useNavigate()
  const { showAction } = useApp()

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
    placementSkillsType,
    testAttempts,
    toeicAttempts,
    coursesMap,
  } = useProgressData(navigate)

  const {
    chapter2SkillsPoints,
    latestChapter2SkillsScore,
    avgChapter2SkillsScore,
    passRateChapter2Skills,
    chapter4SkillsPoints,
    latestChapter4SkillsScore,
    avgChapter4SkillsScore,
    passRateChapter4Skills,
    toeicTimelinePoints,
    toeicChartSeries,
    latestToeicScore,
  } = useProgressGrowthAnalytics({
    enrolledCourseCards,
    testAttempts,
    toeicAttempts,
    coursesMap,
    baselineScore: Number(activeUser?.placement_test_score) || 0,
    listeningScore,
    readingScore,
    speakingScore,
    writingScore,
    placementSkillsType,
  })

  const stats2K = {
    latestScore: latestChapter2SkillsScore,
    avgScore: avgChapter2SkillsScore,
    passed: passRateChapter2Skills !== null ? passRateChapter2Skills >= 70 : null,
  }

  const stats4K = {
    latestScore: latestChapter4SkillsScore,
    avgScore: avgChapter4SkillsScore,
    passed: passRateChapter4Skills !== null ? passRateChapter4Skills >= 70 : null,
  }

  const statsToeic = {
    latestScore: latestToeicScore,
    avgScore: latestToeicScore,
    passed: latestToeicScore !== null ? latestToeicScore >= 450 : null,
  }

  if (isLoading) {
    return (
      <main className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3 text-text-secondary">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs font-semibold">Đang chuẩn bị bảng phân tích học tập Gogo Analytics...</p>
      </main>
    )
  }

  return (
    <main
      aria-labelledby="learner-analytics-dashboard"
      className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8 space-y-6"
    >
      <GogoWelcomeHero
        user={activeUser}
        targetScore={metrics.targetScore}
        currentStreak={metrics.streak}
        level={metrics.level}
        onRefresh={() => window.location.reload()}
        onExplore={() => navigate('/toeic')}
      />

      <GogoStatsGrid
        metrics={metrics}
        vocabStats={vocabStats}
        listeningScore={listeningScore}
        readingScore={readingScore}
        speakingScore={speakingScore}
        writingScore={writingScore}
        placementSkillsType={placementSkillsType}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <GogoGrowthChartCard
            data2K={chapter2SkillsPoints}
            stats2K={stats2K}
            data4K={chapter4SkillsPoints}
            stats4K={stats4K}
            toeicData={toeicTimelinePoints}
            toeicStats={statsToeic}
            toeicSeries={toeicChartSeries}
          />

          <GogoLearningProcessesCard
            courses={enrolledCourseCards}
            onNavigate={navigate}
          />

          <GogoRecentAssessmentsCard
            activities={recentActivities}
          />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <GogoSkillsRadarCard
            listeningScore={listeningScore}
            readingScore={readingScore}
            speakingScore={speakingScore}
            writingScore={writingScore}
            skillsType={placementSkillsType}
          />

          <GogoVocabularyDonutCard
            vocabStats={vocabStats}
          />

          <GogoTasksRewardsCard
            currentStreak={metrics.streak}
            onAction={showAction}
          />
        </div>
      </div>
    </main>
  )
}
