// Component hiển thị 2 biểu đồ phát triển: điểm kiểm tra chương học thực tế và biến thiên năng lực TOEIC.
'use client'

import {
  Trophy,
  ArrowRight,
  Compass,
  Target,
  TrendingUp,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/button'
import { Badge } from '@/components/badge'
import { GrowthAreaChart } from '@/components/growth.area.chart'
import { ProgressCourseFilterDropdown } from '@/features/progress/components/progress.course.filter.dropdown'
import type { ProgressRecentActivity, UnifiedCourseCardItem } from '@/features/progress/hooks/use.progress.data'
import {
  useProgressGrowthAnalytics,
  type ChapterTestAttemptItem,
  type ToeicExamAttemptItem,
} from '@/features/progress/hooks/use.progress.growth.analytics'
import type { Course } from '@/types/api.types'
import { useState } from 'react'

interface ProgressGrowthAnalyticsTabProps {
  recentActivities: ProgressRecentActivity[]
  enrolledCourseCards: UnifiedCourseCardItem[]
  testAttempts?: ChapterTestAttemptItem[]
  toeicAttempts?: ToeicExamAttemptItem[]
  coursesMap?: Map<string, Course>
  targetScore?: number
  baselineScore?: number
  listeningScore?: number
  readingScore?: number
  speakingScore?: number
  writingScore?: number
  initialSkillsType?: '2SKILLS' | '4SKILLS'
  onNavigate: (path: string) => void
}

function MiniSparkline({
  data,
  color,
  gradientId,
}: {
  data: number[]
  color: string
  gradientId: string
}) {
  const width = 110
  const height = 44
  const padding = 4

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((val, idx) => {
    const x = padding + (idx / Math.max(1, data.length - 1)) * (width - 2 * padding)
    const y = height - padding - ((val - min) / range) * (height - 2 * padding)
    return { x, y }
  })

  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }

  const areaD = `${d} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-20 sm:w-24 h-9 overflow-visible shrink-0">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradientId})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function RadialDonutGauge({
  percentage,
  size = 96,
  strokeWidth = 10,
}: {
  percentage: number
  size?: number
  strokeWidth?: number
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border/40"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#donutGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="donutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-lg font-black text-text-primary leading-none">{percentage}%</span>
        <span className="text-[10px] font-bold text-text-tertiary mt-0.5">Đạt chuẩn</span>
      </div>
    </div>
  )
}

export function ProgressGrowthAnalyticsTab({
  recentActivities,
  enrolledCourseCards,
  testAttempts = [],
  toeicAttempts = [],
  coursesMap,
  targetScore = 0,
  baselineScore = 0,
  listeningScore = 0,
  readingScore = 0,
  speakingScore = 0,
  writingScore = 0,
  initialSkillsType = '2SKILLS',
  onNavigate,
}: ProgressGrowthAnalyticsTabProps) {
  const [selectedSkillsType, setSelectedSkillsType] = useState<'2SKILLS' | '4SKILLS'>(
    initialSkillsType || (speakingScore > 0 || writingScore > 0 ? '4SKILLS' : '2SKILLS')
  )
  const {
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
  } = useProgressGrowthAnalytics({
    enrolledCourseCards,
    testAttempts,
    toeicAttempts,
    coursesMap,
    baselineScore,
    listeningScore,
    readingScore,
  })

  const totalTests = recentActivities.length
  const passedTests = recentActivities.filter((a) => a.isPassed).length
  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
  const recentTopActivities = recentActivities.slice(0, 3)

  const handleNavigateActivity = (act: ProgressRecentActivity) => {
    const query = new URLSearchParams()
    query.set('sourceType', act.type)
    if (act.examType) query.set('testType', act.examType)
    if (act.courseId) query.set('courseId', act.courseId)
    if (act.moduleId) query.set('moduleId', act.moduleId)
    if (act.title) query.set('title', act.title)
    if (act.scoreText) query.set('score', act.scoreText)
    if (act.scoreValue !== undefined) query.set('scoreVal', String(act.scoreValue))
    if (act.correctCount !== undefined) query.set('correct', String(act.correctCount))
    if (act.totalQuestions !== undefined) query.set('total', String(act.totalQuestions))
    if (act.isPassed !== undefined) query.set('isPassed', String(act.isPassed))
    if (act.submittedAt) query.set('submittedAt', act.submittedAt)
    if (act.durationSeconds !== undefined) query.set('duration', String(act.durationSeconds))

    onNavigate(`/exam-history/${act.id}?${query.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div>
            <h3 className="text-base font-black text-text-primary tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Điểm kiểm tra các chương học
            </h3>
            <p className="text-xs text-text-tertiary">Theo dõi điểm số thực tế (%) qua các bài kiểm tra từng chương trong khóa học</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {enrolledCourseCards.length > 0 && (
              <ProgressCourseFilterDropdown
                enrolledCourseCards={enrolledCourseCards}
                selectedCourseId={selectedChapterCourseId}
                onSelectCourse={setSelectedChapterCourseId}
              />
            )}
            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold border-none text-[11px] px-2.5 py-1">
              {chapterTimelinePoints.length} bài kiểm tra chương
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-surface-subtle/60 border border-border/60">
            <span className="text-[10px] font-bold text-text-tertiary block">Điểm bài gần nhất</span>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {latestChapterScore > 0 ? `${latestChapterScore}%` : '--'}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-surface-subtle/60 border border-border/60">
            <span className="text-[10px] font-bold text-text-tertiary block">Điểm trung bình các chương</span>
            <div className="text-xl font-black text-text-primary">
              {avgChapterScore > 0 ? `${avgChapterScore}%` : '--'}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-surface-subtle/60 border border-border/60">
            <span className="text-[10px] font-bold text-text-tertiary block">Chuẩn đạt yêu cầu</span>
            <div className="text-xl font-black text-text-secondary">70%</div>
          </div>
          <div className="p-3 rounded-xl bg-surface-subtle/60 border border-border/60">
            <span className="text-[10px] font-bold text-text-tertiary block">Đánh giá chung</span>
            <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {avgChapterScore >= 70 ? 'Đạt chuẩn chương' : chapterTimelinePoints.length > 0 ? 'Cần ôn luyện thêm' : 'Chưa có bài làm'}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <GrowthAreaChart
            data={chapterTimelinePoints}
            height={200}
            minVal={0}
            maxVal={100}
            targetValue={70}
            targetLabel="Chuẩn đạt"
            colorTheme="emerald"
            valueSuffix="%"
            yAxisTicks={[0, 20, 40, 60, 80, 100]}
            emptyMessage="Chưa có bài kiểm tra chương nào. Hãy hoàn thành các bài kiểm tra chương trong khóa học để theo dõi điểm số thực tế."
          />
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-3 text-[11px] text-text-secondary">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 font-semibold text-text-primary">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Điểm thực tế bài làm (%)
            </span>
            <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-2.5 h-0.5 border-t-2 border-dashed border-emerald-500" />
              Chuẩn đạt yêu cầu (70%)
            </span>
          </div>
          <Button
            onClick={() => onNavigate('/courses')}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs font-bold gap-1 cursor-pointer h-7 px-2.5"
          >
            <BookOpen size={12} />
            <span>Khóa học</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 rounded-2xl border border-border/80 bg-surface p-5 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
            <div>
              <h3 className="text-base font-black text-text-primary tracking-tight flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                Biến thiên năng lực điểm TOEIC
              </h3>
              <p className="text-xs text-text-tertiary">Theo dõi điểm TOEIC qua bài thi đầu vào, các lần luyện đề TOEIC và bài thi cuối khóa</p>
            </div>
            <Badge className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold border-none text-[11px] px-2.5 py-1">
              {toeicTimelinePoints.length} mốc điểm TOEIC
            </Badge>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold shrink-0">
              <Trophy size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
                  {latestToeicScore > 0 ? `${latestToeicScore}đ` : '--'}
                </span>
                {toeicTimelinePoints.length > 0 ? (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      netGrowthToeic >= 0
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {netGrowthToeic >= 0 ? `+${netGrowthToeic}đ` : `${netGrowthToeic}đ`}
                  </span>
                ) : (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-surface-subtle text-text-tertiary">
                    Chưa có bài thi
                  </span>
                )}
              </div>
              <span className="text-[11px] text-text-tertiary font-medium">Điểm số bài thi TOEIC gần nhất</span>
            </div>
          </div>

          <div className="pt-2">
            <GrowthAreaChart
              data={toeicTimelinePoints}
              height={200}
              minVal={0}
              maxVal={990}
              targetValue={targetScore > 0 ? targetScore : undefined}
              targetLabel="Mục tiêu"
              baselineValue={baselineScore > 0 ? baselineScore : undefined}
              baselineLabel="Baseline"
              colorTheme="indigo"
              valueSuffix="đ"
              yAxisTicks={[0, 250, 450, 650, 850, 990]}
              emptyMessage="Chưa có bài thi TOEIC nào. Hãy luyện đề hoặc làm bài kiểm tra đầu vào để theo dõi điểm số."
            />
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-3 text-[11px] text-text-secondary">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1 font-semibold text-text-primary">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                Điểm bài làm TOEIC
              </span>
              <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                <span className="w-2.5 h-0.5 border-t-2 border-dashed border-amber-500" />
                {targetScore > 0 ? `Mục tiêu (${targetScore}đ)` : 'Mục tiêu (Chưa đặt)'}
              </span>
              <span className="flex items-center gap-1 font-semibold text-slate-500">
                <span className="w-2.5 h-0.5 border-t-2 border-dashed border-slate-400" />
                {baselineScore > 0 ? `Baseline (${baselineScore}đ)` : 'Baseline (Chưa có)'}
              </span>
            </div>
            <Button
              onClick={() => onNavigate('/toeic')}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-bold gap-1 cursor-pointer h-7 px-2.5"
            >
              <span>Luyện đề TOEIC</span>
              <ArrowRight size={11} />
            </Button>
          </div>
        </div>

        <div className="lg:col-span-4 rounded-2xl border border-border/80 bg-surface p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/60 pb-3 gap-2">
            <div>
              <h3 className="text-base font-black text-text-primary tracking-tight">Cân bằng kỹ năng</h3>
              <p className="text-xs text-text-tertiary">Phân bố điểm số & mục tiêu</p>
            </div>
            <div className="flex items-center gap-1 p-0.5 bg-surface-subtle/80 rounded-xl border border-border/60 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedSkillsType('2SKILLS')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  selectedSkillsType === '2SKILLS'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                2 Kỹ Năng
              </button>
              <button
                type="button"
                onClick={() => setSelectedSkillsType('4SKILLS')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  selectedSkillsType === '4SKILLS'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                4 Kỹ Năng
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-surface-subtle/60 border border-border/60 text-center">
            <div>
              <span className="text-[10px] font-bold text-text-tertiary block">Baseline</span>
              <span className="text-sm font-black text-text-primary">
                {selectedSkillsType === '4SKILLS'
                  ? (baselineScore > 0 || speakingScore > 0 || writingScore > 0)
                    ? `${baselineScore + speakingScore + writingScore}đ`
                    : '--'
                  : baselineScore > 0
                    ? `${baselineScore}đ`
                    : '--'}
              </span>
            </div>
            <div className="border-x border-border/60">
              <span className="text-[10px] font-bold text-text-tertiary block">Kỷ lục</span>
              <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                {peakToeicScore > 0 ? `${peakToeicScore}đ` : '--'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-text-tertiary block">Mục tiêu</span>
              <span className="text-sm font-black text-primary">
                {targetScore > 0 ? `${targetScore}đ` : 'Chưa đặt'}
              </span>
            </div>
          </div>

          <div className="space-y-3 flex-1">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-text-primary">1. Listening (Nghe hiểu)</span>
                <span className="font-black text-indigo-600 dark:text-indigo-400">{listeningScore || 0} / 495đ</span>
              </div>
              <p className="text-[11px] text-text-tertiary mb-1.5">Kỹ năng nghe Audio, hội thoại, độc thoại</p>
              <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, ((listeningScore || 0) / 495) * 100))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-text-primary">2. Reading (Đọc hiểu)</span>
                <span className="font-black text-rose-600 dark:text-rose-400">{readingScore || 0} / 495đ</span>
              </div>
              <p className="text-[11px] text-text-tertiary mb-1.5">Ngữ pháp, từ vựng & đọc hiểu đoạn văn</p>
              <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-rose-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, ((readingScore || 0) / 495) * 100))}%` }}
                />
              </div>
            </div>

            {selectedSkillsType === '4SKILLS' && (
              <>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-text-primary">3. Speaking (Nói)</span>
                    <span className="font-black text-teal-600 dark:text-teal-400">
                      {speakingScore > 0 ? `${speakingScore} / 200đ` : 'Chưa đánh giá'}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-tertiary mb-1.5">Phát âm, trọng âm, ngữ điệu & miêu tả</p>
                  <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(5, ((speakingScore || 0) / 200) * 100))}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-text-primary">4. Writing (Viết)</span>
                    <span className="font-black text-amber-600 dark:text-amber-400">
                      {writingScore > 0 ? `${writingScore} / 200đ` : 'Chưa đánh giá'}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-tertiary mb-1.5">Viết câu miêu tả tranh, phản hồi email & luận</p>
                  <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(5, ((writingScore || 0) / 200) * 100))}%` }}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-text-primary">
                  {selectedSkillsType === '4SKILLS' ? '5. Khóa học bài giảng' : '3. Khóa học bài giảng'}
                </span>
                <span className="font-black text-teal-600 dark:text-teal-400">{avgCourseProgress}%</span>
              </div>
              <p className="text-[11px] text-text-tertiary mb-1.5">{totalCompletedLessons} bài học hoàn thành qua các chương</p>
              <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, avgCourseProgress))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-border/80 bg-surface p-4 shadow-xs flex items-center justify-between gap-2">
          <div className="space-y-1">
            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-500/15 text-purple-700 dark:text-purple-300">
              Khởi điểm
            </span>
            <div className="text-xl font-black text-text-primary">
              {baselineScore > 0 ? `${baselineScore}đ` : '--'}
            </div>
            <p className="text-[11px] text-text-tertiary">
              {selectedSkillsType === '4SKILLS' && (speakingScore > 0 || writingScore > 0)
                ? `L: ${listeningScore}đ • R: ${readingScore}đ • S: ${speakingScore}đ • W: ${writingScore}đ`
                : listeningScore > 0 || readingScore > 0
                  ? `L: ${listeningScore}đ • R: ${readingScore}đ`
                  : 'Baseline đầu vào'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0">
            <Compass size={20} />
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-surface p-4 shadow-xs flex items-center justify-between gap-2">
          <div className="space-y-1">
            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500/15 text-amber-700 dark:text-amber-300">
              Kỷ lục TOEIC
            </span>
            <div className="text-xl font-black text-amber-600 dark:text-amber-400">
              {peakToeicScore > 0 ? `${peakToeicScore}đ` : '--'}
            </div>
            <p className="text-[11px] text-text-tertiary">Điểm TOEIC cao nhất</p>
          </div>
          {toeicProgression.length >= 2 ? (
            <MiniSparkline
              data={toeicProgression}
              color="#f59e0b"
              gradientId="sparkline-peak"
            />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
              <Trophy size={20} />
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border/80 bg-surface p-4 shadow-xs flex items-center justify-between gap-2">
          <div className="space-y-1">
            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
              Tăng trưởng TOEIC
            </span>
            <div
              className={`text-xl font-black ${
                netGrowthToeic >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {toeicTimelinePoints.length > 0 ? (netGrowthToeic >= 0 ? `+${netGrowthToeic}đ` : `${netGrowthToeic}đ`) : '--'}
            </div>
            <p className="text-[11px] text-text-tertiary">So với xuất phát</p>
          </div>
          {toeicProgression.length >= 2 ? (
            <MiniSparkline
              data={toeicProgression}
              color={netGrowthToeic >= 0 ? '#10b981' : '#f43f5e'}
              gradientId="sparkline-growth"
            />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <TrendingUp size={20} />
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border/80 bg-surface p-4 shadow-xs flex items-center justify-between gap-2">
          <div className="space-y-1">
            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-black bg-sky-500/15 text-sky-700 dark:text-sky-300">
              Mục tiêu TOEIC
            </span>
            <div className="text-xl font-black text-sky-600 dark:text-sky-400">
              {targetScore > 0 ? `${targetScore}đ` : 'Chưa đặt'}
            </div>
            <p className="text-[11px] text-text-tertiary">
              {targetScore > 0
                ? `Đạt ${Math.min(100, Math.max(0, Math.round(((peakToeicScore || latestToeicScore) / targetScore) * 100)))}% mục tiêu`
                : 'Chuẩn đầu ra'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold shrink-0">
            <Target size={20} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <h3 className="text-base font-black text-text-primary tracking-tight">Tỷ lệ đạt chuẩn bài thi</h3>
            <p className="text-xs text-text-tertiary">Tổng hợp kết quả các bài kiểm tra và bài thi gần nhất</p>
          </div>
          <Badge variant="outline" className="text-[10px] font-bold">
            {passedTests}/{totalTests} bài đạt
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <RadialDonutGauge percentage={passRate} size={95} strokeWidth={10} />

          <div className="flex-1 space-y-2 w-full min-w-0">
            {recentTopActivities.length === 0 ? (
              <p className="text-xs text-text-tertiary italic">Chưa có bài kiểm tra nào hoàn thành.</p>
            ) : (
              recentTopActivities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => handleNavigateActivity(act)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface-subtle/50 hover:bg-surface-subtle border border-border/40 transition-colors cursor-pointer text-xs"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-bold text-text-primary truncate block">{act.title}</span>
                    <span className="text-[10px] text-text-tertiary">
                      {new Date(act.submittedAt).toLocaleDateString('vi-VN')} • {act.subtitle}
                    </span>
                  </div>
                  <span
                    className={`font-black text-xs px-2 py-0.5 rounded-md shrink-0 ${
                      act.isPassed
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {act.scoreText}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
