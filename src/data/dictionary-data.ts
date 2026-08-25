// Updated: 2026-08-17
// Mock data cho Dictionary:
// - lexicon: từ vựng (đơn từ & cụm từ)
// - Fields match với tables lexical_items, meanings, example_sentences
// - Có thể search theo word hoặc cụm từ chứa string

export type WordForm = 'BASE' | 'PAST' | 'PAST_PARTICIPLE' | 'PRESENT_PARTICIPLE' | 'PLURAL' | 'COMPARATIVE' | 'SUPERLATIVE'
export type MasteryLevel = 'NEW' | 'LEARNING' | 'FAMILIAR' | 'MASTERED'
export type PartOfSpeech = 'NOUN' | 'VERB' | 'ADJ' | 'ADV' | 'PRON' | 'PREP' | 'CONJ' | 'PHRASE' | 'PHRASAL_VERB'

export interface Meaning {
  id: string
  meaningOrder: number
  partOfSpeech: PartOfSpeech
  definitionEn: string
  definitionVi: string
  examples: string[]
  cefrLevel: string
  domain?: string
}

export interface DictionaryEntry {
  id: string
  word: string
  wordLowercase: string
  wordType: PartOfSpeech
  pronunciationUk: string
  pronunciationUs: string
  syllables: number
  isHomograph: boolean
  homographNumber?: number
  cefrLevel: string
  isCommon: boolean
  wordForm: WordForm
  meanings: Meaning[]
  relatedWords?: string[] // các cụm từ liên quan
}

