// Service xử lý API tiến độ học tập và bài thi của người dùng.

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import type { UserCourseProgressItem } from '@/types/api.types'

export type { UserCourseProgressItem }

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export type TimePeriod = '7d' | '30d' | '90d' | 'all'
export type SkillType = 'grammar' | 'reading' | 'listening' | 'speaking' | 'writing'
export type EvidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH'
export type TrendDirection = 'IMPROVING' | 'STABLE' | 'DECLINING'

export interface EvidenceWeight {
  total_attempts: number
  total_questions: number
  level: EvidenceLevel
  confidence_percent: number
  attempts_7d: number
  attempts_30d: number
  questions_7d: number
  questions_30d: number
}

export interface SkillStats {
  skill: SkillType
  accuracy: number
  total_attempts: number
  total_questions: number
  evidence: EvidenceWeight
  trend: TrendDirection
  trend_score: number
  last_practiced_at?: string
  by_dimension?: Record<string, { accuracy: number; correct: number; total: number }>
}

export interface WeaknessAnalysis {
  skill: SkillType
  dimension_id: string
  dimension_name: string
  accuracy: number
  attempts: number
  questions: number
  evidence_level: EvidenceLevel
  trend: TrendDirection
  trend_score: number
  weakness_score: number
  recommended_actions: string[]
}

export interface SkillsSummary {
  period: TimePeriod
  skills: Record<SkillType, SkillStats>
}

export interface VocabularyAnalytics {
  total_saved: number
  total_learning: number
  total_mastered: number
  avg_memory_strength: number
  retention_rate_7d: number
  retention_rate_30d: number
  high_decay_words: number
  overdue_words: number
  by_status: Record<string, number>
  by_level: Record<string, { total: number; mastered: number; accuracy: number }>
}

export interface FullSkillAnalysis {
  stats: SkillStats
  weaknesses: WeaknessAnalysis[]
  cefr: {
    estimated_level: string
    confidence: EvidenceLevel
    level_attempted_meet: boolean
    lower_level_meet: boolean
    attempts_at_level: number
    recommendation?: string
  }
}

