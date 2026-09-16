// Quản lý trạng thái hiển thị các modal và tương tác giỏ hàng trong không gian học tập.

import { useState } from 'react'
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
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showCourseCheckoutModal, setShowCourseCheckoutModal] = useState(false)
  const [showPlacementPromptModal, setShowPlacementPromptModal] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('lingosphere:open-auth-modal'))
      return
    }
    if (!course) return
    if (isInCart(course.id)) {
      return
    }
    setIsAddingToCart(true)
    try {
      await addToCart(course.id)
      toast.success('Đã thêm khóa học vào giỏ hàng thành công!', 'Giỏ hàng')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể thêm vào giỏ hàng'
      toast.error(msg, 'Lỗi')
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
