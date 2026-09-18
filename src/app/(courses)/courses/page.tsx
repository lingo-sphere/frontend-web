// Trang danh mục khóa học hiển thị tìm kiếm, lịch học và phân loại
'use client'

import dynamic from 'next/dynamic'
import { useNavigate } from '@/lib/navigation'
import { CourseSearchBar } from '@/features/courses/components/course.search.bar'
import { CourseScheduleBanner } from '@/features/courses/components/course.schedule.banner'
import { CourseScheduleModal } from '@/features/courses/components/course.schedule.modal'
import { CoursePlacementBannerSkeleton } from '@/features/courses/components/course.placement.banner'
import { CourseCard } from '@/features/courses/components/course.card'
import { buildCourseUrl } from '@/features/courses/lib/course.url'
import { useCoursesCatalog } from '@/features/courses/hooks/use.courses.catalog'
import { CoursesCatalogTabsHeader } from '@/features/courses/components/courses.catalog.tabs.header'
import { CoursesEmptyState } from '@/features/courses/components/courses.empty.state'

const CoursePlacementBanner = dynamic(
  () =>
    import('@/features/courses/components/course.placement.banner').then(
      (mod) => mod.CoursePlacementBanner
    ),
  {
    ssr: false,
    loading: () => <CoursePlacementBannerSkeleton />,
  }
)

export default function CoursesCatalogPage() {
  const navigate = useNavigate()

  const {
    isVi,
    activeTab,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    activeMenuId,
    setActiveMenuId,
    showScheduleBanner,
    showScheduleModal,
    setShowScheduleModal,
    userSchedule,
    setUserSchedule,
    handleDismissScheduleBanner,
    handleOpenScheduleModal,
    handleCancelScheduleFromBanner,
    filteredCourses,
    toggleWishlist,
    toggleMenu,
    isAuthenticated,
    isInWishlist,
  } = useCoursesCatalog()

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <main className="w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <CoursesCatalogTabsHeader
          activeTab={activeTab}
          isVi={isVi}
          count={filteredCourses.length}
          loading={loading}
          isAuthenticated={isAuthenticated}
        />

        {activeTab === 'all' && <CoursePlacementBanner />}

        {activeTab === 'all' && showScheduleBanner && (
          <CourseScheduleBanner
            schedule={userSchedule}
            onOpenModal={handleOpenScheduleModal}
            onDismiss={handleDismissScheduleBanner}
            onCancelSchedule={
              userSchedule?.is_reminder_enabled
                ? handleCancelScheduleFromBanner
                : undefined
            }
          />
        )}

        {!( !isAuthenticated && (activeTab === 'my-courses' || activeTab === 'wishlist') ) && (
          <CourseSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-2xl border border-border bg-surface/50 animate-pulse"
              />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <CoursesEmptyState
            activeTab={activeTab}
            isAuthenticated={isAuthenticated}
            isVi={isVi}
            onNavigateCourses={() => navigate('/courses')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isFavorite={isInWishlist(course.id)}
                isMenuOpen={activeMenuId === course.id}
                onToggleMenu={toggleMenu}
                onToggleWishlist={toggleWishlist}
                onClick={() => navigate(buildCourseUrl(course))}
                onCloseMenu={() => setActiveMenuId(null)}
              />
            ))}
          </div>
        )}
      </main>

      {showScheduleModal && (
        <CourseScheduleModal
          initialSchedule={userSchedule}
          onClose={() => setShowScheduleModal(false)}
          onSaved={(newSchedule) => {
            setUserSchedule((prev) => ({
              ...prev,
              ...newSchedule,
              is_reminder_enabled: true,
            }))
          }}
          onCancelled={() => {
            setUserSchedule((prev) =>
              prev ? { ...prev, is_reminder_enabled: false } : null
            )
          }}
        />
      )}
    </div>
  )
}
