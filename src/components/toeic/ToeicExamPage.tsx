// ============================================================
// TOEIC Exam Page - Full với lựa chọn luyện tập
// LingoSphere
// Updated: 2026-08-22 - Added i18n support
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, ChevronLeft, ChevronRight, Flag, CheckCircle2, XCircle, Play, Settings, AlertCircle, Headphones, BookOpen, Trophy } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  toeicTest1,
  toeicTest1Parts,
  toeicTest1AnswerKey,
  getPartByNumber,
} from '@/data/toeic-test-1-data'
import type { ToeicQuestion, ToeicPart } from '@/types/toeic'

// ============================================================
// TYPES
// ============================================================

type PracticeMode =
  | 'FULL'        // Full test 7 parts
  | 'LISTENING'   // Part 1-4
  | 'READING'     // Part 5-7
  | 'PART'        // Single part

interface ExamState {
  mode: PracticeMode
  selectedParts: number[]
  currentPartIndex: number
  currentQuestionIndex: number
  answers: Record<number, string>
  flagged: number[]
  timeRemaining: number
  started: boolean
  submitted: boolean
  showAnswer: boolean
  timedMode: boolean
}

// Part timing configs (theo thực tế TOEIC)
const getPartTimings = (isVietnamese: boolean) => ({
  1: { questions: 6, seconds: 0, description: isVietnamese ? 'Đi theo audio' : 'Follow audio' },
  2: { questions: 25, seconds: 0, description: isVietnamese ? 'Đi theo audio' : 'Follow audio' },
  3: { questions: 39, seconds: 0, description: isVietnamese ? 'Đi theo audio' : 'Follow audio' },
  4: { questions: 30, seconds: 0, description: isVietnamese ? 'Đi theo audio' : 'Follow audio' },
  5: { questions: 30, seconds: 18 * 60, description: '18 ' + (isVietnamese ? 'phút' : 'min') },
  6: { questions: 16, seconds: 18 * 60, description: '18 ' + (isVietnamese ? 'phút' : 'min') },
  7: { questions: 54, seconds: 60 * 60, description: '60 ' + (isVietnamese ? 'phút' : 'min') },
})

// Tips làm bài đúng giờ
const getPartTips = (isVietnamese: boolean) => ({
  1: isVietnamese ? 'Phần này khá ngắn, hãy tập trung vào những gì đang xảy ra trong hình.' : 'This part is short, focus on what is happening in the picture.',
  2: isVietnamese ? 'Chỉ nghe một lần, hãy chọn nhanh câu trả lời phù hợp nhất.' : 'Listen only once, quickly choose the best answer.',
  3: isVietnamese ? 'Đọc câu hỏi TRƯỚC khi audio phát để biết cần nghe thông tin gì.' : 'Read questions BEFORE audio plays to know what to listen for.',
  4: isVietnamese ? 'Tương tự Part 3, đọc câu hỏi trước. Thường có thông tin về người nói, chủ đề, và mục đích.' : 'Similar to Part 3, read questions first. Information about speaker, topic, and purpose is often included.',
  5: isVietnamese ? '30 câu trong 18 phút = 36 giây/câu. Đọc nhanh, không suy nghĩ quá lâu.' : '30 questions in 18 minutes = 36 seconds/question. Read fast, do not overthink.',
  6: isVietnamese ? '16 câu trong 18 phút = hơn 1 phút/câu. Đọc kỹ passage trước, rồi trả lời.' : '16 questions in 18 minutes = over 1 min/question. Read passage carefully first, then answer.',
  7: isVietnamese ? '54 câu trong 60 phút = hơn 1 phút/câu. Ưu tiên đọc câu hỏi trước, tìm keyword trong passage.' : '54 questions in 60 minutes = over 1 min/question. Prioritize reading questions first, find keywords in passage.',
})

// ============================================================
// MOCK QUESTIONS - All Parts
// ============================================================