export const progressService = {

  async getMyCoursesProgress(): Promise<UserCourseProgressItem[]> {
    try {
      const res = await api.get<UserCourseProgressItem[]>(API_CONFIG.ENDPOINTS.PROGRESS.COURSES)
      return Array.isArray(res) ? res : []
    } catch {
      return []
    }
  },

  async getCourseProgressDetail(courseId: string): Promise<{
    course_progress: UserCourseProgressItem | null
    modules_progress: Array<Record<string, unknown>>
    completed_lesson_ids: string[]
  } | null> {
    try {
      return await api.get(API_CONFIG.ENDPOINTS.PROGRESS.COURSE_DETAIL(courseId))
    } catch {
      return null
    }
  },

  async getGrowthChart(courseId: string): Promise<{
    course_id: string
    growth_chart_data: Array<{ stage: string; score: number; timestamp?: string }>
  } | null> {
    try {
      return await api.get(API_CONFIG.ENDPOINTS.PROGRESS.GROWTH_CHART(courseId))
    } catch {
      return null
    }
  },

  async getMyTestAttempts(): Promise<Array<{
    attempt_id: string
    test_type: string
    course_id: string
    module_id?: string
    order_index?: number
    score: number
    correct_count: number
    total_questions: number
    is_passed: boolean
    submitted_at: string
  }>> {
    try {
      const res = await api.get<Array<{
        attempt_id: string
        test_type: string
        course_id: string
        module_id?: string
        order_index?: number
        score: number
        correct_count: number
        total_questions: number
        is_passed: boolean
        submitted_at: string
      }>>(API_CONFIG.ENDPOINTS.PROGRESS.TEST_ATTEMPTS)
      return Array.isArray(res) ? res : []
    } catch {
      return []
    }
  },

  // ============================================================================
  // PRACTICE ANALYTICS APIs
  // ============================================================================

  async getSkillsSummary(userId: string, period: TimePeriod = '7d'): Promise<SkillsSummary | null> {
    try {
      return await api.get(`/practice/analytics/${userId}/summary`, { period })
    } catch {
      return null
    }
  },

  async getSkillStats(userId: string, skill: SkillType, period: TimePeriod = '7d'): Promise<SkillStats | null> {
    try {
      return await api.get(`/practice/analytics/${userId}/skill/${skill}`, { period })
    } catch {
      return null
    }
  },

  async getSkillWeaknesses(
    userId: string,
    skill: SkillType,
    period: TimePeriod = '30d'
  ): Promise<WeaknessAnalysis[]> {
    try {
      return await api.get(`/practice/analytics/${userId}/skill/${skill}/weaknesses`, { period })
    } catch {
      return []
    }
  },

  async getFullSkillAnalysis(userId: string, skill: SkillType): Promise<FullSkillAnalysis | null> {
    try {
      return await api.get(`/practice/analytics/${userId}/skill/${skill}/full`)
    } catch {
      return null
    }
  },

  async getAllWeaknesses(userId: string, limit: number = 10): Promise<WeaknessAnalysis[]> {
    try {
      return await api.get(`/practice/analytics/${userId}/weaknesses/all`, { limit })
    } catch {
      return []
    }
  },

  async getVocabularyAnalytics(userId: string): Promise<VocabularyAnalytics | null> {
    try {
      return await api.get(`/practice/vocabulary/analytics/${userId}`)
    } catch {
      return null
    }
  },

  async getWordsNeedingReview(userId: string, limit: number = 20): Promise<any[]> {
    try {
      return await api.get(`/practice/vocabulary/analytics/${userId}/due`, { limit })
    } catch {
      return []
    }
  },

  async getPracticeDashboard(userId: string, period?: string): Promise<PracticeDashboardData | null> {
    try {
      const url = period ? `/practice/dashboard/${userId}?period=${period}` : `/practice/dashboard/${userId}`
      return await api.get(url)
    } catch {
      return null
    }
  },

  async getDayDetail(userId: string, date: string): Promise<any> {
    try {
      return await api.get(`/practice/dashboard/${userId}/daily?date=${date}`)
    } catch {
      return null
    }
  },
}

export interface RadarDataPoint {
  axis: string
  key: string
  value: number
  fullMark: number
}

export interface ActivityOverview {
  this_week_time_seconds: number
  this_week_time_formatted: string
  last_week_time_seconds: number
  time_growth_pct: number
  this_week_xp: number
  last_week_xp: number
  xp_growth_pct: number
  this_week_exercises: number
  this_week_questions: number
  this_week_correct: number
  this_week_accuracy: number
}

export interface SkillRecentStat {
  accuracy?: number
  avg_score?: number
  total?: number
  submissions?: number
  reviewed?: number
  has_data: boolean
}

export interface SparklineAttemptDetail {
  order: number
  is_correct: boolean
  score: number
  skill: string
  skill_label: string
  topic: string
  cefr_level?: string
  time_spent_seconds?: number
  time_spent_formatted?: string
  created_at?: string
  time_ago?: string
  question_id?: string
}

export interface RollingPerformance {
  window_size: number
  recent_accuracy: number
  lifetime_accuracy: number
  momentum_delta: number
  momentum_status: 'ACCELERATING' | 'STABLE' | 'DECLINING'
  status_label: string
  writing_recent_avg: number
  speaking_recent_avg: number
  recent_attempts_count: number
  recent_scores_sparkline: number[]
  sparkline_details?: SparklineAttemptDetail[]
  skills_recent?: {
    reading: SkillRecentStat
    listening: SkillRecentStat
    grammar: SkillRecentStat
    writing: SkillRecentStat
    speaking: SkillRecentStat
    vocabulary: SkillRecentStat
  }
}

