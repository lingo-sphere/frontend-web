// Trang tong quan va gioi thieu chi tiet khoa hoc cho hoc vien chua dang ky phong cach Udemy.
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
  ShoppingCart,
  BookOpen,
  ArrowLeft,
  Sparkles,
} from 'lucide-react'
import type { Course, Lesson } from '@/features/courses/types/course'
import { CourseLandingHero } from '@/features/courses/components/course.landing.hero'
import { CourseLandingPurchaseCard } from '@/features/courses/components/course.landing.purchase.card'
import { CourseLandingCurriculum } from '@/features/courses/components/course.landing.curriculum'
import { CourseLandingInstructor } from '@/features/courses/components/course.landing.instructor'
import { CourseLandingPreviewModal } from '@/features/courses/components/course.landing.preview.modal'

interface CourseLandingViewProps {
  course: Course
  onEnrollOrBuy: () => void
  onAddToCart: () => void
  isInCart: boolean
  isAddingToCart: boolean
  isAuthenticated?: boolean
  userName?: string
  userAvatar?: string
}

export function CourseLandingView({
  course,
  onEnrollOrBuy,
  onAddToCart,
  isInCart,
  isAddingToCart,
  isAuthenticated = false,
  userName,
  userAvatar,
}: CourseLandingViewProps) {
  const router = useRouter()
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null)
  const [isDescExpanded, setIsDescExpanded] = useState(false)

  const defaultLearningOutcomes = [
    `Nắm vững toàn diện cấu trúc bài thi và bẫy thường gặp của bài thi ${course.level || 'TOEIC'}`,
    'Làm chủ hơn 1.200+ từ vựng học thuật & cụm diễn đạt thực chiến theo từng chủ đề',
    'Tối ưu hóa tốc độ làm bài với phương pháp quản lý thời gian độc quyền của LingoSphere',
    'Thực hành phản xạ với ngân hàng đề thi mô phỏng định dạng chuẩn mới nhất',
    'Tự tin đạt mục tiêu điểm số cam kết đầu ra ngay sau khi hoàn thành khóa học',
    'Nhận phân tích điểm mạnh, điểm yếu và gợi ý luyện tập cá nhân hóa qua từng chặng học',
  ]

  const learningOutcomes =
    course.whatYouWillLearn && course.whatYouWillLearn.length > 0
      ? course.whatYouWillLearn
      : course.overview?.whatYouWillLearn && course.overview.whatYouWillLearn.length > 0
      ? course.overview.whatYouWillLearn
      : defaultLearningOutcomes

  const requirements = course.overview?.requirements || [
    'Máy tính để bàn, laptop hoặc điện thoại thông minh có kết nối Internet ổn định.',
    'Tai nghe phục vụ tốt cho các bài luyện nghe Listening và phát âm Speaking.',
    'Sự kiên trì, cam kết dành tối thiểu 45-60 phút mỗi ngày để theo sát lộ trình khóa học.',
  ]

  const firstPreviewLesson =
    course.chapters?.[0]?.lessons?.[0] ||
    ({
      id: 'preview-default',
      chapterId: course.chapters?.[0]?.id || 'ch-1',
      order: 1,
      title: `${course.title} - Bài giảng giới thiệu & định hướng lộ trình`,
      type: 'video',
      duration: 360,
      status: 'available',
      progress: 0,
      videoUrl: course.chapters?.[0]?.lessons?.[0]?.videoUrl,
      content: { sections: [] },
    } as Lesson)

  const handleOpenGeneralPreview = () => {
    setPreviewLesson(firstPreviewLesson)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push('/courses')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Khám phá các khóa học</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/cart')}
            className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Giỏ hàng của bạn"
          >
            <ShoppingCart className="w-5 h-5" />
            {isInCart && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
            )}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
              {userAvatar && userAvatar.trim() !== '' ? (
                <img
                  src={userAvatar}
                  alt={userName || 'User'}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  {(userName || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden sm:inline text-xs font-semibold text-slate-200">
                {userName || 'Học viên'}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('lingosphere:open-auth-modal'))}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Đăng nhập
            </button>
          )}
        </div>
      </header>

      <CourseLandingHero
        course={course}
        onBack={() => router.push('/courses')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-10 order-2 lg:order-1">
            <section className="rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Bạn sẽ học được gì
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {learningOutcomes.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Nội dung khóa học
              </h2>
              <CourseLandingCurriculum
                chapters={course.chapters || []}
                totalLessons={course.totalLessons || 0}
                totalDuration={course.duration || '24 giờ'}
                onOpenPreviewLesson={(lesson) => setPreviewLesson(lesson)}
              />
            </section>

            <section className="space-y-4 pt-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Yêu cầu
              </h2>
              <ul className="space-y-2.5">
                {requirements.map((req, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-4 pt-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Mô tả khóa học
              </h2>
              <div className="relative">
                <div
                  className={`text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3 transition-all ${
                    !isDescExpanded ? 'max-h-48 overflow-hidden mask-fade-bottom' : ''
                  }`}
                >
                  <p>
                    {course.description ||
                      'Khóa học được thiết kế chuyên biệt nhằm giúp học viên nắm vững kiến thức ngữ pháp, từ vựng và chiến thuật xử lý các dạng bài thi tiếng Anh chuẩn quốc tế. Từng bài học được chia nhỏ thành các chặng thực hành cô đọng, dễ hiểu, kết hợp các bài mini test và thử thách chặng giúp người học củng cố kiến thức ngay lập tức.'}
                  </p>
                  <p>
                    Khóa học bao gồm hệ thống bài giảng video chất lượng cao, tài liệu độc quyền, bài tập trắc nghiệm có giải thích chi tiết đáp án và hệ thống mô phỏng đề thi bấm giờ thực tế.
                  </p>
                  <p>
                    Học viên sẽ được hỗ trợ giải đáp thắc mắc liên tục từ đội ngũ giảng viên và trợ giảng qua mục Q&A của từng bài học, đồng thời được theo dõi biểu đồ tiến độ học tập chi tiết theo từng ngày.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="mt-3 text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  <span>{isDescExpanded ? 'Thu gọn' : 'Xem thêm'}</span>
                  {isDescExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </section>

            <CourseLandingInstructor
              instructor={course.instructor}
              reviews={course.reviews}
              rating={course.rating}
              ratingCount={course.ratingCount}
            />
          </div>

          <div className="lg:col-span-4 lg:-mt-72 relative z-20 order-1 lg:order-2">
            <CourseLandingPurchaseCard
              course={course}
              onEnrollOrBuy={onEnrollOrBuy}
              onAddToCart={onAddToCart}
              onOpenPreview={handleOpenGeneralPreview}
              isInCart={isInCart}
              isAddingToCart={isAddingToCart}
            />
          </div>
        </div>
      </div>

      <CourseLandingPreviewModal
        open={Boolean(previewLesson)}
        onClose={() => setPreviewLesson(null)}
        lesson={previewLesson}
        courseTitle={course.title}
        coursePrice={course.discount_price || course.price}
        onBuyNow={onEnrollOrBuy}
      />
    </div>
  )
}
