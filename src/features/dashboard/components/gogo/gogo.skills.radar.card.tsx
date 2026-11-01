// Component thẻ phân tích mạng nhện 4 kỹ năng CEFR theo phong cách Gogo Radar Chart.
'use client'

import React from 'react'
import Link from 'next/link'
import { Compass, Headphones, Mic, BookOpen, PenTool } from 'lucide-react'
import { SkillRadarChart, type RadarDataPoint } from '@/features/progress/components/skill-radar-chart'

interface GogoSkillsRadarCardProps {
  listeningScore: number
  readingScore: number
  speakingScore: number
  writingScore: number
  skillsType?: '2SKILLS' | '4SKILLS'
}

export function GogoSkillsRadarCard({
  listeningScore = 0,
  readingScore = 0,
  speakingScore = 0,
  writingScore = 0,
  skillsType = '2SKILLS',
}: GogoSkillsRadarCardProps) {
  const radarData: RadarDataPoint[] = [
    { axis: 'Nghe (Listening)', value: Math.min(100, listeningScore), fullMark: 100, description: 'Khả năng nghe hiểu hội thoại & bài giảng' },
    { axis: 'Nói (Speaking)', value: Math.min(100, speakingScore), fullMark: 100, description: 'Phát âm chuẩn xác và phản xạ Whisper AI' },
    { axis: 'Đọc (Reading)', value: Math.min(100, readingScore), fullMark: 100, description: 'Đọc hiểu ngữ cảnh và từ vựng học thuật' },
    { axis: 'Viết (Writing)', value: Math.min(100, writingScore), fullMark: 100, description: 'Cấu trúc câu ngữ pháp và bài luận' },
  ]

  const overallAvg = Math.round((listeningScore + readingScore + speakingScore + writingScore) / 4)

  return (
    <div className="rounded-3xl bg-surface border border-border p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
            <Compass className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-base font-bold text-text-primary">
              Năng Lực 4 Kỹ Năng CEFR
            </h3>
            <p className="text-xs text-text-secondary">
              Mạng nhện đánh giá độ cân bằng các kỹ năng
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
          {skillsType}
        </span>
      </div>

      <div className="py-2 flex items-center justify-center">
        <SkillRadarChart
          data={radarData}
          overallScore={overallAvg}
          themeColor="violet"
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-border">
        <Link
          href="/listening"
          className="p-2.5 rounded-xl bg-surface-subtle hover:bg-teal-50 dark:hover:bg-teal-950/20 border border-border transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="text-xs font-semibold text-text-primary group-hover:text-teal-600">Nghe</span>
          </div>
          <span className="text-xs font-bold text-text-secondary">{listeningScore}đ</span>
        </Link>

        <Link
          href="/reading"
          className="p-2.5 rounded-xl bg-surface-subtle hover:bg-cyan-50 dark:hover:bg-cyan-950/20 border border-border transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs font-semibold text-text-primary group-hover:text-cyan-600">Đọc</span>
          </div>
          <span className="text-xs font-bold text-text-secondary">{readingScore}đ</span>
        </Link>

        <Link
          href="/speaking"
          className="p-2.5 rounded-xl bg-surface-subtle hover:bg-amber-50 dark:hover:bg-amber-950/20 border border-border transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-semibold text-text-primary group-hover:text-amber-600">Nói</span>
          </div>
          <span className="text-xs font-bold text-text-secondary">{speakingScore}đ</span>
        </Link>

        <Link
          href="/writing"
          className="p-2.5 rounded-xl bg-surface-subtle hover:bg-purple-50 dark:hover:bg-purple-950/20 border border-border transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-semibold text-text-primary group-hover:text-purple-600">Viết</span>
          </div>
          <span className="text-xs font-bold text-text-secondary">{writingScore}đ</span>
        </Link>
      </div>
    </div>
  )
}

