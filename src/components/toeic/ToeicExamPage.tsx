import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { courseService } from '@/services/course.service'
import type { Course } from '@/types/api.types'
import {
  toeicTest1,
  toeicTest1Parts,
  toeicTest1AnswerKey,
  getPartByNumber,
} from '@/data/toeic-test-1-data'
import type { ToeicQuestion } from '@/types/toeic'
import { ToeicModeSelector, type PracticeMode } from '@/components/toeic/ToeicModeSelector'
import { ToeicExamResult, type ExamResultMetrics } from '@/components/toeic/ToeicExamResult'
import { ToeicQuestionCard } from '@/components/toeic/ToeicQuestionCard'
import { ToeicQuestionNav } from '@/components/toeic/ToeicQuestionNav'

interface ExamState {
  mode: PracticeMode
  selectedParts: number[]
  currentQuestionIndex: number
  answers: Record<number, string>
  flagged: number[]
  timeRemaining: number
  started: boolean
  submitted: boolean
  showAnswer: boolean
  timedMode: boolean
}

const PART_TIMINGS: Record<number, { questions: number; timeMinutes: number; description: string }> = {
  1: { questions: 6, timeMinutes: 3, description: 'Phần nghe mô tả tranh (Part 1)' },
  2: { questions: 25, timeMinutes: 9, description: 'Phần nghe câu hỏi - đáp (Part 2)' },
  3: { questions: 39, timeMinutes: 17, description: 'Phần nghe đoạn hội thoại (Part 3)' },
  4: { questions: 30, timeMinutes: 14, description: 'Phần nghe bài nói ngắn (Part 4)' },
  5: { questions: 30, timeMinutes: 12, description: 'Hoàn thành câu ngữ pháp & từ vựng (Part 5)' },
  6: { questions: 16, timeMinutes: 8, description: 'Hoàn thành đoạn văn (Part 6)' },
  7: { questions: 54, timeMinutes: 55, description: 'Đọc hiểu đoạn đơn & đoạn kép (Part 7)' },
}

const PART_TIPS: Record<number, string> = {
  1: 'Quan sát kỹ hành động của người, đồ vật và bối cảnh xung quanh trước khi nghe.',
  2: 'Tập trung bắt từ để hỏi (Who, Where, When, Why, How) và tránh bẫy từ đồng âm.',
  3: 'Đọc lướt 3 câu hỏi trước khi audio phát để định vị sẵn thông tin cần nghe.',
  4: 'Xác định nhanh bối cảnh (sân bay, thông báo công ty, bản tin thời tiết).',
  5: 'Xác định từ loại trước và sau chỗ trống trước khi xét đến nghĩa của từ.',
  6: 'Đọc lướt cả đoạn văn để nắm mạch nội dung trước khi chọn câu điền phù hợp.',
  7: 'Đọc câu hỏi trước -> Tìm từ khóa (keywords) -> Quét đoạn văn để tìm đáp án.',
}

const createMockQuestionsForPart = (partNum: number, startQ: number, count: number): ToeicQuestion[] => {
  const questions: ToeicQuestion[] = []
  for (let i = 0; i < count; i++) {
    const qNum = startQ + i
    const correctOption = toeicTest1AnswerKey[qNum] || 'A'
    questions.push({
      id: `p${partNum}-q${qNum}`,
      examId: 'toeic_2019_test1',
      partId: `p${partNum}-t1`,
      partNumber: partNum,
      questionNumber: qNum,
      questionType: 'MULTIPLE_CHOICE',
      questionTextEn: `Question ${qNum}: Select the best answer to complete the sentence or respond.`,
      options: [
        { key: 'A', textEn: 'Option A statement' },
        { key: 'B', textEn: 'Option B statement' },
        { key: 'C', textEn: 'Option C statement' },
        { key: 'D', textEn: 'Option D statement' },
      ],
      correctOption,
      difficultyLevel: 'MEDIUM',
      skillType: partNum <= 4 ? 'LISTENING' : 'READING',
      hasPassage: partNum >= 6,
      status: 'PUBLISHED',
    })
  }
  return questions
}

