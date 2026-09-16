/**
 * @file course.resource.item.card.tsx
 * @description Card hiển thị tài liệu đính kèm kèm badge định dạng, dung lượng và nút tải xuống / sao chép link
 */

import { Check, Copy, Download, FileArchive, FileCode, FileText, Lock, Music, SlidersHorizontal } from 'lucide-react'
import type { LessonResource } from '@/features/courses/types/course'

export interface EnrichedResource extends LessonResource {
  category: 'lesson' | 'chapter' | 'course'
  chapterTitle?: string
  lessonTitle?: string
  format: 'pdf' | 'audio' | 'slide' | 'doc' | 'archive'
}

interface CourseResourceItemCardProps {
  resource: EnrichedResource
  isEnrolled: boolean
  isCopied: boolean
  isDownloading: boolean
  onCopyLink: (resource: EnrichedResource) => void
  onDownload: (resource: EnrichedResource) => void
}

export function CourseResourceItemCard({
  resource,
  isEnrolled,
  isCopied,
  isDownloading,
  onCopyLink,
  onDownload,
}: CourseResourceItemCardProps) {
  const getFormatBadge = (format: EnrichedResource['format']) => {
    switch (format) {
      case 'pdf':
        return {
          icon: <FileText className="w-5 h-5 text-rose-500" />,
          badge: 'PDF Document',
          bgColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        }
      case 'audio':
        return {
          icon: <Music className="w-5 h-5 text-amber-500" />,
          badge: 'Audio MP3',
          bgColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        }
      case 'slide':
        return {
          icon: <SlidersHorizontal className="w-5 h-5 text-indigo-500" />,
          badge: 'Slide / Presentation',
          bgColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
        }
      case 'doc':
        return {
          icon: <FileCode className="w-5 h-5 text-blue-500" />,
          badge: 'Word / Notes',
          bgColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        }
      case 'archive':
        return {
          icon: <FileArchive className="w-5 h-5 text-purple-500" />,
          badge: 'ZIP Archive',
          bgColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        }
      default:
        return {
          icon: <FileText className="w-5 h-5 text-text-tertiary" />,
          badge: 'Tài liệu',
          bgColor: 'bg-surface text-text-secondary border-border',
        }
    }
  }

  const formatMeta = getFormatBadge(resource.format)

  return (
    <div className="group p-4 rounded-2xl bg-surface border border-border/80 hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between gap-4">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-background border border-border/70 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              {formatMeta.icon}
            </div>
            <div>
              <span
                className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${formatMeta.bgColor} mb-1`}
              >
                {formatMeta.badge}
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2">
                {resource.title}
              </h4>
              {resource.lessonTitle && (
                <p className="text-[11px] text-text-tertiary mt-0.5 truncate">
                  📍 {resource.lessonTitle}
                </p>
              )}
              {resource.chapterTitle && (
                <p className="text-[11px] text-text-tertiary mt-0.5 truncate">
                  📂 {resource.chapterTitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
        <div className="flex items-center gap-2 text-text-tertiary font-medium text-[11px]">
          {resource.size && (
            <span>
              <strong className="text-text-primary">{resource.size}</strong>
            </span>
          )}
          {resource.category === 'lesson' ? (
            <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold text-[10px]">
              Theo bài học
            </span>
          ) : resource.category === 'chapter' ? (
            <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-[10px]">
              Theo chương
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
              Toàn khóa
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onCopyLink(resource)}
            title="Sao chép link tải"
            className="p-2 rounded-xl bg-background hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-border/60 transition-colors cursor-pointer"
          >
            {isCopied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onDownload(resource)}
            disabled={isDownloading}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer ${
              !isEnrolled
                ? 'bg-background hover:bg-surface-hover text-text-secondary border border-border'
                : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
            }`}
          >
            {isDownloading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : !isEnrolled ? (
              <Lock className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{!isEnrolled ? 'Khóa tải về' : 'Tải xuống'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
