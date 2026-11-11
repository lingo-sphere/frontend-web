// Định nghĩa query keys quản lý cache dữ liệu tiến độ học tập và phân tích năng lực.
export const progressKeys = {
  all: ['progress'] as const,
  courses: () => [...progressKeys.all, 'courses'] as const,
  testAttempts: () => [...progressKeys.all, 'test-attempts'] as const,
  examProfile: () => [...progressKeys.all, 'exam-profile'] as const,
  gamification: () => [...progressKeys.all, 'gamification'] as const,
  examHistory: () => [...progressKeys.all, 'exam-history'] as const,
  vocabProgress: () => [...progressKeys.all, 'vocab-progress'] as const,
  growthChart: (courseId: string) => [...progressKeys.all, 'growth-chart', courseId] as const,
  skillsSummary: (userId: string, period: string) => [...progressKeys.all, 'skills-summary', userId, period] as const,
  weaknesses: (userId: string, limit?: number) => [...progressKeys.all, 'weaknesses', userId, limit ?? 10] as const,
  practiceDashboard: (userId: string, period: string) => [...progressKeys.all, 'practice-dashboard', userId, period] as const,
}
