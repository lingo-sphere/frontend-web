// Trang Luyện tập Ngữ Pháp theo cấp độ CEFR (A1 - C1) & Tra cứu lý thuyết ngữ pháp
'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { SectionHeading } from '@/features/dashboard/components/section.heading'
import { Icon } from '@/components/icon.map'
import { Pagination } from '@/components/pagination'
import { toast } from '@/store/toast.store'
import { useAuthStore } from '@/features/auth/store/auth.store'
import type { BackendGrammarPoint } from '@/features/vocabulary/services/vocabulary.service'
import { useGrammarPointsQuery } from '@/features/vocabulary/hooks/use.vocabulary.query'
import { grammarPracticeService } from '@/features/practice/services/grammar-practice.service'
import { GrammarWorkspace } from '@/features/practice/components/grammar.workspace'
import { useSearchParams } from '@/lib/navigation'
import type {
  GrammarLevelSummary,
  GrammarTopicItem,
  GrammarSession,
} from '@/features/practice/types/grammar-practice'

const ITEMS_PER_PAGE = 12

// ============================================================================
// COMPONENT: CARD LÝ THUYẾT (TRA CỨU)
// ============================================================================
function TheoryGrammarCard({ grammar, isVietnamese }: { grammar: BackendGrammarPoint; isVietnamese: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="dashboard-card cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <CardContent className="p-5" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary font-medium">
                {grammar.cefr_level || 'B1'}
              </span>
              <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-xs text-text-secondary">
                {grammar.category}
              </span>
            </div>
            <h4 className="text-[16px] font-semibold text-text-primary line-clamp-1">
              {isVietnamese ? (grammar.title_vi || grammar.title_en) : grammar.title_en}
            </h4>
            <p className="text-[12px] text-text-secondary">{isVietnamese ? grammar.title_en : grammar.title_vi}</p>
          </div>
          <Icon
            name={isExpanded ? 'chevronDown' : 'chevronRight'}
            size={18}
            className="flex-shrink-0 text-text-tertiary"
          />
        </div>

        {grammar.structure_form && (
          <div className="mt-3 rounded-lg bg-surface-subtle p-2">
            <p className="text-[12px] text-text-secondary">{isVietnamese ? 'Cấu trúc:' : 'Structure:'}</p>
            <p className="font-mono text-[13px] font-medium text-primary">
              {grammar.structure_form}
            </p>
          </div>
        )}

        {isExpanded && (
          <div className="mt-4 space-y-4 border-t border-border pt-4">
            <div>
              <p className="text-[12px] font-medium text-text-secondary">{isVietnamese ? 'Mô tả & Định nghĩa:' : 'Description:'}</p>
              <p className="mt-1 text-[13px] text-text-primary">
                {isVietnamese ? (grammar.description_vi || grammar.description_en) : grammar.description_en}
              </p>
            </div>

            {grammar.rule_vi && (
              <div>
                <p className="text-[12px] font-medium text-text-secondary">{isVietnamese ? 'Quy tắc ngữ pháp:' : 'Rule:'}</p>
                <p className="mt-1 text-[13px] text-text-primary">
                  {isVietnamese ? grammar.rule_vi : grammar.rule_en}
                </p>
              </div>
            )}

            {grammar.examples && grammar.examples.length > 0 && (
              <div>
                <p className="text-[12px] font-medium text-text-secondary">{isVietnamese ? 'Ví dụ minh họa:' : 'Examples:'}</p>
                <div className="mt-2 space-y-2">
                  {grammar.examples.map((ex, idx) => (
                    <div key={idx} className="rounded-lg bg-surface-subtle p-2.5">
                      <p className="text-[13px] font-medium text-text-primary">{ex.sentence_en}</p>
                      <p className="mt-0.5 text-[12px] text-text-secondary">{ex.sentence_vi}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {grammar.usage_notes && (
              <div className="rounded-lg bg-info/10 p-3">
                <p className="text-[12px] font-semibold text-info">{isVietnamese ? 'Lưu ý ứng dụng:' : 'Usage Notes:'}</p>
                <p className="mt-1 text-[12px] text-text-primary">{grammar.usage_notes}</p>
              </div>
            )}

            {grammar.common_mistakes && (
              <div className="rounded-lg bg-warning/10 p-3">
                <p className="text-[12px] font-semibold text-warning">{isVietnamese ? 'Lỗi sai thường gặp:' : 'Common Mistakes:'}</p>
                <p className="mt-1 text-[12px] text-text-primary">{grammar.common_mistakes}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default function GrammarAppPage() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const user = useAuthStore((s) => s.user)
  const userId = user?.user_id

  const searchParams = useSearchParams()
  const urlSearch = searchParams.get('search')
  const urlLevel = searchParams.get('level') as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | null

  // Mode: 'practice' (Luyện tập) | 'handbook' (Tra cứu lý thuyết)
  const [activeTab, setActiveTab] = useState<'practice' | 'handbook'>(
    urlSearch ? 'handbook' : 'practice'
  )

  // PRACTICE STATE
  const [levels, setLevels] = useState<GrammarLevelSummary[]>([])
  const [selectedLevel, setSelectedLevel] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1'>(
    urlLevel || 'A1'
  )
  const [topics, setTopics] = useState<GrammarTopicItem[]>([])
  const [isLoadingTopics, setIsLoadingTopics] = useState(false)
  const [startingSessionTopicId, setStartingSessionTopicId] = useState<string | null>(null)
  const [activeSession, setActiveSession] = useState<GrammarSession | null>(null)

  // HANDBOOK STATE
  const { data: grammarItems = [], isLoading: isLoadingHandbook } = useGrammarPointsQuery()
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState(urlSearch || '')
  const [currentPage, setCurrentPage] = useState(1)

  // Load levels
  const loadLevels = useCallback(async () => {
    try {
      const data = await grammarPracticeService.getLevels(userId)
      setLevels(data)
    } catch (error) {
      console.error('Error fetching grammar levels:', error)
    }
  }, [userId])

  // Load topics by level
  const loadTopics = useCallback(async (level: string) => {
    setIsLoadingTopics(true)
    try {
      const data = await grammarPracticeService.getTopics(level, userId)
      setTopics(data)
    } catch (error) {
      console.error('Error fetching grammar topics:', error)
      toast.error('Không thể tải danh sách chủ đề ngữ pháp')
    } finally {
      setIsLoadingTopics(false)
    }
  }, [userId])

  useEffect(() => {
    loadLevels()
  }, [loadLevels])

  useEffect(() => {
    if (activeTab === 'practice') {
      loadTopics(selectedLevel)
    }
  }, [activeTab, selectedLevel, loadTopics])

  // Start practice session for a topic
  const handleStartPractice = async (topic: GrammarTopicItem) => {
    setStartingSessionTopicId(topic._id)
    try {
      const session = await grammarPracticeService.createSession({
        grammar_knowledge_id: topic._id,
        cefr_level: topic.cefr_level,
        question_count: 10,
        userId,
      })

      setActiveSession(session)
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Không thể tạo phiên luyện tập'
      toast.error(msg)
    } finally {
      setStartingSessionTopicId(null)
    }
  }

  // Filter for handbook
  const filteredGrammarPoints = useMemo(() => {
    return grammarItems.filter((item) => {
      const matchesType = selectedCategory === 'ALL' || item.category === selectedCategory
      const matchesSearch =
        searchQuery.trim() === '' ||
        (item.title_en && item.title_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.title_vi && item.title_vi.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesType && matchesSearch
    })
  }, [grammarItems, selectedCategory, searchQuery])

  const totalPages = Math.ceil(filteredGrammarPoints.length / ITEMS_PER_PAGE)
  const paginatedGrammarPoints = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredGrammarPoints.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredGrammarPoints, currentPage])

  // Current Level Meta
  const currentLevelSummary = levels.find((l) => l.level === selectedLevel)

  // IF SESSION IS ACTIVE: RENDER WORKSPACE DIRECTLY
  if (activeSession) {
    return (
      <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <GrammarWorkspace
          session={activeSession}
          userId={userId}
          onClose={() => {
            setActiveSession(null)
            loadLevels()
            loadTopics(selectedLevel)
          }}
          onRetry={() => {
            if (activeSession.grammar_knowledge_id) {
              const currentTopic = topics.find((t) => t._id === activeSession.grammar_knowledge_id)
              if (currentTopic) {
                handleStartPractice(currentTopic)
              }
            }
          }}
        />
      </main>
    )
  }

  return (
    <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeading
          eyebrow={isVietnamese ? 'Luyện tập Ngữ Pháp' : 'Grammar Practice'}
          title={isVietnamese ? 'Ngữ pháp tiếng Anh' : 'English Grammar'}
          description={
            isVietnamese
              ? 'Luyện tập theo 5 cấp độ CEFR từ nền tảng đến nâng cao kèm giải thích chi tiết.'
              : 'Practice across 5 CEFR levels with interactive exercises and clear explanations.'
          }
        />

        {/* Tab Switcher: Luyện tập vs Tra cứu */}
        <div className="flex items-center rounded-xl bg-surface-subtle p-1 border border-border">
          <button
            type="button"
            onClick={() => setActiveTab('practice')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === 'practice'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon name="bookCheck" size={16} />
            <span>Luyện tập theo cấp độ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('handbook')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === 'handbook'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon name="bookOpen" size={16} />
            <span>Tra cứu lý thuyết</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: LUYỆN TẬP THEO CẤP ĐỘ (A1 - C1) */}
      {/* ==================================================================== */}
      {activeTab === 'practice' && (
        <div className="mt-8 space-y-6">
          {/* 5 CEFR LEVEL SELECTOR */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              { level: 'A1', name: 'Beginner', desc: 'Nền tảng' },
              { level: 'A2', name: 'Elementary', desc: 'Giao tiếp cơ bản' },
              { level: 'B1', name: 'Intermediate', desc: 'Độc lập' },
              { level: 'B2', name: 'Upper-Inter', desc: 'Cấu trúc phức tạp' },
              { level: 'C1', name: 'Advanced', desc: 'Nâng cao' },
            ].map((lvlItem) => {
              const isSelected = selectedLevel === lvlItem.level
              const lvlData = levels.find((l) => l.level === lvlItem.level)
              const isUnlocked = lvlData ? lvlData.is_unlocked : lvlItem.level === 'A1'

              return (
                <button
                  key={lvlItem.level}
                  type="button"
                  onClick={() => setSelectedLevel(lvlItem.level as any)}
                  className={`relative flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/20'
                      : 'border-border bg-surface-subtle hover:border-primary/40 hover:bg-surface-elevated'
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className={`text-base font-black ${isSelected ? 'text-primary' : 'text-text-primary'}`}>
                      {lvlItem.level}
                    </span>
                    {!isUnlocked ? (
                      <Icon name="lock" size={14} className="text-text-tertiary" />
                    ) : (
                      <span className="rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-bold text-success">
                        Mở
                      </span>
                    )}
                  </div>
                  <span className="mt-1 text-xs font-semibold text-text-primary">{lvlItem.name}</span>
                  <span className="text-[11px] text-text-tertiary">{lvlItem.desc}</span>
                </button>
              )
            })}
          </div>

          {/* Level Summary Header Banner */}
          {currentLevelSummary && (
            <div className="flex flex-col gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-primary px-2 py-0.5 text-xs font-bold text-white">
                    Level {currentLevelSummary.level}
                  </span>
                  <h3 className="text-base font-bold text-text-primary">
                    {currentLevelSummary.display_name} — {currentLevelSummary.meaning}
                  </h3>
                </div>
                <p className="mt-1 text-xs text-text-secondary">
                  Hoàn thành 80% chủ điểm và đạt 80% độ chính xác để tự động mở khóa level kế tiếp.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-text-secondary">
                <div className="flex items-center gap-1.5">
                  <Icon name="bookCheck" size={15} className="text-primary" />
                  <span>{topics.length} chủ đề</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon name="award" size={15} className="text-success" />
                  <span>{currentLevelSummary.accuracy_rate}% độ chính xác</span>
                </div>
              </div>
            </div>
          )}

          {/* Topic Cards Grid */}
          {isLoadingTopics ? (
            <div className="flex h-48 items-center justify-center">
              <p className="text-sm text-text-secondary">Đang tải danh sách chủ đề ngữ pháp...</p>
            </div>
          ) : topics.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <Icon name="bookOpen" size={36} className="mx-auto mb-2 text-text-tertiary opacity-40" />
              <p className="text-sm text-text-secondary">Chưa có bài tập cho cấp độ này.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic) => {
                const isStarting = startingSessionTopicId === topic._id

                return (
                  <Card
                    key={topic._id}
                    className="flex flex-col justify-between border border-border bg-surface-subtle transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    <CardContent className="p-5 space-y-4">
                      {/* Meta badge */}
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                          {topic.category}
                        </span>
                        <span className="text-xs text-text-tertiary">
                          {topic.total_questions} bài tập
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className="text-base font-bold text-text-primary line-clamp-1">
                          {topic.name_vi || topic.name_en}
                        </h4>
                        <p className="text-xs text-text-secondary line-clamp-1">{topic.name_en}</p>
                      </div>

                      {/* Formula pattern box */}
                      {topic.structure_pattern && (
                        <div className="rounded-lg bg-surface-elevated p-2.5 border border-border">
                          <span className="text-[10px] font-semibold uppercase text-text-tertiary block">
                            Cấu trúc:
                          </span>
                          <span className="font-mono text-xs font-bold text-primary block mt-0.5 line-clamp-1">
                            {topic.structure_pattern}
                          </span>
                        </div>
                      )}

                      {/* Primary Button */}
                      <Button
                        variant="default"
                        disabled={isStarting}
                        onClick={() => handleStartPractice(topic)}
                        className="w-full gap-2 mt-2 shadow-sm font-semibold"
                      >
                        <Icon name="play" size={14} />
                        <span>{isStarting ? 'Đang tạo phòng...' : 'Luyện tập ngay'}</span>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: TRA CỨU LÝ THUYẾT (HANDBOOK) */}
      {/* ==================================================================== */}
      {activeTab === 'handbook' && (
        <div className="mt-8 space-y-6">
          {/* Search & Filter */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-xs">
              <Input
                placeholder={isVietnamese ? 'Tìm kiếm cấu trúc ngữ pháp...' : 'Search grammar rules...'}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { value: 'ALL', label: 'Tất cả' },
                { value: 'TENSES', label: 'Các Thì' },
                { value: 'PREPOSITIONS', label: 'Giới từ' },
                { value: 'CLAUSES', label: 'Mệnh đề' },
                { value: 'CONDITIONALS', label: 'Câu điều kiện' },
                { value: 'PASSIVE_VOICE', label: 'Bị động' },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(type.value)
                    setCurrentPage(1)
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedCategory === type.value
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface-subtle text-text-secondary hover:bg-surface-elevated'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          {isLoadingHandbook ? (
            <div className="flex h-48 items-center justify-center">
              <p className="text-sm text-text-secondary">Đang tải lý thuyết ngữ pháp...</p>
            </div>
          ) : filteredGrammarPoints.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <Icon name="search" size={32} className="mx-auto mb-2 text-text-tertiary opacity-40" />
              <p className="text-sm text-text-secondary">Không tìm thấy cấu trúc ngữ pháp phù hợp.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedGrammarPoints.map((item) => (
                <TheoryGrammarCard key={item._id} grammar={item} isVietnamese={isVietnamese} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center pt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}
    </main>
  )
}
