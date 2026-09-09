// Component giao diện React WritingWorkspace cho học viên
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Clock, Save, Send, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { WritingExercise } from '@/types/writing'
import { toast } from '@/store/toast.store'

interface WritingWorkspaceProps {
  exercise: WritingExercise
  initialContent?: string
  versionNumber?: number
  onBack: () => void
  onSaveDraft: (content: string, wordCount: number) => void
  onSubmit: (content: string, wordCount: number, writingTimeSeconds: number) => void
}

export function WritingWorkspace({
  exercise,
  initialContent = '',
  versionNumber = 1,
  onBack,
  onSaveDraft,
  onSubmit,
}: WritingWorkspaceProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [content, setContent] = useState(initialContent)
  const [startTime] = useState(Date.now())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const maxWords = exercise.max_words || Infinity
  const isWordCountValid = wordCount <= maxWords

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSaveDraft = useCallback(() => {
    setIsSaving(true)
    onSaveDraft(content, wordCount)
    setTimeout(() => {
      setIsSaving(false)
      setLastSaved(new Date())
    }, 500)
  }, [content, wordCount, onSaveDraft])

  const handleSubmit = () => {
    if (wordCount > maxWords) {
      toast.warning(
        isVietnamese
          ? `Bài viết vượt quá ${maxWords} từ. Hiện tại: ${wordCount} từ. Vui lòng rút ngắn bài viết.`
          : `Writing exceeds ${maxWords} words. Current: ${wordCount} words. Please shorten your writing.`,
        isVietnamese ? 'Giới hạn số từ' : 'Word limit'
      )
      return
    }
    const writingTimeSeconds = Math.floor((Date.now() - startTime) / 1000)
    onSubmit(content, wordCount, writingTimeSeconds)
  }

  useEffect(() => {
    if (content && content !== initialContent) {
      const timer = setTimeout(() => handleSaveDraft(), 30000)
      return () => clearTimeout(timer)
    }
  }, [content])

  return (
    <main className="flex h-[calc(100vh-4rem)] flex-col">
      <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between border-b border-border bg-surface/95 px-4 py-3 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-[14px] text-text-secondary hover:text-primary">
            <ArrowLeft size={18} />
            {isVietnamese ? 'Quay lại' : 'Back'}
          </button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-[16px] font-semibold text-text-primary">{exercise.title}</h1>
            <p className="text-[12px] text-text-tertiary">
              Version {versionNumber} • {exercise.cefr_level}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[14px] text-text-secondary">
            <Clock size={16} />
            <span className="font-mono">{formatTime(elapsedTime)}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isSaving || !content}>
            <Save size={16} className="mr-2" />
            {isSaving ? (isVietnamese ? 'Đang lưu...' : 'Saving...') : (isVietnamese ? 'Lưu nháp' : 'Save draft')}
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary-hover" onClick={handleSubmit} disabled={!isWordCountValid}>
            <Send size={16} className="mr-2" />
            {isVietnamese ? 'Nộp bài' : 'Submit'}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 overflow-y-auto border-r border-border bg-surface p-6">
          <div className="space-y-6">
            <section>
              <h2 className="mb-3 text-[14px] font-semibold uppercase text-text-tertiary">
                {isVietnamese ? 'Yêu cầu' : 'Requirements'}
              </h2>
              <p className="text-[15px] text-text-primary">{exercise.instructions || exercise.description}</p>
            </section>

            {exercise.prompt_en && (
              <section>
                <h2 className="mb-3 text-[14px] font-semibold uppercase text-text-tertiary">
                  {isVietnamese ? 'Câu gốc' : 'Original sentence'}
                </h2>
                <div className="rounded-lg bg-surface-subtle p-4">
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed italic text-text-primary">"{exercise.prompt_en}"</p>
                </div>
              </section>
            )}

            <section>
              <h2 className="mb-3 text-[14px] font-semibold uppercase text-text-tertiary">
                {isVietnamese ? 'Yêu cầu cụ thể' : 'Specific requirements'}
              </h2>
              <ul className="space-y-2">
                {exercise.max_words && (
                  <li className="flex items-center gap-2 text-[14px] text-text-secondary">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-medium text-primary">✓</span>
                    {isVietnamese ? 'Tối đa' : 'Max'} {exercise.max_words} {isVietnamese ? 'từ' : 'words'}
                  </li>
                )}
                {exercise.exercise_type === 'PARAPHRASING' && (
                  <>
                    <li className="flex items-center gap-2 text-[14px] text-text-secondary">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-medium text-primary">✓</span>
                      {isVietnamese ? 'Giữ nguyên nghĩa câu gốc' : 'Keep original meaning'}
                    </li>
                    <li className="flex items-center gap-2 text-[14px] text-text-secondary">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-medium text-primary">✓</span>
                      {isVietnamese ? 'Sử dụng cách diễn đạt của riêng bạn' : 'Use your own expressions'}
                    </li>
                  </>
                )}
              </ul>
            </section>

            {exercise.keywords && exercise.keywords.length > 0 && (
              <section>
                <h2 className="mb-3 text-[14px] font-semibold uppercase text-text-tertiary">
                  {isVietnamese ? 'Từ khóa cần có' : 'Required keywords'}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {exercise.keywords.map((keyword, index) => (
                    <span key={index} className="inline-flex items-center rounded-full bg-surface-subtle px-3 py-1 text-[13px] text-text-secondary">{keyword}</span>
                  ))}
                </div>
              </section>
            )}

            {exercise.ai_hints && exercise.ai_hints.length > 0 && (
              <section className="rounded-lg bg-purple-50 p-4">
                <h2 className="mb-2 text-[13px] font-semibold text-purple-700">
                  💡 {isVietnamese ? 'Gợi ý từ AI' : 'AI Hints'}
                </h2>
                <ul className="space-y-1">
                  {exercise.ai_hints.map((hint, index) => (
                    <li key={index} className="text-[13px] text-purple-600">• {hint}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>

        <div className="flex w-1/2 flex-col bg-surface-subtle/50">
          <div className="mb-4 border-b border-border bg-surface px-6 py-4">
            <h2 className="text-[14px] font-semibold text-text-primary">
              {isVietnamese ? 'Bài viết của bạn' : 'Your writing'}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto px-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isVietnamese ? 'Bắt đầu viết bài của bạn ở đây...' : 'Start writing your response here...'}
              className="h-full w-full resize-none rounded-lg border border-border bg-surface p-4 text-[15px] leading-relaxed text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
              style={{ minHeight: '300px' }}
            />
          </div>

          <div className="border-t border-border bg-surface px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-text-secondary">{isVietnamese ? 'Số từ:' : 'Words:'}</span>
                  <span className={`font-semibold ${isWordCountValid ? 'text-primary' : 'text-red-500'}`}>{wordCount}</span>
                  <span className="text-[13px] text-text-tertiary">/ {maxWords === Infinity ? '∞' : maxWords} {isVietnamese ? 'từ' : 'words'}</span>
                </div>
                {!isWordCountValid && wordCount > 0 && (
                  <span className="flex items-center gap-1 text-[12px] text-red-500">
                    <AlertCircle size={14} />
                    {isVietnamese ? 'Vượt quá giới hạn' : 'Exceeds limit'} {wordCount - maxWords} {isVietnamese ? 'từ' : 'words'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isSaving || !content}>
                  <Save size={16} className="mr-2" />
                  {isSaving ? (isVietnamese ? 'Đang lưu...' : 'Saving...') : (isVietnamese ? 'Lưu nháp' : 'Save draft')}
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary-hover" onClick={handleSubmit} disabled={!isWordCountValid}>
                  <Send size={16} className="mr-2" />
                  {isVietnamese ? 'Nộp bài' : 'Submit'}
                </Button>
              </div>
            </div>

            {lastSaved && (
              <p className="mt-2 text-[11px] text-text-tertiary">
                {isVietnamese ? 'Đã lưu lúc' : 'Saved at'} {lastSaved.toLocaleTimeString(isVietnamese ? 'vi-VN' : 'en-US')}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
