import { z } from 'zod'

const meaningSchema = z.object({
  d: z.string().optional(),
  p: z.string().optional(),
  ex: z.array(z.object({ e: z.string().optional() })).optional(),
})

const vocabularySchema = z.object({
  _id: z.string(),
  w: z.string(),
  p: z.string().optional(),
  l: z.string().optional(),
  us: z.string().optional(),
  uk: z.string().optional(),
  m: z.array(meaningSchema).optional(),
})

// Older services populate lexical_item_id; current services return flat fields.
export const WrongWordSchema = z.object({
  _id: z.string(),
  lexical_item_id: z.union([z.string(), vocabularySchema]).nullable(),
  meaning_index: z.number().int().nonnegative().nullish(),
  custom_snapshot: vocabularySchema.nullish(),
  word: z.string().optional(),
  meaning_vi: z.string().optional(),
  ipa: z.string().optional(),
  audio_url: z.string().optional(),
  part_of_speech: z.string().optional(),
  cefr_level: z.string().optional(),
  cefr: z.string().optional(),
  example_en: z.string().optional(),
  status: z.enum(['ACTIVE', 'RECOVERED']),
  wrong_count: z.number(),
  consecutive_correct: z.number(),
  last_mistake_type: z.string().nullish(),
  last_reviewed_at: z.string().nullish(),
}).transform(item => {
  const vocab = typeof item.lexical_item_id === 'object'
    ? item.lexical_item_id ?? item.custom_snapshot
    : item.custom_snapshot
  const meaning = vocab?.m?.[item.meaning_index ?? 0]
  return {
    ...item,
    lexical_item_id: vocab?._id ?? item.lexical_item_id as string | null,
    word: item.word || vocab?.w || '',
    meaning_vi: item.meaning_vi ?? meaning?.d ?? '',
    ipa: item.ipa ?? vocab?.p ?? '',
    audio_url: item.audio_url ?? vocab?.us ?? vocab?.uk ?? '',
    part_of_speech: item.part_of_speech ?? meaning?.p ?? '',
    cefr_level: item.cefr_level ?? item.cefr ?? vocab?.l ?? '',
    example_en: item.example_en ?? meaning?.ex?.[0]?.e ?? '',
  }
}).refine(item => Boolean(item.word.trim()), 'Wrong-word vocabulary content is missing')

export type WrongWord = z.infer<typeof WrongWordSchema>
