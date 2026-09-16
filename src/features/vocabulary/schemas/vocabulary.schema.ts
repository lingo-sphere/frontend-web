/**
 * @file vocabulary.schema.ts
 * @description Zod Schemas định nghĩa cấu trúc dữ liệu cho dịch vụ vocabulary
 */

import { z } from 'zod'

export const LexicalItemSchema = z.object({
  id: z.string().default(''),
  _id: z.string().optional(),
  word: z.string(),
  ipa: z.string().default(''),
  meaning_vi: z.string(),
  meaning_en: z.string().optional(),
  part_of_speech: z.string().default('noun'),
  cefr_level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('A1'),
  example_sentence: z.string().default(''),
  example_translation_vi: z.string().default(''),
  audio_url: z.string().optional(),
  image_url: z.string().optional(),
  topic_tags: z.array(z.string()).optional(),
})

export const LexicalItemListSchema = z.array(LexicalItemSchema)

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
  total_users: z.number().optional(),
  visibility: z.string().optional(),
  is_public: z.boolean().optional(),
  creator_id: z.string().optional(),
  cards: z.array(LexicalItemSchema).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
})

// DeckListSchema handle cả array và object {data: [...]}
export const DeckListSchema: z.ZodType<Deck[] | { data?: Deck[]; results?: Deck[]; decks?: Deck[] }> = z.union([
  z.array(DeckSchema),
  z.object({
    data: z.array(DeckSchema).optional(),
    results: z.array(DeckSchema).optional(),
    decks: z.array(DeckSchema).optional(),
    total: z.number().optional(),
    page: z.number().optional(),
  }).passthrough(),
])

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
  // Backend trả về 'id', không phải '_id'
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

// ==================== LOOKUP SCHEMAS ====================

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

// ==================== SEARCH HISTORY SCHEMAS ====================

export const SearchHistoryItemSchema = z.object({
  _id: z.string(),
  vocabularyId: z.string().optional(),
  word: z.string().optional(),
  ipa: z.string().optional(),
  cefr: z.string().optional(),
  searchQuery: z.string().optional(),
  searchType: z.string().optional(),
  searchedAt: z.date().or(z.string()),
})

export const SearchHistoryResponseSchema = z.object({
  results: z.array(SearchHistoryItemSchema),
  total: z.number(),
})

export type SearchHistoryItem = z.infer<typeof SearchHistoryItemSchema>
export type SearchHistoryResponse = z.infer<typeof SearchHistoryResponseSchema>