// Part 1 - Photographs (6 câu: 1-6)
const part1Questions: ToeicQuestion[] = Array.from({ length: 6 }, (_, i) => ({
  id: `p1-q${i + 1}`,
  examId: 'toeic_2019_test1',
  partId: 'p1-t1',
  partNumber: 1,
  questionNumber: i + 1,
  questionType: 'MULTIPLE_CHOICE',
  questionTextEn: 'What is happening in this photograph?',
  instructionEn: 'Listen to the statement and choose the best description.',
  options: [
    { key: 'A', textEn: 'A man is talking on the phone.' },
    { key: 'B', textEn: 'Someone is typing on a keyboard.' },
    { key: 'C', textEn: 'A woman is writing a note.' },
    { key: 'D', textEn: 'They are having a meeting.' },
  ],
  correctOption: 'A',
  difficultyLevel: 'EASY',
  skillType: 'LISTENING',
  hasAudio: true,
  hasImage: true,
  status: 'PUBLISHED',
}))

// Part 2 - Question-Response (25 câu: 7-31)
const part2Questions: ToeicQuestion[] = Array.from({ length: 25 }, (_, i) => ({
  id: `p2-q${i + 7}`,
  examId: 'toeic_2019_test1',
  partId: 'p2-t1',
  partNumber: 2,
  questionNumber: i + 7,
  questionType: 'MULTIPLE_CHOICE',
  questionTextEn: 'Listen to the question and choose the best response.',
  options: [
    { key: 'A', textEn: 'Yes, I am.' },
    { key: 'B', textEn: 'It is on the table.' },
    { key: 'C', textEn: 'Nice to meet you.' },
    { key: 'D', textEn: 'I think so.' },
  ],
  correctOption: 'A',
  difficultyLevel: 'EASY',
  skillType: 'LISTENING',
  hasAudio: true,
  status: 'PUBLISHED',
}))

// Part 3 - Conversations (39 câu: 32-70)
const createPart3Questions = (): ToeicQuestion[] => {
  const questions: ToeicQuestion[] = []
  const startNum = 32
  for (let conv = 0; conv < 13; conv++) {
    const baseNum = startNum + conv * 3
    const qTypes = [
      'What is the conversation mainly about?',
      'Where does this conversation most likely take place?',
      'When will they meet?',
    ]
    for (let i = 0; i < 3; i++) {
      questions.push({
        id: `p3-q${baseNum + i}`,
        examId: 'toeic_2019_test1',
        partId: 'p3-t1',
        partNumber: 3,
        questionNumber: baseNum + i,
        questionType: 'MULTIPLE_CHOICE',
        questionTextEn: qTypes[i],
        passageTitle: `Conversation ${conv + 1}`,
        options: [
          { key: 'A', textEn: 'Option A' },
          { key: 'B', textEn: 'Option B' },
          { key: 'C', textEn: 'Option C' },
          { key: 'D', textEn: 'Option D' },
        ],
        correctOption: 'A',
        difficultyLevel: 'MEDIUM',
        skillType: 'LISTENING',
        hasAudio: true,
        hasPassage: true,
        status: 'PUBLISHED',
      })
    }
  }
  return questions
}

// Part 4 - Short Talks (30 câu: 71-100)
const createPart4Questions = (): ToeicQuestion[] => {
  const questions: ToeicQuestion[] = []
  const startNum = 71
  for (let talk = 0; talk < 10; talk++) {
    const baseNum = startNum + talk * 3
    const qTypes = [
      'What is the main purpose of this announcement?',
      'When will the changes take effect?',
      'Who is this announcement addressed to?',
    ]
    for (let i = 0; i < 3; i++) {
      questions.push({
        id: `p4-q${baseNum + i}`,
        examId: 'toeic_2019_test1',
        partId: 'p4-t1',
        partNumber: 4,
        questionNumber: baseNum + i,
        questionType: 'MULTIPLE_CHOICE',
        questionTextEn: qTypes[i],
        passageTitle: `Short Talk ${talk + 1}`,
        options: [
          { key: 'A', textEn: 'Option A' },
          { key: 'B', textEn: 'Option B' },
          { key: 'C', textEn: 'Option C' },
          { key: 'D', textEn: 'Option D' },
        ],
        correctOption: 'A',
        difficultyLevel: 'MEDIUM',
        skillType: 'LISTENING',
        hasAudio: true,
        hasPassage: true,
        status: 'PUBLISHED',
      })
    }
  }
  return questions
}