const createPart6Questions = (): ToeicQuestion[] => {
  const passages = [
    { id: 'p6-1', title: 'Company Policy Update', start: 131 },
    { id: 'p6-2', title: 'Job Opening Announcement', start: 135 },
    { id: 'p6-3', title: 'Product Recall Notice', start: 139 },
    { id: 'p6-4', title: 'Customer Survey Request', start: 143 },
  ]
  const questions: ToeicQuestion[] = []
  passages.forEach((passage) => {
    for (let i = 0; i < 4; i++) {
      questions.push({
        id: `p6-q${passage.start + i}`,
        examId: 'toeic_2019_test1',
        partId: 'p6-t1',
        partNumber: 6,
        questionNumber: passage.start + i,
        passageId: passage.id,
        passageTitle: passage.title,
        questionType: 'MULTIPLE_CHOICE',
        questionTextEn: `Question ${i + 1} for ${passage.title}`,
        options: [
          { key: 'A', textEn: 'Option A' },
          { key: 'B', textEn: 'Option B' },
          { key: 'C', textEn: 'Option C' },
          { key: 'D', textEn: 'Option D' },
        ],
        correctOption: 'A',
        difficultyLevel: 'MEDIUM',
        skillType: 'READING',
        hasPassage: true,
        status: 'PUBLISHED',
      })
    }
  })
  return questions
}

const createPart7Questions = (): ToeicQuestion[] => {
  const questions: ToeicQuestion[] = []
  const passageConfigs = [
    { id: 'p7-1', title: 'Hotel Confirmation', start: 147, questions: 5 },
    { id: 'p7-2', title: 'Job Offer Letter', start: 152, questions: 5 },
    { id: 'p7-3', title: 'Travel Itinerary', start: 157, questions: 5 },
    { id: 'p7-4', title: 'Meeting Agenda', start: 162, questions: 5 },
    { id: 'p7-5', title: 'Product Announcement', start: 167, questions: 5 },
    { id: 'p7-6', title: 'Event Invitation', start: 172, questions: 5 },
    { id: 'p7-7', title: 'Policy Update', start: 177, questions: 5 },
    { id: 'p7-8', title: 'Customer Service Email', start: 182, questions: 5 },
    { id: 'p7-9', title: 'Contract Agreement', start: 187, questions: 5 },
    { id: 'p7-10', title: 'Training Schedule', start: 192, questions: 5 },
    { id: 'p7-11', title: 'Newsletter Article', start: 197, questions: 4 },
  ]
  passageConfigs.forEach((passage) => {
    for (let i = 0; i < passage.questions; i++) {
      questions.push({
        id: `p7-q${passage.start + i}`,
        examId: 'toeic_2019_test1',
        partId: 'p7-t1',
        partNumber: 7,
        questionNumber: passage.start + i,
        passageId: passage.id,
        passageTitle: passage.title,
        questionType: 'MULTIPLE_CHOICE',
        questionTextEn: `Passage Question ${passage.start + i}: According to the passage, what is mentioned?`,
        options: [
          { key: 'A', textEn: 'Option A' },
          { key: 'B', textEn: 'Option B' },
          { key: 'C', textEn: 'Option C' },
          { key: 'D', textEn: 'Option D' },
        ],
        correctOption: 'A',
        difficultyLevel: 'HARD',
        skillType: 'READING',
        hasPassage: true,
        status: 'PUBLISHED',
      })
    }
  })
  return questions
}

