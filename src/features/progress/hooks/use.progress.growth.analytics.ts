// Quản lý truy vấn dữ liệu biểu đồ tăng trưởng và tính toán các mốc phát triển năng lực của học viên.

import { useState, useMemo } from 'react'
import type { GrowthChartDataPoint } from '@/components/growth.area.chart'
import type { ProgressRecentActivity, UnifiedCourseCardItem } from '@/features/progress/hooks/use.progress.data'
import { useGrowthChartQuery } from '@/features/progress/hooks/use.progress.query'

interface UseProgressGrowthAnalyticsProps {
  recentActivities: ProgressRecentActivity[]
  enrolledCourseCards: UnifiedCourseCardItem[]
  baselineScore?: number
}

function formatDateLabel(isoString?: string): string {
  if (!isoString) return 'Mốc 1'
  try {
    const d = new Date(isoString)
    return `${d.getDate()}/${d.getMonth() + 1}`
  } catch {
    return 'Mốc'
  }
}

function formatFullDate(isoString?: string): string {
  if (!isoString) return 'Gần đây'
  try {
    const d = new Date(isoString)
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  } catch {
    return isoString || ''
  }
}

export function useProgressGrowthAnalytics({
  recentActivities,
  enrolledCourseCards,
  baselineScore = 0,
}: UseProgressGrowthAnalyticsProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all')

  const { data: chartDataRes, isLoading: isLoadingCourseChart } = useGrowthChartQuery(
    selectedCourseId,
    selectedCourseId !== 'all'
  )

  const courseGrowthPoints = useMemo(() => {
    if (selectedCourseId !== 'all' && chartDataRes?.growth_chart_data && Array.isArray(chartDataRes.growth_chart_data)) {
      return chartDataRes.growth_chart_data
    }
    return []
  }, [selectedCourseId, chartDataRes])

  const examTimelinePoints = useMemo<GrowthChartDataPoint[]>(() => {
    const sorted = [...recentActivities].sort(
      (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
    )

    if (sorted.length === 0) {
      if (baselineScore > 0) {
        return [
          {
            label: 'Baseline',
            value: baselineScore,
            tag: 'Khởi đầu',
            tooltipTitle: 'Đánh giá đầu vào (Baseline)',
            details: [{ label: 'Điểm khởi đầu', value: `${baselineScore}đ` }],
          },
        ]
      }
      return []
    }

    const points: GrowthChartDataPoint[] = []

    if (baselineScore > 0 && (!sorted[0].examType?.includes('PLACEMENT') && !sorted[0].title.toLowerCase().includes('đầu vào'))) {
      points.push({
        label: 'Baseline',
        value: baselineScore,
        tag: 'Xuất phát',
        tooltipTitle: 'Điểm đánh giá đầu vào hệ thống',
        date: formatFullDate(sorted[0]?.submittedAt),
        details: [{ label: 'Baseline', value: `${baselineScore} TOEIC` }],
      })
    }

    sorted.forEach((item, idx) => {
      const isPlacement = item.examType === 'PLACEMENT' || item.title.toLowerCase().includes('đầu vào')
      const tagLabel = isPlacement ? 'Placement' : `Lần ${idx + 1}`

      points.push({
        label: `${formatDateLabel(item.submittedAt)} (${tagLabel})`,
        value: item.scoreValue,
        date: formatFullDate(item.submittedAt),
        tag: tagLabel,
        tooltipTitle: item.title,
        tooltipSubtitle: item.subtitle,
        details: [
          { label: 'Điểm tổng', value: `${item.scoreValue} / ${item.maxScore} TOEIC` },
          ...(typeof item.listeningScore === 'number' ? [{ label: 'Listening', value: `${item.listeningScore}đ` }] : []),
          ...(typeof item.readingScore === 'number' ? [{ label: 'Reading', value: `${item.readingScore}đ` }] : []),
          { label: 'Số câu đúng', value: `${item.correctCount}/${item.totalQuestions} câu (${item.scorePercentage}%)` },
        ],
      })
    })

    return points
  }, [recentActivities, baselineScore])

  const courseTimelinePoints = useMemo<GrowthChartDataPoint[]>(() => {
    if (selectedCourseId !== 'all' && courseGrowthPoints.length > 0) {
      return courseGrowthPoints.map((pt) => ({
        label: pt.stage,
        value: pt.score,
        date: pt.timestamp ? formatFullDate(pt.timestamp) : undefined,
        tag: 'Chặng',
        tooltipTitle: pt.stage,
        details: [{ label: 'Điểm đạt', value: `${pt.score}%` }],
      }))
    }

    if (enrolledCourseCards.length === 0) {
      return [
        {
          label: 'Khởi đầu',
          value: 0,
          tag: 'Ghi danh',
          tooltipTitle: 'Chưa có khóa học nào đang học',
          details: [{ label: 'Tiến độ', value: '0%' }],
        },
      ]
    }

    return enrolledCourseCards.map((c, idx) => ({
      label: `KH ${idx + 1}`,
      value: c.progress_percentage,
      date: formatFullDate(c.enrolled_at),
      tag: c.category,
      tooltipTitle: c.title,
      tooltipSubtitle: `${c.level} • ${c.completed_lessons_count}/${c.total_lessons_count} bài`,
      details: [
        { label: 'Tiến độ', value: `${c.progress_percentage}%` },
        { label: 'Bài học', value: `${c.completed_lessons_count}/${c.total_lessons_count}` },
        { label: 'Trạng thái', value: c.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Đang học' },
      ],
    }))
  }, [selectedCourseId, courseGrowthPoints, enrolledCourseCards])

  const peakScore = useMemo(() => {
    if (recentActivities.length === 0) return baselineScore > 0 ? baselineScore : 0
    return Math.max(...recentActivities.map((a) => a.scoreValue), baselineScore > 0 ? baselineScore : 0)
  }, [recentActivities, baselineScore])

  const latestScore = useMemo(() => {
    if (recentActivities.length === 0) return baselineScore > 0 ? baselineScore : 0
    return recentActivities[0].scoreValue
  }, [recentActivities, baselineScore])

  const netGrowth = baselineScore > 0 && latestScore > 0 ? latestScore - baselineScore : 0
  const hasExamData = recentActivities.length > 0 || baselineScore > 0

  const totalCompletedLessons = useMemo(() => {
    return enrolledCourseCards.reduce((acc, c) => acc + (c.completed_lessons_count || 0), 0)
  }, [enrolledCourseCards])

  const avgCourseProgress = useMemo(() => {
    if (enrolledCourseCards.length === 0) return 0
    return Math.round(
      enrolledCourseCards.reduce((acc, c) => acc + c.progress_percentage, 0) / enrolledCourseCards.length
    )
  }, [enrolledCourseCards])

  return {
    selectedCourseId,
    setSelectedCourseId,
    isLoadingCourseChart,
    examTimelinePoints,
    courseTimelinePoints,
    peakScore,
    latestScore,
    netGrowth,
    totalCompletedLessons,
    avgCourseProgress,
    hasExamData,
  }
}
