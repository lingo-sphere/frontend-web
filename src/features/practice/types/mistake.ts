// Định nghĩa các kiểu dữ liệu cho Sổ tay câu sai (Mistake Vault), SRS và Luyện tập chuyên sâu theo chủ đề.

export enum MistakeStatus {
  NEED_PRACTICE = 'NEED_PRACTICE',
  PRACTICING = 'PRACTICING',
  MASTERED = 'MASTERED',
}

export interface UserMistakeItem {
  _id: string
  user_id: string
  question_id: string
  question_text: string
  options: string[]
  user_answer: string
  correct_answer: string
  explanation?: string
  topic_tags: string[]
  topic_name_vi?: string
  source_context?: string
  consecutive_correct: number
  status: MistakeStatus
  last_reviewed_at?: string | null
  next_due_at: string
  srs_schedule_id?: string
  created_at: string
  updated_at: string
}

export interface RecordMistakeItemPayload {
  question_id: string
  question_text: string
  options: string[]
  user_answer: string
  correct_answer: string
  explanation?: string
  topic_tags?: string[]
  topic_name_vi?: string
  source_context?: string
}

export interface BatchRecordMistakesPayload {
  mistakes: RecordMistakeItemPayload[]
}

export interface QueryMistakesParams {
  status?: MistakeStatus
  topic?: string
  due_only?: boolean
  page?: number
  limit?: number
}

export interface TopicGroupStat {
  topic: string
  count: number
}

export interface MistakesResponse {
  items: UserMistakeItem[]
  pagination: {
    total: number
    page: number
    limit: number
    total_pages: number
  }
  summary: {
    total_all: number
    total_due_today: number
    total_need_practice: number
    total_practicing: number
    total_mastered: number
  }
  topic_groups: TopicGroupStat[]
}

export interface DueMistakesResponse {
  total_due: number
  items: UserMistakeItem[]
}

export interface ReviewMistakePayload {
  is_correct: boolean
  user_answer?: string
}

export interface ReviewMistakeResponse {
  message: string
  is_correct: boolean
  consecutive_correct: number
  status: MistakeStatus
  next_due_at: string
  mistake: UserMistakeItem
}

export interface TopicDrillQuestion {
  _id: string
  question_text: string
  question_text_vi?: string
  options: string[]
  correct_answer: string
  explanation?: string
  difficulty_level?: string
  domain?: string
}

export interface TopicDrillResponse {
  topic: string
  total_found: number
  questions: TopicDrillQuestion[]
}
