import { PRACTICE_DIFFICULTIES, practiceDifficultyLabel, type PracticeDifficulty } from '../lib/practice-difficulty'

interface Props {
  value: PracticeDifficulty | 'all'
  onChange: (value: PracticeDifficulty | 'all') => void
  counts: Record<PracticeDifficulty, number>
  isVietnamese: boolean
}

export function PracticeDifficultyFilter({ value, onChange, counts, isVietnamese: vi }: Props) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-text-tertiary">{vi ? 'Độ khó:' : 'Difficulty:'}</span>
      <div role="group" aria-label={vi ? 'Lọc theo độ khó' : 'Filter by difficulty'} className="flex flex-wrap gap-1 rounded-lg border border-border bg-surface p-1">
        {(['all', ...PRACTICE_DIFFICULTIES] as const).map(level => (
          <button key={level} type="button" aria-pressed={value === level} onClick={() => onChange(level)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${value === level ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface-hover'}`}>
            {level === 'all' ? (vi ? 'Tất cả' : 'All') : `${practiceDifficultyLabel(level, vi)} (${counts[level]})`}
          </button>
        ))}
      </div>
    </div>
  )
}
