import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'
import type { SpeechAssessmentResult } from '@/types/api.types'

export const practiceService = {
  // 1. Luyện Nghe (Listening)
  async getListeningExercises(params?: { part?: number; level?: string }) {
    return api.get(API_CONFIG.ENDPOINTS.PRACTICE.LISTENING, params)
  },

  async getListeningExerciseById(id: string) {
    return api.get(API_CONFIG.ENDPOINTS.PRACTICE.LISTENING_BY_ID(id))
  },

  // 2. Luyện Nói (Speaking với Whisper.cpp)
  async getSpeakingExercises(params?: { part?: number }) {
    return api.get(API_CONFIG.ENDPOINTS.PRACTICE.SPEAKING, params)
  },

  // Gửi file ghi âm của học viên lên Backend để Whisper.cpp nhận diện & chấm điểm phát âm
  async evaluateSpeakingAudio(audioBlob: Blob, exerciseId?: string, topic?: string): Promise<SpeechAssessmentResult> {
    return api.upload<SpeechAssessmentResult>(
      API_CONFIG.ENDPOINTS.PRACTICE.SPEAKING_EVALUATE,
      audioBlob,
      {
        exercise_id: exerciseId || '',
        topic: topic || '',
      },
    )
  },

  // 3. Luyện Viết (Writing với Ollama AI)
  async getWritingExercises() {
    return api.get(API_CONFIG.ENDPOINTS.PRACTICE.WRITING)
  },

  // Chấm điểm bài viết luận / nhật ký tiếng Anh
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

  // Lấy chủ đề viết nhật ký hôm nay
  async getDailyJournalPrompt(): Promise<{ id: string; topic_vi: string; topic_en: string; date: string }> {
    return api.get(API_CONFIG.ENDPOINTS.PRACTICE.DAILY_PROMPT)
  },
}
