// Quản lý Query Keys tập trung cho module kỹ năng luyện tập (Practice).
export const practiceKeys = {
  all: ['practice'] as const,
  listeningPracticeItems: (params?: { difficulty?: string; contextId?: string; cefrLevel?: string; page?: number; limit?: number }) =>
    [...practiceKeys.all, 'listening', 'practice-items', params ?? {}] as const,
  listening: (params?: { part?: number; level?: string }) =>
    [...practiceKeys.all, 'listening', params ?? {}] as const,
  listeningDetail: (id: string) => [...practiceKeys.all, 'listening', id] as const,
  speaking: (params?: { part?: number }) =>
    [...practiceKeys.all, 'speaking', params ?? {}] as const,
  speakingDetail: (id: string) => [...practiceKeys.all, 'speaking', id] as const,
  writing: () => [...practiceKeys.all, 'writing'] as const,
  writingDetail: (id: string) => [...practiceKeys.all, 'writing', id] as const,
  mistakes: (params?: unknown) => [...practiceKeys.all, 'mistakes', params ?? {}] as const,
  mistakesDue: () => [...practiceKeys.all, 'mistakes', 'due'] as const,
  topicDrill: (tag: string, limit?: number) => [...practiceKeys.all, 'topic-drill', tag, limit ?? 10] as const,
}
