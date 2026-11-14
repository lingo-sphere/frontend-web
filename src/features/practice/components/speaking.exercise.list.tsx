import { PracticeDifficultyFilter } from './practice.difficulty.filter'
import { practiceDifficultyLabel, PRACTICE_DIFFICULTY_COLORS } from '../lib/practice-difficulty'
// Component giao diện React SpeakingExerciseList cho học viên.

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Search, Clock, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import { AppSelect } from '@/components/select'
import { Pagination } from '@/components/pagination'
import type { SpeakingExercise, SpeakingExerciseType, DifficultyLevel } from '@/features/practice/types/speaking'

interface SpeakingExerciseListProps {
  embedded?: boolean
  exercises: SpeakingExercise[]
  onSelectExercise: (exercise: SpeakingExercise) => void
  onBack: () => void
}

export function SpeakingExerciseList({
  exercises,
  onSelectExercise,
  onBack,
  embedded = false,
}: SpeakingExerciseListProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language.toLowerCase().startsWith('vi')

  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<SpeakingExerciseType | 'all'>('all')
  const [levelFilter, setLevelFilter] = useState<DifficultyLevel | 'all'>('all')

  // Pagination
  const PAGE_SIZE = 9
  const [currentPage, setCurrentPage] = useState(1)

  const typeLabels: Record<string, string> = {
    READ_ALOUD: isVietnamese ? 'Đọc to' : 'Read Aloud',
    DESCRIBE_PICTURE: isVietnamese ? 'Mô tả tranh' : 'Describe Picture',
    SHORT_DIALOGUE: isVietnamese ? 'Hội thoại ngắn' : 'Short Dialogue',
    ANSWER_QUESTION: isVietnamese ? 'Trả lời câu hỏi' : 'Answer Question',
    OPINION_RESPONSE: isVietnamese ? 'Trình bày quan điểm' : 'Express Opinion',
    TOPIC: isVietnamese ? 'Chủ đề' : 'Topic',
    RESPOND_SITUATION: isVietnamese ? 'Phản hồi' : 'Respond',
    PRONUNCIATION: isVietnamese ? 'Phát âm' : 'Pronunciation',
    SHADOWING: isVietnamese ? 'Bắt chước' : 'Shadowing',
  }

  const matchingExercises = useMemo(() => {
    return exercises.filter((ex) => {
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase()
        const matchesSearch =
          ex.title.toLowerCase().includes(query) ||
          ex.title_vi?.toLowerCase().includes(query) ||
          ex.topic_name?.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }
      if (typeFilter !== 'all' && ex.exercise_type !== typeFilter) return false
      return true
    })
  }, [exercises, searchQuery, typeFilter])


  const filteredExercises = useMemo(() => matchingExercises.filter(exercise => levelFilter === 'all' || (exercise.difficulty_level || 'MEDIUM') === levelFilter), [matchingExercises, levelFilter])

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredExercises.length / PAGE_SIZE))
  const page = Math.min(currentPage, totalPages)

  const paginatedExercises = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredExercises.slice(start, start + PAGE_SIZE)
  }, [filteredExercises, page])

  const difficultyCounts = useMemo(() => matchingExercises.reduce((counts, exercise) => {
    counts[exercise.difficulty_level || 'MEDIUM']++
    return counts
  }, { EASY: 0, MEDIUM: 0, HARD: 0 }), [matchingExercises])

  return (
    <section className={embedded ? '' : 'w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8'}>

      {!embedded && <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-[14px] text-text-secondary hover:text-primary"
      >
        <ArrowLeft size={18} />
        {isVietnamese ? 'Quay lại' : 'Back'}
      </button>}

      <div className="mb-6">
        <h2 className="text-[24px] font-bold text-text-primary">
          {isVietnamese ? 'Danh sách bài nói' : 'Speaking exercises'}
        </h2>
        <p className="mt-1 text-[14px] text-text-secondary">
          {isVietnamese ? 'Luyện nói với các bài tập từ cơ bản đến nâng cao' : 'Practice speaking with exercises from basic to advanced'}
        </p>
      </div>

      <div className="mb-6 space-y-4">

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            aria-label={isVietnamese ? 'Tìm kiếm bài tập' : 'Search exercises'}
            type="search"
            placeholder={isVietnamese ? 'Tìm kiếm bài tập...' : 'Search exercises...'}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
            className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-[14px] text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <PracticeDifficultyFilter value={levelFilter} counts={difficultyCounts} isVietnamese={isVietnamese} onChange={value => { setLevelFilter(value); setCurrentPage(1) }} />
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-xs font-medium text-text-tertiary">{isVietnamese ? 'Dạng bài:' : 'Type:'}</span>
            <AppSelect value={typeFilter} onChange={value => { setTypeFilter(value as SpeakingExerciseType | 'all'); setCurrentPage(1) }}
              options={[{ value: 'all', label: isVietnamese ? 'Tất cả dạng bài' : 'All types' }, ...Object.entries(typeLabels).filter(([type]) => exercises.some(ex => ex.exercise_type === type)).map(([value, label]) => ({ value, label }))]}
              size="sm" ariaLabel={isVietnamese ? 'Dạng bài' : 'Exercise type'} />
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13px] text-text-secondary">
          {isVietnamese ? 'Tìm thấy' : 'Found'} {filteredExercises.length} {isVietnamese ? 'bài tập' : 'exercises'}
          {filteredExercises.length > PAGE_SIZE && (
            <span className="ml-2">
              ({isVietnamese ? 'Hiển thị' : 'Showing'} {(page - 1) * PAGE_SIZE + 1}-
              {Math.min(page * PAGE_SIZE, filteredExercises.length)})
            </span>
          )}
        </p>
      </div>

      {filteredExercises.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[14px] text-text-secondary">
            {isVietnamese ? 'Không tìm thấy bài tập phù hợp.' : 'No matching exercises found.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedExercises.map(exercise => (
              <ExerciseCard key={exercise.id} exercise={exercise} onClick={() => onSelectExercise(exercise)} typeLabels={typeLabels} isVietnamese={isVietnamese} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={PAGE_SIZE}
                totalItems={filteredExercises.length}
              />
            </div>
          )}
        </>
      )}
    </section>
  )
}

