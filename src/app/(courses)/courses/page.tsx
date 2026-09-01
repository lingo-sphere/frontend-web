'use client'

/**
 * @file page.tsx
 * @description Trang giao diện người dùng (Next.js App Router) cho tuyến (courses)/courses
 */

import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from '@/lib/navigation'
import { BookOpen } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { courseService } from '@/services/course.service'
import type { Course } from '@/types/api.types'
import type { CourseCardData, CourseTabType } from '@/types/course'
import { CourseSearchBar } from '@/components/course/CourseSearchBar'
import { CourseScheduleBanner } from '@/components/course/CourseScheduleBanner'
import { CourseScheduleModal } from '@/components/course/CourseScheduleModal'
import { CourseCard } from '@/components/course/CourseCard'
import { useWishlistStore } from '@/store/wishlist-store'
import { useAuthStore } from '@/store/auth-store'
import { toast } from '@/store/toast-store'

export default function CoursesCatalogPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const navigate = useNavigate()
  const searchParams = useSearchParams()
  const { items: wishlistItems, toggleItem, isInWishlist, fetchWishlist } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()

  const tabParam = searchParams.get('tab')
  const activeTab: CourseTabType =
    tabParam === 'my-courses' ? 'my-courses' : tabParam === 'wishlist' ? 'wishlist' : 'all'

  const [courses, setCourses] = useState<CourseCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showScheduleBanner, setShowScheduleBanner] = useState(true)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist()
    }
  }, [isAuthenticated, fetchWishlist])

  useEffect(() => {
    let isMounted = true
    const fetchCourses = async () => {
      setLoading(true)
      try {
        const liveCourses: Course[] = await courseService.getAllCourses()
        if (isMounted && Array.isArray(liveCourses)) {
          const mapped: CourseCardData[] = liveCourses.map((c) => {
            const raw = c as unknown as Record<string, unknown>
            const is4Skills = c.category === 'TOEIC_4_SKILLS'
            const durationHrs = Math.max(
              1,
              Math.round(
                (Number(raw.total_duration_minutes) ||
                  (Number(raw.total_lessons) || 0) * 15 ||
                  60) / 60
              )
            )
            const rawLevel = String(c.level || '')
            let levelDisplay = 'TOEIC'
            if (rawLevel === 'BEGINNER') levelDisplay = 'Sơ cấp (Beginner)'
            else if (rawLevel === 'INTERMEDIATE') levelDisplay = 'Trung cấp (Intermediate)'
            else if (rawLevel === 'ADVANCED') levelDisplay = 'Nâng cao (Advanced)'
            else if (rawLevel) levelDisplay = rawLevel

            const rawPrice = Number(raw.price ?? 0)
            const rawDiscount = Number(raw.discount_price ?? 0)
            let finalPrice = rawPrice
            let originalPrice = Number(raw.original_price ?? 0)

            if (rawDiscount > 0 && rawPrice > 0 && rawPrice > rawDiscount) {
              finalPrice = rawDiscount
              originalPrice = rawPrice
            } else if (rawDiscount > 0 && rawPrice === 0) {
              finalPrice = rawDiscount
            } else if (rawPrice > 0 && originalPrice === 0 && rawDiscount > rawPrice) {
              originalPrice = rawDiscount
            }

            return {
              id: String(c.id || raw._id || c.slug || ''),
              slug: c.slug,
              title: c.title,
              instructor: String(
                raw.author_name || raw.instructor_name || 'Đội ngũ Giảng viên LingoSphere'
              ),
              thumbnail:
                c.thumbnail_url ||
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
              category: c.category || 'TOEIC_2_SKILLS',
              level: levelDisplay,
              description: c.description || '',
              duration: `${durationHrs} giờ`,
              totalLessons: Number(c.total_lessons) || 0,
              chapters:
                Number(raw.total_modules) ||
                (Array.isArray(c.chapters) ? c.chapters.length : 0),
              students: Number(raw.students_count || raw.enrollments || 0),
              rating: Number(raw.rating || raw.rating_avg || 5.0),
              ratingCount: Number(raw.rating_count || raw.reviews_count || 0),
              price: finalPrice,
              discountPrice: originalPrice > finalPrice ? originalPrice : undefined,
              targetScore: Number(raw.target_score) || 0,
              badge: is4Skills ? 'TOEIC 4 Kỹ Năng' : 'TOEIC 2 Kỹ Năng',
              progress: 0,
              hasCertificate: true,
            }
          })
          setCourses(mapped)
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách khóa học:', err)
        if (isMounted) setCourses([])
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchCourses()
    return () => {
      isMounted = false
    }
  }, [])

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        selectedCategory === 'all' || c.category === selectedCategory

      if (activeTab === 'wishlist') return matchesSearch && isInWishlist(c.id)
      if (activeTab === 'my-courses') return matchesSearch && (c.progress !== undefined && c.progress >= 0)

      return matchesSearch && matchesCategory
    })
  }, [courses, searchQuery, selectedCategory, activeTab, wishlistItems, isInWishlist])

  const toggleWishlist = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.warning(
        isVi
          ? 'Vui lòng đăng nhập để lưu khóa học vào danh sách yêu thích!'
          : 'Please sign in to add courses to your wishlist!',
        isVi ? 'Yêu cầu đăng nhập' : 'Authentication required'
      )
      setActiveMenuId(null)
      return
    }
    const targetCourse = courses.find((c) => c.id === id)
    if (targetCourse) {
      const res = await toggleItem(targetCourse)
      if (res && res.success) {
        if (res.isWishlisted) {
          toast.success(
            isVi ? 'Đã thêm khóa học vào danh sách yêu thích!' : 'Added course to wishlist!',
            isVi ? 'Yêu thích' : 'Wishlist'
          )
        } else {
          toast.info(
            isVi ? 'Đã xóa khóa học khỏi danh sách yêu thích.' : 'Removed course from wishlist.',
            isVi ? 'Yêu thích' : 'Wishlist'
          )
        }
      } else if (res && !res.success && res.message) {
        toast.error(res.message, isVi ? 'Lỗi' : 'Error')
      }
    }
    setActiveMenuId(null)
  }

  const toggleMenu = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveMenuId((prev) => (prev === courseId ? null : courseId))
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background text-text-primary">
        <main className="w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
                {activeTab === 'my-courses'
                  ? (isVi ? 'Khóa học của tôi' : 'My Courses')
                  : activeTab === 'wishlist'
                  ? (isVi ? 'Khóa học yêu thích' : 'Liked Courses')
                  : (isVi ? 'Tất cả khóa học' : 'All Courses')}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-text-secondary">
                {activeTab === 'my-courses'
                  ? (isVi ? 'Tiếp tục hành trình học tập và hoàn thành các bài giảng của bạn.' : 'Continue your enrolled courses and finish lessons.')
                  : activeTab === 'wishlist'
                  ? (isVi ? 'Danh sách các khóa học bạn đã lưu lại để học sau.' : 'Your saved wishlist courses for future learning.')
                  : (isVi ? 'Khám phá các khóa học TOEIC & Tiếng Anh giao tiếp theo lộ trình chuẩn ETS.' : 'Explore TOEIC & Communication courses with ETS standard.')}
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>
                {filteredCourses.length} {isVi ? 'Khóa học' : 'Courses'}
              </span>
            </div>
          </div>

          {showScheduleBanner && (
            <CourseScheduleBanner
              onOpenModal={() => setShowScheduleModal(true)}
              onDismiss={() => setShowScheduleBanner(false)}
            />
          )}

          <CourseSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 rounded-2xl border border-border bg-surface/50 animate-pulse"
                />
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="py-20 text-center rounded-2xl border border-dashed border-border bg-surface/50 space-y-3">
              <BookOpen className="mx-auto text-text-tertiary" size={40} />
              <h3 className="text-base font-bold text-text-primary">
                {isVi ? 'Không tìm thấy khóa học phù hợp' : 'No courses found'}
              </h3>
              <p className="text-xs text-text-secondary">
                {isVi
                  ? 'Thử thay đổi từ khóa tìm kiếm hoặc chuyển sang bộ lọc khác.'
                  : 'Try changing your search keywords or filters.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isFavorite={isInWishlist(course.id)}
                  isMenuOpen={activeMenuId === course.id}
                  onToggleMenu={toggleMenu}
                  onToggleWishlist={toggleWishlist}
                  onClick={(id) => navigate(`/course/${id}`)}
                  onCloseMenu={() => setActiveMenuId(null)}
                />
              ))}
            </div>
          )}
        </main>

        {showScheduleModal && (
          <CourseScheduleModal
            onClose={() => setShowScheduleModal(false)}
            onSave={() => {
              setShowScheduleModal(false)
              setShowScheduleBanner(false)
            }}
          />
        )}
      </div>
    </Layout>
  )
}
