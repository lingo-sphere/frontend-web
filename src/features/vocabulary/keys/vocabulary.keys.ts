// Quản lý Query Key tập trung cho module từ vựng trong frontend-web.
export const vocabularyKeys = {
  all: ['vocabulary'] as const,
  publicDecks: (params?: { cefr_level?: string; search?: string }) =>
    [...vocabularyKeys.all, 'public-decks', params ?? {}] as const,
  myEnrollments: () => [...vocabularyKeys.all, 'my-enrollments'] as const,
  deck: (deckId: string) => [...vocabularyKeys.all, 'deck', deckId] as const,
  topics: (params?: { cefr_level?: string }) => [...vocabularyKeys.all, 'topics', params ?? {}] as const,
}
