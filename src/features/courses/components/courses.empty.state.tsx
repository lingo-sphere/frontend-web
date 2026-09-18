// Component hiển thị trạng thái trống cho danh mục khóa học.

import { BookOpen, GraduationCap, LogIn, Sparkles, Heart, Zap, Target, ArrowRight, BookmarkCheck, Bell } from 'lucide-react'
import type { CourseTabType } from '@/features/courses/types/course'

interface CoursesEmptyStateProps {
  activeTab: CourseTabType
  isAuthenticated: boolean
  isVi: boolean
  onNavigateCourses: () => void
}

export function CoursesEmptyState({
  activeTab,
  isAuthenticated,
  isVi,
  onNavigateCourses,
}: CoursesEmptyStateProps) {
  if (activeTab === 'my-courses' && !isAuthenticated) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-surface via-surface to-surface-subtle/50 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xl shadow-primary/5 transition-all">
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-primary via-primary-hover to-teal-400 text-white shadow-lg shadow-primary/30 ring-8 ring-primary/10">
          <GraduationCap className="h-10 w-10" />
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-text-primary">
          {isVi ? 'Đăng nhập để xem khóa học của bạn' : 'Log in to view your courses'}
        </h2>

        <p className="mt-2 text-xs sm:text-sm text-text-secondary max-w-lg mx-auto leading-relaxed">
          {isVi
            ? 'Đăng nhập để truy cập toàn bộ bài giảng đã mua, theo dõi tiến độ luyện thi TOEIC chuẩn ETS và tiếp tục bài học dang dở.'
            : 'Log in to access your enrolled courses, track ETS-standard TOEIC test preparation, and resume your learning seamlessly.'}
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-surface-subtle/80 border border-border/60">
            <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-text-primary truncate">{isVi ? 'Đồng bộ tiến độ' : 'Sync Progress'}</p>
              <p className="text-[11px] text-text-tertiary truncate">{isVi ? 'Học tiếp mọi lúc' : 'Resume anytime'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-surface-subtle/80 border border-border/60">
            <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-text-primary truncate">{isVi ? 'Mục tiêu TOEIC' : 'TOEIC Goal'}</p>
              <p className="text-[11px] text-text-tertiary truncate">{isVi ? 'Lộ trình chuẩn ETS' : 'ETS roadmap'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-surface-subtle/80 border border-border/60">
            <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-text-primary truncate">{isVi ? 'Trợ lý AI' : 'AI Assistant'}</p>
              <p className="text-[11px] text-text-tertiary truncate">{isVi ? 'Luyện Nói & Viết' : 'Speaking & Writing'}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('lingosphere:open-auth-modal'))
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
            type="button"
          >
            <LogIn className="w-4 h-4" />
            <span>{isVi ? 'Đăng nhập ngay' : 'Log in now'}</span>
          </button>
          <button
            onClick={onNavigateCourses}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-border bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary text-xs sm:text-sm font-semibold transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            type="button"
          >
            <span>{isVi ? 'Khám phá tất cả khóa học' : 'Explore all courses'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  if (activeTab === 'wishlist' && !isAuthenticated) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-surface via-surface to-surface-subtle/50 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xl shadow-rose-500/5 transition-all">
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-rose-500 via-rose-600 to-pink-500 text-white shadow-lg shadow-rose-500/30 ring-8 ring-rose-500/10">
          <Heart className="h-10 w-10 fill-white" />
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-text-primary">
          {isVi ? 'Đăng nhập để xem khóa học yêu thích' : 'Log in to view your wishlist'}
        </h2>

        <p className="mt-2 text-xs sm:text-sm text-text-secondary max-w-lg mx-auto leading-relaxed">
          {isVi
            ? 'Lưu lại các khóa học bạn quan tâm để dễ dàng so sánh, theo dõi ưu đãi và bắt đầu học ngay khi sẵn sàng.'
            : 'Save the courses you love to easily compare, track promotions, and start learning whenever you are ready.'}
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-surface-subtle/80 border border-border/60">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
              <BookmarkCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-text-primary truncate">{isVi ? 'Lưu khóa học' : 'Save Courses'}</p>
              <p className="text-[11px] text-text-tertiary truncate">{isVi ? 'Không giới hạn' : 'Unlimited'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-surface-subtle/80 border border-border/60">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-text-primary truncate">{isVi ? 'Nhận thông báo' : 'Notifications'}</p>
              <p className="text-[11px] text-text-tertiary truncate">{isVi ? 'Ưu đãi học tập' : 'Best promotions'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-surface-subtle/80 border border-border/60">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-text-primary truncate">{isVi ? 'Đồng bộ tài khoản' : 'Account Sync'}</p>
              <p className="text-[11px] text-text-tertiary truncate">{isVi ? 'Mọi thiết bị' : 'All devices'}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('lingosphere:open-auth-modal'))
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
            type="button"
          >
            <LogIn className="w-4 h-4" />
            <span>{isVi ? 'Đăng nhập ngay' : 'Log in now'}</span>
          </button>
          <button
            onClick={onNavigateCourses}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-border bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary text-xs sm:text-sm font-semibold transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            type="button"
          >
            <span>{isVi ? 'Khám phá tất cả khóa học' : 'Explore all courses'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  if (activeTab === 'my-courses' && isAuthenticated) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-surface to-surface-subtle/50 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
          <BookOpen size={32} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-text-primary">
            {isVi ? 'Bạn chưa sở hữu khóa học nào' : 'No enrolled courses yet'}
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-text-secondary max-w-md mx-auto">
            {isVi
              ? 'Hãy khám phá các khóa học TOEIC & Tiếng Anh để bắt đầu lộ trình học tập của bạn.'
              : 'Explore TOEIC & English courses to start your learning journey.'}
          </p>
        </div>
        <button
          onClick={onNavigateCourses}
          className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm shadow-primary/20 inline-flex items-center gap-2"
          type="button"
        >
          <Sparkles size={16} />
          <span>{isVi ? 'Khám phá tất cả khóa học' : 'Explore All Courses'}</span>
        </button>
      </div>
    )
  }

  return (
    <div className="py-20 text-center rounded-3xl border border-dashed border-border bg-surface/50 space-y-3 max-w-md mx-auto">
      <BookOpen className="mx-auto text-text-tertiary" size={40} />
      <h3 className="text-base font-bold text-text-primary">
        {isVi ? 'Không tìm thấy khóa học phù hợp' : 'No courses found'}
      </h3>
      <p className="text-xs text-text-secondary">
        {isVi
          ? 'Thử thay đổi từ khóa tìm kiếm hoặc chuyển sang bộ lọc khác.'
          : 'Try changing your search keywords or filters.'}
      </p>
    </div>
  )
}

