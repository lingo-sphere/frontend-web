/**
 * @file exam.schema.ts
 * @description Zod Schemas định nghĩa cấu trúc dữ liệu cho dịch vụ exam
 */

import { z } from 'zod'

export const ExamQuestionOptionSchema = z.object({
  key: z.string(),
  text: z.string(),
}).passthrough()

export const ExamPartQuestionSchema = z.object({
  question_number: z.number(),
  image_url: z.string().optional(),
  audio_url: z.string().optional(),
  question_text: z.string().optional(),
  options: z.array(ExamQuestionOptionSchema),
  correct_answer: z.string().optional(),
  explanation: z.string().optional(),
}).passthrough()

export const ExamPartSchema = z.object({
  part_number: z.number(),
  title: z.string(),
  question_count: z.number(),
  questions: z.array(ExamPartQuestionSchema),
}).passthrough()

export const BackendToeicExamSchema = z.object({
  _id: z.string(),
  title: z.string(),
  code: z.string().optional(),
  slug: z.string().default(''),
  description: z.string().default(''),
  exam_type: z.string().default('FULL_TEST'),
  duration_minutes: z.number().default(120),
  total_questions: z.number().default(200),
  audio_full_url: z.string().optional(),
  audio_url: z.string().optional(),
  is_published: z.boolean().default(true),
  is_system_placement: z.boolean().optional(),
  skills_enabled: z.string().optional(),
  placement_type: z.string().optional(),
  attempts_count: z.number().optional(),
  parts: z.array(ExamPartSchema).optional(),
  questions: z.array(z.record(z.string(), z.unknown())).optional(),
}).passthrough()

export const BackendToeicExamListSchema = z.array(BackendToeicExamSchema)

export const ExamResultPartBreakdownItemSchema = z.object({
  correct: z.number().default(0),
  total: z.number().default(0),
  accuracy: z.number().default(0),
}).passthrough()

export const ExamResultSchema = z.object({
  attempt_id: z.string().optional(),
  submission_id: z.string().optional(),
  exam_id: z.string().optional(),
  total_score: z.number().optional(),
  total_scaled_score: z.number().optional(),
  listening_score: z.number().default(0),
  listening_scaled_score: z.number().optional(),
  reading_score: z.number().default(0),
  reading_scaled_score: z.number().optional(),
  total_correct: z.number().default(0),
  correct_questions: z.number().optional(),
  total_incorrect: z.number().default(0),
  incorrect_questions: z.number().optional(),
  total_skipped: z.number().default(0),
  skipped_questions: z.number().optional(),
  accuracy_percent: z.number().default(0),
  part_breakdown: z.record(z.string(), ExamResultPartBreakdownItemSchema).default({}),
  part_analysis: z.array(z.record(z.string(), z.unknown())).optional(),
  completed_at: z.string().default(() => new Date().toISOString()),
}).passthrough()

export type BackendToeicExam = z.infer<typeof BackendToeicExamSchema>
export type ExamResult = z.infer<typeof ExamResultSchema>

export const ToeicLearningProfileSchema = z.object({
  profile: z.object({
    user_id: z.string().optional(),
    total_tests_taken: z.number().default(0),
    best_score: z.number().default(0),
    best_listening_score: z.number().default(0),
    best_reading_score: z.number().default(0),
    latest_score: z.number().default(0),
    latest_listening_score: z.number().optional(),
    latest_reading_score: z.number().optional(),
    avg_score: z.number().optional(),
    target_score: z.number().default(750),
  }).passthrough().optional().nullable(),
  part_statistics: z.array(z.record(z.string(), z.unknown())).optional(),
  recent_attempts: z.array(z.record(z.string(), z.unknown())).optional(),
}).passthrough()

export type ToeicLearningProfile = z.infer<typeof ToeicLearningProfileSchema>
