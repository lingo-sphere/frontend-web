import type { ListeningTabType } from '../types/listening-practice'

export const LISTENING_SUBTYPES: Record<
  ListeningTabType,
  { value: string; vi: string; en: string }[]
> = {
  PART_1: [
    { value: 'SINGLE_PERSON', vi: 'Một người', en: 'Single person' },
    { value: 'MULTIPLE_PEOPLE', vi: 'Nhiều người', en: 'Multiple people' },
    { value: 'OBJECT', vi: 'Đồ vật', en: 'Objects' },
    { value: 'SCENE', vi: 'Khung cảnh', en: 'Scenes' },
  ],
  PART_2: [
    { value: 'WH', vi: 'Câu hỏi Wh-', en: 'Wh- questions' },
    { value: 'YES_NO', vi: 'Câu hỏi Yes/No', en: 'Yes/No questions' },
    { value: 'CHOICE', vi: 'Câu hỏi lựa chọn', en: 'Choice questions' },
    { value: 'TAG', vi: 'Câu hỏi đuôi', en: 'Tag questions' },
    { value: 'REQUEST', vi: 'Yêu cầu / lời mời', en: 'Requests / invitations' },
    { value: 'SUGGEST', vi: 'Đề nghị', en: 'Suggestions' },
  ],
  PART_3: [
    { value: 'BUSINESS', vi: 'Công việc & Kinh doanh', en: 'Business' },
    { value: 'SOCIAL', vi: 'Giao tiếp xã hội', en: 'Social' },
    { value: 'SERVICE', vi: 'Dịch vụ & Mua sắm', en: 'Service' },
    { value: 'TECHNICAL', vi: 'Kỹ thuật', en: 'Technical' },
    { value: 'GENERAL', vi: 'Tổng hợp', en: 'General' },
  ],
  PART_4: [
    { value: 'ANNOUNCEMENT', vi: 'Thông báo', en: 'Announcements' },
    { value: 'NEWS_REPORT', vi: 'Bản tin', en: 'News reports' },
    { value: 'TALK_SPEECH', vi: 'Bài phát biểu', en: 'Speeches' },
    { value: 'ADVERTISEMENT', vi: 'Quảng cáo', en: 'Advertisements' },
    { value: 'INSTRUCTION', vi: 'Hướng dẫn', en: 'Instructions' },
  ],
  DICTATION: [],
}

const exerciseTabs: Record<string, ListeningTabType> = {
  PICTURE_DESCRIPTION: 'PART_1',
  QUESTION_RESPONSE: 'PART_2',
  CONVERSATION: 'PART_3',
  SHORT_CONVERSATION: 'PART_3',
  SHORT_TALK: 'PART_4',
  DICTATION: 'DICTATION',
}

export interface ListeningCatalogState {
  tab: ListeningTabType
  context: string
  difficulty: string
  cefr: string
  subtype: string
  page: number
}

export function readListeningCatalog(
  params: URLSearchParams,
): ListeningCatalogState {
  const requested = (
    params.get('tab') ||
    params.get('part') ||
    ''
  ).toUpperCase()
  const part = /^[1-4]$/.test(requested) ? `PART_${requested}` : requested
  const tab: ListeningTabType = Object.hasOwn(LISTENING_SUBTYPES, part)
    ? (part as ListeningTabType)
    : exerciseTabs[(params.get('exercise_type') || '').toUpperCase()] ||
      'PART_1'
  const page = Number(params.get('page') || '1')
  const difficulty = params.get('difficulty') || 'ALL'
  const cefr = params.get('cefr_level') || 'ALL'
  const subtype = params.get('subtype') || 'ALL'
  return {
    tab,
    context: params.get('context_id') || '',
    difficulty: ['EASY', 'MEDIUM', 'HARD'].includes(difficulty)
      ? difficulty
      : 'ALL',
    cefr: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(cefr) ? cefr : 'ALL',
    subtype: LISTENING_SUBTYPES[tab].some((item) => item.value === subtype)
      ? subtype
      : 'ALL',
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
  }
}

// URL is the source of truth: reload and browser Back restore the same catalog.
export function listeningCatalogParams(
  current: URLSearchParams,
  patch: Partial<ListeningCatalogState>,
) {
  const next = { ...readListeningCatalog(current), ...patch }
  const params = new URLSearchParams(current)
  for (const key of [
    'tab',
    'part',
    'exercise_type',
    'topic_name',
    'context_id',
    'difficulty',
    'cefr_level',
    'subtype',
    'page',
  ])
    params.delete(key)
  params.set('tab', next.tab)
  if (next.context) params.set('context_id', next.context)
  if (next.difficulty !== 'ALL') params.set('difficulty', next.difficulty)
  if (next.cefr !== 'ALL') params.set('cefr_level', next.cefr)
  if (
    next.subtype !== 'ALL' &&
    LISTENING_SUBTYPES[next.tab].some((item) => item.value === next.subtype)
  )
    params.set('subtype', next.subtype)
  if (next.page > 1) params.set('page', String(next.page))
  return params
}
