'use client'

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SectionHeading } from '@/components/dashboard/SectionHeading'
import { Icon } from '@/components/icons/icon-map'
import { Pagination } from '@/components/common/Pagination'
import { sampleNotes } from '@/data/notes-data'
import type { UserNote, NoteTargetType, CreateNoteForm } from '@/types/notes'
import { NOTE_TARGET_LABELS, NOTE_TARGET_ICONS } from '@/types/notes'
import { NoteCard } from '@/components/notes/NoteCard'
import { NoteModal } from '@/components/notes/NoteModal'

const ITEMS_PER_PAGE = 9

export default function NotesAppPage() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [notes, setNotes] = useState<UserNote[]>(sampleNotes)
  const [selectedType, setSelectedType] = useState<NoteTargetType | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<UserNote | undefined>()

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
          note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesType && matchesSearch
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      })
  }, [notes, selectedType, searchQuery])

  const totalPages = Math.ceil(filteredNotes.length / ITEMS_PER_PAGE)
  const paginatedNotes = filteredNotes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleSaveNote = (data: CreateNoteForm & { id?: string; isPinned?: boolean }) => {
    if (data.id) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === data.id
            ? {
                ...n,
                ...data,
                updatedAt: new Date().toISOString(),
              }
            : n
        )
      )
    } else {
      const newNote: UserNote = {
        id: `note-${Date.now()}`,
        userId: 'user-001',
        title: data.title,
        content: data.content,
        targetType: data.targetType,
        targetId: data.targetId,
        isPinned: data.isPinned || false,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setNotes((prev) => [newNote, ...prev])
    }
  }

  const handleDeleteNote = (note: UserNote) => {
    if (window.confirm(isVietnamese ? 'Bạn có chắc muốn xóa ghi chú này?' : 'Are you sure you want to delete this note?')) {
      setNotes((prev) => prev.filter((n) => n.id !== note.id))
    }
  }

  const handleTogglePin = (note: UserNote) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === note.id
          ? { ...n, isPinned: !n.isPinned, updatedAt: new Date().toISOString() }
          : n
      )
    )
  }

  return (
    <Layout>
      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <SectionHeading
            eyebrow={t('notes.title') || 'Sổ tay'}
            title={isVietnamese ? 'Ghi chú học tập' : 'Study Notes'}
            description={
              isVietnamese
                ? 'Lưu lại các điểm ngữ pháp, từ vựng và lưu ý quan trọng'
                : 'Save important grammar points, vocabulary, and notes'
            }
          />
          <Button
            onClick={() => {
              setEditingNote(undefined)
              setIsModalOpen(true)
            }}
            className="bg-primary hover:bg-primary-hover w-fit"
          >
            <Icon name="plus" size={16} />
            {isVietnamese ? 'Tạo ghi chú mới' : 'Create Note'}
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
              size={18}
            />
            <Input
              placeholder={isVietnamese ? 'Tìm kiếm ghi chú...' : 'Search notes...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-surface-subtle border-0"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {targetTypes.map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedType(type)
                  setCurrentPage(1)
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedType === type
                    ? 'bg-primary text-white'
                    : 'bg-surface-subtle text-text-secondary hover:bg-surface-hover'
                }`}
              >
                {type !== 'ALL' && <Icon name={NOTE_TARGET_ICONS[type]} size={14} />}
                {type === 'ALL' ? (isVietnamese ? 'Tất cả' : 'All') : NOTE_TARGET_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        {paginatedNotes.length === 0 ? (
          <Card className="dashboard-card">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Icon name="file-text" size={48} className="text-text-tertiary mb-3" />
              <h3 className="text-base font-medium text-text-primary mb-1">
                {isVietnamese ? 'Chưa có ghi chú nào' : 'No notes found'}
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                {isVietnamese
                  ? 'Hãy tạo ghi chú đầu tiên để lưu lại kiến thức quan trọng'
                  : 'Create your first note to save important points'}
              </p>
              <Button
                onClick={() => {
                  setEditingNote(undefined)
                  setIsModalOpen(true)
                }}
              >
                <Icon name="plus" size={16} />
                {isVietnamese ? 'Tạo ghi chú' : 'Create Note'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={(n) => {
                    setEditingNote(n)
                    setIsModalOpen(true)
                  }}
                  onDelete={handleDeleteNote}
                  onTogglePin={handleTogglePin}
                  isVietnamese={isVietnamese}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}

        {isModalOpen && (
          <NoteModal
            note={editingNote}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveNote}
            isVietnamese={isVietnamese}
          />
        )}
      </main>
    </Layout>
  )
}
