// Hook quản lý dữ liệu và thao tác danh sách ghi chú bài học của học viên.
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { courseService, type UserCourseNoteItem } from '@/features/courses/services/course.service'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { toast } from '@/store/toast.store'

export const MY_NOTES_QUERY_KEY = ['my-course-notes'] as const

export function useMyNotesQuery() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery<UserCourseNoteItem[]>({
    queryKey: MY_NOTES_QUERY_KEY,
    queryFn: () => courseService.getMyCourseNotes(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  })
}

export function useDeleteCourseNoteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (noteId: string) => courseService.deleteCourseNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_NOTES_QUERY_KEY })
      toast.success('Đã xóa ghi chú bài học thành công!')
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Không thể xóa ghi chú bài học.'
      toast.error(msg)
    },
  })
}
