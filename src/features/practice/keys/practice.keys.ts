// Quản lý Query Keys tập trung cho module kỹ năng luyện tập (Practice).
export const practiceKeys = {
  all: ['practice'] as const,
  listening: (params?: { part?: number; level?: string }) =>
    [...practiceKeys.all, 'listening', params ?? {}] as const,
  listeningDetail: (id: string) => [...practiceKeys.all, 'listening', id] as const,
  speaking: (params?: { part?: number }) =>
    [...practiceKeys.all, 'speaking', params ?? {}] as const,
  speakingDetail: (id: string) => [...practiceKeys.all, 'speaking', id] as const,
  writing: () => [...practiceKeys.all, 'writing'] as const,
  writingDetail: (id: string) => [...practiceKeys.all, 'writing', id] as const,
  dailyJournalPrompt: () => [...practiceKeys.all, 'daily-journal-prompt'] as const,
  dailyJournalHistory: () => [...practiceKeys.all, 'daily-journal-history'] as const,
}
