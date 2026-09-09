/**
 * @file page.tsx
 * @description Trang không gian học tập trực tuyến (Course Workspace) cho học viên LingoSphere
 */

'use client'

import { useMemo } from 'react'
import { useParams, useNavigate } from '@/lib/navigation'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CourseWorkspaceHeader } from '@/components/course/course.workspace.header'
import { CourseRatingModal } from '@/components/course/course.rating.modal'
import { CourseLoadingState } from '@/components/course/course.loading.state'
import { LessonPlayer } from '@/components/course/lesson.player'
import { CourseLockedPlayer } from '@/components/course/course.locked.player'
import { CourseCheckoutModal } from '@/components/course/course.checkout.modal'
import { CoursePlacementPromptModal } from '@/components/course/course.placement.prompt.modal'
import { UpgradeModal } from '@/components/upgrade/upgrade.modal'
import { useEnrollmentStore } from '@/store/enrollment.store'
import { toast } from '@/store/toast.store'
import { extractCourseId, buildCourseUrl } from '@/lib/course.url'
import { CourseWorkspaceTabs } from '@/components/course/workspace/course.workspace.tabs'
import { CourseWorkspaceSidebar } from '@/components/course/workspace/course.workspace.sidebar'
import { useCourseWorkspace } from '@/hooks/use.course.workspace'

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>()
  const rawParam = params?.courseId || ''
  const courseId = useMemo(() => extractCourseId(rawParam), [rawParam])
  const navigate = useNavigate()

  const {
    course,
    currentLesson,
    isLoading,
    isEnrolled,
    setIsEnrolled,
    expandedChapters,
    activeBottomTab,
    setActiveBottomTab,
    activeSidebarTab,
    setActiveSidebarTab,
    isSidebarOpen,
    setIsSidebarOpen,
    playerCurrentTime,
    setPlayerCurrentTime,
    showRatingModal,
    setShowRatingModal,
    showUpgradeModal,
    setShowUpgradeModal,
    showCourseCheckoutModal,
    setShowCourseCheckoutModal,
    showPlacementPromptModal,
    setShowPlacementPromptModal,
    isAddingToCart,
    progressDetail,
    lockedChapterIdSet,
    hasNextLesson,
    hasPrevLesson,
    toggleChapter,
    handleSelectLesson,
    handleToggleLessonComplete,
    handleLessonProgress,
    handleNextLesson,
    handlePrevLesson,
    handleLessonDurationChange,
    handleAddNoteAtTimestamp,
    handleDeleteNote,
    handleCreateQnA,
    handleAddQnAAnswer,
    handleUpvoteQnA,
    handleAddReview,
    handleAddToCart,
    handleTakeTest,
    user,
    isAuthenticated,
    isInCart,
  } = useCourseWorkspace(courseId)

  const handleBack = () => {
    if (course) {
      navigate(buildCourseUrl(course))
    } else {
      navigate('/courses')
    }
  }

  const handleInitiateEnrollOrBuy = () => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('lingosphere:open-auth-modal'))
      return
    }

    const hasPlacementScore = Boolean(
      user?.placement_test_score ||
      user?.current_estimated_score ||
      user?.placement_tested_at
    )

    if (!hasPlacementScore) {
      try {
        const stored = localStorage.getItem('lingo_user_placement_score')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed?.placement_test_score > 0) {
            setShowCourseCheckoutModal(true)
            return
          }
        }
      } catch {}
      setShowPlacementPromptModal(true)
    } else {
      setShowCourseCheckoutModal(true)
    }
  }

  if (isLoading) {
    return <CourseLoadingState onBack={handleBack} />
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-surface-secondary text-text-primary flex flex-col items-center justify-center p-6 antialiased">
        <div className="w-full max-w-md p-8 bg-surface rounded-3xl border border-border shadow-xl text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl font-bold text-text-primary">Không tìm thấy khóa học</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Khóa học bạn yêu cầu không tồn tại hoặc đã ngừng xuất bản trên hệ thống.
          </p>
          <div className="pt-2">
            <Button
              onClick={handleBack}
              className="w-full bg-primary text-white font-bold rounded-xl gap-2 cursor-pointer shadow-md"
            >
              <ArrowLeft size={16} />
              <span>Quay lại danh sách khóa học</span>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentLesson) {
    return <CourseLoadingState onBack={handleBack} />
  }

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col antialiased">
      <CourseWorkspaceHeader
        courseTitle={course.title}
        onBack={handleBack}
        onOpenRating={() => setShowRatingModal(true)}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      <div className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden relative">
        <div className="flex-1 flex flex-col overflow-y-auto scroll-smooth max-h-[calc(100vh-3.5rem)] transition-all duration-300">
          {isEnrolled || Boolean(currentLesson?.is_free_preview || currentLesson?.is_preview) ? (
            <div className="flex flex-col">
              {!isEnrolled && Boolean(currentLesson?.is_free_preview || currentLesson?.is_preview) && (
                <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white px-4 py-2 text-xs font-bold flex flex-wrap items-center justify-between gap-2 shadow-md">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">✨</span>
                    <span>Bạn đang học thử miễn phí: <strong>{currentLesson?.title}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={handleInitiateEnrollOrBuy}
                    className="px-3 py-1 rounded-lg bg-white text-emerald-800 hover:bg-emerald-50 text-[11px] font-extrabold shadow-xs transition-all cursor-pointer"
                  >
                    Đăng ký mua khóa học để mở khóa toàn bộ bài học & đề thi
                  </button>
                </div>
              )}
              <LessonPlayer
                lesson={currentLesson}
                isTrial={!isEnrolled}
                onOpenCheckout={handleInitiateEnrollOrBuy}
                onProgress={handleLessonProgress}
                onTimeUpdate={(t) => setPlayerCurrentTime(t)}
                onNextLesson={handleNextLesson}
                onPrevLesson={handlePrevLesson}
                hasNextLesson={hasNextLesson}
                hasPrevLesson={hasPrevLesson}
                onAddNoteAtTimestamp={handleAddNoteAtTimestamp}
                onDurationChange={handleLessonDurationChange}
              />
            </div>
          ) : (
            <CourseLockedPlayer
              course={course}
              currentLesson={currentLesson}
              isAuthenticated={isAuthenticated}
              isAlreadyInCart={isInCart(course.id)}
              isAddingToCart={isAddingToCart}
              onBuyNow={handleInitiateEnrollOrBuy}
              onAddToCart={handleAddToCart}
              onGoToCart={() => navigate('/cart')}
              onOpenUpgrade={() => setShowUpgradeModal(true)}
              onOpenAuth={() => window.dispatchEvent(new CustomEvent('lingosphere:open-auth-modal'))}
            />
          )}

          <CourseWorkspaceTabs
            course={course}
            currentLesson={currentLesson}
            activeTab={activeBottomTab}
            isEnrolled={isEnrolled}
            isAuthenticated={isAuthenticated}
            currentUserId={user?.user_id}
            currentUserRole={user?.role}
            playerCurrentTime={playerCurrentTime}
            progressDetail={progressDetail}
            onTabChange={setActiveBottomTab}
            onInitiateEnrollOrBuy={handleInitiateEnrollOrBuy}
            onCreateQnA={handleCreateQnA}
            onAddQnAAnswer={handleAddQnAAnswer}
            onUpvoteQnA={handleUpvoteQnA}
            onAddNote={handleAddNoteAtTimestamp}
            onDeleteNote={handleDeleteNote}
            onAddReview={handleAddReview}
          />
        </div>

        <CourseWorkspaceSidebar
          isOpen={isSidebarOpen}
          course={course}
          currentLesson={currentLesson}
          activeTab={activeSidebarTab}
          expandedChapters={expandedChapters}
          isEnrolled={isEnrolled}
          lockedChapterIds={lockedChapterIdSet}
          progressDetail={progressDetail}
          onTabChange={setActiveSidebarTab}
          onCloseSidebar={() => setIsSidebarOpen(false)}
          onToggleChapter={toggleChapter}
          onSelectLesson={handleSelectLesson}
          onToggleLessonComplete={handleToggleLessonComplete}
          onTakeTest={handleTakeTest}
        />
      </div>

      {showRatingModal && (
        <CourseRatingModal
          courseTitle={course.title}
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleAddReview}
        />
      )}

      {showUpgradeModal && (
        <UpgradeModal
          open={showUpgradeModal}
          onOpenChange={setShowUpgradeModal}
        />
      )}

      {showCourseCheckoutModal && course && (
        <CourseCheckoutModal
          open={showCourseCheckoutModal}
          onOpenChange={setShowCourseCheckoutModal}
          courses={[
            {
              id: course.id,
              title: course.title,
              price: course.price || 0,
              thumbnail: course.thumbnail,
            },
          ]}
          onSuccess={() => {
            setIsEnrolled(true)
            useEnrollmentStore.getState().addEnrolledCourse(course.id)
            toast.success('Mở khóa khóa học thành công! Chúc bạn học tốt!', 'Đã mở khóa')
          }}
        />
      )}

      {showPlacementPromptModal && (
        <CoursePlacementPromptModal
          open={showPlacementPromptModal}
          onOpenChange={setShowPlacementPromptModal}
          onProceedPurchase={() => setShowCourseCheckoutModal(true)}
          courseTitle={course?.title}
        />
      )}
    </div>
  )
}
