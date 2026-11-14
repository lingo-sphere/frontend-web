'use client'

import { Button } from '@/components/button'
import { courseMistakeDomain } from '../lib/mistake-domain'
import type { WrongQuestionItem } from '../types/test.runner.types'

const names: Record<string, string> = { LISTENING: 'Nghe (Listening)', READING: 'Đọc (Reading)', SPEAKING: 'Nói (Speaking)', WRITING: 'Viết (Writing)', GRAMMAR: 'Ngữ pháp', VOCABULARY: 'Từ vựng' }

export function TestRunnerSkillReview({ mistakes, scores = {}, targetScore = 70, onPractice }: { mistakes: WrongQuestionItem[]; scores?: Record<string, number>; targetScore?: number; onPractice?: (item: WrongQuestionItem) => void }) {
  const groups = new Map<string, { count: number; score?: number; example: WrongQuestionItem }>()
  for (const mistake of mistakes) {
    const skill = courseMistakeDomain(undefined, mistake)
    if (!names[skill]) continue
    const group = groups.get(skill)
    if (group) group.count++
    else groups.set(skill, { count: 1, example: { ...mistake, domain: skill } })
  }
  for (const [skill, score] of Object.entries(scores)) {
    if (!names[skill] || !Number.isFinite(score) || score < 0 || score > 100) continue
    const group = groups.get(skill)
    if (group) group.score = score
    else if (score < targetScore) groups.set(skill, { count: 0, score, example: { question_number: 0, question_text: '', user_selected_answer: '', correct_answer: '', domain: skill, skill_type: skill } })
  }
  if (!groups.size || !onPractice) return null
  return (
    <section aria-labelledby="course-skill-review-heading" className="rounded-2xl border border-border bg-surface p-4">
      <h3 id="course-skill-review-heading" className="text-sm font-semibold text-text-primary">Ưu tiên ôn tập theo kỹ năng</h3>
      <p className="mt-1 text-xs leading-5 text-text-secondary">Gợi ý dựa trên điểm từng kỹ năng và các câu chưa đúng trong bài này. Bạn có thể xem lại từng câu tại Sổ tay lỗi sai.</p>
      <ul className="mt-4 space-y-3">
        {[...groups].sort((a, b) => (a[1].score ?? 101) - (b[1].score ?? 101) || b[1].count - a[1].count).map(([skill, group]) => (
          <li key={skill} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-surface-subtle p-3">
            <div><p className="text-sm font-medium text-text-primary">{names[skill]}</p><p className="mt-1 text-xs text-text-secondary">{group.score !== undefined && `${group.score}/100 điểm`}{group.score !== undefined && group.count > 0 && ' · '}{group.count > 0 && `${group.count} câu chưa đúng`}</p></div>
            <Button variant="outline" className="min-h-10 whitespace-normal" onClick={() => onPractice(group.example)}>Ôn {names[skill]}</Button>
          </li>
        ))}
      </ul>
    </section>
  )
}
