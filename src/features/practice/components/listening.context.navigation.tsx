/**
 * @file listening.context.navigation.tsx
 * @description Topic-based Listening Practice - Grid layout với direct CTA
 */

'use client'

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Icon } from '@/components/icon.map'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { Card, CardContent } from '@/components/card'
import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import type { PracticeContext, ContextSearchResult } from '../types/context.types'

interface ListeningContextNavigationProps {
  isVietnamese: boolean
  onSelectContext: (contextId: string) => void
  onSelectRandom: () => void
}

export function ListeningContextNavigation({
  isVietnamese,
  onSelectContext,
  onSelectRandom,
}: ListeningContextNavigationProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [showAll, setShowAll] = useState(false)

  // Fetch ALL contexts
  const { data: allContexts, isLoading } = useQuery<PracticeContext[]>({
    queryKey: ['contexts', 'all'],
    queryFn: () => api.get<PracticeContext[]>(
      `${API_CONFIG.ENDPOINTS.CONTEXT.LIST}?status=ACTIVE`,
      undefined,
      undefined
    ),
    staleTime: 10 * 60 * 1000,
  })

  // Filter Level 0 contexts
  const level0Contexts = useMemo(() => {
    if (!allContexts) return []
    return allContexts
      .filter(ctx => ctx.level === 0 && ctx.is_selectable)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  }, [allContexts])

  // Search contexts
  const { data: searchResults } = useQuery<ContextSearchResult[]>({
    queryKey: ['contexts', 'search', searchQuery],
    queryFn: () => api.get<ContextSearchResult[]>(
      `${API_CONFIG.ENDPOINTS.CONTEXT.SEARCH}?q=${encodeURIComponent(searchQuery)}&domain=LISTENING`,
      undefined,
      undefined
    ),
    enabled: searchQuery.length >= 2,
    staleTime: 5 * 60 * 1000,
  })

  // Get context name
  const getContextName = (ctx: PracticeContext) => isVi ? (ctx.name_vi || ctx.name_en) : ctx.name_en

  // Display topics (limited or all)
  const displayTopics = useMemo(() => {
    if (showAll) return level0Contexts
    return level0Contexts.slice(0, 6) // Show first 6 by default
  }, [level0Contexts, showAll])

  // Search result handler
  const handleSearchResultClick = (result: ContextSearchResult) => {
    onSelectContext(result._id)
    setSearchQuery('')
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <div className="relative">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
            size={18}
          />
          <Input
            placeholder={isVi ? 'Tìm kiếm chủ đề...' : 'Search topics...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 bg-surface-subtle border-border"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-hover rounded"
            >
              <Icon name="x" size={14} className="text-text-tertiary" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchQuery && searchResults && searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-border rounded-xl shadow-xl max-h-80 overflow-y-auto">
            {searchResults.map((result) => {
              // Calculate total exercises for this context including descendants
              const totalItems = (() => {
                let total = result.total_questions || result.total_exercises || 0
                if (allContexts) {
                  for (const ctx of allContexts) {
                    if (ctx.level === 1 && ctx.parent_id === result._id) {
                      total += ctx.total_questions || ctx.total_exercises || 0
                      for (const ctx2 of allContexts) {
                        if (ctx2.level === 2 && ctx2.parent_id === ctx._id) {
                          total += ctx2.total_questions || ctx2.total_exercises || 0
                        }
                      }
                    }
                  }
                }
                return total
              })()

              return (
                <button
                  key={result._id}
                  onClick={() => handleSearchResultClick(result)}
                  className="w-full text-left px-4 py-3 hover:bg-surface-subtle transition-colors border-b border-border last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-text-primary">
                      {getContextName(result)}
                    </p>
                    {totalItems > 0 && (
                      <span className="text-xs text-text-secondary">
                        {totalItems} {isVi ? 'bài' : 'exercises'}
                      </span>
                    )}
                  </div>
                  {result.level > 0 && result.breadcrumb && result.breadcrumb.length > 0 && (
                    <p className="text-xs text-text-tertiary mt-1 flex items-center gap-1">
                      {result.breadcrumb.map((b, i) => (
                        <span key={b.id} className="flex items-center">
                          {i > 0 && <span className="mx-1 text-text-tertiary/50">›</span>}
                          {isVi ? (b.name_vi || b.name_en) : b.name_en}
                        </span>
                      ))}
                    </p>
                  )}
                  <div className="mt-2">
                    <span className="text-xs font-medium text-primary">
                      {isVi ? 'Luyện tập →' : 'Practice →'}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {searchQuery && searchResults && searchResults.length === 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-border rounded-xl shadow-xl p-4 text-center text-text-secondary text-sm">
            {isVi ? 'Không tìm thấy chủ đề nào' : 'No topics found'}
          </div>
        )}
      </div>

      {/* Mistake Review & Quick Actions */}
      <QuickActionsCard
        isVietnamese={isVi}
        onSelectRandom={onSelectRandom}
      />

      {/* Topics Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
            <Icon name="headphones" className="text-primary" size={20} />
            {isVi ? 'Luyện theo chủ đề' : 'Practice by Topic'}
          </h3>
          {!showAll && level0Contexts.length > 6 && (
            <button
              onClick={() => setShowAll(true)}
              className="text-sm text-primary hover:underline"
            >
              {isVi ? 'Xem tất cả' : 'View all'} ({level0Contexts.length})
            </button>
          )}
        </div>

        {/* Topics Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-surface-subtle" />
            ))}
          </div>
        ) : displayTopics.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayTopics.map((topic) => (
              <TopicCard
                key={topic._id}
                topic={topic}
                allContexts={allContexts || []}
                isVietnamese={isVi}
                onPractice={() => onSelectContext(topic._id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-text-secondary">
            {isVi ? 'Chưa có chủ đề luyện tập' : 'No practice topics available'}
          </div>
        )}

        {/* Collapse if expanded */}
        {showAll && level0Contexts.length > 6 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAll(false)}
              className="text-sm text-primary hover:underline"
            >
              {isVi ? 'Thu gọn' : 'Show less'}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

// ============================================================================
// TOPIC CARD
// ============================================================================

interface TopicCardProps {
  topic: PracticeContext
  allContexts: PracticeContext[]
  isVietnamese: boolean
  onPractice: () => void
}

function TopicCard({ topic, allContexts, isVietnamese, onPractice }: TopicCardProps) {
  const isVi = isVietnamese

  // Get context name
  const getContextName = (ctx: PracticeContext) => isVi ? (ctx.name_vi || ctx.name_en) : ctx.name_en

  // Get icon name
  const getIconName = (ctx: PracticeContext) => {
    if (ctx.icon) return ctx.icon
    const code = ctx.code?.toLowerCase() || ''
    if (code.includes('transport') || code.includes('train')) return 'train'
    if (code.includes('office') || code.includes('work')) return 'briefcase'
    if (code.includes('restaurant') || code.includes('cafe') || code.includes('food')) return 'utensils'
    if (code.includes('shop') || code.includes('store') || code.includes('retail')) return 'shoppingBag'
    if (code.includes('airport') || code.includes('flight')) return 'plane'
    if (code.includes('hotel') || code.includes('accommodation')) return 'home'
    if (code.includes('bank') || code.includes('finance')) return 'creditCard'
    if (code.includes('hospital') || code.includes('medical')) return 'heartPulse'
    return 'book'
  }

  // Calculate total exercises including descendants
  const getTotalExercises = (ctx: PracticeContext): number => {
    const ctxIdStr = ctx._id?.toString()
    let total = ctx.total_questions || ctx.total_exercises || 0
    // Add from Level 1 children
    for (const child of allContexts) {
      if (child.level === 1 && (child.parent_id === ctxIdStr || child.parent_id === ctx.code)) {
        total += child.total_questions || child.total_exercises || 0
        const childIdStr = child._id?.toString()
        // Add from Level 2 grandchildren
        for (const grandchild of allContexts) {
          if (grandchild.level === 2 && (grandchild.parent_id === childIdStr || grandchild.parent_id === child.code)) {
            total += grandchild.total_questions || grandchild.total_exercises || 0
          }
        }
      }
    }
    return total
  }

  const iconName = getIconName(topic)
  const totalItems = getTotalExercises(topic)
  const hasEnoughExercises = totalItems >= 6

  return (
    <Card className={`group transition-all duration-200 ${hasEnoughExercises ? 'hover:border-primary/30' : 'opacity-80 bg-surface-subtle border-border'}`}>
      <CardContent className="p-4 flex flex-col h-full">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${hasEnoughExercises ? 'bg-primary/10' : 'bg-slate-200 dark:bg-slate-800'}`}>
          <Icon name={iconName} className={hasEnoughExercises ? 'text-primary' : 'text-slate-400'} size={24} />
        </div>

        {/* Title */}
        <h4 className="font-semibold text-text-primary mb-1 line-clamp-2">
          {getContextName(topic)}
        </h4>

        {/* Stats */}
        {hasEnoughExercises ? (
          <p className="text-xs text-text-secondary mb-3">
            {totalItems} {isVietnamese ? 'bài luyện' : 'exercises'}
            {topic.cefr_level && (
              <span className="ml-2 text-primary/70">· {topic.cefr_level}</span>
            )}
          </p>
        ) : totalItems > 0 ? (
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-3">
            {totalItems}/6 {isVietnamese ? 'bài (Cần tối thiểu 6 bài)' : 'exercises (Needs 6)'}
          </p>
        ) : (
          <p className="text-xs text-text-tertiary mb-3">
            {isVietnamese ? 'Chưa đủ bài luyện' : 'Not enough exercises'}
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA */}
        <Button
          variant={hasEnoughExercises ? 'default' : 'outline'}
          size="sm"
          onClick={onPractice}
          disabled={!hasEnoughExercises}
          className="w-full mt-2"
        >
          {hasEnoughExercises
            ? (isVietnamese ? 'Luyện tập' : 'Practice')
            : (isVietnamese ? 'Chưa đủ 6 bài' : 'Needs 6 questions')}
          {hasEnoughExercises && <Icon name="arrow-right" size={14} className="ml-1" />}
        </Button>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// QUICK ACTIONS CARD (Mistake Review + Random)
// ============================================================================

interface QuickActionsCardProps {
  isVietnamese: boolean
  onSelectRandom: () => void
}

function QuickActionsCard({ isVietnamese, onSelectRandom }: QuickActionsCardProps) {
  // TODO: Fetch mistake count from API
  const mistakeCount = 0

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Random Practice */}
      <Card className="border-dashed border-2 border-primary/30 bg-primary/5 hover:border-primary/50 transition-all">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Icon name="shuffle" className="text-primary" size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-text-primary mb-1">
                {isVietnamese ? 'Luyện ngẫu nhiên' : 'Random Practice'}
              </h4>
              <p className="text-sm text-text-secondary mb-3">
                {isVietnamese
                  ? '6 câu được chọn ngẫu nhiên từ tất cả chủ đề'
                  : '6 random questions from all topics'}
              </p>
              <Button
                variant="default"
                size="sm"
                onClick={onSelectRandom}
                className="w-full md:w-auto"
              >
                {isVietnamese ? 'Bắt đầu luyện' : 'Start Practice'}
                <Icon name="arrow-right" size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mistake Review */}
      <Card className={`border-dashed border-2 ${mistakeCount > 0 ? 'border-amber-500/30 bg-amber-500/5' : 'border-border bg-surface-subtle'}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${mistakeCount > 0 ? 'bg-amber-500/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
              <Icon name="rotate-ccw" className={mistakeCount > 0 ? 'text-amber-500' : 'text-slate-400'} size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-text-primary mb-1">
                {isVietnamese ? 'Ôn tập lỗi sai' : 'Review Mistakes'}
              </h4>
              <p className="text-sm text-text-secondary mb-3">
                {mistakeCount > 0
                  ? `${mistakeCount} ${isVietnamese ? 'câu để ôn tập' : 'questions to review'}`
                  : isVietnamese
                    ? 'Bạn không có lỗi sai nào để ôn tập'
                    : 'No mistakes to review'}
              </p>
              <Button
                variant="outline"
                size="sm"
                disabled={mistakeCount === 0}
                className="w-full md:w-auto"
              >
                {isVietnamese ? 'Luyện tập' : 'Practice'}
                <Icon name="arrow-right" size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
