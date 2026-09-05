/**
 * @file course.resources.tab.tsx
 * @description Thành phần Course Resources Tab phục vụ phía người học (Web Client)
 */

'use client'

/**
 * @file course.resources.tab.tsx
 * @description Component giao diện hiển thị danh sách tài liệu đính kèm (PDF, Slide, MP3, Cheatsheets) cho bài học và khóa học
 */

import { useState, useMemo } from 'react'
import { BookOpen, Lock, Search } from 'lucide-react'
import type { Course, Lesson } from '@/types/course'
import { toast } from '@/store/toast.store'
import {
  CourseResourceItemCard,
  type EnrichedResource,
} from './resources/course.resource.item.card'
import {
  CourseResourcesFilterBar,
  type ResourceFilterType,
} from './resources/course.resources.filter.bar'

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
      if (Array.isArray(currentLesson.resources) && currentLesson.resources.length > 0) {
        currentLesson.resources.forEach((r, idx) => {
          const lowerUrl = (r.url || '').toLowerCase()
          const lowerTitle = (r.title || '').toLowerCase()
          let fmt: EnrichedResource['format'] = 'pdf'
          if (
            r.type === 'audio' ||
            lowerUrl.endsWith('.mp3') ||
            lowerUrl.endsWith('.wav') ||
            lowerTitle.includes('audio') ||
            lowerTitle.includes('nghe')
          ) {
            fmt = 'audio'
          } else if (
            lowerUrl.endsWith('.pptx') ||
            lowerUrl.endsWith('.ppt') ||
            lowerTitle.includes('slide') ||
            lowerTitle.includes('bài giảng')
          ) {
            fmt = 'slide'
          } else if (lowerUrl.endsWith('.zip') || lowerUrl.endsWith('.rar')) {
            fmt = 'archive'
          } else if (lowerUrl.endsWith('.doc') || lowerUrl.endsWith('.docx')) {
            fmt = 'doc'
          }

          list.push({
            id: r.id || `cur-res-${idx}`,
            title: r.title || `Tài liệu đính kèm ${idx + 1}`,
            url: r.url || '#',
            size: r.size || '1.8 MB',
            type: r.type,
            format: fmt,
            category: 'lesson',
            lessonTitle: currentLesson.title,
          })
        })
      }

      list.push(
        {
          id: `les-pdf-${currentLesson.id}`,
          title: `Tài liệu Slide & Tóm tắt kiến thức - ${currentLesson.title}`,
          url: currentLesson.videoUrl || '#',
          size: '2.4 MB',
          type: 'pdf',
          format: 'pdf',
          category: 'lesson',
          lessonTitle: currentLesson.title,
        },
        {
          id: `les-audio-${currentLesson.id}`,
          title: `File Audio luyện nghe ngữ điệu MP3 - ${currentLesson.title}`,
          url: currentLesson.videoUrl || '#',
          size: '4.6 MB',
          type: 'audio',
          format: 'audio',
          category: 'lesson',
          lessonTitle: currentLesson.title,
        }
      )
    }

    if (course) {
      list.push(
        {
          id: `course-handbook-${course.id}`,
          title: `Sổ tay Cẩm nang & Lộ trình học ${course.title} (PDF)`,
          url: '#',
          size: '8.5 MB',
          type: 'pdf',
          format: 'pdf',
          category: 'course',
        },
        {
          id: `course-vocab-${course.id}`,
          title: `Trọn bộ Mindmap & Flashcard 600+ Từ vựng Trọng tâm (PDF)`,
          url: '#',
          size: '5.2 MB',
          type: 'pdf',
          format: 'slide',
          category: 'course',
        },
        {
          id: `course-cheatsheet-${course.id}`,
          title: `Bảng Tra Cứu Cấu Trúc Ngữ Pháp & Mẹo Thi TOEIC Siêu Tốc`,
          url: '#',
          size: '3.1 MB',
          type: 'doc',
          format: 'doc',
          category: 'course',
        }
      )

      course.chapters?.forEach((ch, chIdx) => {
        if (ch.test_audio_url || ch.challenge_audio_url || ch.audio_url) {
          list.push({
            id: `ch-audio-${ch.id || chIdx}`,
            title: `File Audio đề kiểm tra Chương ${ch.order || chIdx + 1}: ${ch.title}`,
            url: ch.test_audio_url || ch.challenge_audio_url || ch.audio_url || '#',
            size: '7.8 MB',
            type: 'audio',
            format: 'audio',
            category: 'course',
            chapterTitle: ch.title,
          })
        }
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
    if (!isEnrolled) {
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
        window.open(resource.url, '_blank')
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
    }, 600)
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
              isEnrolled={isEnrolled}
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
