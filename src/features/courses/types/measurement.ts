export interface MeasurementEstimate {
  score: number; lower: number; upper: number; max: number; method: string; profile_id?: string; profile_version?: string
}
export interface MeasurementPoint {
  attempt_id: string; stage: string; test_type: string; assessed_at: string; score: number
  skill_scores: Record<string, number>; measurement_warning?: string | null
}
export interface CourseMeasurementReport {
  version: string; timeline: MeasurementPoint[]
  internal: { baseline: MeasurementPoint | null; latest: MeasurementPoint | null; comparable: boolean; delta: number | null; reason: string | null
    skills: Array<{ skill: string; baseline: number | null; current: number | null; delta: number | null }> }
  toeic: { label: string; rows: Array<{ skill: string; baseline: MeasurementEstimate | null; current: MeasurementEstimate | null
    comparable: boolean; delta: number | null; delta_range: { lower: number; upper: number } | null; reason: string | null; baseline_source: string | null }> }
  declared_baseline: { score: number; scale: string } | null
  recommendations: Array<{ skill: string; score: number; message: string }>
}
