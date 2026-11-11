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
  timeSeconds?: number
  allowReplay?: boolean
  replayLimit?: number
  playCount?: number
  playbackCompleted?: boolean
  hasListened?: boolean
  showImageBefore?: boolean
  showQuestionsBefore?: boolean
  completed?: boolean
  dialogue?: {
    start_time: number
    end_time: number
    text: string
    text_vi?: string
  }[]
  checkedResult?: {
    score_percent: number
    answers?: {
      blank_index: number
      user_answer: string
      correct_answer: string
      is_correct: boolean
    }[]
  }
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
  settings?: {
    show_answers_immediately?: boolean
    show_transcript_after?: boolean
    enable_hints?: boolean
  }
}
export interface ListeningDraft {
  revision: number
  answers: Record<string, string>
  current_index: number
  elapsed_seconds: number
  audio_position: number
  playback_speed: number
  group_elapsed?: Record<string, number>
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
