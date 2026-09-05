/**
 * @file courses.empty.state.tsx
 * @description Giao diện hiển thị trạng thái trống cho từng tab danh mục khóa học (chưa đăng nhập, chưa sở hữu, không có kết quả)
 */

import { BookOpen, GraduationCap, LogIn, Sparkles, Heart } from 'lucide-react'
import type { CourseTabType } from '@/types/course'

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
      <div className="py-16 px-6 text-center rounded-2xl border border-dashed border-border bg-surface/50 max-w-md mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <GraduationCap size={28} />
        </div>
        <div>
          <h3 className="text-base font-bold text-text-primary">
            {isVi ? 'Bạn chưa đăng nhập' : 'You are not logged in'}
          </h3>
          <p className="mt-1 text-xs text-text-secondary">
            {isVi
              ? 'Vui lòng đăng nhập tài khoản để xem các khóa học bạn đã mua và tiếp tục lộ trình học.'
              : 'Please log in to see your enrolled courses and continue learning.'}
          </p>
        </div>
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('lingosphere:open-auth-modal'))
          }}
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors cursor-pointer shadow-sm shadow-primary/20 inline-flex items-center gap-2"
        >
          <LogIn size={15} />
          <span>{isVi ? 'Đăng nhập ngay' : 'Log in now'}</span>
        </button>
      </div>
    )
  }

  if (activeTab === 'my-courses' && isAuthenticated) {
    return (
      <div className="py-16 px-6 text-center rounded-2xl border border-dashed border-border bg-surface/50 max-w-md mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <BookOpen size={28} />
        </div>
        <div>
          <h3 className="text-base font-bold text-text-primary">
            {isVi ? 'Bạn chưa sở hữu khóa học nào' : 'No enrolled courses yet'}
          </h3>
          <p className="mt-1 text-xs text-text-secondary">
            {isVi
              ? 'Hãy khám phá các khóa học TOEIC & Tiếng Anh để bắt đầu lộ trình học tập của bạn.'
              : 'Explore TOEIC & English courses to start your learning journey.'}
          </p>
        </div>
        <button
          onClick={onNavigateCourses}
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors cursor-pointer shadow-sm shadow-primary/20 inline-flex items-center gap-2"
        >
          <Sparkles size={15} />
          <span>{isVi ? 'Khám phá tất cả khóa học' : 'Explore All Courses'}</span>
        </button>
      </div>
    )
  }

  if (activeTab === 'wishlist' && !isAuthenticated) {
    return (
      <div className="py-16 px-6 text-center rounded-2xl border border-dashed border-border bg-surface/50 max-w-md mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <Heart size={28} />
        </div>
        <div>
          <h3 className="text-base font-bold text-text-primary">
            {isVi ? 'Danh sách yêu thích' : 'Wishlist'}
          </h3>
          <p className="mt-1 text-xs text-text-secondary">
            {isVi
              ? 'Vui lòng đăng nhập để xem danh sách các khóa học bạn đã yêu thích.'
              : 'Please log in to view your wishlisted courses.'}
          </p>
        </div>
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('lingosphere:open-auth-modal'))
          }}
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors cursor-pointer shadow-sm shadow-primary/20 inline-flex items-center gap-2"
        >
          <LogIn size={15} />
          <span>{isVi ? 'Đăng nhập ngay' : 'Log in now'}</span>
        </button>
      </div>
    )
  }

  return (
    <div className="py-20 text-center rounded-2xl border border-dashed border-border bg-surface/50 space-y-3">
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
