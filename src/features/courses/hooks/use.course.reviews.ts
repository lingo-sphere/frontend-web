// Custom hook quản lý gửi đánh giá số sao và nhận xét khóa học.

import { type Dispatch, type SetStateAction } from 'react'
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
  const handleAddReview = async (rating: number, content: string) => {
    if (!course) return
    if (!isAuthenticated || !user) {
      toast.error('Vui lòng đăng nhập để đánh giá khóa học!', 'Chưa đăng nhập')
      return
    }
    if (!isEnrolled) {
      toast.error('Bạn cần mua hoặc đăng ký khóa học để gửi đánh giá!', 'Chưa sở hữu khóa học')
      return
    }
    try {
      const res = (await courseService.createCourseReview(String(course.id), {
        rating,
        content,
      })) as { review: Record<string, unknown>; rating: number; rating_count: number }

      const newRev: CourseReviewItem = {
        id: String(res?.review?._id || res?.review?.id || ''),
        author: 'Bạn (Học viên)',
        rating,
        date: 'Vừa xong',
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
      toast.success('Cảm ơn bạn đã gửi đánh giá khóa học!', 'Đánh giá thành công')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể gửi đánh giá'
      toast.error(msg, 'Lỗi đánh giá')
    }
  }

  return {
    handleAddReview,
  }
}
