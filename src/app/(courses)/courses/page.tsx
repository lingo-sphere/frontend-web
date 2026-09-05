/**
 * @file page.tsx
 * @description Trang danh mục khóa học (Courses Catalog Page) hiển thị các khóa học, tìm kiếm, lịch học và phân loại
 */

'use client'

import { useNavigate } from '@/lib/navigation'
import { CourseSearchBar } from '@/components/course/course.search.bar'
import { CourseScheduleBanner } from '@/components/course/course.schedule.banner'
import { CourseScheduleModal } from '@/components/course/course.schedule.modal'
import { CoursePlacementBanner } from '@/components/course/course.placement.banner'
import { CourseCard } from '@/components/course/course.card'
import { buildCourseUrl } from '@/lib/course.url'
import { useCoursesCatalog } from '@/hooks/use.courses.catalog'
import { CoursesCatalogTabsHeader } from './courses.catalog.tabs.header'
import { CoursesEmptyState } from './courses.empty.state'

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

        <CourseSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

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
