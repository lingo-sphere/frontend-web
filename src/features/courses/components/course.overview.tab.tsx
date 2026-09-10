/**
 * @file course.overview.tab.tsx
 * @description Component giao diện React CourseOverviewTab hiển thị thông tin chi tiết khóa học và giảng viên
 */

'use client'

import { Award, Check, Clock, Star, Users, User } from 'lucide-react'
import type { Course } from '@/features/courses/types/course'

interface CourseOverviewTabProps {
  course: Course
}

export function CourseOverviewTab({ course }: CourseOverviewTabProps) {
  const ratingValue = Number(course.rating || 5).toFixed(1)
  const ratingCount = course.ratingCount || 0
  const studentsCount = course.studentsCount || 0
  const duration = course.duration || '0 giây'

  const objectives =
    course.whatYouWillLearn ||
    course.overview?.whatYouWillLearn || [
      'Nắm vững toàn bộ kiến thức trọng tâm của khóa học.',
      'Cải thiện và nâng cao phản xạ ngôn ngữ thực tế.',
      'Luyện tập qua các bài giảng video và bài tập kiểm tra chuyên sâu.',
      'Đạt chuẩn mục tiêu điểm số và trình độ mong muốn.',
    ]

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      <div className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary leading-snug">
          {course.title}
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          {course.description || 'Khóa học cung cấp kiến thức nền tảng và chuyên sâu giúp học viên tiến bộ nhanh chóng.'}
        </p>

        
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-text-secondary pt-2">
          <div className="flex items-center gap-1.5 text-warning">
            <span className="font-extrabold text-sm">{ratingValue}</span>
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  fill={i < Math.round(Number(ratingValue)) ? 'currentColor' : 'none'}
                  className={i < Math.round(Number(ratingValue)) ? 'text-warning' : 'text-text-tertiary/40'}
                />
              ))}
            </div>
            <span className="text-text-tertiary">
              ({ratingCount.toLocaleString('vi-VN')} đánh giá)
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-text-secondary">
            <Users size={14} className="text-primary" />
            <span>{studentsCount.toLocaleString('vi-VN')} học viên đã đăng ký</span>
          </div>

          <div className="flex items-center gap-1.5 text-text-secondary">
            <Clock size={14} className="text-primary" />
            <span>{duration} tổng thời lượng</span>
          </div>
        </div>
      </div>

      
      <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-sm">
        <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
          <Award className="text-primary" size={18} />
          <span>Mục tiêu kiến thức đạt được trong khóa học</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {objectives.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-text-secondary leading-relaxed">
              <Check className="text-primary shrink-0 mt-0.5" size={15} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      
      {course.instructor && (
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-text-primary">Giảng viên hướng dẫn</h3>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {course.instructor.avatar ? (
              <img
                src={course.instructor.avatar}
                alt={course.instructor.name}
                className="h-16 w-16 rounded-2xl object-cover border border-border shadow-xs"
              />
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
                {course.instructor.name?.charAt(0)?.toUpperCase() || <User size={24} />}
              </div>
            )}

            <div className="space-y-1.5 flex-1">
              <div className="text-sm font-bold text-text-primary">{course.instructor.name}</div>
              <div className="text-xs text-primary font-medium">{course.instructor.title}</div>
              <div className="flex items-center gap-4 text-[11px] text-text-tertiary pt-1">
                <span className="flex items-center gap-1 font-bold text-warning">
                  <Star size={12} fill="currentColor" />
                  {ratingValue} Đánh giá
                </span>
                <span>{studentsCount.toLocaleString('vi-VN')} Học viên</span>
                <span>{course.instructor.coursesCount || 1} Khóa học</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed pt-2">
                {course.instructor.bio}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
