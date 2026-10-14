// Custom hook quản lý gửi đánh giá số sao và nhận xét khóa học.
import { type Dispatch, type SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { courseService } from '@/features/courses/services/course.service'
import { toast } from '@/store/toast.store'
import type { Course, CourseReviewItem } from '@/features/courses/types/course'
import type { User } from '@/types/api.types'

interface UseCourseReviewsParams {
  course: Course | null
  setCourse: Dispatch<SetStateAction<Course | null>>
  isAuthenticated: boolean
  user: User | null
  isEnrolled: boolean
}

export function useCourseReviews({
  course,
  setCourse,
  isAuthenticated,
  user,
  isEnrolled,
}: UseCourseReviewsParams) {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const handleAddReview = async (rating: number, content: string) => {
    if (!course) return
    if (!isAuthenticated || !user) {
      toast.error(
        t('courses.reviewLoginRequired'),
        isVietnamese ? 'Chưa đăng nhập' : 'Not signed in'
      )
      return
    }
    if (!isEnrolled) {
      toast.error(
        t('courses.reviewEnrollRequired'),
        isVietnamese ? 'Chưa sở hữu khóa học' : 'Course not enrolled'
      )
      return
    }
    try {
      const res = (await courseService.createCourseReview(String(course.id), {
        rating,
        content,
      })) as { review: Record<string, unknown>; rating: number; rating_count: number }

      const newRev: CourseReviewItem = {
        id: String(res?.review?._id || res?.review?.id || ''),
        author: isVietnamese ? 'Bạn (Học viên)' : 'You (Learner)',
        rating,
        date: isVietnamese ? 'Vừa xong' : 'Just now',
        content,
      }

      setCourse((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          rating: typeof res?.rating === 'number' ? res.rating : prev.rating,
          ratingCount: typeof res?.rating_count === 'number' ? res.rating_count : (prev.ratingCount || 0) + 1,
          reviews: [newRev, ...(prev.reviews || [])],
        }
      })
      toast.success(
        t('courses.reviewThanks'),
        isVietnamese ? 'Đánh giá thành công' : 'Review submitted'
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (isVietnamese ? 'Không thể gửi đánh giá' : 'Could not submit review')
      toast.error(msg, isVietnamese ? 'Lỗi đánh giá' : 'Review error')
    }
  }

  return {
    handleAddReview,
  }
}
