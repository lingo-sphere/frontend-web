// Header tiêu đề trang danh mục khóa học cùng bộ đếm số lượng khóa học.
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

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
          {activeTab === 'my-courses'
            ? isVi
              ? 'Khóa học của tôi'
              : 'My Courses'
            : isVi
            ? 'Khóa học yêu thích'
            : 'Liked Courses'}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-text-secondary">
          {activeTab === 'my-courses'
            ? isVi
              ? 'Tiếp tục hành trình học tập và hoàn thành các bài giảng của bạn.'
              : 'Continue your enrolled courses and finish lessons.'
            : isVi
            ? 'Danh sách các khóa học bạn đã lưu lại để học sau.'
            : 'Your saved wishlist courses for future learning.'}
        </p>
      </div>
      <div className="flex items-center gap-2 self-start sm:self-auto rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary">
        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
        {loading ? (
          <span className="inline-block h-3.5 w-14 rounded-full bg-primary/20 animate-pulse" />
        ) : !isAuthenticated && (activeTab === 'my-courses' || activeTab === 'wishlist') ? (
          <span>{isVi ? 'Yêu cầu đăng nhập' : 'Login required'}</span>
        ) : (
          <span>
            {count} {isVi ? 'Khóa học' : 'Courses'}
          </span>
        )}
      </div>
    </div>
  )
}


