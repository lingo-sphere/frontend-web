'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@/lib/navigation'
import {
  Flame,
  Clock,
  MoreVertical,
  Star,
  Search,
  BookOpen,
  Heart,
  Archive,
  ListPlus,
  Share2,
  Calendar,
  Sparkles,
  Info,
  CheckCircle2,
  X,
  Play,
} from 'lucide-react'

import { Layout } from '@/components/layout/Layout'
import { courseService } from '@/services/course.service'
import type { Course } from '@/types/api.types'

export interface CourseCardData {
  id: string
  slug?: string
  title: string
  instructor: string
  thumbnail: string
  category: string
  level: string
  description: string
  duration: string
  totalLessons: number
  chapters: number
  students: number
  rating: number
  ratingCount: number
  price: number
  discountPrice?: number
  targetScore?: number
  badge?: string
  progress?: number
  hasCertificate?: boolean
  isArchived?: boolean
}

type TabType = 'all' | 'my-lists' | 'wishlist' | 'certifications' | 'archived' | 'learning-tools'

export default function CoursesCatalogPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<TabType>('all')
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
            const durationHrs = Math.max(1, Math.round((Number(raw.total_duration_minutes) || (Number(raw.total_lessons) || 0) * 15 || 60) / 60))
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
              instructor: String(raw.author_name || raw.instructor_name || 'LingoSphere Academic Team'),
              thumbnail: c.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
              category: c.category || 'TOEIC_2_SKILLS',
              level: levelDisplay,
              description: c.description || '',
              duration: `${durationHrs} giờ`,
              totalLessons: Number(c.total_lessons) || 0,
              chapters: Number(raw.total_modules) || (Array.isArray(c.chapters) ? c.chapters.length : 0),
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

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory

    if (activeTab === 'wishlist') return matchesSearch && wishlist.includes(c.id)
    if (activeTab === 'certifications') return matchesSearch && c.hasCertificate && c.progress === 100
    if (activeTab === 'archived') return matchesSearch && c.isArchived

    return matchesSearch && matchesCategory
  })

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
    setActiveMenuId(null)
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background text-text-primary">
        <div className="w-full bg-[#1c1d1f] text-white pt-8 pb-0 px-4 sm:px-8 lg:px-12 border-b border-white/10">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-serif">
                {isVi ? 'Khóa học của tôi' : 'My learning'}
              </h1>
              <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{courses.length} Khóa học trực tuyến</span>
              </div>
            </div>

            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar border-b border-white/10 text-xs font-bold tracking-wide">
              {[
                { id: 'all', labelVi: 'Tất cả khóa học', labelEn: 'All courses' },
                { id: 'my-lists', labelVi: 'Danh sách của tôi', labelEn: 'My Lists' },
                { id: 'wishlist', labelVi: 'Yêu thích', labelEn: 'Wishlist' },
                { id: 'certifications', labelVi: 'Chứng chỉ', labelEn: 'Certifications' },
                { id: 'archived', labelVi: 'Đã lưu trữ', labelEn: 'Archived' },
                { id: 'learning-tools', labelVi: 'Công cụ học tập', labelEn: 'Learning tools' },
              ].map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`pb-3.5 transition-all whitespace-nowrap relative cursor-pointer ${
                      isActive
                        ? 'text-white border-b-2 border-white font-extrabold'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {isVi ? tab.labelVi : tab.labelEn}
                    {tab.id === 'wishlist' && wishlist.length > 0 && (
                      <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.2 text-[10px] text-white">
                        {wishlist.length}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:px-12 space-y-8">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <h2 className="text-base sm:text-lg font-bold text-text-primary flex items-center gap-2">
                  <Sparkles className="text-primary" size={18} />
                  {isVi ? 'Bắt đầu chuỗi học tập mới' : 'Start a new streak'}
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary">
                  {isVi
                    ? 'Thêm thời gian học vào lịch mỗi tuần để duy trì phản xạ tiếng Anh.'
                    : 'Add some learning time to your calendar each week.'}
                </p>
              </div>

              <div className="flex items-center gap-8 self-start md:self-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-streak-soft text-streak">
                    <Flame size={22} className="animate-bounce" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-text-primary">
                      {isVi ? '0 tuần' : '0 weeks'}
                    </div>
                    <div className="text-[11px] font-medium text-text-tertiary">
                      {isVi ? 'Chuỗi hiện tại' : 'Current streak'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-l border-border pl-6">
                  <div className="relative flex h-11 w-11 items-center justify-center">
                    <svg className="h-11 w-11 -rotate-90 transform" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15" fill="none" className="stroke-surface-subtle" strokeWidth="3" />
                      <circle
                        cx="18"
                        cy="18"
                        r="15"
                        fill="none"
                        className="stroke-primary transition-all duration-1000"
                        strokeWidth="3.5"
                        strokeDasharray="94.2"
                        strokeDashoffset="75.3"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-primary">20%</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                      <span>0/30 phút học tuần này</span>
                      <Info size={13} className="text-text-tertiary cursor-help" />
                    </div>
                    <div className="text-[11px] text-text-tertiary flex items-center gap-1.5 mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>1/1 lần truy cập • Tuần 23 - 29 Th8</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {showScheduleBanner && (
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary mt-0.5">
                  <Clock size={22} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm sm:text-base font-bold text-text-primary">
                    {isVi ? 'Lên lịch học tập hàng ngày' : 'Schedule learning time'}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-3xl">
                    {isVi
                      ? 'Học một chút mỗi ngày tạo nên sự khác biệt lớn. Nghiên cứu não bộ chỉ ra rằng học viên duy trì thói quen học ngắt quãng đạt điểm TOEIC cao hơn 68%. Hãy đặt lịch và nhận thông báo nhắc học thông minh.'
                      : 'Learning a little each day adds up. Research shows that students who make learning a habit are more likely to reach their goals. Set time aside to learn and get reminders using your learning scheduler.'}
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setShowScheduleModal(true)}
                      className="rounded-xl border border-border bg-surface px-5 py-2 text-xs font-bold text-text-primary hover:bg-surface-hover hover:border-primary transition-all cursor-pointer shadow-sm"
                    >
                      {isVi ? 'Bắt đầu lên lịch' : 'Get started'}
                    </button>
                    <button
                      onClick={() => setShowScheduleBanner(false)}
                      className="text-xs font-semibold text-text-tertiary hover:text-text-primary transition-colors cursor-pointer px-2 py-1"
                    >
                      {isVi ? 'Bỏ qua' : 'Dismiss'}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowScheduleBanner(false)}
                className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary transition-colors"
                title="Đóng"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
              <input
                type="text"
                placeholder={isVi ? 'Tìm kiếm trong khóa học...' : 'Search my courses...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-xs sm:text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'all', label: isVi ? 'Tất cả' : 'All' },
                { id: 'TOEIC_2_SKILLS', label: isVi ? 'TOEIC 2 Kỹ Năng' : 'TOEIC 2 Skills' },
                { id: 'TOEIC_4_SKILLS', label: isVi ? 'TOEIC 4 Kỹ Năng' : 'TOEIC 4 Skills' },
              ].map((cat) => {
                const isSelected = selectedCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-white shadow-sm font-bold'
                        : 'border border-border bg-surface text-text-secondary hover:border-text-tertiary hover:text-text-primary'
                    }`}
                  >
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 rounded-none bg-surface animate-pulse border border-border" />
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="py-20 text-center rounded-none border border-dashed border-border bg-surface/50 space-y-3">
              <BookOpen className="mx-auto text-text-tertiary" size={40} />
              <h3 className="text-base font-bold text-text-primary">
                {isVi ? 'Không tìm thấy khóa học phù hợp' : 'No courses found'}
              </h3>
              <p className="text-xs text-text-secondary">
                {isVi ? 'Thử thay đổi từ khóa tìm kiếm hoặc chuyển sang bộ lọc khác.' : 'Try changing your search keywords or filters.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
              {filteredCourses.map((course) => {
                const isMenuOpen = activeMenuId === course.id
                const isFav = wishlist.includes(course.id)

                return (
                  <div
                    key={course.id}
                    onClick={() => navigate(`/course/${course.id}`)}
                    className="group relative flex flex-col justify-between rounded-none border border-border bg-surface overflow-hidden shadow-sm transition-shadow duration-200 hover:shadow-md cursor-pointer"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-black/5">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="h-full w-full object-cover"
                      />

                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#2d2f31] shadow-xl">
                          <Play size={20} className="ml-1 fill-[#2d2f31]" />
                        </div>
                      </div>

                      {course.badge && (
                        <span className="absolute left-2 top-2 rounded-none bg-[#eceb98] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#3d3c0a] shadow-sm">
                          {course.badge}
                        </span>
                      )}

                      <div className="absolute right-2 top-2 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveMenuId(isMenuOpen ? null : course.id)
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-none bg-black/70 text-white backdrop-blur-sm hover:bg-black transition-colors"
                          title="Tùy chọn"
                        >
                          <MoreVertical size={14} />
                        </button>

                        {isMenuOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-8 w-44 rounded-none border border-border bg-surface p-1.5 shadow-xl z-20 space-y-1 text-xs text-text-primary animate-in fade-in duration-150"
                          >
                            <button
                              onClick={(e) => toggleWishlist(course.id, e)}
                              className="flex w-full items-center gap-2 rounded-none px-2.5 py-1.5 hover:bg-surface-hover transition-colors text-left"
                            >
                              <Heart size={13} className={isFav ? 'text-red-500 fill-red-500' : ''} />
                              <span>{isFav ? 'Bỏ yêu thích' : 'Thêm yêu thích'}</span>
                            </button>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(window.location.origin + `/course/${course.id}`)
                                setActiveMenuId(null)
                              }}
                              className="flex w-full items-center gap-2 rounded-none px-2.5 py-1.5 hover:bg-surface-hover transition-colors text-left"
                            >
                              <Share2 size={13} />
                              <span>Chia sẻ khóa học</span>
                            </button>
                            <button
                              onClick={() => setActiveMenuId(null)}
                              className="flex w-full items-center gap-2 rounded-none px-2.5 py-1.5 hover:bg-surface-hover transition-colors text-left"
                            >
                              <ListPlus size={13} />
                              <span>Tạo danh sách mới</span>
                            </button>
                            <button
                              onClick={() => setActiveMenuId(null)}
                              className="flex w-full items-center gap-2 rounded-none px-2.5 py-1.5 hover:bg-surface-hover transition-colors text-left text-text-tertiary"
                            >
                              <Archive size={13} />
                              <span>Lưu trữ</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-4 space-y-2">
                      <h3 className="line-clamp-2 text-sm font-bold text-text-primary group-hover:text-primary transition-colors leading-snug">
                        {course.title}
                      </h3>
                      <div className="text-xs text-text-tertiary line-clamp-1">
                        {course.instructor}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-text-secondary pt-1">
                        <span className="font-extrabold text-warning">{course.rating.toFixed(1)}</span>
                        <div className="flex items-center text-warning">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={11} fill="currentColor" />
                          ))}
                        </div>
                        <span className="text-[11px] text-text-tertiary">({course.ratingCount.toLocaleString('en-US')})</span>
                      </div>
                    </div>

                    <div className="border-t border-border/60 p-4 pt-3 space-y-2 bg-surface-subtle/20">
                      {course.progress === 100 ? (
                        <div>
                          <div className="h-1.5 w-full rounded-none bg-primary/20 overflow-hidden mb-1.5">
                            <div className="h-full w-full bg-primary rounded-none" />
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-text-secondary font-medium">
                            <span className="text-primary font-bold flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              100% hoàn thành
                            </span>
                            <span className="text-text-tertiary hover:text-primary transition-colors font-semibold">
                              Đánh giá ★
                            </span>
                          </div>
                        </div>
                      ) : (course.progress ?? 0) > 0 ? (
                        <div>
                          <div className="h-1.5 w-full rounded-none bg-surface-subtle overflow-hidden mb-1.5">
                            <div
                              className="h-full bg-primary rounded-none transition-all duration-500"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-text-secondary font-medium">
                            <span>{course.progress}% hoàn thành</span>
                            <span className="text-primary font-bold">Học tiếp →</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-xs font-bold text-primary pt-0.5">
                          <span className="uppercase tracking-wider text-[11px]">Bắt đầu khóa học</span>
                          <span>→</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>

        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Calendar size={18} />
                  </div>
                  <h3 className="text-base font-bold text-text-primary">Lên lịch nhắc học tập</h3>
                </div>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs text-text-secondary">
                <p>Chọn khung giờ và những ngày bạn muốn LingoSphere gửi thông báo nhắc nhở:</p>
                <div className="grid grid-cols-4 gap-2 text-center font-bold">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
                    <button
                      key={day}
                      className="rounded-xl border border-border p-2.5 hover:border-primary hover:text-primary transition-colors"
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <div className="pt-2">
                  <label className="block font-bold text-text-primary mb-1">Khung giờ nhắc nhở:</label>
                  <input
                    type="time"
                    defaultValue="20:00"
                    className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-text-secondary hover:bg-surface-hover transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    setShowScheduleModal(false)
                    setShowScheduleBanner(false)
                  }}
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary-hover transition-colors shadow-sm"
                >
                  Lưu lịch nhắc học
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
