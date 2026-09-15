// Component biểu đồ miền phân tích quá trình phát triển năng lực toàn diện của học viên theo phong cách bảng điều khiển hiện đại.
'use client'

import { useState, useMemo } from 'react'
import {
  Trophy,
  ArrowRight,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/button'
import { Badge } from '@/components/badge'
import { GrowthAreaChart } from '@/components/growth.area.chart'
import type { ProgressRecentActivity, UnifiedCourseCardItem } from '@/features/progress/hooks/use.progress.data'
import { useProgressGrowthAnalytics } from '@/features/progress/hooks/use.progress.growth.analytics'

interface ProgressGrowthAnalyticsTabProps {
  recentActivities: ProgressRecentActivity[]
  enrolledCourseCards: UnifiedCourseCardItem[]
  targetScore?: number
  baselineScore?: number
  listeningScore?: number
  readingScore?: number
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
  targetScore = 650,
  baselineScore = 240,
  listeningScore = 0,
  readingScore = 0,
  onNavigate,
}: ProgressGrowthAnalyticsTabProps) {
  const [chartFilter, setChartFilter] = useState<'ALL' | 'TOEIC' | 'COURSE'>('ALL')

  const {
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
  } = useProgressGrowthAnalytics({
    recentActivities,
    enrolledCourseCards,
    baselineScore,
  })

  const filteredExamPoints = useMemo(() => {
    if (chartFilter === 'TOEIC') {
      return examTimelinePoints.filter(
        (p) => p.tag === 'Placement' || (p.tooltipTitle && p.tooltipTitle.toLowerCase().includes('toeic'))
      )
    }
    if (chartFilter === 'COURSE') {
      return examTimelinePoints.filter(
        (p) => p.tag !== 'Placement' && !(p.tooltipTitle && p.tooltipTitle.toLowerCase().includes('toeic'))
      )
    }
    return examTimelinePoints
  }, [examTimelinePoints, chartFilter])

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
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 rounded-2xl border border-border/80 bg-surface p-5 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
            <div>
              <h3 className="text-base font-black text-text-primary tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                Biến thiên năng lực bài thi
              </h3>
              <p className="text-xs text-text-tertiary">Theo dõi điểm số TOEIC theo dòng thời gian làm bài</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={chartFilter}
                  onChange={(e) => setChartFilter(e.target.value as 'ALL' | 'TOEIC' | 'COURSE')}
                  className="rounded-xl border border-border bg-surface-subtle/60 px-3 py-1 text-xs font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer pr-7 appearance-none"
                >
                  <option value="ALL">Tất cả bài test</option>
                  <option value="TOEIC">Đề thi TOEIC</option>
                  <option value="COURSE">Kiểm tra khóa học</option>
                </select>
                <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
              </div>
              <Badge className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold border-none text-[11px] px-2.5 py-1">
                {recentActivities.length} bài thi
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold shrink-0">
              <Trophy size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
                  {latestScore}đ
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    netGrowth >= 0
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {netGrowth >= 0 ? `+${netGrowth}đ` : `${netGrowth}đ`}
                </span>
              </div>
              <span className="text-[11px] text-text-tertiary font-medium">Điểm số bài kiểm tra gần nhất</span>
            </div>
          </div>

          <div className="pt-2">
            <GrowthAreaChart
              data={filteredExamPoints}
              height={200}
              minVal={0}
              maxVal={990}
              targetValue={targetScore}
              targetLabel="Mục tiêu"
              baselineValue={baselineScore}
              baselineLabel="Baseline"
              colorTheme="indigo"
              valueSuffix="đ"
              yAxisTicks={[0, 250, 450, 650, 850, 990]}
              emptyMessage="Chưa có bài thi nào được ghi nhận."
            />
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-3 text-[11px] text-text-secondary">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1 font-semibold text-text-primary">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                Điểm bài làm
              </span>
              <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                <span className="w-2.5 h-0.5 border-t-2 border-dashed border-amber-500" />
                Mục tiêu ({targetScore}đ)
              </span>
              <span className="flex items-center gap-1 font-semibold text-slate-500">
                <span className="w-2.5 h-0.5 border-t-2 border-dashed border-slate-400" />
                Baseline ({baselineScore}đ)
              </span>
            </div>
            <Button
              onClick={() => onNavigate('/toeic')}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-bold gap-1 cursor-pointer h-7 px-2.5"
            >
              <span>Luyện đề</span>
              <ArrowRight size={11} />
            </Button>
          </div>
        </div>

        <div className="lg:col-span-4 rounded-2xl border border-border/80 bg-surface p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="text-base font-black text-text-primary tracking-tight">Cân bằng kỹ năng</h3>
              <p className="text-xs text-text-tertiary">Phân bố điểm số & mục tiêu</p>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold">
              TOEIC 2 Skills
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-surface-subtle/60 border border-border/60 text-center">
            <div>
              <span className="text-[10px] font-bold text-text-tertiary block">Baseline</span>
              <span className="text-sm font-black text-text-primary">{baselineScore}đ</span>
            </div>
            <div className="border-x border-border/60">
              <span className="text-[10px] font-bold text-text-tertiary block">Kỷ lục</span>
              <span className="text-sm font-black text-amber-600 dark:text-amber-400">{peakScore}đ</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-text-tertiary block">Mục tiêu</span>
              <span className="text-sm font-black text-primary">{targetScore}đ</span>
            </div>
          </div>

          <div className="space-y-3.5 flex-1">
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

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-text-primary">3. Khóa học bài giảng</span>
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
            <div className="text-xl font-black text-text-primary">{baselineScore}đ</div>
            <p className="text-[11px] text-text-tertiary">Baseline đầu vào</p>
          </div>
          <MiniSparkline
            data={[baselineScore, baselineScore, baselineScore + 10, baselineScore, baselineScore + 15]}
            color="#a855f7"
            gradientId="sparkline-baseline"
          />
        </div>

        <div className="rounded-2xl border border-border/80 bg-surface p-4 shadow-xs flex items-center justify-between gap-2">
          <div className="space-y-1">
            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500/15 text-amber-700 dark:text-amber-300">
              Kỷ lục
            </span>
            <div className="text-xl font-black text-amber-600 dark:text-amber-400">{peakScore}đ</div>
            <p className="text-[11px] text-text-tertiary">Điểm cao nhất</p>
          </div>
          <MiniSparkline
            data={[
              baselineScore,
              baselineScore + (peakScore - baselineScore) * 0.35,
              baselineScore + (peakScore - baselineScore) * 0.7,
              peakScore - 20,
              peakScore,
            ]}
            color="#f59e0b"
            gradientId="sparkline-peak"
          />
        </div>

        <div className="rounded-2xl border border-border/80 bg-surface p-4 shadow-xs flex items-center justify-between gap-2">
          <div className="space-y-1">
            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
              Tăng trưởng
            </span>
            <div
              className={`text-xl font-black ${
                netGrowth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {netGrowth >= 0 ? `+${netGrowth}` : netGrowth}đ
            </div>
            <p className="text-[11px] text-text-tertiary">So với xuất phát</p>
          </div>
          <MiniSparkline
            data={[
              0,
              Math.max(0, netGrowth * 0.25),
              Math.max(0, netGrowth * 0.55),
              Math.max(0, netGrowth * 0.8),
              Math.max(5, netGrowth),
            ]}
            color="#10b981"
            gradientId="sparkline-growth"
          />
        </div>

        <div className="rounded-2xl border border-border/80 bg-surface p-4 shadow-xs flex items-center justify-between gap-2">
          <div className="space-y-1">
            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-black bg-sky-500/15 text-sky-700 dark:text-sky-300">
              Mục tiêu
            </span>
            <div className="text-xl font-black text-sky-600 dark:text-sky-400">{targetScore}đ</div>
            <p className="text-[11px] text-text-tertiary">Chuẩn đầu ra</p>
          </div>
          <MiniSparkline
            data={[baselineScore, baselineScore + 100, baselineScore + 180, targetScore - 40, targetScore]}
            color="#0ea5e9"
            gradientId="sparkline-target"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 rounded-2xl border border-border/80 bg-surface p-5 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
            <div>
              <h3 className="text-base font-black text-text-primary tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                Tiến độ tích lũy khóa học
              </h3>
              <p className="text-xs text-text-tertiary">Sự hoàn thành các bài học & chặng kiểm tra theo khóa</p>
            </div>
            {enrolledCourseCards.length > 0 && (
              <div className="relative">
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="rounded-xl border border-border bg-surface-subtle/60 px-3 py-1 text-xs font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer pr-7 appearance-none"
                >
                  <option value="all">Tất cả khóa học</option>
                  {enrolledCourseCards.map((c) => (
                    <option key={c.course_id} value={c.course_id}>
                      {c.title}
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-3">
            <div className="space-y-0.5 shrink-0">
              <span className="text-[10px] font-bold text-text-tertiary uppercase">Tiến độ trung bình</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{avgCourseProgress}%</div>
              <span className="text-[11px] text-text-tertiary font-semibold">{totalCompletedLessons} bài hoàn thành</span>
            </div>
            <div className="flex-1 min-w-0">
              {isLoadingCourseChart ? (
                <div className="h-[150px] flex items-center justify-center text-xs text-text-tertiary">
                  Đang tải đồ thị khóa học...
                </div>
              ) : (
                <GrowthAreaChart
                  data={courseTimelinePoints}
                  height={150}
                  minVal={0}
                  maxVal={100}
                  targetValue={80}
                  targetLabel="Chuẩn đạt"
                  colorTheme="emerald"
                  valueSuffix="%"
                  yAxisTicks={[0, 25, 50, 75, 100]}
                  emptyMessage="Chưa có tiến độ khóa học."
                />
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl border border-border/80 bg-surface p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="text-base font-black text-text-primary tracking-tight">Tỷ lệ đạt chuẩn</h3>
              <p className="text-xs text-text-tertiary">Kết quả các bài test gần nhất</p>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold">
              {passedTests}/{totalTests} bài đạt
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <RadialDonutGauge percentage={passRate} size={95} strokeWidth={10} />

            <div className="flex-1 space-y-2 min-w-0">
              {recentTopActivities.length === 0 ? (
                <p className="text-xs text-text-tertiary italic">Chưa có bài kiểm tra nào hoàn thành.</p>
              ) : (
                recentTopActivities.map((act) => (
                  <div
                    key={act.id}
                    onClick={() => handleNavigateActivity(act)}
                    className="flex items-center justify-between p-2 rounded-xl bg-surface-subtle/50 hover:bg-surface-subtle border border-border/40 transition-colors cursor-pointer text-xs"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="font-bold text-text-primary truncate block">{act.title}</span>
                      <span className="text-[10px] text-text-tertiary">
                        {new Date(act.submittedAt).toLocaleDateString('vi-VN')}
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

          <div className="pt-1 flex items-center justify-end gap-2 border-t border-border/60">
            <Button
              onClick={() => onNavigate('/roadmap')}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-bold h-7 px-3 cursor-pointer"
            >
              Lộ trình
            </Button>
            <Button
              onClick={() => onNavigate('/courses')}
              size="sm"
              className="bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold h-7 px-3 cursor-pointer"
            >
              Khóa học
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
