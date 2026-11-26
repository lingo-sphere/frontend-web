// Trình phát âm thanh bài thi nghe với thanh tiến trình và điều chỉnh tốc độ.

'use client'

import { CustomAudioPlayer } from '@/components/custom.audio.player'

interface TestRunnerAudioPlayerProps {
  audioUrl: string
}

export function TestRunnerAudioPlayer({ audioUrl }: TestRunnerAudioPlayerProps) {
  if (!audioUrl) return null

  return (
    <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 space-y-2 shadow-xs">
      <CustomAudioPlayer
        src={audioUrl}
        title="Audio bài thi Nghe (Listening) • Phát âm thanh toàn bộ đề"
      />
    </div>
  )
}
