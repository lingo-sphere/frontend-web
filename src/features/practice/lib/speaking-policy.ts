import type { DifficultyLevel, SpeakingExercise } from '@/features/practice/types/speaking'
export function resolveSpeakingPolicy(exercise: SpeakingExercise, difficulty: DifficultyLevel) {
  const tier = exercise.tiered_time_limits?.[difficulty.toLowerCase() as 'easy' | 'medium' | 'hard']
  return {
    preparation_time_seconds: tier?.preparation_time_seconds ?? exercise.preparation_time_seconds ?? 30,
    response_time_seconds: tier?.response_time_seconds ?? exercise.response_time_seconds ?? 45,
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
