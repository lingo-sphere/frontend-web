// Component giao diện không gian học tập trực tuyến Client cho học viên LingoSphere
'use client'

import { useState } from 'react'
import { useNavigate } from '@/lib/navigation'
import { AlertCircle, ArrowLeft, ExternalLink, FileText, FolderDown, HelpCircle } from 'lucide-react'
import { Button } from '@/components/button'
import { AppResult } from '@/components/status/app.result'
import { CourseWorkspaceHeader } from '@/features/courses/components/course.workspace.header'
import { CourseRatingModal } from '@/features/courses/components/course.rating.modal'
import { CourseLoadingState } from '@/features/courses/components/course.loading.state'
import { LessonPlayer } from '@/features/courses/components/lesson.player'
import { CourseLockedPlayer } from '@/features/courses/components/course.locked.player'
import { CourseCheckoutModal } from '@/features/courses/components/course.checkout.modal'
import { CoursePlacementPromptModal } from '@/features/courses/components/course.placement.prompt.modal'
import { UpgradeModal } from '@/features/upgrade/components/upgrade.modal'
import { getQueryClient } from '@/config/query.config'
import { courseKeys } from '@/features/courses/keys/course.keys'
import { toast } from '@/store/toast.store'
import { CourseWorkspaceTabs } from '@/features/courses/components/course.workspace.tabs'
import { CourseWorkspaceSidebar } from '@/features/courses/components/course.workspace.sidebar'
import { CourseScheduleBanner } from '@/features/courses/components/course.schedule.banner'
import { CourseScheduleModal } from '@/features/courses/components/course.schedule.modal'
import { CourseLandingView } from '@/features/courses/components/course.landing.view'
import { CourseLandingLoadingState } from '@/features/courses/components/course.landing.loading.state'
import { courseService } from '@/features/courses/services/course.service'
import { useCourseWorkspace } from '@/features/courses/hooks/use.course.workspace'
import { getCourseEffectivePrice } from '@/features/courses/helpers/course.workspace.adapter'

export interface CourseDetailClientProps {
  rawParam: string
  courseId: string
  initialIsEnrolled: boolean
}

