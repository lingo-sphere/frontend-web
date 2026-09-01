'use client'

/**
 * @file CourseNotesTab.tsx
 * @description Component giao diện Ghi chú bài học liên kết trực tiếp cơ sở dữ liệu
 */

import { useState, useEffect } from 'react'
import { Plus, Play, Trash2, Clock, FileText, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { NoteItem } from '@/types/course'

interface CourseNotesTabProps {
  notesList: NoteItem[]
  currentLessonId?: string
  currentLessonTitle?: string
  currentTime?: number
  onSeekTo?: (timeInSeconds: number) => void
  onAddNote?: (content: string, timestamp: number, formattedTime: string) => Promise<void> | void
  onDeleteNote?: (noteId: string) => Promise<void> | void
}

export function CourseNotesTab({
  notesList,
  currentLessonId = 'l-01-01',
  currentLessonTitle = 'Bài học hiện tại',
  currentTime = 0,
  onSeekTo,
  onAddNote,
  onDeleteNote,
}: CourseNotesTabProps) {
  const [notes, setNotes] = useState<NoteItem[]>(notesList)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setNotes(notesList)
  }, [notesList])

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60)
    const secs = Math.floor(sec % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNoteContent.trim() || isSubmitting) return

    const time = Math.floor(currentTime)
    const formatted = formatSeconds(time)
    const content = newNoteContent.trim()

    setIsSubmitting(true)
    try {
      if (onAddNote) {
        await onAddNote(content, time, formatted)
      } else {
        const newNote: NoteItem = {
          id: `note-${Date.now()}`,
          lessonId: currentLessonId,
          lessonTitle: currentLessonTitle,
          timestamp: time,
          formattedTime: formatted,
          content,
          createdAt: 'Vừa xong',
        }
        setNotes((prev) => [newNote, ...prev])
      }
      setNewNoteContent('')
      setIsAdding(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteNoteClick = async (id: string) => {
    if (onDeleteNote) {
      await onDeleteNote(id)
    }
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="space-y-6 pt-2 animate-in fade-in duration-150">
      {/* Add note bar */}
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        {isAdding ? (
          <form onSubmit={handleAddNoteSubmit} className="space-y-3">
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
              placeholder="Nhập nội dung ghi chú bài học (sẽ được lưu tự động vào tài khoản của bạn)..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAdding(false)}
                className="text-xs text-text-secondary cursor-pointer"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !newNoteContent.trim()}
                className="bg-primary text-white hover:bg-primary-hover text-xs rounded-xl px-5 cursor-pointer font-bold"
              >
                {isSubmitting ? 'Đang lưu...' : 'Lưu ghi chú vào Database'}
              </Button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex w-full items-center justify-between rounded-xl border border-dashed border-border px-4 py-3 text-xs font-semibold text-text-secondary hover:border-primary hover:text-primary transition-all group cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Plus size={14} />
              </span>
              <span>Tạo ghi chú mới tại mốc {formatSeconds(currentTime)}</span>
            </span>
            <span className="text-[11px] text-text-tertiary font-normal">Nhấn để nhập ghi chú</span>
          </button>
        )}
      </div>

      {/* Notes list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-text-primary">
          <span>Danh sách ghi chú của bạn ({notes.length})</span>
          <span className="text-[11px] text-text-tertiary font-normal">Sắp xếp theo dòng thời gian</span>
        </div>

        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-border p-6 bg-surface-subtle/30 space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-subtle text-text-tertiary">
              <FileText size={24} />
            </div>
            <div className="text-xs font-bold text-text-primary">Chưa có ghi chú nào</div>
            <p className="text-[11px] text-text-secondary max-w-xs leading-relaxed">
              Bạn có thể ghi lại các điểm kiến thức trọng tâm hoặc từ vựng cần nhớ tại bất kỳ mốc thời gian nào trong video.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {notes.map((note) => (
              <div
                key={note.id}
                className="flex items-start justify-between gap-3 p-4 rounded-2xl border border-border bg-surface hover:border-primary/40 transition-all group shadow-xs"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSeekTo?.(note.timestamp)}
                      className="inline-flex items-center gap-1 rounded-md bg-primary-soft/80 hover:bg-primary hover:text-white transition-colors px-2 py-0.5 text-[11px] font-bold text-primary cursor-pointer shrink-0"
                      title="Nhảy tới mốc thời gian này trong video"
                    >
                      <Play size={10} fill="currentColor" />
                      <span>{note.formattedTime}</span>
                    </button>
                    <span className="text-xs font-bold text-text-primary truncate">
                      {note.lessonTitle || currentLessonTitle}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed pl-0.5">
                    {note.content}
                  </p>
                  <div className="text-[10px] text-text-tertiary pl-0.5 pt-0.5">
                    {note.createdAt}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteNoteClick(note.id)}
                  className="p-1.5 rounded-lg text-text-tertiary hover:text-rose-500 hover:bg-rose-500/10 transition-colors opacity-80 group-hover:opacity-100 cursor-pointer shrink-0"
                  title="Xóa ghi chú này"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
