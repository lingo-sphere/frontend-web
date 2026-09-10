// Định nghĩa query keys cho module bài thi TOEIC.
export const toeicKeys = {
  all: ['toeic'] as const,
  exams: (params?: { type?: string; year?: number; search?: string }) =>
    [...toeicKeys.all, 'exams', params] as const,
  detail: (id: string) => [...toeicKeys.all, 'exam', id] as const,
  history: () => [...toeicKeys.all, 'history'] as const,
  attempt: (attemptId: string) => [...toeicKeys.all, 'attempt', attemptId] as const,
  courseAttempts: () => [...toeicKeys.all, 'course-attempts'] as const,
}