export interface TimeGrowth {
  period_label: string
  this_week_total: number
  last_week_total: number
  activity_growth_pct: number
  study_velocity: number
  overall_delta_accuracy: number
  trend_direction: 'UP' | 'STEADY' | 'DOWN'
  trend_label: string
  skills_delta: {
    grammar: number
    reading: number
    listening: number
    writing: number
    speaking: number
    vocabulary: number
  }
  daily_breakdown_7d: Array<{
    date: string
    day_name: string
    full_date_label?: string
    attempts: number
    correct: number
    accuracy: number
    time_spent_seconds?: number
    time_spent_formatted?: string
    exercises_count?: number
    questions_attempted?: number
    questions_correct?: number
    has_activity?: boolean
    skills_practiced?: Array<{
      skill: string
      skill_name: string
      icon: string
      is_rubric: boolean
      time_spent_seconds?: number
      questions_attempted?: number
      questions_correct?: number
      accuracy?: number
      exercises_completed?: number
      exercises_count?: number
      submissions?: number
      overall_score?: number
      avg_overall_score?: number
      avg_time_per_question?: number
      avg_word_count?: number
      recording_duration_seconds?: number
      sub_scores?: Record<string, number>
      sub_skills?: Record<string, { label: string; accuracy: number }>
      listening_details?: {
        avg_replays?: number
        modes_breakdown?: Record<string, { label: string; accuracy: number }>
      }
    }>
    skill_breakdown?: {
      grammar: { exercises: number; questions: number }
      vocabulary: { exercises: number; questions: number }
      reading: { exercises: number; questions: number }
      listening: { exercises: number; questions: number }
      writing: { exercises: number; questions: number }
      speaking: { exercises: number; questions: number }
    }
  }>
}

export interface ContextPerformanceItem {
  context_id: string
  context_name: string
  total_questions: number
  correct_count: number
  accuracy: number
  domains: string[]
}

export interface AdvancedInsights {
  confidence_accuracy: {
    high_confidence: { attempts: number; correct: number; accuracy: number }
    medium_confidence: { attempts: number; correct: number; accuracy: number }
    low_confidence: { attempts: number; correct: number; accuracy: number }
    blind_spots_count: number
  }
  hint_analysis: {
    total_with_hints: number
    total_without_hints: number
    accuracy_with_hints: number
    accuracy_without_hints: number
    hint_dependency_pct: number
  }
  behavioral_metrics: {
    writing: {
      avg_word_count: number
      avg_writing_time_minutes: number
      words_per_minute: number
      total_submissions: number
    }
    speaking: {
      avg_speaking_time_seconds: number
      total_recordings: number
    }
    listening: {
      avg_replays: number
      avg_time_seconds: number
      total_completed: number
    }
  }
}

export interface RecentHistoryItem {
  id: string
  skill: string
  skill_label: string
  title: string
  score_display: string
  is_passed: boolean
  time_spent_formatted: string
  created_at: string
  review_url: string
}

export interface AIDiagnosticWeakness {
  weakness_type: string
  target_id: string
  topic_name?: string
  total_attempts?: number
  total_mistakes: number
  accuracy_rate: number
  priority: number
  trend: string
  cefr_level?: string
  last_5_attempts?: boolean[]
  first_mistake_at?: string
  last_mistake_at?: string
  severity_score?: number
  severity_level?: 'CRITICAL' | 'BLIND_SPOT' | 'MODERATE'
  severity_label?: string
  context_hint?: string
  root_cause?: string
  exam_trap?: string
  next_morning_step?: string
}

export interface AIDailySummary {
  status_badge: string
  headline: string
  total_critical_count: number
  other_mistakes_count: number
  next_morning_plan: Array<{
    step: number
    duration: string
    title: string
    action_text: string
    action_url: string
  }>
}

export interface PracticeDashboardData {
  skills: any
  weekly_comparison: any
  top_weaknesses: AIDiagnosticWeakness[]
  ai_daily_summary?: AIDailySummary
  today_stats: any
  growth_analytics?: {
    activity_overview?: ActivityOverview
    rolling_performance: RollingPerformance
    time_growth: TimeGrowth
    context_performance?: ContextPerformanceItem[]
    advanced_insights?: AdvancedInsights
  }
  recent_history?: RecentHistoryItem[]
  period?: string
}


