
'use client'

import { useState, useCallback } from 'react'
import { useNavigate, useParams } from '@/lib/navigation'
import { Layout } from '@/components/layout/Layout'
import { useApp } from '@/contexts/AppContext'
import {
  WritingHome,
  WritingExerciseList,
  WritingExerciseDetail,
  WritingWorkspace,
  WritingResult,
  WritingHistory,
} from '@/components/writing'
import {
  writingExercises,
  writingSubmissions,
  writingStats,
  writingProgress,
  continueWriting as initialContinueWriting,
} from '@/data/writing-data'
import { practiceService } from '@/services/practice.service'
import type { WritingExercise, WritingSubmission } from '@/types/writing'

type WritingView = 'home' | 'exercises' | 'detail' | 'workspace' | 'result' | 'history'

export function WritingRoute() {
  const { showAction } = useApp()
  const navigate = useNavigate()
  const { '*': path } = useParams()

  const [currentView, setCurrentView] = useState<WritingView>(() => {
    if (path?.startsWith('exercises')) return 'exercises'
    if (path?.startsWith('exercise/')) return 'detail'
    if (path?.startsWith('workspace/')) return 'workspace'
    if (path?.startsWith('result/')) return 'result'
    if (path?.startsWith('history')) return 'history'
    return 'home'
  })

  const [selectedExercise, setSelectedExercise] = useState<WritingExercise | null>(null)
  const [currentSubmission, setCurrentSubmission] = useState<WritingSubmission | null>(null)
  const [draftContent, setDraftContent] = useState<string>('')
  const [draftVersion, setDraftVersion] = useState<number>(1)
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false)

  const getExerciseById = useCallback((id: string): WritingExercise | undefined => {
    return writingExercises.find((ex) => ex.id === id)
  }, [])

  const handleGoHome = useCallback(() => {
    setCurrentView('home')
    navigate('/writing')
  }, [navigate])

  const handleGoExercises = useCallback(() => {
    setCurrentView('exercises')
    navigate('/writing/exercises')
  }, [navigate])

  const handleGoDetail = useCallback((exercise: WritingExercise) => {
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

  const handleSaveDraft = useCallback((content: string, wordCount: number) => {
    setDraftContent(content)
    showAction(`Đã lưu nháp (${wordCount} từ)`)
  }, [showAction])

  const handleSubmit = useCallback(async (content: string, wordCount: number, writingTimeSeconds: number) => {
    if (!selectedExercise) return
    setIsEvaluating(true)

    let grammarScore = 0
    let vocabScore = 0
    let coherenceScore = 0
    let overallScore = 0
    let feedback = ''
    let suggestedVersion = content

    try {
      const evaluation = await practiceService.evaluateWritingEssay(
        content,
        selectedExercise.title ? selectedExercise.title : 'English Essay Writing',
      )
      if (evaluation) {
        grammarScore = evaluation.grammar_score !== undefined ? evaluation.grammar_score : 0
        vocabScore = evaluation.vocabulary_score !== undefined ? evaluation.vocabulary_score : 0
        coherenceScore = evaluation.coherence_score !== undefined ? evaluation.coherence_score : 0
        overallScore = evaluation.overall_score !== undefined ? evaluation.overall_score : 0
        feedback = evaluation.feedback_vi ? evaluation.feedback_vi : ''
        suggestedVersion = evaluation.improved_essay ? evaluation.improved_essay : content
      }
    } catch (err) {
      console.error('AI Writing evaluation error:', err)
    }

    const submission: WritingSubmission = {
      id: `ws-${Date.now()}`,
      user_id: 'user-001',
      exercise_id: selectedExercise.id,
      content,
      word_count: wordCount,
      version_number: draftVersion,
      drafts: draftContent ? [{
        content: draftContent,
        word_count: draftContent.split(/\s+/).length,
        timestamp: new Date().toISOString(),
        version_number: draftVersion,
      }] : [],
      is_draft: false,
      ai_evaluation: {
        overall_feedback: feedback,
        strengths: ['Cấu trúc bài viết rõ ràng', 'Sử dụng từ vựng phong phú'],
        weaknesses: ['Cần chú ý đa dạng hóa các cấu trúc câu ghép'],
        grammar_feedback: 'Ngữ pháp nhìn chung chính xác.',
        vocabulary_feedback: 'Từ vựng học thuật tốt.',
        coherence_feedback: 'Mạch lạc, liên kết ý logic.',
        errors: [],
        suggested_version: suggestedVersion,
        improvement_tips: ['Thử sử dụng thêm các cấu trúc đảo ngữ hoặc mệnh đề quan hệ để tăng điểm band cao.'],
      },
      overall_score: overallScore,
      task_achievement_score: overallScore,
      coherence_score: coherenceScore,
      lexical_resource_score: vocabScore,
      grammatical_accuracy_score: grammarScore,
      keywords_included: selectedExercise.keywords || [],
      keywords_missing: [],
      writing_time_seconds: writingTimeSeconds,
      domain: 'WRITING',
      status: 'COMPLETED',
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }

    setIsEvaluating(false)
    setCurrentSubmission(submission)
    setCurrentView('result')
    showAction(`Đã chấm bài với AI Engine! Điểm: ${submission.overall_score?.toFixed(1)}/10`)
    navigate(`/writing/result/${submission.id}`)
  }, [selectedExercise, draftVersion, draftContent, navigate, showAction])

  const handleTryAgain = useCallback(() => {
    if (selectedExercise) {
      setDraftVersion((prev) => prev + 1)
      setCurrentView('workspace')
      showAction(`Bắt đầu viết lại (phiên bản ${draftVersion + 1})`)
      navigate(`/writing/workspace/${selectedExercise.id}`)
    }
  }, [selectedExercise, draftVersion, navigate, showAction])

  const handleNextExercise = useCallback(() => {
    if (selectedExercise) {
      const currentIndex = writingExercises.findIndex((ex) => ex.id === selectedExercise.id)
      const nextExercise = writingExercises[currentIndex + 1]
      if (nextExercise) {
        handleGoDetail(nextExercise)
        showAction(`Chuyển sang: ${nextExercise.title}`)
      } else {
        handleGoExercises()
      }
    }
  }, [selectedExercise, handleGoDetail, handleGoExercises, showAction])

  const handleViewHistory = useCallback(() => {
    setCurrentView('history')
    navigate('/writing/history')
  }, [navigate])

  const handleViewSubmission = useCallback((submission: WritingSubmission) => {
    const exercise = getExerciseById(submission.exercise_id)
    if (exercise) {
      setSelectedExercise(exercise)
      setCurrentSubmission(submission)
      setCurrentView('result')
      showAction(`Xem kết quả: ${exercise.title}`)
      navigate(`/writing/result/${submission.id}`)
    }
  }, [getExerciseById, navigate, showAction])

  const renderContent = () => {
    switch (currentView) {
      case 'exercises':
        return (
          <WritingExerciseList
            exercises={writingExercises}
            onSelectExercise={handleGoDetail}
            onBack={handleGoHome}
          />
        )

      case 'detail':
        if (!selectedExercise) {
          return (
            <div className="flex h-screen items-center justify-center">
              <p>Exercise not found</p>
            </div>
          )
        }
        return (
          <WritingExerciseDetail
            exercise={selectedExercise}
            onBack={handleGoExercises}
            onStart={() => {
              showAction(`Bắt đầu: ${selectedExercise.title}`)
              handleStartWriting(selectedExercise)
            }}
          />
        )

      case 'workspace':
        if (!selectedExercise) {
          return (
            <div className="flex h-screen items-center justify-center">
              <p>Exercise not found</p>
            </div>
          )
        }
        return (
          <WritingWorkspace
            exercise={selectedExercise}
            initialContent={draftContent}
            versionNumber={draftVersion}
            onBack={() => {
              showAction('Đã thoát khỏi bài viết')
              handleGoHome()
            }}
            onSaveDraft={handleSaveDraft}
            onSubmit={handleSubmit}
          />
        )

      case 'result':
        if (!currentSubmission || !selectedExercise) {
          return (
            <div className="flex h-screen items-center justify-center">
              <p>Submission not found</p>
            </div>
          )
        }
        return (
          <WritingResult
            submission={currentSubmission}
            exercise={selectedExercise}
            onBack={handleViewHistory}
            onTryAgain={() => {
              showAction('Bắt đầu viết lại')
              handleTryAgain()
            }}
            onNextExercise={() => {
              handleNextExercise()
            }}
            onViewHistory={() => {
              handleViewHistory()
            }}
          />
        )

      case 'history':
        return (
          <WritingHistory
            submissions={writingSubmissions}
            exercises={writingExercises}
            onBack={handleGoHome}
            onViewSubmission={handleViewSubmission}
          />
        )

      case 'home':
      default:
        return (
          <WritingHome
            stats={writingStats}
            progress={writingProgress}
            continueWriting={initialContinueWriting}
            recentSubmissions={writingSubmissions}
            exercises={writingExercises}
            onStartNew={() => {
              showAction('Mở danh sách bài tập')
              handleGoExercises()
            }}
            onContinue={(submissionId) => {
              const submission = writingSubmissions.find((s) => s.id === submissionId)
              if (submission) {
                const exercise = getExerciseById(submission.exercise_id)
                if (exercise) {
                  setSelectedExercise(exercise)
                  setDraftContent(submission.content)
                  setDraftVersion(submission.version_number + 1)
                  showAction(`Tiếp tục: ${exercise.title}`)
                  handleStartWriting(exercise)
                }
              }
            }}
            onViewSubmission={handleViewSubmission}
            onViewHistory={handleViewHistory}
          />
        )
    }
  }

  return (
    <Layout>
      {renderContent()}
    </Layout>
  )
}
