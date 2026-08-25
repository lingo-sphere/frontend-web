// Updated: 2026-08-20
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SectionHeading } from '@/components/dashboard/SectionHeading'
import { Icon } from '@/components/icons/icon-map'
import { Pagination } from '@/components/common/Pagination'
import {
  grammarPoints,
  getGrammarPointsByType,
  searchGrammarPoints,
  getGrammarExamples,
  GRAMMAR_CATEGORIES,
} from '@/data/grammar-data'
import type { GrammarPoint, GrammarType } from '@/types/grammar'
import { GRAMMAR_TYPE_LABELS, CEFR_LEVEL_LABELS } from '@/types/grammar'

const ITEMS_PER_PAGE = 12

// Grammar Card
function GrammarCard({ grammar, isVietnamese }: { grammar: GrammarPoint; isVietnamese: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const examples = getGrammarExamples(grammar.id)

  return (
    <Card className="dashboard-card cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <CardContent className="p-5" onClick={() => setIsExpanded(!isExpanded)}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 bg-primary-10 text-primary rounded-full">
                {CEFR_LEVEL_LABELS[grammar.cefrLevel].split(' - ')[0]}
              </span>
              <span className="text-xs px-2 py-0.5 bg-surface-subtle text-text-secondary rounded-full">
                {GRAMMAR_TYPE_LABELS[grammar.grammarType]}
              </span>
            </div>
            <h4 className="text-[16px] font-semibold text-text-primary line-clamp-1">
              {isVietnamese ? grammar.nameVi : grammar.nameEn}
            </h4>
            <p className="text-[12px] text-text-secondary">{isVietnamese ? grammar.nameEn : grammar.nameVi}</p>
          </div>
          <Icon
            name={isExpanded ? 'chevronDown' : 'chevronRight'}
            size={18}
            className="text-text-tertiary flex-shrink-0"
          />
        </div>

        {/* Structure */}
        <div className="mt-3 p-2 bg-surface-subtle rounded-lg">
          <p className="text-[12px] text-text-secondary">{isVietnamese ? 'Cấu trúc:' : 'Structure:'}</p>
          <p className="text-[13px] font-mono text-primary font-medium">
            {grammar.structureForm}
          </p>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 space-y-4 border-t border-border pt-4">
            {/* Description */}
            <div>
              <p className="text-[12px] text-text-secondary mb-1">{isVietnamese ? 'Mô tả:' : 'Description:'}</p>
              <p className="text-[13px] text-text-primary">{isVietnamese ? grammar.descriptionVi : grammar.descriptionEn}</p>
            </div>

            {/* Rule */}
            <div>
              <p className="text-[12px] text-text-secondary mb-1">{isVietnamese ? 'Quy tắc:' : 'Rule:'}</p>
              <p className="text-[13px] text-text-primary">
                <span className="font-medium">EN:</span> {grammar.ruleEn}
              </p>
              <p className="text-[13px] text-text-primary">
                <span className="font-medium">VN:</span> {grammar.ruleVi}
              </p>
            </div>

            {/* Examples */}
            <div>
              <p className="text-[12px] text-text-secondary mb-2">{isVietnamese ? 'Ví dụ:' : 'Examples:'}</p>
              <div className="space-y-2">
                {grammar.examples.slice(0, 3).map((ex, idx) => (
                  <div key={idx} className="p-2 bg-surface-subtle rounded-lg">
                    <p className="text-[13px] text-text-primary font-medium">{ex.en}</p>
                    <p className="text-[12px] text-text-secondary mt-0.5">{ex.vi}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Mistakes */}
            {grammar.commonMistakes && (
              <div className="p-3 bg-error-10 rounded-lg">
                <p className="text-[12px] text-error font-medium mb-1">⚠️ {isVietnamese ? 'Lỗi thường gặp:' : 'Common mistakes:'}</p>
                <p className="text-[12px] text-text-secondary">{grammar.commonMistakes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Icon name="book" size={14} />
                <span className="ml-1">{isVietnamese ? 'Học' : 'Learn'}</span>
              </Button>
              <Button size="sm" className="flex-1">
                <Icon name="check" size={14} />
                <span className="ml-1">{isVietnamese ? 'Luyện tập' : 'Practice'}</span>
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-text-tertiary">
          <span>{grammar.practiceCount.toLocaleString()} {isVietnamese ? 'lượt luyện' : 'practices'}</span>
          <span>{grammar.toeicRelevance * 100}% TOEIC</span>
        </div>
      </CardContent>
    </Card>
  )
}

// Main Grammar Page
export function GrammarPage() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<GrammarType | 'ALL'>('ALL')
  const [currentPage, setCurrentPage] = useState(1)

  // Filter grammars
  const filteredGrammars = useMemo(() => {
    let result: GrammarPoint[]

    if (searchQuery) {
      result = searchGrammarPoints(searchQuery)
    } else if (selectedType !== 'ALL') {
      result = getGrammarPointsByType(selectedType)
    } else {
      result = grammarPoints.filter((g) => g.status === 'ACTIVE')
    }

    return result.sort((a, b) => a.displayOrder - b.displayOrder)
  }, [searchQuery, selectedType])

  // Pagination
  const totalPages = Math.ceil(filteredGrammars.length / ITEMS_PER_PAGE)
  const paginatedGrammars = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredGrammars.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredGrammars, currentPage])

  // Stats
  const stats = useMemo(() => {
    const active = grammarPoints.filter((g) => g.status === 'ACTIVE')
    return {
      total: active.length,
      featured: active.filter((g) => g.isFeatured).length,
      byType: GRAMMAR_CATEGORIES.reduce(
        (acc, cat) => {
          acc[cat.type] = active.filter((g) => g.grammarType === cat.type).length
          return acc
        },
        {} as Record<string, number>
      ),
    }
  }, [])

  // Reset page when filter changes
  const handleTypeChange = (type: GrammarType | 'ALL') => {
    setSelectedType(type)
    setSearchQuery('')
    setCurrentPage(1)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setSelectedType('ALL')
    setCurrentPage(1)
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow={t('grammar.title')}
        title={isVietnamese ? 'Ngữ pháp tiếng Anh' : 'English Grammar'}
        description={isVietnamese ? 'Học và luyện tập các cấu trúc ngữ pháp' : 'Learn and practice grammar structures'}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-xs text-text-tertiary">{isVietnamese ? 'Tổng cấu trúc' : 'Total structures'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">{stats.featured}</div>
            <div className="text-xs text-text-tertiary">{isVietnamese ? 'Nổi bật' : 'Featured'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">
              {stats.byType['TENSE'] || 0}
            </div>
            <div className="text-xs text-text-tertiary">{isVietnamese ? 'Thì' : 'Tenses'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-info">
              {stats.byType['CONDITIONAL'] || 0}
            </div>
            <div className="text-xs text-text-tertiary">{isVietnamese ? 'Điều kiện' : 'Conditionals'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Icon
          name="search"
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
        />
        <Input
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={isVietnamese ? 'Tìm kiếm ngữ pháp...' : 'Search grammar...'}
          className="pl-10"
        />
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => handleTypeChange('ALL')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            selectedType === 'ALL'
              ? 'bg-primary text-white'
              : 'bg-surface-subtle text-text-secondary hover:bg-surface'
          }`}
        >
          {isVietnamese ? 'Tất cả' : 'All'} ({stats.total})
        </button>
        {GRAMMAR_CATEGORIES.map((cat) => (
          <button
            key={cat.type}
            onClick={() => handleTypeChange(cat.type)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
              selectedType === cat.type
                ? 'bg-primary text-white'
                : 'bg-surface-subtle text-text-secondary hover:bg-surface'
            }`}
          >
            {cat.label} ({stats.byType[cat.type] || 0})
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-text-secondary mb-4">
        {isVietnamese ? 'Tìm thấy' : 'Found'} <span className="font-medium text-text-primary">{filteredGrammars.length}</span> {isVietnamese ? 'cấu trúc' : 'structures'}
      </p>

      {/* Grammar Grid */}
      {paginatedGrammars.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedGrammars.map((grammar) => (
              <GrammarCard key={grammar.id} grammar={grammar} isVietnamese={isVietnamese} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={filteredGrammars.length}
              />
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-surface-subtle rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="book" size={32} className="text-text-tertiary" />
            </div>
            <h3 className="font-medium text-text-primary mb-2">{isVietnamese ? 'Không tìm thấy' : 'Not found'}</h3>
            <p className="text-sm text-text-secondary mb-4">
              {isVietnamese ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc' : 'Try changing your search keyword or filters'}
            </p>
            <Button variant="outline" onClick={() => handleSearch('')}>
              {isVietnamese ? 'Xóa tìm kiếm' : 'Clear search'}
            </Button>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
