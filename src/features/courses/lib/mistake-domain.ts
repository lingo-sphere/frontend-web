import type { CourseTestQuestion, WrongQuestionItem } from '../types/test.runner.types'

const domains = new Set(['LISTENING', 'READING', 'GRAMMAR', 'VOCABULARY', 'SPEAKING', 'WRITING'])
const normalized = (value?: string) => {
  const domain = value?.trim().toUpperCase()
  return domain && domains.has(domain) ? domain : undefined
}

export function courseMistakeDomain(question?: CourseTestQuestion, graded?: WrongQuestionItem): string {
  const explicit = normalized(graded?.domain) || normalized(question?.domain) || normalized(question?.skill_type)
  if (explicit) return explicit
  const text = question?.question_text || graded?.question_text || ''
  const part = question?.part_number || Number(text.match(/^\s*\[\s*Part\s*([1-7])\b/i)?.[1])
  if (part >= 1 && part <= 4) return 'LISTENING'
  if (part >= 5 && part <= 7) return 'READING'
  if (/^\s*\[[^\]]*(LISTENING EXAM|ĐỀ THI NGHE)[^\]]*\]/i.test(text)) return 'LISTENING'
  if (/^\s*\[[^\]]*(READING EXAM|ĐỀ THI ĐỌC)[^\]]*\]/i.test(text)) return 'READING'
  if (question?.grammar_knowledge_id) return 'GRAMMAR'
  if (/\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i.test(question?.media_url || '')) return 'LISTENING'
  return 'GENERAL'
}
