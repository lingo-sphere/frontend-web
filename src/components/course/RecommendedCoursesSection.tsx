'use client'

/**
 * @file RecommendedCoursesSection.tsx
 * @description Thành phần gợi ý khóa học thông minh dựa trên điểm số đánh giá đầu vào của học viên
 */

import React, { useMemo } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  BookOpen,
  Award,
  Users,
  Clock,
  Star,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react'

interface CourseItem {
  id: string
  title: string
  slug?: string
  description?: string
  thumbnail?: string
  target_score?: number
  min_score?: number
  max_score?: number
  level?: string
  price?: number
  students_count?: number
  rating?: number
  duration_hours?: number
  tags?: string[]
}

interface RecommendedCoursesSectionProps {
  currentScore?: number
  targetScore?: number
  courses?: CourseItem[]
}

const DEFAULT_RECOMMENDED_COURSES: CourseItem[] = [
  {
    id: 'course_toeic_foundation',
    title: 'TOEIC Foundation: Lấy Lại Gốc & Nền Tảng 450+ TOEIC Toàn Diện',
    description: 'Xây dựng nền tảng từ vựng 1000 từ cốt lõi, phát âm chuẩn IPA và 12 chủ điểm ngữ pháp TOEIC.',
    thumbnail: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&auto=format&fit=crop&q=80',
    min_score: 0,
    max_score: 450,
    target_score: 450,
    level: 'BEGINNER',
    price: 499000,
    students_count: 3240,
    rating: 4.9,
    duration_hours: 36,
    tags: ['Nền tảng', 'Phát âm', 'Từ vựng 1000 từ'],
  },
  {
    id: 'course_toeic_intermediate_650',
    title: 'TOEIC Breakthrough: Bứt Phá Mục Tiêu 650+ Listening & Reading',
    description: 'Chinh phục bẫy đề thi ETS mới nhất, tối ưu tốc độ đọc Part 7 và kỹ năng bắt key Part 3, 4.',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
    min_score: 400,
    max_score: 650,
    target_score: 650,
    level: 'INTERMEDIATE',
    price: 799000,
    students_count: 5120,
    rating: 4.95,
    duration_hours: 48,
    tags: ['Chiến thuật bẫy', 'Tốc độ Part 7', 'Listening Key'],
  },
  {
    id: 'course_toeic_master_850',
    title: 'TOEIC Master: Luyện Đề Thực Chiến & Chinh Phục Điểm Cao 850 - 990',
    description: 'Bộ 20 đề thi thật ETS tuyển chọn, phân tích chi tiết bẫy từ vựng cao cấp và phản xạ tự nhiên.',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    min_score: 650,
    max_score: 990,
    target_score: 850,
    level: 'ADVANCED',
    price: 999000,
    students_count: 2890,
    rating: 4.98,
    duration_hours: 60,
    tags: ['Luyện đề ETS', 'Từ vựng C1/C2', 'Điểm tuyệt đối'],
  },
  {
    id: 'course_toeic_4skills_sw',
    title: 'TOEIC Speaking & Writing: Giao Tiếp & Soạn Thảo Thương Mại Chuyên Nghiệp',
    description: 'Luyện phản xạ nói lưu loát Part 1-5 và viết email, báo cáo chuẩn văn phong quốc tế.',
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
    min_score: 500,
    max_score: 990,
    target_score: 350,
    level: 'INTERMEDIATE',
    price: 899000,
    students_count: 1840,
    rating: 4.92,
    duration_hours: 40,
    tags: ['Speaking & Writing', 'Email thương mại', 'Phản xạ'],
  },
]

function formatNumber(val?: number): string {
  if (val === undefined || val === null) return '0'
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function RecommendedCoursesSection({
  currentScore = 550,
  targetScore = 750,
  courses = DEFAULT_RECOMMENDED_COURSES,
}: RecommendedCoursesSectionProps) {
  const recommendedList = useMemo(() => {
    return courses.map((course) => {
      // Calculate match percentage based on score alignment
      let matchRate = 85
      const min = course.min_score ?? 0
      const max = course.max_score ?? 990

      if (currentScore >= min && currentScore <= max) {
        matchRate = 98
      } else if (currentScore < min && currentScore >= min - 100) {
        matchRate = 90
      } else {
        matchRate = 82
      }

      return {
        ...course,
        matchRate,
      }
    }).sort((a, b) => b.matchRate - a.matchRate)
  }, [courses, currentScore])

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Gợi Ý Dành Riêng Cho Bạn</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Khóa Học Phù Hợp Với Trình Độ ({currentScore} Điểm)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Dựa trên kết quả bài test đầu vào và mục tiêu {targetScore} điểm của bạn
          </p>
        </div>

        <Link
          href="/courses"
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Xem tất cả khóa học</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {recommendedList.slice(0, 3).map((course, idx) => (
          <div
            key={course.id || idx}
            className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative"
          >
            {/* Top Match Badge */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-extrabold border border-white/20 shadow-lg">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Phù hợp {course.matchRate}%</span>
              </div>
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                Mục tiêu {course.target_score}+
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {course.tags?.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {course.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span suppressHydrationWarning>{formatNumber(course.students_count)} học viên</span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{course.rating || 4.9}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div suppressHydrationWarning className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                    {course.price ? `${formatNumber(course.price)} đ` : 'Miễn phí'}
                  </div>

                  <Link
                    href={`/course/${course.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 dark:bg-slate-100 dark:hover:bg-indigo-500 text-white dark:text-slate-900 dark:hover:text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <span>Khám phá</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
