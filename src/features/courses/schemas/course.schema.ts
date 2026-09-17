// Định nghĩa schema kiểm tra tính hợp lệ cho dữ liệu khóa học.

import { z } from 'zod'

export const LessonSchema = z.object({
  _id: z.string().default(''),
  id: z.string().optional(),
  module_id: z.string().nullable().optional().transform((v) => v ?? undefined),
  course_id: z.string().nullable().optional().transform((v) => v ?? undefined),
  title: z.string(),
  description: z.string().nullable().optional().transform((v) => v ?? undefined),
  lesson_type: z.string().nullable().optional().transform((v) => v ?? undefined),
  content_html: z.string().nullable().optional().transform((v) => v ?? undefined),
  video_url: z.string().nullable().optional().transform((v) => v ?? undefined),
  theory_file_url: z.string().nullable().optional().transform((v) => v ?? undefined),
  theory_file_name: z.string().nullable().optional().transform((v) => v ?? undefined),
  duration_seconds: z.number().nullable().optional().transform((v) => v ?? 0),
  order_index: z.number().nullable().optional().transform((v) => v ?? 1),
  is_free_preview: z.boolean().nullable().optional().transform((v) => v ?? false),
  lesson_notes: z.string().nullable().optional().transform((v) => v ?? undefined),
}).passthrough()

export const CourseModuleSchema = z.object({
  _id: z.string().default(''),
  id: z.string().optional(),
  course_id: z.string().nullable().optional().transform((v) => v ?? undefined),
  title: z.string(),
  description: z.string().nullable().optional().transform((v) => v ?? undefined),
  theory_file_url: z.string().nullable().optional().transform((v) => v ?? undefined),
  theory_file_name: z.string().nullable().optional().transform((v) => v ?? undefined),
  order_index: z.number().nullable().optional().transform((v) => v ?? 1),
  is_free_preview: z.boolean().nullable().optional().transform((v) => v ?? undefined),
  lessons: z.array(LessonSchema).nullable().optional().transform((v) => v ?? []),
}).passthrough()

export const ChapterSchema = CourseModuleSchema

export const CourseBaseSchema = z.object({
  _id: z.string().default(''),
  id: z.string().optional(),
  title: z.string(),
  slug: z.string().nullable().optional().transform((v) => v ?? ''),
  description: z.string().nullable().optional().transform((v) => v ?? ''),
  thumbnail_url: z.string().nullable().optional().transform((v) => v ?? undefined),
  document_url: z.string().nullable().optional().transform((v) => v ?? undefined),
  document_name: z.string().nullable().optional().transform((v) => v ?? undefined),
  target_score: z.number().nullable().optional().transform((v) => v ?? undefined),
  skills: z.array(z.string()).nullable().optional().transform((v) => v ?? undefined),
  price: z.number().nullable().optional().transform((v) => v ?? 0),
  discount_price: z.number().nullable().optional().transform((v) => v ?? undefined),
  category: z.string().nullable().optional().transform((v) => v ?? 'TOEIC'),
  instructor_id: z.string().nullable().optional().transform((v) => v ?? undefined),
  instructor_name: z.string().nullable().optional().transform((v) => v ?? undefined),
  author_id: z.string().nullable().optional().transform((v) => v ?? undefined),
  author_name: z.string().nullable().optional().transform((v) => v ?? undefined),
  author_avatar: z.string().nullable().optional().transform((v) => v ?? undefined),
  author_title: z.string().nullable().optional().transform((v) => v ?? undefined),
  author_bio: z.string().nullable().optional().transform((v) => v ?? undefined),
  total_modules: z.number().nullable().optional().transform((v) => v ?? undefined),
  total_lessons: z.number().nullable().optional().transform((v) => v ?? 0),
  total_duration_minutes: z.number().nullable().optional().transform((v) => v ?? undefined),
  rating: z.number().nullable().optional().transform((v) => v ?? undefined),
  rating_avg: z.number().nullable().optional().transform((v) => v ?? 5),
  rating_count: z.number().nullable().optional().transform((v) => v ?? 0),
  students_count: z.number().nullable().optional().transform((v) => v ?? 0),
  is_published: z.boolean().nullable().optional().transform((v) => v ?? true),
  approval_status: z.string().nullable().optional().transform((v) => v ?? undefined),
  final_test_exam_id: z.string().nullable().optional().transform((v) => v ?? undefined),
  final_test_passing_score: z.number().nullable().optional().transform((v) => v ?? undefined),
  final_test_duration_minutes: z.number().nullable().optional().transform((v) => v ?? undefined),
  final_test_questions: z.array(z.record(z.string(), z.unknown())).nullable().optional().transform((v) => v ?? undefined),
  final_test_speaking_prompt: z.string().nullable().optional().transform((v) => v ?? undefined),
  final_test_speaking_file_url: z.string().nullable().optional().transform((v) => v ?? undefined),
  final_test_writing_prompt: z.string().nullable().optional().transform((v) => v ?? undefined),
  final_test_writing_file_url: z.string().nullable().optional().transform((v) => v ?? undefined),
  modules: z.array(CourseModuleSchema).nullable().optional().transform((v) => v ?? undefined),
  chapters: z.array(CourseModuleSchema).nullable().optional().transform((v) => v ?? undefined),
  curriculum: z.array(CourseModuleSchema).nullable().optional().transform((v) => v ?? undefined),
  created_at: z.union([z.string(), z.date()]).nullable().optional().transform((v) => v ?? undefined),
  updated_at: z.union([z.string(), z.date()]).nullable().optional().transform((v) => v ?? undefined),
}).passthrough()

export const CourseDetailResponseSchema = z.object({
  course: CourseBaseSchema,
  curriculum: z.array(CourseModuleSchema).optional(),
  modules: z.array(CourseModuleSchema).optional(),
  total_modules: z.number().optional(),
  total_lessons: z.number().optional(),
}).passthrough().transform((val) => ({
  ...val.course,
  course: val.course,
  curriculum: val.curriculum || val.course.modules || [],
  modules: val.curriculum || val.course.modules || [],
  chapters: val.curriculum || val.course.modules || [],
  total_modules: val.total_modules ?? val.course.total_modules ?? (val.curriculum || []).length,
  total_lessons: val.total_lessons ?? val.course.total_lessons,
}))

export const CourseSchema = z.union([
  CourseDetailResponseSchema,
  CourseBaseSchema,
])

export const PaginationMetaSchema = z.object({
  current: z.number().default(1),
  pageSize: z.number().default(10),
  pages: z.number().default(1),
  total: z.number().default(0),
}).passthrough()

export const PaginatedCoursesSchema = z.object({
  meta: PaginationMetaSchema,
  result: z.array(CourseSchema),
}).passthrough()

export const CourseListSchema = z.array(CourseSchema)

export type Lesson = z.infer<typeof LessonSchema>
export type CourseModule = z.infer<typeof CourseModuleSchema>
export type Chapter = z.infer<typeof ChapterSchema>
export type Course = z.infer<typeof CourseSchema>
