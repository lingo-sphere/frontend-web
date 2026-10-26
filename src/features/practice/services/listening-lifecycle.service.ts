import { api } from '@/services/api.client'
import type {
  ListeningDraft,
  ListeningGroup,
  ListeningKind,
  ListeningPracticeSession,
  ListeningResult,
  PendingListeningSession,
} from '../types/listening-lifecycle'

interface RawQuestion {
  question_index: number
  question_text?: string
  question_text_vi?: string
  options: { key: string; text: string }[]
}
interface RawGroup {
  question_id?: string
  conversation_id?: string
  talk_id?: string
  title?: string
  audio_url?: string
  audio_media_id?: string
  media_id?: string
  image_url?: string
  image_media_id?: string
  questions?: RawQuestion[]
  options?: RawQuestion['options']
  segment_index?: number
  start_time?: number
  end_time?: number
  preview_text?: string
  blanks?: {
    blank_index: number
    is_hidden: boolean
    first_letter?: string
    length?: number
    hints_available?: number
    last_hint?: string
  }[]
}
interface RawSession {
  session_id: string
  title?: string
  status: string
  total_time_seconds: number
  audio_url?: string
  audio_media_id?: string
  questions?: RawGroup[]
  conversations?: RawGroup[]
  talks?: RawGroup[]
  segments?: RawGroup[]
}
const base = (kind: ListeningKind) =>
  kind === 'dictation'
    ? '/practice/dictation/sessions'
    : `/practice/listening/${kind}/sessions`

export function listeningSessionView(
  raw: RawSession,
  kind: ListeningKind,
): ListeningPracticeSession {
  const rows =
    raw.questions || raw.conversations || raw.talks || raw.segments || []
  const groups: ListeningGroup[] = rows.map((row, index) => {
    const clipAudio = row.audio_url || row.audio_media_id || row.media_id
    return {
      id:
        row.question_id ||
        row.conversation_id ||
        row.talk_id ||
        String(row.segment_index),
      index,
      title:
        row.title ||
        (kind === 'dictation'
          ? `Dictation · ${(row.segment_index ?? index) + 1}`
          : `${kind.replace('part', 'Part ')} · ${index + 1}`),
      audio:
        clipAudio ||
        (kind === 'dictation' ? raw.audio_url || raw.audio_media_id || '' : ''),
      image: row.image_url || row.image_media_id,
      start: kind === 'dictation' && !clipAudio ? row.start_time || 0 : 0,
      end: kind === 'dictation' && !clipAudio ? row.end_time : undefined,
      clipped: Boolean(kind === 'dictation' && clipAudio),
      preview: row.preview_text,
      questions:
        kind === 'dictation'
          ? []
          : (
              row.questions || [
                { question_index: 0, options: row.options || [] },
              ]
            ).map((question) => ({
              key:
                kind === 'part1' || kind === 'part2'
                  ? String(index)
                  : `${index}_${question.question_index}`,
              text: question.question_text || '',
              textVi: question.question_text_vi,
              options: question.options,
            })),
      blanks: (row.blanks || [])
        .filter((blank) => blank.is_hidden)
        .map((blank) => ({
          key: `${row.segment_index}_${blank.blank_index}`,
          label: String(blank.blank_index + 1),
          firstLetter: blank.first_letter,
          length: blank.length,
          hintsAvailable: blank.hints_available || 0,
          hint: blank.last_hint,
        })),
    }
  })
  if (
    !groups.length ||
    !Number.isFinite(raw.total_time_seconds) ||
    raw.total_time_seconds <= 0
  )
    throw new Error('Phiên luyện thiếu nội dung hoặc thời gian hợp lệ')
  return {
    id: raw.session_id,
    kind,
    title: raw.title || kind.replace('part', 'Part '),
    totalSeconds: raw.total_time_seconds,
    status: raw.status,
    groups,
  }
}
export const listeningLifecycleService = {
  hint(id: string, key: string) {
    const [segment_index, blank_index] = key.split('_').map(Number)
    return api.post<{ hint: string; hints_remaining: number }>(
      `/practice/dictation/sessions/${encodeURIComponent(
        id.replace(/^dict_/, ''),
      )}/hint`,
      { segment_index, blank_index },
    )
  },
  async create(
    kind: ListeningKind,
    exerciseId: string | undefined,
    filters: {
      context_id?: string
      cefr_level?: string
      difficulty?: string
      subtype?: string
    },
    preset: string,
    difficulty: string,
  ) {
    const { subtype, ...common } = filters
    const field = {
      part1: 'picture_type',
      part2: 'question_types',
      part3: 'conversation_types',
      part4: 'talk_types',
      dictation: '',
    }[kind]
    const payload =
      kind === 'dictation'
        ? {
            exercise_id: exerciseId,
            difficulty,
            enable_hints: true,
            playback_speed: 1,
          }
        : {
            ...common,
            ...(subtype
              ? { [field]: kind === 'part1' ? subtype : [subtype] }
              : {}),
            ...(exerciseId ? { exercise_ids: [exerciseId] } : {}),
            limit: exerciseId
              ? 1
              : kind === 'part1'
              ? 6
              : kind === 'part2'
              ? 6
              : 2,
            random: !exerciseId,
            time_preset: preset,
          }
    return listeningSessionView(
      await api.post<RawSession>(base(kind), payload),
      kind,
    )
  },
  async get(kind: ListeningKind, id: string) {
    return listeningSessionView(
      await api.get<RawSession>(`${base(kind)}/${encodeURIComponent(id)}`),
      kind,
    )
  },
  progress: (kind: ListeningKind, id: string) =>
    api.get<ListeningDraft>(
      `/practice/listening/progress/${kind}/${encodeURIComponent(id)}`,
    ),
  save: (kind: ListeningKind, id: string, draft: ListeningDraft) =>
    api.put<ListeningDraft>(
      `/practice/listening/progress/${kind}/${encodeURIComponent(id)}`,
      {
        expected_revision: draft.revision,
        answers: draft.answers,
        current_index: draft.current_index,
        elapsed_seconds: draft.elapsed_seconds,
        audio_position: draft.audio_position,
        playback_speed: draft.playback_speed,
      },
    ),
  async pending() {
    const rows = await api.get<PendingListeningSession[]>(
      '/practice/listening/progress',
    )
    if (!Array.isArray(rows))
      throw new Error('Danh sách phiên không đúng định dạng')
    return rows
  },
  async submit(
    kind: ListeningKind,
    id: string,
    answers: Record<string, string>,
    elapsed: number,
    revision: number,
  ) {
    const payload =
      kind === 'dictation'
        ? {
            final_answers: Object.entries(answers).map(([key, answer]) => {
              const [segment_index, blank_index] = key.split('_').map(Number)
              return { segment_index, blank_index, answer }
            }),
            total_time_seconds: elapsed,
            expected_draft_revision: revision,
          }
        : { session_id: id, answers, total_time_seconds: elapsed, expected_draft_revision: revision }
    return api.post<ListeningResult>(
      kind === 'dictation'
        ? `${base(kind)}/${encodeURIComponent(id.replace(/^dict_/, ''))}/submit`
        : `${base(kind)}/submit`,
      payload,
    )
  },
}
