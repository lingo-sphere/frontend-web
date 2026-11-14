import type { DifficultyLevel, SpeakingExercise } from '@/features/practice/types/speaking'

const STORAGE_KEY = 'lingosphere_speaking_time_mode'

export function getSavedSpeakingTimeModePreference(): DifficultyLevel {
  if (typeof window === 'undefined') return 'MEDIUM'
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'EASY' || saved === 'MEDIUM' || saved === 'HARD') {
      return saved
    }
    return 'MEDIUM'
  } catch {
    return 'MEDIUM'
  }
}

export function saveSpeakingTimeModePreference(mode: DifficultyLevel): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    console.warn('[SpeakingTimeMode] Failed to save preference')
  }
}

export function resolveSpeakingPolicy(exercise: SpeakingExercise, difficulty: DifficultyLevel) {
  const diffKey = difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'
  const tier = exercise.tiered_time_limits?.[diffKey]

  const basePrep = exercise.preparation_time_seconds ?? 30
  const baseResponse = exercise.response_time_seconds ?? 45

  // Match the server: a missing tier uses the exercise's general limits.
  return {
    preparation_time_seconds: tier?.preparation_time_seconds ?? basePrep,
    response_time_seconds: tier?.response_time_seconds ?? baseResponse,
    show_hints: tier?.show_hints ?? true,
    max_record_attempts: tier?.max_record_attempts ?? 3,
  }
}

export function longestSpeakingStreak(attempts: { completed_at?: string; created_at: string }[]) {
  const days = [...new Set(attempts.map(row => {
    const date = new Date(row.completed_at || row.created_at)
    return Number.isFinite(date.getTime()) ? Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) : NaN
  }).filter(Number.isFinite))].sort((a, b) => a - b)
  let best = 0, current = 0, previous = -Infinity
  for (const day of days) { current = day - previous === 86400000 ? current + 1 : 1; best = Math.max(best, current); previous = day }
  return best
}
