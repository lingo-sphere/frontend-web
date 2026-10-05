// Quản lý dữ liệu 4 biểu đồ phát triển học tập: kiểm tra chương 2KN, chương 4KN, biến thiên TOEIC 2KN và TOEIC 4KN.
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

export function isCourse4Skills(course?: Course | UnifiedCourseCardItem): boolean {
  if (!course) return false
  const cat = (course as Course).category
  if (cat === 'TOEIC_4_SKILLS' || cat === 'IELTS_4_SKILLS' || cat === '4_SKILLS') return true
  const skills = (course as Course).skills
  if (Array.isArray(skills) && (skills.includes('SPEAKING') || skills.includes('WRITING') || skills.length >= 4)) return true
  const title = course.title || ''
  if (/4\s*(kỹ\s*năng|skills)/i.test(title)) return true
  return false
}

export function isToeicAttempt4Skills(exam: ToeicExamAttemptItem): boolean {
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
  const [selectedChapter2SkillsCourseId, setSelectedChapter2SkillsCourseId] = useState<string>('all')
  const [selectedChapter4SkillsCourseId, setSelectedChapter4SkillsCourseId] = useState<string>('all')

  const enrolled2SkillsCards = useMemo(() => {
    return enrolledCourseCards.filter((c) => !isCourse4Skills(coursesMap?.get(c.course_id) || c))
  }, [enrolledCourseCards, coursesMap])

  const enrolled4SkillsCards = useMemo(() => {
    return enrolledCourseCards.filter((c) => isCourse4Skills(coursesMap?.get(c.course_id) || c))
  }, [enrolledCourseCards, coursesMap])

  const mapAttemptToPoint = (
    item: ChapterTestAttemptItem,
    idx: number,
    isFilterAll: boolean
  ): GrowthChartDataPoint => {
    const courseMeta = coursesMap?.get(item.course_id)
    const enrolledMeta = enrolledCourseCards.find((c) => c.course_id === item.course_id)
    const courseTitle = courseMeta?.title || enrolledMeta?.title || 'Khóa học'
    const is4K = isCourse4Skills(courseMeta || enrolledMeta)
    const orderNum = item.order_index ?? (idx + 1)
    const actualScore = Math.min(100, Math.max(0, Math.round(item.score || 0)))

    const detailsList = [
      ...(isFilterAll ? [{ label: 'Khóa học', value: courseTitle }] : []),
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
      tooltipTitle: isFilterAll ? `${courseTitle} - Chương ${orderNum}` : `Kiểm tra Chương ${orderNum}`,
      tooltipSubtitle: `${courseTitle} (${is4K ? '4 Kỹ Năng' : '2 Kỹ Năng'})`,
      details: detailsList,
    }
  }

  const {
    chapterTimelinePoints,
    chapter2SkillsPoints,
    chapter4SkillsPoints,
    latestChapterScore,
    avgChapterScore,
    latestChapter2SkillsScore,
    avgChapter2SkillsScore,
    passRateChapter2Skills,
    totalChapter2SkillsTests,
    latestChapter4SkillsScore,
    avgChapter4SkillsScore,
    passRateChapter4Skills,
    totalChapter4SkillsTests,
  } = useMemo(() => {
    const chapterAttempts = testAttempts.filter((t) => t.test_type !== 'final-test')

    const sortedAll = [...chapterAttempts].sort(
      (a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
    )

    const allFiltered =
      selectedChapterCourseId === 'all'
        ? sortedAll
        : sortedAll.filter((t) => t.course_id === selectedChapterCourseId)
    const allPts = allFiltered.map((item, idx) => mapAttemptToPoint(item, idx, selectedChapterCourseId === 'all'))

    const attempts2K = sortedAll.filter(
      (t) => !isCourse4Skills(coursesMap?.get(t.course_id) || enrolledCourseCards.find((c) => c.course_id === t.course_id))
    )
    const filtered2K =
      selectedChapter2SkillsCourseId === 'all'
        ? attempts2K
        : attempts2K.filter((t) => t.course_id === selectedChapter2SkillsCourseId)
    const pts2K = filtered2K.map((item, idx) =>
      mapAttemptToPoint(item, idx, selectedChapter2SkillsCourseId === 'all')
    )

    const attempts4K = sortedAll.filter(
      (t) => isCourse4Skills(coursesMap?.get(t.course_id) || enrolledCourseCards.find((c) => c.course_id === t.course_id))
    )
    const filtered4K =
      selectedChapter4SkillsCourseId === 'all'
        ? attempts4K
        : attempts4K.filter((t) => t.course_id === selectedChapter4SkillsCourseId)
    const pts4K = filtered4K.map((item, idx) =>
      mapAttemptToPoint(item, idx, selectedChapter4SkillsCourseId === 'all')
    )

    const latestAll = allPts.length > 0 ? allPts[allPts.length - 1].value : 0
    const avgAll =
      allPts.length > 0 ? Math.round(allPts.reduce((acc, curr) => acc + curr.value, 0) / allPts.length) : 0

    const latest2K = pts2K.length > 0 ? pts2K[pts2K.length - 1].value : 0
    const avg2K =
      pts2K.length > 0 ? Math.round(pts2K.reduce((acc, curr) => acc + curr.value, 0) / pts2K.length) : 0
    const passCount2K = filtered2K.filter((t) => t.is_passed || t.score >= 70).length
    const passRate2K = pts2K.length > 0 ? Math.round((passCount2K / pts2K.length) * 100) : 0

    const latest4K = pts4K.length > 0 ? pts4K[pts4K.length - 1].value : 0
    const avg4K =
      pts4K.length > 0 ? Math.round(pts4K.reduce((acc, curr) => acc + curr.value, 0) / pts4K.length) : 0
    const passCount4K = filtered4K.filter((t) => t.is_passed || t.score >= 70).length
    const passRate4K = pts4K.length > 0 ? Math.round((passCount4K / pts4K.length) * 100) : 0

    return {
      chapterTimelinePoints: allPts,
      chapter2SkillsPoints: pts2K,
      chapter4SkillsPoints: pts4K,
      latestChapterScore: latestAll,
      avgChapterScore: avgAll,
      latestChapter2SkillsScore: latest2K,
      avgChapter2SkillsScore: avg2K,
      passRateChapter2Skills: passRate2K,
      totalChapter2SkillsTests: pts2K.length,
      latestChapter4SkillsScore: latest4K,
      avgChapter4SkillsScore: avg4K,
      passRateChapter4Skills: passRate4K,
      totalChapter4SkillsTests: pts4K.length,
    }
  }, [
    testAttempts,
    selectedChapterCourseId,
    selectedChapter2SkillsCourseId,
    selectedChapter4SkillsCourseId,
    coursesMap,
    enrolledCourseCards,
  ])

  const chapterChartSeries = useMemo<GrowthChartSeries[]>(() => {
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
  }, [chapter2SkillsPoints, chapter4SkillsPoints, chapterTimelinePoints])

  const {
    toeicTimelinePoints,
    toeic2SkillsPoints,
    toeic4SkillsPoints,
    toeicChartSeries,
    baselineScore2Skills,
    baselineScore4Skills,
    latestToeic2SkillsScore,
    peakToeic2SkillsScore,
    netGrowthToeic2Skills,
    totalToeic2SkillsTests,
    latestToeic4SkillsScore,
    peakToeic4SkillsScore,
    netGrowthToeic4Skills,
    totalToeic4SkillsTests,
  } = useMemo(() => {
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

    const entries2K = entries.filter((e) => !e.is4Skills)
    const entries4K = entries.filter((e) => e.is4Skills)

    const hasPlacement2K = entries2K.some((e) => e.isPlacement)
    const hasPlacement4K = entries4K.some((e) => e.isPlacement)

    const pts2K: GrowthChartDataPoint[] = []
    const pts4K: GrowthChartDataPoint[] = []

    const baselineScore2K =
      listeningScore > 0 || readingScore > 0
        ? listeningScore + readingScore
        : placementSkillsType !== '4SKILLS' && baselineScore > 0 && !(speakingScore > 0 || writingScore > 0)
          ? baselineScore
          : 0

    const baselineScore4K =
      speakingScore > 0 || writingScore > 0
        ? listeningScore + readingScore + speakingScore + writingScore > 0
          ? listeningScore + readingScore + speakingScore + writingScore
          : baselineScore
        : placementSkillsType === '4SKILLS' && baselineScore > 0
          ? baselineScore
          : 0

    if (baselineScore2K > 0 && !hasPlacement2K) {
      const firstDate = entries2K[0]?.point.date || 'Khởi điểm'
      pts2K.push({
        label: 'Baseline (2KN)',
        value: baselineScore2K,
        date: firstDate,
        tag: 'Đầu vào 2KN',
        tooltipTitle: 'Đánh giá đầu vào TOEIC (2 Kỹ Năng)',
        tooltipSubtitle: 'Điểm xuất phát Listening & Reading',
        details: [
          { label: 'Hệ kỹ năng', value: '2 Kỹ Năng' },
          { label: 'Điểm xuất phát', value: `${baselineScore2K} TOEIC` },
          ...(listeningScore > 0 ? [{ label: 'Listening', value: `${listeningScore}đ` }] : []),
          ...(readingScore > 0 ? [{ label: 'Reading', value: `${readingScore}đ` }] : []),
        ],
      })
    }

    if (baselineScore4K > 0 && !hasPlacement4K) {
      const firstDate = entries4K[0]?.point.date || 'Khởi điểm'
      pts4K.push({
        label: 'Baseline (4KN)',
        value: baselineScore4K,
        date: firstDate,
        tag: 'Đầu vào 4KN',
        tooltipTitle: 'Đánh giá đầu vào TOEIC (4 Kỹ Năng)',
        tooltipSubtitle: 'Điểm xuất phát Full 4 Kỹ Năng',
        details: [
          { label: 'Hệ kỹ năng', value: '4 Kỹ Năng' },
          { label: 'Điểm xuất phát', value: `${baselineScore4K} TOEIC` },
          ...(listeningScore > 0 ? [{ label: 'Listening', value: `${listeningScore}đ` }] : []),
          ...(readingScore > 0 ? [{ label: 'Reading', value: `${readingScore}đ` }] : []),
          ...(speakingScore > 0 ? [{ label: 'Speaking', value: `${speakingScore}đ` }] : []),
          ...(writingScore > 0 ? [{ label: 'Writing', value: `${writingScore}đ` }] : []),
        ],
      })
    }

    entries2K.forEach((e) => pts2K.push(e.point))
    entries4K.forEach((e) => pts4K.push(e.point))

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
        color: '#a855f7',
        colorTheme: 'purple',
        data: pts4K,
      })
    }

    const combined = [...pts2K, ...pts4K]

    const latest2K = pts2K.length > 0 ? pts2K[pts2K.length - 1].value : baselineScore2K > 0 ? baselineScore2K : 0
    const peak2K =
      pts2K.length > 0
        ? Math.max(...pts2K.map((p) => p.value), baselineScore2K > 0 ? baselineScore2K : 0)
        : baselineScore2K > 0
          ? baselineScore2K
          : 0
    const netGrowth2K = latest2K > 0 && baselineScore2K > 0 ? latest2K - baselineScore2K : 0

    const latest4K = pts4K.length > 0 ? pts4K[pts4K.length - 1].value : baselineScore4K > 0 ? baselineScore4K : 0
    const peak4K =
      pts4K.length > 0
        ? Math.max(...pts4K.map((p) => p.value), baselineScore4K > 0 ? baselineScore4K : 0)
        : baselineScore4K > 0
          ? baselineScore4K
          : 0
    const netGrowth4K = latest4K > 0 && baselineScore4K > 0 ? latest4K - baselineScore4K : 0

    return {
      toeicTimelinePoints: combined,
      toeic2SkillsPoints: pts2K,
      toeic4SkillsPoints: pts4K,
      toeicChartSeries: seriesList,
      baselineScore2Skills: baselineScore2K,
      baselineScore4Skills: baselineScore4K,
      latestToeic2SkillsScore: latest2K,
      peakToeic2SkillsScore: peak2K,
      netGrowthToeic2Skills: netGrowth2K,
      totalToeic2SkillsTests: pts2K.length,
      latestToeic4SkillsScore: latest4K,
      peakToeic4SkillsScore: peak4K,
      netGrowthToeic4Skills: netGrowth4K,
      totalToeic4SkillsTests: pts4K.length,
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
    selectedChapter2SkillsCourseId,
    setSelectedChapter2SkillsCourseId,
    selectedChapter4SkillsCourseId,
    setSelectedChapter4SkillsCourseId,
    enrolled2SkillsCards,
    enrolled4SkillsCards,
    chapterTimelinePoints,
    chapter2SkillsPoints,
    chapter4SkillsPoints,
    chapterChartSeries,
    latestChapterScore,
    avgChapterScore,
    latestChapter2SkillsScore,
    avgChapter2SkillsScore,
    passRateChapter2Skills,
    totalChapter2SkillsTests,
    latestChapter4SkillsScore,
    avgChapter4SkillsScore,
    passRateChapter4Skills,
    totalChapter4SkillsTests,
    toeicTimelinePoints,
    toeic2SkillsPoints,
    toeic4SkillsPoints,
    toeicChartSeries,
    baselineScore2Skills,
    baselineScore4Skills,
    latestToeic2SkillsScore,
    peakToeic2SkillsScore,
    netGrowthToeic2Skills,
    totalToeic2SkillsTests,
    latestToeic4SkillsScore,
    peakToeic4SkillsScore,
    netGrowthToeic4Skills,
    totalToeic4SkillsTests,
    peakToeicScore,
    latestToeicScore,
    netGrowthToeic,
    toeicProgression,
    totalCompletedLessons,
    avgCourseProgress,
  }
}
