// Component hiển thị danh sách và phân tích các bài kiểm tra gần đây của học viên
'use client'

import {
  Award,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Headphones,
  GraduationCap,
  CheckCircle2,
  Clock,
  Target,
  Trophy,
  TrendingUp,
  XCircle,
  FileText,
  BookOpen,
} from 'lucide-react'
import { Card } from '@/components/card'
import { Button } from '@/components/button'
import { Badge } from '@/components/badge'
import type { ProgressRecentActivity } from '@/features/progress/hooks/use.progress.data'

interface ProgressRecentTestsTabProps {
  recentActivities: ProgressRecentActivity[]
  onNavigate: (path: string) => void
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}s`
  return `${m}m ${s > 0 ? `${s}s` : ''}`
}

function formatSubmittedDate(dateStr?: string): string {
  if (!dateStr) return 'Gần đây'
  try {
    const d = new Date(dateStr)
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  } catch {
    return dateStr
  }
}

export function ProgressRecentTestsTab({
  recentActivities,
  onNavigate,
}: ProgressRecentTestsTabProps) {
  const totalTests = recentActivities.length
  const maxScore = totalTests > 0 ? Math.max(...recentActivities.map((a) => a.scoreValue)) : 0
  const avgScore = totalTests > 0 ? Math.round(recentActivities.reduce((acc, a) => acc + a.scoreValue, 0) / totalTests) : 0
  const passedCount = recentActivities.filter((a) => a.isPassed).length
  const passRate = totalTests > 0 ? Math.round((passedCount / totalTests) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-border/60 bg-surface/70 backdrop-blur-xs p-4 flex items-center gap-3.5 shadow-xs transition-all hover:border-border">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Target size={22} />
          </div>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
              {totalTests}
            </div>
            <div className="text-[11px] font-semibold text-text-secondary truncate">
              Bài thi gần đây
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-surface/70 backdrop-blur-xs p-4 flex items-center gap-3.5 shadow-xs transition-all hover:border-border">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Trophy size={22} />
          </div>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {maxScore}đ
            </div>
            <div className="text-[11px] font-semibold text-text-secondary truncate">
              Kỷ lục điểm số
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-surface/70 backdrop-blur-xs p-4 flex items-center gap-3.5 shadow-xs transition-all hover:border-border">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <FileText size={22} />
          </div>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
              {avgScore}đ
            </div>
            <div className="text-[11px] font-semibold text-text-secondary truncate">
              Điểm trung bình
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-surface/70 backdrop-blur-xs p-4 flex items-center gap-3.5 shadow-xs transition-all hover:border-border">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp size={22} />
          </div>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {passRate}%
            </div>
            <div className="text-[11px] font-semibold text-text-secondary truncate">
              Tỷ lệ đạt chuẩn
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h4 className="text-base font-extrabold text-text-primary tracking-tight flex items-center gap-2">
            <span>Danh sách bài kiểm tra đã hoàn thành</span>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
              {totalTests}
            </span>
          </h4>
          <p className="text-xs text-text-secondary mt-0.5">
            Xem lại chi tiết kết quả, đáp án đúng sai và phân tích năng lực từng đề thi.
          </p>
        </div>

        <Button
          onClick={() => onNavigate('/exam-history')}
          variant="outline"
          size="sm"
          className="rounded-xl border-border/80 hover:bg-surface-subtle text-text-primary text-xs font-bold gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto shrink-0"
        >
          <span>Xem toàn bộ lịch sử thi</span>
          <ArrowRight size={14} />
        </Button>
      </div>

      {recentActivities.length === 0 ? (
        <Card className="rounded-3xl border border-dashed border-border/80 bg-surface/40 p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-sm">
            <Award size={32} />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h5 className="text-base font-extrabold text-text-primary">
              Chưa có bài kiểm tra nào được hoàn thành
            </h5>
            <p className="text-xs text-text-secondary leading-relaxed">
              Làm bài kiểm tra đánh giá năng lực đầu vào hoặc thi thử TOEIC để hệ thống ghi nhận tiến độ và định vị lộ trình cá nhân hóa cho bạn.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              onClick={() => onNavigate('/toeic/exam/placement_2skills')}
              className="bg-primary hover:bg-primary-hover text-white text-xs font-extrabold rounded-xl px-4 py-2 cursor-pointer shadow-md shadow-primary/20"
            >
              Test Đầu Vào 2 Kỹ Năng
            </Button>
            <Button
              onClick={() => onNavigate('/toeic')}
              variant="outline"
              className="rounded-xl text-xs font-bold px-4 py-2 cursor-pointer"
            >
              Xem danh sách đề thi
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3.5">
          {recentActivities.map((item) => {
            const isPlacement = item.examType === 'PLACEMENT' || item.title.toLowerCase().includes('đầu vào') || item.title.toLowerCase().includes('placement')
            const isCourse = item.type === 'COURSE'
            const durationText = formatDuration(item.durationSeconds)

            return (
              <div
                key={item.id}
                onClick={() => {
                  const query = new URLSearchParams()
                  query.set('sourceType', item.type)
                  if (item.examType) query.set('testType', item.examType)
                  if (item.courseId) query.set('courseId', item.courseId)
                  if (item.moduleId) query.set('moduleId', item.moduleId)
                  if (item.title) query.set('title', item.title)
                  if (item.scoreText) query.set('score', item.scoreText)
                  if (item.scoreValue !== undefined) query.set('scoreVal', String(item.scoreValue))
                  if (item.correctCount !== undefined) query.set('correct', String(item.correctCount))
                  if (item.totalQuestions !== undefined) query.set('total', String(item.totalQuestions))
                  if (item.isPassed !== undefined) query.set('isPassed', String(item.isPassed))
                  if (item.submittedAt) query.set('submittedAt', item.submittedAt)
                  if (item.durationSeconds !== undefined) query.set('duration', String(item.durationSeconds))

                  onNavigate(`/exam-history/${item.id}?${query.toString()}`)
                }}
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/70 bg-surface hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 cursor-pointer"
              >
                <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md text-white ${
                      isPlacement
                        ? 'bg-gradient-to-br from-violet-600 to-indigo-700 shadow-indigo-600/20'
                        : isCourse
                        ? 'bg-gradient-to-br from-emerald-600 to-teal-700 shadow-emerald-600/20'
                        : 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-600/20'
                    }`}
                  >
                    {isPlacement ? (
                      <Sparkles size={24} />
                    ) : isCourse ? (
                      <GraduationCap size={24} />
                    ) : (
                      <Headphones size={24} />
                    )}
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg border-none ${
                          isPlacement
                            ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300'
                            : isCourse
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                            : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
                        }`}
                      >
                        {isPlacement
                          ? 'Đánh giá đầu vào'
                          : isCourse
                          ? 'Khóa học'
                          : 'Đề thi TOEIC'}
                      </Badge>

                      <Badge
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border-none ${
                          item.isPassed
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {item.isPassed ? (
                          <>
                            <CheckCircle2 size={11} />
                            <span>Đạt chuẩn</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={11} />
                            <span>Chưa đạt</span>
                          </>
                        )}
                      </Badge>

                      {item.isBestAttempt && (
                        <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-lg border-none flex items-center gap-1">
                          <Trophy size={11} />
                          <span>Kỷ lục cao nhất</span>
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-black text-text-primary tracking-tight truncate group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-text-tertiary" />
                        <span>{formatSubmittedDate(item.submittedAt)}</span>
                      </span>

                      {durationText && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-medium">
                            <span>⏱️ Thời gian: {durationText}</span>
                          </span>
                        </>
                      )}

                      <span>•</span>
                      <span className="font-semibold text-text-primary">
                        🎯 {item.correctCount}/{item.totalQuestions} câu đúng ({item.scorePercentage}%)
                      </span>
                    </div>

                    {(typeof item.listeningScore === 'number' || typeof item.readingScore === 'number') && (
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        {typeof item.listeningScore === 'number' && (
                          <span className="px-2 py-0.5 rounded-md bg-surface-subtle border border-border/50 text-[11px] font-bold text-text-secondary flex items-center gap-1">
                            <Headphones size={11} />
                            <span>Listening: {item.listeningScore}đ</span>
                          </span>
                        )}
                        {typeof item.readingScore === 'number' && (
                          <span className="px-2 py-0.5 rounded-md bg-surface-subtle border border-border/50 text-[11px] font-bold text-text-secondary flex items-center gap-1">
                            <BookOpen size={11} />
                            <span>Reading: {item.readingScore}đ</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 border-border/40 pt-3 md:pt-0">
                  <div className="text-left md:text-right min-w-[110px]">
                    <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600 leading-none">
                      {item.scoreValue}
                    </div>
                    <div className="text-[10px] font-extrabold text-text-tertiary uppercase tracking-wider mt-1">
                      {isCourse ? 'Điểm số (%)' : `/ ${item.maxScore} TOEIC`}
                    </div>
                    <div className="w-full bg-border/40 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.isPassed ? 'bg-emerald-500' : 'bg-primary'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(5, (item.scoreValue / item.maxScore) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="w-10 h-10 rounded-2xl bg-surface-subtle border border-border/60 group-hover:bg-primary group-hover:text-white group-hover:border-primary flex items-center justify-center text-text-secondary transition-all shrink-0">
                    <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
