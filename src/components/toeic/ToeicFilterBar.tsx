import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { FilterChip } from '@/components/toeic/ToeicExamCard'
import type { ToeicExamFilters } from '@/types/toeic'

export const toeicSeriesFilters = [
  { id: 'ETS', label: 'ETS TOEIC' },
  { id: 'HACKER', label: 'Hacker TOEIC' },
  { id: 'ECONOMY', label: 'Economy TOEIC' },
]

export const toeicYearFilters = ['2024', '2023', '2022', '2021', '2020', '2019']

export const toeicDifficultyFilters = [
  { id: 'EASY', label: 'Dễ (Beginner)' },
  { id: 'MEDIUM', label: 'Trung bình' },
  { id: 'HARD', label: 'Nâng cao' },
]

interface ToeicFilterBarProps {
  searchQuery: string
  onSearchChange: (val: string) => void
  filters: ToeicExamFilters
  onFilterChange: (filters: Partial<ToeicExamFilters>) => void
  isVietnamese: boolean
}

export function ToeicFilterBar({
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  isVietnamese,
}: ToeicFilterBarProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
          size={18}
        />
        <Input
          placeholder={
            isVietnamese ? 'Tìm kiếm đề thi TOEIC...' : 'Search TOEIC exams...'
          }
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-surface border-border"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip
          label={isVietnamese ? 'Tất cả đề thi' : 'All Exams'}
          active={
            !filters.series && !filters.year && !filters.difficulty
          }
          onClick={() =>
            onFilterChange({
              series: undefined,
              year: undefined,
              difficulty: undefined,
            })
          }
        />

        {toeicSeriesFilters.map((s) => (
          <FilterChip
            key={s.id}
            label={s.label}
            active={filters.series === s.id}
            onClick={() =>
              onFilterChange({
                series: filters.series === s.id ? undefined : s.id,
              })
            }
          />
        ))}

        {toeicYearFilters.map((y) => (
          <FilterChip
            key={y}
            label={`${y}`}
            active={filters.year === y}
            onClick={() =>
              onFilterChange({
                year: filters.year === y ? undefined : y,
              })
            }
          />
        ))}

        {toeicDifficultyFilters.map((d) => (
          <FilterChip
            key={d.id}
            label={d.label}
            active={filters.difficulty === d.id}
            onClick={() =>
              onFilterChange({
                difficulty: filters.difficulty === d.id ? undefined : d.id,
              })
            }
          />
        ))}
      </div>
    </div>
  )
}
