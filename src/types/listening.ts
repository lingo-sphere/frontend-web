
export type MediaType = 'AUDIO' | 'VIDEO'
export type ExerciseType = 'DICTATION' | 'VIDEO_DICTATION' | 'LISTEN_CHOOSE' | 'LISTEN_ORDER'
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD'
export type AttemptStatus = 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED'
export type BlankStatus = 'PENDING' | 'CORRECT' | 'INCORRECT' | 'SKIPPED' | 'HINTED'

export interface Blank {
  id: string
  wordIndex: number 
  answer: string 
  acceptedAnswers?: string[] 
  hintText?: string 
}

export interface TranscriptSegment {
  id: string
  exerciseId: string
  segmentIndex: number 
  startTime: number 
  endTime: number 
  textEn: string 
  textVi?: string 
  speaker?: string 
  lexicalItemIds?: string[] 
  grammarPointIds?: string[] 
  blanks: Blank[] 
}

export interface ListeningExercise {
  id: string
  title: string
  titleVi?: string
  description: string
  descriptionVi?: string
  domain: string
  mediaType: MediaType
  mediaId: string
  mediaUrl?: string
  thumbnailUrl?: string
  durationSeconds: number
  exerciseType: ExerciseType
  difficultyLevel: DifficultyLevel
  cefrLevel: string
  topicId: string
  targetLexicalItemIds?: string[]
  targetGrammarPointIds?: string[]
  status: string
  createdBy: string
  createdAt: string
  updatedAt: string
  segments: TranscriptSegment[]
}

export interface BlankResult {
  blankId: string
  userAnswer: string
  isCorrect: boolean
  isHintUsed: boolean
}

export interface SegmentAnswer {
  segmentId: string
  startedAt?: string
  completedAt?: string
  blankResults: BlankResult[]
  timeSpentSeconds: number
  replayCount: number
}

export interface ListeningAttempt {
  id: string
  exerciseId: string
  userId: string
  status: AttemptStatus
  currentSegmentIndex: number
  currentTime: number 
  startedAt: string
  lastActivityAt?: string
  completedAt?: string
  segmentAnswers: SegmentAnswer[]
  totalHintsUsed: number
  totalReplays: number
  totalTimeSeconds: number

  score?: number
  totalCorrectBlanks?: number
  totalBlanks?: number
  accuracy?: number
  aiAnalysis?: AIAnalysis
}

export interface AIMistake {
  segmentId: string
  blankId?: string
  userAnswer: string
  correctAnswer: string
  lexicalItemId?: string
  explanation?: string
}

export interface AIAnalysis {
  overallScore: number
  accuracy: number
  mistakes: AIMistake[]
  weakAreas: string[]
  suggestions: string[]
}

export interface ListeningTopic {
  id: string
  name: string
  nameVi: string
  cefr: string
}

export interface CurrentUser {
  id: string
  name: string
  email: string
  level?: string
}

export function normalizeAnswer(answer: string): string {
  return answer
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:]/g, '')
    .replace(/'/g, "'")
}

export function checkBlankAnswer(userAnswer: string, blank: Blank): boolean {
  const normalized = normalizeAnswer(userAnswer)
  const correctNormalized = normalizeAnswer(blank.answer)

  if (normalized === correctNormalized) return true

  if (blank.acceptedAnswers) {
    return blank.acceptedAnswers.some((accepted) => normalizeAnswer(accepted) === normalized)
  }

  return false
}

export function calculateSegmentScore(blankResults: BlankResult[]): {
  correct: number
  total: number
  accuracy: number
} {
  const correct = blankResults.filter((r) => r.isCorrect).length
  const total = blankResults.length
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
  return { correct, total, accuracy }
}

export function calculateAttemptScore(segmentAnswers: SegmentAnswer[]): {
  totalCorrectBlanks: number
  totalBlanks: number
  accuracy: number
} {
  let totalCorrectBlanks = 0
  let totalBlanks = 0

  segmentAnswers.forEach((seg) => {
    totalCorrectBlanks += seg.blankResults.filter((r) => r.isCorrect).length
    totalBlanks += seg.blankResults.length
  })

  const accuracy = totalBlanks > 0 ? Math.round((totalCorrectBlanks / totalBlanks) * 100) : 0

  return { totalCorrectBlanks, totalBlanks, accuracy }
}
