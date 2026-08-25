// Updated: 2026-08-17
// Mock data cho Vocabulary Learning - Synced with vocabulary-service.dbml
// 10 từ vựng mẫu cho demo

import type {
  VocabularyItem,
  VocabularyDeck,
  LexicalItem,
  Meaning,
  FlashcardDeck,
  LearningStatistics,
} from '@/types/vocabulary-learn'

// ============================================================
// LEXICAL ITEMS (Core Vocabulary)
// ============================================================

export const lexicalItems: LexicalItem[] = [
  {
    id: 'lex-001',
    word: 'adventure',
    word_lowercase: 'adventure',
    slug: 'adventure',
    word_type: 'noun',
    cefr_level: 'A2',
    pronunciation_us: '/ədˈven.tʃər/',
    pronunciation_uk: '/ədˈven.tʃər/',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'lex-002',
    word: 'suggestion',
    word_lowercase: 'suggestion',
    slug: 'suggestion',
    word_type: 'noun',
    cefr_level: 'B1',
    pronunciation_us: '/səɡˈdʒes.tʃən/',
    pronunciation_uk: '/səˈdʒes.tʃən/',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'lex-003',
    word: 'sharing',
    word_lowercase: 'sharing',
    slug: 'sharing',
    word_type: 'noun',
    cefr_level: 'A1',
    pronunciation_us: '/ˈʃeə.rɪŋ/',
    pronunciation_uk: '/ˈʃeə.rɪŋ/',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'lex-004',
    word: 'shooting',
    word_lowercase: 'shooting',
    slug: 'shooting',
    word_type: 'noun',
    cefr_level: 'B1',
    pronunciation_us: '/ˈʃuː.tɪŋ/',
    pronunciation_uk: '/ˈʃuː.tɪŋ/',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'lex-005',
    word: 'musician',
    word_lowercase: 'musician',
    slug: 'musician',
    word_type: 'noun',
    cefr_level: 'A2',
    pronunciation_us: '/mjuːˈzɪʃ.ən/',
    pronunciation_uk: '/mjuːˈzɪʃ.ən/',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'lex-006',
    word: 'English',
    word_lowercase: 'english',
    slug: 'english',
    word_type: 'noun',
    cefr_level: 'A1',
    pronunciation_us: '/ˈɪŋ.ɡlɪʃ/',
    pronunciation_uk: '/ˈɪŋ.ɡlɪʃ/',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'lex-007',
    word: 'chatting',
    word_lowercase: 'chatting',
    slug: 'chatting',
    word_type: 'verb',
    cefr_level: 'A1',
    pronunciation_us: '/ˈtʃæt.ɪŋ/',
    pronunciation_uk: '/ˈtʃæt.ɪŋ/',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'lex-008',
    word: 'watch',
    word_lowercase: 'watch',
    slug: 'watch',
    word_type: 'verb',
    cefr_level: 'A1',
    pronunciation_us: '/wɒtʃ/',
    pronunciation_uk: '/wɒtʃ/',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'lex-009',
    word: 'negotiate',
    word_lowercase: 'negotiate',
    slug: 'negotiate',
    word_type: 'verb',
    cefr_level: 'B2',
    pronunciation_us: '/nɪˈɡəʊ.ʃi.eɪt/',
    pronunciation_uk: '/nɪˈɡəʊ.ʃi.eɪt/',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'lex-010',
    word: 'employee',
    word_lowercase: 'employee',
    slug: 'employee',
    word_type: 'noun',
    cefr_level: 'A2',
    pronunciation_us: '/ɪmˈplɔɪ.iː/',
    pronunciation_uk: '/ɪmˈplɔɪ.iː/',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
]

// ============================================================
// MEANINGS (with examples)
// ============================================================

export const meanings: Meaning[] = [
  {
    id: 'mean-001',
    lexical_item_id: 'lex-001',
    meaning_order: 1,
    part_of_speech: 'noun',
    definition_en: 'an unusual and exciting experience or activity',
    definition_vi: 'cuộc phiêu lưu',
    short_meaning_vi: 'phiêu lưu',
    examples: [
      {
        sentence_en: 'We had an exciting adventure in the mountains.',
        sentence_vi: 'Chúng tôi đã có một cuộc phiêu lưu thú vị ở trên núi.',
        sentence_with_blank: 'We had an exciting _____ in the mountains.',
        blank_word_position: 4,
      },
    ],
    synonyms: ['journey', 'quest', 'expedition'],
    antonyms: ['routine'],
    collocations: ['exciting adventure', 'adventure travel', 'go on an adventure'],
    is_primary: true,
    cefr_level: 'A2',
    domain: 'General',
  },
  {
    id: 'mean-002',
    lexical_item_id: 'lex-002',
    meaning_order: 1,
    part_of_speech: 'noun',
    definition_en: 'an idea or plan suggested by someone',
    definition_vi: 'lời gợi ý',
    short_meaning_vi: 'gợi ý',
    examples: [
      {
        sentence_en: 'Do you have any suggestions for the project?',
        sentence_vi: 'Bạn có gợi ý gì cho dự án không?',
        sentence_with_blank: 'Do you have any _____ for the project?',
        blank_word_position: 4,
      },
    ],
    synonyms: ['idea', 'recommendation', 'proposal'],
    antonyms: ['criticism'],
    collocations: ['make a suggestion', 'have a suggestion', 'accept a suggestion'],
    is_primary: true,
    cefr_level: 'B1',
    domain: 'Business',
  },
  {
    id: 'mean-003',
    lexical_item_id: 'lex-003',
    meaning_order: 1,
    part_of_speech: 'noun',
    definition_en: 'the act of sharing something with other people',
    definition_vi: 'chia sẻ',
    short_meaning_vi: 'chia sẻ',
    examples: [
      {
        sentence_en: 'The sharing of ideas is important in teamwork.',
        sentence_vi: 'Việc chia sẻ ý tưởng rất quan trọng trong làm việc nhóm.',
        sentence_with_blank: 'The _____ of ideas is important in teamwork.',
        blank_word_position: 2,
      },
    ],
    synonyms: ['distributing', 'dividing'],
    collocations: ['file sharing', 'knowledge sharing', 'sharing economy'],
    is_primary: true,
    cefr_level: 'A1',
    domain: 'General',
  },
  {
    id: 'mean-004',
    lexical_item_id: 'lex-004',
    meaning_order: 1,
    part_of_speech: 'noun',
    definition_en: 'the activity of firing guns',
    definition_vi: 'bắn súng',
    short_meaning_vi: 'bắn súng',
    examples: [
      {
        sentence_en: 'The shooting range is open from 9 AM to 6 PM.',
        sentence_vi: 'Bãi tập bắn mở cửa từ 9 giờ sáng đến 6 giờ chiều.',
        sentence_with_blank: 'The _____ range is open from 9 AM to 6 PM.',
        blank_word_position: 2,
      },
    ],
    synonyms: ['firing', 'gunfire'],
    collocations: ['shooting range', 'shooting star', 'shooting incident'],
    is_primary: true,
    cefr_level: 'B1',
    domain: 'Sports',
  },
  {
    id: 'mean-005',
    lexical_item_id: 'lex-005',
    meaning_order: 1,
    part_of_speech: 'noun',
    definition_en: 'a person who plays a musical instrument or writes music',
    definition_vi: 'nhạc sĩ',
    short_meaning_vi: 'nhạc sĩ',
    examples: [
      {
        sentence_en: 'She is a talented musician who plays the violin.',
        sentence_vi: 'Cô ấy là một nhạc sĩ tài năng chơi violin.',
        sentence_with_blank: 'She is a talented _____ who plays the violin.',
        blank_word_position: 3,
      },
    ],
    synonyms: ['performer', 'artist', 'composer'],
    collocations: ['talented musician', 'professional musician', 'street musician'],
    is_primary: true,
    cefr_level: 'A2',
    domain: 'Arts',
  },
  {
    id: 'mean-006',
    lexical_item_id: 'lex-006',
    meaning_order: 1,
    part_of_speech: 'noun',
    definition_en: 'the language spoken in the UK, US, and many other countries',
    definition_vi: 'tiếng Anh',
    short_meaning_vi: 'tiếng Anh',
    examples: [
      {
        sentence_en: 'I have been learning English for five years.',
        sentence_vi: 'Tôi đã học tiếng Anh được năm năm rồi.',
        sentence_with_blank: 'I have been learning _____ for five years.',
        blank_word_position: 4,
      },
    ],
    synonyms: ['British language'],
    collocations: ['English language', 'English class', 'speak English'],
    is_primary: true,
    cefr_level: 'A1',
    domain: 'Language',
  },
  {
    id: 'mean-007',
    lexical_item_id: 'lex-007',
    meaning_order: 1,
    part_of_speech: 'verb',
    definition_en: 'to talk to someone in a friendly informal way',
    definition_vi: 'trò chuyện',
    short_meaning_vi: 'trò chuyện',
    examples: [
      {
        sentence_en: 'We were chatting about our weekend plans.',
        sentence_vi: 'Chúng tôi đang trò chuyện về kế hoạch cuối tuần.',
        sentence_with_blank: 'We were _____ about our weekend plans.',
        blank_word_position: 3,
      },
    ],
    synonyms: ['talking', 'conversation'],
    collocations: ['online chatting', 'video chatting', 'start chatting'],
    is_primary: true,
    cefr_level: 'A1',
    domain: 'Communication',
  },
  {
    id: 'mean-008',
    lexical_item_id: 'lex-008',
    meaning_order: 1,
    part_of_speech: 'verb',
    definition_en: 'to look at or follow something with your eyes',
    definition_vi: 'xem',
    short_meaning_vi: 'xem',
    examples: [
      {
        sentence_en: 'I like to watch movies on weekends.',
        sentence_vi: 'Tôi thích xem phim vào cuối tuần.',
        sentence_with_blank: 'I like to _____ movies on weekends.',
        blank_word_position: 3,
      },
    ],
    synonyms: ['observe', 'look', 'see'],
    collocations: ['watch TV', 'watch a movie', 'smart watch'],
    is_primary: true,
    cefr_level: 'A1',
    domain: 'General',
  },
  {
    id: 'mean-009',
    lexical_item_id: 'lex-009',
    meaning_order: 1,
    part_of_speech: 'verb',
    definition_en: 'to try to reach an agreement through discussion',
    definition_vi: 'đàm phán',
    short_meaning_vi: 'đàm phán',
    examples: [
      {
        sentence_en: 'We need to negotiate a better deal with our suppliers.',
        sentence_vi: 'Chúng tôi cần đàm phán một thỏa thuận tốt hơn với các nhà cung cấp.',
        sentence_with_blank: 'We need to _____ a better deal with our suppliers.',
        blank_word_position: 3,
      },
    ],
    synonyms: ['discuss', 'bargain', 'compromise'],
    collocations: ['negotiate a contract', 'negotiate price', 'negotiate terms'],
    is_primary: true,
    cefr_level: 'B2',
    domain: 'Business',
  },
  {
    id: 'mean-010',
    lexical_item_id: 'lex-010',
    meaning_order: 1,
    part_of_speech: 'noun',
    definition_en: 'a person who is paid to work for a company or organization',
    definition_vi: 'nhân viên',
    short_meaning_vi: 'nhân viên',
    examples: [
      {
        sentence_en: 'The company has over 500 employees worldwide.',
        sentence_vi: 'Công ty có hơn 500 nhân viên trên toàn thế giới.',
        sentence_with_blank: 'The company has over 500 _____ worldwide.',
        blank_word_position: 3,
      },
    ],
    synonyms: ['worker', 'staff'],
    collocations: ['new employee', 'employee benefits', 'employee training'],
    is_primary: true,
    cefr_level: 'A2',
    domain: 'Business',
  },
]

// ============================================================
// FLASHCARD DECKS (from DB: flashcard_decks)
// ============================================================

export const flashcardDecks: FlashcardDeck[] = [
  {
    id: 'deck-001',
    name: 'Business English Essentials',
    name_vi: 'Tiếng Anh Thương Mại Cơ Bản',
    description: 'Essential business vocabulary for professional settings',
    description_vi: 'Từ vựng thương mại thiết yếu cho môi trường chuyên nghiệp',
    creator_type: 'SYSTEM',
    cefr_level: 'B1-B2',
    tags: ['business', 'professional', 'workplace'],
    tags_vi: ['thương mại', 'chuyên nghiệp', 'nơi làm việc'],
    visibility: 'PUBLIC',
    card_count: 10,
    total_studied: 15420,
    total_users: 3250,
    avg_mastery_percent: 72,
    save_count: 890,
    is_featured: true,
    rating_average: 4.5,
    rating_count: 156,
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z',
  },
  {
    id: 'deck-002',
    name: 'Daily Communication',
    name_vi: 'Giao Tiếp Hàng Ngày',
    description: 'Common words for everyday conversations',
    description_vi: 'Từ vựng phổ biến cho giao tiếp hàng ngày',
    creator_type: 'SYSTEM',
    cefr_level: 'A1-A2',
    tags: ['daily', 'conversation', 'beginner'],
    tags_vi: ['hàng ngày', 'trò chuyện', 'người mới'],
    visibility: 'PUBLIC',
    card_count: 10,
    total_studied: 28100,
    total_users: 5420,
    avg_mastery_percent: 78,
    save_count: 1250,
    is_featured: true,
    rating_average: 4.7,
    rating_count: 298,
    created_at: '2026-01-10T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z',
  },
]

// ============================================================
// FRONTEND-OPTIMIZED VOCABULARY ITEMS (for UI)
// ============================================================

// Combined lexical item + meaning for easier frontend use
export const vocabularyItems: VocabularyItem[] = lexicalItems.map((lex, idx) => {
  const meaning = meanings.find(m => m.lexical_item_id === lex.id)
  return {
    id: lex.id,
    word: lex.word,
    word_lowercase: lex.word_lowercase,
    pronunciation: lex.pronunciation_us || '',
    pronunciation_uk: lex.pronunciation_uk,
    meaningVi: meaning?.definition_vi || '',
    partOfSpeech: meaning?.part_of_speech || lex.word_type,
    cefrLevel: lex.cefr_level,
    example: meaning?.examples?.[0]?.sentence_en || '',
    exampleMeaningVi: meaning?.examples?.[0]?.sentence_vi || '',
    image: getImageForWord(lex.word),
    audioUrl: lex.audio_url_us,
    synonyms: meaning?.synonyms || [],
    collocations: meaning?.collocations || [],
  }
})

// Helper function to get image emoji for word
function getImageForWord(word: string): string {
  const imageMap: Record<string, string> = {
    adventure: '🏔️',
    suggestion: '💡',
    sharing: '🤝',
    shooting: '🎯',
    musician: '🎻',
    english: '📚',
    chatting: '💬',
    watch: '⌚',
    negotiate: '🤝',
    employee: '💼',
  }
  return imageMap[word.toLowerCase()] || '📖'
}

// ============================================================
// VOCABULARY DECKS (for frontend)
// ============================================================

export const vocabularyDecks: VocabularyDeck[] = [
  {
    id: 'deck-001',
    title: 'Business English Essentials',
    titleVi: 'Tiếng Anh Thương Mại',
    description: 'Essential business vocabulary for professional settings',
    descriptionVi: 'Từ vựng thương mại thiết yếu cho môi trường chuyên nghiệp',
    coverColor: '#2f7f78',
    cardCount: 10,
    creatorType: 'SYSTEM',
    cefrLevel: 'B1-B2',
    tags: ['business', 'professional'],
    visibility: 'PUBLIC',
    vocabularyItems: vocabularyItems,
  },
  {
    id: 'deck-002',
    title: 'Daily Communication',
    titleVi: 'Giao Tiếp Hàng Ngày',
    description: 'Common words for everyday conversations',
    descriptionVi: 'Từ vựng phổ biến cho giao tiếp hàng ngày',
    coverColor: '#4d78b8',
    cardCount: 10,
    creatorType: 'SYSTEM',
    cefrLevel: 'A1-A2',
    tags: ['daily', 'conversation'],
    visibility: 'PUBLIC',
    vocabularyItems: vocabularyItems,
  },
]

// ============================================================
// LEARNING STATISTICS (from DB: learning_statistics)
// ============================================================

export const learningStatistics: LearningStatistics = {
  id: 'stat-001',
  user_id: 'user-001',
  date: '2026-08-17',
  total_cards: 99,
  new_cards: 12,
  due_cards: 23,
  learning_count: 88,
  reviewing_count: 11,
  mastered_count: 0,
  total_reviews_today: 45,
  correct_today: 38,
  incorrect_today: 7,
  accuracy_today: 84.4,
  current_streak_days: 7,
  longest_streak_days: 14,
  study_time_minutes: 120,
  pronunciation_practices: 8,
  shadowing_practices: 5,
}

// Alias for backward compatibility
export const allVocabularyWords = vocabularyItems
export const mockDecks = vocabularyDecks

// ============================================================
// HELPER FUNCTIONS
// ============================================================

// Shuffle array
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// Get random distractors for multiple choice
export function getRandomDistractors(correctWord: VocabularyItem, allWords: VocabularyItem[], count: number = 3): VocabularyItem[] {
  return allWords
    .filter(w => w.id !== correctWord.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
}

// Speak word using Web Speech API
export function speakWord(word: string, rate: number = 1): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    utterance.rate = rate
    window.speechSynthesis.speak(utterance)
  }
}

// Speak sentence
export function speakSentence(sentence: string, rate: number = 1): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(sentence)
    utterance.lang = 'en-US'
    utterance.rate = rate
    window.speechSynthesis.speak(utterance)
  }
}
