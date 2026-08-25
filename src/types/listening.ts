// Updated: 2026-08-17
// Types cho Listening - Synced với Practice Service DB

// ============================================================
// CORE TYPES
// ============================================================

export type MediaType = 'AUDIO' | 'VIDEO'
export type ExerciseType = 'DICTATION' | 'VIDEO_DICTATION' | 'LISTEN_CHOOSE' | 'LISTEN_ORDER'
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD'
export type AttemptStatus = 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED'
export type BlankStatus = 'PENDING' | 'CORRECT' | 'INCORRECT' | 'SKIPPED' | 'HINTED'

// ============================================================
// BLANK - Từ bị ẩn trong transcript
// ============================================================

export interface Blank {
  id: string
  wordIndex: number // Vị trí từ trong câu (0-based)
  answer: string // Đáp án chính xác
  acceptedAnswers?: string[] // Các đáp án được chấp nhận (VD: "don't" / "dont")
  hintText?: string // Text hiển thị khi hint
}

// ============================================================
// TRANSCRIPT SEGMENT - Đoạn transcript có timing
// ============================================================

export interface TranscriptSegment {
  id: string
  exerciseId: string
  segmentIndex: number // Thứ tự segment (0-based)
  startTime: number // Thời điểm bắt đầu (giây)
  endTime: number // Thời điểm kết thúc (giây)
  textEn: string // Transcript tiếng Anh
  textVi?: string // Dịch tiếng Việt
  speaker?: string // Người nói (SPEAKER_A, SPEAKER_B, etc.)
  lexicalItemIds?: string[] // IDs của từ vựng liên quan
  grammarPointIds?: string[] // IDs của ngữ pháp liên quan
  blanks: Blank[] // Các từ bị ẩn
}

// ============================================================
// LISTENING EXERCISE - Bài luyện nghe
// ============================================================

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

// ============================================================
// BLANK RESULT - Kết quả của một blank trong segment
// ============================================================

export interface BlankResult {
  blankId: string
  userAnswer: string
  isCorrect: boolean
  isHintUsed: boolean
}

// ============================================================
// SEGMENT ANSWER - Kết quả của một segment
// ============================================================

export interface SegmentAnswer {
  segmentId: string
  startedAt?: string
  completedAt?: string
  blankResults: BlankResult[]
  timeSpentSeconds: number
  replayCount: number
}

// ============================================================
// LISTENING ATTEMPT - Lần làm bài
// ============================================================

export interface ListeningAttempt {
  id: string
  exerciseId: string
  userId: string
  status: AttemptStatus
  currentSegmentIndex: number
  currentTime: number // Vị trí playback hiện tại
  startedAt: string
  lastActivityAt?: string
  completedAt?: string
  segmentAnswers: SegmentAnswer[]
  totalHintsUsed: number
  totalReplays: number
  totalTimeSeconds: number
  // Score fields (only when completed)
  score?: number
  totalCorrectBlanks?: number
  totalBlanks?: number
  accuracy?: number
  aiAnalysis?: AIAnalysis
}

// ============================================================
// AI ANALYSIS - Phân tích từ AI Service
// ============================================================

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

// ============================================================
// TOPIC - Chủ đề
// ============================================================

export interface ListeningTopic {
  id: string
  name: string
  nameVi: string
  cefr: string
}

// ============================================================
// USER CONTEXT (Mock)
// ============================================================

export interface CurrentUser {
  id: string
  name: string
  email: string
  level?: string
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Normalize answer for comparison
 * - lowercase
 * - trim
 * - remove punctuation
 */
export function normalizeAnswer(answer: string): string {
  return answer
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:]/g, '')
    .replace(/'/g, "'")
}

/**
 * Check if user answer matches blank answer
 */
export function checkBlankAnswer(userAnswer: string, blank: Blank): boolean {
  const normalized = normalizeAnswer(userAnswer)
  const correctNormalized = normalizeAnswer(blank.answer)

  if (normalized === correctNormalized) return true

  // Check accepted answers
  if (blank.acceptedAnswers) {
    return blank.acceptedAnswers.some((accepted) => normalizeAnswer(accepted) === normalized)
  }

  return false
}

/**
 * Calculate segment score
 */
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

/**
 * Calculate overall attempt score
 */
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
