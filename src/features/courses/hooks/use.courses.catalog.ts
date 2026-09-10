// Custom hook quản lý danh sách khóa học, lọc theo danh mục, lịch học và wishlist
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from '@/lib/navigation'
import { courseService } from '@/features/courses/services/course.service'
import { userService } from '@/features/user/services/user.service'
import type { Course } from '@/types/api.types'
import type { CourseCardData, CourseTabType } from '@/features/courses/types/course'
import type { UserScheduleData } from '@/features/courses/components/course.schedule.banner'
import { useWishlistStore } from '@/features/cart/store/wishlist.store'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useEnrollmentStore } from '@/features/courses/store/enrollment.store'
import { toast } from '@/store/toast.store'
import { storage, STORAGE_KEYS } from '@/lib/storage'

export function useCoursesCatalog() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const searchParams = useSearchParams()
  const { items: wishlistItems, toggleItem, isInWishlist, fetchWishlist } = useWishlistStore()
  const { isAuthenticated, user } = useAuthStore()
  const isEnrolled = useEnrollmentStore((state) => state.isEnrolled)
  const enrolledCourseIds = useEnrollmentStore((state) => state.enrolledCourseIds)

  const tabParam = searchParams.get('tab')
  const activeTab: CourseTabType =
    tabParam === 'my-courses' ? 'my-courses' : tabParam === 'wishlist' ? 'wishlist' : 'all'

  const [courses, setCourses] = useState<CourseCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  const [showScheduleBanner, setShowScheduleBanner] = useState<boolean>(true)
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false)
  const [userSchedule, setUserSchedule] = useState<UserScheduleData | null>(null)

  useEffect(() => {
    const dismissedUntil = storage.get<string>(STORAGE_KEYS.BANNER_DISMISSED)
    if (dismissedUntil) {
      const untilTime = parseInt(dismissedUntil, 10)
      if (Date.now() < untilTime) {
        setShowScheduleBanner(false)
      }
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      userService
        .getMySettings()
        .then((settings) => {
          if (settings) {
            setUserSchedule({
              reminder_time: (settings.reminder_time as string) || '20:00',
              reminder_days: (settings.reminder_days as string[]) || [
                'T2',
                'T3',
                'T4',
                'T5',
                'T6',
                'T7',
                'CN',
              ],
              is_reminder_enabled: Boolean(settings.is_reminder_enabled),
              study_duration_minutes: (settings.study_duration_minutes as number) || 30,
              is_email_notification_enabled: Boolean(
                settings.is_email_notification_enabled ?? true
              ),
            })
          }
        })
        .catch(() => {})
    } else {
      setUserSchedule(null)
    }
  }, [isAuthenticated])

  const handleDismissScheduleBanner = () => {
    setShowScheduleBanner(false)
    const twoHoursLater = Date.now() + 2 * 60 * 60 * 1000
    storage.set(STORAGE_KEYS.BANNER_DISMISSED, twoHoursLater.toString())
  }

  const handleOpenScheduleModal = () => {
    if (!isAuthenticated) {
      toast.warning(
        isVi
          ? 'Vui lòng đăng nhập để sử dụng tính năng lên lịch học!'
          : 'Please sign in to schedule study reminders!',
        isVi ? 'Yêu cầu đăng nhập' : 'Authentication required'
      )
      return
    }
    setShowScheduleModal(true)
  }

  const handleCancelScheduleFromBanner = async () => {
    try {
      await userService.updateMySettings({ is_reminder_enabled: false })
      setUserSchedule((prev) => (prev ? { ...prev, is_reminder_enabled: false } : null))
      toast.info(
        isVi ? 'Đã hủy lịch gửi mail nhắc học thành công.' : 'Cancelled study reminder schedule.',
        isVi ? 'Lịch học' : 'Study Schedule'
      )
    } catch {
      toast.error(
        isVi ? 'Không thể hủy lịch nhắc nhở lúc này.' : 'Failed to cancel schedule.',
        isVi ? 'Lỗi' : 'Error'
      )
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist()
      useEnrollmentStore.getState().fetchMyEnrollments()
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

      if (activeTab === 'wishlist') {
        if (!isAuthenticated) return false
        return matchesSearch && isInWishlist(c.id)
      }
      if (activeTab === 'my-courses') {
        if (!isAuthenticated) return false
        const hasAccess =
          isEnrolled(c.id) ||
          (c.slug ? isEnrolled(c.slug) : false) ||
          Boolean(user?.is_premium) ||
          user?.role === 'ADMIN' ||
          user?.role === 'INSTRUCTOR'
        return matchesSearch && hasAccess
      }

      return matchesSearch && matchesCategory
    })
  }, [
    courses,
    searchQuery,
    selectedCategory,
    activeTab,
    wishlistItems,
    isInWishlist,
    enrolledCourseIds,
    isAuthenticated,
    isEnrolled,
    user,
  ])

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

  return {
    isVi,
    activeTab,
    courses,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    activeMenuId,
    setActiveMenuId,
    showScheduleBanner,
    showScheduleModal,
    setShowScheduleModal,
    userSchedule,
    setUserSchedule,
    handleDismissScheduleBanner,
    handleOpenScheduleModal,
    handleCancelScheduleFromBanner,
    filteredCourses,
    toggleWishlist,
    toggleMenu,
    isAuthenticated,
    isInWishlist,
  }
}
