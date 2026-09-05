/**
 * @file course.resources.filter.bar.tsx
 * @description Thanh điều khiển tìm kiếm và chọn bộ lọc loại tài liệu (PDF, Audio, Slide)
 */

import { Search } from 'lucide-react'

export type ResourceFilterType = 'all' | 'current' | 'pdf' | 'audio' | 'slide'

interface CourseResourcesFilterBarProps {
  filterType: ResourceFilterType
  searchQuery: string
  totalResourcesCount: number
  onFilterChange: (type: ResourceFilterType) => void
  onSearchChange: (query: string) => void
}

export function CourseResourcesFilterBar({
  filterType,
  searchQuery,
  totalResourcesCount,
  onFilterChange,
  onSearchChange,
}: CourseResourcesFilterBarProps) {
  const filters: { id: ResourceFilterType; label: string }[] = [
    { id: 'all', label: `Tất cả (${totalResourcesCount})` },
    { id: 'current', label: 'Bài học này' },
    { id: 'pdf', label: '📄 PDF' },
    { id: 'audio', label: '🎧 Audio MP3' },
    { id: 'slide', label: '📊 Slide & Mindmap' },
  ]

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-3.5 rounded-2xl border border-border">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onFilterChange(f.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterType === f.id
                ? 'bg-primary text-white shadow-xs'
                : 'bg-background hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-border/60'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="relative min-w-[200px] sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo tên file tài liệu..."
          className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-xl text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>
  )
}
