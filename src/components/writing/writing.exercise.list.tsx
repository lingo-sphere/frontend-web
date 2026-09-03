/**
 * @file WritingExerciseList.tsx
 * @description Component giao diện React WritingExerciseList cho học viên
 */

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Search, Clock, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { WritingExercise, WritingLevel, ExerciseType } from '@/types/writing'

interface WritingExerciseListProps {
  exercises: WritingExercise[]
  onSelectExercise: (exercise: WritingExercise) => void
  onBack: () => void
}

export function WritingExerciseList({ exercises, onSelectExercise, onBack }: WritingExerciseListProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState<WritingLevel | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ExerciseType | 'all'>('all')

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          ex.title.toLowerCase().includes(query) ||
          ex.title_vi?.toLowerCase().includes(query) ||
          ex.description?.toLowerCase().includes(query) ||
          ex.topic_name?.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }
      if (levelFilter !== 'all' && ex.writing_level !== levelFilter) return false
      if (typeFilter !== 'all' && ex.exercise_type !== typeFilter) return false
      return true
    })
  }, [exercises, searchQuery, levelFilter, typeFilter])

  const groupedExercises = useMemo(() => {
    const groups: Record<WritingLevel, WritingExercise[]> = {
      BASIC: [],
      INTERMEDIATE: [],
      ADVANCED: [],
    }
    filteredExercises.forEach((ex) => {
      if (groups[ex.writing_level]) {
        groups[ex.writing_level].push(ex)
      }
    })
    return groups
  }, [filteredExercises])

  const levelColors = {
    BASIC: 'bg-emerald-100 text-emerald-700',
    INTERMEDIATE: 'bg-amber-100 text-amber-700',
    ADVANCED: 'bg-red-100 text-red-700',
  }

  const levelLabels = {
    BASIC: isVietnamese ? 'Cơ bản' : 'Basic',
    INTERMEDIATE: isVietnamese ? 'Trung bình' : 'Intermediate',
    ADVANCED: isVietnamese ? 'Nâng cao' : 'Advanced',
  }

  const typeLabels: Record<ExerciseType, { en: string; vi: string }> = {
    SENTENCE_COMPLETION: { en: 'Sentence Completion', vi: 'Hoàn thành câu' },
    SENTENCE_ARRANGEMENT: { en: 'Sentence Arrangement', vi: 'Sắp xếp câu' },
    PARAPHRASING: { en: 'Paraphrasing', vi: 'Viết lại câu' },
    KEYWORD_WRITING: { en: 'Keyword Writing', vi: 'Viết theo từ khóa' },
    TOPIC_WRITING: { en: 'Topic Writing', vi: 'Viết theo chủ đề' },
    DIARY: { en: 'Diary', vi: 'Nhật ký' },
  }

  return (
    <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-[14px] text-text-secondary hover:text-primary">
        <ArrowLeft size={18} />
        {isVietnamese ? 'Quay lại' : 'Back'}
      </button>

      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-text-primary">
          {isVietnamese ? 'Bài tập Writing' : 'Writing Exercises'}
        </h1>
        <p className="mt-1 text-[14px] text-text-secondary">
          {isVietnamese ? 'Luyện viết với các bài tập từ cơ bản đến nâng cao' : 'Practice writing with exercises from basic to advanced'}
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
            <span className="text-[12px] font-medium text-text-tertiary">{isVietnamese ? 'Cấp độ:' : 'Level:'}</span>
            <div className="flex rounded-lg border border-border bg-surface p-1">
              <button onClick={() => setLevelFilter('all')}
                className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${levelFilter === 'all' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>
                {isVietnamese ? 'Tất cả' : 'All'}
              </button>
              {(['BASIC', 'INTERMEDIATE', 'ADVANCED'] as WritingLevel[]).map((level) => (
                <button key={level} onClick={() => setLevelFilter(level)}
                  className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${levelFilter === level ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>
                  {levelLabels[level]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-text-tertiary">{isVietnamese ? 'Loại:' : 'Type:'}</span>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as ExerciseType | 'all')}
              className="h-9 rounded-lg border border-border bg-surface px-3 text-[12px] text-text-primary focus:border-primary focus:outline-none">
              <option value="all">{isVietnamese ? 'Tất cả' : 'All'}</option>
              {Object.entries(typeLabels).map(([key, label]) => (
                <option key={key} value={key}>{isVietnamese ? label.vi : label.en}</option>
              ))}
            </select>
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
          {(['BASIC', 'INTERMEDIATE', 'ADVANCED'] as WritingLevel[]).map((level) => {
            const levelExercises = groupedExercises[level]
            if (levelExercises.length === 0) return null
            if (levelFilter !== 'all' && levelFilter !== level) return null

            return (
              <section key={level}>
                <h2 className="mb-3 flex items-center gap-2 text-[16px] font-semibold text-text-primary">
                  <span className={`rounded-full px-3 py-1 text-[12px] font-medium ${levelColors[level]}`}>
                    {levelLabels[level]}
                  </span>
                  <span className="text-[13px] font-normal text-text-tertiary">
                    {levelExercises.length} {isVietnamese ? 'bài tập' : 'exercises'}
                  </span>
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {levelExercises.map((exercise) => (
                    <ExerciseCard key={exercise.id} exercise={exercise} onClick={() => onSelectExercise(exercise)}
                      typeLabels={typeLabels} isVietnamese={isVietnamese} levelLabels={levelLabels} />
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

interface ExerciseCardProps {
  exercise: WritingExercise
  onClick: () => void
  typeLabels: Record<ExerciseType, { en: string; vi: string }>
  isVietnamese: boolean
  levelLabels: Record<string, string>
}

function ExerciseCard({ exercise, onClick, typeLabels, isVietnamese, levelLabels }: ExerciseCardProps) {
  const levelColors = {
    BASIC: 'bg-emerald-100 text-emerald-700',
    INTERMEDIATE: 'bg-amber-100 text-amber-700',
    ADVANCED: 'bg-red-100 text-red-700',
  }

  const getExerciseIcon = (type: ExerciseType) => {
    switch (type) {
      case 'SENTENCE_COMPLETION': return '📝'
      case 'SENTENCE_ARRANGEMENT': return '🔤'
      case 'PARAPHRASING': return '✍️'
      case 'KEYWORD_WRITING': return '🔑'
      case 'TOPIC_WRITING': return '📄'
      case 'DIARY': return '📓'
      default: return '📝'
    }
  }

  return (
    <Card className="dashboard-card cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5" onClick={onClick}>
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[20px]">{getExerciseIcon(exercise.exercise_type)}</span>
            <div>
              <h3 className="text-[15px] font-semibold text-text-primary">{exercise.title}</h3>
              {exercise.title_vi && <p className="text-[12px] text-text-secondary">{exercise.title_vi}</p>}
            </div>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${levelColors[exercise.writing_level]}`}>
            {exercise.cefr_level}
          </span>
        </div>

        <p className="mb-3 text-[13px] text-text-secondary line-clamp-2">
          {exercise.description_vi || exercise.description}
        </p>

        <div className="mb-3 flex flex-wrap gap-2">
          {exercise.exercise_type && (
            <span className="inline-flex items-center rounded-full bg-surface-subtle px-2 py-0.5 text-[11px] text-text-secondary">
              {typeLabels[exercise.exercise_type]?.[isVietnamese ? 'vi' : 'en'] || exercise.exercise_type}
            </span>
          )}
          {exercise.topic_name && (
            <span className="inline-flex items-center rounded-full bg-surface-subtle px-2 py-0.5 text-[11px] text-text-secondary">
              {exercise.topic_name}
            </span>
          )}
        </div>

        <div className="mb-4 flex items-center justify-between text-[12px] text-text-tertiary">
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {exercise.estimated_minutes || 10} {isVietnamese ? 'phút' : 'min'}
          </span>
          {exercise.total_attempts !== undefined && (
            <span>{exercise.total_attempts.toLocaleString()} {isVietnamese ? 'lượt làm' : 'attempts'}</span>
          )}
        </div>

        <Button size="sm" className="w-full bg-primary hover:bg-primary-hover" onClick={(e) => { e.stopPropagation(); onClick() }}>
          {isVietnamese ? 'Bắt đầu' : 'Start'}
          <ChevronRight size={16} />
        </Button>
      </CardContent>
    </Card>
  )
}