export function ToeicExamPage() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const { examId } = useParams()
  const isVietnamese = i18n.language === 'vi'

  const [showModeSelector, setShowModeSelector] = useState<boolean>(true)
  const [allQuestions, setAllQuestions] = useState<ToeicQuestion[]>([])
  const [state, setState] = useState<ExamState>({
    mode: 'FULL',
    selectedParts: [1, 2, 3, 4, 5, 6, 7],
    currentQuestionIndex: 0,
    answers: {},
    flagged: [],
    timeRemaining: 135 * 60,
    started: false,
    submitted: false,
    showAnswer: false,
    timedMode: true,
  })

  const [recommendedCourses, setRecommendedCourses] = useState<
    (Course & { recommendation_reason?: string; match_score?: number })[]
  >([])
  const [targetBand, setTargetBand] = useState<string>('')
  const [levelLabel, setLevelLabel] = useState<string>('')
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState<boolean>(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const generateQuestionsForParts = useCallback((parts: number[]): ToeicQuestion[] => {
    let questions: ToeicQuestion[] = []
    if (parts.includes(1)) questions = [...questions, ...createMockQuestionsForPart(1, 1, 6)]
    if (parts.includes(2)) questions = [...questions, ...createMockQuestionsForPart(2, 7, 25)]
    if (parts.includes(3)) questions = [...questions, ...createMockQuestionsForPart(3, 32, 39)]
    if (parts.includes(4)) questions = [...questions, ...createMockQuestionsForPart(4, 71, 30)]
    if (parts.includes(5)) questions = [...questions, ...createMockQuestionsForPart(5, 101, 30)]
    if (parts.includes(6)) questions = [...questions, ...createPart6Questions()]
    if (parts.includes(7)) questions = [...questions, ...createPart7Questions()]
    return questions
  }, [])

  const calculateResults = useCallback((): ExamResultMetrics => {
    let correct = 0
    let listeningCorrect = 0
    let listeningTotal = 0
    let readingCorrect = 0
    let readingTotal = 0

    const partStats: Record<number, { correct: number; total: number }> = {}

    allQuestions.forEach((q) => {
      const part = q.partNumber || 1
      if (!partStats[part]) {
        partStats[part] = { correct: 0, total: 0 }
      }
      partStats[part].total++

      const isCorrect = state.answers[q.questionNumber] === q.correctOption
      if (isCorrect) {
        correct++
        partStats[part].correct++
        if (part <= 4) {
          listeningCorrect++
        } else {
          readingCorrect++
        }
      }

      if (part <= 4) {
        listeningTotal++
      } else {
        readingTotal++
      }
    })

    const total = allQuestions.length || 1
    const percentage = Math.round((correct / total) * 100)

    const estimatedListening =
      listeningTotal > 0
        ? Math.min(495, Math.max(5, Math.round(((listeningCorrect / listeningTotal) * 495) / 5) * 5))
        : 0
    const estimatedReading =
      readingTotal > 0
        ? Math.min(495, Math.max(5, Math.round(((readingCorrect / readingTotal) * 495) / 5) * 5))
        : 0
    const estimatedTotal =
      estimatedListening > 0 || estimatedReading > 0
        ? estimatedListening + estimatedReading
        : Math.min(990, Math.max(10, Math.round(((percentage / 100) * 990) / 5) * 5))

    return {
      correct,
      total,
      percentage,
      listeningCorrect,
      listeningTotal,
      readingCorrect,
      readingTotal,
      estimatedListening,
      estimatedReading,
      estimatedTotal,
      partStats,
    }
  }, [allQuestions, state.answers])

  useEffect(() => {
    if (!state.submitted) return

    const res = calculateResults()
    setIsLoadingRecommendations(true)

    const weakSkills: string[] = []
    if (res.listeningTotal > 0 && res.listeningCorrect / res.listeningTotal < 0.6) weakSkills.push('LISTENING')
    if (res.readingTotal > 0 && res.readingCorrect / res.readingTotal < 0.6) weakSkills.push('READING')

    courseService
      .getRecommendedCourses({
        total_score: res.estimatedTotal,
        listening_score: res.estimatedListening,
        reading_score: res.estimatedReading,
        weak_skills: weakSkills,
      })
      .then((data) => {
        if (data?.recommendations && data.recommendations.length > 0) {
          setRecommendedCourses(data.recommendations)
          setTargetBand(data.target_band || '')
          setLevelLabel(data.level_label || '')
        }
      })
      .catch((err) => {
        console.warn('Cannot fetch recommendations:', err)
      })
      .finally(() => {
        setIsLoadingRecommendations(false)
      })
  }, [state.submitted, calculateResults])

  useEffect(() => {
    if (!state.started || state.submitted || !state.timedMode) return

    timerRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.timeRemaining <= 1) {
          clearInterval(timerRef.current as NodeJS.Timeout)
          return { ...prev, timeRemaining: 0, submitted: true, showAnswer: true }
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 }
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [state.started, state.submitted, state.timedMode])

  const handleSelectMode = (mode: PracticeMode, parts: number[], timed: boolean) => {
    const questions = generateQuestionsForParts(parts)
    setAllQuestions(questions)

    let time = 0
    if (timed) {
      if (mode === 'FULL') time = 135 * 60
      else if (mode === 'LISTENING') time = 45 * 60
      else if (mode === 'READING') time = 75 * 60
      else {
        time = parts.reduce((acc, p) => acc + (PART_TIMINGS[p]?.timeMinutes || 10) * 60, 0)
      }
    }

    setState({
      mode,
      selectedParts: parts,
      currentQuestionIndex: 0,
      answers: {},
      flagged: [],
      timeRemaining: time,
      started: true,
      submitted: false,
      showAnswer: false,
      timedMode: timed,
    })
    setShowModeSelector(false)
  }

  const handleSelectAnswer = (optionKey: string) => {
    const currentQ = allQuestions[state.currentQuestionIndex]
    if (!currentQ || state.submitted) return
    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [currentQ.questionNumber]: optionKey },
    }))
  }

  const goToQuestion = (index: number) => {
    if (index < 0 || index >= allQuestions.length) return
    setState((prev) => ({ ...prev, currentQuestionIndex: index }))
  }

  const toggleFlag = () => {
    const currentQ = allQuestions[state.currentQuestionIndex]
    if (!currentQ) return
    setState((prev) => ({
      ...prev,
      flagged: prev.flagged.includes(currentQ.questionNumber)
        ? prev.flagged.filter((q) => q !== currentQ.questionNumber)
        : [...prev.flagged, currentQ.questionNumber],
    }))
  }

  const handleSubmit = () => {
    setState((prev) => ({ ...prev, submitted: true, showAnswer: true }))
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (showModeSelector) {
    return (
      <ToeicModeSelector
        title={toeicTest1.title}
        description={toeicTest1.description}
        onSelectMode={handleSelectMode}
        onBack={() => navigate('/toeic')}
      />
    )
  }

  if (state.submitted) {
    const results = calculateResults()
    return (
      <ToeicExamResult
        results={results}
        recommendedCourses={recommendedCourses}
        targetBand={targetBand}
        levelLabel={levelLabel}
        isLoadingRecommendations={isLoadingRecommendations}
        onRetry={() => {
          setState((prev) => ({
            ...prev,
            answers: {},
            flagged: [],
            submitted: false,
            showAnswer: false,
            currentQuestionIndex: 0,
          }))
        }}
        onChooseAnother={() => {
          setShowModeSelector(true)
          setAllQuestions([])
        }}
      />
    )
  }

  const currentQuestion = allQuestions[state.currentQuestionIndex]
  const currentPart = currentQuestion?.partNumber || 1

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="sticky top-0 z-10 border-b border-border bg-surface">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setShowModeSelector(true)}>
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-[14px] font-semibold text-text-primary">{toeicTest1.title}</h1>
              <p className="text-[11px] text-text-tertiary">
                {isVietnamese ? 'Câu' : 'Question'} {state.currentQuestionIndex + 1} / {allQuestions.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {state.timedMode && state.timeRemaining > 0 && (
              <div
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${
                  state.timeRemaining < 300 ? 'bg-red-100 text-red-600' : 'bg-surface-subtle'
                }`}
              >
                <Clock size={16} />
                <span className="font-mono text-[14px] font-semibold">{formatTime(state.timeRemaining)}</span>
              </div>
            )}
            <Button size="sm" className="gap-1 bg-primary hover:bg-primary-hover" onClick={handleSubmit}>
              {isVietnamese ? 'Nộp bài' : 'Submit'}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 p-4 lg:grid-cols-[1fr_280px]">
        {currentQuestion && (
          <ToeicQuestionCard
            question={currentQuestion}
            currentPart={currentPart}
            partName={getPartByNumber(currentPart)?.nameVi}
            partTip={PART_TIPS[currentPart]}
            selectedOption={state.answers[currentQuestion.questionNumber]}
            isFlagged={state.flagged.includes(currentQuestion.questionNumber)}
            showAnswer={state.showAnswer}
            isSubmitted={state.submitted}
            currentIndex={state.currentQuestionIndex}
            totalQuestions={allQuestions.length}
            onSelectAnswer={handleSelectAnswer}
            onToggleFlag={toggleFlag}
            onPrev={() => goToQuestion(state.currentQuestionIndex - 1)}
            onNext={() => goToQuestion(state.currentQuestionIndex + 1)}
          />
        )}

        <ToeicQuestionNav
          questions={allQuestions}
          answers={state.answers}
          flagged={state.flagged}
          currentIndex={state.currentQuestionIndex}
          currentPart={currentPart}
          partTiming={PART_TIMINGS[currentPart]}
          onGoToQuestion={goToQuestion}
        />
      </div>
    </div>
  )
}
