// Zod Schemas định nghĩa cấu trúc dữ liệu cho dịch vụ từ vựng.
import { z } from 'zod'

export const BackendExampleSchema = z.object({
  e: z.string().optional(),
  v: z.string().optional(),
})

export const BackendMeaningSchema = z.object({
  pri: z.boolean().optional(),
  p: z.string().optional(),
  d: z.string().optional(),
  sm: z.string().optional(),
  ex: z.array(BackendExampleSchema).optional(),
})

export const LexicalItemSchema = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  word: z.string().optional(),
  word_lowercase: z.string().optional(),
  pronunciation: z.string().nullable().optional(),
  cefr_level: z.string().optional(),
  lexical_type: z.string().optional(),
  primary_meaning: BackendMeaningSchema.nullable().optional(),
})

export const LexicalItemListSchema = z.union([
  z.array(LexicalItemSchema),
  z.object({ items: z.array(LexicalItemSchema) }),
  z.object({ data: z.array(LexicalItemSchema) }),
  z.object({ results: z.array(LexicalItemSchema) }),
])

export const DeckSchema = z.object({
  _id: z.string(),
  id: z.string().optional(),
  name: z.string().default(''),
  name_vi: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  description_vi: z.string().optional(),
  thumbnail_url: z.string().optional(),
  cefr_level: z.string().optional(),
  card_count: z.number().default(0),
  total_cards: z.number().optional(),
  visibility: z.string().optional(),
  is_public: z.boolean().optional(),
  creator_id: z.string().optional(),
  cards: z.array(LexicalItemSchema).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  total_users: z.number().optional(),
})

export const DeckListSchema = z.array(DeckSchema)

export const BackendTopicSchema = z.object({
  _id: z.string(),
  name_en: z.string(),
  name_vi: z.string(),
  slug: z.string(),
  description_en: z.string().optional(),
  description_vi: z.string().optional(),
  icon_url: z.string().optional(),
  lexical_count: z.number().default(0),
  cefr_level: z.string().default('A1'),
  is_featured: z.boolean().default(false),
  display_order: z.number().default(0),
}).passthrough()

export const BackendTopicListSchema = z.array(BackendTopicSchema)

export const BackendIpaSymbolSchema = z.object({
  id: z.string(),
  _id: z.string().optional(),
  symbol: z.string(),
  symbol_type: z.enum(['VOWEL', 'CONSONANT', 'DIPHTHONG']).or(z.string()),
  description_en: z.string().optional(),
  description_vi: z.string().optional(),
  example_word: z.string().default(''),
  example_word_ipa: z.string().default(''),
  audio_url: z.string().optional(),
  example_audio_url: z.string().optional(),
  related_symbols: z.array(z.string()).optional(),
  cefr_min_level: z.string().optional(),
})

export const BackendIpaSymbolListSchema = z.array(BackendIpaSymbolSchema)

export const BackendGrammarExampleSchema = z.object({
  sentence_en: z.string(),
  sentence_vi: z.string(),
}).passthrough()

export const BackendGrammarPointSchema = z.object({
  _id: z.string(),
  title_en: z.string(),
  title_vi: z.string(),
  slug: z.string(),
  category: z.string(),
  cefr_level: z.string(),
  description_en: z.string().optional(),
  description_vi: z.string().optional(),
  rule_en: z.string().optional(),
  rule_vi: z.string().optional(),
  structure_form: z.string().optional(),
  usage_notes: z.string().optional(),
  common_mistakes: z.string().optional(),
  examples: z.array(BackendGrammarExampleSchema).default([]),
  toeic_relevance: z.number().default(0),
  practice_count: z.number().default(0),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(true),
}).passthrough()

export const BackendGrammarPointListSchema = z.array(BackendGrammarPointSchema)

export type LexicalItem = z.infer<typeof LexicalItemSchema>
export type Deck = z.infer<typeof DeckSchema>
export type BackendTopic = z.infer<typeof BackendTopicSchema>
export type BackendIpaSymbol = z.infer<typeof BackendIpaSymbolSchema>
export type BackendGrammarPoint = z.infer<typeof BackendGrammarPointSchema>

export const LookupResultItemSchema = z.object({
  id: z.string(),
  word: z.string(),
  ipa: z.string().optional(),
  pos: z.array(z.string()),
  cefr: z.string().optional(),
  meaning: z.string().optional(),
  matchType: z.enum(['exact', 'prefix', 'fuzzy']),
})

export const LookupResponseSchema = z.object({
  query: z.string(),
  results: z.array(LookupResultItemSchema),
  total: z.number(),
})

export type LookupResultItem = z.infer<typeof LookupResultItemSchema>
export type LookupResponse = z.infer<typeof LookupResponseSchema>

export const SearchHistoryItemSchema = z.object({
  _id: z.string(),
  vocabularyId: z.string().optional(),
  clicked_item_id: z.string().optional(),
  word: z.string().optional(),
  searchQuery: z.string().optional(),
  ipa: z.string().optional(),
  cefr: z.string().optional(),
  searchType: z.string().optional(),
  searchedAt: z.date().or(z.string()),
})

export const SearchHistoryResponseSchema = z.object({
  results: z.array(SearchHistoryItemSchema),
  total: z.number(),
})

export type SearchHistoryItem = z.infer<typeof SearchHistoryItemSchema>
export type SearchHistoryResponse = z.infer<typeof SearchHistoryResponseSchema>