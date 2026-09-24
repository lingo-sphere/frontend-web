/**
 * @file listening-session.ts
 * @description Types cho Listening Practice Session
 */

export enum TimePreset {
  QUICK = 'quick',
  STANDARD = 'standard',
  INTENSIVE = 'intensive',
}

export const TIME_PRESET_CONFIG = {
  [TimePreset.QUICK]: {
    label: 'Luyện nhanh',
    label_en: 'Quick Practice',
    description: '10 giây/câu - Luyện phản xạ, tăng tốc độ',
    description_en: '10 sec/question - Train fast reflexes',
    seconds: 60,
  },
  [TimePreset.STANDARD]: {
    label: 'Chuẩn TOEIC',
    label_en: 'Standard TOEIC',
    description: '20 giây/câu - Theo format thi thực tế',
    description_en: '20 sec/question - Real exam format',
    seconds: 120,
  },
  [TimePreset.INTENSIVE]: {
    label: 'Luyện kỹ',
    label_en: 'Deep Practice',
    description: '30 giây/câu - Phân tích kỹ, hiểu sâu',
    description_en: '30 sec/question - Deep analysis',
    seconds: 180,
  },
} as const;

export interface ListeningSessionExercise {
  exercise_id: string;
  practice_item_id: string;
  question_text: string;
  question_text_vi?: string;
  image_url?: string;
  audio_url?: string;
  options?: Array<{
    key: string;
    text: string;
  }>;
  explanation?: string;
  explanation_vi?: string;
}

export interface ListeningSession {
  session_id: string;
  user_id: string;
  domain: string;
  exercise_type: string;
  context_id?: string;
  current_index: number;
  total_questions: number;
  exercises: ListeningSessionExercise[];
  answers: Record<string, string>;
  status: string;
  started_at: string;
  // Time info
  time_preset: TimePreset;
  time_preset_label: string;
  time_preset_description: string;
  total_time_seconds: number;
  time_per_question_seconds: number;
}

export interface ListeningSessionResult {
  session_id: string;
  total_questions: number;
  correct_count: number;
  incorrect_count: number;
  skipped_count: number;
  score_percent: number;
  total_time_seconds: number;
  status: string;
  completed_at: string;
  details: Array<{
    question_index: number;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    explanation?: string;
  }>;
}

export interface CreateSessionParams {
  user_id?: string;
  userId?: string;
  context_id?: string;
  cefr_level?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  limit?: number;
  random?: boolean;
  time_preset?: TimePreset;
  custom_time_seconds?: number;
}

export interface SubmitAnswerParams {
  session_id: string;
  question_index: number;
  answer: string;
  time_spent_seconds?: number;
}

export interface SubmitSessionParams {
  session_id: string;
  userId: string;
  total_time_seconds?: number;
  skipped_indices?: number[];
  answers?: Record<string, string>;
}
