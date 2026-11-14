// Component danh sách bài tập Writing phân theo cấp độ và dạng bài
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Search,
  Clock,
  ChevronRight,
  FileText,
  PenTool,
  Image,
  Mail,
} from 'lucide-react'
import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import { AppSelect } from '@/components/select'
import { Pagination } from '@/components/pagination'
import { PracticeDifficultyFilter } from './practice.difficulty.filter'
import { resolvePracticeDifficulty, practiceDifficultyLabel, PRACTICE_DIFFICULTY_COLORS, type PracticeDifficulty } from '../lib/practice-difficulty'
import type { WritingExercise } from '@/features/practice/types/writing'

const ITEMS_PER_PAGE = 9

interface WritingExerciseListProps {
  exercises: WritingExercise[]
  onSelectExercise: (exercise: WritingExercise) => void
  onBack: () => void
  embedded?: boolean
}

export function WritingExerciseList({ exercises, onSelectExercise, onBack, embedded = false }: WritingExerciseListProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language.toLowerCase().startsWith('vi')

  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState<PracticeDifficulty | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<string | 'all'>('all')
  const [page, setPage] = useState(1)

  const matchingExercises = useMemo(() => {
    return exercises.filter((ex) => {
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase()
        const matchesSearch =
          ex.title.toLowerCase().includes(query) ||
          ex.title_vi?.toLowerCase().includes(query) ||
          ex.description?.toLowerCase().includes(query) ||
          ex.topic_name?.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }
      if (typeFilter !== 'all' && ex.exercise_type !== typeFilter) return false
      return true
    })
  }, [exercises, searchQuery, typeFilter])

  const filteredExercises = useMemo(() => matchingExercises.filter(exercise => levelFilter === 'all' || resolvePracticeDifficulty(exercise.difficulty_level, exercise.writing_level, exercise.cefr_level) === levelFilter), [matchingExercises, levelFilter])

  const totalPages = Math.max(1, Math.ceil(filteredExercises.length / ITEMS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const visibleExercises = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredExercises.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredExercises, currentPage])

  const difficultyCounts = useMemo(() => matchingExercises.reduce((counts, exercise) => {
    counts[resolvePracticeDifficulty(exercise.difficulty_level, exercise.writing_level, exercise.cefr_level)]++
    return counts
  }, { EASY: 0, MEDIUM: 0, HARD: 0 }), [matchingExercises])

  const typeLabels: Record<string, { en: string; vi: string }> = {
    DESCRIBE_PICTURE: { en: 'Part 1: Write a Sentence Based on a Picture', vi: 'Part 1: Viết câu mô tả hình ảnh' },
    WRITE_EMAIL: { en: 'Part 2: Respond to a Written Request (Email)', vi: 'Part 2: Phản hồi email' },
    EXPRESS_OPINION: { en: 'Part 3: Write an Opinion Essay', vi: 'Part 3: Viết bài luận' },
  };

  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    exercises.forEach((ex) => {
      if (ex.exercise_type) types.add(ex.exercise_type);
    });
    return Array.from(types);
  }, [exercises]);

  return (
    <section className={embedded ? 'w-full' : 'w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8'}>
      {!embedded && <button onClick={onBack} className="mb-6 flex items-center gap-2 text-[14px] text-text-secondary hover:text-primary">
        <ArrowLeft size={18} />
        {isVietnamese ? 'Quay lại' : 'Back'}
      </button>}

      <div className="mb-6">
        <h2 className="text-[24px] font-bold text-text-primary">
          {isVietnamese ? 'Danh sách bài viết' : 'Writing exercises'}
        </h2>
        <p className="mt-1 text-[14px] text-text-secondary">
          {isVietnamese ? 'Luyện viết với các bài tập từ cơ bản đến nâng cao' : 'Practice writing with exercises from basic to advanced'}
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
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
            className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-[14px] text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <PracticeDifficultyFilter value={levelFilter} counts={difficultyCounts} isVietnamese={isVietnamese} onChange={value => { setLevelFilter(value); setPage(1) }} />

          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-text-tertiary">{isVietnamese ? 'Dạng bài:' : 'Type:'}</span>
            <AppSelect
              value={typeFilter}
              onChange={(val) => { setTypeFilter(val); setPage(1) }}
              options={[
                { value: 'all', label: `${isVietnamese ? 'Tất cả dạng bài' : 'All Types'} (${exercises.length})` },
                ...availableTypes.map((key) => {
                  const label = typeLabels[key];
                  const count = exercises.filter((e) => e.exercise_type === key).length;
                  return {
                    value: key,
                    label: `${label ? (isVietnamese ? label.vi : label.en) : key} (${count})`,
                  };
                }),
              ]}
              size="sm"
              ariaLabel={isVietnamese ? 'Dạng bài' : 'Type'}
            />
          </div>
        </div>
      </div>

      <p className="mb-4 text-[13px] text-text-secondary">
        {isVietnamese ? 'Tìm thấy' : 'Found'} {filteredExercises.length} {isVietnamese ? 'bài tập' : 'exercises'}
        {filteredExercises.length > 0 && <span> · {isVietnamese ? 'Hiển thị' : 'Showing'} {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredExercises.length)} / {filteredExercises.length}</span>}
      </p>

      {filteredExercises.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[14px] text-text-secondary">
            {isVietnamese ? 'Không tìm thấy bài tập phù hợp.' : 'No matching exercises found.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleExercises.map(exercise => (
            <ExerciseCard key={exercise.id} exercise={exercise} onClick={() => onSelectExercise(exercise)} typeLabels={typeLabels} isVietnamese={isVietnamese} />
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <nav aria-label={isVietnamese ? 'Phân trang bài viết' : 'Writing exercise pagination'} className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={filteredExercises.length}
            onPageChange={(newPage) => {
              setPage(newPage)
              window.scrollTo({ top: 120, behavior: 'smooth' })
            }}
          />
        </nav>
      )}
    </section>
  )
}

