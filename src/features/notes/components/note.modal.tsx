/**
 * @file note.modal.tsx
 * @description Component giao diện React NoteModal cho học viên
 */

import { useState } from 'react'
import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Icon } from '@/components/icon.map'
import type { UserNote, NoteTargetType, CreateNoteForm } from '@/features/notes/types/notes'
import { NOTE_TARGET_LABELS, NOTE_TARGET_ICONS } from '@/features/notes/types/notes'

interface NoteModalProps {
  note?: UserNote
  onClose: () => void
  onSave: (data: CreateNoteForm & { id?: string; isPinned?: boolean }) => void
  isVietnamese: boolean
}

export function NoteModal({
  note,
  onClose,
  onSave,
  isVietnamese,
}: NoteModalProps) {
  const [form, setForm] = useState<CreateNoteForm>({
    title: note?.title || '',
    content: note?.content || '',
    targetType: note?.targetType || 'VOCABULARY',
    targetId: note?.targetId || '',
    isPinned: note?.isPinned || false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const targetTypes: NoteTargetType[] = [
    'VOCABULARY',
    'GRAMMAR',
    'IPA',
    'PRACTICE_QUESTION',
    'LISTENING_SEGMENT',
    'SPEAKING_EXERCISE',
    'WRITING_EXERCISE',
  ]

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.content.trim()) {
      newErrors.content = isVietnamese
        ? 'Nội dung không được để trống'
        : 'Content cannot be empty'
    }
    if (!form.targetId.trim()) {
      newErrors.targetId = isVietnamese
        ? 'ID mục tiêu không được để trống'
        : 'Target ID cannot be empty'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSave({
      ...form,
      id: note?.id,
      isPinned: form.isPinned,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">
              {note
                ? isVietnamese
                  ? 'Chỉnh sửa ghi chú'
                  : 'Edit Note'
                : isVietnamese
                  ? 'Tạo ghi chú mới'
                  : 'Create New Note'}
            </h3>
            <button
              onClick={onClose}
              className="text-text-tertiary hover:text-text-primary"
            >
              <Icon name="x" size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {isVietnamese ? 'Tiêu đề (tùy chọn)' : 'Title (optional)'}
              </label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={
                  isVietnamese ? 'Nhập tiêu đề ghi chú' : 'Enter note title'
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {isVietnamese ? 'Nội dung' : 'Content'}{' '}
                <span className="text-error">*</span>
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder={
                  isVietnamese
                    ? 'Nhập nội dung ghi chú...'
                    : 'Enter note content...'
                }
                rows={6}
                className={`w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  errors.content ? 'border-error' : 'border-surface-subtle'
                }`}
              />
              {errors.content && (
                <p className="text-xs text-error mt-1">{errors.content}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {isVietnamese ? 'Loại mục tiêu' : 'Target Type'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {targetTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setForm({ ...form, targetType: type })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      form.targetType === type
                        ? 'bg-primary text-white'
                        : 'bg-surface-subtle text-text-secondary hover:bg-surface'
                    }`}
                  >
                    <Icon name={NOTE_TARGET_ICONS[type]} size={14} />
                    {NOTE_TARGET_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {isVietnamese ? 'ID mục tiêu' : 'Target ID'}{' '}
                <span className="text-error">*</span>
              </label>
              <Input
                value={form.targetId}
                onChange={(e) => setForm({ ...form, targetId: e.target.value })}
                placeholder={
                  isVietnamese
                    ? 'Nhập ID của mục tiêu (VD: vocab-001)'
                    : 'Enter target ID (e.g., vocab-001)'
                }
                className={errors.targetId ? 'border-error' : ''}
              />
              {errors.targetId && (
                <p className="text-xs text-error mt-1">{errors.targetId}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setForm({ ...form, isPinned: !form.isPinned })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  form.isPinned ? 'bg-primary' : 'bg-surface-subtle'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    form.isPinned ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
              <span className="text-sm text-text-secondary">
                {isVietnamese
                  ? 'Ghim ghi chú này lên đầu'
                  : 'Pin this note to top'}
              </span>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={onClose} className="flex-1">
              {isVietnamese ? 'Hủy' : 'Cancel'}
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              {note
                ? isVietnamese
                  ? 'Lưu thay đổi'
                  : 'Save changes'
                : isVietnamese
                  ? 'Tạo ghi chú'
                  : 'Create Note'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
