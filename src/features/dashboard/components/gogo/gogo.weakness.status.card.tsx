// Component hiển thị danh sách các điểm yếu và chuyên đề cần cải thiện theo phân tích dữ liệu thực tế.
'use client'

import { ChevronRight, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'
import type { WeaknessAnalysis } from '@/features/progress/services/progress.service'

interface GogoWeaknessStatusCardProps {
  weaknesses?: WeaknessAnalysis[]
  onViewAll?: () => void
  onPractice?: () => void
}

export function GogoWeaknessStatusCard({
  weaknesses = [],
  onViewAll,
  onPractice,
}: GogoWeaknessStatusCardProps) {
  const topItems = weaknesses.slice(0, 5)

  return (
    <div className="space-y-3 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
          Trọng tâm Cần Cải thiện (Điểm yếu)
        </h2>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-text-tertiary hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Phân tích chi tiết</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="rounded-3xl bg-surface border border-border p-5 sm:p-6 shadow-xs flex-1 flex flex-col justify-between space-y-4">
        {topItems.length > 0 ? (
          <div className="space-y-3.5 flex-1">
            {topItems.map((w, idx) => {
              const accuracy = Math.round(w.accuracy || 0)
              const errorRate = Math.max(0, 100 - accuracy)
              const title = w.dimension_name || w.grammar_knowledge?.name_vi || w.skill

              return (
                <div key={`${w.dimension_id || w.skill}-${idx}`} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-text-primary truncate pr-2 max-w-[70%]" title={title}>
                      {title}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-rose-500 font-bold text-[11px]">
                        Lỗi: {errorRate}%
                      </span>
                      <span className="text-[10px] text-text-tertiary">
                        ({w.questions} câu)
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface-subtle overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        errorRate >= 50 ? 'bg-rose-500' : 'bg-amber-400 dark:bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(10, errorRate))}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div className="space-y-1 max-w-xs">
              <h3 className="text-sm font-bold text-text-primary">
                Chưa ghi nhận điểm yếu đáng kể
              </h3>
              <p className="text-xs text-text-tertiary leading-relaxed">
                Hệ thống AI chưa phát hiện lỗ hổng kiến thức nghiêm trọng. Hãy tiếp tục luyện đề và làm bài tập để ghi nhận năng lực!
              </p>
            </div>
            {onPractice && (
              <button
                type="button"
                onClick={onPractice}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>Luyện tập ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {topItems.length > 0 && (
          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-text-tertiary">
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Gợi ý: Ưu tiên ôn tập dạng bài có tỷ lệ lỗi cao.</span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
