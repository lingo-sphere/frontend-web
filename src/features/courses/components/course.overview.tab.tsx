// Component hien thi thong tin tong quan khoa hoc, muc tieu va tai lieu giao trinh dinh kem.

'use client'

import { Award, Check, Clock, Star, Users, User, FileText, ExternalLink, Download } from 'lucide-react'
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

      {course.document_url && (
        <div className="rounded-2xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20 p-5 sm:p-6 space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-600/20">
                <FileText size={22} />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Giáo trình & Cẩm nang học tập
                </span>
                <h4 className="text-sm sm:text-base font-bold text-text-primary">
                  {course.document_name || 'Cẩm nang & Tài liệu tổng quan toàn khóa học (PDF)'}
                </h4>
                <p className="text-xs text-text-secondary">
                  Tài liệu học tập chính thức do đội ngũ giảng viên biên soạn kèm khóa học.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <a
                href={course.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <FileText size={14} />
                <span>Xem tài liệu</span>
                <ExternalLink size={12} className="opacity-80" />
              </a>
              <a
                href={course.document_url}
                download={course.document_name || 'giao-trinh-khoa-hoc'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 hover:bg-purple-50 text-purple-700 dark:text-purple-300 text-xs font-bold transition-all cursor-pointer"
              >
                <Download size={14} />
                <span>Tải về</span>
              </a>
            </div>
          </div>
        </div>
      )}

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
                  <span>5.0</span>
                </span>
                <span>•</span>
                <span>Giảng viên hàng đầu LingoSphere</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
