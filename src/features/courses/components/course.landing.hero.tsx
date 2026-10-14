// Component hero banner hien thi tieu de, danh gia, hoc vien va giang vien khoa hoc phong cach Udemy.
'use client'

import { Star, Users, Clock, Globe, Award, Sparkles, ChevronRight } from 'lucide-react'
import type { Course } from '@/features/courses/types/course'

interface CourseLandingHeroProps {
  course: Course
  onBack: () => void
}

export function CourseLandingHero({ course, onBack }: CourseLandingHeroProps) {
  const ratingValue = Number(course.rating || 5.0).toFixed(1)
  const ratingCount = course.ratingCount ?? 0
  const studentsCount = course.studentsCount ?? 0
  const instructorName = course.instructor?.name || 'Đội ngũ Giảng viên LingoSphere'
  const categoryName = course.category || 'TOEIC Chuẩn Quốc Tế'
  const updatedDate = course.updatedAt
    ? new Date(course.updatedAt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
    : 'Tháng 6/2026'

  return (
    <div className="w-full bg-slate-900 dark:bg-slate-950 text-slate-100 py-8 lg:py-12 border-b border-slate-800">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="lg:w-7/12 space-y-4">
          <nav className="flex items-center gap-1.5 text-xs text-indigo-300 font-semibold flex-wrap">
            <button
              type="button"
              onClick={onBack}
              className="hover:underline cursor-pointer transition-colors"
            >
              Khóa học
            </button>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            <span className="hover:underline cursor-pointer">{categoryName}</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            <span className="text-slate-400 truncate max-w-[200px] sm:max-w-xs">{course.title}</span>
          </nav>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              {course.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              {course.description ||
                'Chinh phục mục tiêu tiếng Anh và bài thi chuẩn quốc tế với lộ trình bài bản, thực chiến từ cơ bản đến nâng cao cùng LingoSphere.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {course.is_bestseller ? (
              <span className="px-2.5 py-1 rounded-md bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-xs">
                Bán chạy nhất
              </span>
            ) : null}
            {course.target_score ? (
              <span className="px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-bold">
                🎯 Mục tiêu: {course.target_score}+ TOEIC
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300 pt-1">
            <div className="flex items-center gap-1.5 text-amber-400">
              <span className="font-black text-sm text-amber-300">{ratingValue}</span>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < Math.round(Number(ratingValue)) ? 'currentColor' : 'none'}
                    className={i < Math.round(Number(ratingValue)) ? 'text-amber-400' : 'text-slate-600'}
                  />
                ))}
              </div>
              <span className="text-indigo-300 underline cursor-pointer">
                {ratingCount > 0
                  ? `(${ratingCount.toLocaleString('vi-VN')} xếp hạng)`
                  : '(Chưa có xếp hạng)'}
              </span>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <Users size={14} className="text-indigo-400" />
              <span>{studentsCount.toLocaleString('vi-VN')} học viên</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
            <div>
              Được tạo bởi{' '}
              <span className="text-indigo-300 font-bold underline cursor-pointer">
                {instructorName}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Clock size={13} className="text-slate-400" />
              <span>Cập nhật gần đây nhất {updatedDate}</span>
            </div>

            <div className="flex items-center gap-1">
              <Globe size={13} className="text-slate-400" />
              <span>Tiếng Việt</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
