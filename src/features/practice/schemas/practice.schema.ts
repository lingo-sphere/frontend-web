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
  title_vi: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  description_vi: z.string().nullable().optional(),
  domain: z.string().nullable().optional().default('TOEIC'),
  toeic_part: z.number().nullable().optional(),
  media_id: z.string().nullable().optional().default(''),
  media_type: z.string().nullable().optional().default('AUDIO'),
  duration_seconds: z.number().nullable().optional().default(0),
  transcript: z.string().nullable().optional(),
  difficulty_level: z.string().nullable().optional().default('EASY'),
  cefr_level: z.string().nullable().optional().default('A1'),
  status: z.string().nullable().optional().default('ACTIVE'),
}).passthrough()

export const BackendListeningExerciseListSchema = z.array(BackendListeningExerciseSchema)

export const BackendListeningExercisePaginatedSchema = z.object({
  items: z.array(BackendListeningExerciseSchema),
  pagination: PaginationSchema,
})

// PracticeItem schema cho Listening
export const BackendListeningPracticeItemSchema = z.object({
  _id: z.string(),
  domain: z.string().nullable().optional().default('LISTENING'),
  question_type: z.string().nullable().optional().default('MULTIPLE_CHOICE'),
  exercise_type: z.string().nullable().optional().default('PICTURE_DESCRIPTION'),
  question_text_en: z.string().nullable().optional(),
  question_text_vi: z.string().nullable().optional(),
  instruction_en: z.string().nullable().optional(),
  instruction_vi: z.string().nullable().optional(),
  question_data: z.object({
    options: z.array(z.object({
      key: z.string(),
      text: z.string(),
      is_correct: z.boolean(),
    })).nullable().optional(),
    explanation: z.string().nullable().optional(),
    explanation_vi: z.string().nullable().optional(),
  }).nullable().optional(),
  listening_exercise_id: z.string().nullable().optional(),
  media_id: z.string().nullable().optional(),
  difficulty_level: z.string().nullable().optional().default('MEDIUM'),
  cefr_level: z.string().nullable().optional().default('B1'),
  context_id: z.string().nullable().optional(),
  status: z.string().nullable().optional().default('PUBLISHED'),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
  // Merged fields from ListeningExercise
  audio_media_id: z.string().nullable().optional(),
  audio_duration: z.number().nullable().optional(),
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
  title_vi: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  description_vi: z.string().nullable().optional(),
  domain: z.string().nullable().optional().default('TOEIC'),
  toeic_part: z.number().nullable().optional(),
  exercise_type: z.string().default('READ_ALOUD'),
  prompt_text_en: z.string().nullable().optional(),
  prompt_text_vi: z.string().nullable().optional(),
  preparation_time_seconds: z.number().nullable().optional().default(45),
  response_time_seconds: z.number().nullable().optional().default(45),
  difficulty_level: z.string().nullable().optional().default('MEDIUM'),
  cefr_level: z.string().nullable().optional().default('B1'),
  status: z.string().nullable().optional().default('ACTIVE'),
}).passthrough()

export const BackendSpeakingExerciseListSchema = z.array(BackendSpeakingExerciseSchema)

export const BackendWritingExerciseSchema = z.object({
  _id: z.string(),
  code: z.string().nullable().optional(),
  title: z.string(),
  title_vi: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  description_vi: z.string().nullable().optional(),
  domain: z.string().nullable().optional().default('WRITING'),
  toeic_part: z.number().nullable().optional(),
  exercise_type: z.string().default('DESCRIBE_PICTURE'),
  writing_level: z.string().default('INTERMEDIATE'),
  prompt_en: z.string().nullable().optional(),
  prompt_vi: z.string().nullable().optional(),
  prompt_text: z.string().nullable().optional(),
  prompt_text_vi: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  guiding_questions: z.array(z.string()).nullable().optional(),
  guiding_questions_vi: z.array(z.string()).nullable().optional(),
  keywords: z.array(z.string()).nullable().optional(),
  min_words: z.number().nullable().optional(),
  max_words: z.number().nullable().optional(),
  difficulty_level: z.string().nullable().optional().default('MEDIUM'),
  cefr_level: z.string().nullable().optional().default('B1'),
  status: z.string().nullable().optional().default('PUBLISHED'),
}).passthrough()

export const BackendWritingExerciseListSchema = z.array(BackendWritingExerciseSchema)

export const SpeechAssessmentWordSchema = z.object({
  word: z.string(),
  start: z.number(),
  end: z.number(),
  probability: z.number(),
}).passthrough()

export const SpeechAssessmentResultSchema = z.object({
  transcribed_text: z.string().nullable().optional().default(''),
  duration: z.number().nullable().optional().default(0),
  words: z.array(SpeechAssessmentWordSchema).nullable().optional().default([]),
  grammar_score: z.number().nullable().optional(),
  pronunciation_score: z.number().nullable().optional(),
  fluency_score: z.number().nullable().optional(),
  overall_score: z.number().nullable().optional(),
  feedback_vi: z.string().nullable().optional(),
  better_version: z.string().nullable().optional(),
}).passthrough()

export type BackendListeningExercise = z.infer<typeof BackendListeningExerciseSchema>
export type BackendSpeakingExercise = z.infer<typeof BackendSpeakingExerciseSchema>
export type BackendWritingExercise = z.infer<typeof BackendWritingExerciseSchema>
export type SpeechAssessmentResult = z.infer<typeof SpeechAssessmentResultSchema>
