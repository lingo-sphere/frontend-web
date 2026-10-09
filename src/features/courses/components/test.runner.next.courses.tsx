// Hiển thị gợi ý khóa học tiếp theo khi hoàn thành hoặc định hướng ôn tập khi chưa đạt điểm chuẩn.

'use client'

import { Sparkles, GraduationCap, ArrowRight, BookOpen, RotateCcw, Trophy, Compass, Users } from 'lucide-react'
import { Button } from '@/components/button'
import { resolveMediaUrl } from '@/utils/media.utils'
import type { Course } from '@/types/api.types'

interface TestRunnerNextCoursesProps {
  isPassed: boolean
  passingScore: number
  testType?: string
  recommendedNextCourses?: (Course & { recommendation_reason?: string; match_score?: number })[]
  onNavigateCourse?: (slugOrId: string) => void
  onBackToLessons?: () => void
  onRetry: () => void
}

export function TestRunnerNextCourses({
  isPassed,
  passingScore,
  testType,
  recommendedNextCourses = [],
  onNavigateCourse,
  onBackToLessons,
  onRetry,
}: TestRunnerNextCoursesProps) {
  const isFinalTest = testType === 'final-test'

  if (!isFinalTest && isPassed) {
    return null
  }
  if (isPassed && recommendedNextCourses && recommendedNextCourses.length > 0) {
    return (
      <div className="p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/70 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/30 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-200/50 dark:border-indigo-800/50 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles size={16} />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-text-primary">
                Khóa Học Đề Xuất Nâng Cao Kế Tiếp
              </h4>
              <p className="text-xs text-text-secondary">
                Chúc mừng bạn đã đạt chuẩn bài thi! Hãy tiếp tục hành trình nâng band điểm với các khóa học tiếp theo:
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {recommendedNextCourses.slice(0, 2).map((c) => {
            const cId = c._id || c.id || ''
            return (
              <div
                key={cId}
                className="rounded-xl border border-border bg-surface p-3.5 flex flex-col justify-between space-y-2.5 shadow-2xs hover:border-indigo-400 transition-all"
              >
                <div className="flex gap-3">
                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 relative">
                    {c.thumbnail_url ? (
                      <img src={resolveMediaUrl(c.thumbnail_url)} alt={c.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-500/20 text-indigo-600">
                        <GraduationCap size={20} />
                      </div>
                    )}
                    {c.target_score && (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/70 text-[9px] font-bold text-white">
                        🎯 {c.target_score}+
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs line-clamp-2 text-text-primary hover:text-indigo-600">
                      {c.title}
                    </h5>
                    <p className="text-[10.5px] text-indigo-600 dark:text-indigo-400 mt-1 line-clamp-1">
                      💡 {c.recommendation_reason || 'Khóa học cấp độ kế tiếp phù hợp cho bạn'}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-text-tertiary">
                      <Users size={11} className="text-indigo-500 shrink-0" />
                      <span>{Number(c.students_count || 0).toLocaleString('vi-VN')} học viên</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border/60 pt-2">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {c.price && c.price > 0 ? `${c.price.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => onNavigateCourse?.(c.slug || cId)}
                    className="h-7 text-xs font-semibold px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer flex items-center gap-1"
                  >
                    <span>Khám phá ngay</span>
                    <ArrowRight size={12} />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (isPassed && (!recommendedNextCourses || recommendedNextCourses.length === 0)) {
    return (
      <div className="p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/70 dark:from-emerald-950/40 dark:via-slate-900 dark:to-teal-950/30 shadow-sm space-y-4 animate-in fade-in duration-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Trophy size={20} />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-emerald-600 text-white shadow-2xs">
                Chinh Phục Xuất Sắc
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                Đạt chuẩn ≥ {passingScore}%
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-text-primary">
              Bạn Đã Đạt Cấp Độ Cao Nhất Trong Lộ Trình Này!
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Chúc mừng bạn đã hoàn thành xuất sắc bài kiểm tra! Hiện tại trong hệ thống chưa có khóa học cấp độ tiếp theo phù hợp hơn cấp độ của bạn. Bạn đã nắm vững toàn bộ kiến thức trọng tâm của khóa học này. Hãy thử sức ngay với các đề thi thử TOEIC thực chiến để đánh giá năng lực toàn diện hoặc khám phá thêm các khóa học kỹ năng khác.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pl-0 sm:pl-13 border-t border-emerald-200/50 dark:border-emerald-800/50 pt-3">
          <Button
            type="button"
            size="sm"
            onClick={() => onNavigateCourse ? onNavigateCourse('/toeic') : (window.location.href = '/toeic')}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles size={14} />
            <span>Thực chiến tại Phòng thi thử TOEIC</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onNavigateCourse ? onNavigateCourse('/courses') : (window.location.href = '/courses')}
            className="rounded-xl border-emerald-500/40 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-500/10 font-bold text-xs px-3.5 py-2 cursor-pointer flex items-center gap-1.5"
          >
            <Compass size={14} />
            <span>Khám phá thêm các khóa học khác</span>
          </Button>

          {onBackToLessons && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onBackToLessons}
              className="rounded-xl text-text-secondary hover:text-text-primary text-xs px-3 py-2 cursor-pointer flex items-center gap-1.5"
            >
              <BookOpen size={14} />
              <span>Xem lại bài giảng</span>
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (!isPassed) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 space-y-3 animate-in fade-in duration-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
            <BookOpen size={16} />
          </div>
          <div className="space-y-1">
            <h5 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-100">
              Lời Khuyên Học Tập Dành Cho Bạn:
            </h5>
            <p className="text-xs leading-relaxed opacity-95">
              Bạn chưa đạt điểm chuẩn của bài kiểm tra này (Cần đạt tối thiểu <strong>{passingScore}%</strong>). Đừng nản lòng nhé! Bạn nên quay lại hoàn thành các video bài giảng và bài tập thực hành trong khóa học để nắm vững kiến thức trước khi làm lại bài test.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 pt-1 pl-11">
          {onBackToLessons && (
            <Button
              type="button"
              onClick={onBackToLessons}
              size="sm"
              className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <BookOpen size={14} />
              <span>Quay lại tiếp tục học bài giảng</span>
            </Button>
          )}
          <Button
            type="button"
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="rounded-xl border-amber-500/40 text-amber-800 dark:text-amber-200 hover:bg-amber-500/20 font-bold text-xs px-3.5 py-2 cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw size={13} />
            <span>Làm lại bài kiểm tra ngay</span>
          </Button>
        </div>
      </div>
    )
  }

  return null
}
