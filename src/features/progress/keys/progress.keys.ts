// Định nghĩa query keys quản lý cache dữ liệu tiến độ học tập.
export const progressKeys = {
  all: ['progress'] as const,
  courses: () => [...progressKeys.all, 'courses'] as const,
  testAttempts: () => [...progressKeys.all, 'test-attempts'] as const,
  examProfile: () => [...progressKeys.all, 'exam-profile'] as const,
  gamification: () => [...progressKeys.all, 'gamification'] as const,
  examHistory: () => [...progressKeys.all, 'exam-history'] as const,
  vocabProgress: () => [...progressKeys.all, 'vocab-progress'] as const,
  growthChart: (courseId: string) => [...progressKeys.all, 'growth-chart', courseId] as const,
}
