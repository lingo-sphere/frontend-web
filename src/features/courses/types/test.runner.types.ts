// Định nghĩa kiểu dữ liệu TypeScript cho bài thi và câu hỏi khóa học.

export interface CourseTestQuestion {
  id?: string
  _id?: string
  question_text: string
  options: string[]
  correct_answer?: string | number
  correct_index?: number
  explanation?: string
  media_url?: string
  image_url?: string
  skill_type?: string
  part_number?: number
}

export interface GradedQuestionItem {
  question_index: number
  question_id?: string
  is_correct: boolean
  selected_index?: number
  selected_option?: string
  correct_index: number
  correct_answer: string
  explanation?: string
}

export interface TestAttemptItem {
  attempt_id: string
  test_type?: string
  score: number
  correct_count?: number
  total_questions?: number
  is_passed: boolean
  submitted_at: string | Date
}

export interface WrongQuestionItem {
  question_number: number
  question_text: string
  user_selected_answer: string
  correct_answer: string
  category?: string
  explanation?: string
}

export interface AiExplanationDetail {
  question_number: number
  question_text: string
  user_selected: string
  correct_answer: string
  why_wrong: string
  why_correct: string
  recommended_topic: string
  study_focus?: string
  trap_identified?: string
}

export interface AiExplanationsData {
  summary?: string
  overall_advice?: string
  explanations: AiExplanationDetail[]
}

export function getCorrectOptionIndex(q: CourseTestQuestion, options: string[]): number {
  if (typeof q.correct_index === 'number' && q.correct_index >= 0) {
    return q.correct_index
  }
  if (typeof q.correct_answer === 'number' && q.correct_answer >= 0) {
    return q.correct_answer
  }
  if (typeof q.correct_answer === 'string') {
    const trimmed = q.correct_answer.trim()
    const upper = trimmed.toUpperCase()
    if (upper === 'A') return 0
    if (upper === 'B') return 1
    if (upper === 'C') return 2
    if (upper === 'D') return 3

    const num = parseInt(trimmed, 10)
    if (!isNaN(num) && num >= 0 && num < options.length) {
      return num
    }

    const textMatchIdx = options.findIndex(
      (opt) => opt.trim().toLowerCase() === trimmed.toLowerCase()
    )
    if (textMatchIdx !== -1) return textMatchIdx
  }
  return -1
}
