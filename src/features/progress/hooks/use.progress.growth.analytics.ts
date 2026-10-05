// Quản lý dữ liệu 2 biểu đồ phát triển: điểm kiểm tra chương học thực tế và biến thiên năng lực TOEIC đa kỹ năng.
'use client'

import { useState, useMemo } from 'react'
import type { GrowthChartDataPoint, GrowthChartSeries } from '@/components/growth.area.chart'
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

export interface UseProgressGrowthAnalyticsProps {
  enrolledCourseCards: UnifiedCourseCardItem[]
  testAttempts?: ChapterTestAttemptItem[]
  toeicAttempts?: ToeicExamAttemptItem[]
  coursesMap?: Map<string, Course>
  baselineScore?: number
  listeningScore?: number
  readingScore?: number
  speakingScore?: number
  writingScore?: number
  placementSkillsType?: '2SKILLS' | '4SKILLS'
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

function isCourse4Skills(course?: Course | UnifiedCourseCardItem): boolean {
  if (!course) return false
  const cat = (course as Course).category
  if (cat === 'TOEIC_4_SKILLS' || cat === 'IELTS_4_SKILLS' || cat === '4_SKILLS') return true
  const skills = (course as Course).skills
  if (Array.isArray(skills) && (skills.includes('SPEAKING') || skills.includes('WRITING') || skills.length >= 4)) return true
  const title = course.title || ''
  if (/4\s*(kỹ\s*năng|skills)/i.test(title)) return true
  return false
}

function isToeicAttempt4Skills(exam: ToeicExamAttemptItem): boolean {
  const title = exam.exam_title || ''
  const type = exam.exam_type || ''
  if (/4\s*(kỹ\s*năng|skills)/i.test(title) || /speaking|writing/i.test(title)) return true
  if (type === '4_SKILLS' || type === 'SPEAKING_WRITING') return true
  return false
}

export function useProgressGrowthAnalytics({
  enrolledCourseCards,
  testAttempts = [],
  toeicAttempts = [],
  coursesMap,
  baselineScore = 0,
  listeningScore = 0,
  readingScore = 0,
  speakingScore = 0,
  writingScore = 0,
  placementSkillsType = '2SKILLS',
}: UseProgressGrowthAnalyticsProps) {
  const [selectedChapterCourseId, setSelectedChapterCourseId] = useState<string>('all')

  const { chapterTimelinePoints, chapter2SkillsPoints, chapter4SkillsPoints } = useMemo(() => {
    const chapterAttempts = testAttempts.filter((t) => t.test_type !== 'final-test')
    const filtered =
      selectedChapterCourseId === 'all'
        ? chapterAttempts
        : selectedChapterCourseId === 'group-2skills'
          ? chapterAttempts.filter((t) => !isCourse4Skills(coursesMap?.get(t.course_id) || enrolledCourseCards.find((c) => c.course_id === t.course_id)))
          : selectedChapterCourseId === 'group-4skills'
            ? chapterAttempts.filter((t) => isCourse4Skills(coursesMap?.get(t.course_id) || enrolledCourseCards.find((c) => c.course_id === t.course_id)))
            : chapterAttempts.filter((t) => t.course_id === selectedChapterCourseId)

    const sorted = [...filtered].sort(
      (a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
    )

    const mapAttemptToPoint = (item: ChapterTestAttemptItem, idx: number): GrowthChartDataPoint => {
      const courseMeta = coursesMap?.get(item.course_id)
      const enrolledMeta = enrolledCourseCards.find((c) => c.course_id === item.course_id)
      const courseTitle = courseMeta?.title || enrolledMeta?.title || 'Khóa học'
      const is4K = isCourse4Skills(courseMeta || enrolledMeta)
      const isAllCourses = selectedChapterCourseId === 'all' || selectedChapterCourseId.startsWith('group-')
      const orderNum = item.order_index ?? (idx + 1)
      const actualScore = Math.min(100, Math.max(0, Math.round(item.score || 0)))

      const detailsList = [
        ...(isAllCourses ? [{ label: 'Khóa học', value: courseTitle }] : []),
        { label: 'Hệ kỹ năng', value: is4K ? '4 Kỹ Năng' : '2 Kỹ Năng' },
        { label: 'Điểm thực tế', value: `${actualScore}%` },
        { label: 'Số câu đúng', value: `${item.correct_count ?? 0}/${item.total_questions ?? 0} câu` },
        { label: 'Trạng thái', value: item.is_passed ? 'Đạt chuẩn' : 'Chưa đạt' },
        { label: 'Ngày nộp', value: formatFullDate(item.submitted_at) },
      ]

      return {
        label: `${formatDateLabel(item.submitted_at)} (Ch.${orderNum})`,
        value: actualScore,
        date: formatFullDate(item.submitted_at),
        tag: `${is4K ? '4KN' : '2KN'} - Chương ${orderNum}`,
        tooltipTitle: isAllCourses ? `${courseTitle} - Chương ${orderNum}` : `Kiểm tra Chương ${orderNum}`,
        tooltipSubtitle: `${courseTitle} (${is4K ? '4 Kỹ Năng' : '2 Kỹ Năng'})`,
        details: detailsList,
      }
    }

    const allPoints = sorted.map(mapAttemptToPoint)

    const pts2K: GrowthChartDataPoint[] = []
    const pts4K: GrowthChartDataPoint[] = []

    sorted.forEach((item, idx) => {
      const courseMeta = coursesMap?.get(item.course_id)
      const enrolledMeta = enrolledCourseCards.find((c) => c.course_id === item.course_id)
      const is4K = isCourse4Skills(courseMeta || enrolledMeta)
      const point = mapAttemptToPoint(item, idx)
      if (is4K) {
        pts4K.push(point)
      } else {
        pts2K.push(point)
      }
    })

    return {
      chapterTimelinePoints: allPoints,
      chapter2SkillsPoints: pts2K,
      chapter4SkillsPoints: pts4K,
    }
  }, [testAttempts, selectedChapterCourseId, coursesMap, enrolledCourseCards])

  const chapterChartSeries = useMemo<GrowthChartSeries[]>(() => {
    if (selectedChapterCourseId === 'all') {
      const list: GrowthChartSeries[] = []
      if (chapter2SkillsPoints.length > 0) {
        list.push({
          id: 'ch-2skills',
          name: 'Khóa 2 Kỹ Năng',
          color: '#10b981',
          colorTheme: 'emerald',
          data: chapter2SkillsPoints,
        })
      }
      if (chapter4SkillsPoints.length > 0) {
        list.push({
          id: 'ch-4skills',
          name: 'Khóa 4 Kỹ Năng',
          color: '#0d9488',
          colorTheme: 'teal',
          data: chapter4SkillsPoints,
        })
      }
      return list.length > 0
        ? list
        : [{ id: 'ch-all', name: 'Điểm chương', color: '#10b981', colorTheme: 'emerald', data: chapterTimelinePoints }]
    }
    return [
      {
        id: 'ch-selected',
        name: selectedChapterCourseId === 'group-2skills' ? 'Khóa 2 Kỹ Năng' : selectedChapterCourseId === 'group-4skills' ? 'Khóa 4 Kỹ Năng' : 'Khóa học đã chọn',
        color: '#10b981',
        colorTheme: 'emerald',
        data: chapterTimelinePoints,
      },
    ]
  }, [selectedChapterCourseId, chapter2SkillsPoints, chapter4SkillsPoints, chapterTimelinePoints])

  const latestChapterScore = useMemo(() => {
    if (chapterTimelinePoints.length === 0) return 0
    return chapterTimelinePoints[chapterTimelinePoints.length - 1].value
  }, [chapterTimelinePoints])

  const avgChapterScore = useMemo(() => {
    if (chapterTimelinePoints.length === 0) return 0
    const sum = chapterTimelinePoints.reduce((acc, curr) => acc + curr.value, 0)
    return Math.round(sum / chapterTimelinePoints.length)
  }, [chapterTimelinePoints])

  const { toeicTimelinePoints, toeic2SkillsPoints, toeic4SkillsPoints, toeicChartSeries } = useMemo(() => {
    interface PointEntry {
      timestamp: number
      isPlacement: boolean
      is4Skills: boolean
      point: GrowthChartDataPoint
    }

    const entries: PointEntry[] = []

    toeicAttempts.forEach((t, idx) => {
      const is4K = isToeicAttempt4Skills(t)
      const isPlacement =
        t.exam_type === 'PLACEMENT' ||
        Boolean(t.is_system_placement) ||
        t.exam_title?.toLowerCase().includes('đầu vào')
      const tag = isPlacement ? (is4K ? 'Đầu vào 4KN' : 'Đầu vào 2KN') : `${is4K ? '4KN' : '2KN'} - Đề ${idx + 1}`
      const scoreVal = t.total_scaled_score || 0

      entries.push({
        timestamp: new Date(t.submitted_at).getTime(),
        isPlacement,
        is4Skills: is4K,
        point: {
          label: `${formatDateLabel(t.submitted_at)} (${is4K ? '4KN' : '2KN'})`,
          value: scoreVal,
          date: formatFullDate(t.submitted_at),
          tag,
          tooltipTitle: t.exam_title || (isPlacement ? 'Bài thi đánh giá đầu vào' : 'Đề thi TOEIC'),
          tooltipSubtitle: is4K ? 'Hệ 4 Kỹ Năng (L, R, S, W)' : 'Hệ 2 Kỹ Năng (Listening & Reading)',
          details: [
            { label: 'Hệ kỹ năng', value: is4K ? '4 Kỹ Năng' : '2 Kỹ Năng' },
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
      const enrolledMeta = enrolledCourseCards.find((c) => c.course_id === f.course_id)
      const courseTitle = courseMeta?.title || enrolledMeta?.title || 'Khóa học'
      const is4K = isCourse4Skills(courseMeta || enrolledMeta)
      const target = courseMeta?.target_score || enrolledMeta?.target_score || 990
      const toeicScore = f.score > 100 ? Math.round(f.score) : Math.round((Math.max(0, f.score) / 100) * target)

      entries.push({
        timestamp: new Date(f.submitted_at).getTime(),
        isPlacement: false,
        is4Skills: is4K,
        point: {
          label: `${formatDateLabel(f.submitted_at)} (Cuối khóa ${is4K ? '4KN' : '2KN'})`,
          value: toeicScore,
          date: formatFullDate(f.submitted_at),
          tag: `Cuối khóa ${is4K ? '4KN' : '2KN'}`,
          tooltipTitle: `Bài thi cuối khóa: ${courseTitle}`,
          tooltipSubtitle: `${courseTitle} (${is4K ? '4 Kỹ Năng' : '2 Kỹ Năng'})`,
          details: [
            { label: 'Hệ kỹ năng', value: is4K ? '4 Kỹ Năng' : '2 Kỹ Năng' },
            { label: 'Khóa học', value: courseTitle },
            { label: 'Điểm TOEIC quy đổi', value: `${toeicScore} / 990` },
            { label: 'Điểm bài làm', value: `${Math.round(f.score)}%` },
            { label: 'Số câu đúng', value: `${f.correct_count ?? 0}/${f.total_questions ?? 0} câu` },
            { label: 'Chuẩn tốt nghiệp', value: f.is_passed ? 'Đạt chuẩn' : 'Chưa đạt' },
            { label: 'Ngày nộp bài', value: formatFullDate(f.submitted_at) },
          ],
        },
      })
    })

    entries.sort((a, b) => a.timestamp - b.timestamp)

    const hasPlacement2K = entries.some((e) => e.isPlacement && !e.is4Skills)
    const hasPlacement4K = entries.some((e) => e.isPlacement && e.is4Skills)

    const pts2K: GrowthChartDataPoint[] = []
    const pts4K: GrowthChartDataPoint[] = []

    const is4SkillsBaseline = placementSkillsType === '4SKILLS' || speakingScore > 0 || writingScore > 0

    if (baselineScore > 0 && !hasPlacement2K && !is4SkillsBaseline) {
      const firstDate = entries.find((e) => !e.is4Skills)?.point.date || 'Khởi điểm'
      pts2K.push({
        label: 'Baseline (2KN)',
        value: baselineScore,
        date: firstDate,
        tag: 'Đầu vào 2KN',
        tooltipTitle: 'Đánh giá đầu vào TOEIC (2 Kỹ Năng)',
        tooltipSubtitle: 'Điểm xuất phát Listening & Reading',
        details: [
          { label: 'Hệ kỹ năng', value: '2 Kỹ Năng' },
          { label: 'Điểm xuất phát', value: `${baselineScore} TOEIC` },
          ...(listeningScore > 0 ? [{ label: 'Listening', value: `${listeningScore}đ` }] : []),
          ...(readingScore > 0 ? [{ label: 'Reading', value: `${readingScore}đ` }] : []),
        ],
      })
    }

    if (baselineScore > 0 && !hasPlacement4K && is4SkillsBaseline) {
      const firstDate = entries.find((e) => e.is4Skills)?.point.date || 'Khởi điểm'
      pts4K.push({
        label: 'Baseline (4KN)',
        value: baselineScore,
        date: firstDate,
        tag: 'Đầu vào 4KN',
        tooltipTitle: 'Đánh giá đầu vào TOEIC (4 Kỹ Năng)',
        tooltipSubtitle: 'Điểm xuất phát Full 4 Kỹ Năng',
        details: [
          { label: 'Hệ kỹ năng', value: '4 Kỹ Năng' },
          { label: 'Điểm xuất phát', value: `${baselineScore} TOEIC` },
          ...(listeningScore > 0 ? [{ label: 'Listening', value: `${listeningScore}đ` }] : []),
          ...(readingScore > 0 ? [{ label: 'Reading', value: `${readingScore}đ` }] : []),
          ...(speakingScore > 0 ? [{ label: 'Speaking', value: `${speakingScore}đ` }] : []),
          ...(writingScore > 0 ? [{ label: 'Writing', value: `${writingScore}đ` }] : []),
        ],
      })
    }

    entries.forEach((e) => {
      if (e.is4Skills) {
        pts4K.push(e.point)
      } else {
        pts2K.push(e.point)
      }
    })

    const seriesList: GrowthChartSeries[] = []
    if (pts2K.length > 0) {
      seriesList.push({
        id: 'toeic-2skills',
        name: '2 Kỹ Năng (Listening & Reading)',
        color: '#6366f1',
        colorTheme: 'indigo',
        data: pts2K,
      })
    }
    if (pts4K.length > 0) {
      seriesList.push({
        id: 'toeic-4skills',
        name: '4 Kỹ Năng (Full 4 Kỹ Năng)',
        color: '#0d9488',
        colorTheme: 'teal',
        data: pts4K,
      })
    }

    const combined = [...pts2K, ...pts4K]

    return {
      toeicTimelinePoints: combined,
      toeic2SkillsPoints: pts2K,
      toeic4SkillsPoints: pts4K,
      toeicChartSeries: seriesList,
    }
  }, [
    toeicAttempts,
    testAttempts,
    coursesMap,
    baselineScore,
    listeningScore,
    readingScore,
    speakingScore,
    writingScore,
    placementSkillsType,
    enrolledCourseCards,
  ])

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
    chapter2SkillsPoints,
    chapter4SkillsPoints,
    chapterChartSeries,
    latestChapterScore,
    avgChapterScore,
    toeicTimelinePoints,
    toeic2SkillsPoints,
    toeic4SkillsPoints,
    toeicChartSeries,
    peakToeicScore,
    latestToeicScore,
    netGrowthToeic,
    toeicProgression,
    totalCompletedLessons,
    avgCourseProgress,
  }
}
