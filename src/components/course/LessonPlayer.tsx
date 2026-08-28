'use client'

import { useState } from 'react'
import {
  Play,
  RotateCcw,
  RotateCw,
  Maximize2,
  Tv,
  Sparkles,
  ExternalLink
} from 'lucide-react'
import type { Lesson } from '@/types/course'

interface LessonPlayerProps {
  lesson: Lesson
  onProgress?: (lessonId: string, progress: number) => void
  onLessonComplete?: (lessonId: string) => void
  onTimeUpdate?: (currentTime: number) => void
}

function getYoutubeEmbedUrl(url?: string) {
  if (!url) return 'https://www.youtube.com/embed/YykjpeuMNEk?autoplay=0&rel=0&modestbranding=1'
  if (url.includes('youtube.com/embed/')) {
    return url.includes('?') ? url : `${url}?autoplay=0&rel=0&modestbranding=1`
  }
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)
  const id = match ? match[1] : 'YykjpeuMNEk'
  return `https://www.youtube.com/embed/${id}?autoplay=0&rel=0&modestbranding=1`
}

export function LessonPlayer({
  lesson,
}: LessonPlayerProps) {
  const [isTheater, setIsTheater] = useState(false)
  const embedUrl = getYoutubeEmbedUrl(lesson.videoUrl || lesson.content?.videoUrl)

  return (
    <div
      className={`group relative w-full shrink-0 bg-black overflow-hidden shadow-2xl transition-all ${
        isTheater
          ? 'h-[640px]'
          : 'h-[320px] sm:h-[400px] md:h-[480px] lg:h-[520px] xl:h-[560px]'
      }`}
    >
      {/* Real YouTube Video Iframe */}
      <iframe
        src={embedUrl}
        title={lesson?.title || 'Lesson Video'}
        className="w-full h-full border-0 block"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />

      {/* Top Floating Mini Header Overlay (Theater & Info toggle) */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsTheater(!isTheater)}
          className="flex items-center gap-1.5 rounded-lg bg-black/80 backdrop-blur-md px-3 py-1.5 text-[11px] font-bold text-white shadow-lg hover:bg-primary transition-colors cursor-pointer border border-white/10"
          title="Chuyển chế độ rạp chiếu"
        >
          <Tv size={13} />
          <span>{isTheater ? 'Thu nhỏ' : 'Chế độ rạp'}</span>
        </button>

        <a
          href={lesson.videoUrl || 'https://www.youtube.com/watch?v=YykjpeuMNEk'}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-lg bg-black/80 backdrop-blur-md px-3 py-1.5 text-[11px] font-bold text-white shadow-lg hover:bg-primary transition-colors cursor-pointer border border-white/10"
          title="Mở trên YouTube"
        >
          <ExternalLink size={13} />
          <span>YouTube</span>
        </a>
      </div>
    </div>
  )
}
