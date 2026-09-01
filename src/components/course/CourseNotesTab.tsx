'use client'

/**
 * @file CourseNotesTab.tsx
 * @description Component giao diện React CourseNotesTab cho học viên
 */

import { useState } from 'react'
import { Plus, Play, Trash2, Clock, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { NoteItem } from '@/types/course'

interface CourseNotesTabProps {
  notesList: NoteItem[]
  currentLessonId?: string
  currentLessonTitle?: string
  currentTime?: number
  onSeekTo?: (timeInSeconds: number) => void
}

export function CourseNotesTab({
  notesList: initialNotes,
  currentLessonId = 'l-01-01',
  currentLessonTitle = 'Bài học hiện tại',
  currentTime = 0,
  onSeekTo,
}: CourseNotesTabProps) {
  const [notes, setNotes] = useState<NoteItem[]>(initialNotes)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60)
    const secs = Math.floor(sec % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNoteContent.trim()) return

    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      lessonId: currentLessonId,
      lessonTitle: currentLessonTitle,
      timestamp: Math.floor(currentTime),
      formattedTime: formatSeconds(currentTime),
      content: newNoteContent,
      createdAt: 'Vừa xong',
    }

    setNotes([newNote, ...notes])
    setNewNoteContent('')
    setIsAdding(false)
  }

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="space-y-6 pt-2">
      {/* Add note bar */}
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        {isAdding ? (
          <form onSubmit={handleAddNote} className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary-soft px-2.5 py-1 text-primary font-bold">
                <Clock size={12} />
                Ghi chú tại mốc {formatSeconds(currentTime)}
              </span>
              <span className="text-[11px] text-text-tertiary truncate max-w-[250px]">{currentLessonTitle}</span>
            </div>
            <textarea
              autoFocus
              rows={3}
              placeholder="Nhập nội dung ghi chú quan trọng từ bài giảng..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAdding(false)}
                className="text-xs text-text-secondary"
              >
                Hủy
              </Button>
              <Button type="submit" className="bg-primary text-white hover:bg-primary-hover text-xs rounded-xl px-5">
                Lưu ghi chú
              </Button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex w-full items-center justify-between rounded-xl border border-dashed border-border px-4 py-3 text-xs font-semibold text-text-secondary hover:border-primary hover:text-primary transition-all group"
          >
            <span className="flex items-center gap-2">
              <Plus size={16} className="text-primary group-hover:scale-110 transition-transform" />
              Tạo ghi chú mới tại mốc thời gian {formatSeconds(currentTime)}...
            </span>
            <span className="rounded-lg bg-surface-subtle px-2 py-0.5 text-[10px] text-text-tertiary">
              Phím tắt: N
            </span>
          </button>
        )}
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <div className="py-12 text-center text-sm text-text-tertiary space-y-2">
            <FileText className="mx-auto text-text-disabled" size={32} />
            <p>Bạn chưa có ghi chú nào cho khóa học này.</p>
            <p className="text-xs text-text-disabled">Bấm vào nút trên để lưu lại kiến thức quan trọng khi đang xem video.</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="group rounded-2xl border border-border bg-surface p-4 transition-all hover:border-primary/40 hover:shadow-sm space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => onSeekTo && onSeekTo(note.timestamp)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary-soft/80 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  <Play size={11} fill="currentColor" />
                  {note.formattedTime}
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-text-tertiary">{note.createdAt}</span>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-text-tertiary hover:text-destructive transition-colors p-1 opacity-0 group-hover:opacity-100"
                    title="Xóa ghi chú"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="text-xs font-medium text-text-tertiary truncate">
                {note.lessonTitle}
              </div>

              <p className="text-xs text-text-primary font-normal leading-relaxed whitespace-pre-wrap">
                {note.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
