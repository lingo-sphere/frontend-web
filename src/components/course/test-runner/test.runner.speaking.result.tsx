/**
 * @file test.runner.speaking.result.tsx
 * @description Card component displaying AI and Whisper STT evaluation result for speaking submissions
 */

import { CheckCircle2, Bot } from 'lucide-react'

interface TestRunnerSpeakingResultProps {
  speakingResult: {
    ai_score?: number
    whisper_transcript?: string
    ai_feedback?: {
      pronunciation_score?: number
      fluency_score?: number
      grammar_score?: number
      vocabulary_score?: number
      detailed_comment?: string
    }
  }
}

export function TestRunnerSpeakingResult({ speakingResult }: TestRunnerSpeakingResultProps) {
  if (!speakingResult) return null

  return (
    <div className="p-5 rounded-2xl bg-surface border border-emerald-500/40 shadow-xs space-y-3.5 animate-in fade-in duration-200">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={16} />
          <span>Kết quả đánh giá bài nói sơ bộ</span>
        </div>
        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl">
          {speakingResult.ai_score}/100 điểm
        </span>
      </div>

      {speakingResult.whisper_transcript && (
        <div className="p-3.5 rounded-xl bg-surface-subtle border border-border text-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
            <Bot size={13} /> Whisper STT nhận diện bài nói:
          </span>
          <p className="text-text-primary italic leading-relaxed">
            &ldquo;{speakingResult.whisper_transcript}&rdquo;
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-xl bg-surface-subtle border border-border">
          <span className="text-[10px] text-text-tertiary block">Phát âm</span>
          <span className="font-extrabold text-text-primary">
            {speakingResult.ai_feedback?.pronunciation_score || 80}/100
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-surface-subtle border border-border">
          <span className="text-[10px] text-text-tertiary block">Độ lưu loát</span>
          <span className="font-extrabold text-text-primary">
            {speakingResult.ai_feedback?.fluency_score || 78}/100
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-surface-subtle border border-border">
          <span className="text-[10px] text-text-tertiary block">Ngữ pháp</span>
          <span className="font-extrabold text-text-primary">
            {speakingResult.ai_feedback?.grammar_score || 82}/100
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-surface-subtle border border-border">
          <span className="text-[10px] text-text-tertiary block">Từ vựng</span>
          <span className="font-extrabold text-text-primary">
            {speakingResult.ai_feedback?.vocabulary_score || 80}/100
          </span>
        </div>
      </div>

      <p className="text-xs text-text-secondary">
        {speakingResult.ai_feedback?.detailed_comment}
      </p>
    </div>
  )
}
