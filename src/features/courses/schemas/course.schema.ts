// Handles course and roadmap validation schemas.

import { z } from 'zod'

export const LessonSchema = z.object({
  _id: z.string().default(''),
  id: z.string().optional(),
  module_id: z.string().optional(),
  course_id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  lesson_type: z.string().optional(),
  content_html: z.string().optional(),
  video_url: z.string().optional(),
  duration_seconds: z.number().default(0),
  order_index: z.number().default(1),
  is_free_preview: z.boolean().default(false),
  lesson_notes: z.string().optional(),
}).passthrough()

export const CourseModuleSchema = z.object({
  _id: z.string().default(''),
  id: z.string().optional(),
  course_id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  order_index: z.number().default(1),
  is_free_preview: z.boolean().optional(),
  lessons: z.array(LessonSchema).default([]),
}).passthrough()

export const ChapterSchema = CourseModuleSchema

export const CourseBaseSchema = z.object({
  _id: z.string().default(''),
  id: z.string().optional(),
  title: z.string(),
  slug: z.string().default(''),
  description: z.string().default(''),
  thumbnail_url: z.string().optional(),
  target_score: z.number().optional(),
  skills: z.array(z.string()).optional(),
  price: z.number().default(0),
  discount_price: z.number().optional(),
  level: z.string().default('BEGINNER'),
  category: z.string().default('TOEIC'),
  instructor_id: z.string().optional(),
  instructor_name: z.string().optional(),
  author_id: z.string().optional(),
  author_name: z.string().optional(),
  author_avatar: z.string().optional(),
  total_modules: z.number().optional(),
  total_lessons: z.number().default(0),
  total_duration_minutes: z.number().optional(),
  rating: z.number().optional(),
  rating_avg: z.number().default(5),
  rating_count: z.number().default(0),
  students_count: z.number().default(0),
  is_published: z.boolean().default(true),
  approval_status: z.string().optional(),
  modules: z.array(CourseModuleSchema).optional(),
  chapters: z.array(CourseModuleSchema).optional(),
  curriculum: z.array(CourseModuleSchema).optional(),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
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

export const LearningRoadmapStageSchema = z.object({
  stage_order: z.number().default(1),
  stage_title: z.string().default(''),
  stage_description: z.string().optional(),
  course_id: z.string().default(''),
  target_band: z.string().optional(),
  checkpoint_exam_id: z.string().optional(),
  passing_score: z.number().optional(),
  is_optional: z.boolean().optional(),
  course: CourseBaseSchema.nullable().optional(),
}).passthrough()

export const LearningRoadmapSchema = z.object({
  _id: z.string().default(''),
  title: z.string(),
  slug: z.string().default(''),
  description: z.string().optional(),
  skills_focus: z.enum(['2SKILLS', '4SKILLS']).default('2SKILLS'),
  target_score: z.number().default(500),
  min_entry_score: z.number().default(0),
  max_entry_score: z.number().default(990),
  stages: z.array(LearningRoadmapStageSchema).default([]),
  bundle_price: z.number().optional(),
  original_price: z.number().optional(),
  version: z.number().optional(),
  is_published: z.boolean().default(false),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
}).passthrough()

export const RoadmapListSchema = z.array(LearningRoadmapSchema)

export const StageMilestoneSchema = z.object({
  stage_order: z.number(),
  course_id: z.string(),
  course_title: z.string().optional(),
  status: z.union([z.enum(['LOCKED', 'IN_PROGRESS', 'COMPLETED']), z.string()]).default('LOCKED'),
  completed_at: z.union([z.string(), z.date()]).optional(),
  checkpoint_score: z.number().optional(),
  checkpoint_passed: z.boolean().optional(),
  is_completed: z.boolean().optional(),
  score_growth: z.number().optional(),
  pre_stage_score: z.number().optional(),
}).passthrough()

export const GrowthChartPointSchema = z.object({
  label: z.string().optional(),
  milestone_name: z.string().optional(),
  score: z.number().default(0),
  date: z.string().optional(),
  target: z.number().optional(),
  is_target: z.boolean().optional(),
}).passthrough()

export const UserRoadmapProgressObjectSchema = z.object({
  _id: z.string().default(''),
  id: z.string().optional(),
  user_id: z.string().default(''),
  roadmap_id: z.string().default(''),
  roadmap_title: z.string().optional(),
  roadmap: LearningRoadmapSchema.nullable().optional(),
  enrolled_at: z.union([z.string(), z.date()]).optional(),
  last_activity_at: z.union([z.string(), z.date()]).optional(),
  baseline_score: z.union([z.number(), z.record(z.string(), z.unknown())]).optional().default(0),
  current_estimated_score: z.union([z.number(), z.record(z.string(), z.unknown())]).optional().default(0),
  current_stage_order: z.number().default(1),
  status: z.string().default('IN_PROGRESS'),
  completed_at: z.union([z.string(), z.date()]).optional(),
  stage_milestones: z.array(StageMilestoneSchema).default([]),
  growth_chart_data: z.array(GrowthChartPointSchema).default([]),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
}).passthrough()

export const UserRoadmapProgressSchema = z
  .union([UserRoadmapProgressObjectSchema, z.literal(''), z.null(), z.undefined()])
  .transform((val) => (val === '' ? null : (val ?? null)))

export type Lesson = z.infer<typeof LessonSchema>
export type CourseModule = z.infer<typeof CourseModuleSchema>
export type Chapter = z.infer<typeof ChapterSchema>
export type Course = z.infer<typeof CourseSchema>
export type LearningRoadmapStage = z.infer<typeof LearningRoadmapStageSchema>
export type LearningRoadmap = z.infer<typeof LearningRoadmapSchema>
export type StageMilestone = z.infer<typeof StageMilestoneSchema>
export type GrowthChartPoint = z.infer<typeof GrowthChartPointSchema>
export type UserRoadmapProgress = z.infer<typeof UserRoadmapProgressObjectSchema>
