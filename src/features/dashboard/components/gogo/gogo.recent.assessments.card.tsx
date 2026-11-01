// Component thẻ nhật ký khảo thí và bài nộp gần đây theo phong cách Gogo Application Status Card.
'use client'

import React from 'react'
import Link from 'next/link'
import { Award, ChevronRight, CheckCircle2, AlertCircle, FileText } from 'lucide-react'
import type { ProgressRecentActivity } from '@/features/progress/hooks/use.progress.data'

interface GogoRecentAssessmentsCardProps {
  activities: ProgressRecentActivity[]
}

export function GogoRecentAssessmentsCard({ activities }: GogoRecentAssessmentsCardProps) {
  const displayList = activities.slice(0, 5)

  return (
    <div className="rounded-3xl bg-surface border border-border p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400">
            <Award className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-base font-bold text-text-primary">
              Khảo Thí & Đánh Giá Gần Đây
            </h3>
            <p className="text-xs text-text-secondary">
              Kết quả các bài kiểm tra chương và đề thi thực hiện gần nhất
            </p>
          </div>
        </div>

        <Link
          href="/progress"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span>Xem chi tiết</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-3 my-auto">
        {displayList.length === 0 ? (
          <div className="py-8 text-center text-text-secondary text-xs">
            Chưa có bài kiểm tra nào được ghi nhận. Hãy bắt đầu luyện đề để theo dõi tiến độ!
          </div>
        ) : (
          displayList.map((item) => {
            const isPassed = item.scoreValue >= (item.maxScore ? item.maxScore * 0.7 : 70)

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-surface-subtle/50 hover:bg-surface-subtle border border-border/70 transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-surface border border-border text-text-secondary group-hover:text-primary transition-colors">
                    <FileText className="w-4 h-4" />
                  </span>

                  <div className="min-w-0 space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-bold text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-text-tertiary truncate">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-extrabold text-text-primary">
                      {item.scoreText}
                    </span>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      {isPassed ? (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Đạt</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                          <AlertCircle className="w-3 h-3" />
                          <span>Cần ôn</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

