import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Search, Clock, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { SpeakingExercise, SpeakingExerciseType, DifficultyLevel } from '@/types/speaking'

interface SpeakingExerciseListProps {
  exercises: SpeakingExercise[]
  onSelectExercise: (exercise: SpeakingExercise) => void
  onBack: () => void
}

const typeColors: Record<SpeakingExerciseType, string> = {
  TOPIC: 'bg-blue-100 text-blue-700',
  RESPOND_SITUATION: 'bg-purple-100 text-purple-700',
  PRONUNCIATION: 'bg-amber-100 text-amber-700',
  READ_ALOUD: 'bg-emerald-100 text-emerald-700',
  SHADOWING: 'bg-rose-100 text-rose-700',
}

export function SpeakingExerciseList({
  exercises,
  onSelectExercise,
  onBack,
}: SpeakingExerciseListProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<SpeakingExerciseType | 'all'>('all')
  const [levelFilter, setLevelFilter] = useState<DifficultyLevel | 'all'>('all')

  const typeLabels: Record<string, string> = {
    TOPIC: isVietnamese ? 'Chủ đề' : 'Topic',
    RESPOND_SITUATION: isVietnamese ? 'Phản hồi' : 'Respond',
    PRONUNCIATION: isVietnamese ? 'Phát âm' : 'Pronunciation',
    READ_ALOUD: isVietnamese ? 'Đọc to' : 'Read Aloud',
    SHADOWING: isVietnamese ? 'Bắt chước' : 'Shadowing',
  }

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          ex.title.toLowerCase().includes(query) ||
          ex.title_vi?.toLowerCase().includes(query) ||
          ex.topic_name?.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }
      if (typeFilter !== 'all' && ex.exercise_type !== typeFilter) return false
      if (levelFilter !== 'all' && ex.difficulty_level !== levelFilter) return false
      return true
    })
  }, [exercises, searchQuery, typeFilter, levelFilter])

  const groupedExercises = useMemo(() => {
    const groups: Record<SpeakingExerciseType, SpeakingExercise[]> = {
      TOPIC: [],
      RESPOND_SITUATION: [],
      PRONUNCIATION: [],
      READ_ALOUD: [],
      SHADOWING: [],
    }
    filteredExercises.forEach((ex) => {
      groups[ex.exercise_type].push(ex)
    })
    return groups
  }, [filteredExercises])

  const levelColors: Record<string, string> = {
    EASY: 'bg-emerald-100 text-emerald-700',
    MEDIUM: 'bg-amber-100 text-amber-700',
    HARD: 'bg-red-100 text-red-700',
  }

  const levelLabels: Record<string, string> = {
    EASY: isVietnamese ? 'Dễ' : 'Easy',
    MEDIUM: isVietnamese ? 'TB' : 'Medium',
    HARD: isVietnamese ? 'Khó' : 'Hard',
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">

      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-[14px] text-text-secondary hover:text-primary"
      >
        <ArrowLeft size={18} />
        {isVietnamese ? 'Quay lại' : 'Back'}
      </button>

      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-text-primary">
          {isVietnamese ? 'Bài tập Speaking' : 'Speaking Exercises'}
        </h1>
        <p className="mt-1 text-[14px] text-text-secondary">
          {isVietnamese ? 'Luyện nói với các bài tập từ cơ bản đến nâng cao' : 'Practice speaking with exercises from basic to advanced'}
        </p>
      </div>

      <div className="mb-6 space-y-4">

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder={isVietnamese ? 'Tìm kiếm bài tập...' : 'Search exercises...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-[14px] text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-3">

          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-text-tertiary">{isVietnamese ? 'Loại:' : 'Type:'}</span>
            <div className="flex flex-wrap gap-1">
              <FilterChip
                label={isVietnamese ? 'Tất cả' : 'All'}
                active={typeFilter === 'all'}
                onClick={() => setTypeFilter('all')}
              />
              {Object.entries(typeLabels).map(([type, label]) => (
                <FilterChip
                  key={type}
                  label={label}
                  active={typeFilter === type}
                  onClick={() => setTypeFilter(type as SpeakingExerciseType)}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-text-tertiary">{isVietnamese ? 'Độ khó:' : 'Level:'}</span>
            <div className="flex rounded-lg border border-border bg-surface p-1">
              <button
                onClick={() => setLevelFilter('all')}
                className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  levelFilter === 'all'
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {isVietnamese ? 'Tất cả' : 'All'}
              </button>
              {(['EASY', 'MEDIUM', 'HARD'] as DifficultyLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setLevelFilter(level)}
                  className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
                    levelFilter === level
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {levelLabels[level]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="mb-4 text-[13px] text-text-secondary">
        {isVietnamese ? 'Tìm thấy' : 'Found'} {filteredExercises.length} {isVietnamese ? 'bài tập' : 'exercises'}
      </p>

      {filteredExercises.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[14px] text-text-secondary">
            {isVietnamese ? 'Không tìm thấy bài tập phù hợp.' : 'No matching exercises found.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {(Object.keys(typeLabels) as SpeakingExerciseType[]).map((type) => {
            const typeExercises = groupedExercises[type]
            if (typeExercises.length === 0) return null
            if (typeFilter !== 'all' && typeFilter !== type) return null

            return (
              <section key={type}>
                <h2 className="mb-3 flex items-center gap-2 text-[16px] font-semibold text-text-primary">
                  <span className={`rounded-full px-3 py-1 text-[12px] font-medium ${typeColors[type]}`}>
                    {typeLabels[type]}
                  </span>
                  <span className="text-[13px] font-normal text-text-tertiary">
                    {typeExercises.length} {isVietnamese ? 'bài tập' : 'exercises'}
                  </span>
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {typeExercises.map((exercise) => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      onClick={() => onSelectExercise(exercise)}
                      typeLabels={typeLabels}
                      isVietnamese={isVietnamese}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </main>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
        active
          ? 'bg-primary text-white'
          : 'bg-surface-subtle text-text-secondary hover:bg-surface-hover hover:text-text-primary'
      }`}
    >
      {label}
    </button>
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
    TOPIC: 'bg-blue-100 text-blue-700',
    RESPOND_SITUATION: 'bg-purple-100 text-purple-700',
    PRONUNCIATION: 'bg-amber-100 text-amber-700',
    READ_ALOUD: 'bg-emerald-100 text-emerald-700',
    SHADOWING: 'bg-rose-100 text-rose-700',
  }

  const levelColors: Record<string, string> = {
    EASY: 'bg-emerald-100 text-emerald-700',
    MEDIUM: 'bg-amber-100 text-amber-700',
    HARD: 'bg-red-100 text-red-700',
  }

  return (
    <Card className="dashboard-card cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5" onClick={onClick}>
      <CardContent className="p-4">

        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-text-primary">{exercise.title}</h3>
            {exercise.title_vi && (
              <p className="text-[12px] text-text-secondary">{exercise.title_vi}</p>
            )}
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${levelColors[exercise.difficulty_level || 'MEDIUM']}`}>
            {exercise.cefr_level}
          </span>
        </div>

        <p className="mb-3 text-[13px] text-text-secondary line-clamp-2">
          {exercise.description_vi || exercise.description}
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
            {exercise.estimated_minutes || 3} {isVietnamese ? 'phút' : 'min'}
          </span>
          {exercise.total_attempts !== undefined && (
            <span>{exercise.total_attempts.toLocaleString()} {isVietnamese ? 'lượt làm' : 'attempts'}</span>
          )}
        </div>

        <Button
          size="sm"
          className="w-full bg-primary hover:bg-primary-hover"
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
