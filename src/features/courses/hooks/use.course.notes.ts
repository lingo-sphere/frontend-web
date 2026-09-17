// Custom hook quản lý ghi chú bài học cá nhân trong khóa học.
import { type Dispatch, type SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { courseService } from '@/features/courses/services/course.service'
import { toast } from '@/store/toast.store'
import type { Course, Lesson, NoteItem } from '@/features/courses/types/course'
import type { User } from '@/types/api.types'
import type { BottomTab } from '@/features/courses/components/course.workspace.tabs'

interface UseCourseNotesParams {
  course: Course | null
  setCourse: Dispatch<SetStateAction<Course | null>>
  currentLesson: Lesson | null
  isAuthenticated: boolean
  user: User | null
  isEnrolled: boolean
  setActiveBottomTab: (tab: BottomTab) => void
}

export function useCourseNotes({
  course,
  setCourse,
  currentLesson,
  isAuthenticated,
  user,
  isEnrolled,
  setActiveBottomTab,
}: UseCourseNotesParams) {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const handleAddNoteAtTimestamp = async (timestamp: number, noteContent?: string) => {
    if (!course || !currentLesson) return
    if (!isAuthenticated || !user) {
      toast.error(
        isVietnamese ? 'Vui lòng đăng nhập để lưu ghi chú bài học!' : 'Please sign in to save lesson notes!',
        isVietnamese ? 'Chưa đăng nhập' : 'Not signed in'
      )
      return
    }
    if (!isEnrolled) {
      toast.error(
        isVietnamese ? 'Bạn cần mua hoặc đăng ký khóa học này để tạo ghi chú bài giảng!' : 'You need to enroll in this course to create lesson notes!',
        isVietnamese ? 'Chưa sở hữu khóa học' : 'Course not enrolled'
      )
      return
    }
    const formatted = `${Math.floor(timestamp / 60)}:${String(Math.floor(timestamp % 60)).padStart(2, '0')}`
    const content = noteContent || (isVietnamese ? `Ghi chú bài học tại mốc ${formatted}` : `Lesson note at ${formatted}`)

    try {
      const res = (await courseService.createCourseNote(String(course.id), {
        lesson_id: currentLesson.id,
        lesson_title: currentLesson.title,
        timestamp,
        formatted_time: formatted,
        content,
      })) as Record<string, unknown>

      const newNote: NoteItem = {
        id: String(res?._id || res?.id || ''),
        lessonId: currentLesson.id,
        lessonTitle: currentLesson.title,
        timestamp,
        formattedTime: formatted,
        content,
        createdAt: isVietnamese ? 'Vừa xong' : 'Just now',
      }
      setCourse((prev) => (prev ? { ...prev, notes: [newNote, ...(prev.notes || [])] } : null))
      setActiveBottomTab('notes')
      toast.success(
        isVietnamese ? `Đã lưu ghi chú tại mốc ${formatted}!` : `Saved note at ${formatted}!`,
        isVietnamese ? 'Ghi chú bài học' : 'Lesson note'
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (isVietnamese ? 'Không thể lưu ghi chú' : 'Could not save note')
      toast.error(msg, isVietnamese ? 'Lỗi lưu ghi chú' : 'Error saving note')
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!isAuthenticated || !user) {
      toast.error(
        isVietnamese ? 'Vui lòng đăng nhập để xóa ghi chú!' : 'Please sign in to delete notes!',
        isVietnamese ? 'Chưa đăng nhập' : 'Not signed in'
      )
      return
    }
    try {
      await courseService.deleteCourseNote(noteId)
      setCourse((prev) =>
        prev ? { ...prev, notes: (prev.notes || []).filter((n) => n.id !== noteId) } : null
      )
      toast.success(
        t('notes.deleteSuccess'),
        isVietnamese ? 'Xóa ghi chú' : 'Delete note'
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (isVietnamese ? 'Không thể xóa ghi chú' : 'Could not delete note')
      toast.error(msg, isVietnamese ? 'Lỗi xóa ghi chú' : 'Error deleting note')
    }
  }

  return {
    handleAddNoteAtTimestamp,
    handleDeleteNote,
  }
}
