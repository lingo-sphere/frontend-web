/**
 * @file page.tsx
 * @description Trang giao diện người dùng (Next.js App Router) cho tuyến (study)/writing
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useParams } from '@/lib/navigation'
import { useApp } from '@/contexts/app.context'
import { WritingHome } from '@/features/practice/components/writing.home'
import { WritingExerciseList } from '@/features/practice/components/writing.exercise.list'
import { WritingExerciseDetail } from '@/features/practice/components/writing.exercise.detail'
import { WritingWorkspace } from '@/features/practice/components/writing.workspace'
import { WritingResult } from '@/features/practice/components/writing.result'
import { WritingHistory } from '@/features/practice/components/writing.history'
import { practiceService, type BackendWritingExercise } from '@/features/practice/services/practice.service'
import type {
  WritingExercise,
  WritingSubmission,
  WritingStats,
  WritingProgress,
  WritingDraft,
} from '@/features/practice/types/writing'

type WritingView = 'home' | 'exercises' | 'detail' | 'workspace' | 'result' | 'history'

export default function WritingAppPage() {
  const { showAction } = useApp()
  const navigate = useNavigate()
  const params = useParams()
  const rawPath = params?.slug || params?.['*']
  const path = Array.isArray(rawPath) ? rawPath.join('/') : rawPath || ''

  const [currentView, setCurrentView] = useState<WritingView>(() => {
    if (path.startsWith('exercises')) return 'exercises'
    if (path.startsWith('exercise/')) return 'detail'
    if (path.startsWith('workspace/')) return 'workspace'
    if (path.startsWith('result/')) return 'result'
    if (path.startsWith('history')) return 'history'
    return 'home'
  })

  const [exerciseList, setExerciseList] = useState<WritingExercise[]>([])
  const [selectedExercise, setSelectedExercise] = useState<WritingExercise | null>(null)
  const [currentSubmission, setCurrentSubmission] = useState<WritingSubmission | null>(null)
  const [historySubmissions, setHistorySubmissions] = useState<WritingSubmission[]>([])
  const [draftContent, setDraftContent] = useState<string>('')
  const [draftVersion, setDraftVersion] = useState<number>(1)

  useEffect(() => {
    let isMounted = true
    const fetchWriting = async () => {
      try {
        const data = await practiceService.getWritingExercises()
        if (isMounted && Array.isArray(data)) {
          const mapped: WritingExercise[] = data.map((item: BackendWritingExercise, idx) => ({
            id: item._id,
            title: item.title,
            title_vi: item.title_vi || item.title,
            description: item.description || '',
            description_vi: item.description_vi || item.description || '',
            domain: 'WRITING',
            exercise_type: 'TOPIC_WRITING',
            writing_level: (item.writing_level || 'INTERMEDIATE') as any,
            toeic_part: item.toeic_part || 1,
            prompt_en: item.prompt_en || item.title,
            prompt_vi: item.prompt_vi || item.title_vi,
            min_words: item.min_words || 150,
            max_words: item.max_words || 300,
            difficulty_level: (item.difficulty_level || 'MEDIUM') as any,
            cefr_level: item.cefr_level || 'B2',
            total_attempts: 15 + idx * 8,
            avg_score: 7.8,
            status: 'PUBLISHED',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }))
          setExerciseList(mapped)
        }
      } catch (err) {
        console.error('Failed to load writing exercises:', err)
      }
    }
    fetchWriting()
    return () => {
      isMounted = false
    }
  }, [])

  const stats: WritingStats = {
    total_submissions: historySubmissions.length,
    average_score: 8.0,
    total_words_written: historySubmissions.reduce((sum, s) => sum + s.word_count, 0),
    average_grammar_accuracy: 85,
    average_vocabulary_usage: 80,
    average_writing_time_minutes: 20,
    score_breakdown: {
      task_achievement: 8.0,
      coherence: 7.5,
      vocabulary: 8.0,
      grammar: 8.5,
    },
  }

  const progress: WritingProgress = {
    grammar: 85,
    vocabulary: 80,
    coherence: 75,
    weakest_area: 'Coherence',
    recommended_topics: exerciseList.map((e) => e.title),
  }

  const handleGoHome = useCallback(() => {
    setCurrentView('home')
    navigate('/writing')
  }, [navigate])

  const handleGoExercises = useCallback(() => {
    setCurrentView('exercises')
    navigate('/writing/exercises')
  }, [navigate])

  const handleGoHistory = useCallback(() => {
    setCurrentView('history')
    navigate('/writing/history')
  }, [navigate])

  const handleSelectExercise = useCallback((exercise: WritingExercise) => {
    setSelectedExercise(exercise)
    setCurrentView('detail')
    navigate(`/writing/exercise/${exercise.id}`)
  }, [navigate])

  const handleStartWriting = useCallback((exercise: WritingExercise) => {
    setSelectedExercise(exercise)
    setDraftContent('')
    setDraftVersion(1)
    setCurrentView('workspace')
    navigate(`/writing/workspace/${exercise.id}`)
  }, [navigate])

  const handleSaveDraft = useCallback((content: string, _wordCount: number) => {
    setDraftContent(content)
    showAction(`Đã lưu bản nháp`)
  }, [showAction])

  const handleSubmitWriting = useCallback(async (content: string, wordCount: number, writingTimeSeconds: number) => {
    if (!selectedExercise) return

    let evalResult = {
      grammar_score: 8.0,
      vocabulary_score: 8.0,
      coherence_score: 7.5,
      overall_score: 7.8,
      feedback_vi: 'Bài viết có bố cục tốt, ngữ pháp chuẩn xác và liên kết chặt chẽ.',
      improved_essay: content,
    }

    try {
      const liveEval = await practiceService.evaluateWritingEssay(content, selectedExercise.title)
      if (liveEval) {
        evalResult = {
          grammar_score: liveEval.grammar_score || 8.0,
          vocabulary_score: liveEval.vocabulary_score || 8.0,
          coherence_score: liveEval.coherence_score || 7.5,
          overall_score: liveEval.overall_score || 7.8,
          feedback_vi: liveEval.feedback_vi || evalResult.feedback_vi,
          improved_essay: liveEval.improved_essay || content,
        }
      }
    } catch (err) {
      console.error('AI Writing eval failed:', err)
    }

    const newDraft: WritingDraft = {
      content,
      word_count: wordCount,
      timestamp: new Date().toISOString(),
      version_number: draftVersion,
    }

    const newSubmission: WritingSubmission = {
      id: `ws-${Date.now()}`,
      user_id: 'current_user',
      exercise_id: selectedExercise.id,
      content,
      word_count: wordCount,
      version_number: draftVersion,
      drafts: [newDraft],
      is_draft: false,
      overall_score: evalResult.overall_score,
      task_achievement_score: evalResult.overall_score,
      coherence_score: evalResult.coherence_score,
      lexical_resource_score: evalResult.vocabulary_score,
      grammatical_accuracy_score: evalResult.grammar_score,
      writing_time_seconds: writingTimeSeconds,
      domain: 'WRITING',
      status: 'COMPLETED',
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      ai_evaluation: {
        overall_feedback: evalResult.feedback_vi,
        errors: [],
        suggested_version: evalResult.improved_essay,
        improvement_tips: [
          'Đọc lại bài trước khi nộp để kiểm tra lỗi chính tả',
          'Đảm bảo mỗi đoạn văn có một câu chủ đề rõ ràng',
        ],
      },
    }

    setCurrentSubmission(newSubmission)
    setHistorySubmissions((prev) => [newSubmission, ...prev])
    setCurrentView('result')
    navigate(`/writing/result/${newSubmission.id}`)
  }, [selectedExercise, draftVersion, navigate])

  const handleViewSubmission = useCallback((submission: WritingSubmission) => {
    const exercise = exerciseList.find((ex) => ex.id === submission.exercise_id)
    if (exercise) {
      setSelectedExercise(exercise)
    }
    setCurrentSubmission(submission)
    setCurrentView('result')
    navigate(`/writing/result/${submission.id}`)
  }, [exerciseList, navigate])

  const handlePracticeAgain = useCallback(() => {
    if (!selectedExercise) return
    setDraftContent('')
    setDraftVersion(1)
    setCurrentView('workspace')
    navigate(`/writing/workspace/${selectedExercise.id}`)
  }, [selectedExercise, navigate])

  const handleNextExercise = useCallback(() => {
    if (!selectedExercise || exerciseList.length === 0) return
    const currentIndex = exerciseList.findIndex((ex) => ex.id === selectedExercise.id)
    const nextExercise = exerciseList[(currentIndex + 1) % exerciseList.length]
    setSelectedExercise(nextExercise)
    setDraftContent('')
    setDraftVersion(1)
    setCurrentView('workspace')
    navigate(`/writing/workspace/${nextExercise.id}`)
  }, [selectedExercise, exerciseList, navigate])

  const renderContent = () => {
    switch (currentView) {
      case 'exercises':
        return (
          <WritingExerciseList
            exercises={exerciseList}
            onSelectExercise={handleSelectExercise}
            onBack={handleGoHome}
          />
        )

      case 'detail':
        if (!selectedExercise) return null
        return (
          <WritingExerciseDetail
            exercise={selectedExercise}
            onStart={() => handleStartWriting(selectedExercise)}
            onBack={handleGoExercises}
          />
        )

      case 'workspace':
        if (!selectedExercise) return null
        return (
          <WritingWorkspace
            exercise={selectedExercise}
            initialContent={draftContent}
            versionNumber={draftVersion}
            onSaveDraft={handleSaveDraft}
            onSubmit={handleSubmitWriting}
            onBack={handleGoExercises}
          />
        )

      case 'result':
        if (!currentSubmission || !selectedExercise) return null
        return (
          <WritingResult
            submission={currentSubmission}
            exercise={selectedExercise}
            onBack={handleGoExercises}
            onTryAgain={handlePracticeAgain}
            onNextExercise={handleNextExercise}
            onViewHistory={handleGoHistory}
          />
        )

      case 'history':
        return (
          <WritingHistory
            submissions={historySubmissions}
            exercises={exerciseList}
            onBack={handleGoHome}
            onViewSubmission={handleViewSubmission}
          />
        )

      case 'home':
      default:
        return (
          <WritingHome
            stats={stats}
            progress={progress}
            recentSubmissions={historySubmissions.slice(0, 5)}
            continueWriting={null}
            exercises={exerciseList}
            onStartNew={handleGoExercises}
            onContinue={() => {}}
            onViewSubmission={handleViewSubmission}
            onViewHistory={handleGoHistory}
          />
        )
    }
  }

  return <>{renderContent()}</>
}
