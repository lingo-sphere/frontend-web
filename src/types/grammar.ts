/**
 * @file grammar.ts
 * @description Định nghĩa kiểu dữ liệu TypeScript cho hệ thống giao diện Web
 */

export type GrammarType =
  | 'TENSE'
  | 'CONDITIONAL'
  | 'PASSIVE'
  | 'MODAL'
  | 'VERB_FORM'
  | 'CLAUSE'
  | 'COMPARISON'
  | 'SPECIAL'
  | 'QUESTION'
  | 'ARTICLE'
  | 'PREPOSITION'

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export type GrammarStatus = 'ACTIVE' | 'INACTIVE'

export type ExampleType = 'AFFIRMATIVE' | 'NEGATIVE' | 'QUESTION' | 'SHORT_ANSWER'

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD'

export interface GrammarExample {
  id: string
  grammarPointId: string
  exampleEn: string
  exampleVi: string
  exampleType: ExampleType
  difficultyLevel: DifficultyLevel
  usageContext?: string
  audioMediaId?: string
  isVerified: boolean
  status: GrammarStatus
  createdAt: string
}

export interface GrammarPoint {
  id: string
  nameEn: string
  nameVi: string
  slug: string
  grammarType: GrammarType
  cefrLevel: CEFRLevel
  category: string
  descriptionEn: string
  descriptionVi: string
  ruleEn: string
  ruleVi: string
  structureForm: string
  usageNotes?: string
  commonMistakes?: string
  examples: { en: string; vi: string }[]
  relatedGrammarIds?: string[]
  toeicRelevance: number
  practiceCount: number
  isFeatured: boolean
  displayOrder: number
  status: GrammarStatus
  createdAt: string
}

export const GRAMMAR_TYPE_LABELS: Record<GrammarType, string> = {
  TENSE: 'Thì',
  CONDITIONAL: 'Câu điều kiện',
  PASSIVE: 'Câu bị động',
  MODAL: 'Động từ khuyết thiếu',
  VERB_FORM: 'Dạng động từ',
  CLAUSE: 'Mệnh đề',
  COMPARISON: 'So sánh',
  SPECIAL: 'Cấu trúc đặc biệt',
  QUESTION: 'Câu hỏi',
  ARTICLE: 'Mạo từ',
  PREPOSITION: 'Giới từ',
}

export const CEFR_LEVEL_LABELS: Record<CEFRLevel, string> = {
  A1: 'A1 - Beginner',
  A2: 'A2 - Elementary',
  B1: 'B1 - Intermediate',
  B2: 'B2 - Upper Intermediate',
  C1: 'C1 - Advanced',
  C2: 'C2 - Proficient',
}

export const EXAMPLE_TYPE_LABELS: Record<ExampleType, string> = {
  AFFIRMATIVE: 'Khẳng định',
  NEGATIVE: 'Phủ định',
  QUESTION: 'Câu hỏi',
  SHORT_ANSWER: 'Trả lời ngắn',
}

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  EASY: 'Dễ',
  MEDIUM: 'Trung bình',
  HARD: 'Khó',
}
