/**
 * @file course.qna.ask.form.tsx
 * @description Form soạn thảo câu hỏi thảo luận mới trong tab Q&A của bài học
 */

import { forwardRef } from 'react'
import { BookOpen, EyeOff, MessageSquare, ShieldCheck, User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CourseQnAAskFormProps {
  showAskForm: boolean
  currentLessonTitle?: string
  questionTitle: string
  questionBody: string
  isAnonymous: boolean
  isSubmitting: boolean
  titleInputRef: React.RefObject<HTMLInputElement | null>
  onTitleChange: (title: string) => void
  onBodyChange: (body: string) => void
  onToggleAnonymous: () => void
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
}

export const CourseQnAAskForm = forwardRef<HTMLFormElement, CourseQnAAskFormProps>(
  function CourseQnAAskForm(
    {
      showAskForm,
      currentLessonTitle,
      questionTitle,
      questionBody,
      isAnonymous,
      isSubmitting,
      titleInputRef,
      onTitleChange,
      onBodyChange,
      onToggleAnonymous,
      onClose,
      onSubmit,
    },
    ref
  ) {
    return (
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          showAskForm
            ? 'grid-rows-[1fr] opacity-100 mb-6'
            : 'grid-rows-[0fr] opacity-0 mb-0 pointer-events-none'
        }`}
      >
        <div className="overflow-hidden">
          <form
            ref={ref}
            onSubmit={onSubmit}
            className="rounded-3xl border border-border bg-surface p-5 sm:p-6 shadow-xl space-y-4 scroll-mt-6"
          >
            <div className="flex items-center justify-between border-b border-border/70 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary">Đặt câu hỏi mới</h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
                    <BookOpen size={12} />
                    <span>
                      Bài học:{' '}
                      <strong className="text-text-secondary font-semibold">
                        {currentLessonTitle || 'Tổng quan'}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-1.5 text-text-tertiary hover:bg-surface-hover hover:text-text-primary transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <input
                ref={titleInputRef}
                type="text"
                placeholder="Bạn đang có thắc mắc gì về bài học này?"
                value={questionTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm sm:text-base font-bold text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-hidden transition-colors"
                required
              />
              <textarea
                rows={3}
                placeholder="Mô tả chi tiết ngữ cảnh bài học, câu thoại hoặc ngữ pháp cần giảng viên giải thích thêm..."
                value={questionBody}
                onChange={(e) => onBodyChange(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-hidden resize-none transition-colors"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-border/70">
              <button
                type="button"
                onClick={onToggleAnonymous}
                className={`inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer self-start ${
                  isAnonymous
                    ? 'border border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold shadow-xs'
                    : 'border border-border bg-surface text-text-secondary hover:border-border-hover hover:bg-surface-hover'
                }`}
              >
                {isAnonymous ? (
                  <>
                    <EyeOff size={15} className="text-purple-600 dark:text-purple-400" />
                    <span>Đang đăng ẩn danh</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-purple-500/20 font-bold">
                      Bật
                    </span>
                  </>
                ) : (
                  <>
                    <User size={15} className="text-text-tertiary" />
                    <span>Đăng công khai (Bấm để ẩn danh)</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="text-xs font-bold text-text-secondary hover:text-text-primary cursor-pointer rounded-xl px-4"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !questionTitle.trim()}
                  className="bg-primary text-white hover:bg-primary-hover text-xs font-bold rounded-xl px-6 py-2.5 cursor-pointer shadow-sm shadow-primary/25 disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang đăng...' : 'Đăng câu hỏi'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }
)
