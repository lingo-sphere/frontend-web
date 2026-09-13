// Custom hook quản lý ghi chú bài học cá nhân trong khóa học.

import { type Dispatch, type SetStateAction } from 'react'
import { courseService } from '@/features/courses/services/course.service'
import { toast } from '@/store/toast.store'
import type { Course, Lesson, NoteItem } from '@/features/courses/types/course'

interface UseCourseNotesParams {
  course: Course | null
  setCourse: Dispatch<SetStateAction<Course | null>>
  currentLesson: Lesson | null
  isAuthenticated: boolean
  user: any
  isEnrolled: boolean
  setActiveBottomTab: (tab: any) => void
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
  const handleAddNoteAtTimestamp = async (timestamp: number, noteContent?: string) => {
    if (!course || !currentLesson) return
    if (!isAuthenticated || !user) {
      toast.error('Vui lòng đăng nhập để lưu ghi chú bài học!', 'Chưa đăng nhập')
      return
    }
    if (!isEnrolled) {
      toast.error('Bạn cần mua hoặc đăng ký khóa học này để tạo ghi chú bài giảng!', 'Chưa sở hữu khóa học')
      return
    }
    const formatted = `${Math.floor(timestamp / 60)}:${String(Math.floor(timestamp % 60)).padStart(2, '0')}`
    const content = noteContent || `Ghi chú bài học tại mốc ${formatted}`

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
        createdAt: 'Vừa xong',
      }
      setCourse((prev) => (prev ? { ...prev, notes: [newNote, ...(prev.notes || [])] } : null))
      setActiveBottomTab('notes')
      toast.success(`Đã lưu ghi chú tại mốc ${formatted} vào cơ sở dữ liệu!`, 'Ghi chú bài học')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể lưu ghi chú'
      toast.error(msg, 'Lỗi lưu ghi chú')
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!isAuthenticated || !user) {
      toast.error('Vui lòng đăng nhập để xóa ghi chú!', 'Chưa đăng nhập')
      return
    }
    try {
      await courseService.deleteCourseNote(noteId)
      setCourse((prev) =>
        prev ? { ...prev, notes: (prev.notes || []).filter((n) => n.id !== noteId) } : null
      )
      toast.success('Đã xóa ghi chú thành công!', 'Xóa ghi chú')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể xóa ghi chú'
      toast.error(msg, 'Lỗi xóa ghi chú')
    }
  }

  return {
    handleAddNoteAtTimestamp,
    handleDeleteNote,
  }
}
