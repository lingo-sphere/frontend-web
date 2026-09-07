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
  submission_id: z.string(),
  exam_id: z.string(),
  total_score: z.number(),
  listening_score: z.number().default(0),
  reading_score: z.number().default(0),
  total_correct: z.number().default(0),
  total_incorrect: z.number().default(0),
  total_skipped: z.number().default(0),
  accuracy_percent: z.number().default(0),
  part_breakdown: z.record(z.string(), ExamResultPartBreakdownItemSchema).default({}),
  completed_at: z.string().default(() => new Date().toISOString()),
}).passthrough()

export type BackendToeicExam = z.infer<typeof BackendToeicExamSchema>
export type ExamResult = z.infer<typeof ExamResultSchema>
