'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@/lib/navigation'
import { BookOpen } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { courseService } from '@/services/course.service'
import type { Course } from '@/types/api.types'
import type { CourseCardData, CourseTabType } from '@/types/course'
import { CourseCatalogHeader } from '@/components/course/CourseCatalogHeader'
import { CourseSearchBar } from '@/components/course/CourseSearchBar'
import { CourseScheduleBanner } from '@/components/course/CourseScheduleBanner'
import { CourseScheduleModal } from '@/components/course/CourseScheduleModal'
import { CourseCard } from '@/components/course/CourseCard'

export default function CoursesCatalogPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<CourseTabType>('all')
  const [courses, setCourses] = useState<CourseCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showScheduleBanner, setShowScheduleBanner] = useState(true)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [wishlist, setWishlist] = useState<string[]>([])

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

            return {
              id: String(c.id || raw._id || c.slug || ''),
              slug: c.slug,
              title: c.title,
              instructor: String(
                raw.author_name || raw.instructor_name || 'LingoSphere Academic Team'
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
              students: Number(raw.enrollments) || 0,
              rating: Number(raw.rating_avg) || 5.0,
              ratingCount: Number(raw.rating_count) || 0,
              price: Number(raw.price) || 0,
              discountPrice: Number(raw.discount_price) || 0,
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

      if (activeTab === 'wishlist') return matchesSearch && wishlist.includes(c.id)
      if (activeTab === 'certifications')
        return matchesSearch && c.hasCertificate && c.progress === 100
      if (activeTab === 'archived') return matchesSearch && c.isArchived

      return matchesSearch && matchesCategory
    })
  }, [courses, searchQuery, selectedCategory, activeTab, wishlist])

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
    setActiveMenuId(null)
  }

  const toggleMenu = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveMenuId((prev) => (prev === courseId ? null : courseId))
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background text-text-primary">
        <CourseCatalogHeader
          totalCourses={courses.length}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          wishlistCount={wishlist.length}
        />

        <main className="w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
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
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-80 rounded-none bg-surface animate-pulse border border-border"
                />
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="py-20 text-center rounded-none border border-dashed border-border bg-surface/50 space-y-3">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 items-stretch">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isFavorite={wishlist.includes(course.id)}
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
