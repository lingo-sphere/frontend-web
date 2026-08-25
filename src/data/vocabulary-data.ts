// Updated: 2026-08-20
// Mock data cho Vocabulary page - Synced with vocabulary-service.dbml

import type {
  VocabularyPack,
  VocabularyStats,
  VocabularyStatus,
  UserDeck,
  SavedVocabulary,
  LearningStatus,
} from '@/types/vocabulary'
import { learningStatistics } from './vocabulary-learn-data'

// ============================================================
// VOCABULARY STATISTICS (from DB: learning_statistics)
// ============================================================

export const vocabularyStats: VocabularyStats = {
  totalCards: learningStatistics.total_cards,
  due: learningStatistics.due_cards,
  weak: Math.round(learningStatistics.total_cards * 0.15), // Estimate 15% as weak
  totalReviews: learningStatistics.total_reviews_today,
  accuracy: Math.round(learningStatistics.accuracy_today),
}

export const vocabularyStatus: VocabularyStatus = {
  learning: learningStatistics.learning_count,
  reviewing: learningStatistics.reviewing_count,
  mastered: learningStatistics.mastered_count,
  totalCards: learningStatistics.total_cards,
}

// ============================================================
// TAG FILTERS
// ============================================================

export const vocabularyTagFilters = [
  'all', 'a1', 'a2', 'b1', 'b2', 'basic', 'c1', 'common',
  'communication', 'conversation', 'essential', 'ets',
  'idioms', 'ielts', 'oxford', 'sat', 'thpt', 'toefl', 'toeic'
]

// ============================================================
// SAVED VOCABULARY (from DB: user_vocabulary_progress + lexical_items)
// ============================================================

