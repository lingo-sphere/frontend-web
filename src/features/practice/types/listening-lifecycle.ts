export type ListeningKind = 'part1' | 'part2' | 'part3' | 'part4' | 'dictation'
export interface ListeningQuestion {
  key: string
  text: string
  textVi?: string
  options: { key: string; text: string }[]
}
export interface ListeningGroup {
  id: string
  index: number
  title: string
  audio: string
  image?: string
  start: number
  end?: number
  clipped: boolean
  preview?: string
  questions: ListeningQuestion[]
  blanks: {
    key: string
    label: string
    firstLetter?: string
    length?: number
    hintsAvailable: number
    hint?: string
  }[]
}
export interface ListeningPracticeSession {
  id: string
  kind: ListeningKind
  title: string
  totalSeconds: number
  groups: ListeningGroup[]
  status: string
}
export interface ListeningDraft {
  revision: number
  answers: Record<string, string>
  current_index: number
  elapsed_seconds: number
  audio_position: number
  playback_speed: number
  status?: string
  result?: ListeningResult | null
}
export interface ListeningResult {
  score_percent: number
  correct_count: number
  total_questions?: number
  total_blanks?: number
  details?: {
    question_id?: string
    question_index: number
    question_text?: string
    user_answer: string
    correct_answer: string
    is_correct: boolean
    explanation?: string
    explanation_vi?: string
    distractor_reason?: string
    distractor_reason_vi?: string
  }[]
  segment_results?: {
    segment_index: number
    text: string
    answers: {
      blank_index: number
      user_answer: string
      correct_answer: string
      is_correct: boolean
    }[]
  }[]
}
export interface PendingListeningSession {
  kind: ListeningKind
  session_id: string
  title: string
  answered: number
  total: number
  updated_at: string
}
