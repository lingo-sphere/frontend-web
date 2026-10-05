// Component menu thả xuống tùy chỉnh hỗ trợ chọn khóa học lọc điểm bài kiểm tra chương theo từng khóa hoặc theo hệ 2/4 kỹ năng.
'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { BookOpen, Check, ChevronDown, GraduationCap, Layers, Sparkles } from 'lucide-react'
import type { UnifiedCourseCardItem } from '@/features/progress/hooks/use.progress.data'
import type { Course } from '@/types/api.types'

interface ProgressCourseFilterDropdownProps {
  enrolledCourseCards: UnifiedCourseCardItem[]
  selectedCourseId: string
  onSelectCourse: (courseId: string) => void
}

function isCourse4Skills(course?: Course | UnifiedCourseCardItem): boolean {
  if (!course) return false
  const cat = (course as Course).category
  if (cat === 'TOEIC_4_SKILLS' || cat === 'IELTS_4_SKILLS' || cat === '4_SKILLS') return true
  const skills = (course as Course).skills
  if (Array.isArray(skills) && (skills.includes('SPEAKING') || skills.includes('WRITING') || skills.length >= 4)) return true
  const title = course.title || ''
  if (/4\s*(kỹ\s*năng|skills)/i.test(title)) return true
  return false
}

export function ProgressCourseFilterDropdown({
  enrolledCourseCards,
  selectedCourseId,
  onSelectCourse,
}: ProgressCourseFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const selectedCourse = enrolledCourseCards.find((c) => c.course_id === selectedCourseId)

  const displayLabel = useMemo(() => {
    if (selectedCourseId === 'all') return 'Tất cả khóa học'
    if (selectedCourseId === 'group-2skills') return 'Nhóm 2 Kỹ Năng'
    if (selectedCourseId === 'group-4skills') return 'Nhóm 4 Kỹ Năng'
    if (selectedCourse) return selectedCourse.title
    return 'Tất cả khóa học'
  }, [selectedCourseId, selectedCourse])

  const has2SkillsCourses = useMemo(() => {
    return enrolledCourseCards.some((c) => !isCourse4Skills(c))
  }, [enrolledCourseCards])

  const has4SkillsCourses = useMemo(() => {
    return enrolledCourseCards.some((c) => isCourse4Skills(c))
  }, [enrolledCourseCards])

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`h-9 px-3.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs select-none ${
          isOpen
            ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
            : 'border-border bg-surface-subtle/80 hover:bg-surface-subtle text-text-primary hover:border-border-hover'
        }`}
      >
        <BookOpen size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="max-w-[160px] sm:max-w-[240px] truncate text-left">{displayLabel}</span>
        <ChevronDown
          size={13}
          className={`text-text-tertiary transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 z-40 w-72 sm:w-88 max-h-[360px] overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl p-1.5 text-left divide-y divide-border/40 scrollbar-thin">
          <div className="p-1 space-y-1">
            <button
              type="button"
              onClick={() => {
                onSelectCourse('all')
                setIsOpen(false)
              }}
              className={`w-full p-2.5 rounded-xl flex items-center justify-between gap-2.5 transition-colors cursor-pointer text-xs ${
                selectedCourseId === 'all'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold'
                  : 'hover:bg-surface-subtle text-text-primary'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Layers size={14} />
                </div>
                <div className="min-w-0 text-left">
                  <span className="font-bold block truncate">Tất cả khóa học</span>
                  <span className="text-[10px] text-text-tertiary block truncate">
                    Xem toàn bộ các bài kiểm tra chương đã làm
                  </span>
                </div>
              </div>
              {selectedCourseId === 'all' && (
                <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
            </button>

            {has2SkillsCourses && has4SkillsCourses && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onSelectCourse('group-2skills')
                    setIsOpen(false)
                  }}
                  className={`w-full p-2 rounded-xl flex items-center justify-between gap-2.5 transition-colors cursor-pointer text-xs ${
                    selectedCourseId === 'group-2skills'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'hover:bg-surface-subtle text-text-primary'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Sparkles size={14} />
                    </div>
                    <div className="min-w-0 text-left">
                      <span className="font-bold block truncate">Nhóm khóa 2 Kỹ Năng</span>
                      <span className="text-[10px] text-text-tertiary block truncate">
                        Chỉ lọc các bài kiểm tra của khóa Listening & Reading
                      </span>
                    </div>
                  </div>
                  {selectedCourseId === 'group-2skills' && (
                    <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectCourse('group-4skills')
                    setIsOpen(false)
                  }}
                  className={`w-full p-2 rounded-xl flex items-center justify-between gap-2.5 transition-colors cursor-pointer text-xs ${
                    selectedCourseId === 'group-4skills'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'hover:bg-surface-subtle text-text-primary'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                      <Sparkles size={14} />
                    </div>
                    <div className="min-w-0 text-left">
                      <span className="font-bold block truncate">Nhóm khóa 4 Kỹ Năng</span>
                      <span className="text-[10px] text-text-tertiary block truncate">
                        Chỉ lọc các bài kiểm tra của khóa 4 Kỹ Năng
                      </span>
                    </div>
                  </div>
                  {selectedCourseId === 'group-4skills' && (
                    <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                </button>
              </>
            )}
          </div>

          <div className="p-1 space-y-0.5">
            <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider px-2 py-1 block">
              Từng khóa học ({enrolledCourseCards.length})
            </span>
            {enrolledCourseCards.map((c) => {
              const isSelected = selectedCourseId === c.course_id
              const is4K = isCourse4Skills(c)
              return (
                <button
                  key={c.course_id}
                  type="button"
                  onClick={() => {
                    onSelectCourse(c.course_id)
                    setIsOpen(false)
                  }}
                  className={`w-full p-2.5 rounded-xl flex items-center justify-between gap-2.5 transition-colors cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'hover:bg-surface-subtle text-text-primary'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xs shrink-0">
                      <GraduationCap size={14} />
                    </div>
                    <div className="min-w-0 text-left">
                      <span className="font-bold block truncate">{c.title}</span>
                      <span className="text-[10px] text-text-tertiary block truncate">
                        {is4K ? 'Hệ 4 Kỹ Năng' : 'Hệ 2 Kỹ Năng'} • {c.target_score ? `Mục tiêu ${c.target_score}+` : 'Khóa học'}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
