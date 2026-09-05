/**
 * @file page.tsx
 * @description Trang giao diện người dùng (Next.js App Router) cho tuyến (portal)/notes
 */

'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SectionHeading } from '@/components/dashboard/section.heading'
import { Icon } from '@/components/icons/icon.map'
import { Pagination } from '@/components/common/pagination'
import type { UserNote, NoteTargetType, CreateNoteForm } from '@/types/notes'
import { NOTE_TARGET_LABELS, NOTE_TARGET_ICONS } from '@/types/notes'
import { NoteCard } from '@/components/notes/note.card'
import { NoteModal } from '@/components/notes/note.modal'

const ITEMS_PER_PAGE = 9

export default function NotesAppPage() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [notes, setNotes] = useState<UserNote[]>([])
  const [selectedType, setSelectedType] = useState<NoteTargetType | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<UserNote | undefined>()

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lingosphere_user_notes')
      if (saved) {
        setNotes(JSON.parse(saved))
      }
    } catch {

    }
  }, [])

  const saveNotes = (updated: UserNote[]) => {
    setNotes(updated)
    try {
      localStorage.setItem('lingosphere_user_notes', JSON.stringify(updated))
    } catch {

    }
  }

  const targetTypes: (NoteTargetType | 'ALL')[] = [
    'ALL',
    'VOCABULARY',
    'GRAMMAR',
    'IPA',
    'PRACTICE_QUESTION',
    'LISTENING_SEGMENT',
    'SPEAKING_EXERCISE',
    'WRITING_EXERCISE',
  ]

  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        const matchesType = selectedType === 'ALL' || note.targetType === selectedType
        const matchesSearch =
          searchQuery === '' ||
          (note.title && note.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesType && matchesSearch
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      })
  }, [notes, selectedType, searchQuery])

  const totalPages = Math.ceil(filteredNotes.length / ITEMS_PER_PAGE) || 1
  const paginatedNotes = filteredNotes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleSaveNote = (formData: CreateNoteForm & { id?: string; isPinned?: boolean }) => {
    if (editingNote) {
      const updated = notes.map((n) =>
        n.id === editingNote.id
          ? {
              ...n,
              title: formData.title,
              content: formData.content,
              targetType: formData.targetType,
              targetId: formData.targetId,
              isPinned: formData.isPinned ?? n.isPinned,
              updatedAt: new Date().toISOString(),
            }
          : n
      )
      saveNotes(updated)
    } else {
      const newNote: UserNote = {
        id: `note-${Date.now()}`,
        userId: 'current_user',
        title: formData.title,
        content: formData.content,
        targetType: formData.targetType,
        targetId: formData.targetId || 'general',
        isPinned: formData.isPinned || false,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      saveNotes([newNote, ...notes])
    }
    setEditingNote(undefined)
    setIsModalOpen(false)
  }

  const handleDeleteNote = (note: UserNote) => {
    saveNotes(notes.filter((n) => n.id !== note.id))
  }

  const handleTogglePin = (note: UserNote) => {
    const updated = notes.map((n) =>
      n.id === note.id ? { ...n, isPinned: !n.isPinned, updatedAt: new Date().toISOString() } : n
    )
    saveNotes(updated)
  }

  const handleOpenEdit = (note: UserNote) => {
    setEditingNote(note)
    setIsModalOpen(true)
  }

  return (
    <>
      <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeading
            eyebrow={t('dashboard.notes') || 'Ghi chú'}
            title={isVietnamese ? 'Sổ tay ghi chú học tập' : 'Learning Notes'}
            description={
              isVietnamese
                ? 'Lưu lại các điểm ngữ pháp, cấu trúc và kinh nghiệm làm bài thi'
                : 'Save grammar points, structures and exam tips'
            }
          />
          <Button
            onClick={() => {
              setEditingNote(undefined)
              setIsModalOpen(true)
            }}
            className="gap-2 bg-primary hover:bg-primary-hover"
          >
            <Icon name="plus" size={16} />
            {isVietnamese ? 'Tạo ghi chú mới' : 'Create Note'}
          </Button>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Input
              type="text"
              placeholder={isVietnamese ? 'Tìm kiếm ghi chú...' : 'Search notes...'}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10"
            />
            <Icon
              name="search"
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {targetTypes.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedType(type)
                  setCurrentPage(1)
                }}
                className="gap-1.5"
              >
                {type !== 'ALL' && <Icon name={NOTE_TARGET_ICONS[type]} size={14} />}
                {type === 'ALL'
                  ? isVietnamese
                    ? 'Tất cả'
                    : 'All'
                  : NOTE_TARGET_LABELS[type]}
              </Button>
            ))}
          </div>
        </div>

        {paginatedNotes.length > 0 ? (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleOpenEdit}
                  onDelete={handleDeleteNote}
                  onTogglePin={handleTogglePin}
                  isVietnamese={isVietnamese}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
            <Icon name="file-text" size={48} className="mb-3 text-text-tertiary" />
            <h3 className="text-lg font-semibold text-text-primary">
              {isVietnamese ? 'Chưa có ghi chú nào' : 'No notes yet'}
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              {isVietnamese
                ? 'Tạo ghi chú đầu tiên để ghi lại kiến thức cần nhớ'
                : 'Create your first note to capture important insights'}
            </p>
            <Button
              onClick={() => {
                setEditingNote(undefined)
                setIsModalOpen(true)
              }}
              className="mt-4 gap-2 bg-primary hover:bg-primary-hover"
            >
              <Icon name="plus" size={16} />
              {isVietnamese ? 'Tạo ghi chú' : 'Create Note'}
            </Button>
          </div>
        )}

        {isModalOpen && (
          <NoteModal
            note={editingNote}
            onClose={() => {
              setIsModalOpen(false)
              setEditingNote(undefined)
            }}
            onSave={handleSaveNote}
            isVietnamese={isVietnamese}
          />
        )}
      </main>
    </>
  )
}
