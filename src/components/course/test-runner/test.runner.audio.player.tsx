/**
 * @file test.runner.audio.player.tsx
 * @description Trình phát âm thanh bài thi nghe với thanh tiến trình và điều chỉnh tốc độ
 */

'use client'

import { Volume2 } from 'lucide-react'

interface TestRunnerAudioPlayerProps {
  audioUrl: string
}

export function TestRunnerAudioPlayer({ audioUrl }: TestRunnerAudioPlayerProps) {
  if (!audioUrl) return null

  return (
    <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center gap-3 shadow-xs">
      <div className="p-2 rounded-xl bg-indigo-500 text-white shadow-xs shrink-0">
        <Volume2 size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 block mb-1">
          Audio bài thi Nghe (Listening) • Phát âm thanh toàn bộ đề:
        </span>
        <audio controls src={audioUrl} className="w-full h-8" />
      </div>
    </div>
  )
}
