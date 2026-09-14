// Component hiển thị thông tin giảng viên và đánh giá học viên trên trang tổng quan khóa học.
'use client'

import React from 'react'
import { Star, Award, Users, BookOpen, ThumbsUp, CheckCircle2 } from 'lucide-react'
import type { CourseInstructor, CourseReviewItem } from '@/features/courses/types/course'

interface CourseLandingInstructorProps {
  instructor?: CourseInstructor
  reviews?: CourseReviewItem[]
  rating?: number
  ratingCount?: number
}

export function CourseLandingInstructor({
  instructor,
  reviews = [],
  rating = 4.8,
  ratingCount = 0,
}: CourseLandingInstructorProps) {
  const defaultInstructor: CourseInstructor = {
    name: 'Đội ngũ Giảng viên LingoSphere',
    title: 'Chuyên gia Luyện thi & Giảng dạy Ngoại ngữ Chuẩn Quốc tế',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 4.9,
    ratingCount: 1250,
    studentsCount: 18400,
    coursesCount: 8,
    bio: 'Đội ngũ chuyên gia LingoSphere quy tụ các giảng viên 990 TOEIC / 8.5 IELTS với hơn 8 năm kinh nghiệm giảng dạy và luyện thi đại học, chứng chỉ quốc tế. Hệ thống phương pháp giảng dạy độc quyền theo lộ trình cá nhân hóa, kết hợp thực hành và phân tích đề thực chiến sát cấu trúc đề thi thật nhất.',
  }

  const currentInstructor = instructor || defaultInstructor
  const instructorAvatar =
    currentInstructor.avatar && currentInstructor.avatar.trim() !== ''
      ? currentInstructor.avatar
      : defaultInstructor.avatar

  return (
    <div className="space-y-12 pt-6">
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Giảng viên hướng dẫn</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">
              {currentInstructor.name}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">{currentInstructor.title}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {instructorAvatar ? (
              <img
                src={instructorAvatar}
                alt={currentInstructor.name}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-emerald-500/20 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-2xl ring-4 ring-emerald-500/20 shadow-md">
                {(currentInstructor.name || 'L').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span><strong className="font-semibold">{currentInstructor.rating}</strong> xếp hạng giảng viên</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" />
                <span><strong className="font-semibold">{currentInstructor.ratingCount?.toLocaleString() || ratingCount.toLocaleString()}</strong> đánh giá</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span><strong className="font-semibold">{currentInstructor.studentsCount.toLocaleString()}</strong> học viên</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-500" />
                <span><strong className="font-semibold">{currentInstructor.coursesCount}</strong> khóa học</span>
              </div>
            </div>
          </div>

          <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
            <p>{currentInstructor.bio}</p>
          </div>
        </div>
      </section>

      <section className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
              <span>{rating.toFixed(1)} xếp hạng khóa học</span>
              <span className="text-slate-400 font-normal text-lg">({ratingCount.toLocaleString()} xếp hạng)</span>
            </h2>
          </div>
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm space-y-3"
              >
                <div className="flex items-center gap-3">
                  {rev.authorAvatar ? (
                    <img
                      src={rev.authorAvatar}
                      alt={rev.author}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-sm">
                      {rev.author.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                      {rev.author}
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="flex text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-500' : 'text-slate-300 dark:text-slate-600'}`}
                          />
                        ))}
                      </div>
                      <span>{rev.date}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {rev.content}
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
                  <span>Học viên đã hoàn thành khóa học</span>
                  <button className="ml-auto hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1">
                    <ThumbsUp className="w-3.5 h-3.5" /> Hữu ích
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
            <Star className="w-10 h-10 text-amber-400 fill-amber-400 mx-auto mb-2 opacity-60" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">Khóa học mới xuất bản và nhận được đánh giá cao từ học viên trải nghiệm sớm.</p>
            <p className="text-xs text-slate-400 mt-1">Các đánh giá mới sẽ được kiểm duyệt và hiển thị tại đây.</p>
          </div>
        )}
      </section>
    </div>
  )
}
