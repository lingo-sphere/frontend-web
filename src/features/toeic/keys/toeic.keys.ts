// Định nghĩa query keys cho module bài thi TOEIC.
export const toeicKeys = {
  all: ['toeic'] as const,
  exams: () => [...toeicKeys.all, 'exams'] as const,
  detail: (id: string) => [...toeicKeys.all, 'exam', id] as const,
  history: () => [...toeicKeys.all, 'history'] as const,
  attempt: (attemptId: string) => [...toeicKeys.all, 'attempt', attemptId] as const,
  courseAttempts: () => [...toeicKeys.all, 'course-attempts'] as const,
}
