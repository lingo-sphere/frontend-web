/**
 * @file course.schema.ts
 * @description Zod Schemas định nghĩa cấu trúc dữ liệu cho dịch vụ course và roadmap
 */

import { z } from 'zod'

export const LessonSchema = z.object({
  id: z.string().default(''),
  _id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  video_url: z.string().optional(),
  duration_seconds: z.number().default(0),
  order_index: z.number().default(1),
  is_free_preview: z.boolean().default(false),
  lesson_notes: z.string().optional(),
}).passthrough()

export const ChapterSchema = z.object({
  id: z.string().default(''),
  _id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  order_index: z.number().default(1),
  lessons: z.array(LessonSchema).default([]),
}).passthrough()

export const CourseSchema = z.object({
  id: z.string().default(''),
  _id: z.string().optional(),
  title: z.string(),
  slug: z.string().default(''),
  description: z.string().default(''),
  thumbnail_url: z.string().optional(),
  target_score: z.number().optional(),
  skills: z.array(z.string()).optional(),
  price: z.number().default(0),
  discount_price: z.number().optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
  category: z.string().default('TOEIC'),
  instructor_id: z.string().optional(),
  instructor_name: z.string().optional(),
  total_lessons: z.number().default(0),
  total_duration_minutes: z.number().default(0),
  rating_avg: z.number().default(5),
  rating_count: z.number().default(0),
  is_published: z.boolean().default(true),
  chapters: z.array(ChapterSchema).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
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
  course: CourseSchema.nullable().optional(),
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
  status: z.enum(['LOCKED', 'IN_PROGRESS', 'COMPLETED']).default('LOCKED'),
  completed_at: z.string().optional(),
  checkpoint_score: z.number().optional(),
  checkpoint_passed: z.boolean().optional(),
  score_growth: z.number().optional(),
}).passthrough()

export const GrowthChartPointSchema = z.object({
  milestone_name: z.string(),
  score: z.number(),
  date: z.string().optional(),
  target: z.number().optional(),
}).passthrough()

export const UserRoadmapProgressSchema = z.object({
  _id: z.string(),
  user_id: z.string(),
  roadmap_id: z.string(),
  roadmap: LearningRoadmapSchema.nullable().optional(),
  enrolled_at: z.string(),
  baseline_score: z.number().default(0),
  current_estimated_score: z.number().default(0),
  current_stage_order: z.number().default(1),
  status: z.enum(['ACTIVE', 'COMPLETED', 'PAUSED']).default('ACTIVE'),
  completed_at: z.string().optional(),
  stage_milestones: z.array(StageMilestoneSchema).default([]),
  growth_chart_data: z.array(GrowthChartPointSchema).default([]),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
}).passthrough()

export type Lesson = z.infer<typeof LessonSchema>
export type Chapter = z.infer<typeof ChapterSchema>
export type Course = z.infer<typeof CourseSchema>
export type LearningRoadmapStage = z.infer<typeof LearningRoadmapStageSchema>
export type LearningRoadmap = z.infer<typeof LearningRoadmapSchema>
export type StageMilestone = z.infer<typeof StageMilestoneSchema>
export type GrowthChartPoint = z.infer<typeof GrowthChartPointSchema>
export type UserRoadmapProgress = z.infer<typeof UserRoadmapProgressSchema>
