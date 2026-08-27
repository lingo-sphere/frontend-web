import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'
import type { SpeechAssessmentResult } from '@/types/api.types'

export const practiceService = {

  async getListeningExercises(params?: { part?: number; level?: string }) {
    return api.get(API_CONFIG.ENDPOINTS.PRACTICE.LISTENING, params)
  },

  async getListeningExerciseById(id: string) {
    return api.get(API_CONFIG.ENDPOINTS.PRACTICE.LISTENING_BY_ID(id))
  },

  async getSpeakingExercises(params?: { part?: number }) {
    return api.get(API_CONFIG.ENDPOINTS.PRACTICE.SPEAKING, params)
  },

  async evaluateSpeakingAudio(audioBlob: Blob, exerciseId?: string, topic?: string): Promise<SpeechAssessmentResult> {
    const params: Record<string, string> = {}
    if (exerciseId) params.exercise_id = exerciseId
    if (topic) params.topic = topic

    return api.upload<SpeechAssessmentResult>(
      API_CONFIG.ENDPOINTS.PRACTICE.SPEAKING_EVALUATE,
      audioBlob,
      params,
    )
  },

  async getWritingExercises() {
    return api.get(API_CONFIG.ENDPOINTS.PRACTICE.WRITING)
  },

  async evaluateWritingEssay(essay: string, topic: string): Promise<{
    grammar_score: number
    vocabulary_score: number
    coherence_score: number
    overall_score: number
    feedback_vi: string
    improved_essay: string
  }> {
    return api.post(API_CONFIG.ENDPOINTS.PRACTICE.WRITING_EVALUATE, {
      essay_text: essay,
      topic: topic,
    })
  },

  async getDailyJournalPrompt(): Promise<{ id: string; topic_vi: string; topic_en: string; date: string }> {
    return api.get(API_CONFIG.ENDPOINTS.PRACTICE.DAILY_PROMPT)
  },
}
