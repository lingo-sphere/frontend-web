// Component giao dien hien thi danh sach tai lieu dinh kem cho bai hoc, chuong va khoa hoc.

'use client'

import { useState, useMemo } from 'react'
import { BookOpen, Lock, Search } from 'lucide-react'
import type { Course, Lesson } from '@/features/courses/types/course'
import { toast } from '@/store/toast.store'
import {
  CourseResourceItemCard,
  type EnrichedResource,
} from '@/features/courses/components/course.resource.item.card'
import {
  CourseResourcesFilterBar,
  type ResourceFilterType,
} from '@/features/courses/components/course.resources.filter.bar'

function detectFormat(url: string, title: string): EnrichedResource['format'] {
  const lowerUrl = (url || '').toLowerCase()
  const lowerTitle = (title || '').toLowerCase()
  if (
    lowerUrl.endsWith('.mp3') ||
    lowerUrl.endsWith('.wav') ||
    lowerUrl.endsWith('.m4a') ||
    lowerTitle.includes('audio') ||
    lowerTitle.includes('nghe')
  ) {
    return 'audio'
  }
  if (
    lowerUrl.endsWith('.pptx') ||
    lowerUrl.endsWith('.ppt') ||
    lowerTitle.includes('slide') ||
    lowerTitle.includes('thuyết trình')
  ) {
    return 'slide'
  }
  if (
    lowerUrl.endsWith('.zip') ||
    lowerUrl.endsWith('.rar') ||
    lowerUrl.endsWith('.7z')
  ) {
    return 'archive'
  }
  if (
    lowerUrl.endsWith('.doc') ||
    lowerUrl.endsWith('.docx')
  ) {
    return 'doc'
  }
  return 'pdf'
}

interface CourseResourcesTabProps {
  currentLesson: Lesson | null
  course: Course | null
  isEnrolled: boolean
  onOpenCheckout?: () => void
}