// Part 5 - Incomplete Sentences (30 câu: 101-130)
const createPart5Questions = (): ToeicQuestion[] => {
  const topics = [
    { word: 'decision', hint: 'The manager made an important _____.', grammar: 'noun' },
    { word: 'quickly', hint: 'Please respond to the email _____.', grammar: 'adverb' },
    { word: 'successful', hint: 'The project was very _____.', grammar: 'adjective' },
    { word: 'arrange', hint: 'Could you _____ a meeting room?', grammar: 'verb' },
    { word: 'although', hint: '_____ the weather was bad, we went to work.', grammar: 'conjunction' },
    { word: 'schedule', hint: 'Please check your _____ for tomorrow.', grammar: 'noun' },
    { word: 'confirm', hint: 'Please _____ your reservation by Friday.', grammar: 'verb' },
    { word: 'apology', hint: 'I would like to offer my sincere _____.', grammar: 'noun' },
    { word: 'immediately', hint: 'Please contact us _____.', grammar: 'adverb' },
    { word: 'reliable', hint: 'She is a very _____ employee.', grammar: 'adjective' },
    { word: 'deadline', hint: 'The _____ for this project is next Monday.', grammar: 'noun' },
    { word: 'inform', hint: 'Please _____ me when you have the information.', grammar: 'verb' },
    { word: 'available', hint: 'Is the manager _____ today?', grammar: 'adjective' },
    { word: 'assistance', hint: 'Thank you for your _____.', grammar: 'noun' },
    { word: 'convenient', hint: 'Would Tuesday be _____ for you?', grammar: 'adjective' },
    { word: 'consider', hint: 'We will _____ your request carefully.', grammar: 'verb' },
    { word: 'opportunity', hint: 'This is a great _____ for growth.', grammar: 'noun' },
    { word: 'efficient', hint: 'The new system is very _____ and fast.', grammar: 'adjective' },
    { word: 'notify', hint: 'We will _____ you of any changes.', grammar: 'verb' },
    { word: 'attendance', hint: 'The company has a strict _____ policy.', grammar: 'noun' },
    { word: 'purchase', hint: 'I would like to make a _____ online.', grammar: 'noun/verb' },
    { word: 'confidential', hint: 'This information is strictly _____.', grammar: 'adjective' },
    { word: 'recommend', hint: 'I would _____ this restaurant to everyone.', grammar: 'verb' },
    { word: 'experience', hint: 'She has a lot of _____ in marketing.', grammar: 'noun' },
    { word: 'additional', hint: 'Do you have any _____ questions?', grammar: 'adjective' },
    { word: 'sufficient', hint: 'Is the budget _____ for this project?', grammar: 'adjective' },
    { word: 'acknowledge', hint: 'Please _____ receipt of this email.', grammar: 'verb' },
    { word: 'compensation', hint: 'The package includes competitive _____.', grammar: 'noun' },
    { word: 'maintenance', hint: 'Regular _____ is required for all equipment.', grammar: 'noun' },
    { word: 'negotiate', hint: 'We need to _____ a new contract.', grammar: 'verb' },
  ]
  return topics.map((topic, i) => ({
    id: `p5-q${101 + i}`,
    examId: 'toeic_2019_test1',
    partId: 'p5-t1',
    partNumber: 5,
    questionNumber: 101 + i,
    questionType: 'MULTIPLE_CHOICE',
    questionTextEn: topic.hint,
    options: [
      { key: 'A', textEn: topic.word },
      { key: 'B', textEn: topic.word + 'ed' },
      { key: 'C', textEn: topic.word + 'ing' },
      { key: 'D', textEn: 'un' + topic.word },
    ],
    correctOption: 'A',
    difficultyLevel: topic.grammar.includes('noun') ? 'EASY' : 'MEDIUM',
    skillType: 'READING',
    topicId: 'topic-business',
    grammarPointId: `grammar-${topic.grammar}`,
    status: 'PUBLISHED',
  }))
}

