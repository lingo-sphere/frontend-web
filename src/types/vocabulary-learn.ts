
export interface LexicalItem {
  id: string
  word: string
  word_lowercase: string
  slug?: string
  word_type: string
  cefr_level?: string
  pronunciation_us?: string
  pronunciation_uk?: string
  audio_url_us?: string
  audio_url_uk?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface Meaning {
  id: string
  lexical_item_id: string
  meaning_order: number
  part_of_speech: string
  definition_en?: string
  definition_vi?: string
  short_meaning_vi?: string
  definition_note?: string
  examples?: Example[]
  synonyms?: string[]
  antonyms?: string[]
  collocations?: string[]
  is_primary: boolean
  cefr_level?: string
  domain?: string
}

export interface Example {
  sentence_en: string
  sentence_vi?: string
  sentence_with_blank?: string
  blank_word_position?: number
}

export interface FlashcardDeck {
  id: string
  name: string
  name_vi?: string
  description?: string
  description_vi?: string
  creator_id?: string
  creator_type: 'SYSTEM' | 'USER'
  topic_id?: string
  cefr_level?: string
  tags?: string[]
  tags_vi?: string[]
  visibility: 'PUBLIC' | 'PRIVATE' | 'UNLISTED'
  card_count: number
  total_studied: number
  total_users: number
  avg_mastery_percent?: number
  save_count: number
  is_featured: boolean
  rating_average?: number
  rating_count: number
  created_at: string
  updated_at?: string
}

export interface Flashcard {
  id: string
  deck_id: string
  lexical_item_id: string
  meaning_index: number
  front_text?: string
  back_text?: string
  audio_url?: string
  image_url?: string
  order_index?: number
  status: 'ACTIVE' | 'INACTIVE'
}

export interface UserCardProgress {
  id: string
  user_id: string
  lexical_item_id: string
  deck_id?: string
  meaning_index: number
  card_status: CardStatus
  mastery_level: MasteryLevel
  mastery_percent: number
  total_reviews: number
  total_correct: number
  total_incorrect: number
  accuracy_percent: number
  current_streak: number
  longest_streak: number
  last_reviewed_at?: string
  next_review_at?: string
  is_due: boolean
  learning_started_at?: string
  reviewing_started_at?: string
  mastered_at?: string
  created_at: string
  updated_at?: string
}

export type CardStatus = 'NEW' | 'LEARNING' | 'REVIEWING' | 'MASTERED' | 'RELEARNING'
export type MasteryLevel = 'NEW' | 'LEARNING' | 'REVIEWING' | 'MASTERED' | 'RELEARNING'

export interface FlashcardDeckEnrollment {
  id: string
  user_id: string
  deck_id: string
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED'
  enrolled_at: string
  total_cards: number
  learning_count: number
  reviewing_count: number
  mastered_count: number
  progress_percent: number
  accuracy_percent: number
  total_reviews: number
  last_review_at?: string
  completed_at?: string
}

export interface ReviewSession {
  id: string
  user_id: string
  deck_id?: string
  session_mode: SessionMode
  review_type: ReviewType
  started_at: string
  ended_at?: string
  duration_seconds?: number
  total_cards: number
  cards_reviewed: number
  correct_count: number
  incorrect_count: number
  skipped_count: number
  accuracy_percent: number
  hints_used_total: number
  audio_plays_total: number
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'
  created_at: string
}

export type SessionMode =
  | 'FLASHCARD'
  | 'MULTIPLE_CHOICE'
  | 'REVERSE_MULTIPLE_CHOICE'
  | 'TYPE_WORD'
  | 'IMAGE_WORD'
  | 'LISTEN_TYPE'
  | 'PRONUNCIATION'
  | 'CONTEXT'
  | 'SPEAKING'
  | 'DICTATION'

export type ReviewType = 'DUE' | 'WEAK' | 'NEW' | 'MASTERED' | 'CUSTOM' | 'SMART'

export interface ReviewSessionItem {
  id: string
  review_session_id: string
  lexical_item_id: string
  card_id?: string
  question_order: number
  review_mode: SessionMode
  user_answer?: string
  correct_answer: string
  is_correct: boolean
  was_skipped: boolean
  hints_used: number
  time_spent_seconds?: number
  audio_replays: number
  reviewed_at?: string
}

export interface LearningStatistics {
  id: string
  user_id: string
  date: string
  total_cards: number
  new_cards: number
  due_cards: number
  learning_count: number
  reviewing_count: number
  mastered_count: number
  total_reviews_today: number
  correct_today: number
  incorrect_today: number
  accuracy_today: number
  current_streak_days: number
  longest_streak_days: number
  study_time_minutes: number
  pronunciation_practices: number
  shadowing_practices: number
}

export interface VocabularyItem {
  id: string
  word: string
  word_lowercase?: string
  pronunciation?: string
  pronunciation_uk?: string
  meaningVi?: string
  partOfSpeech?: string
  cefrLevel?: string
  example?: string
  exampleMeaningVi?: string
  image?: string
  audioUrl?: string
  synonyms?: string[]
  collocations?: string[]
  isNew?: boolean
}

export interface VocabularyDeck {
  id: string
  title: string
  titleVi?: string
  description?: string
  descriptionVi?: string
  coverColor: string
  cardCount: number
  creatorType: 'SYSTEM' | 'USER'
  cefrLevel?: string
  tags?: string[]
  visibility: 'PUBLIC' | 'PRIVATE'
  vocabularyItems: VocabularyItem[]
}

export type ExerciseMode =
  | 'flashcard'
  | 'multiple-choice'
  | 'reverse-multiple-choice'
  | 'type-word'
  | 'image-word'
  | 'listen-type'
  | 'pronunciation'
  | 'context'

export type ReviewFilter = 'due' | 'weak' | 'new' | 'mastered'

export interface ExerciseAnswer {
  wordId: string
  mode: ExerciseMode
  isCorrect: boolean
  userAnswer: string
  timestamp: number
}

export interface SessionState {
  currentIndex: number
  currentMode: ExerciseMode
  score: number
  totalQuestions: number
  answers: ExerciseAnswer[]
  isAnswered: boolean
  selectedAnswer: string
  sessionFinished: boolean
}

export interface LearningResult {
  totalWords: number
  correctAnswers: number
  accuracy: number
  skillBreakdown: {
    meaning: number
    spelling: number
    listening: number
    pronunciation: number
    context: number
  }
  weakWords: VocabularyItem[]
}
