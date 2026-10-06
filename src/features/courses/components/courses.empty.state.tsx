// Component hiển thị trạng thái trống cho danh mục khóa học.

import { BookOpen, GraduationCap, LogIn, Sparkles, Heart, Zap, Target, ArrowRight, BookmarkCheck, Bell, ShieldCheck } from 'lucide-react'
import type { CourseTabType, CourseCardData } from '@/features/courses/types/course'
import { CourseCard } from '@/features/courses/components/course.card'

interface CoursesEmptyStateProps {
  activeTab: CourseTabType
  isAuthenticated: boolean
  isVi: boolean
  onNavigateCourses: () => void
  featuredCourses?: CourseCardData[]
  isInWishlist?: (courseId: string) => boolean
  activeMenuId?: string | null
  onToggleMenu?: (courseId: string, e: React.MouseEvent) => void
  onToggleWishlist?: (courseId: string, e: React.MouseEvent) => void
  onCourseClick?: (course: CourseCardData) => void
  onCloseMenu?: () => void
}

export function CoursesEmptyState({
  activeTab,
  isAuthenticated,
  isVi,
  onNavigateCourses,
  featuredCourses = [],
  isInWishlist,
  activeMenuId,
  onToggleMenu,
  onToggleWishlist,
  onCourseClick,
  onCloseMenu,
}: CoursesEmptyStateProps) {
  if (activeTab === 'my-courses' && !isAuthenticated) {
    return (
      <div className="w-full space-y-8">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface via-surface to-surface-subtle/60 p-6 sm:p-8 lg:p-10 shadow-xl shadow-primary/5 transition-all w-full">
          <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                <GraduationCap className="w-4 h-4" />
                <span>{isVi ? 'Khóa học của tôi' : 'My Courses'}</span>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-text-primary">
                {isVi ? 'Đăng nhập để xem khóa học của bạn' : 'Log in to view your courses'}
              </h2>

              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-xl">
                {isVi
                  ? 'Đăng nhập để truy cập toàn bộ bài giảng đã mua, theo dõi tiến độ luyện thi TOEIC chuẩn ETS và tiếp tục bài học dang dở trên mọi thiết bị.'
                  : 'Log in to access your enrolled courses, track ETS-standard TOEIC test preparation, and resume your learning seamlessly across all devices.'}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('lingosphere:open-auth-modal'))
                  }}
                  className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
                  type="button"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isVi ? 'Đăng nhập ngay' : 'Log in now'}</span>
                </button>
                <button
                  onClick={onNavigateCourses}
                  className="px-5 py-3 rounded-xl border border-border bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary text-xs sm:text-sm font-semibold transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                  type="button"
                >
                  <span>{isVi ? 'Khám phá tất cả khóa học' : 'Explore all courses'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-1 flex items-center gap-4 text-[11px] text-text-tertiary">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  {isVi ? 'Bảo mật SSL 256-bit' : '256-bit SSL encryption'}
                </span>
                <span>•</span>
                <span>{isVi ? 'Đồng bộ tiến độ tức thì' : 'Real-time sync'}</span>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-subtle/80 border border-border/70 hover:border-primary/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-primary">{isVi ? 'Đồng bộ tiến độ' : 'Sync Progress'}</p>
                  <p className="text-xs text-text-tertiary">{isVi ? 'Lưu bài học và học tiếp mọi lúc mọi nơi' : 'Resume anytime anywhere'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-subtle/80 border border-border/70 hover:border-primary/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-primary">{isVi ? 'Mục tiêu TOEIC' : 'TOEIC Goal'}</p>
                  <p className="text-xs text-text-tertiary">{isVi ? 'Lộ trình tối ưu hóa theo chuẩn khảo thí ETS' : 'ETS standardized roadmap'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-subtle/80 border border-border/70 hover:border-primary/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-primary">{isVi ? 'Trợ lý AI đồng hành' : 'AI Companion'}</p>
                  <p className="text-xs text-text-tertiary">{isVi ? 'Luyện Nói phát âm & chấm chữa bài Viết' : 'Speaking & Writing analysis'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {featuredCourses.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-base sm:text-lg font-bold text-text-primary">
                  {isVi ? 'Khóa học đề xuất cho bạn' : 'Recommended Courses for You'}
                </h3>
              </div>
              <button
                onClick={onNavigateCourses}
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{isVi ? 'Xem tất cả' : 'View all'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
              {featuredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isFavorite={isInWishlist?.(course.id) ?? false}
                  isMenuOpen={activeMenuId === course.id}
                  onToggleMenu={onToggleMenu ?? (() => {})}
                  onToggleWishlist={onToggleWishlist ?? (() => {})}
                  onClick={() => onCourseClick?.(course)}
                  onCloseMenu={onCloseMenu ?? (() => {})}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (activeTab === 'wishlist' && !isAuthenticated) {
    return (
      <div className="w-full space-y-8">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface via-surface to-surface-subtle/60 p-6 sm:p-8 lg:p-10 shadow-xl shadow-rose-500/5 transition-all w-full">
          <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span>{isVi ? 'Khóa học yêu thích' : 'Favorite Courses'}</span>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-text-primary">
                {isVi ? 'Đăng nhập để xem khóa học yêu thích' : 'Log in to view your wishlist'}
              </h2>

              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-xl">
                {isVi
                  ? 'Lưu lại các khóa học bạn quan tâm để dễ dàng so sánh lộ trình, theo dõi các đợt ưu đãi học phí và bắt đầu học ngay khi sẵn sàng.'
                  : 'Save your favorite courses to compare roadmaps, track tuition discounts, and start learning whenever you are ready.'}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('lingosphere:open-auth-modal'))
                  }}
                  className="px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-md shadow-rose-500/25 hover:shadow-lg hover:shadow-rose-500/35 hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
                  type="button"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isVi ? 'Đăng nhập ngay' : 'Log in now'}</span>
                </button>
                <button
                  onClick={onNavigateCourses}
                  className="px-5 py-3 rounded-xl border border-border bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary text-xs sm:text-sm font-semibold transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                  type="button"
                >
                  <span>{isVi ? 'Khám phá tất cả khóa học' : 'Explore all courses'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-1 flex items-center gap-4 text-[11px] text-text-tertiary">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                  {isVi ? 'Lưu trữ không giới hạn' : 'Unlimited storage'}
                </span>
                <span>•</span>
                <span>{isVi ? 'Đồng bộ tài khoản tức thì' : 'Instant account sync'}</span>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-subtle/80 border border-border/70 hover:border-rose-500/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
                  <BookmarkCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-primary">{isVi ? 'Lưu khóa học quan tâm' : 'Save Courses'}</p>
                  <p className="text-xs text-text-tertiary">{isVi ? 'Dễ dàng so sánh nội dung và học phí' : 'Compare curriculum and tuition easily'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-subtle/80 border border-border/70 hover:border-rose-500/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-primary">{isVi ? 'Nhận thông báo ưu đãi' : 'Get Discount Alerts'}</p>
                  <p className="text-xs text-text-tertiary">{isVi ? 'Cập nhật voucher giảm giá độc quyền' : 'Exclusive tuition promotion alerts'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-subtle/80 border border-border/70 hover:border-rose-500/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-primary">{isVi ? 'Đồng bộ đa thiết bị' : 'Cross-Device Sync'}</p>
                  <p className="text-xs text-text-tertiary">{isVi ? 'Xem lại danh sách trên Web và Mobile' : 'Available across Web and Mobile'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {featuredCourses.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-500" />
                <h3 className="text-base sm:text-lg font-bold text-text-primary">
                  {isVi ? 'Khóa học đề xuất cho bạn' : 'Recommended Courses for You'}
                </h3>
              </div>
              <button
                onClick={onNavigateCourses}
                className="text-xs font-semibold text-rose-500 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{isVi ? 'Xem tất cả' : 'View all'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
              {featuredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isFavorite={isInWishlist?.(course.id) ?? false}
                  isMenuOpen={activeMenuId === course.id}
                  onToggleMenu={onToggleMenu ?? (() => {})}
                  onToggleWishlist={onToggleWishlist ?? (() => {})}
                  onClick={() => onCourseClick?.(course)}
                  onCloseMenu={onCloseMenu ?? (() => {})}
                />
              ))}
            </div>
          </div>
        )}
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

