// Quản lý trạng thái hiển thị các modal và tương tác giỏ hàng trong không gian học tập.

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Course } from '@/features/courses/types/course'
import { toast } from '@/store/toast.store'

interface UseCourseWorkspaceModalsProps {
  course: Course | null
  isAuthenticated: boolean
  isInCart: (courseId: string) => boolean
  addToCart: (courseId: string) => Promise<unknown>
}

export function useCourseWorkspaceModals({
  course,
  isAuthenticated,
  isInCart,
  addToCart,
}: UseCourseWorkspaceModalsProps) {
  const { i18n } = useTranslation()
  const isVietnamese = (i18n.language || 'vi').startsWith('vi')
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showCourseCheckoutModal, setShowCourseCheckoutModal] = useState(false)
  const [showPlacementPromptModal, setShowPlacementPromptModal] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.warning(
        isVietnamese
          ? 'Vui lòng đăng nhập để thêm khóa học vào giỏ hàng.'
          : 'Please log in to add courses to your cart.',
        isVietnamese ? 'Yêu cầu đăng nhập' : 'Authentication required'
      )
      return
    }
    if (!course) return
    if (isInCart(course.id)) {
      return
    }
    setIsAddingToCart(true)
    try {
      await addToCart(course.id)
      toast.success(
        isVietnamese ? 'Đã thêm khóa học vào giỏ hàng thành công!' : 'Course added to cart successfully!',
        isVietnamese ? 'Giỏ hàng' : 'Cart'
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : isVietnamese ? 'Không thể thêm vào giỏ hàng' : 'Could not add to cart'
      toast.error(msg, isVietnamese ? 'Lỗi' : 'Error')
    } finally {
      setIsAddingToCart(false)
    }
  }

  return {
    showRatingModal,
    setShowRatingModal,
    showUpgradeModal,
    setShowUpgradeModal,
    showCourseCheckoutModal,
    setShowCourseCheckoutModal,
    showPlacementPromptModal,
    setShowPlacementPromptModal,
    isAddingToCart,
    handleAddToCart,
  }
}