export function CourseResourcesTab({
  currentLesson,
  course,
  isEnrolled,
  onOpenCheckout,
}: CourseResourcesTabProps) {
  const [filterType, setFilterType] = useState<ResourceFilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const allResources = useMemo(() => {
    const list: EnrichedResource[] = []

    if (currentLesson) {
      if (currentLesson.theory_file_url) {
        list.push({
          id: `les-theory-${currentLesson.id}`,
          title: currentLesson.theory_file_name || `Tài liệu lý thuyết / Slide: ${currentLesson.title}`,
          url: currentLesson.theory_file_url,
          size: 'Tài liệu bài học',
          format: detectFormat(currentLesson.theory_file_url, currentLesson.theory_file_name || currentLesson.title),
          category: 'lesson',
          lessonTitle: currentLesson.title,
        })
      }

      if (Array.isArray(currentLesson.resources) && currentLesson.resources.length > 0) {
        currentLesson.resources.forEach((r, idx) => {
          list.push({
            id: r.id || `cur-res-${idx}`,
            title: r.title || `Tài liệu đính kèm ${idx + 1}`,
            url: r.url || '#',
            size: r.size || 'Tài liệu bài học',
            type: r.type,
            format: detectFormat(r.url || '', r.title || ''),
            category: 'lesson',
            lessonTitle: currentLesson.title,
          })
        })
      }
    }

    if (course) {
      if (course.document_url) {
        list.push({
          id: `course-doc-${course.id}`,
          title: course.document_name || `Cẩm nang & Tài liệu tổng quan: ${course.title}`,
          url: course.document_url,
          size: 'Tài liệu toàn khóa',
          format: detectFormat(course.document_url, course.document_name || course.title),
          category: 'course',
        })
      }

      course.chapters?.forEach((ch, chIdx) => {
        if (ch.theory_file_url) {
          list.push({
            id: `ch-theory-${ch.id || chIdx}`,
            title: ch.theory_file_name || `Tài liệu lý thuyết: Chương ${ch.order || chIdx + 1} - ${ch.title}`,
            url: ch.theory_file_url,
            size: 'Tài liệu chương',
            format: detectFormat(ch.theory_file_url, ch.theory_file_name || ch.title),
            category: 'chapter',
            chapterTitle: ch.title,
          })
        }

        if (ch.test_audio_url || ch.challenge_audio_url || ch.audio_url) {
          const audioUrl = ch.test_audio_url || ch.challenge_audio_url || ch.audio_url || ''
          list.push({
            id: `ch-audio-${ch.id || chIdx}`,
            title: `Audio kiểm tra Chương ${ch.order || chIdx + 1}: ${ch.title}`,
            url: audioUrl,
            size: 'Audio kiểm tra',
            type: 'audio',
            format: 'audio',
            category: 'chapter',
            chapterTitle: ch.title,
          })
        }

        ch.lessons?.forEach((les) => {
          if (les.id !== currentLesson?.id) {
            if (les.theory_file_url) {
              list.push({
                id: `les-theory-${les.id}`,
                title: les.theory_file_name || `Đề lý thuyết: Bài ${les.order || 1} - ${les.title}`,
                url: les.theory_file_url,
                size: 'Tài liệu bài học',
                format: detectFormat(les.theory_file_url, les.theory_file_name || les.title),
                category: 'lesson',
                lessonTitle: les.title,
                chapterTitle: ch.title,
              })
            }
            if (Array.isArray(les.resources)) {
              les.resources.forEach((r, rIdx) => {
                list.push({
                  id: r.id || `les-res-${les.id}-${rIdx}`,
                  title: r.title || `Tài liệu: Bài ${les.order || 1} - ${les.title}`,
                  url: r.url || '#',
                  size: r.size || 'Tài liệu bài học',
                  type: r.type,
                  format: detectFormat(r.url || '', r.title || ''),
                  category: 'lesson',
                  lessonTitle: les.title,
                  chapterTitle: ch.title,
                })
              })
            }
          }
        })
      })
    }

    return list
  }, [currentLesson, course])

  const filteredResources = useMemo(() => {
    return allResources.filter((r) => {
      if (filterType === 'current' && r.category !== 'lesson') return false
      if (filterType === 'pdf' && r.format !== 'pdf') return false
      if (filterType === 'audio' && r.format !== 'audio') return false
      if (filterType === 'slide' && r.format !== 'slide') return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          r.title.toLowerCase().includes(q) ||
          (r.lessonTitle && r.lessonTitle.toLowerCase().includes(q)) ||
          (r.chapterTitle && r.chapterTitle.toLowerCase().includes(q))
        )
      }

      return true
    })
  }, [allResources, filterType, searchQuery])

  const handleDownload = (resource: EnrichedResource) => {
    const isFreePreviewLesson = currentLesson?.id && resource.category === 'lesson' && Boolean(currentLesson.is_free_preview)
    const isCourseLevelDocument = resource.category === 'course'
    const canAccess = isEnrolled || isFreePreviewLesson || isCourseLevelDocument

    if (!canAccess) {
      toast.warning(
        'Vui lòng đăng ký khóa học để tải xuống trọn bộ tài liệu đính kèm!',
        'Khóa học chưa đăng ký'
      )
      onOpenCheckout?.()
      return
    }

    setDownloadingId(resource.id)
    setTimeout(() => {
      setDownloadingId(null)
      if (resource.url && resource.url !== '#' && resource.url.startsWith('http')) {
        const link = document.createElement('a')
        link.href = resource.url
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        link.download = `${resource.title.replace(/[/\\?%*:|"<>]/g, '_')}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        const blob = new Blob(
          [
            `LingoSphere Course Resource: ${resource.title}\nCourse: ${course?.title}\nLesson: ${
              resource.lessonTitle || 'Tài liệu khóa học'
            }\nDownloaded successfully. Happy learning!`,
          ],
          { type: 'text/plain;charset=utf-8' }
        )
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${resource.title.replace(/[/\\?%*:|"<>]/g, '_')}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
      toast.success(`Đã bắt đầu tải về: ${resource.title}`, 'Tải tài liệu thành công')
    }, 400)
  }

  const handleCopyLink = (resource: EnrichedResource) => {
    if (typeof window === 'undefined') return
    const targetUrl =
      resource.url && resource.url !== '#' ? resource.url : window.location.href
    navigator.clipboard.writeText(targetUrl)
    setCopiedId(resource.id)
    toast.success('Đã sao chép liên kết tài liệu vào bộ nhớ tạm!', 'Sao chép link')
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-text-primary flex items-center gap-2">
            <BookOpen className="text-primary w-5 h-5" />
            <span>Kho Tài Liệu Đính Kèm (Downloadable Resources)</span>
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Tải về Slide bài giảng, file Audio MP3 luyện nghe, cẩm nang từ vựng và bảng mẹo thi để
            ôn tập offline.
          </p>
        </div>

        {!isEnrolled && (
          <button
            type="button"
            onClick={onOpenCheckout}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer shrink-0"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Mở khóa toàn bộ tài liệu</span>
          </button>
        )}
      </div>

      <CourseResourcesFilterBar
        filterType={filterType}
        searchQuery={searchQuery}
        totalResourcesCount={allResources.length}
        onFilterChange={setFilterType}
        onSearchChange={setSearchQuery}
      />

      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map((res) => (
            <CourseResourceItemCard
              key={res.id}
              resource={res}
              isEnrolled={isEnrolled || Boolean(currentLesson?.is_free_preview) || res.category === 'course'}
              isCopied={copiedId === res.id}
              isDownloading={downloadingId === res.id}
              onCopyLink={handleCopyLink}
              onDownload={handleDownload}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-surface border border-border text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-text-primary">
              Không tìm thấy tài liệu phù hợp
            </h4>
            <p className="text-xs text-text-secondary">
              Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc "Tất cả".
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setFilterType('all')
              setSearchQuery('')
            }}
            className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}
    </div>
  )
}
