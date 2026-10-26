/**
 * @file listening-practice.service.ts
 * @description Frontend API Service cho Listening Practice (Part 1, Part 2, Part 3, Part 4, Dictation)
 */

import { api } from '@/services/api.client';
import { API_CONFIG } from '@/config/api.config';
import type {
  Part1Item,
  Part2Item,
  Part3Item,
  Part4Item,
  DictationItem,
  PaginatedResponse,
} from '../types/listening-practice';

export const listeningPracticeService = {
  // ---------------------------------------------------------------------------
  // PART 1
  // ---------------------------------------------------------------------------
  async getPart1Questions(params?: {
    page?: number;
    limit?: number;
    picture_type?: string;
    difficulty?: string;
    cefr_level?: string;
    context_id?: string;
  }): Promise<PaginatedResponse<Part1Item>> {
    const res = await api.get<PaginatedResponse<Part1Item>>(
      API_CONFIG.ENDPOINTS.PRACTICE.LISTENING_PART1,
      params as Record<string, unknown>,
    );
    return res || { items: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
  },

  async getPart1ById(id: string): Promise<Part1Item> {
    return api.get<Part1Item>(API_CONFIG.ENDPOINTS.PRACTICE.LISTENING_PART1_BY_ID(id));
  },

  // ---------------------------------------------------------------------------
  // PART 2
  // ---------------------------------------------------------------------------
  async getPart2Questions(params?: {
    page?: number;
    limit?: number;
    question_type?: string;
    difficulty?: string;
    cefr_level?: string;
    context_id?: string;
  }): Promise<PaginatedResponse<Part2Item>> {
    const res = await api.get<PaginatedResponse<Part2Item>>(
      API_CONFIG.ENDPOINTS.PRACTICE.LISTENING_PART2,
      params as Record<string, unknown>,
    );
    return res || { items: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
  },

  async getPart2ById(id: string): Promise<Part2Item> {
    return api.get<Part2Item>(API_CONFIG.ENDPOINTS.PRACTICE.LISTENING_PART2_BY_ID(id));
  },

  // ---------------------------------------------------------------------------
  // PART 3
  // ---------------------------------------------------------------------------
  async getPart3Conversations(params?: {
    page?: number;
    limit?: number;
    conversation_type?: string;
    difficulty?: string;
    cefr_level?: string;
    context_id?: string;
  }): Promise<PaginatedResponse<Part3Item>> {
    const res = await api.get<PaginatedResponse<Part3Item>>(
      API_CONFIG.ENDPOINTS.PRACTICE.LISTENING_PART3,
      params as Record<string, unknown>,
    );
    return res || { items: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
  },

  async getPart3ById(id: string): Promise<Part3Item> {
    return api.get<Part3Item>(API_CONFIG.ENDPOINTS.PRACTICE.LISTENING_PART3_BY_ID(id));
  },

  // ---------------------------------------------------------------------------
  // PART 4
  // ---------------------------------------------------------------------------
  async getPart4Talks(params?: {
    page?: number;
    limit?: number;
    talk_type?: string;
    difficulty?: string;
    cefr_level?: string;
    context_id?: string;
  }): Promise<PaginatedResponse<Part4Item>> {
    const res = await api.get<PaginatedResponse<Part4Item>>(
      API_CONFIG.ENDPOINTS.PRACTICE.LISTENING_PART4,
      params as Record<string, unknown>,
    );
    return res || { items: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
  },

  async getPart4ById(id: string): Promise<Part4Item> {
    return api.get<Part4Item>(API_CONFIG.ENDPOINTS.PRACTICE.LISTENING_PART4_BY_ID(id));
  },

  // ---------------------------------------------------------------------------
  // DICTATION
  // ---------------------------------------------------------------------------
  async getDictationExercises(params?: {
    page?: number;
    limit?: number;
    difficulty?: string;
    cefr_level?: string;
    context_id?: string;
  }): Promise<PaginatedResponse<DictationItem>> {
    const { difficulty, ...filters } = params || {};
    const res = await api.get<PaginatedResponse<DictationItem>>(
      API_CONFIG.ENDPOINTS.PRACTICE.DICTATION_EXERCISES,
      { ...filters, ...(difficulty ? { difficulty_level: difficulty } : {}) },
    );
    return res || { items: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
  },

  async getDictationById(id: string): Promise<DictationItem> {
    return api.get<DictationItem>(API_CONFIG.ENDPOINTS.PRACTICE.DICTATION_BY_ID(id));
  },
};

