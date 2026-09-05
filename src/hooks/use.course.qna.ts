/**
 * @file use.course.qna.ts
 * @description Custom hook quản lý thảo luận Hỏi & Đáp (đăng câu hỏi, trả lời câu hỏi và bình chọn upvote)
 */

import { type Dispatch, type SetStateAction } from 'react'
import { courseService } from '@/services/course.service'
import { toast } from '@/store/toast.store'
import type { Course, Lesson, QnAItem } from '@/types/course'

interface UseCourseQnAParams {
  course: Course | null
  setCourse: Dispatch<SetStateAction<Course | null>>
  currentLesson: Lesson | null
  isAuthenticated: boolean
  user: any
  isEnrolled: boolean
}

export function useCourseQnA({
  course,
  setCourse,
  currentLesson,
  isAuthenticated,
  user,
  isEnrolled,
}: UseCourseQnAParams) {
  const handleCreateQnA = async (title: string, body: string, isAnonymous?: boolean) => {
    if (!course || !currentLesson) return
    if (!isAuthenticated || !user) {
      toast.error('Vui lòng đăng nhập để đặt câu hỏi!', 'Chưa đăng nhập')
      return
    }
    if (!isEnrolled) {
      toast.error('Bạn cần mua hoặc đăng ký khóa học để gửi câu hỏi Hỏi & Đáp!', 'Chưa sở hữu khóa học')
      return
    }
    try {
      const userPayload = user as unknown as Record<string, unknown>
      const authorName = isAnonymous
        ? 'Học viên ẩn danh'
        : user.full_name || (userPayload?.name as string) || user.email?.split('@')[0] || 'Học viên'
      const authorAvatar = isAnonymous ? '' : user.avatar_url || (userPayload?.avatar as string) || ''

      const res = (await courseService.createCourseQnA(String(course.id), {
        lesson_id: currentLesson.id,
        lesson_title: currentLesson.title,
        title,
        body,
        is_anonymous: isAnonymous,
        author_name: authorName,
        author_avatar: authorAvatar,
      })) as Record<string, unknown>

      const newQnA: QnAItem = {
        id: String(res?._id || `qna-${Date.now()}`),
        lessonTitle: currentLesson.title,
        userId: user.id || user.user_id,
        isAnonymous: Boolean(isAnonymous),
        author: authorName,
        authorAvatar: authorAvatar || undefined,
        title,
        body,
        createdAt: 'Vừa xong',
        upvotes: 0,
        answersCount: 1,
        isAnswered: true,
        answers: [
          {
            id: `ans-${Date.now()}`,
            author: 'LingoSphere AI Tutor',
            authorRole: 'Gia sư AI',
            body: `Chào bạn! Cảm ơn câu hỏi về "${title}". Giảng viên và Trợ lý AI đã ghi nhận thắc mắc và sẽ phản hồi chi tiết trong giây lát!`,
            createdAt: 'Vừa xong',
            upvotes: 0,
          },
        ],
      }

      setCourse((prev) => (prev ? { ...prev, qna: [newQnA, ...(prev.qna || [])] } : null))
      toast.success(
        isAnonymous
          ? 'Câu hỏi ẩn danh của bạn đã được đăng thành công!'
          : 'Câu hỏi của bạn đã được đăng thành công!',
        'Hỏi & Đáp'
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể đăng câu hỏi'
      toast.error(msg, 'Lỗi đăng câu hỏi')
    }
  }

  const handleAddQnAAnswer = async (qnaId: string, answerText: string) => {
    if (!isAuthenticated || !user) {
      toast.error('Vui lòng đăng nhập để trả lời!', 'Chưa đăng nhập')
      return
    }
    if (!isEnrolled) {
      toast.error('Bạn cần mua hoặc đăng ký khóa học để trả lời câu hỏi!', 'Chưa sở hữu khóa học')
      return
    }
    try {
      const userPayload = user as unknown as Record<string, unknown>
      const authorName = user.full_name || (userPayload?.name as string) || user.email?.split('@')[0] || 'Học viên'
      const authorAvatar = user.avatar_url || (userPayload?.avatar as string) || ''

      await courseService.addQnAAnswer(qnaId, {
        body: answerText,
        author: authorName,
        author_avatar: authorAvatar,
      })
      const newAns = {
        id: `ans-${Date.now()}`,
        author: authorName,
        authorRole: 'Học viên',
        authorAvatar: authorAvatar || undefined,
        body: answerText,
        createdAt: 'Vừa xong',
        upvotes: 0,
      }
      setCourse((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          qna: (prev.qna || []).map((q) =>
            q.id === qnaId
              ? { ...q, answers: [...(q.answers || []), newAns], answersCount: (q.answersCount || 0) + 1 }
              : q
          ),
        }
      })
      toast.success('Đã gửi câu trả lời thành công!', 'Hỏi & Đáp')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể gửi câu trả lời'
      toast.error(msg, 'Lỗi trả lời Q&A')
    }
  }

  const handleUpvoteQnA = async (qnaId: string) => {
    if (!isAuthenticated || !user) {
      toast.error('Vui lòng đăng nhập để bình chọn!', 'Chưa đăng nhập')
      return
    }
    if (!isEnrolled) {
      toast.error('Bạn cần mua hoặc đăng ký khóa học để bình chọn!', 'Chưa sở hữu khóa học')
      return
    }
    try {
      await courseService.toggleQnAUpvote(qnaId)
      setCourse((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          qna: (prev.qna || []).map((q) =>
            q.id === qnaId ? { ...q, upvotes: (q.upvotes || 0) + 1 } : q
          ),
        }
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể bình chọn'
      toast.error(msg, 'Lỗi bình chọn')
    }
  }

  return {
    handleCreateQnA,
    handleAddQnAAnswer,
    handleUpvoteQnA,
  }
}
