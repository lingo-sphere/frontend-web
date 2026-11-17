// Danh sách bài tập luyện nói Speaking theo dạng bài và cấp độ.
'use client'

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Search, Clock, ArrowRight, Mic, Volume2, Play } from 'lucide-react'
import { AppSelect } from '@/components/select'
import { Pagination } from '@/components/pagination'
import { PracticeDifficultyFilter } from '@/features/practice/components/practice.difficulty.filter'
import { practiceDifficultyLabel } from '@/features/practice/lib/practice-difficulty'
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
      {!embedded && (
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-[14px] text-text-secondary hover:text-primary"
        >
          <ArrowLeft size={18} />
          {isVietnamese ? 'Quay lại' : 'Back'}
        </button>
      )}

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
            <AppSelect
              value={typeFilter}
              onChange={value => { setTypeFilter(value as SpeakingExerciseType | 'all'); setCurrentPage(1) }}
              options={[{ value: 'all', label: isVietnamese ? 'Tất cả dạng bài' : 'All types' }, ...Object.entries(typeLabels).filter(([type]) => exercises.some(ex => ex.exercise_type === type)).map(([value, label]) => ({ value, label }))]}
              size="sm"
              ariaLabel={isVietnamese ? 'Dạng bài' : 'Exercise type'}
            />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedExercises.map(exercise => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onClick={() => onSelectExercise(exercise)}
                typeLabels={typeLabels}
                isVietnamese={isVietnamese}
              />
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
  const estimatedMinutes = exercise.estimated_minutes ?? Math.max(1, Math.ceil(((exercise.preparation_time_seconds ?? 0) + (exercise.response_time_seconds ?? 0)) / 60))
  const displayTitle = isVietnamese ? (exercise.title_vi || exercise.title) : exercise.title
  const displayDescription = (isVietnamese ? (exercise.description_vi || exercise.description) : exercise.description) || (exercise.topic_name ? `Chủ đề: ${exercise.topic_name}` : 'Luyện kỹ năng nói tiếng Anh giao tiếp chuẩn quốc tế.')
  const cefrLevel = exercise.cefr_level || 'B1'
  const typeLabel = typeLabels[exercise.exercise_type] || exercise.exercise_type
  const prepTime = exercise.preparation_time_seconds || 30
  const respTime = exercise.response_time_seconds || 60
  const exerciseCode = `#SP-${String(exercise.id).slice(-3).toUpperCase()}`

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className="group relative h-[270px] w-full cursor-pointer select-none overflow-hidden rounded-[26px] border border-border/80 bg-surface dark:bg-card shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 hover:shadow-emerald-500/10"
    >
      <div className="absolute top-0 left-0 z-20 flex flex-col justify-center rounded-br-[36px] bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-4 py-2.5 pr-7 shadow-xs">
        <span className="text-xs font-black tracking-wider uppercase text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] sm:text-sm">
          BÀI NÓI {cefrLevel}
        </span>
        <span className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-100 sm:text-[11px] max-w-[130px] truncate">
          {typeLabel}
        </span>
      </div>

      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-surface-subtle/80 px-2.5 py-1 text-[10.5px] font-bold text-text-secondary backdrop-blur-xs shadow-2xs">
          <Clock size={11} className="text-emerald-600 dark:text-emerald-400" />
          <span>{estimatedMinutes} {isVietnamese ? 'phút' : 'min'}</span>
        </span>
      </div>

      <div className="relative z-10 space-y-1.5 pt-16 pr-16 pl-4 sm:pt-17 sm:pr-20 sm:pl-4.5">
        <h3 className="line-clamp-2 text-sm font-black leading-snug text-text-primary transition-colors duration-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 sm:text-[15px]">
          {displayTitle}
        </h3>
        <p className="line-clamp-2 text-[11px] leading-relaxed text-text-tertiary">
          {displayDescription}
        </p>
      </div>

      <svg
        className="pointer-events-none absolute right-0 bottom-0 z-10 h-[125px] w-[80%]"
        viewBox="0 0 300 120"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M 0 120 C 35 120 45 75 90 48 C 135 22 185 0 300 0 L 300 120 Z"
          className="fill-[#0c192c] dark:fill-[#07111e]"
        />
      </svg>

      <div className="absolute right-3.5 bottom-9 z-20 flex max-w-[70%] items-center justify-end gap-2.5">
        <div className="space-y-0.5 text-right text-[10px] font-semibold leading-tight text-slate-200/95 sm:text-[11px]">
          <div className="flex items-center justify-end gap-1.5">
            <span>{prepTime}s chuẩn bị</span>
          </div>
          <div className="flex items-center justify-end gap-1.5">
            <span>{respTime}s phản xạ</span>
          </div>
          <div className="flex items-center justify-end gap-1.5">
            <span>{exercise.total_attempts !== undefined ? `${exercise.total_attempts} lượt làm` : 'Phòng thu AI'}</span>
          </div>
          <div className="flex items-center justify-end gap-1.5 text-emerald-400 font-bold">
            <span>{practiceDifficultyLabel(exercise.difficulty_level || 'MEDIUM', isVietnamese)} · {cefrLevel}</span>
          </div>
        </div>

        <div className="my-auto flex w-7 shrink-0 flex-col items-center justify-between gap-1.5 rounded-full bg-white py-2 shadow-md transition-all duration-300 group-hover:shadow-emerald-500/25 sm:w-7.5 dark:bg-slate-100">
          <Mic size={11} className="text-slate-900" />
          <Volume2 size={11} className="text-slate-900" />
          <Clock size={11} className="text-slate-900" />
          <Play size={11} className="fill-emerald-600 text-emerald-600 transition-transform duration-200 group-hover:scale-115" />
        </div>
      </div>

      <div className="absolute bottom-2 left-4 z-10">
        <span className="font-mono text-[10px] font-bold text-text-tertiary">
          {exerciseCode}
        </span>
      </div>

      <div className="absolute right-0 bottom-0 left-[20%] z-30 flex h-7 items-center justify-between rounded-tl-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-3.5 shadow-xs">
        <div className="flex w-full items-center justify-between text-[10px] font-black uppercase tracking-wider text-white sm:text-[11px]">
          <span className="truncate max-w-[85px]">{exercise.topic_name || typeLabel}</span>
          <span className="text-emerald-100/60">|</span>
          <span>AI CHẤM ĐIỂM</span>
          <span className="text-emerald-100/60">|</span>
          <span className="flex items-center gap-1 font-black">
            <span>{isVietnamese ? 'LUYỆN TẬP' : 'PRACTICE'}</span>
            <ArrowRight size={11} className="transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </div>
  )
}
