import type { CourseTestQuestion, WrongQuestionItem } from '../types/test.runner.types'

const domains = new Set(['LISTENING', 'READING', 'GRAMMAR', 'VOCABULARY', 'SPEAKING', 'WRITING'])
const normalized = (value?: string) => {
  const domain = value?.trim().toUpperCase()
  return domain && domains.has(domain) ? domain : undefined
}

export function courseMistakeDomain(question?: CourseTestQuestion, graded?: WrongQuestionItem): string {
  const explicit = normalized(graded?.skill_type) || normalized(graded?.domain) || normalized(question?.skill_type) || normalized(question?.domain)
  if (explicit) return explicit
  const text = question?.question_text || graded?.question_text || ''
  const part = question?.part_number || Number(text.match(/^\s*\[\s*Part\s*([1-7])\b/i)?.[1])
  if (part >= 1 && part <= 4) return 'LISTENING'
  if (part >= 5 && part <= 7) return 'READING'
  if (/^\s*\[[^\]]*(\bLISTENING\b|ĐỀ (?:THI|KIỂM TRA) NGHE)[^\]]*\]/i.test(text)) return 'LISTENING'
  if (/^\s*\[[^\]]*(\bREADING\b|ĐỀ (?:THI|KIỂM TRA) ĐỌC)[^\]]*\]/i.test(text)) return 'READING'
  if (question?.grammar_knowledge_id) return 'GRAMMAR'
  if (/\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i.test(question?.media_url || '')) return 'LISTENING'
  return 'GENERAL'
}

export function courseSkillPracticeUrl(item: WrongQuestionItem): string {
  const domain = courseMistakeDomain(undefined, item)
  const routes: Record<string, string> = { LISTENING: '/listening', READING: '/reading', SPEAKING: '/speaking', WRITING: '/writing', GRAMMAR: '/grammar', VOCABULARY: '/vocabulary' }
  const route = routes[domain] || '/practice/mistakes'
  const params = new URLSearchParams()
  if (item.context_id) params.set('context_id', item.context_id)
  if (item.exercise_type) params.set('exercise_type', item.exercise_type)
  return params.size ? `${route}?${params}` : route
}
