/**
 * @file listening-practice.ts
 * @description Types cho toàn bộ các dạng bài Listening Practice (Part 1, 2, 3, 4, Dictation)
 */

export type ListeningTabType =
  | 'PART_1'
  | 'PART_2'
  | 'PART_3'
  | 'PART_4'
  | 'DICTATION';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// ---------------------------------------------------------------------------
// PART 1: PICTURE DESCRIPTION
// ---------------------------------------------------------------------------
export interface Part1Item {
  _id: string;
  title: string;
  title_vi?: string;
  picture_type?: 'SINGLE_PERSON' | 'MULTIPLE_PEOPLE' | 'OBJECT' | 'SCENE';
  audio_url?: string;
  image_url?: string;
  media_id?: string;
  duration_seconds?: number;
  difficulty_level?: string;
  cefr_level?: string;
  transcript?: string;
  transcript_vi?: string;
  options?: Array<{ key: string; text: string; text_vi?: string; is_correct?: boolean }>;
  correct_answer?: string;
  explanation?: string;
  explanation_vi?: string;
  target_grammar_knowledge_ids?: string[];
  grammar_point_title?: string;
  grammar_point_title_vi?: string;
}

// ---------------------------------------------------------------------------
// PART 2: QUESTION - RESPONSE
// ---------------------------------------------------------------------------
export interface Part2Item {
  _id: string;
  title: string;
  title_vi?: string;
  question_type: 'WH' | 'YES_NO' | 'CHOICE' | 'TAG' | 'REQUEST' | 'SUGGEST';
  audio_url: string;
  audio_duration_seconds: number;
  transcript: string;
  transcript_vi?: string;
  options: Array<{ key: string; text: string; text_vi?: string; is_correct?: boolean }>;
  correct_answer: string;
  distractors?: Array<{ option_key: string; type: string; reason: string; reason_vi?: string }>;
  explanation?: string;
  explanation_vi?: string;
  difficulty_level?: string;
  cefr_level?: string;
  target_grammar_knowledge_ids?: string[];
  grammar_point_title?: string;
  grammar_point_title_vi?: string;
}

// ---------------------------------------------------------------------------
// PART 3: SHORT CONVERSATIONS
// ---------------------------------------------------------------------------
export interface Part3Question {
  question_index: number;
  question_text: string;
  question_text_vi?: string;
  question_type: string;
  options: Array<{ key: string; text: string; text_vi?: string; is_correct?: boolean }>;
  correct_answer: string;
  explanation?: string;
  explanation_vi?: string;
  grammar_knowledge_id?: string;
  grammar_point_title?: string;
  grammar_point_title_vi?: string;
}

export interface Part3Item {
  _id: string;
  title: string;
  title_vi?: string;
  conversation_type: 'BUSINESS' | 'SOCIAL' | 'SERVICE' | 'TECHNICAL' | 'GENERAL';
  audio_url: string;
  duration_seconds: number;
  speaker_1: 'MALE' | 'FEMALE';
  speaker_2: 'MALE' | 'FEMALE';
  speaker_1_name?: string;
  speaker_2_name?: string;
  transcript: string;
  transcript_vi?: string;
  segments?: Array<{
    speaker: string;
    start_time: number;
    end_time: number;
    text: string;
    text_vi?: string;
  }>;
  questions: Part3Question[];
  difficulty_level?: string;
  cefr_level?: string;
  target_grammar_knowledge_ids?: string[];
}

// ---------------------------------------------------------------------------
// PART 4: SHORT TALKS
// ---------------------------------------------------------------------------
export interface Part4Question {
  question_index: number;
  question_text: string;
  question_text_vi?: string;
  question_type: string;
  options: Array<{ key: string; text: string; text_vi?: string; is_correct?: boolean }>;
  correct_answer: string;
  explanation?: string;
  explanation_vi?: string;
  grammar_knowledge_id?: string;
  grammar_point_title?: string;
  grammar_point_title_vi?: string;
}

export interface Part4Item {
  _id: string;
  title: string;
  title_vi?: string;
  talk_type: 'ANNOUNCEMENT' | 'NEWS_REPORT' | 'TALK_SPEECH' | 'ADVERTISEMENT' | 'INSTRUCTION';
  audio_url: string;
  duration_seconds: number;
  speaker_gender: 'MALE' | 'FEMALE';
  speaker_name?: string;
  speaker_role?: string;
  transcript: string;
  transcript_vi?: string;
  questions: Part4Question[];
  difficulty_level?: string;
  cefr_level?: string;
  target_grammar_knowledge_ids?: string[];
}

// ---------------------------------------------------------------------------
// DICTATION
// ---------------------------------------------------------------------------
export interface DictationBlank {
  blank_index: number;
  global_index: number;
  blank_type: 'WORD' | 'PHRASE' | 'SENTENCE';
  correct_answer: string;
  alternative_answers?: string[];
  start_char?: number;
  end_char?: number;
  is_key_word?: boolean;
}

export interface DictationSegment {
  _id?: string;
  segment_index: number;
  start_time: number;
  end_time: number;
  duration_seconds: number;
  text: string;
  text_vi?: string;
  word_count: number;
  total_blanks: number;
  blanks: DictationBlank[];
}

export interface DictationItem {
  _id: string;
  title: string;
  title_vi?: string;
  description?: string;
  description_vi?: string;
  audio_url?: string;
  duration_seconds: number;
  transcript?: string;
  transcript_vi?: string;
  total_segments: number;
  total_words: number;
  difficulty_level?: string;
  cefr_level?: string;
  segments?: DictationSegment[];
}

