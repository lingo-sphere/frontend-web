/**
 * @file practice.schema.ts
 * @description Zod Schemas định nghĩa cấu trúc dữ liệu cho dịch vụ practice
 */

import { z } from 'zod'

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
  title: z.string(),
  title_vi: z.string().optional(),
  description: z.string().optional(),
  description_vi: z.string().optional(),
  domain: z.string().default('TOEIC'),
  toeic_part: z.number().optional(),
  exercise_type: z.string().default('ESSAY'),
  writing_level: z.string().default('INTERMEDIATE'),
  prompt_en: z.string(),
  prompt_vi: z.string().optional(),
  min_words: z.number().optional(),
  max_words: z.number().optional(),
  difficulty_level: z.string().default('MEDIUM'),
  cefr_level: z.string().default('B1'),
  status: z.string().default('ACTIVE'),
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

export const DailyJournalPromptSchema = z.object({
  id: z.string(),
  topic_vi: z.string(),
  topic_en: z.string(),
  date: z.string(),
}).passthrough()

export type BackendListeningExercise = z.infer<typeof BackendListeningExerciseSchema>
export type BackendSpeakingExercise = z.infer<typeof BackendSpeakingExerciseSchema>
export type BackendWritingExercise = z.infer<typeof BackendWritingExerciseSchema>
export type SpeechAssessmentResult = z.infer<typeof SpeechAssessmentResultSchema>
export type WritingEvaluationResponse = z.infer<typeof WritingEvaluationResponseSchema>
export type DailyJournalPrompt = z.infer<typeof DailyJournalPromptSchema>
