'use client'

import { Award, Check, Clock, Globe, Star, Users } from 'lucide-react'
import type { Course } from '@/types/course'

interface CourseOverviewTabProps {
  course: Course
}

export function CourseOverviewTab({ course }: CourseOverviewTabProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary leading-snug">
          {course.title}
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          {course.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-text-secondary pt-2">
          <div className="flex items-center gap-1.5 text-warning">
            <span className="font-extrabold text-sm">{course.rating || 4.8}</span>
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={13} fill="currentColor" />
              ))}
            </div>
            <span className="text-text-tertiary">
              ({(course.ratingCount || 1420).toLocaleString('en-US')} đánh giá)
            </span>
          </div>

          <div className="flex items-center gap-1 text-text-secondary">
            <Users size={14} className="text-primary" />
            <span>{(course.studentsCount || 12850).toLocaleString('en-US')} học viên đã đăng ký</span>
          </div>

          <div className="flex items-center gap-1 text-text-secondary">
            <Clock size={14} className="text-primary" />
            <span>{course.duration || '45.5 giờ'} tổng thời lượng</span>
          </div>

          <div className="flex items-center gap-1 text-text-secondary">
            <Globe size={14} className="text-primary" />
            <span>{course.language || 'Tiếng Việt & Tiếng Anh'}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-sm">
        <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
          <Award className="text-primary" size={18} />
          Mục tiêu kiến thức đạt được trong khóa học
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(course.whatYouWillLearn || [
            'Làm chủ 44 âm vị IPA và phản xạ nghe hiểu Part 1 - Part 4.',
            'Bóc tách cấu trúc câu Part 5 & 6 trong 15 giây mà không cần dịch từ.',
            'Xử lý câu bẫy Part 2 và bẫy đồng âm phổ biến.',
            'Kỹ thuật Skimming & Scanning đạt độ chính xác trên 85% trong Part 7.',
          ]).map((item, idx) => (
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
            <img
              src={course.instructor.avatar}
              alt={course.instructor.name}
              className="h-16 w-16 rounded-2xl object-cover border border-border"
            />
            <div className="space-y-1.5 flex-1">
              <div className="text-sm font-bold text-text-primary">{course.instructor.name}</div>
              <div className="text-xs text-primary font-medium">{course.instructor.title}</div>
              <div className="flex items-center gap-4 text-[11px] text-text-tertiary pt-1">
                <span className="flex items-center gap-1 font-bold text-warning">
                  <Star size={12} fill="currentColor" />
                  {course.instructor.rating} Đánh giá
                </span>
                <span>{(course.instructor.studentsCount || 38000).toLocaleString('en-US')} Học viên</span>
                <span>{course.instructor.coursesCount || 8} Khóa học</span>
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
