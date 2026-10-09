// Trang tổng quan tiến độ học tập, lộ trình và phân tích năng lực học viên (Progress & Analytics Page)

'use client'

import { useState, useEffect } from 'react'
import { Loader2, TrendingUp } from 'lucide-react'
import { SectionHeading } from '@/features/dashboard/components/section.heading'
import { useNavigate } from '@/lib/navigation'
import { useProgressData } from '@/features/progress/hooks/use.progress.data'
import { ProgressMetricsHeader } from '@/features/progress/components/progress.metrics.header'
import { ProgressCoursesTab } from '@/features/progress/components/progress.courses.tab'
import { ProgressSkillsTab } from '@/features/progress/components/progress.skills.tab'
import { ProgressRecentTestsTab } from '@/features/progress/components/progress.recent.tests.tab'
import { ProgressGrowthAnalyticsTab } from '@/features/progress/components/progress.growth.analytics.tab'
import { progressService } from '@/features/progress/services/progress.service'
import type { SkillsSummary } from '@/features/progress/services/progress.service'

export default function ProgressAppPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SKILLS' | 'RECENT_TESTS' | 'GROWTH_ANALYTICS'>('OVERVIEW')
  const [skillsSummary, setSkillsSummary] = useState<SkillsSummary | null>(null)

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

  // Fetch skills analytics summary
  useEffect(() => {
    const currentUserId = (activeUser as any)?.user_id || (activeUser as any)?.id || (activeUser as any)?._id
    if (currentUserId) {
      const userId = currentUserId
      progressService.getSkillsSummary(userId, '7d').then((data) => {
        setSkillsSummary(data)
      }).catch(() => {
        setSkillsSummary(null)
      })
    }
  }, [activeUser])

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Chưa có'
    try {
      const d = new Date(isoString)
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(d)
    } catch {
      return isoString
    }
  }

  return (
    <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8 space-y-6">
      <SectionHeading
        eyebrow="Phân tích & Tiến độ học tập"
        title="Bảng tiến độ & Năng lực học tập"
        description="Theo dõi toàn diện sự tiến bộ qua từng khóa học, đề thi TOEIC, lộ trình cá nhân hóa và năng lực đa kỹ năng."
      />

      <ProgressMetricsHeader metrics={metrics} />

      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'OVERVIEW'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
          }`}
        >
          Khóa học ({enrolledCourseCards.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('SKILLS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'SKILLS'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
          }`}
        >
          Kỹ năng & Từ vựng
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('RECENT_TESTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'RECENT_TESTS'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
          }`}
        >
          Bài kiểm tra gần đây
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('GROWTH_ANALYTICS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'GROWTH_ANALYTICS'
              ? 'bg-gradient-to-r from-indigo-600 to-primary text-white shadow-xs'
              : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
          }`}
        >
          <TrendingUp size={14} />
          <span>Biểu đồ phát triển</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-text-secondary">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-sm font-semibold">Đang tổng hợp dữ liệu tiến độ học tập...</p>
        </div>
      ) : activeTab === 'OVERVIEW' ? (
        <ProgressCoursesTab
          enrolledCourseCards={enrolledCourseCards}
          onNavigate={navigate}
          formatDate={formatDate}
        />
      ) : activeTab === 'SKILLS' ? (
        <ProgressSkillsTab
          listeningScore={listeningScore}
          readingScore={readingScore}
          speakingScore={speakingScore}
          writingScore={writingScore}
          selectedSkillsType={placementSkillsType}
          vocabStats={vocabStats}
          skillsSummary={skillsSummary}
          onNavigate={navigate}
          userId={(activeUser as any)?.user_id || (activeUser as any)?.id || (activeUser as any)?._id || ''}
        />
      ) : activeTab === 'RECENT_TESTS' ? (
        <ProgressRecentTestsTab
          recentActivities={recentActivities}
          onNavigate={navigate}
        />
      ) : (
        <ProgressGrowthAnalyticsTab
          recentActivities={recentActivities}
          enrolledCourseCards={enrolledCourseCards}
          testAttempts={testAttempts}
          toeicAttempts={toeicAttempts}
          coursesMap={coursesMap}
          targetScore={metrics.targetScore}
          baselineScore={Number(activeUser?.placement_test_score) || 0}
          listeningScore={listeningScore}
          readingScore={readingScore}
          speakingScore={speakingScore}
          writingScore={writingScore}
          initialSkillsType={placementSkillsType}
          onNavigate={navigate}
        />
      )}
    </main>
  )
}
