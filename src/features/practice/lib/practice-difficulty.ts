export const PRACTICE_DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'] as const
export type PracticeDifficulty = typeof PRACTICE_DIFFICULTIES[number]

export function resolvePracticeDifficulty(difficulty?: string | null, legacyWritingLevel?: string | null, cefr?: string | null): PracticeDifficulty {
  if (PRACTICE_DIFFICULTIES.some(level => level === difficulty)) return difficulty as PracticeDifficulty
  if (legacyWritingLevel === 'BASIC') return 'EASY'
  if (legacyWritingLevel === 'INTERMEDIATE') return 'MEDIUM'
  if (legacyWritingLevel === 'ADVANCED') return 'HARD'
  if (cefr === 'A1' || cefr === 'A2') return 'EASY'
  if (cefr === 'B2' || cefr === 'C1' || cefr === 'C2') return 'HARD'
  return 'MEDIUM'
}

export function practiceDifficultyLabel(level: PracticeDifficulty, vi: boolean): string {
  return (vi ? { EASY: 'Dễ', MEDIUM: 'Trung bình', HARD: 'Khó' } : { EASY: 'Easy', MEDIUM: 'Medium', HARD: 'Hard' })[level]
}

export const PRACTICE_DIFFICULTY_COLORS: Record<PracticeDifficulty, string> = {
  EASY: 'bg-emerald-100 text-emerald-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HARD: 'bg-red-100 text-red-700',
}