interface ExerciseCardProps {
  exercise: WritingExercise
  onClick: () => void
  typeLabels: Record<string, { en: string; vi: string }>
  isVietnamese: boolean
}

const exerciseIcons: Record<string, typeof FileText> = {
  DESCRIBE_PICTURE: Image,
  WRITE_EMAIL: Mail,
  EXPRESS_OPINION: PenTool,
}

function ExerciseCard({ exercise, onClick, typeLabels, isVietnamese }: ExerciseCardProps) {
  const difficulty = resolvePracticeDifficulty(exercise.difficulty_level, exercise.writing_level, exercise.cefr_level)
  const ExerciseIcon = exerciseIcons[exercise.exercise_type] || FileText
  const mainTitle = isVietnamese && exercise.title_vi ? exercise.title_vi : exercise.title
  const subTitle = isVietnamese && exercise.title_vi ? exercise.title : (exercise.title_vi || null)

  return (
    <Card className="dashboard-card flex h-full flex-col transition-colors hover:border-primary/40">
      <CardContent className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <ExerciseIcon className="w-5 h-5 text-primary shrink-0" />
            <div>
              <h3 className="text-[15px] font-semibold text-text-primary">{mainTitle}</h3>
              {subTitle && <p className="text-[12px] text-text-secondary">{subTitle}</p>}
            </div>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${PRACTICE_DIFFICULTY_COLORS[difficulty]}`}>
            {practiceDifficultyLabel(difficulty, isVietnamese)} · {exercise.cefr_level}
          </span>
        </div>

        <p className="mb-3 text-[13px] text-text-secondary line-clamp-2">
          {exercise.description_vi || exercise.description}
        </p>

        <div className="mb-3 flex flex-wrap gap-2">
          {exercise.exercise_type && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              {typeLabels[exercise.exercise_type]?.[isVietnamese ? 'vi' : 'en'] || exercise.exercise_type}
            </span>
          )}
          {exercise.topic_name && (
            <span className="inline-flex items-center rounded-full bg-surface-subtle px-2 py-0.5 text-[11px] font-medium text-text-primary">
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

        <Button aria-label={`${isVietnamese ? 'Bắt đầu' : 'Start'}: ${mainTitle}`} size="sm" className="mt-auto w-full bg-primary hover:bg-primary-hover" onClick={(e) => { e.stopPropagation(); onClick() }}>
          {isVietnamese ? 'Bắt đầu' : 'Start'}
          <ChevronRight size={16} />
        </Button>
      </CardContent>
    </Card>
  )
}
