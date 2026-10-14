// Trang quản lý sổ tay ghi chú bài giảng video khóa học của học viên.
'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Search, AlertCircle, BookOpen, ArrowRight } from 'lucide-react'
import { SectionHeading } from '@/features/dashboard/components/section.heading'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { Pagination } from '@/components/pagination'
import { Modal } from '@/components/modal'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useNavigate } from '@/lib/navigation'
import { toast } from '@/store/toast.store'
import { useMounted } from '@/hooks/use.mounted'
import type { UserCourseNoteItem } from '@/features/courses/services/course.service'
import { useMyNotesQuery, useDeleteCourseNoteMutation } from '@/features/notes/hooks/use.my.notes'
import { CourseNoteItemCard } from '@/features/notes/components/course.note.item.card'

const ITEMS_PER_PAGE = 9

export default function NotesAppPage() {
  const navigate = useNavigate()
  const isMounted = useMounted()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isAuthLoading = useAuthStore((state) => state.isLoading)

  useEffect(() => {
    if (isMounted && !isAuthLoading && !isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để xem sổ tay ghi chú khóa học!')
      navigate('/login?returnUrl=/notes')
    }
  }, [isMounted, isAuthLoading, isAuthenticated, navigate])

  const { data: notes = [], isLoading, isError, error } = useMyNotesQuery()
  const deleteMutation = useDeleteCourseNoteMutation()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [noteToDelete, setNoteToDelete] = useState<UserCourseNoteItem | null>(null)

  const courseFilters = useMemo(() => {
    const map = new Map<string, { id: string; title: string; count: number }>()
    for (const note of notes) {
      const cId = note.course_id || 'unknown'
      const existing = map.get(cId)
      if (existing) {
        existing.count += 1
      } else {
        map.set(cId, {
          id: cId,
          title: note.course_title || 'Khóa học',
          count: 1,
        })
      }
    }
    return Array.from(map.values())
  }, [notes])

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesCourse = selectedCourseId === 'ALL' || note.course_id === selectedCourseId
      const q = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !q ||
        (note.lesson_title && note.lesson_title.toLowerCase().includes(q)) ||
        (note.course_title && note.course_title.toLowerCase().includes(q)) ||
        (note.content && note.content.toLowerCase().includes(q))

      return matchesCourse && matchesSearch
    })
  }, [notes, selectedCourseId, searchQuery])

  const totalPages = Math.ceil(filteredNotes.length / ITEMS_PER_PAGE) || 1
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages)
  const paginatedNotes = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE
    return filteredNotes.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredNotes, safeCurrentPage])

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setCurrentPage(1)
  }

  const handleCourseFilterChange = (courseId: string) => {
    setSelectedCourseId(courseId)
    setCurrentPage(1)
  }

  const handleConfirmDelete = async () => {
    if (!noteToDelete?._id) return
    try {
      await deleteMutation.mutateAsync(noteToDelete._id)
      setNoteToDelete(null)
    } catch {
      return
    }
  }

  const showSkeleton = !isMounted || isAuthLoading || isLoading

  return (
    <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8 space-y-6">
      <SectionHeading
        eyebrow="Ghi chú bài học"
        title="Sổ tay ghi chú học tập"
        description="Tổng hợp toàn bộ ghi chú theo từng mốc thời gian bài giảng video trong các khóa học của bạn."
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface/80 p-3 sm:p-4 rounded-2xl border border-border/70 backdrop-blur-md">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Tìm kiếm nội dung ghi chú, tên bài học, khóa học..."
            className="pl-9 h-10 rounded-xl bg-surface border-border text-xs sm:text-sm focus-visible:ring-primary"
          />
        </div>

        {courseFilters.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full sm:max-w-md shrink-0">
            <button
              type="button"
              onClick={() => handleCourseFilterChange('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCourseId === 'ALL'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-subtle text-text-secondary hover:text-text-primary border border-border/60'
              }`}
            >
              Tất cả ({notes.length})
            </button>
            {courseFilters.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleCourseFilterChange(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer truncate max-w-[200px] ${
                  selectedCourseId === c.id
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-subtle text-text-secondary hover:text-text-primary border border-border/60'
                }`}
                title={c.title}
              >
                {c.title} ({c.count})
              </button>
            ))}
          </div>
        )}
      </div>

      {showSkeleton && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-52 rounded-2xl bg-surface/60 border border-border animate-pulse p-4 space-y-3">
              <div className="flex justify-between">
                <div className="h-5 w-28 bg-surface-subtle rounded-md" />
                <div className="h-5 w-14 bg-surface-subtle rounded-md" />
              </div>
              <div className="h-5 w-3/4 bg-surface-subtle rounded-md" />
              <div className="h-16 w-full bg-surface-subtle rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {!showSkeleton && isError && (
        <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-semibold">
            {error instanceof Error ? error.message : 'Không thể tải danh sách ghi chú khóa học. Vui lòng thử lại sau.'}
          </span>
        </div>
      )}

      {!showSkeleton && !isError && notes.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center rounded-3xl border border-dashed border-border bg-surface/50 backdrop-blur-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <BookOpen className="h-8 w-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-text-primary mb-2">Chưa có ghi chú bài học nào</h3>
          <p className="text-xs sm:text-sm text-text-secondary max-w-md mb-6 leading-relaxed">
            Trong quá trình học các khóa học, hãy sử dụng tính năng Ghi chú trong video bài giảng để lưu lại những điểm kiến thức quan trọng tại mốc thời gian đó nhé!
          </p>
          <Link href="/courses?tab=my-courses">
            <Button className="rounded-xl px-5 h-10 bg-primary hover:bg-primary/90 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-xs cursor-pointer">
              <span>Đến Khóa học của tôi</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {!showSkeleton && !isError && notes.length > 0 && filteredNotes.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-border bg-surface/50">
          <Search className="h-8 w-8 text-text-tertiary mb-2" />
          <h4 className="text-sm font-bold text-text-primary mb-1">Không tìm thấy ghi chú phù hợp</h4>
          <p className="text-xs text-text-tertiary">Vui lòng thử lại với từ khóa tìm kiếm hoặc chọn bộ lọc khóa học khác.</p>
        </div>
      )}

      {!showSkeleton && !isError && filteredNotes.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {paginatedNotes.map((note) => (
              <CourseNoteItemCard
                key={note._id}
                note={note}
                onDelete={(item) => setNoteToDelete(item)}
                isDeleting={deleteMutation.isPending && noteToDelete?._id === note._id}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center pt-4">
              <Pagination
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          )}
        </>
      )}

      <Modal
        open={Boolean(noteToDelete)}
        onClose={() => setNoteToDelete(null)}
        title="Xác nhận xóa ghi chú"
      >
        <div className="space-y-4 pt-1">
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Bạn có chắc chắn muốn xóa ghi chú tại bài học{' '}
            <strong className="text-text-primary">{noteToDelete?.lesson_title || 'này'}</strong> (mốc{' '}
            <span className="font-mono text-primary font-bold">{noteToDelete?.formatted_time || '00:00'}</span>)? Hành động này không thể hoàn tác.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setNoteToDelete(null)}
              disabled={deleteMutation.isPending}
              className="rounded-xl text-xs h-9"
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="rounded-xl text-xs h-9"
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  )
}
