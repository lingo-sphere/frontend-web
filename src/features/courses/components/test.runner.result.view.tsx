// Giao diện hiển thị kết quả kiểm tra khóa học, thống kê đúng sai và phân tích chi tiết.

'use client'

import type { Course } from '@/types/api.types'
import type {
  WrongQuestionItem,
  AiExplanationsData,
} from '@/features/courses/types/test.runner.types'
import { TestRunnerResultHeader } from '@/features/courses/components/test.runner.result.header'
import { TestRunnerNextCourses } from '@/features/courses/components/test.runner.next.courses'
import { TestRunnerAiTutor } from '@/features/courses/components/test.runner.ai.tutor'

interface TestRunnerResultViewProps {
  scoreResult: {
    correctCount: number
    totalQuestions: number
    score: number
    isPassed: boolean
  }
  testType: string
  passingScore: number
  bestScore: number
  isNewHighScore: boolean
  progressionNote: string | null
  growthDiff: { scoreDiff: number; percent: number } | null
  wrongQuestionsList: WrongQuestionItem[]
  isLoadingAi: boolean
  showAiDetails: boolean
  aiExplanations: AiExplanationsData | null
  attemptsCount: number
  recommendedNextCourses?: (Course & { recommendation_reason?: string; match_score?: number })[]
  onShowHistory: () => void
  onRetry: () => void
  onExplainMistakes: () => void
  onToggleAiDetails: () => void
  onBackToLessons?: () => void
  onNavigateCourse?: (slugOrId: string) => void
  onDrillTopic?: (topic: string) => void
  onPracticeTopic?: (item: WrongQuestionItem) => void
  onOpenMistakeVault?: () => void
}

export function TestRunnerResultView({
  scoreResult,
  testType,
  passingScore,
  bestScore,
  isNewHighScore,
  progressionNote,
  growthDiff,
  wrongQuestionsList,
  isLoadingAi,
  showAiDetails,
  aiExplanations,
  attemptsCount,
  recommendedNextCourses = [],
  onShowHistory,
  onRetry,
  onExplainMistakes,
  onToggleAiDetails,
  onBackToLessons,
  onNavigateCourse,
  onDrillTopic,
  onPracticeTopic,
  onOpenMistakeVault,
}: TestRunnerResultViewProps) {
  return (
    <div className="space-y-3.5">
      <TestRunnerResultHeader
        scoreResult={scoreResult}
        testType={testType}
        passingScore={passingScore}
        bestScore={bestScore}
        isNewHighScore={isNewHighScore}
        attemptsCount={attemptsCount}
        progressionNote={progressionNote}
        growthDiff={growthDiff}
        onShowHistory={onShowHistory}
        onRetry={onRetry}
      />

      <TestRunnerNextCourses
        isPassed={scoreResult.isPassed}
        passingScore={passingScore}
        testType={testType}
        recommendedNextCourses={recommendedNextCourses}
        onNavigateCourse={onNavigateCourse}
        onBackToLessons={onBackToLessons}
        onRetry={onRetry}
      />

      <TestRunnerAiTutor
        wrongQuestionsList={wrongQuestionsList}
        isLoadingAi={isLoadingAi}
        showAiDetails={showAiDetails}
        aiExplanations={aiExplanations}
        onExplainMistakes={onExplainMistakes}
        onToggleAiDetails={onToggleAiDetails}
        onDrillTopic={onDrillTopic}
        onPracticeTopic={onPracticeTopic}
        onOpenMistakeVault={onOpenMistakeVault}
      />
    </div>
  )
}
