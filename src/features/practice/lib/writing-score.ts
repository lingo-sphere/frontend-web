export function writingScoreLabel(submission: { raw_score?: number | null; max_score?: number | null; overall_score?: number | null }) {
  if (typeof submission.raw_score === 'number' && typeof submission.max_score === 'number') return `${submission.raw_score}/${submission.max_score}`
  return typeof submission.overall_score === 'number' ? `${Math.round(submission.overall_score)}/100` : '—'
}
