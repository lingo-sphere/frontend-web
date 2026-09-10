// Component giao diện NoteCard cho học viên
import { Icon } from '@/components/icon.map'
import type { UserNote } from '@/features/notes/types/notes'
import { NOTE_TARGET_LABELS } from '@/features/notes/types/notes'
import { formatDate, truncateText } from '@/lib/format'

interface NoteCardProps {
  note: UserNote
  onEdit: (note: UserNote) => void
  onDelete: (note: UserNote) => void
  onTogglePin: (note: UserNote) => void
  isVietnamese: boolean
}

export function NoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  isVietnamese,
}: NoteCardProps) {

  return (
    <div
      className={`bg-surface-subtle rounded-xl p-4 transition-all hover:shadow-md cursor-pointer group ${
        note.isPinned ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onEdit(note)}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs px-2 py-0.5 bg-primary-10 text-primary rounded-full shrink-0">
            {NOTE_TARGET_LABELS[note.targetType]}
          </span>
          {note.isPinned && (
            <Icon name="pin" size={12} className="text-primary shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onTogglePin(note)
            }}
            className="p-1 hover:bg-surface rounded"
            title="Ghim ghi chú"
          >
            <Icon
              name="pin"
              size={14}
              className={note.isPinned ? 'text-primary' : 'text-text-tertiary'}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(note)
            }}
            className="p-1 hover:bg-surface rounded text-text-tertiary hover:text-error"
            title="Xóa ghi chú"
          >
            <Icon name="trash-2" size={14} />
          </button>
        </div>
      </div>

      {note.title && (
        <h4 className="font-medium text-text-primary mb-1 line-clamp-1">
          {note.title}
        </h4>
      )}
      <p className="text-sm text-text-secondary line-clamp-3 whitespace-pre-wrap">
        {truncateText(note.content, 120)}
      </p>
      <div className="flex items-center justify-between mt-3 text-xs text-text-tertiary">
        <span>{formatDate(note.updatedAt, isVietnamese, { day: '2-digit', month: 'short' })}</span>
      </div>
    </div>
  )
}
