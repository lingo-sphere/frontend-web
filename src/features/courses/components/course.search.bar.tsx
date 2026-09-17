// Component thanh tìm kiếm và lọc danh mục khóa học cho học viên.

'use client'

import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'

interface CourseSearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function CourseSearchBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}: CourseSearchBarProps) {
  const { t, i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const categories = [
    { id: 'all', label: t('courses.allCategories') },
    { id: 'TOEIC_2_SKILLS', label: t('courses.toeic2Skills') },
    { id: 'TOEIC_4_SKILLS', label: t('courses.toeic4Skills') },
  ]

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
        <input
          type="text"
          placeholder={isVi ? 'Tìm kiếm trong khóa học...' : 'Search my courses...'}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-xs sm:text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-primary text-white shadow-sm font-bold'
                  : 'border border-border bg-surface text-text-secondary hover:border-text-tertiary hover:text-text-primary'
              }`}
            >
              {cat.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
