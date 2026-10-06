// Custom hook quản lý thảo luận Hỏi & Đáp trong khóa học.
import { type Dispatch, type SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { courseService } from '@/features/courses/services/course.service'
import { toast } from '@/store/toast.store'
import type { Course, Lesson, QnAItem } from '@/features/courses/types/course'
import type { User } from '@/types/api.types'

interface UseCourseQnAParams {
  course: Course | null
  setCourse: Dispatch<SetStateAction<Course | null>>
  currentLesson: Lesson | null
  isAuthenticated: boolean
  user: User | null
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
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const handleCreateQnA = async (title: string, body: string, isAnonymous?: boolean) => {
    if (!course || !currentLesson) return
    if (!isAuthenticated || !user) {
      toast.error(
        isVietnamese ? 'Vui lòng đăng nhập để đặt câu hỏi!' : 'Please sign in to ask a question!',
        isVietnamese ? 'Chưa đăng nhập' : 'Not signed in'
      )
      return
    }
    if (!isEnrolled) {
      toast.error(
        isVietnamese ? 'Bạn cần mua hoặc đăng ký khóa học để gửi câu hỏi Hỏi & Đáp!' : 'You need to enroll in this course to post Q&A questions!',
        isVietnamese ? 'Chưa sở hữu khóa học' : 'Course not enrolled'
      )
      return
    }
    try {
      const authorName = isAnonymous
        ? (isVietnamese ? 'Học viên ẩn danh' : 'Anonymous learner')
        : user.full_name || user.email
      const authorAvatar = isAnonymous ? '' : user.avatar_url || ''

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
        userId: user.user_id,
        isAnonymous: Boolean(isAnonymous),
        author: authorName,
        authorAvatar: authorAvatar || undefined,
        title,
        body,
        createdAt: isVietnamese ? 'Vừa xong' : 'Just now',
        upvotes: 0,
        answersCount: 1,
        isAnswered: true,
        answers: [
          {
            id: `ans-${Date.now()}`,
            author: 'LingoSphere AI Tutor',
            authorRole: isVietnamese ? 'Gia sư AI' : 'AI Tutor',
            body: isVietnamese
              ? `Chào bạn! Cảm ơn câu hỏi về "${title}". Giảng viên và Trợ lý AI đã ghi nhận thắc mắc và sẽ phản hồi chi tiết trong giây lát!`
              : `Hello! Thank you for asking about "${title}". Our instructor and AI assistant have received your question and will provide feedback shortly!`,
            createdAt: isVietnamese ? 'Vừa xong' : 'Just now',
            upvotes: 0,
          },
        ],
      }

      setCourse((prev) => (prev ? { ...prev, qna: [newQnA, ...(prev.qna || [])] } : null))
      toast.success(
        isAnonymous
          ? (isVietnamese ? 'Câu hỏi ẩn danh của bạn đã được đăng thành công!' : 'Your anonymous question has been posted successfully!')
          : (isVietnamese ? 'Câu hỏi của bạn đã được đăng thành công!' : 'Your question has been posted successfully!'),
        isVietnamese ? 'Hỏi & Đáp' : 'Q&A'
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (isVietnamese ? 'Không thể đăng câu hỏi' : 'Could not post question')
      toast.error(msg, isVietnamese ? 'Lỗi đăng câu hỏi' : 'Error posting question')
    }
  }

  const handleAddQnAAnswer = async (qnaId: string, answerText: string) => {
    if (!isAuthenticated || !user) {
      toast.error(
        isVietnamese ? 'Vui lòng đăng nhập để trả lời!' : 'Please sign in to reply!',
        isVietnamese ? 'Chưa đăng nhập' : 'Not signed in'
      )
      return
    }
    if (!isEnrolled) {
      toast.error(
        isVietnamese ? 'Bạn cần mua hoặc đăng ký khóa học để trả lời câu hỏi!' : 'You need to enroll in this course to reply!',
        isVietnamese ? 'Chưa sở hữu khóa học' : 'Course not enrolled'
      )
      return
    }
    try {
      const authorName = user.full_name || user.email
      const authorAvatar = user.avatar_url || ''

      await courseService.addQnAAnswer(qnaId, {
        body: answerText,
        author: authorName,
        author_avatar: authorAvatar,
      })
      const newAns = {
        id: `ans-${Date.now()}`,
        author: authorName,
        authorRole: isVietnamese ? 'Học viên' : 'Learner',
        authorAvatar: authorAvatar || undefined,
        body: answerText,
        createdAt: isVietnamese ? 'Vừa xong' : 'Just now',
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
      toast.success(
        isVietnamese ? 'Đã gửi câu trả lời thành công!' : 'Reply submitted successfully!',
        isVietnamese ? 'Hỏi & Đáp' : 'Q&A'
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (isVietnamese ? 'Không thể gửi câu trả lời' : 'Could not submit reply')
      toast.error(msg, isVietnamese ? 'Lỗi trả lời Q&A' : 'Error replying')
    }
  }

  const handleUpvoteQnA = async (qnaId: string) => {
    if (!isAuthenticated || !user) {
      toast.error(
        isVietnamese ? 'Vui lòng đăng nhập để bình chọn!' : 'Please sign in to upvote!',
        isVietnamese ? 'Chưa đăng nhập' : 'Not signed in'
      )
      return
    }
    if (!isEnrolled) {
      toast.error(
        isVietnamese ? 'Bạn cần mua hoặc đăng ký khóa học để bình chọn!' : 'You need to enroll in this course to upvote!',
        isVietnamese ? 'Chưa sở hữu khóa học' : 'Course not enrolled'
      )
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
      const msg = err instanceof Error ? err.message : (isVietnamese ? 'Không thể bình chọn' : 'Could not upvote')
      toast.error(msg, isVietnamese ? 'Lỗi bình chọn' : 'Error upvoting')
    }
  }

  return {
    handleCreateQnA,
    handleAddQnAAnswer,
    handleUpvoteQnA,
  }
}
