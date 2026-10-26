import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import type { Part1Session, Part1SessionFilters, Part1SessionResult } from '../types/listening-part1-session'

export const part1SessionService = {
  create: (params: Part1SessionFilters & { exercise_ids?: string[]; limit: number; random: boolean; time_preset: string }) =>
    api.post<Part1Session>(API_CONFIG.ENDPOINTS.PRACTICE.LISTENING_PART1_SESSIONS, params),
  submit: (session_id: string, answers: Record<string, string>, total_time_seconds: number) =>
    api.post<Part1SessionResult>(API_CONFIG.ENDPOINTS.PRACTICE.LISTENING_PART1_SUBMIT_SESSION, { session_id, answers, total_time_seconds }),
}
