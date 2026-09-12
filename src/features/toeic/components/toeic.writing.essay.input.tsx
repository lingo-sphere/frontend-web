// Component nhập bài viết tự luận kèm đếm từ cho câu hỏi TOEIC Writing.

import { PenTool } from 'lucide-react'

interface ToeicWritingEssayInputProps {
  value?: string
  minWords?: number
  isSubmitted: boolean
  isVietnamese: boolean
  onChange: (value: string) => void
}

export function ToeicWritingEssayInput({
  value,
  minWords = 100,
  isSubmitted,
  isVietnamese,
  onChange,
}: ToeicWritingEssayInputProps) {
  const wordCount = (value || '').trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between text-xs text-text-secondary border-b border-border pb-2">
        <span className="font-semibold text-text-primary flex items-center gap-1.5">
          <PenTool size={14} className="text-purple-600" />
          {isVietnamese ? 'Bài làm của bạn:' : 'Your Written Response:'}
        </span>
        <span
          className={`font-bold px-2.5 py-0.5 rounded-full text-xs transition-colors ${
            wordCount >= minWords
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
          }`}
        >
          {isVietnamese ? 'Số từ: ' : 'Words: '}
          {wordCount} / {minWords} {isVietnamese ? 'từ' : 'words'}
        </span>
      </div>

      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={isSubmitted}
        rows={9}
        placeholder={
          isVietnamese
            ? 'Nhập bài viết của bạn tại đây (đáp ứng đúng yêu cầu của đề bài)...'
            : 'Type your response here (satisfying prompt instructions)...'
        }
        className="w-full rounded-xl border border-border bg-surface p-3.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors resize-y leading-relaxed disabled:opacity-80 disabled:bg-surface-subtle"
      />

      {wordCount > 0 && wordCount < minWords && (
        <p className="text-[11px] text-amber-600 dark:text-amber-400">
          {isVietnamese
            ? `⚠️ Bài viết hiện có ${wordCount} từ, bạn cần viết thêm ít nhất ${minWords - wordCount} từ nữa để đạt yêu cầu.`
            : `⚠️ Current length is ${wordCount} words, add at least ${minWords - wordCount} more words to reach target.`}
        </p>
      )}
    </div>
  )
}
