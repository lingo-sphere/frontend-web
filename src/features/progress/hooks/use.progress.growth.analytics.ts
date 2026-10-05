// Quản lý dữ liệu 2 biểu đồ phát triển: điểm kiểm tra chương học thực tế và biến thiên năng lực TOEIC.
'use client'

import { useState, useMemo } from 'react'
import type { GrowthChartDataPoint } from '@/components/growth.area.chart'
import type { UnifiedCourseCardItem } from '@/features/progress/hooks/use.progress.data'
import type { Course } from '@/types/api.types'

export interface ChapterTestAttemptItem {
  attempt_id: string
  test_type: string
  course_id: string
  module_id?: string
  order_index?: number
  score: number
  correct_count: number
  total_questions: number
  is_passed: boolean
  submitted_at: string
}

export interface ToeicExamAttemptItem {
  _id: string
  user_id: string
  exam_id: string
  exam_title: string
  exam_code?: string
  exam_type: string
  is_system_placement?: boolean
  total_questions: number
  correct_questions: number
  total_scaled_score: number
  listening_scaled_score: number
  reading_scaled_score: number
  submitted_at: string
}

interface UseProgressGrowthAnalyticsProps {
  enrolledCourseCards: UnifiedCourseCardItem[]
  testAttempts?: ChapterTestAttemptItem[]
  toeicAttempts?: ToeicExamAttemptItem[]
  coursesMap?: Map<string, Course>
  baselineScore?: number
  listeningScore?: number
  readingScore?: number
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
  enrolledCourseCards,
  testAttempts = [],
  toeicAttempts = [],
  coursesMap,
  baselineScore = 0,
  listeningScore = 0,
  readingScore = 0,
}: UseProgressGrowthAnalyticsProps) {
  const [selectedChapterCourseId, setSelectedChapterCourseId] = useState<string>('all')

  const chapterTimelinePoints = useMemo<GrowthChartDataPoint[]>(() => {
    const chapterAttempts = testAttempts.filter((t) => t.test_type !== 'final-test')
    const filtered =
      selectedChapterCourseId === 'all'
        ? chapterAttempts
        : chapterAttempts.filter((t) => t.course_id === selectedChapterCourseId)

    const sorted = [...filtered].sort(
      (a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
    )

    return sorted.map((item, idx) => {
      const courseMeta = coursesMap?.get(item.course_id)
      const orderNum = item.order_index ?? (idx + 1)
      const actualScore = Math.min(100, Math.max(0, Math.round(item.score || 0)))
      return {
        label: `${formatDateLabel(item.submitted_at)} (Ch.${orderNum})`,
        value: actualScore,
        date: formatFullDate(item.submitted_at),
        tag: `Chương ${orderNum}`,
        tooltipTitle: `Kiểm tra Chương ${orderNum}`,
        tooltipSubtitle: courseMeta?.title || 'Khóa học',
        details: [
          { label: 'Điểm thực tế', value: `${actualScore}%` },
          { label: 'Số câu đúng', value: `${item.correct_count ?? 0}/${item.total_questions ?? 0} câu` },
          { label: 'Trạng thái', value: item.is_passed ? 'Đạt chuẩn' : 'Chưa đạt' },
          { label: 'Ngày nộp', value: formatFullDate(item.submitted_at) },
        ],
      }
    })
  }, [testAttempts, selectedChapterCourseId, coursesMap])

  const latestChapterScore = useMemo(() => {
    if (chapterTimelinePoints.length === 0) return 0
    return chapterTimelinePoints[chapterTimelinePoints.length - 1].value
  }, [chapterTimelinePoints])

  const avgChapterScore = useMemo(() => {
    if (chapterTimelinePoints.length === 0) return 0
    const sum = chapterTimelinePoints.reduce((acc, curr) => acc + curr.value, 0)
    return Math.round(sum / chapterTimelinePoints.length)
  }, [chapterTimelinePoints])

  const toeicTimelinePoints = useMemo<GrowthChartDataPoint[]>(() => {
    const pointsWithTimestamp: Array<{ timestamp: number; isPlacement: boolean; point: GrowthChartDataPoint }> = []

    toeicAttempts.forEach((t, idx) => {
      const isPlacement =
        t.exam_type === 'PLACEMENT' ||
        Boolean(t.is_system_placement) ||
        t.exam_title?.toLowerCase().includes('đầu vào')
      const tag = isPlacement ? 'Đầu vào' : `Đề ${idx + 1}`
      const scoreVal = t.total_scaled_score || 0
      pointsWithTimestamp.push({
        timestamp: new Date(t.submitted_at).getTime(),
        isPlacement,
        point: {
          label: `${formatDateLabel(t.submitted_at)} (${tag})`,
          value: scoreVal,
          date: formatFullDate(t.submitted_at),
          tag,
          tooltipTitle: t.exam_title || (isPlacement ? 'Bài thi đánh giá đầu vào' : 'Đề thi TOEIC'),
          tooltipSubtitle: 'Thang điểm chuẩn TOEIC 0 - 990',
          details: [
            { label: 'Tổng điểm TOEIC', value: `${scoreVal} / 990` },
            { label: 'Listening', value: `${t.listening_scaled_score || 0}đ` },
            { label: 'Reading', value: `${t.reading_scaled_score || 0}đ` },
            { label: 'Số câu đúng', value: `${t.correct_questions || 0}/${t.total_questions || 200} câu` },
            { label: 'Ngày nộp bài', value: formatFullDate(t.submitted_at) },
          ],
        },
      })
    })

    const finalAttempts = testAttempts.filter((t) => t.test_type === 'final-test')
    finalAttempts.forEach((f) => {
      const courseMeta = coursesMap?.get(f.course_id)
      const target = courseMeta?.target_score || 990
      const toeicScore = f.score > 100 ? Math.round(f.score) : Math.round((Math.max(0, f.score) / 100) * target)
      pointsWithTimestamp.push({
        timestamp: new Date(f.submitted_at).getTime(),
        isPlacement: false,
        point: {
          label: `${formatDateLabel(f.submitted_at)} (Cuối khóa)`,
          value: toeicScore,
          date: formatFullDate(f.submitted_at),
          tag: 'Cuối khóa',
          tooltipTitle: `Bài thi cuối khóa: ${courseMeta?.title || 'Khóa học'}`,
          tooltipSubtitle: `Điểm quy đổi chuẩn TOEIC đầu ra (${target}+)`,
          details: [
            { label: 'Điểm TOEIC quy đổi', value: `${toeicScore} / 990` },
            { label: 'Điểm bài làm', value: `${Math.round(f.score)}%` },
            { label: 'Số câu đúng', value: `${f.correct_count ?? 0}/${f.total_questions ?? 0} câu` },
            { label: 'Chuẩn tốt nghiệp', value: f.is_passed ? 'Đạt chuẩn' : 'Chưa đạt' },
            { label: 'Ngày nộp bài', value: formatFullDate(f.submitted_at) },
          ],
        },
      })
    })

    pointsWithTimestamp.sort((a, b) => a.timestamp - b.timestamp)

    const resultPoints: GrowthChartDataPoint[] = []
    const hasPlacement = pointsWithTimestamp.some((item) => item.isPlacement)

    if (baselineScore > 0 && !hasPlacement) {
      const firstDate = pointsWithTimestamp[0]?.point.date || 'Khởi điểm'
      resultPoints.push({
        label: 'Baseline',
        value: baselineScore,
        date: firstDate,
        tag: 'Đầu vào',
        tooltipTitle: 'Đánh giá đầu vào TOEIC (Placement Test)',
        tooltipSubtitle: 'Điểm xuất phát năng lực',
        details: [
          { label: 'Điểm xuất phát', value: `${baselineScore} TOEIC` },
          ...(listeningScore > 0 ? [{ label: 'Listening', value: `${listeningScore}đ` }] : []),
          ...(readingScore > 0 ? [{ label: 'Reading', value: `${readingScore}đ` }] : []),
        ],
      })
    }

    pointsWithTimestamp.forEach((item) => {
      resultPoints.push(item.point)
    })

    return resultPoints
  }, [toeicAttempts, testAttempts, coursesMap, baselineScore, listeningScore, readingScore])

  const peakToeicScore = useMemo(() => {
    if (toeicTimelinePoints.length === 0) return baselineScore > 0 ? baselineScore : 0
    return Math.max(...toeicTimelinePoints.map((p) => p.value), baselineScore > 0 ? baselineScore : 0)
  }, [toeicTimelinePoints, baselineScore])

  const latestToeicScore = useMemo(() => {
    if (toeicTimelinePoints.length === 0) return baselineScore > 0 ? baselineScore : 0
    return toeicTimelinePoints[toeicTimelinePoints.length - 1].value
  }, [toeicTimelinePoints, baselineScore])

  const netGrowthToeic = useMemo(() => {
    const base = baselineScore > 0 ? baselineScore : (toeicTimelinePoints[0]?.value || 0)
    return latestToeicScore > 0 && base > 0 ? latestToeicScore - base : 0
  }, [latestToeicScore, baselineScore, toeicTimelinePoints])

  const toeicProgression = useMemo<number[]>(() => {
    if (toeicTimelinePoints.length === 0) {
      return baselineScore > 0 ? [baselineScore] : []
    }
    return toeicTimelinePoints.map((p) => p.value)
  }, [toeicTimelinePoints, baselineScore])

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
    selectedChapterCourseId,
    setSelectedChapterCourseId,
    chapterTimelinePoints,
    latestChapterScore,
    avgChapterScore,
    toeicTimelinePoints,
    peakToeicScore,
    latestToeicScore,
    netGrowthToeic,
    toeicProgression,
    totalCompletedLessons,
    avgCourseProgress,
  }
}
