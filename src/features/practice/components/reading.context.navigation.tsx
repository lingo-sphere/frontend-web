/**
 * @file reading.context.navigation.tsx
 * @description Topic / Context Selection Grid cho 2 dạng bài tập Reading mở rộng (Task-based & Info Matching)
 */

'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Icon } from '@/components/icon.map'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { Card, CardContent } from '@/components/card'
import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import type { PracticeContext, ContextSearchResult } from '../types/context.types'

interface ReadingContextNavigationProps {
  isVietnamese?: boolean
  selectedContextId?: string | null
  onSelectContext: (contextId: string | null) => void
}

export function ReadingContextNavigation({
  isVietnamese = true,
  selectedContextId,
  onSelectContext,
}: ReadingContextNavigationProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch ALL practice contexts
  const { data: allContexts, isLoading } = useQuery<PracticeContext[]>({
    queryKey: ['contexts', 'reading'],
    queryFn: async () => {
      const res = await api.get<PracticeContext[]>(
        `${API_CONFIG.ENDPOINTS.PRACTICE.SETS ? '/practice/contexts' : '/practice/contexts'}?status=ACTIVE`
      )
      return res || []
    },
    staleTime: 10 * 60 * 1000,
  })

  // Filter selectable contexts
  const availableContexts = useMemo(() => {
    if (!allContexts) return []
    return allContexts.filter((ctx) => ctx.is_selectable)
  }, [allContexts])

  // Search filter
  const filteredContexts = useMemo(() => {
    if (!searchQuery.trim()) return availableContexts.slice(0, 12)
    const q = searchQuery.toLowerCase()
    return availableContexts.filter(
      (ctx) =>
        ctx.name_vi?.toLowerCase().includes(q) ||
        ctx.name_en?.toLowerCase().includes(q) ||
        ctx.code?.toLowerCase().includes(q)
    )
  }, [availableContexts, searchQuery])

  const getContextName = (ctx: PracticeContext) =>
    isVietnamese ? ctx.name_vi || ctx.name_en : ctx.name_en

  return (
    <div className="space-y-4 rounded-2xl border border-border/40 bg-surface/50 p-4 backdrop-blur-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
            <Icon name="compass" size={18} className="text-primary" />
            <span>Chọn chủ đề ngữ cảnh luyện tập</span>
          </h3>
          <p className="text-xs text-text-tertiary">
            Lựa chọn môi trường thực tế để làm bài giải quyết nhiệm vụ hoặc ghép thông tin
          </p>
        </div>

        {/* Search bar & All Topics toggle */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <Input
              type="text"
              placeholder="Tìm chủ đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs"
            />
            <Icon
              name="search"
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary"
            />
          </div>

          <Button
            variant={selectedContextId === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelectContext(null)}
            className="text-xs shrink-0"
          >
            Tất cả chủ đề
          </Button>
        </div>
      </div>

      {/* Grid of Context Chips */}
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Icon name="loader" className="animate-spin text-primary" size={20} />
          <span className="ml-2 text-xs text-text-tertiary">Đang tải chủ đề...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filteredContexts.map((ctx) => {
            const isSelected = selectedContextId === ctx.code || selectedContextId === ctx._id
            return (
              <button
                key={ctx._id || ctx.code}
                type="button"
                onClick={() => onSelectContext(isSelected ? null : ctx.code || ctx._id || null)}
                className={`flex items-center gap-2 rounded-xl p-2.5 text-left text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-primary text-white shadow-md ring-2 ring-primary/40'
                    : 'bg-surface-elevated text-text-secondary border border-border/50 hover:border-primary/50 hover:bg-surface-hover'
                }`}
              >
                <Icon
                  name={ctx.icon || 'book-open'}
                  size={16}
                  className={isSelected ? 'text-white' : 'text-primary'}
                />
                <span className="line-clamp-1 flex-1">{getContextName(ctx)}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