export const savedVocabulary: SavedVocabulary[] = [
  // Từ "about" - CÓ 2 NGHĨA: giới từ + phó từ
  {
    id: 'sv-001',
    lexical_item_id: 'lex_about',
    user_id: 'user-001',
    added_at: '2026-08-15T10:30:00Z',
    deck_id: 'deck-001', // Business English
    learning_status: 'LEARNING',
    review_count: 5,
    accuracy_percent: 80,
    last_reviewed_at: '2026-08-19T14:20:00Z',
    lexical_item: {
      id: 'lex_about',
      word: 'about',
      word_lowercase: 'about',
      word_type: 'PREP',
      pronunciation_us: '/əˈbaʊt/',
      pronunciation_uk: '/əˈbaʊt/',
      syllables: 2,
      cefr_level: 'A1',
      is_common: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    // Tất cả nghĩa của "about"
    meanings: [
      {
        id: 'm1',
        lexical_item_id: 'lex_about',
        meaning_order: 1,
        part_of_speech: 'PREP',
        definition_en: 'on the subject of; concerning',
        definition_vi: 'về, liên quan đến',
        short_meaning_vi: 'về',
        examples: [
          { id: 'ex1', lexical_item_id: 'lex_about', sentence_en: 'The book is about love.' },
          { id: 'ex2', lexical_item_id: 'lex_about', sentence_en: 'What are you thinking about?' },
        ],
        cefr_level: 'A1',
        is_primary: true,
      },
      {
        id: 'm2',
        lexical_item_id: 'lex_about',
        meaning_order: 2,
        part_of_speech: 'ADV',
        definition_en: 'approximately',
        definition_vi: 'khoảng, xấp xỉ',
        short_meaning_vi: 'khoảng',
        examples: [
          { id: 'ex3', lexical_item_id: 'lex_about', sentence_en: 'It takes about 10 minutes.' },
        ],
        cefr_level: 'A2',
      },
    ],
  },
  // Từ trong deck "Business English"
  {
    id: 'sv-002',
    lexical_item_id: 'lex_book',
    user_id: 'user-001',
    added_at: '2026-08-10T08:15:00Z',
    deck_id: 'deck-001', // Business English
    learning_status: 'MASTERED',
    review_count: 12,
    accuracy_percent: 95,
    last_reviewed_at: '2026-08-20T09:00:00Z',
    lexical_item: {
      id: 'lex_book',
      word: 'book',
      word_lowercase: 'book',
      word_type: 'NOUN',
      pronunciation_us: '/bʊk/',
      pronunciation_uk: '/bʊk/',
      syllables: 1,
      cefr_level: 'A1',
      is_common: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    meanings: [
      {
        id: 'm1',
        lexical_item_id: 'lex_book',
        meaning_order: 1,
        part_of_speech: 'NOUN',
        definition_en: 'a written or printed work consisting of pages',
        definition_vi: 'quyển sách',
        short_meaning_vi: 'quyển sách',
        examples: [
          { id: 'ex1', lexical_item_id: 'lex_book', sentence_en: 'I love reading books.' },
        ],
        cefr_level: 'A1',
        is_primary: true,
      },
      {
        id: 'm2',
        lexical_item_id: 'lex_book',
        meaning_order: 2,
        part_of_speech: 'VERB',
        definition_en: 'to reserve in advance',
        definition_vi: 'đặt trước (vé, phòng...)',
        short_meaning_vi: 'đặt trước',
        examples: [
          { id: 'ex2', lexical_item_id: 'lex_book', sentence_en: 'I booked a table at the restaurant.' },
        ],
        cefr_level: 'A2',
      },
    ],
  },
  {
    id: 'sv-003',
    lexical_item_id: 'lex_topic',
    user_id: 'user-001',
    added_at: '2026-08-12T16:45:00Z',
    learning_status: 'LEARNING',
    review_count: 3,
    accuracy_percent: 60,
    last_reviewed_at: '2026-08-18T11:30:00Z',
    lexical_item: {
      id: 'lex_topic',
      word: 'topic',
      word_lowercase: 'topic',
      word_type: 'NOUN',
      pronunciation_us: '/ˈtɑː.pɪk/',
      pronunciation_uk: '/ˈtɒp.ɪk/',
      syllables: 2,
      cefr_level: 'A2',
      is_common: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    meanings: [
      {
        id: 'm1',
        lexical_item_id: 'lex_topic',
        meaning_order: 1,
        part_of_speech: 'NOUN',
        definition_en: 'a subject that you talk, write, or think about',
        definition_vi: 'đề tài, chủ đề',
        short_meaning_vi: 'chủ đề',
        examples: [
          { id: 'ex1', lexical_item_id: 'lex_topic', sentence_en: 'The main topic of discussion is climate change.' },
        ],
        cefr_level: 'A2',
        is_primary: true,
      },
    ],
  },
  {
    id: 'sv-004',
    lexical_item_id: 'lex_business',
    user_id: 'user-001',
    added_at: '2026-08-08T09:00:00Z',
    learning_status: 'NEW',
    review_count: 1,
    accuracy_percent: 0,
    last_reviewed_at: undefined,
    lexical_item: {
      id: 'lex_business',
      word: 'business',
      word_lowercase: 'business',
      word_type: 'NOUN',
      pronunciation_us: '/ˈbɪz.nəs/',
      pronunciation_uk: '/ˈbɪz.nɪs/',
      syllables: 2,
      cefr_level: 'A2',
      is_common: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    meanings: [
      {
        id: 'm1',
        lexical_item_id: 'lex_business',
        meaning_order: 1,
        part_of_speech: 'NOUN',
        definition_en: 'commercial, industrial, or professional activity',
        definition_vi: 'kinh doanh, thương mại',
        short_meaning_vi: 'kinh doanh',
        examples: [
          { id: 'ex1', lexical_item_id: 'lex_business', sentence_en: 'She runs a small business.' },
        ],
        cefr_level: 'A2',
        is_primary: true,
      },
      {
        id: 'm2',
        lexical_item_id: 'lex_business',
        meaning_order: 2,
        part_of_speech: 'NOUN',
        definition_en: 'a matter or situation',
        definition_vi: 'việc, chuyện',
        short_meaning_vi: 'việc làm ăn',
        examples: [
          { id: 'ex2', lexical_item_id: 'lex_business', sentence_en: 'It is none of your business.' },
        ],
        cefr_level: 'A2',
      },
    ],
  },
  {
    id: 'sv-005',
    lexical_item_id: 'lex_apple',
    user_id: 'user-001',
    added_at: '2026-08-05T14:20:00Z',
    learning_status: 'MASTERED',
    review_count: 8,
    accuracy_percent: 100,
    last_reviewed_at: '2026-08-19T16:45:00Z',
    lexical_item: {
      id: 'lex_apple',
      word: 'apple',
      word_lowercase: 'apple',
      word_type: 'NOUN',
      pronunciation_us: '/ˈæp.əl/',
      pronunciation_uk: '/ˈæp.əl/',
      syllables: 2,
      cefr_level: 'A1',
      is_common: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    meanings: [
      {
        id: 'm1',
        lexical_item_id: 'lex_apple',
        meaning_order: 1,
        part_of_speech: 'NOUN',
        definition_en: 'a round fruit with red, green, or yellow skin',
        definition_vi: 'quả táo',
        short_meaning_vi: 'quả táo',
        examples: [
          { id: 'ex1', lexical_item_id: 'lex_apple', sentence_en: 'I eat an apple every day.' },
        ],
        cefr_level: 'A1',
        is_primary: true,
      },
    ],
  },
  // Từ thêm: coffee
  {
    id: 'sv-006',
    lexical_item_id: 'lex_coffee',
    user_id: 'user-001',
    added_at: '2026-08-18T08:00:00Z',
    lexical_item: {
      id: 'lex_coffee',
      word: 'coffee',
      word_lowercase: 'coffee',
      word_type: 'NOUN',
      pronunciation_us: '/ˈkɔː.fi/',
      pronunciation_uk: '/ˈkɒf.i/',
      syllables: 2,
      cefr_level: 'A1',
      is_common: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    meanings: [
      {
        id: 'm1',
        lexical_item_id: 'lex_coffee',
        meaning_order: 1,
        part_of_speech: 'NOUN',
        definition_en: 'a hot drink made from roasted beans',
        definition_vi: 'cà phê',
        short_meaning_vi: 'cà phê',
        examples: [
          { id: 'ex1', lexical_item_id: 'lex_coffee', sentence_en: 'I drink coffee every morning.' },
        ],
        cefr_level: 'A1',
        is_primary: true,
      },
    ],
  },
  // Từ thêm: cat
  {
    id: 'sv-007',
    lexical_item_id: 'lex_cat',
    user_id: 'user-001',
    added_at: '2026-08-17T10:30:00Z',
    lexical_item: {
      id: 'lex_cat',
      word: 'cat',
      word_lowercase: 'cat',
      word_type: 'NOUN',
      pronunciation_us: '/kæt/',
      pronunciation_uk: '/kæt/',
      syllables: 1,
      cefr_level: 'A1',
      is_common: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    meanings: [
      {
        id: 'm1',
        lexical_item_id: 'lex_cat',
        meaning_order: 1,
        part_of_speech: 'NOUN',
        definition_en: 'a small furry mammal often kept as a pet',
        definition_vi: 'con mèo',
        short_meaning_vi: 'con mèo',
        examples: [
          { id: 'ex1', lexical_item_id: 'lex_cat', sentence_en: 'My cat loves fish.' },
        ],
        cefr_level: 'A1',
        is_primary: true,
      },
    ],
  },
  // Từ thêm: work - có 2 nghĩa
  {
    id: 'sv-008',
    lexical_item_id: 'lex_work',
    user_id: 'user-001',
    added_at: '2026-08-16T14:00:00Z',
    deck_id: 'deck-001',
    lexical_item: {
      id: 'lex_work',
      word: 'work',
      word_lowercase: 'work',
      word_type: 'NOUN',
      pronunciation_us: '/wɜːrk/',
      pronunciation_uk: '/wɜːk/',
      syllables: 1,
      cefr_level: 'A1',
      is_common: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    meanings: [
      {
        id: 'm1',
        lexical_item_id: 'lex_work',
        meaning_order: 1,
        part_of_speech: 'NOUN',
        definition_en: 'a job or employment',
        definition_vi: 'công việc, việc làm',
        short_meaning_vi: 'công việc',
        examples: [
          { id: 'ex1', lexical_item_id: 'lex_work', sentence_en: 'I go to work every day.' },
        ],
        cefr_level: 'A1',
        is_primary: true,
      },
      {
        id: 'm2',
        lexical_item_id: 'lex_work',
        meaning_order: 2,
        part_of_speech: 'VERB',
        definition_en: 'to do a job',
        definition_vi: 'làm việc',
        short_meaning_vi: 'làm việc',
        examples: [
          { id: 'ex2', lexical_item_id: 'lex_work', sentence_en: 'I work at home.' },
        ],
        cefr_level: 'A1',
      },
    ],
  },
  // Từ thêm: time
  {
    id: 'sv-009',
    lexical_item_id: 'lex_time',
    user_id: 'user-001',
    added_at: '2026-08-15T16:00:00Z',
    lexical_item: {
      id: 'lex_time',
      word: 'time',
      word_lowercase: 'time',
      word_type: 'NOUN',
      pronunciation_us: '/taɪm/',
      pronunciation_uk: '/taɪm/',
      syllables: 1,
      cefr_level: 'A1',
      is_common: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    meanings: [
      {
        id: 'm1',
        lexical_item_id: 'lex_time',
        meaning_order: 1,
        part_of_speech: 'NOUN',
        definition_en: 'the ongoing sequence of events',
        definition_vi: 'thời gian',
        short_meaning_vi: 'thời gian',
        examples: [
          { id: 'ex1', lexical_item_id: 'lex_time', sentence_en: 'Time flies when you are busy.' },
        ],
        cefr_level: 'A1',
        is_primary: true,
      },
    ],
  },
  // Từ thêm: important
  {
    id: 'sv-010',
    lexical_item_id: 'lex_important',
    user_id: 'user-001',
    added_at: '2026-08-14T09:00:00Z',
    lexical_item: {
      id: 'lex_important',
      word: 'important',
      word_lowercase: 'important',
      word_type: 'ADJ',
      pronunciation_us: '/ɪmˈpɔːrtənt/',
      pronunciation_uk: '/ɪmˈpɔːtənt/',
      syllables: 3,
      cefr_level: 'A2',
      is_common: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    meanings: [
      {
        id: 'm1',
        lexical_item_id: 'lex_important',
        meaning_order: 1,
        part_of_speech: 'ADJ',
        definition_en: 'of great significance or value',
        definition_vi: 'quan trọng',
        short_meaning_vi: 'quan trọng',
        examples: [
          { id: 'ex1', lexical_item_id: 'lex_important', sentence_en: 'Education is very important.' },
        ],
        cefr_level: 'A2',
        is_primary: true,
      },
    ],
  },
  // Từ thêm: different - có 2 nghĩa
  {
    id: 'sv-011',
    lexical_item_id: 'lex_different',
    user_id: 'user-001',
    added_at: '2026-08-13T11:00:00Z',
    lexical_item: {
      id: 'lex_different',
      word: 'different',
      word_lowercase: 'different',
      word_type: 'ADJ',
      pronunciation_us: '/ˈdɪfrənt/',
      pronunciation_uk: '/ˈdɪfərənt/',
      syllables: 3,
      cefr_level: 'A1',
      is_common: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    meanings: [
      {
        id: 'm1',
        lexical_item_id: 'lex_different',
        meaning_order: 1,
        part_of_speech: 'ADJ',
        definition_en: 'not the same as another',
        definition_vi: 'khác, khác nhau',
        short_meaning_vi: 'khác',
        examples: [
          { id: 'ex1', lexical_item_id: 'lex_different', sentence_en: 'This is different from that.' },
        ],
        cefr_level: 'A1',
        is_primary: true,
      },
    ],
  },
  // Từ thêm: water
  {
    id: 'sv-012',
    lexical_item_id: 'lex_water',
    user_id: 'user-001',
    added_at: '2026-08-12T08:30:00Z',
    lexical_item: {
      id: 'lex_water',
      word: 'water',
      word_lowercase: 'water',
      word_type: 'NOUN',
      pronunciation_us: '/ˈwɔːtər/',
      pronunciation_uk: '/ˈwɔːtə/',
      syllables: 2,
      cefr_level: 'A1',
      is_common: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    meanings: [
      {
        id: 'm1',
        lexical_item_id: 'lex_water',
        meaning_order: 1,
        part_of_speech: 'NOUN',
        definition_en: 'a colorless, transparent liquid',
        definition_vi: 'nước',
        short_meaning_vi: 'nước',
        examples: [
          { id: 'ex1', lexical_item_id: 'lex_water', sentence_en: 'I drink a lot of water every day.' },
        ],
        cefr_level: 'A1',
        is_primary: true,
      },
    ],
  },
  // Từ thêm: eat
  {
    id: 'sv-013',
    lexical_item_id: 'lex_eat',
    user_id: 'user-001',
    added_at: '2026-08-11T12:00:00Z',
    lexical_item: {
      id: 'lex_eat',
      word: 'eat',
      word_lowercase: 'eat',
      word_type: 'VERB',
      pronunciation_us: '/iːt/',
      pronunciation_uk: '/iːt/',
      syllables: 1,
      cefr_level: 'A1',
      is_common: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    meanings: [
      {
        id: 'm1',
        lexical_item_id: 'lex_eat',
        meaning_order: 1,
        part_of_speech: 'VERB',
        definition_en: 'to put food into the mouth and chew it',
        definition_vi: 'ăn',
        short_meaning_vi: 'ăn',
        examples: [
          { id: 'ex1', lexical_item_id: 'lex_eat', sentence_en: 'We eat lunch at noon.' },
        ],
        cefr_level: 'A1',
        is_primary: true,
      },
    ],
  },
  // Từ thêm: good - có 3 nghĩa
  {
    id: 'sv-014',
    lexical_item_id: 'lex_good',
    user_id: 'user-001',
    added_at: '2026-08-10T15:00:00Z',
    lexical_item: {
      id: 'lex_good',
      word: 'good',
      word_lowercase: 'good',
      word_type: 'ADJ',
      pronunciation_us: '/ɡʊd/',
      pronunciation_uk: '/ɡʊd/',
      syllables: 1,
      cefr_level: 'A1',
      is_common: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    meanings: [
      {
        id: 'm1',
        lexical_item_id: 'lex_good',
        meaning_order: 1,
        part_of_speech: 'ADJ',
        definition_en: 'to be desired or approved of',
        definition_vi: 'tốt, hay',
        short_meaning_vi: 'tốt',
        examples: [
          { id: 'ex1', lexical_item_id: 'lex_good', sentence_en: 'This is a good book.' },
        ],
        cefr_level: 'A1',
        is_primary: true,
      },
      {
        id: 'm2',
        lexical_item_id: 'lex_good',
        meaning_order: 2,
        part_of_speech: 'ADJ',
        definition_en: 'pleasant or enjoyable',
        definition_vi: 'dễ chịu, vui vẻ',
        short_meaning_vi: 'vui vẻ',
        examples: [
          { id: 'ex2', lexical_item_id: 'lex_good', sentence_en: 'Have a good time!' },
        ],
        cefr_level: 'A1',
      },
    ],
  },
  // Từ thêm: learn
  {
    id: 'sv-015',
    lexical_item_id: 'lex_learn',
    user_id: 'user-001',
    added_at: '2026-08-09T17:00:00Z',
    lexical_item: {
      id: 'lex_learn',
      word: 'learn',
      word_lowercase: 'learn',
      word_type: 'VERB',
      pronunciation_us: '/lɜːrn/',
      pronunciation_uk: '/lɜːn/',
      syllables: 1,
      cefr_level: 'A1',
      is_common: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    meanings: [
      {
        id: 'm1',
        lexical_item_id: 'lex_learn',
        meaning_order: 1,
        part_of_speech: 'VERB',
        definition_en: 'to get knowledge or skill',
        definition_vi: 'học, học hỏi',
        short_meaning_vi: 'học',
        examples: [
          { id: 'ex1', lexical_item_id: 'lex_learn', sentence_en: 'I want to learn English.' },
        ],
        cefr_level: 'A1',
        is_primary: true,
      },
    ],
  },
]

// ============================================================
// USER'S DECKS (from DB: flashcard_decks where creator_type = 'USER')
// ============================================================

export const userDecks: UserDeck[] = [
  {
    id: 'deck-001',
    title: 'Business English',
    cardCount: 45,
    createdAt: '2026-08-10',
    description: 'Vocabulary for business communication',
    cefrLevel: 'B1',
    totalStudied: 120,
    lastStudied: '2026-08-19',
  },
  {
    id: 'deck-002',
    title: 'Daily Conversation',
    cardCount: 32,
    createdAt: '2026-08-12',
    description: 'Common phrases for everyday talk',
    cefrLevel: 'A2',
    totalStudied: 85,
    lastStudied: '2026-08-18',
  },
]

// ============================================================
// COMMON PACKS (from DB: flashcard_decks where creator_type = 'SYSTEM')
// ============================================================

export const commonPacks: VocabularyPack[] = [
  {
    id: 'common-1',
    title: 'Common English Vocabulary',
    coverColor: '#2f7f78',
    wordCount: 500,
    studentCount: 12500,
    tags: ['common', 'essential', 'basic'],
  },
  {
    id: 'common-2',
    title: 'Everyday Communication',
    coverColor: '#4d78b8',
    wordCount: 300,
    studentCount: 8900,
    tags: ['communication', 'conversation', 'essential'],
  },
]

// ============================================================
// OXFORD PACKS (from DB: flashcard_decks by CEFR level)
// ============================================================

export const oxfordPacks: VocabularyPack[] = [
  {
    id: 'oxford-a1',
    title: 'Oxford A1 Vocabulary',
    coverColor: '#5d9b63',
    wordCount: 400,
    studentCount: 15600,
    tags: ['oxford', 'a1', 'basic', 'essential'],
    cefrLevel: 'A1',
  },
  {
    id: 'oxford-a2',
    title: 'Oxford A2 Vocabulary',
    coverColor: '#78b97f',
    wordCount: 450,
    studentCount: 14200,
    tags: ['oxford', 'a2', 'basic'],
    cefrLevel: 'A2',
  },
  {
    id: 'oxford-b1',
    title: 'Oxford B1 Vocabulary',
    coverColor: '#d9a441',
    wordCount: 500,
    studentCount: 11800,
    tags: ['oxford', 'b1'],
    cefrLevel: 'B1',
  },
  {
    id: 'oxford-b2',
    title: 'Oxford B2 Vocabulary',
    coverColor: '#d97745',
    wordCount: 550,
    studentCount: 9500,
    tags: ['oxford', 'b2'],
    cefrLevel: 'B2',
  },
]
