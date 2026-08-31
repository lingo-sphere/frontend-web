'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Layout } from '@/components/layout/Layout'
import { SectionHeading } from '@/components/dashboard/SectionHeading'
import { Icon } from '@/components/icons/icon-map'
import { Input } from '@/components/ui/input'
import {
  listeningExercises,
  getExerciseById,
  getInProgressAttempt,
  getRecommendedExercises,
  getContinueListening,
  validateListeningExercise,
} from '@/data/listening-data'
import type { ListeningExercise, ListeningAttempt } from '@/types/listening'
import { ExerciseCard, ContinueCard, FilterChip } from '@/components/listening/ListeningCards'
import { VideoDictationView } from '@/components/listening/ListeningDictationWorkspace'
import { ResultView, ReviewView } from '@/components/listening/ListeningResultModal'

type ViewMode = 'list' | 'exercise' | 'result' | 'review'

export default function ListeningAppPage() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedExercise, setSelectedExercise] = useState<ListeningExercise | null>(null)
  const [selectedAttempt, setSelectedAttempt] = useState<ListeningAttempt | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedMediaType, setSelectedMediaType] = useState<string>('all')

  const filteredExercises = listeningExercises.filter((exercise) => {
    const matchesSearch =
      exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDifficulty =
      selectedDifficulty === 'all' || exercise.difficultyLevel === selectedDifficulty
    const matchesMediaType =
      selectedMediaType === 'all' || exercise.mediaType === selectedMediaType
    return matchesSearch && matchesDifficulty && matchesMediaType
  })

  const continueListening = getContinueListening()
  const recommended = getRecommendedExercises()

  const handleSelectExercise = (exercise: ListeningExercise) => {
    const { valid, errors } = validateListeningExercise(exercise)
    if (!valid) {
      console.error('Exercise validation failed:', errors)
    }

    setSelectedExercise(exercise)
    const inProgress = getInProgressAttempt(exercise.id)
    setSelectedAttempt(inProgress || null)
    setViewMode('exercise')
  }

  const handleBackToList = () => {
    setViewMode('list')
    setSelectedExercise(null)
    setSelectedAttempt(null)
  }

  if (viewMode === 'exercise' && selectedExercise) {
    return (
      <VideoDictationView
        exercise={selectedExercise}
        existingAttempt={selectedAttempt}
        onBack={handleBackToList}
        onComplete={(attempt) => {
          setSelectedAttempt(attempt)
          setViewMode('result')
        }}
      />
    )
  }

  if (viewMode === 'result' && selectedExercise && selectedAttempt) {
    return (
      <ResultView
        exercise={selectedExercise}
        attempt={selectedAttempt}
        onBack={handleBackToList}
        onReview={() => setViewMode('review')}
        onRetry={() => {
          setSelectedAttempt(null)
          setViewMode('exercise')
        }}
      />
    )
  }

  if (viewMode === 'review' && selectedExercise && selectedAttempt) {
    return (
      <ReviewView
        exercise={selectedExercise}
        attempt={selectedAttempt}
        onBack={() => setViewMode('result')}
        onContinue={handleBackToList}
      />
    )
  }

  return (
    <Layout>
      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <SectionHeading
          eyebrow={t('listening.title')}
          title={isVietnamese ? 'Luyện nghe' : 'Practice Listening'}
          description={
            isVietnamese
              ? 'Cải thiện kỹ năng nghe với các bài luyện tập đa dạng'
              : 'Improve listening skills with various exercises'
          }
        />

        {continueListening.length > 0 && (
          <section className="mb-8">
            <h3 className="mb-4 text-lg font-semibold text-text-primary flex items-center gap-2">
              <Icon name="play-circle" className="text-primary" size={20} />
              {isVietnamese ? 'Tiếp tục luyện nghe' : 'Continue Listening'}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {continueListening.map((attempt) => {
                const exercise = getExerciseById(attempt.exerciseId)
                if (!exercise) return null
                return (
                  <ContinueCard
                    key={attempt.id}
                    exercise={exercise}
                    attempt={attempt}
                    onClick={() => handleSelectExercise(exercise)}
                    isVietnamese={isVietnamese}
                  />
                )
              })}
            </div>
          </section>
        )}

        <section className="mb-8">
          <h3 className="mb-4 text-lg font-semibold text-text-primary flex items-center gap-2">
            <Icon name="star" className="text-warning" size={20} />
            {isVietnamese ? 'Đề xuất cho bạn' : 'Recommended for you'}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onClick={() => handleSelectExercise(exercise)}
                isVietnamese={isVietnamese}
              />
            ))}
          </div>
        </section>

        <section className="mb-6">
          <div className="relative mb-4">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
              size={18}
            />
            <Input
              placeholder={isVietnamese ? 'Tìm kiếm bài luyện...' : 'Search exercises...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-surface-subtle border-0"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <FilterChip
              active={selectedDifficulty === 'all'}
              onClick={() => setSelectedDifficulty('all')}
            >
              {isVietnamese ? 'Tất cả' : 'All'}
            </FilterChip>
            <FilterChip
              active={selectedDifficulty === 'EASY'}
              onClick={() => setSelectedDifficulty('EASY')}
              color="success"
            >
              {isVietnamese ? 'Dễ' : 'Easy'}
            </FilterChip>
            <FilterChip
              active={selectedDifficulty === 'MEDIUM'}
              onClick={() => setSelectedDifficulty('MEDIUM')}
              color="warning"
            >
              {isVietnamese ? 'Trung bình' : 'Medium'}
            </FilterChip>
            <FilterChip
              active={selectedDifficulty === 'HARD'}
              onClick={() => setSelectedDifficulty('HARD')}
              color="error"
            >
              {isVietnamese ? 'Khó' : 'Hard'}
            </FilterChip>
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={selectedMediaType === 'AUDIO'}
              onClick={() => setSelectedMediaType('AUDIO')}
            >
              <Icon name="headphones" size={14} /> Audio
            </FilterChip>
            <FilterChip
              active={selectedMediaType === 'VIDEO'}
              onClick={() => setSelectedMediaType('VIDEO')}
            >
              <Icon name="video" size={14} /> Video
            </FilterChip>
            {selectedMediaType !== 'all' && (
              <FilterChip
                active={false}
                onClick={() => setSelectedMediaType('all')}
              >
                {isVietnamese ? 'Tất cả' : 'All'}
              </FilterChip>
            )}
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-lg font-semibold text-text-primary flex items-center gap-2">
            <Icon name="library" className="text-primary" size={20} />
            {isVietnamese ? 'Thư viện luyện nghe' : 'Exercise Library'}
            <span className="text-sm font-normal text-text-secondary ml-2">
              ({filteredExercises.length} {isVietnamese ? 'bài' : 'exercises'})
            </span>
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onClick={() => handleSelectExercise(exercise)}
                isVietnamese={isVietnamese}
              />
            ))}
          </div>
        </section>
      </main>
    </Layout>
  )
}
