// Quản lý Query Keys tập trung cho module lộ trình học tập (Roadmap).
export const roadmapKeys = {
  all: ['roadmap'] as const,
  list: (params?: { is_published?: boolean }) => [...roadmapKeys.all, 'list', params ?? {}] as const,
  detail: (id: string) => [...roadmapKeys.all, 'detail', id] as const,
}