export function CourseDetailClient({
  courseId,
  initialIsEnrolled,
}: CourseDetailClientProps) {
  const navigate = useNavigate()

  const {
    course,
    currentLesson,
    isLoading,
    isError,
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
    courseSchedule,
    setCourseSchedule,
    courseLockState,
    refreshCourseProgress,
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
  } = useCourseWorkspace(courseId, initialIsEnrolled)

  const [showScheduleBanner, setShowScheduleBanner] = useState(true)
  const [showScheduleModal, setShowScheduleModal] = useState(false)

  const handleBack = () => {
    if (
      typeof window !== 'undefined' &&
      window.history.state &&
      typeof window.history.state.idx === 'number' &&
      window.history.state.idx > 0
    ) {
      navigate(-1)
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
      (user?.placement_test_score && Number(user.placement_test_score) > 0) ||
      (user?.current_estimated_score && Number(user.current_estimated_score) > 0) ||
      (user?.target_toeic_score && Number(user.target_toeic_score) > 0) ||
      user?.placement_tested_at
    )

    if (!hasPlacementScore) {
      setShowPlacementPromptModal(true)
    } else {
      setShowCourseCheckoutModal(true)
    }
  }

  if (isLoading) {
    if (isEnrolled) {
      return <CourseLoadingState onBack={handleBack} />
    }
    return <CourseLandingLoadingState onBack={handleBack} />
  }

  if (isError || !course) {
    return (
      <div className="min-h-screen bg-surface-secondary text-text-primary flex flex-col items-center justify-center p-4 antialiased">
        <AppResult
          status="404"
          title="404"
          subTitle="Khóa học bạn yêu cầu không tồn tại hoặc đã ngừng xuất bản trên hệ thống."
          onBack={handleBack}
          backText="Quay lại danh sách khóa học"
        />
      </div>
    )
  }

  if (!isEnrolled) {
    return (
      <>
        <CourseLandingView
          course={course}
          onEnrollOrBuy={handleInitiateEnrollOrBuy}
          onAddToCart={handleAddToCart}
          isInCart={isInCart(course.id)}
          isAddingToCart={isAddingToCart}
          isAuthenticated={isAuthenticated}
          userName={user?.full_name ?? undefined}
          userAvatar={user?.avatar_url ?? undefined}
        />

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
                price: getCourseEffectivePrice(course),
                thumbnail: course.thumbnail,
              },
            ]}
            onSuccess={() => {
              setIsEnrolled(true)
              getQueryClient().invalidateQueries({ queryKey: courseKeys.enrollments() })
              toast.success('Mở khóa khóa học thành công! Chúc bạn học tốt!', 'Đã mở khóa')
              setShowScheduleModal(true)
            }}
          />
        )}

        {showPlacementPromptModal && (
          <CoursePlacementPromptModal
            open={showPlacementPromptModal}
            onOpenChange={setShowPlacementPromptModal}
            onProceedPurchase={() => setShowCourseCheckoutModal(true)}
            courseTitle={course?.title}
            courseCategory={course?.category}
            courseSkills={course?.skills}
            courseTargetScore={course?.target_score}
          />
        )}
      </>
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
                courseId={course.id}
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
              <div className="bg-surface border-b border-border/80 px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-bold text-text-secondary truncate">
                    Bài {currentLesson.order || 1}: <strong className="text-text-primary">{currentLesson.title}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {currentLesson.theory_file_url && (
                    <a
                      href={currentLesson.theory_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-500/30 transition-all cursor-pointer shadow-2xs"
                      title={currentLesson.theory_file_name || 'Xem file đề lý thuyết của bài học'}
                    >
                      <FileText size={13} className="text-blue-600 dark:text-blue-400" />
                      <span>Đề lý thuyết (PDF)</span>
                      <ExternalLink size={11} className="opacity-70" />
                    </a>
                  )}

                  {Array.isArray(currentLesson.questions) && currentLesson.questions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveBottomTab('quiz')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs border ${
                        activeBottomTab === 'quiz'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      <HelpCircle
                        size={13}
                        className={
                          activeBottomTab === 'quiz'
                            ? 'text-white'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }
                      />
                      <span>Đề luyện tập ({currentLesson.questions.length} câu)</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setActiveSidebarTab('documents')
                      setIsSidebarOpen(true)
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-subtle hover:bg-surface-hover text-text-secondary hover:text-text-primary text-xs font-bold border border-border transition-all cursor-pointer shadow-2xs"
                  >
                    <FolderDown size={13} className="text-primary" />
                    <span>Tài liệu khóa học</span>
                  </button>
                </div>
              </div>
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

          {isEnrolled && (showScheduleBanner || courseLockState?.is_locked) && (
            <div className="px-4 sm:px-6 lg:px-8 pt-4 w-full max-w-7xl">
              <CourseScheduleBanner
                schedule={courseSchedule}
                lockState={courseLockState}
                onOpenModal={() => setShowScheduleModal(true)}
                onDismiss={() => setShowScheduleBanner(false)}
                onCancelSchedule={
                  courseSchedule?.is_reminder_enabled
                    ? async () => {
                        try {
                          await courseService.updateCourseSchedule(course.id, { is_reminder_enabled: false })
                          setCourseSchedule((prev) => (prev ? { ...prev, is_reminder_enabled: false } : null))
                          toast.info('Đã hủy lịch nhắc nhở học tập của khóa học này.', 'Đã hủy lịch')
                        } catch {
                          toast.error('Không thể hủy lịch nhắc học.', 'Lỗi')
                        }
                      }
                    : undefined
                }
                onRetest={() => {
                  const retestOrder =
                    courseLockState?.retest_chapter_order || ((courseLockState?.locked_chapter_order || 2) - 1)
                  const retestChapter = course.chapters.find(
                    (ch, idx) => Number(ch.order || idx + 1) === retestOrder
                  )
                  const targetModId = courseLockState?.retest_module_id || retestChapter?.id
                  navigate(`/course/${course.id}/exam?type=challenge&chapterId=${targetModId || ''}`)
                }}
              />
            </div>
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
          onOpenPracticeQuiz={(chapter, lesson) => {
            handleSelectLesson(chapter, lesson)
            setActiveBottomTab('quiz')
          }}
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
              price: getCourseEffectivePrice(course),
              thumbnail: course.thumbnail,
            },
          ]}
          onSuccess={() => {
            setIsEnrolled(true)
            getQueryClient().invalidateQueries({ queryKey: courseKeys.enrollments() })
            toast.success('Mở khóa khóa học thành công! Chúc bạn học tốt!', 'Đã mở khóa')
            setShowScheduleModal(true)
          }}
        />
      )}

      {showPlacementPromptModal && (
        <CoursePlacementPromptModal
          open={showPlacementPromptModal}
          onOpenChange={setShowPlacementPromptModal}
          onProceedPurchase={() => setShowCourseCheckoutModal(true)}
          courseTitle={course?.title}
          courseCategory={course?.category}
          courseSkills={course?.skills}
          courseTargetScore={course?.target_score}
        />
      )}

      {showScheduleModal && course && (
        <CourseScheduleModal
          courseId={course.id}
          courseTitle={course.title}
          initialSchedule={courseSchedule}
          onClose={() => setShowScheduleModal(false)}
          onSaved={(newSched) => {
            setCourseSchedule((prev) => ({
              is_reminder_enabled: true,
              reminder_time: newSched.reminder_time || prev?.reminder_time || '20:00',
              reminder_days: newSched.reminder_days || prev?.reminder_days || ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
              study_duration_minutes: newSched.study_duration_minutes || prev?.study_duration_minutes || 30,
              is_email_notification_enabled: newSched.is_email_notification_enabled ?? true,
            }))
            refreshCourseProgress()
          }}
          onCancelled={() => {
            setCourseSchedule((prev) => (prev ? { ...prev, is_reminder_enabled: false } : null))
            refreshCourseProgress()
          }}
        />
      )}
    </div>
  )
}
