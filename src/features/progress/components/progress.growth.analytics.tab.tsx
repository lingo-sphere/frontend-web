// Component biểu đồ miền phân tích quá trình phát triển năng lực toàn diện của học viên
'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  TrendingUp,
  Target,
  Trophy,
  Award,
  Sparkles,
  BookOpen,
  Headphones,
  Calendar,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  ChevronDown,
  Compass,
} from 'lucide-react'
import { Card } from '@/components/card'
import { Button } from '@/components/button'
import { Badge } from '@/components/badge'
import { GrowthAreaChart, GrowthChartDataPoint } from '@/components/growth.area.chart'
import type { ProgressRecentActivity, UnifiedCourseCardItem } from '@/features/progress/hooks/use.progress.data'
import { progressService } from '@/features/progress/services/progress.service'

interface ProgressGrowthAnalyticsTabProps {
  recentActivities: ProgressRecentActivity[]
  enrolledCourseCards: UnifiedCourseCardItem[]
  targetScore?: number
  baselineScore?: number
  listeningScore?: number
  readingScore?: number
  onNavigate: (path: string) => void
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
    return isoString
  }
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
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all')
  const [courseGrowthPoints, setCourseGrowthPoints] = useState<Array<{ stage: string; score: number; timestamp?: string }>>([])
  const [isLoadingCourseChart, setIsLoadingCourseChart] = useState<boolean>(false)

  useEffect(() => {
    if (selectedCourseId !== 'all') {
      setIsLoadingCourseChart(true)
      progressService
        .getGrowthChart(selectedCourseId)
        .then((res) => {
          if (res?.growth_chart_data && Array.isArray(res.growth_chart_data)) {
            setCourseGrowthPoints(res.growth_chart_data)
          } else {
            setCourseGrowthPoints([])
          }
        })
        .catch(() => {
          setCourseGrowthPoints([])
        })
        .finally(() => {
          setIsLoadingCourseChart(false)
        })
    }
  }, [selectedCourseId])

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
    if (recentActivities.length === 0) return baselineScore
    return Math.max(...recentActivities.map((a) => a.scoreValue), baselineScore)
  }, [recentActivities, baselineScore])

  const latestScore = useMemo(() => {
    if (recentActivities.length === 0) return baselineScore
    return recentActivities[0].scoreValue
  }, [recentActivities, baselineScore])

  const netGrowth = latestScore - baselineScore

  const totalCompletedLessons = useMemo(() => {
    return enrolledCourseCards.reduce((acc, c) => acc + (c.completed_lessons_count || 0), 0)
  }, [enrolledCourseCards])

  const avgCourseProgress = useMemo(() => {
    if (enrolledCourseCards.length === 0) return 0
    return Math.round(
      enrolledCourseCards.reduce((acc, c) => acc + c.progress_percentage, 0) / enrolledCourseCards.length
    )
  }, [enrolledCourseCards])

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-border/60 bg-surface/80 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-text-tertiary text-xs font-semibold">
            <Target size={14} className="text-slate-500" />
            <span>Mốc khởi điểm</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-text-primary mt-1">
            {baselineScore}đ
          </div>
          <div className="text-[11px] text-text-secondary mt-0.5">Điểm Baseline đầu vào</div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-surface/80 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-text-tertiary text-xs font-semibold">
            <Trophy size={14} className="text-amber-500" />
            <span>Kỷ lục cao nhất</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {peakScore}đ
          </div>
          <div className="text-[11px] text-text-secondary mt-0.5">Đạt được qua các bài test</div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-surface/80 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-text-tertiary text-xs font-semibold">
            <TrendingUp size={14} className={netGrowth >= 0 ? 'text-emerald-500' : 'text-rose-500'} />
            <span>Mức tăng trưởng</span>
          </div>
          <div
            className={`text-xl sm:text-2xl font-black mt-1 ${
              netGrowth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {netGrowth >= 0 ? `+${netGrowth}` : netGrowth}đ
          </div>
          <div className="text-[11px] text-text-secondary mt-0.5">So với mốc Baseline</div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-surface/80 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-text-tertiary text-xs font-semibold">
            <Sparkles size={14} className="text-primary" />
            <span>Mục tiêu lộ trình</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-primary mt-1">
            {targetScore}đ
          </div>
          <div className="text-[11px] text-text-secondary mt-0.5">Chuẩn đầu ra hướng đến</div>
        </div>
      </div>

      <div className="rounded-3xl border border-border/70 bg-surface p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <h3 className="text-base sm:text-lg font-black text-text-primary tracking-tight">
                Biểu đồ miền: Quá trình phát triển bài kiểm tra trong toàn hệ thống
              </h3>
            </div>
            <p className="text-xs text-text-secondary">
              Theo dõi sự biến thiên điểm số TOEIC (thang 0 - 990) qua các bài test đầu vào, test định kỳ và thi thử theo dòng thời gian.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <Badge className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold border-none px-3 py-1">
              {recentActivities.length} bài thi đã ghi nhận
            </Badge>
          </div>
        </div>

        <div className="pt-2">
          <GrowthAreaChart
            data={examTimelinePoints}
            height={300}
            minVal={0}
            maxVal={990}
            targetValue={targetScore}
            targetLabel="Mục tiêu"
            baselineValue={baselineScore}
            baselineLabel="Baseline"
            colorTheme="indigo"
            valueSuffix="đ"
            yAxisTicks={[0, 250, 450, 650, 850, 990]}
            emptyMessage="Chưa có bài thi nào được ghi nhận. Hãy làm bài Test Đầu Vào để bắt đầu vẽ đồ thị!"
          />
        </div>

        <div className="rounded-2xl bg-surface-subtle/70 border border-border/50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-text-secondary">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold text-text-primary">
              <span className="w-3 h-3 rounded-full bg-indigo-600" />
              Đường điểm số bài kiểm tra
            </span>
            <span className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-500" />
              Mốc mục tiêu ({targetScore} TOEIC)
            </span>
            <span className="flex items-center gap-1.5 font-bold text-slate-500">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-slate-400" />
              Baseline ({baselineScore}đ)
            </span>
          </div>

          <Button
            onClick={() => onNavigate('/toeic')}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Luyện thêm đề thi</span>
            <ArrowRight size={13} />
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-border/70 bg-surface p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-base sm:text-lg font-black text-text-primary tracking-tight">
                Biểu đồ miền: Quá trình phát triển của toàn khóa học
              </h3>
            </div>
            <p className="text-xs text-text-secondary">
              Ghi lại sự tích lũy kiến thức, hoàn thành bài giảng và kết quả kiểm tra từng chương qua các khóa học.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
            {enrolledCourseCards.length > 0 && (
              <div className="relative">
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-text-primary focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none pr-8"
                >
                  <option value="all">Toàn bộ khóa học (Tổng quan)</option>
                  {enrolledCourseCards.map((c) => (
                    <option key={c.course_id} value={c.course_id}>
                      {c.title}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
              </div>
            )}
          </div>
        </div>

        <div className="pt-2">
          {isLoadingCourseChart ? (
            <div className="h-[280px] flex items-center justify-center text-xs text-text-secondary">
              Đang tổng hợp đồ thị chặng khóa học...
            </div>
          ) : (
            <GrowthAreaChart
              data={courseTimelinePoints}
              height={280}
              minVal={0}
              maxVal={100}
              targetValue={80}
              targetLabel="Chuẩn đạt (80%)"
              colorTheme="emerald"
              valueSuffix="%"
              yAxisTicks={[0, 25, 50, 75, 100]}
              emptyMessage="Chưa có tiến độ khóa học nào được ghi nhận."
            />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="rounded-2xl border border-border/60 bg-surface-subtle/60 p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <GraduationCap size={20} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-text-tertiary uppercase">Tổng số khóa học</div>
              <div className="text-sm font-black text-text-primary mt-0.5">
                {enrolledCourseCards.length} khóa học
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-surface-subtle/60 p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <BookOpen size={20} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-text-tertiary uppercase">Bài học hoàn thành</div>
              <div className="text-sm font-black text-text-primary mt-0.5">
                {totalCompletedLessons} bài giảng
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-surface-subtle/60 p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-text-tertiary uppercase">Tiến độ trung bình</div>
              <div className="text-sm font-black text-primary mt-0.5">
                {avgCourseProgress}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-3xl border border-border/70 bg-surface p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Headphones size={20} />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-text-primary">
                Cân bằng kỹ năng Listening & Reading
              </h4>
              <p className="text-xs text-text-secondary">Độ chênh lệch giữa 2 kỹ năng cốt lõi</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-text-primary mb-1">
                <span>🎧 Listening</span>
                <span>{listeningScore || 0} / 495đ</span>
              </div>
              <div className="w-full bg-border/40 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, ((listeningScore || 0) / 495) * 100))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-text-primary mb-1">
                <span>📖 Reading</span>
                <span>{readingScore || 0} / 495đ</span>
              </div>
              <div className="w-full bg-border/40 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, ((readingScore || 0) / 495) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-surface via-surface to-primary/5 p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-extrabold">
              <Compass size={14} />
              <span>Định hướng lộ trình AI</span>
            </div>
            <h4 className="text-sm sm:text-base font-black text-text-primary">
              Tiếp tục duy trì nhịp độ làm bài kiểm tra
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Các bài kiểm tra định kỳ giúp củng cố phản xạ đề thi và đo lường sự tiến bộ chuẩn xác nhất. Hãy luyện thêm đề thi hoặc hoàn thành bài học tiếp theo để bứt phá mục tiêu {targetScore} TOEIC!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              onClick={() => onNavigate('/roadmap')}
              className="bg-primary hover:bg-primary-hover text-white text-xs font-extrabold rounded-xl px-4 py-2 cursor-pointer shadow-md shadow-primary/20 flex items-center gap-1.5"
            >
              <span>Xem lộ trình cá nhân</span>
              <ArrowRight size={14} />
            </Button>
            <Button
              onClick={() => onNavigate('/courses')}
              variant="outline"
              className="rounded-xl text-xs font-bold px-4 py-2 cursor-pointer"
            >
              Tiếp tục học khóa học
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
