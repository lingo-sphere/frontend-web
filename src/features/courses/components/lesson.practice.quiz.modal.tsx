// Modal hien thi giao dien lam bai trac nghiem on tap cung co kien thuc theo bai hoc.
'use client'

import { useEffect } from 'react'
import { X, HelpCircle, Sparkles } from 'lucide-react'
import { LessonPracticeQuizView } from '@/features/courses/components/lesson.practice.quiz.view'
import type { Lesson } from '@/features/courses/types/course'

interface LessonPracticeQuizModalProps {
  open: boolean
  onClose: () => void
  lesson: Lesson | null
}

export function LessonPracticeQuizModal({
  open,
  onClose,
  lesson,
}: LessonPracticeQuizModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open || !lesson) return null

  const questionsCount = lesson.questions?.length || 0

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-border bg-surface shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-secondary/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              <HelpCircle size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Sparkles size={12} />
                  Luyện tập củng cố bài học
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-500/20">
                  {questionsCount} câu hỏi
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-text-primary truncate">
                {lesson.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer shrink-0 ml-3"
            title="Đóng giao diện luyện tập"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <LessonPracticeQuizView
            questions={lesson.questions}
            lessonTitle={lesson.title}
          />
        </div>
      </div>
    </div>
  )
}