function ExerciseCard({
  exercise,
  onClick,
  typeLabels,
  isVietnamese,
}: {
  exercise: SpeakingExercise
  onClick: () => void
  typeLabels: Record<string, string>
  isVietnamese: boolean
}) {
  const typeColors: Record<SpeakingExerciseType, string> = {
    READ_ALOUD: 'bg-emerald-100 text-emerald-700',
    DESCRIBE_PICTURE: 'bg-cyan-100 text-cyan-700',
    SHORT_DIALOGUE: 'bg-indigo-100 text-indigo-700',
    ANSWER_QUESTION: 'bg-amber-100 text-amber-700',
    OPINION_RESPONSE: 'bg-rose-100 text-rose-700',
    TOPIC: 'bg-blue-100 text-blue-700',
    RESPOND_SITUATION: 'bg-purple-100 text-purple-700',
    PRONUNCIATION: 'bg-teal-100 text-teal-700',
    SHADOWING: 'bg-pink-100 text-pink-700',
  }

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className="dashboard-card flex h-full flex-col transition-all cursor-pointer hover:border-primary/50 hover:shadow-md"
    >
      <CardContent className="flex flex-1 flex-col p-4">

        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-semibold text-text-primary">{isVietnamese ? exercise.title_vi || exercise.title : exercise.title}</h3>
            {isVietnamese && exercise.title_vi && exercise.title_vi !== exercise.title && (
              <p className="text-[12px] text-text-secondary">{exercise.title}</p>
            )}
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${PRACTICE_DIFFICULTY_COLORS[exercise.difficulty_level || 'MEDIUM']}`}>
            {practiceDifficultyLabel(exercise.difficulty_level || 'MEDIUM', isVietnamese)} · {exercise.cefr_level}
          </span>
        </div>

        <p className="mb-3 text-[13px] text-text-secondary line-clamp-2">
          {isVietnamese ? exercise.description_vi || exercise.description : exercise.description}
        </p>

        <div className="mb-3 flex flex-wrap gap-2">
          <span className={`inline-flex items-center rounded-full bg-surface-subtle px-2 py-0.5 text-[11px] ${typeColors[exercise.exercise_type]}`}>
            {typeLabels[exercise.exercise_type]}
          </span>
          {exercise.topic_name && (
            <span className="inline-flex items-center rounded-full bg-surface-subtle px-2 py-0.5 text-[11px] text-text-secondary">
              {exercise.topic_name}
            </span>
          )}
        </div>

        <div className="mb-4 flex items-center justify-between text-[12px] text-text-tertiary">
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {exercise.estimated_minutes ?? Math.max(1, Math.ceil(((exercise.preparation_time_seconds ?? 0) + (exercise.response_time_seconds ?? 0)) / 60))} {isVietnamese ? 'phút' : 'min'}
          </span>
          {exercise.total_attempts !== undefined && (
            <span>{exercise.total_attempts.toLocaleString()} {isVietnamese ? 'lượt làm' : 'attempts'}</span>
          )}
        </div>

        <Button
          aria-label={`${isVietnamese ? 'Bắt đầu' : 'Start'}: ${isVietnamese ? exercise.title_vi || exercise.title : exercise.title}`}
          size="sm"
          className="mt-auto w-full bg-primary hover:bg-primary-hover"
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
        >
          {isVietnamese ? 'Bắt đầu' : 'Start'}
          <ChevronRight size={16} />
        </Button>
      </CardContent>
    </Card>
  )
}
