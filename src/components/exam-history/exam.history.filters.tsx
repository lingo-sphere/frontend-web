// Component bộ lọc danh mục và thanh tìm kiếm cho lịch sử bài kiểm tra.

import { Search } from 'lucide-react'
import { ExamHistoryTab } from '@/hooks/use.exam.history'

interface ExamHistoryFiltersProps {
  activeTab: ExamHistoryTab
  onSelectTab: (tab: ExamHistoryTab) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  counts: {
    all: number
    placement: number
    toeic: number
    challenge: number
    postMini: number
    finalTest: number
  }
}

export function ExamHistoryFilters({
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  counts,
}: ExamHistoryFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-border pb-3">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        <button
          type="button"
          onClick={() => onSelectTab('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ALL'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
          }`}
        >
          Tất cả ({counts.all})
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('PLACEMENT')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'PLACEMENT'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/20'
          }`}
        >
          Test đầu vào ({counts.placement})
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('TOEIC')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'TOEIC'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
          }`}
        >
          Đề thi TOEIC ({counts.toeic})
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('CHALLENGE')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'CHALLENGE'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
          }`}
        >
          Thử thách chương ({counts.challenge})
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('POST_MINI')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'POST_MINI'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
          }`}
        >
          Kiểm tra chương ({counts.postMini})
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('FINAL_TEST')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'FINAL_TEST'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-purple-500/10 text-purple-700 dark:text-purple-400'
          }`}
        >
          Tốt nghiệp ({counts.finalTest})
        </button>
      </div>

      <div className="relative w-full md:w-64 shrink-0">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm bài thi..."
          className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-border bg-surface text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-colors"
        />
      </div>
    </div>
  )
}
