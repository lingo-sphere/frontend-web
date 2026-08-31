'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Layout } from '@/components/layout/Layout'
import { SectionHeading } from '@/components/dashboard/SectionHeading'
import { Icon } from '@/components/icons/icon-map'
import { Input } from '@/components/ui/input'
import { practiceService, type BackendListeningExercise } from '@/services/practice.service'
import type { ListeningExercise, ListeningAttempt } from '@/types/listening'
import { ExerciseCard, FilterChip } from '@/components/listening/ListeningCards'
import { VideoDictationView } from '@/components/listening/ListeningDictationWorkspace'
import { ResultView, ReviewView } from '@/components/listening/ListeningResultModal'

type ViewMode = 'list' | 'exercise' | 'result' | 'review'

export default function ListeningAppPage() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [exercises, setExercises] = useState<ListeningExercise[]>([])
  const [selectedExercise, setSelectedExercise] = useState<ListeningExercise | null>(null)
  const [selectedAttempt, setSelectedAttempt] = useState<ListeningAttempt | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedMediaType, setSelectedMediaType] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchListening = async () => {
      try {
        setIsLoading(true)
        const data = await practiceService.getListeningExercises()
        if (isMounted && Array.isArray(data)) {
          const mapped: ListeningExercise[] = data.map((item: BackendListeningExercise) => ({
            id: item._id,
            title: item.title,
            titleVi: item.title_vi || item.title,
            description: item.description || '',
            descriptionVi: item.description_vi || item.description || '',
            domain: item.domain || 'GENERAL',
            mediaType: (item.media_type || 'AUDIO') as 'AUDIO' | 'VIDEO',
            mediaId: item.media_id || '',
            mediaUrl: item.media_id || '',
            durationSeconds: item.duration_seconds || 120,
            exerciseType: 'DICTATION',
            difficultyLevel: (item.difficulty_level || 'MEDIUM') as 'EASY' | 'MEDIUM' | 'HARD',
            cefrLevel: item.cefr_level || 'B1',
            topicId: 'general',
            status: item.status || 'ACTIVE',
            createdBy: 'SYSTEM',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            segments: [
              {
                id: 'seg-1',
                exerciseId: item._id,
                segmentIndex: 0,
                startTime: 0,
                endTime: item.duration_seconds || 60,
                textEn: item.transcript || item.title,
                textVi: item.title_vi || item.title,
                blanks: [
                  {
                    id: 'b-1',
                    wordIndex: 0,
                    answer: (item.transcript || item.title).split(' ')[0] || 'Hello',
                  },
                ],
              },
            ],
          }))
          setExercises(mapped)
        }
      } catch (err) {
        console.error('Failed to load listening exercises:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    fetchListening()
    return () => {
      isMounted = false
    }
  }, [isVietnamese])

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch =
      exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDifficulty =
      selectedDifficulty === 'all' || exercise.difficultyLevel === selectedDifficulty
    const matchesMediaType =
      selectedMediaType === 'all' || exercise.mediaType === selectedMediaType
    return matchesSearch && matchesDifficulty && matchesMediaType
  })

  const handleSelectExercise = (exercise: ListeningExercise) => {
    setSelectedExercise(exercise)
    setSelectedAttempt(null)
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
          title={isVietnamese ? 'Luyện nghe & Chép chính tả' : 'Listening & Dictation Practice'}
          description={
            isVietnamese
              ? 'Luyện nghe tiếng Anh theo phương pháp chép chính tả Dictation tương tác'
              : 'Improve listening skills with interactive Dictation exercises'
          }
        />

        <section className="mb-6 mt-6">
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
              className="border-0 bg-surface-subtle pl-10"
            />
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
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
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
            <Icon name="library" className="text-primary" size={20} />
            {isVietnamese ? 'Thư viện luyện nghe' : 'Exercise Library'}
            <span className="ml-2 text-sm font-normal text-text-secondary">
              ({filteredExercises.length} {isVietnamese ? 'bài' : 'exercises'})
            </span>
          </h3>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredExercises.length > 0 ? (
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
          ) : (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-text-secondary">
              {isVietnamese ? 'Không tìm thấy bài luyện nghe nào.' : 'No listening exercises found.'}
            </div>
          )}
        </section>
      </main>
    </Layout>
  )
}
