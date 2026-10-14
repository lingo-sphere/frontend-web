// Header tiêu đề trang danh mục khóa học cùng bộ đếm số lượng khóa học.

import { cn } from '@/lib/utils'
import type { CourseTabType } from '@/features/courses/types/course'

interface CoursesCatalogTabsHeaderProps {
  activeTab: CourseTabType
  isVi: boolean
  count: number
  loading?: boolean
  isAuthenticated?: boolean
}

export function CoursesCatalogTabsHeader({
  activeTab,
  isVi,
  count,
  loading = false,
  isAuthenticated = false,
}: CoursesCatalogTabsHeaderProps) {
  if (activeTab === 'all') {
    return null
  }

  const isWishlist = activeTab === 'wishlist'

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary" suppressHydrationWarning>
          {activeTab === 'my-courses'
            ? isVi
              ? 'Khóa học của tôi'
              : 'My Courses'
            : isVi
            ? 'Khóa học yêu thích'
            : 'Liked Courses'}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-text-secondary" suppressHydrationWarning>
          {activeTab === 'my-courses'
            ? isVi
              ? 'Tiếp tục hành trình học tập và hoàn thành các bài giảng của bạn.'
              : 'Continue your enrolled courses and finish lessons.'
            : isVi
            ? 'Danh sách các khóa học bạn đã lưu lại để học sau.'
            : 'Your saved wishlist courses for future learning.'}
        </p>
      </div>
      <div
        className={cn(
          'flex items-center gap-2 self-start sm:self-auto rounded-full px-3 py-1.5 text-xs font-semibold',
          isWishlist
            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
            : 'bg-primary-soft text-primary'
        )}
      >
        <span
          className={cn(
            'flex h-2 w-2 rounded-full animate-pulse',
            isWishlist ? 'bg-rose-500' : 'bg-primary'
          )}
        />
        {loading ? (
          <span
            className={cn(
              'inline-block h-3.5 w-14 rounded-full animate-pulse',
              isWishlist ? 'bg-rose-500/20' : 'bg-primary/20'
            )}
          />
        ) : !isAuthenticated && (activeTab === 'my-courses' || activeTab === 'wishlist') ? (
          <span suppressHydrationWarning>{isVi ? 'Yêu cầu đăng nhập' : 'Login required'}</span>
        ) : (
          <span suppressHydrationWarning>
            {count} {isVi ? 'Khóa học' : 'Courses'}
          </span>
        )}
      </div>
    </div>
  )
}
