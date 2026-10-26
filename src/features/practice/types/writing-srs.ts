export type WritingSrsKind = "GRAMMAR" | "VOCABULARY" | "COMMUNICATION";
export type WritingSrsFilter = {
  status: "DUE" | "ALL" | "STABLE" | "PAUSED";
  kind: string;
  context_id: string;
  search: string;
  page: number;
};
export interface WritingSrsItem {
  _id: string;
  content_id: string;
  status: "PENDING" | "PAUSED";
  due_at: string;
  interval_days: number;
  writing: {
    kind: WritingSrsKind;
    label: string;
    label_en: string;
    state: "MONITORING" | "NEEDS_PRACTICE" | "IMPROVING" | "STABLE";
    original?: string;
    corrected?: string;
    explanation: string;
    error_count: number;
    applied_count: number;
    independent_successes: number;
    last_exercise_title: string;
    last_submission_id: string;
    last_error_submission_id?: string;
    last_error_exercise_title?: string;
    last_observed_at: string;
    context_stats: Array<{
      context_id: string;
      name: string;
      name_en: string;
      errors: number;
      applications: number;
      independent_successes: number;
    }>;
  };
}
export interface WritingSrsList {
  items: WritingSrsItem[];
  total: number;
  page: number;
  limit: number;
  summary: { total: number; due: number; stable: number; paused: number };
  contexts: Array<{
    _id: string;
    name: string;
    name_en: string;
    errors: number;
    applications: number;
    independent_successes: number;
  }>;
  pending_submissions: number;
}
export interface WritingSrsDetail {
  item: WritingSrsItem;
  can_rewrite: boolean;
  candidates: Array<{
    id: string;
    title: string;
    title_vi?: string;
    exercise_type: string;
    cefr_level: string;
    match: "CONTEXT" | "TARGET";
  }>;
  history: Array<{
    submission_id: string;
    exercise_id: string;
    created_at: string;
    observations: Array<{
      key: string;
      outcome: string;
      explanation: string;
      evidence: string[];
      credited: boolean;
      reason: string;
    }>;
  }>;
}
export interface WritingReviewSession {
  _id: string;
  exercise_id: string;
  mode: "REWRITE" | "TRANSFER";
  assisted: boolean;
  can_submit: boolean;
  submission_id?: string;
  expires_at: string;
  targets: Array<{
    id: string;
    key: string;
    kind: WritingSrsKind;
    label: string;
    label_en: string;
    original?: string;
    corrected?: string;
    explanation?: string;
  }>;
}
