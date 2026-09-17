// Định nghĩa kiểu dữ liệu TypeScript cho ghi chú học viên.

export interface UserNote {
  id: string
  userId: string
  title?: string
  content: string
  targetType: NoteTargetType
  targetId: string
  isPinned: boolean
  status: NoteStatus
  createdAt: string
  updatedAt: string
}

export type NoteTargetType =
  | 'VOCABULARY'
  | 'GRAMMAR'
  | 'IPA'
  | 'PRACTICE_QUESTION'
  | 'LISTENING_SEGMENT'
  | 'SPEAKING_EXERCISE'
  | 'WRITING_EXERCISE'

export type NoteStatus = 'ACTIVE' | 'ARCHIVED' | 'DELETED'

export interface CreateNoteForm {
  title: string
  content: string
  targetType: NoteTargetType
  targetId: string
  isPinned?: boolean
}

export interface UpdateNoteForm {
  title?: string
  content?: string
  isPinned?: boolean
  status?: NoteStatus
}

export const NOTE_TARGET_LABELS: Record<NoteTargetType, string> = {
  VOCABULARY: 'Từ vựng',
  GRAMMAR: 'Ngữ pháp',
  IPA: 'IPA',
  PRACTICE_QUESTION: 'Câu hỏi luyện tập',
  LISTENING_SEGMENT: 'Đoạn nghe',
  SPEAKING_EXERCISE: 'Bài luyện nói',
  WRITING_EXERCISE: 'Bài luyện viết',
}

export const NOTE_TARGET_LABELS_EN: Record<NoteTargetType, string> = {
  VOCABULARY: 'Vocabulary',
  GRAMMAR: 'Grammar',
  IPA: 'IPA',
  PRACTICE_QUESTION: 'Practice Question',
  LISTENING_SEGMENT: 'Listening Segment',
  SPEAKING_EXERCISE: 'Speaking Exercise',
  WRITING_EXERCISE: 'Writing Exercise',
}

export function getNoteTargetLabel(type: NoteTargetType, isVietnamese: boolean): string {
  return isVietnamese ? NOTE_TARGET_LABELS[type] : NOTE_TARGET_LABELS_EN[type]
}

export const NOTE_TARGET_ICONS: Record<NoteTargetType, string> = {
  VOCABULARY: 'book',
  GRAMMAR: 'bookCheck',
  IPA: 'type',
  PRACTICE_QUESTION: 'helpCircle',
  LISTENING_SEGMENT: 'headphones',
  SPEAKING_EXERCISE: 'mic',
  WRITING_EXERCISE: 'penTool',
}
