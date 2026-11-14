import type { BackendGrammarPoint } from '../schemas/vocabulary.schema'

const categories: Record<string, [string, string]> = {
  TENSES: ['Các thì', 'Tenses'],
  PARTS_OF_SPEECH: ['Từ loại', 'Parts of speech'],
  PASSIVE: ['Câu bị động', 'Passive voice'],
  PASSIVE_VOICE: ['Câu bị động', 'Passive voice'],
  CONDITIONALS: ['Câu điều kiện', 'Conditionals'],
  COMPARISONS: ['So sánh', 'Comparisons'],
  RELATIVE_CLAUSES: ['Mệnh đề quan hệ', 'Relative clauses'],
  CLAUSES: ['Mệnh đề', 'Clauses'],
  VERB_PATTERNS: ['Cấu trúc động từ', 'Verb patterns'],
  VERB_FORMS: ['Dạng động từ', 'Verb forms'],
  GERUNDS_INFINITIVES: ['Danh động từ & nguyên mẫu', 'Gerunds & infinitives'],
  PARTICIPLES: ['Phân từ', 'Participles'],
  AGREEMENT: ['Hòa hợp chủ ngữ – động từ', 'Subject–verb agreement'],
  CONJUNCTIONS: ['Liên từ', 'Conjunctions'],
  CONNECTORS: ['Từ nối', 'Connectors'],
  PREPOSITIONS: ['Giới từ', 'Prepositions'],
  ARTICLES: ['Mạo từ', 'Articles'],
  QUANTIFIERS: ['Lượng từ', 'Quantifiers'],
  INVERSION: ['Đảo ngữ', 'Inversion'],
  SUBJUNCTIVE: ['Thức giả định', 'Subjunctive'],
  REPORTED_SPEECH: ['Câu tường thuật', 'Reported speech'],
  QUESTIONS: ['Câu hỏi', 'Questions'],
  SENTENCE_STRUCTURE: ['Cấu trúc câu', 'Sentence structure'],
  MODALS: ['Động từ khuyết thiếu', 'Modal verbs'],
  EMPHASIS: ['Nhấn mạnh', 'Emphasis'],
  CAUSE_EFFECT: ['Nguyên nhân – kết quả', 'Cause & effect'],
  CONTRAST_CONCESSION: ['Tương phản & nhượng bộ', 'Contrast & concession'],
}

export function grammarCategoryLabel(category: string, vi: boolean) {
  return categories[category]?.[vi ? 0 : 1] ?? (vi ? 'Ngữ pháp khác' : 'Other grammar')
}

export function normalizeGrammarSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim()
}

export function grammarTitle(point: BackendGrammarPoint, vi: boolean) {
  return vi ? point.title_vi || point.title_en : point.title_en || point.title_vi
}

export function grammarDescription(point: BackendGrammarPoint, vi: boolean) {
  return vi ? point.description_vi || point.description_en : point.description_en || point.description_vi
}

export function grammarFormula(point: BackendGrammarPoint) {
  return point.structure_form || point.formula_details[0]?.pattern || ''
}

// Only local handbook filter parameters can be carried back from a detail page.
export function handbookReturnUrl(params: URLSearchParams) {
  const query = new URLSearchParams({ view: 'handbook' })
  for (const key of ['search', 'category', 'cefr', 'page']) {
    const value = params.get(key)
    if (value) query.set(key, value)
  }
  return `/grammar?${query}`
}
