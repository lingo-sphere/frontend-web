// Quản lý hiển thị toàn bộ đề lý thuyết, bài tập luyện tập và tài liệu khóa học trong thanh bên.

'use client'

import { useState, useMemo } from 'react'
import {
  FileText,
  Download,
  ExternalLink,
  BookOpen,
  HelpCircle,
  Search,
  FolderDown,
  Volume2,
  CheckCircle2,
  Folder,
  Lock,
} from 'lucide-react'
import type { Course, Chapter, Lesson } from '@/features/courses/types/course'
import { toast } from '@/store/toast.store'

interface CourseSidebarDocumentsProps {
  course: Course
  currentLesson: Lesson | null
  isEnrolled: boolean
  lockedChapterIds?: Set<string>
  onSelectLesson: (chapter: Chapter, lesson: Lesson) => void
  onOpenPracticeQuiz?: (chapter: Chapter, lesson: Lesson) => void
  onOpenCheckout?: () => void
}

type DocFilterType = 'all' | 'theory' | 'quiz' | 'general'

export function CourseSidebarDocuments({
  course,
  currentLesson,
  isEnrolled,
  lockedChapterIds,
  onSelectLesson,
  onOpenPracticeQuiz,
  onOpenCheckout,
}: CourseSidebarDocumentsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<DocFilterType>('all')

  const handleDownload = (url: string, fileName?: string, isFreeAllowed?: boolean) => {
    if (!isEnrolled && !isFreeAllowed) {
      toast.warning('Vui lòng đăng ký khóa học để tải tài liệu!', 'Yêu cầu mở khóa')
      onOpenCheckout?.()
      return
    }
    const a = document.createElement('a')
    a.href = url
    a.download = fileName || 'tai-lieu-khoa-hoc'
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const currentChapter = useMemo(() => {
    if (!currentLesson) return null
    return course.chapters.find((c) => c.lessons.some((l) => l.id === currentLesson.id)) || null
  }, [course, currentLesson])

  const filteredChapters = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return course.chapters
      .map((ch) => {
        const matchesChapter = !q || ch.title.toLowerCase().includes(q)

        const filteredLessons = ch.lessons.filter((les) => {
          const hasTheory = Boolean(les.theory_file_url)
          const hasQuiz = Array.isArray(les.questions) && les.questions.length > 0
          const hasResources = Array.isArray(les.resources) && les.resources.length > 0

          if (filterType === 'theory' && !hasTheory) return false
          if (filterType === 'quiz' && !hasQuiz) return false
          if (filterType === 'general' && !hasResources) return false

          if (q) {
            const matchesTitle = les.title.toLowerCase().includes(q)
            const matchesTheoryName = (les.theory_file_name || '').toLowerCase().includes(q)
            const matchesResourceName = (les.resources || []).some((r) => r.title.toLowerCase().includes(q))
            return matchesTitle || matchesTheoryName || matchesResourceName
          }

          return hasTheory || hasQuiz || hasResources
        })

        const showChapter =
          filteredLessons.length > 0 ||
          (matchesChapter &&
            (filterType === 'all' || (filterType === 'theory' && Boolean(ch.theory_file_url))))

        return {
          chapter: ch,
          lessons: filteredLessons,
          isVisible: showChapter,
        }
      })
      .filter((item) => item.isVisible)
  }, [course.chapters, searchQuery, filterType])

  return (
    <div className="flex-1 overflow-y-auto flex flex-col divide-y divide-border/60 bg-surface">
      <div className="p-4 space-y-3 bg-surface-subtle/30 sticky top-0 z-10 backdrop-blur-md border-b border-border">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Tìm đề lý thuyết, bài tập, tài liệu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-text-tertiary"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setFilterType('theory')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
              filterType === 'theory'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            <FileText size={11} />
            <span>Đề lý thuyết PDF</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('quiz')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
              filterType === 'quiz'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            <HelpCircle size={11} />
            <span>Bài tập trắc nghiệm</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('general')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
              filterType === 'general'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            <FolderDown size={11} />
            <span>Tài liệu đính kèm</span>
          </button>
        </div>
      </div>

      {currentLesson && (
        <div className="p-4 bg-primary/5 border-b border-primary/20 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary">
                Tài liệu video đang xem
              </span>
            </div>
            <span className="text-[10px] font-bold text-text-tertiary">
              Bài {currentLesson.order || 1}
            </span>
          </div>

          <h4 className="text-xs font-bold text-text-primary line-clamp-1">
            {currentLesson.title}
          </h4>

          <div className="grid gap-2">
            {currentLesson.theory_file_url ? (
              <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-900 dark:text-blue-200 flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileText size={15} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">
                      {currentLesson.theory_file_name || 'Đề lý thuyết & Tóm tắt bài học (PDF)'}
                    </div>
                    <div className="text-[10.5px] text-blue-700 dark:text-blue-300 opacity-90">
                      Tài liệu lý thuyết chính thức
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={currentLesson.theory_file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-800 text-blue-700 dark:text-blue-300 hover:bg-white shadow-2xs cursor-pointer"
                    title="Mở xem trực tiếp"
                  >
                    <ExternalLink size={13} />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDownload(currentLesson.theory_file_url!, currentLesson.theory_file_name, Boolean(currentLesson.is_free_preview))}
                    className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-2xs cursor-pointer"
                    title="Tải về máy"
                  >
                    <Download size={13} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-text-tertiary italic p-2 rounded-lg bg-surface border border-border/60">
                Video này chưa đính kèm file đề lý thuyết riêng.
              </div>
            )}

            {Array.isArray(currentLesson.questions) && currentLesson.questions.length > 0 ? (
              <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <HelpCircle size={15} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">
                      Đề bài luyện tập củng cố
                    </div>
                    <div className="text-[10.5px] text-emerald-700 dark:text-emerald-300 opacity-90">
                      Gồm {currentLesson.questions.length} câu trắc nghiệm ôn tập
                    </div>
                  </div>
                </div>
                {currentChapter && (
                  <button
                    type="button"
                    onClick={() => onOpenPracticeQuiz?.(currentChapter, currentLesson)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <BookOpen size={12} />
                    <span>Làm ngay</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="text-[11px] text-text-tertiary italic p-2 rounded-lg bg-surface border border-border/60">
                Video này chưa có bộ câu hỏi trắc nghiệm ôn tập.
              </div>
            )}
          </div>
        </div>
      )}

      {course.document_url && (filterType === 'all' || filterType === 'general') && (
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            <Folder size={12} />
            <span>Giáo trình & Tài liệu toàn khóa học</span>
          </div>
          <div className="p-3 rounded-xl border border-border bg-surface hover:border-purple-400 transition-all flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileText size={15} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate text-text-primary">
                  {course.document_name || 'Giáo trình cẩm nang khóa học'}
                </div>
                <div className="text-[10.5px] text-text-secondary">
                  Tài liệu tổng quan dùng chung
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={course.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-surface border border-border text-text-secondary hover:text-text-primary cursor-pointer"
                title="Mở xem trực tiếp"
              >
                <ExternalLink size={13} />
              </a>
              <button
                type="button"
                onClick={() => handleDownload(course.document_url!, course.document_name, true)}
                className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-2xs cursor-pointer"
                title="Tải về máy"
              >
                <Download size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-text-primary">
            Tài liệu theo từng chương & bài giảng
          </span>
          <span className="text-[11px] text-text-tertiary font-bold">
            {filteredChapters.length} chương
          </span>
        </div>

        {filteredChapters.length === 0 ? (
          <div className="py-8 text-center text-text-tertiary text-xs space-y-2">
            <Search size={24} className="mx-auto opacity-40" />
            <p>Không tìm thấy tài liệu phù hợp với bộ lọc hiện tại.</p>
          </div>
        ) : (
          filteredChapters.map(({ chapter: ch, lessons: lesList }) => {
            const isChapterLocked = lockedChapterIds ? lockedChapterIds.has(ch.id) : false

            return (
              <div
                key={ch.id}
                className={`rounded-2xl border transition-all p-3.5 space-y-3 ${
                  isChapterLocked
                    ? 'border-border/60 bg-slate-100/80 dark:bg-slate-900/60'
                    : 'border-border/80 bg-surface-subtle/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`px-2 py-0.5 rounded-md font-black text-[10px] shrink-0 ${
                        isChapterLocked
                          ? 'bg-slate-200/90 dark:bg-slate-800 text-text-tertiary'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      Chương {ch.order || 1}
                    </span>
                    <h5
                      className={`font-bold text-xs truncate ${
                        isChapterLocked ? 'text-text-secondary' : 'text-text-primary'
                      }`}
                    >
                      {ch.title}
                    </h5>
                  </div>
                  {isChapterLocked && (
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[10px] font-extrabold flex items-center gap-1 shrink-0">
                      <Lock size={10} />
                      Đang khóa
                    </span>
                  )}
                </div>

                {ch.theory_file_url && (filterType === 'all' || filterType === 'theory') && (
                  isChapterLocked ? (
                    <div className="p-2.5 rounded-xl border border-border/60 bg-slate-200/40 dark:bg-slate-800/40 flex items-center justify-between gap-2 text-xs opacity-75">
                      <div className="flex items-center gap-2 min-w-0">
                        <Lock size={13} className="text-text-tertiary shrink-0" />
                        <span className="truncate text-[11px] font-bold text-text-secondary">
                          {ch.theory_file_name || `Lý thuyết tổng quan: Chương ${ch.order || 1}`}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-text-tertiary px-1.5 py-0.5 rounded bg-surface border border-border/40">
                        Đang khóa
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={13} className="text-blue-600 shrink-0" />
                        <span className="truncate text-[11px] font-bold text-blue-900 dark:text-blue-200">
                          {ch.theory_file_name || `Lý thuyết tổng quan: Chương ${ch.order || 1}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <a
                          href={ch.theory_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-blue-600 hover:text-blue-700"
                          title="Mở xem"
                        >
                          <ExternalLink size={12} />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDownload(ch.theory_file_url!, ch.theory_file_name)}
                          className="p-1 text-blue-600 hover:text-blue-700"
                          title="Tải về"
                        >
                          <Download size={12} />
                        </button>
                      </div>
                    </div>
                  )
                )}

                {ch.audio_url && (filterType === 'all' || filterType === 'general') && (
                  <div className="p-2.5 rounded-xl border border-border bg-surface flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Volume2 size={13} className="text-primary shrink-0" />
                      <span className="truncate text-[11px] font-medium text-text-primary">
                        Audio bài nghe Chương {ch.order || 1}
                      </span>
                    </div>
                    <a
                      href={ch.audio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-primary hover:text-primary-focus"
                      title="Mở nghe"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  {lesList.map((les) => {
                    const hasTheory = Boolean(les.theory_file_url)
                    const hasQuiz = Array.isArray(les.questions) && les.questions.length > 0
                    const isCurrent = currentLesson?.id === les.id

                    return (
                      <div
                        key={les.id}
                        className={`p-2.5 rounded-xl border transition-all text-xs space-y-2 ${
                          isChapterLocked
                            ? 'border-border/40 bg-slate-100/50 dark:bg-slate-900/40 opacity-75'
                            : isCurrent
                              ? 'border-primary/50 bg-primary/5 shadow-2xs'
                              : 'border-border/60 bg-surface hover:border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (isChapterLocked) {
                                toast.warning('Chương này đang bị khóa! Vui lòng hoàn thành bài test chương trước để mở khóa nhé.', 'Chương đang khóa')
                                return
                              }
                              onSelectLesson(ch, les)
                            }}
                            className="font-bold text-[11.5px] text-left text-text-primary hover:text-primary truncate flex-1 cursor-pointer"
                          >
                            Bài {les.order || 1}. {les.title}
                          </button>
                          {isCurrent && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-primary text-white shrink-0">
                              Đang mở
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {hasTheory && (
                            isChapterLocked || !isEnrolled ? (
                              <div
                                onClick={() => {
                                  toast.warning(
                                    isChapterLocked
                                      ? 'Chương này đang bị khóa! Vui lòng hoàn thành bài test của chương trước để mở khóa tài liệu lý thuyết.'
                                      : 'Vui lòng đăng ký khóa học để tải tài liệu lý thuyết!',
                                    'Chương đang khóa'
                                  )
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-text-tertiary border border-border/40 text-[10.5px] font-bold cursor-not-allowed opacity-70"
                                title="Tài liệu lý thuyết bị khóa"
                              >
                                <Lock size={11} className="text-text-tertiary" />
                                <span className="truncate max-w-[130px]">
                                  {les.theory_file_name || 'Đề lý thuyết PDF'}
                                </span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 text-[10.5px] font-bold">
                                <FileText size={11} className="text-blue-600 dark:text-blue-400" />
                                <span className="truncate max-w-[130px]">
                                  {les.theory_file_name || 'Đề lý thuyết PDF'}
                                </span>
                                <a
                                  href={les.theory_file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-0.5 hover:text-blue-800"
                                  title="Xem PDF"
                                >
                                  <ExternalLink size={10} />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleDownload(les.theory_file_url!, les.theory_file_name, Boolean(les.is_free_preview))}
                                  className="p-0.5 hover:text-blue-800"
                                  title="Tải về"
                                >
                                  <Download size={10} />
                                </button>
                              </div>
                            )
                          )}

                          {hasQuiz && (
                            isChapterLocked || !isEnrolled ? (
                              <button
                                type="button"
                                onClick={() => {
                                  toast.warning(
                                    isChapterLocked
                                      ? 'Chương này đang bị khóa! Vui lòng hoàn thành bài test của chương trước để mở khóa bài luyện tập.'
                                      : 'Vui lòng đăng ký khóa học để làm bài luyện tập!',
                                    'Chương đang khóa'
                                  )
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-text-tertiary border border-border/40 text-[10.5px] font-bold cursor-not-allowed opacity-70"
                                title="Bài luyện tập bị khóa"
                              >
                                <Lock size={11} className="text-text-tertiary" />
                                <span>Đề luyện tập ({les.questions!.length} câu)</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectLesson(ch, les)
                                  onOpenPracticeQuiz?.(ch, les)
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[10.5px] font-bold cursor-pointer transition-all"
                                title={`Làm bài tập trắc nghiệm củng cố: ${les.questions!.length} câu`}
                              >
                                <HelpCircle size={11} className="text-emerald-600 dark:text-emerald-400" />
                                <span>Đề luyện tập ({les.questions!.length} câu)</span>
                              </button>
                            )
                          )}

                        {Array.isArray(les.resources) &&
                          les.resources.map((res) => (
                            <a
                              key={res.id}
                              href={res.url}
                              download
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-surface border border-border text-text-secondary hover:text-text-primary text-[10.5px] font-medium transition-colors"
                            >
                              <FolderDown size={11} className="text-primary" />
                              <span className="truncate max-w-[120px]">{res.title}</span>
                            </a>
                          ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })
        )}
      </div>
    </div>
  )
}
