import type { UserNote, NoteTargetType } from '@/types/notes'

export const sampleNotes: UserNote[] = [
  {
    id: 'note-001',
    userId: 'user-001',
    title: 'Cách phát âm /θ/ và /ð/',
    content: 'Hai âm này rất dễ nhầm lẫn với /s/ và /z/. Điểm khác biệt là lưỡi cần chạm vào hai răng cửa trên. Ví dụ: "think" /θɪŋk/ vs "sink" /sɪŋk/',
    targetType: 'IPA',
    targetId: 'ipa-theta',
    isPinned: true,
    status: 'ACTIVE',
    createdAt: '2024-06-10T08:30:00Z',
    updatedAt: '2024-06-10T08:30:00Z',
  },
  {
    id: 'note-002',
    userId: 'user-001',
    title: 'Cấu trúc Present Perfect',
    content: 'S + have/has + V3 (past participle)\n\nDùng khi:\n- Hành động bắt đầu trong quá khứ và còn tiếp tục đến hiện tại\n- Hành động đã xảy ra nhưng kết quả liên quan đến hiện tại\n- Kinh nghiệm trong cuộc sống\n\nVí dụ: I have lived here since 2010.',
    targetType: 'GRAMMAR',
    targetId: 'grammar-present-perfect',
    isPinned: true,
    status: 'ACTIVE',
    createdAt: '2024-06-08T14:20:00Z',
    updatedAt: '2024-06-12T10:15:00Z',
  },
  {
    id: 'note-003',
    userId: 'user-001',
    title: 'Từ "ubiquitous"',
    content: 'Ý nghĩa: có mặt khắp nơi, ở khắp nơi\nPhát âm: /juːˈbɪkwɪtəs/\nVí dụ: Smartphones have become ubiquitous in modern society.\nTừ đồng nghĩa: omnipresent, pervasive, universal',
    targetType: 'VOCABULARY',
    targetId: 'vocab-ubiquitous',
    isPinned: false,
    status: 'ACTIVE',
    createdAt: '2024-06-05T09:00:00Z',
    updatedAt: '2024-06-05T09:00:00Z',
  },
  {
    id: 'note-004',
    userId: 'user-001',
    title: 'Câu điều kiện loại 3',
    content: 'Cấu trúc: If + had + V3, would have + V3\nÝ nghĩa: Diễn tả điều không có thật trong quá khứ\n\nVí dụ: If I had studied harder, I would have passed the exam.',
    targetType: 'GRAMMAR',
    targetId: 'grammar-conditional-3',
    isPinned: false,
    status: 'ACTIVE',
    createdAt: '2024-06-03T16:45:00Z',
    updatedAt: '2024-06-03T16:45:00Z',
  },
  {
    id: 'note-005',
    userId: 'user-001',
    title: 'Business Meeting - Useful phrases',
    content: 'Opening:\n- I\'d like to call the meeting to order\n- Let\'s get started\n\nDuring:\n- Could you elaborate on that?\n- To play devil\'s advocate...\n- If I could interject...\n\nClosing:\n- To sum up...\n- Let\'s adjourn the meeting',
    targetType: 'LISTENING_SEGMENT',
    targetId: 'listening-biz-meeting',
    isPinned: false,
    status: 'ACTIVE',
    createdAt: '2024-05-28T11:30:00Z',
    updatedAt: '2024-05-28T11:30:00Z',
  },
  {
    id: 'note-006',
    userId: 'user-001',
    title: 'Cách dùng although vs despite',
    content: 'Although + clause (có động từ)\nDespite + noun/gerund (V-ing)\n\nVí dụ:\n- Although it was raining, we went out.\n- Despite the rain, we went out.\n\nLưu ý: KHÔNG dùng "although despite" hay "despite although"',
    targetType: 'GRAMMAR',
    targetId: 'grammar-although-despite',
    isPinned: false,
    status: 'ACTIVE',
    createdAt: '2024-05-25T13:00:00Z',
    updatedAt: '2024-05-25T13:00:00Z',
  },
  {
    id: 'note-007',
    userId: 'user-001',
    title: 'Phân biệt affect và effect',
    content: 'AFFECT (động từ): ảnh hưởng đến\n- The weather affected my mood.\n\nEFFECT (danh từ): hiệu ứng, kết quả\n- The effect was immediate.\n\nMẹo: Affect = Action (hành động), Effect = End result (kết quả cuối cùng)',
    targetType: 'VOCABULARY',
    targetId: 'vocab-affect-effect',
    isPinned: false,
    status: 'ACTIVE',
    createdAt: '2024-05-20T10:00:00Z',
    updatedAt: '2024-05-20T10:00:00Z',
  },
  {
    id: 'note-008',
    userId: 'user-001',
    title: 'IELTS Writing Task 2 - Structure',
    content: '1. Introduction (2 sentences)\n   - Paraphrase question\n   - State your position\n\n2. Body Paragraph 1 (4-5 sentences)\n   - Topic sentence\n   - Explain + Example\n\n3. Body Paragraph 2 (4-5 sentences)\n   - Topic sentence\n   - Explain + Example\n\n4. Conclusion (2-3 sentences)\n   - Summarize + Restate position',
    targetType: 'WRITING_EXERCISE',
    targetId: 'writing-ielts-task2',
    isPinned: false,
    status: 'ACTIVE',
    createdAt: '2024-05-15T15:30:00Z',
    updatedAt: '2024-05-15T15:30:00Z',
  },
  {
    id: 'note-009',
    userId: 'user-001',
    title: 'Mẫu câu giao tiếp khen ngợi',
    content: 'Responding to compliments:\n- Thank you! That\'s very kind of you.\n- I\'m glad you think so!\n- Thanks, I\'ve been working hard on that.\n\nMaking compliments:\n- You did an amazing job!\n- That\'s really impressive!\n- I really admire your...',
    targetType: 'SPEAKING_EXERCISE',
    targetId: 'speaking-compliments',
    isPinned: false,
    status: 'ACTIVE',
    createdAt: '2024-05-10T09:45:00Z',
    updatedAt: '2024-05-10T09:45:00Z',
  },
  {
    id: 'note-010',
    userId: 'user-001',
    title: 'Quy tắc đọc bảng chữ cái tiếng Anh',
    content: 'Nguyên âm: A, E, I, O, U (đôi khi Y)\nPhụ âm: các chữ còn lại\n\nQuy tắc đọc:\n- Hai nguyên âm đứng cạnh nhau: đọc nguyên âm thứ nhất\n- e cuối: các nguyên âm trước đó đọc dài\n- e trong: biến chữ thành nguyên âm ngắn\n- Các tổ hợp: ea, oa, ai, ay đọc như trong bảng',
    targetType: 'IPA',
    targetId: 'ipa-alphabet',
    isPinned: false,
    status: 'ARCHIVED',
    createdAt: '2024-04-20T08:00:00Z',
    updatedAt: '2024-05-01T10:00:00Z',
  },
]

export function getNotesByTargetType(targetType: NoteTargetType): UserNote[] {
  return sampleNotes.filter(
    (note) => note.targetType === targetType && note.status === 'ACTIVE'
  )
}

export function getPinnedNotes(): UserNote[] {
  return sampleNotes.filter(
    (note) => note.isPinned && note.status === 'ACTIVE'
  )
}

export function getRecentNotes(limit: number = 5): UserNote[] {
  return sampleNotes
    .filter((note) => note.status === 'ACTIVE')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit)
}

export function searchNotes(query: string): UserNote[] {
  const lowerQuery = query.toLowerCase()
  return sampleNotes.filter(
    (note) =>
      note.status === 'ACTIVE' &&
      (note.title?.toLowerCase().includes(lowerQuery) ||
        note.content.toLowerCase().includes(lowerQuery))
  )
}
