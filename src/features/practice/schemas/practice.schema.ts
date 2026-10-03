/**
 * @file practice.schema.ts
 * @description Zod Schemas định nghĩa cấu trúc dữ liệu cho dịch vụ practice
 */

import { z } from 'zod'

// Pagination schema - khai báo TRƯỚC
export const PaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
})

export const BackendListeningExerciseSchema = z.object({
  _id: z.string(),
  title: z.string(),
  title_vi: z.string().optional(),
  description: z.string().optional(),
  description_vi: z.string().optional(),
  domain: z.string().default('TOEIC'),
  toeic_part: z.number().optional(),
  media_id: z.string().default(''),
  media_type: z.string().default('AUDIO'),
  duration_seconds: z.number().default(0),
  transcript: z.string().optional(),
  difficulty_level: z.string().default('EASY'),
  cefr_level: z.string().default('A1'),
  status: z.string().default('ACTIVE'),
}).passthrough()

export const BackendListeningExerciseListSchema = z.array(BackendListeningExerciseSchema)

export const BackendListeningExercisePaginatedSchema = z.object({
  items: z.array(BackendListeningExerciseSchema),
  pagination: PaginationSchema,
})

// PracticeItem schema cho Listening
export const BackendListeningPracticeItemSchema = z.object({
  _id: z.string(),
  domain: z.string().default('LISTENING'),
  question_type: z.string().default('MULTIPLE_CHOICE'),
  exercise_type: z.string().default('PICTURE_DESCRIPTION'),
  question_text_en: z.string().optional(),
  question_text_vi: z.string().optional(),
  instruction_en: z.string().optional(),
  instruction_vi: z.string().optional(),
  question_data: z.object({
    options: z.array(z.object({
      key: z.string(),
      text: z.string(),
      is_correct: z.boolean(),
    })).optional(),
    explanation: z.string().optional(),
    explanation_vi: z.string().optional(),
  }).optional(),
  listening_exercise_id: z.string().optional(),
  media_id: z.string().optional(),
  difficulty_level: z.string().default('MEDIUM'),
  cefr_level: z.string().default('B1'),
  context_id: z.string().optional(),
  status: z.string().default('PUBLISHED'),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  // Merged fields from ListeningExercise
  audio_media_id: z.string().optional(),
  audio_duration: z.number().optional(),
}).passthrough()

export const BackendListeningPracticeItemListSchema = z.array(BackendListeningPracticeItemSchema)

export const BackendListeningPracticeItemPaginatedSchema = z.object({
  items: z.array(BackendListeningPracticeItemSchema),
  pagination: PaginationSchema,
})

// Inferred types
export type BackendListeningPracticeItem = z.infer<typeof BackendListeningPracticeItemSchema>
export type BackendListeningPracticeItemPaginated = z.infer<typeof BackendListeningPracticeItemPaginatedSchema>

export const BackendSpeakingExerciseSchema = z.object({
  _id: z.string(),
  title: z.string(),
  title_vi: z.string().optional(),
  description: z.string().optional(),
  description_vi: z.string().optional(),
  domain: z.string().default('TOEIC'),
  toeic_part: z.number().optional(),
  exercise_type: z.string().default('READ_ALOUD'),
  prompt_text_en: z.string().optional(),
  prompt_text_vi: z.string().optional(),
  preparation_time_seconds: z.number().default(45),
  response_time_seconds: z.number().default(45),
  difficulty_level: z.string().default('MEDIUM'),
  cefr_level: z.string().default('B1'),
  status: z.string().default('ACTIVE'),
}).passthrough()

export const BackendSpeakingExerciseListSchema = z.array(BackendSpeakingExerciseSchema)

export const BackendWritingExerciseSchema = z.object({
  _id: z.string(),
  code: z.string().optional(),
  title: z.string(),
  title_vi: z.string().optional(),
  description: z.string().optional(),
  description_vi: z.string().optional(),
  domain: z.string().default('WRITING'),
  toeic_part: z.number().optional(),
  exercise_type: z.string().default('DESCRIBE_PICTURE'),
  writing_level: z.string().default('INTERMEDIATE'),
  prompt_en: z.string().optional(),
  prompt_vi: z.string().optional(),
  prompt_text: z.string().optional(),
  prompt_text_vi: z.string().optional(),
  image_url: z.string().optional(),
  guiding_questions: z.array(z.string()).optional(),
  guiding_questions_vi: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  min_words: z.number().optional(),
  max_words: z.number().optional(),
  difficulty_level: z.string().default('MEDIUM'),
  cefr_level: z.string().default('B1'),
  status: z.string().default('PUBLISHED'),
}).passthrough()

export const BackendWritingExerciseListSchema = z.array(BackendWritingExerciseSchema)

export const SpeechAssessmentWordSchema = z.object({
  word: z.string(),
  start: z.number(),
  end: z.number(),
  probability: z.number(),
}).passthrough()

export const SpeechAssessmentResultSchema = z.object({
  transcribed_text: z.string().default(''),
  duration: z.number().default(0),
  words: z.array(SpeechAssessmentWordSchema).default([]),
  grammar_score: z.number().optional(),
  pronunciation_score: z.number().optional(),
  fluency_score: z.number().optional(),
  overall_score: z.number().optional(),
  feedback_vi: z.string().optional(),
  better_version: z.string().optional(),
}).passthrough()

export const WritingEvaluationResponseSchema = z.object({
  grammar_score: z.number().default(0),
  vocabulary_score: z.number().default(0),
  coherence_score: z.number().default(0),
  overall_score: z.number().default(0),
  feedback_vi: z.string().default(''),
  improved_essay: z.string().default(''),
}).passthrough()

export type BackendListeningExercise = z.infer<typeof BackendListeningExerciseSchema>
export type BackendSpeakingExercise = z.infer<typeof BackendSpeakingExerciseSchema>
export type BackendWritingExercise = z.infer<typeof BackendWritingExerciseSchema>
export type SpeechAssessmentResult = z.infer<typeof SpeechAssessmentResultSchema>
export type WritingEvaluationResponse = z.infer<typeof WritingEvaluationResponseSchema>
