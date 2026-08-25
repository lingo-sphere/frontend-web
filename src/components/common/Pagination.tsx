
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  itemsPerPage?: number
  totalItems?: number
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  className = '',
}: PaginationProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  if (totalPages <= 1) return null

  const getShowingText = () => {
    if (!itemsPerPage || !totalItems) return null
    const start = (currentPage - 1) * itemsPerPage + 1
    const end = Math.min(currentPage * itemsPerPage, totalItems)
    return isVietnamese
      ? `Hiển thị ${start} - ${end} của ${totalItems}`
      : `Showing ${start} - ${end} of ${totalItems}`
  }

  const showingText = getShowingText()

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {showingText && (
        <span className="mr-4 text-[13px] text-text-secondary">{showingText}</span>
      )}

      <Button variant="outline" size="sm" disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)} className="min-w-[80px]">
        {isVietnamese ? 'Trước' : 'Previous'}
      </Button>

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button key={page} onClick={() => onPageChange(page)}
            className={`flex h-8 min-w-[32px] items-center justify-center rounded-lg text-[13px] font-medium transition-colors ${
              currentPage === page ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface-hover'
            }`}>
            {page}
          </button>
        ))}
      </div>

      <Button variant="outline" size="sm" disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)} className="min-w-[80px]">
        {isVietnamese ? 'Sau' : 'Next'}
      </Button>
    </div>
  )
}

export function usePagination(totalItems: number, initialPageSize: number = 10) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const totalPages = Math.ceil(totalItems / pageSize)

  const paginatedData = <T,>(data: T[]): T[] => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return data.slice(start, end)
  }

  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(validPage)
  }

  const nextPage = () => goToPage(currentPage + 1)
  const prevPage = () => goToPage(currentPage - 1)

  const setPageSizeAndReset = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    goToPage,
    nextPage,
    prevPage,
    setPageSize: setPageSizeAndReset,
    paginatedData,
    canGoNext: currentPage < totalPages,
    canGoPrev: currentPage > 1,
  }
}
