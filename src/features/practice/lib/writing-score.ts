import type { WritingSubmission } from '../types/writing'
export function writingScoreLabel(submission: Pick<WritingSubmission, 'raw_score' | 'max_score' | 'overall_score'>) {
  if (typeof submission.raw_score === 'number' && typeof submission.max_score === 'number') return `${submission.raw_score}/${submission.max_score}`
  return typeof submission.overall_score === 'number' ? `${Math.round(submission.overall_score)}/100` : '—'
}