// Part 6 - Text Completion (16 câu: 131-146)
const createPart6Questions = (): ToeicQuestion[] => {
  const passages = [
    { id: 'p6-1', title: 'Office Memo', start: 131 },
    { id: 'p6-2', title: 'Email Confirmation', start: 135 },
    { id: 'p6-3', title: 'Newsletter', start: 139 },
    { id: 'p6-4', title: 'Reservation Notice', start: 143 },
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

// Part 7 - Reading Comprehension (54 câu: 147-200)
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
      const qTypes = [
        'What is the purpose of this document?',
        'When does this event take place?',
        'Who is the intended audience?',
        'What is mentioned as a requirement?',
        'According to the passage, what can be inferred?',
      ]
      questions.push({
        id: `p7-q${passage.start + i}`,
        examId: 'toeic_2019_test1',
        partId: 'p7-t1',
        partNumber: 7,
        questionNumber: passage.start + i,
        passageId: passage.id,
        passageTitle: passage.title,
        questionType: 'MULTIPLE_CHOICE',
        questionTextEn: qTypes[i % qTypes.length],
        options: [
          { key: 'A', textEn: `Option A for ${passage.title}` },
          { key: 'B', textEn: `Option B for ${passage.title}` },
          { key: 'C', textEn: `Option C for ${passage.title}` },
          { key: 'D', textEn: `Option D for ${passage.title}` },
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

const allPart1Questions = part1Questions
const allPart2Questions = part2Questions
const allPart3Questions = createPart3Questions()
const allPart4Questions = createPart4Questions()
const allPart5Questions = createPart5Questions()
const allPart6Questions = createPart6Questions()
const allPart7Questions = createPart7Questions()

const getQuestionsForPart = (part: number): ToeicQuestion[] => {
  switch (part) {
    case 1: return allPart1Questions
    case 2: return allPart2Questions
    case 3: return allPart3Questions
    case 4: return allPart4Questions
    case 5: return allPart5Questions
    case 6: return allPart6Questions
    case 7: return allPart7Questions
    default: return []
  }
}

const getAllQuestions = (parts: number[]): ToeicQuestion[] => {
  return parts.flatMap(part => getQuestionsForPart(part))
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function ToeicExamPage() {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const navigate = useNavigate()
  const params = useParams()

  const [showModeSelector, setShowModeSelector] = useState(true)
  const [state, setState] = useState<ExamState>({
    mode: 'FULL',
    selectedParts: [1, 2, 3, 4, 5, 6, 7],
    currentPartIndex: 0,
    currentQuestionIndex: 0,
    answers: {},
    flagged: [],
    timeRemaining: 0,
    started: false,
    submitted: false,
    showAnswer: false,
    timedMode: true,
  })

  const [allQuestions, setAllQuestions] = useState<ToeicQuestion[]>([])
  const currentQuestion = allQuestions[state.currentQuestionIndex]
  const currentPart = state.selectedParts[state.currentPartIndex]
  const PART_TIMINGS = getPartTimings(isVietnamese)
  const PART_TIPS = getPartTips(isVietnamese)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const calculateTimeForMode = (mode: PracticeMode, parts: number[]): number => {
    switch (mode) {
      case 'FULL': return 45 * 60 + 96 * 60
      case 'LISTENING': return 45 * 60
      case 'READING': return 96 * 60
      case 'PART':
        const partTiming = (PART_TIMINGS as any)[parts[0]]
        return partTiming?.seconds || 0
      default: return 0
    }
  }

  useEffect(() => {
    if (!state.started || state.submitted || !state.timedMode) return
    const timer = setInterval(() => {
      setState(prev => {
        if (prev.timeRemaining <= 0) return { ...prev, submitted: true }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [state.started, state.submitted, state.timedMode])

  const handleSelectMode = (mode: PracticeMode, parts: number[], timed: boolean) => {
    const questions = getAllQuestions(parts)
    const time = timed ? calculateTimeForMode(mode, parts) : 0
    setAllQuestions(questions)
    setState({
      mode,
      selectedParts: parts,
      currentPartIndex: 0,
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
    if (!currentQuestion || state.submitted) return
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [currentQuestion.questionNumber]: optionKey },
    }))
  }

  const goToQuestion = (index: number) => {
    if (index < 0 || index >= allQuestions.length) return
    setState(prev => ({ ...prev, currentQuestionIndex: index }))
  }

  const toggleFlag = () => {
    if (!currentQuestion) return
    setState(prev => ({
      ...prev,
      flagged: prev.flagged.includes(currentQuestion.questionNumber)
        ? prev.flagged.filter(q => q !== currentQuestion.questionNumber)
        : [...prev.flagged, currentQuestion.questionNumber],
    }))
  }

  const handleSubmit = () => {
    setState(prev => ({ ...prev, submitted: true, showAnswer: true }))
  }

  const calculateResults = () => {
    let correct = 0
    const total = allQuestions.length
    allQuestions.forEach(q => {
      if (state.answers[q.questionNumber] === q.correctOption) correct++
    })
    return { correct, total, percentage: Math.round((correct / total) * 100) }
  }

  // Mode selection screen
  if (showModeSelector) {
    return (
      <div className="min-h-screen bg-surface-secondary px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <button onClick={() => navigate('/toeic')} className="mb-6 flex items-center gap-2 text-[14px] text-text-secondary hover:text-primary">
            <ArrowLeft size={18} />
            {isVietnamese ? 'Quay lại danh sách đề' : 'Back to exam list'}
          </button>
          <Card className="dashboard-card mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-warning/10">
                  <Trophy className="h-8 w-8 text-warning" />
                </div>
                <div>
                  <h1 className="text-[20px] font-bold text-text-primary">{toeicTest1.title}</h1>
                  <p className="text-[13px] text-text-secondary">{toeicTest1.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 className="mb-4 text-[16px] font-semibold text-text-primary">
            {isVietnamese ? 'Chọn chế độ luyện tập' : 'Choose practice mode'}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Full Test */}
            <Card className="dashboard-card cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5" onClick={() => handleSelectMode('FULL', [1, 2, 3, 4, 5, 6, 7], true)}>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                    <Trophy className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-text-primary">
                      {isVietnamese ? 'Luyện Full đề' : 'Full Test'}
                    </h3>
                    <p className="text-[12px] text-text-secondary">7 Parts (200 {isVietnamese ? 'câu' : 'questions'})</p>
                  </div>
                </div>
                <div className="space-y-2 text-[12px] text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-text-tertiary" />
                    <span>{isVietnamese ? 'Thời gian:' : 'Time:'} ~135 {isVietnamese ? 'phút' : 'min'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Headphones size={14} className="text-text-tertiary" />
                    <span>Listening: 100 {isVietnamese ? 'câu' : 'q'} (45 {isVietnamese ? 'phút' : 'min'})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-text-tertiary" />
                    <span>Reading: 100 {isVietnamese ? 'câu' : 'q'} (75 {isVietnamese ? 'phút' : 'min'})</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Listening */}
            <Card className="dashboard-card cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5" onClick={() => handleSelectMode('LISTENING', [1, 2, 3, 4], true)}>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
                    <Headphones className="h-6 w-6 text-info" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-text-primary">
                      {isVietnamese ? 'Luyện Nghe' : 'Listening Practice'}
                    </h3>
                    <p className="text-[12px] text-text-secondary">Part 1-4 (100 {isVietnamese ? 'câu' : 'questions'})</p>
                  </div>
                </div>
                <div className="space-y-2 text-[12px] text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-text-tertiary" />
                    <span>{isVietnamese ? 'Thời gian:' : 'Time:'} ~45 {isVietnamese ? 'phút' : 'min'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reading */}
            <Card className="dashboard-card cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5" onClick={() => handleSelectMode('READING', [5, 6, 7], true)}>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-text-primary">
                      {isVietnamese ? 'Luyện Đọc' : 'Reading Practice'}
                    </h3>
                    <p className="text-[12px] text-text-secondary">Part 5-7 (100 {isVietnamese ? 'câu' : 'questions'})</p>
                  </div>
                </div>
                <div className="space-y-2 text-[12px] text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-text-tertiary" />
                    <span>{isVietnamese ? 'Thời gian:' : 'Time:'} 75 {isVietnamese ? 'phút' : 'min'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Single Part */}
            <Card className="dashboard-card">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald/10">
                    <Settings className="h-6 w-6 text-emerald" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-text-primary">
                      {isVietnamese ? 'Luyện từng Part' : 'Practice by Part'}
                    </h3>
                    <p className="text-[12px] text-text-secondary">
                      {isVietnamese ? 'Chọn Part cụ thể' : 'Select specific Part'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map(part => (
                    <button key={part} onClick={() => handleSelectMode('PART', [part], false)}
                      className="rounded-lg bg-surface-subtle px-2 py-1.5 text-[11px] font-medium text-text-primary hover:bg-surface-hover">
                      Part {part}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-text-tertiary">
                  {isVietnamese ? 'Không giới hạn thời gian khi luyện từng part' : 'No time limit when practicing by part'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Time tips */}
          <Card className="mt-6 dashboard-card border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <h3 className="mb-3 flex items-center gap-2 text-[14px] font-semibold text-amber-800">
                <AlertCircle size={16} />
                {isVietnamese ? 'Mẹo phân bổ thời gian TOEIC' : 'TOEIC Time Management Tips'}
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg bg-white/50 p-3">
                  <p className="text-[12px] font-medium text-amber-900">📖 Part 5 (30 {isVietnamese ? 'câu' : 'questions'})</p>
                  <p className="text-[11px] text-amber-700">
                    {isVietnamese ? '18 phút → 36 giây/câu. Đọc nhanh, không suy nghĩ quá lâu.' : '18 min → 36 sec/question. Read fast, do not overthink.'}
                  </p>
                </div>
                <div className="rounded-lg bg-white/50 p-3">
                  <p className="text-[12px] font-medium text-amber-900">📄 Part 6 (16 {isVietnamese ? 'câu' : 'questions'})</p>
                  <p className="text-[11px] text-amber-700">
                    {isVietnamese ? '18 phút → 1+ phút/câu. Đọc passage trước rồi mới trả lời.' : '18 min → 1+ min/question. Read passage first, then answer.'}
                  </p>
                </div>
                <div className="rounded-lg bg-white/50 p-3 md:col-span-2">
                  <p className="text-[12px] font-medium text-amber-900">📚 Part 7 (54 {isVietnamese ? 'câu' : 'questions'})</p>
                  <p className="text-[11px] text-amber-700">
                    {isVietnamese ? '60 phút → hơn 1 phút/câu. Đọc câu hỏi trước → tìm keyword → đọc passage.' : '60 min → over 1 min/question. Read questions first → find keywords → read passage.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Results screen
  if (state.submitted) {
    const results = calculateResults()
    const passed = results.percentage >= 60

    return (
      <div className="min-h-screen bg-surface-secondary px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Card className="dashboard-card">
            <CardContent className="p-8 text-center">
              <div className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full ${passed ? 'bg-emerald-100' : 'bg-red-100'}`}>
                {passed ? <CheckCircle2 className="h-12 w-12 text-emerald-600" /> : <XCircle className="h-12 w-12 text-red-600" />}
              </div>

              <h1 className="text-2xl font-bold text-text-primary">
                {passed ? (isVietnamese ? 'Chúc mừng!' : 'Congratulations!') : (isVietnamese ? 'Cố gắng lên!' : 'Keep trying!')}
              </h1>
              <p className="mt-2 text-text-secondary">
                {passed ? (isVietnamese ? 'Bạn đã đạt yêu cầu (60%)' : 'You have passed (60%)') : (isVietnamese ? 'Hãy ôn tập thêm và thử lại' : 'Review more and try again')}
              </p>

              <div className="my-8">
                <p className="text-[48px] font-bold text-primary">{results.percentage}%</p>
                <p className="text-[14px] text-text-secondary">
                  {results.correct}/{results.total} {isVietnamese ? 'câu đúng' : 'correct'}
                </p>
              </div>

              <div className="mb-6">
                <Progress value={results.percentage} className="h-4" />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => {
                  setState(prev => ({ ...prev, answers: {}, flagged: [], submitted: false, showAnswer: false, currentQuestionIndex: 0 }))
                }}>
                  {isVietnamese ? 'Làm lại' : 'Try Again'}
                </Button>
                <Button className="flex-1 gap-2 bg-primary hover:bg-primary-hover" onClick={() => {
                  setShowModeSelector(true)
                  setAllQuestions([])
                }}>
                  {isVietnamese ? 'Chọn đề khác' : 'Choose Another'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Exam interface
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
              <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${state.timeRemaining < 300 ? 'bg-red-100 text-red-600' : 'bg-surface-subtle'}`}>
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-primary">Part {currentPart}</Badge>
              <span className="text-[12px] text-text-secondary">{getPartByNumber(currentPart)?.nameVi}</span>
            </div>
            {(PART_TIPS as any)[currentPart] && (
              <div className="max-w-md rounded-lg bg-amber-50 px-3 py-1.5 text-[11px] text-amber-800">
                💡 {(PART_TIPS as any)[currentPart]}
              </div>
            )}
          </div>

          <Card className="dashboard-card relative">
            <Button variant="ghost" size="icon" onClick={toggleFlag}
              className={`absolute right-3 top-3 ${state.flagged.includes(currentQuestion?.questionNumber || 0) ? 'bg-amber-100 text-amber-600' : 'text-text-tertiary'}`}
              title={isVietnamese ? 'Đánh dấu câu hỏi' : 'Flag question'}>
              <Flag size={20} />
            </Button>
            <CardContent className="p-4">
              <p className="text-[14px] font-medium text-text-primary">
                {isVietnamese ? 'Câu' : 'Q'} {currentQuestion?.questionNumber}: {currentQuestion?.questionTextEn}
              </p>

              <div className="mt-4 space-y-2">
                {currentQuestion?.options?.map((option) => {
                  const isSelected = state.answers[currentQuestion.questionNumber] === option.key
                  const isCorrect = state.showAnswer && option.key === currentQuestion.correctOption
                  const isWrong = state.showAnswer && isSelected && option.key !== currentQuestion.correctOption

                  return (
                    <button key={option.key} onClick={() => handleSelectAnswer(option.key)} disabled={state.submitted}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                        isCorrect ? 'border-emerald-500 bg-emerald-50' : isWrong ? 'border-red-500 bg-red-50' : isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}>
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[14px] font-medium ${
                        isCorrect ? 'bg-emerald-500 text-white' : isWrong ? 'bg-red-500 text-white' : isSelected ? 'bg-primary text-white' : 'bg-surface-subtle'
                      }`}>{option.key}</span>
                      <span className={`flex-1 text-[14px] ${isCorrect ? 'text-emerald-700 font-medium' : isWrong ? 'text-red-700' : 'text-text-primary'}`}>
                        {option.textEn}
                        {isCorrect && <CheckCircle2 size={14} className="ml-2 inline text-emerald-600" />}
                        {isWrong && <XCircle size={14} className="ml-2 inline text-red-600" />}
                      </span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => goToQuestion(state.currentQuestionIndex - 1)} disabled={state.currentQuestionIndex === 0}>
              <ChevronLeft size={16} className="mr-1" />
              {isVietnamese ? 'Câu trước' : 'Previous'}
            </Button>
            <Button variant="outline" onClick={() => goToQuestion(state.currentQuestionIndex + 1)} disabled={state.currentQuestionIndex === allQuestions.length - 1}>
              {isVietnamese ? 'Câu sau' : 'Next'}
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="dashboard-card">
            <CardContent className="p-4">
              <h3 className="mb-3 text-[13px] font-semibold text-text-primary">{isVietnamese ? 'Câu hỏi' : 'Questions'}</h3>
              <div className="grid grid-cols-6 gap-1.5">
                {allQuestions.map((q, index) => {
                  const isAnswered = !!state.answers[q.questionNumber]
                  const isFlagged = state.flagged.includes(q.questionNumber)
                  const isCurrent = index === state.currentQuestionIndex

                  return (
                    <button key={q.id} onClick={() => goToQuestion(index)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-medium transition-colors ${
                        isCurrent ? 'bg-primary text-white' : isFlagged ? 'bg-amber-100 text-amber-700' : isAnswered ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-subtle text-text-secondary hover:bg-surface-hover'
                      }`}>
                      {q.questionNumber}
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-[11px]">
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded bg-emerald-100" />
                  <span>{isVietnamese ? 'Đã trả lời' : 'Answered'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded bg-surface-subtle" />
                  <span>{isVietnamese ? 'Chưa trả lời' : 'Unanswered'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded bg-amber-100" />
                  <span>{isVietnamese ? 'Đánh dấu' : 'Flagged'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-4">
              <h3 className="mb-3 text-[13px] font-semibold text-text-primary">{isVietnamese ? 'Tiến độ' : 'Progress'}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-[12px]">
                  <span className="text-text-secondary">{isVietnamese ? 'Đã trả lời' : 'Answered'}</span>
                  <span className="font-medium text-emerald-600">{Object.keys(state.answers).length}/{allQuestions.length}</span>
                </div>
                <Progress value={(Object.keys(state.answers).length / allQuestions.length) * 100} />
              </div>
            </CardContent>
          </Card>

          {currentPart && (
            <Card className="dashboard-card">
              <CardContent className="p-4">
                <h3 className="mb-3 text-[13px] font-semibold text-text-primary">Part {currentPart} Info</h3>
                <div className="space-y-2 text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{isVietnamese ? 'Số câu' : 'Questions'}</span>
                    <span className="font-medium">{(PART_TIMINGS as any)[currentPart]?.questions || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{isVietnamese ? 'Thời gian' : 'Time'}</span>
                    <span className="font-medium">{(PART_TIMINGS as any)[currentPart]?.description || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
