/**
 * @file vocabulary.dashboard.ts
 * @description Định nghĩa các kiểu dữ liệu cho Vocabulary Dashboard & Learning Analytics
 */

export interface DashboardSummary {
  total_words: number;
  mastered_count: number;
  learning_count: number;
  new_count: number;
  net_retained_words: number;
  due_today_count: number;
  overdue_count: number;
  retention_rate_30d: number;
  net_mastered_growth_30d: number;
  active_weak_count: number;
  recovered_weak_count: number;
}

export interface MemoryStrengthStage {
  count: number;
  percentage: number;
}

export interface MemoryStrengthBreakdown {
  deep_memory: MemoryStrengthStage; // interval >= 30d
  stable: MemoryStrengthStage;      // 7 <= interval < 30d
  learning: MemoryStrengthStage;    // 1 <= interval < 7d
  fragile: MemoryStrengthStage;     // interval < 1d or new
}

export interface CefrLevelData {
  total: number;
  mastered: number;
  learning: number;
}

export interface DailyActivityItem {
  date: string;
  reviews_count: number;
  accuracy: number;
}

export interface DashboardWeakWord {
  lexical_item_id: string;
  word: string;
  ipa?: string;
  part_of_speech?: string;
  meaning_vi?: string;
  wrong_count: number;
  consecutive_correct: number;
  last_wrong_at?: string;
  rescue_priority_score: number;
}

export interface VocabularyDashboardOverview {
  summary: DashboardSummary;
  memory_strength: MemoryStrengthBreakdown;
  cefr_breakdown: Record<string, CefrLevelData>;
  activity_30d: DailyActivityItem[];
  top_weak_words: DashboardWeakWord[];
}