export const dictionary: DictionaryEntry[] = [
  // ===== Từ bắt đầu bằng "a" =====
  {
    id: 'lex_about',
    word: 'about',
    wordLowercase: 'about',
    wordType: 'PREP',
    pronunciationUk: '/əˈbaʊt/',
    pronunciationUs: '/əˈbaʊt/',
    syllables: 2,
    isHomograph: false,
    cefrLevel: 'A1',
    isCommon: true,
    wordForm: 'BASE',
    meanings: [
      {
        id: 'm1', meaningOrder: 1, partOfSpeech: 'PREP',
        definitionEn: 'on the subject of; concerning',
        definitionVi: 'về, liên quan đến',
        examples: ['The book is about love.', 'What are you thinking about?'],
        cefrLevel: 'A1',
      },
      {
        id: 'm2', meaningOrder: 2, partOfSpeech: 'ADV',
        definitionEn: 'approximately',
        definitionVi: 'khoảng, xấp xỉ',
        examples: ['It takes about 10 minutes.', 'There are about 20 students.'],
        cefrLevel: 'A2',
      },
    ],
  },
  {
    id: 'lex_apple',
    word: 'apple',
    wordLowercase: 'apple',
    wordType: 'NOUN',
    pronunciationUk: '/ˈæp.əl/',
    pronunciationUs: '/ˈæp.əl/',
    syllables: 2,
    isHomograph: false,
    cefrLevel: 'A1',
    isCommon: true,
    wordForm: 'BASE',
    meanings: [
      {
        id: 'm1', meaningOrder: 1, partOfSpeech: 'NOUN',
        definitionEn: 'a round fruit with red, green, or yellow skin and white flesh',
        definitionVi: 'quả táo',
        examples: ['I eat an apple every day.', 'This apple is very sweet.'],
        cefrLevel: 'A1',
      },
    ],
  },
  {
    id: 'lex_ago',
    word: 'ago',
    wordLowercase: 'ago',
    wordType: 'ADV',
    pronunciationUk: '/əˈɡəʊ/',
    pronunciationUs: '/əˈɡoʊ/',
    syllables: 2,
    isHomograph: false,
    cefrLevel: 'A2',
    isCommon: true,
    wordForm: 'BASE',
    meanings: [
      {
        id: 'm1', meaningOrder: 1, partOfSpeech: 'ADV',
        definitionEn: 'back in time from now',
        definitionVi: 'cách đây',
        examples: ['I met her two years ago.', 'That was long ago.'],
        cefrLevel: 'A2',
      },
    ],
  },

  // ===== Từ bắt đầu bằng "b" =====
  {
    id: 'lex_bed',
    word: 'bed',
    wordLowercase: 'bed',
    wordType: 'NOUN',
    pronunciationUk: '/bed/',
    pronunciationUs: '/bed/',
    syllables: 1,
    isHomograph: false,
    cefrLevel: 'A1',
    isCommon: true,
    wordForm: 'BASE',
    meanings: [
      {
        id: 'm1', meaningOrder: 1, partOfSpeech: 'NOUN',
        definitionEn: 'a piece of furniture to sleep on',
        definitionVi: 'cái giường',
        examples: ['I go to bed at 10 PM.', 'The bed is very comfortable.'],
        cefrLevel: 'A1',
      },
    ],
  },
  {
    id: 'lex_book',
    word: 'book',
    wordLowercase: 'book',
    wordType: 'NOUN',
    pronunciationUk: '/bʊk/',
    pronunciationUs: '/bʊk/',
    syllables: 1,
    isHomograph: false,
    cefrLevel: 'A1',
    isCommon: true,
    wordForm: 'BASE',
    meanings: [
      {
        id: 'm1', meaningOrder: 1, partOfSpeech: 'NOUN',
        definitionEn: 'a written or printed work',
        definitionVi: 'quyển sách',
        examples: ['I love reading books.', 'This book is interesting.'],
        cefrLevel: 'A1',
      },
      {
        id: 'm2', meaningOrder: 2, partOfSpeech: 'VERB',
        definitionEn: 'to reserve in advance',
        definitionVi: 'đặt trước',
        examples: ['I booked a table at the restaurant.', 'Have you booked your flight?'],
        cefrLevel: 'A2',
      },
    ],
  },
  {
    id: 'lex_business',
    word: 'business',
    wordLowercase: 'business',
    wordType: 'NOUN',
    pronunciationUk: '/ˈbɪz.nɪs/',
    pronunciationUs: '/ˈbɪz.nəs/',
    syllables: 2,
    isHomograph: false,
    cefrLevel: 'A2',
    isCommon: true,
    wordForm: 'BASE',
    meanings: [
      {
        id: 'm1', meaningOrder: 1, partOfSpeech: 'NOUN',
        definitionEn: 'commercial activity',
        definitionVi: 'kinh doanh, việc làm ăn',
        examples: ['She runs a small business.', 'Business is booming.'],
        cefrLevel: 'A2',
      },
    ],
  },

  // ===== Từ bắt đầu bằng "c" =====
  {
    id: 'lex_cat',
    word: 'cat',
    wordLowercase: 'cat',
    wordType: 'NOUN',
    pronunciationUk: '/kæt/',
    pronunciationUs: '/kæt/',
    syllables: 1,
    isHomograph: false,
    cefrLevel: 'A1',
    isCommon: true,
    wordForm: 'BASE',
    meanings: [
      {
        id: 'm1', meaningOrder: 1, partOfSpeech: 'NOUN',
        definitionEn: 'a small furry mammal often kept as a pet',
        definitionVi: 'con mèo',
        examples: ['My cat loves fish.', 'The cat is sleeping.'],
        cefrLevel: 'A1',
      },
    ],
  },
  {
    id: 'lex_coffee',
    word: 'coffee',
    wordLowercase: 'coffee',
    wordType: 'NOUN',
    pronunciationUk: '/ˈkɒf.i/',
    pronunciationUs: '/ˈkɔː.fi/',
    syllables: 2,
    isHomograph: false,
    cefrLevel: 'A1',
    isCommon: true,
    wordForm: 'BASE',
    meanings: [
      {
        id: 'm1', meaningOrder: 1, partOfSpeech: 'NOUN',
        definitionEn: 'a hot drink made from roasted beans',
        definitionVi: 'cà phê',
        examples: ['I drink coffee every morning.', 'Would you like some coffee?'],
        cefrLevel: 'A1',
      },
    ],
  },
  {
    id: 'lex_car',
    word: 'car',
    wordLowercase: 'car',
    wordType: 'NOUN',
    pronunciationUk: '/kɑːr/',
    pronunciationUs: '/kɑːr/',
    syllables: 1,
    isHomograph: false,
    cefrLevel: 'A1',
    isCommon: true,
    wordForm: 'BASE',
    meanings: [
      {
        id: 'm1', meaningOrder: 1, partOfSpeech: 'NOUN',
        definitionEn: 'a road vehicle with four wheels',
        definitionVi: 'xe hơi, ô tô',
        examples: ['I drive my car to work.', 'This car is fast.'],
        cefrLevel: 'A1',
      },
    ],
  },

  // ===== Từ bắt đầu bằng "t" =====
  {
    id: 'lex_topic',
    word: 'topic',
    wordLowercase: 'topic',
    wordType: 'NOUN',
    pronunciationUk: '/ˈtɒp.ɪk/',
    pronunciationUs: '/ˈtɑː.pɪk/',
    syllables: 2,
    isHomograph: false,
    cefrLevel: 'A2',
    isCommon: true,
    wordForm: 'BASE',
    meanings: [
      {
        id: 'm1', meaningOrder: 1, partOfSpeech: 'NOUN',
        definitionEn: 'a subject that you talk, write, or think about',
        definitionVi: 'đề tài, chủ đề',
        examples: ['The main topic of discussion is climate change.', 'Choose a topic for your essay.'],
        cefrLevel: 'A2',
      },
    ],
  },
  {
    id: 'lex_talk',
    word: 'talk',
    wordLowercase: 'talk',
    wordType: 'VERB',
    pronunciationUk: '/tɔːk/',
    pronunciationUs: '/tɔːk/',
    syllables: 1,
    isHomograph: false,
    cefrLevel: 'A1',
    isCommon: true,
    wordForm: 'BASE',
    meanings: [
      {
        id: 'm1', meaningOrder: 1, partOfSpeech: 'VERB',
        definitionEn: 'to speak in order to give information or express feelings',
        definitionVi: 'nói chuyện',
        examples: ['We need to talk about this.', 'She is talking to her friend.'],
        cefrLevel: 'A1',
      },
    ],
  },

  // ===== Cụm từ - PHRASE =====
  {
    id: 'lex_deal_with_topic',
    word: 'deal with a topic',
    wordLowercase: 'deal with a topic',
    wordType: 'PHRASE',
    pronunciationUk: '/diːl wɪð ə ˈtɒp.ɪk/',
    pronunciationUs: '/diːl wɪð ə ˈtɑː.pɪk/',
    syllables: 5,
    isHomograph: false,
    cefrLevel: 'B2',
    isCommon: true,
    wordForm: 'BASE',
    meanings: [
      {
        id: 'm1', meaningOrder: 1, partOfSpeech: 'PHRASE',
        definitionEn: 'to handle or discuss a particular subject',
        definitionVi: 'xử lý hoặc thảo luận về một chủ đề',
        examples: ['The article deals with the topic of mental health.', 'How do we deal with this topic?'],
        cefrLevel: 'B2',
      },
    ],
  },
  {
    id: 'lex_topic_of_conversation',
    word: 'topic of conversation',
    wordLowercase: 'topic of conversation',
    wordType: 'PHRASE',
    pronunciationUk: '/ˈtɒp.ɪk əv ˌkɒn.vəˈseɪ.ʃən/',
    pronunciationUs: '/ˈtɑː.pɪk əv ˌkɑːn.vɚˈseɪ.ʃən/',
    syllables: 7,
    isHomograph: false,
    cefrLevel: 'B1',
    isCommon: true,
    wordForm: 'BASE',
    meanings: [
      {
        id: 'm1', meaningOrder: 1, partOfSpeech: 'PHRASE',
        definitionEn: 'a subject being discussed',
        definitionVi: 'chủ đề đang được thảo luận',
        examples: ['The topic of conversation was the new movie.', 'Let\'s change the topic of conversation.'],
        cefrLevel: 'B1',
      },
    ],
  },
  {
    id: 'lex_good_book',
    word: 'good book',
    wordLowercase: 'good book',
    wordType: 'PHRASE',
    pronunciationUk: '/ɡʊd bʊk/',
    pronunciationUs: '/ɡʊd bʊk/',
    syllables: 2,
    isHomograph: false,
    cefrLevel: 'A1',
    isCommon: true,
    wordForm: 'BASE',
    meanings: [
      {
        id: 'm1', meaningOrder: 1, partOfSpeech: 'PHRASE',
        definitionEn: 'a book that is enjoyable or interesting to read',
        definitionVi: 'sách hay',
        examples: ['I\'m reading a good book.', 'Can you recommend a good book?'],
        cefrLevel: 'A1',
      },
    ],
  },
  {
    id: 'lex_make_bed',
    word: 'make the bed',
    wordLowercase: 'make the bed',
    wordType: 'PHRASAL_VERB',
    pronunciationUk: '/meɪk ðə bed/',
    pronunciationUs: '/meɪk ðə bed/',
    syllables: 3,
    isHomograph: false,
    cefrLevel: 'A2',
    isCommon: true,
    wordForm: 'BASE',
    meanings: [
      {
        id: 'm1', meaningOrder: 1, partOfSpeech: 'PHRASAL_VERB',
        definitionEn: 'to arrange the bed neatly after sleeping',
        definitionVi: 'dọn giường',
        examples: ['I make the bed every morning.', 'Have you made the bed yet?'],
        cefrLevel: 'A2',
      },
    ],
  },
  {
    id: 'lex_business_meeting',
    word: 'business meeting',
    wordLowercase: 'business meeting',
    wordType: 'PHRASE',
    pronunciationUk: '/ˈbɪz.nɪs ˈmiː.tɪŋ/',
    pronunciationUs: '/ˈbɪz.nəs ˈmiː.tɪŋ/',
    syllables: 4,
    isHomograph: false,
    cefrLevel: 'B1',
    isCommon: true,
    wordForm: 'BASE',
    meanings: [
      {
        id: 'm1', meaningOrder: 1, partOfSpeech: 'PHRASE',
        definitionEn: 'a formal meeting to discuss business matters',
        definitionVi: 'cuộc họp kinh doanh',
        examples: ['I have a business meeting tomorrow.', 'The business meeting lasted two hours.'],
        cefrLevel: 'B1',
      },
    ],
  },
  {
    id: 'lex_cat_lover',
    word: 'cat lover',
    wordLowercase: 'cat lover',
    wordType: 'PHRASE',
    pronunciationUk: '/kæt ˈlʌv.ər/',
    pronunciationUs: '/kæt ˈlʌv.ɚ/',
    syllables: 3,
    isHomograph: false,
    cefrLevel: 'A2',
    isCommon: true,
    wordForm: 'BASE',
    meanings: [
      {
        id: 'm1', meaningOrder: 1, partOfSpeech: 'PHRASE',
        definitionEn: 'a person who loves cats',
        definitionVi: 'người yêu mèo',
        examples: ['I\'m a cat lover.', 'Cat lovers often have multiple cats.'],
        cefrLevel: 'A2',
      },
    ],
  },
  {
    id: 'lex_coffee_break',
    word: 'coffee break',
    wordLowercase: 'coffee break',
    wordType: 'PHRASE',
    pronunciationUk: '/ˈkɒf.i breɪk/',
    pronunciationUs: '/ˈkɔː.fi breɪk/',
    syllables: 3,
    isHomograph: false,
    cefrLevel: 'A2',
    isCommon: true,
    wordForm: 'BASE',
    meanings: [
      {
        id: 'm1', meaningOrder: 1, partOfSpeech: 'PHRASE',
        definitionEn: 'a short rest period during work for having coffee',
        definitionVi: 'giờ giải lao uống cà phê',
        examples: ['Let\'s take a coffee break.', 'We have a coffee break at 10 AM.'],
        cefrLevel: 'A2',
      },
    ],
  },
  {
    id: 'lex_car_park',
    word: 'car park',
    wordLowercase: 'car park',
    wordType: 'PHRASE',
    pronunciationUk: '/kɑːr pɑːk/',
    pronunciationUs: '/kɑːr pɑːrk/',
    syllables: 2,
    isHomograph: false,
    cefrLevel: 'A2',
    isCommon: true,
    wordForm: 'BASE',
    meanings: [
      {
        id: 'm1', meaningOrder: 1, partOfSpeech: 'PHRASE',
        definitionEn: 'an area where cars can be parked',
        definitionVi: 'bãi đỗ xe',
        examples: ['I parked my car in the car park.', 'The car park is full.'],
        cefrLevel: 'A2',
      },
    ],
  },
  {
    id: 'lex_about_us',
    word: 'about us',
    wordLowercase: 'about us',
    wordType: 'PHRASE',
    pronunciationUk: '/əˈbaʊt ʌs/',
    pronunciationUs: '/əˈbaʊt ʌs/',
    syllables: 3,
    isHomograph: false,
    cefrLevel: 'A1',
    isCommon: true,
    wordForm: 'BASE',
    meanings: [
      {
        id: 'm1', meaningOrder: 1, partOfSpeech: 'PHRASE',
        definitionEn: 'a section on a website describing the company',
        definitionVi: 'về chúng tôi',
        examples: ['Click on "About Us" to learn more.', 'Read about us on our website.'],
        cefrLevel: 'A1',
      },
    ],
  },
  {
    id: 'lex_apple_pie',
    word: 'apple pie',
    wordLowercase: 'apple pie',
    wordType: 'PHRASE',
    pronunciationUk: '/ˈæp.əl paɪ/',
    pronunciationUs: '/ˈæp.əl paɪ/',
    syllables: 3,
    isHomograph: false,
    cefrLevel: 'A2',
    isCommon: true,
    wordForm: 'BASE',
    meanings: [
      {
        id: 'm1', meaningOrder: 1, partOfSpeech: 'PHRASE',
        definitionEn: 'a dessert made with apples and pastry',
        definitionVi: 'bánh táo',
        examples: ['My grandmother makes the best apple pie.', 'I love apple pie with ice cream.'],
        cefrLevel: 'A2',
      },
    ],
  },
  {
    id: 'lex_long_ago',
    word: 'long ago',
    wordLowercase: 'long ago',
    wordType: 'PHRASE',
    pronunciationUk: '/lɒŋ əˈɡəʊ/',
    pronunciationUs: '/lɔːŋ əˈɡoʊ/',
    syllables: 3,
    isHomograph: false,
    cefrLevel: 'A2',
    isCommon: true,
    wordForm: 'BASE',
    meanings: [
      {
        id: 'm1', meaningOrder: 1, partOfSpeech: 'PHRASE',
        definitionEn: 'a long time in the past',
        definitionVi: 'đã lâu rồi, thuở xa xưa',
        examples: ['That happened long ago.', 'Long ago, people lived in caves.'],
        cefrLevel: 'A2',
      },
    ],
  },
  {
    id: 'lex_talk_about',
    word: 'talk about',
    wordLowercase: 'talk about',
    wordType: 'PHRASAL_VERB',
    pronunciationUk: '/tɔːk əˈbaʊt/',
    pronunciationUs: '/tɔːk əˈbaʊt/',
    syllables: 3,
    isHomograph: false,
    cefrLevel: 'A2',
    isCommon: true,
    wordForm: 'BASE',
    meanings: [
      {
        id: 'm1', meaningOrder: 1, partOfSpeech: 'PHRASAL_VERB',
        definitionEn: 'to discuss a subject',
        definitionVi: 'nói về, thảo luận về',
        examples: ['We talked about the topic for hours.', 'Let\'s talk about your future.'],
        cefrLevel: 'A2',
      },
    ],
  },
  {
    id: 'lex_good_at',
    word: 'good at',
    wordLowercase: 'good at',
    wordType: 'PHRASE',
    pronunciationUk: '/ɡʊd æt/',
    pronunciationUs: '/ɡʊd æt/',
    syllables: 2,
    isHomograph: false,
    cefrLevel: 'A2',
    isCommon: true,
    wordForm: 'BASE',
    meanings: [
      {
        id: 'm1', meaningOrder: 1, partOfSpeech: 'PHRASE',
        definitionEn: 'skilled in something',
        definitionVi: 'giỏi về',
        examples: ['She is good at mathematics.', 'I\'m good at cooking.'],
        cefrLevel: 'A2',
      },
    ],
  },
]

/**
 * Search dictionary - tìm từ & cụm từ có chứa string query
 * Case-insensitive, match exact word or substring
 */
export function searchDictionary(query: string): DictionaryEntry[] {
  if (!query.trim()) return []

  const q = query.toLowerCase().trim()
  return dictionary.filter((entry) => {
    // Exact match word
    if (entry.wordLowercase === q) return true
    // Phrase contains the query
    if (entry.wordLowercase.includes(q)) return true
    return false
  })
}
