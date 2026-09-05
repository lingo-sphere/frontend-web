/**
 * @file course.qna.filters.bar.tsx
 * @description Thanh tìm kiếm và bộ lọc trạng thái câu hỏi (Tất cả, Đã giải đáp, Chờ giải đáp) trong tab Q&A
 */

import { Plus, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CourseQnAFiltersBarProps {
  searchQuery: string
  selectedFilter: 'all' | 'answered' | 'unanswered'
  totalCount: number
  answeredCount: number
  unansweredCount: number
  showAskForm: boolean
  isEnrolled: boolean
  isAuthenticated: boolean
  onSearchChange: (query: string) => void
  onClearSearch: () => void
  onFilterChange: (filter: 'all' | 'answered' | 'unanswered') => void
  onToggleAskForm: () => void
}

export function CourseQnAFiltersBar({
  searchQuery,
  selectedFilter,
  totalCount,
  answeredCount,
  unansweredCount,
  showAskForm,
  isEnrolled,
  isAuthenticated,
  onSearchChange,
  onClearSearch,
  onFilterChange,
  onToggleAskForm,
}: CourseQnAFiltersBarProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary"
            size={16}
          />
          <input
            type="text"
            placeholder="Tìm kiếm thắc mắc, chủ đề thảo luận..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-2xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-hidden transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {isEnrolled && isAuthenticated && (
          <Button
            onClick={onToggleAskForm}
            className={`rounded-2xl px-5 py-2.5 font-bold text-xs gap-2 shrink-0 transition-all cursor-pointer shadow-xs ${
              showAskForm
                ? 'bg-surface border border-border text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                : 'bg-primary text-white hover:bg-primary-hover shadow-primary/20'
            }`}
          >
            {showAskForm ? (
              <>
                <X size={15} />
                <span>Đóng form</span>
              </>
            ) : (
              <>
                <Plus size={16} />
                <span>Đặt câu hỏi</span>
              </>
            )}
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-primary/10 text-primary shadow-2xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            Tất cả ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('answered')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === 'answered'
                ? 'bg-primary/10 text-primary shadow-2xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            Đã giải đáp ({answeredCount})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('unanswered')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === 'unanswered'
                ? 'bg-primary/10 text-primary shadow-2xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            Chờ giải đáp ({unansweredCount})
          </button>
        </div>
      </div>
    </div>
  )
}
