import type { ListeningSessionResult } from './listening-session'

export interface Part1Session {
  session_id: string
  total_questions: number
  total_time_seconds: number
  questions: {
    question_index: number
    question_id: string
    image_url: string
    audio_url: string
    options: { key: string; text: string; text_vi?: string }[]
  }[]
}
export interface Part1SessionFilters {
  context_id?: string
  difficulty?: string
  cefr_level?: string
  picture_type?: string
}
export interface Part1SessionResult extends ListeningSessionResult {
  details: (ListeningSessionResult['details'][number] & { question_id: string; image_url: string; transcript: string; explanation_vi?: string })[]
}
