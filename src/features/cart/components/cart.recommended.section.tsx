// Khối hiển thị các khóa học gợi ý thêm cho học viên ngay trong trang giỏ hàng
'use client'

import { useState } from 'react'
import { Plus, Check, Sparkles, BookOpen, Star } from 'lucide-react'
import { useAllCoursesQuery, useUserEnrollments } from '@/features/courses/hooks/use.courses.query'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useCart } from '@/features/cart/hooks/use.cart.query'
import { buildCourseUrl } from '@/features/courses/lib/course.url'
import { formatCurrency } from '@/lib/format'
import { toast } from '@/store/toast.store'
import type { Course } from '@/types/api.types'

interface CartRecommendedSectionProps {
  currentCartCourseIds: string[]
  isVi: boolean
  onNavigate: (url: string) => void
}

export function CartRecommendedSection({
  currentCartCourseIds,
  isVi,
  onNavigate,
}: CartRecommendedSectionProps) {
  const { isAuthenticated } = useAuthStore()
  const { data: courses = [], isLoading } = useAllCoursesQuery()
  const { isEnrolled } = useUserEnrollments(isAuthenticated)
  const { addToCart, isAdding } = useCart(isAuthenticated)
  const [addingCourseId, setAddingCourseId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="space-y-4 pt-6">
        <div className="h-6 w-48 bg-surface-hover rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="h-56 bg-surface rounded-2xl border border-border animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const recommendedCourses = (courses as Course[])
    .filter((c) => {
      const id = c._id
      if (!id) return false
      if (currentCartCourseIds.includes(id)) return false
      if (isEnrolled(id)) return false
      return c.is_published !== false
    })
    .slice(0, 3)

  if (recommendedCourses.length === 0) {
    return null
  }

  const handleAddCourse = async (course: Course) => {
    const courseId = course._id
    if (!courseId) return

    setAddingCourseId(courseId)
    try {
      await addToCart(courseId)
      toast.success(
        isVi
          ? `Đã thêm "${course.title}" vào giỏ hàng!`
          : `Added "${course.title}" to cart!`,
        isVi ? 'Thành công' : 'Success'
      )
    } catch {
      toast.error(
        isVi ? 'Không thể thêm vào giỏ hàng lúc này' : 'Failed to add to cart',
        isVi ? 'Lỗi' : 'Error'
      )
    } finally {
      setAddingCourseId(null)
    }
  }

  return (
    <section className="space-y-4 pt-6 border-t border-border">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-extrabold text-text-primary flex items-center gap-2">
            <Sparkles size={18} className="text-purple-600 dark:text-purple-400" />
            <span>{isVi ? 'Khóa học đề xuất cho bạn' : 'Recommended for You'}</span>
          </h2>
          <p className="text-xs text-text-secondary">
            {isVi
              ? 'Học viên khác cũng thường đăng ký kết hợp các khóa học này để bứt phá điểm số nhanh nhất.'
              : 'Learners also enroll in these courses to boost their scores.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendedCourses.map((c) => {
          const courseId = c._id
          const rawPrice = Number(c.price ?? 0)
          const rawDiscount = Number(c.discount_price ?? 0)
          const hasDiscount = rawDiscount > 0 && rawDiscount < rawPrice
          const salePrice = hasDiscount ? rawDiscount : rawPrice > 0 ? rawPrice : rawDiscount
          const originalPrice = hasDiscount ? rawPrice : null
          const isCurrentlyAdding = addingCourseId === courseId && isAdding
          const courseUrl = buildCourseUrl({ id: courseId, title: c.title, slug: c.slug })

          return (
            <div
              key={courseId}
              className="group rounded-2xl border border-border/80 bg-surface p-4 flex flex-col justify-between transition-all duration-200 hover:border-purple-500/40 hover:shadow-md space-y-3"
            >
              <div className="space-y-3">
                <div
                  onClick={() => onNavigate(courseUrl)}
                  className="relative aspect-video w-full rounded-xl overflow-hidden border border-border/60 bg-surface-subtle cursor-pointer"
                >
                  <img
                    src={
                      c.thumbnail_url ||
                      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600'
                    }
                    alt={c.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {c.category && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-background/90 backdrop-blur-xs text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 border border-border/60">
                      {c.category.replace(/_/g, ' ')}
                    </span>
                  )}
                  {c.target_score && (
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-black">
                      Target {c.target_score}+
                    </span>
                  )}
                </div>

                <div>
                  <h3
                    onClick={() => onNavigate(courseUrl)}
                    className="text-sm font-bold text-text-primary line-clamp-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer leading-snug"
                  >
                    {c.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-text-tertiary pt-1">
                    <span>{c.instructor_name || c.author_name || 'LingoSphere Academic'}</span>
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star size={12} className="fill-amber-500" />
                      <span>4.9</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-base font-extrabold text-text-primary">
                    {formatCurrency(salePrice, isVi ? 'Miễn phí' : 'Free')}
                  </span>
                  {originalPrice && (
                    <span className="text-[11px] text-text-tertiary line-through">
                      {formatCurrency(originalPrice)}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleAddCourse(c)}
                  disabled={isCurrentlyAdding}
                  className="px-3 py-2 rounded-xl bg-purple-600/10 hover:bg-purple-600 text-purple-600 dark:text-purple-400 hover:text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 border border-purple-500/20 disabled:opacity-50"
                >
                  <Plus size={14} />
                  <span>{isVi ? 'Thêm giỏ' : 'Add to cart'}</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
