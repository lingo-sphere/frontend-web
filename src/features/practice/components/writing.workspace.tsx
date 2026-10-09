// Component giao diện React WritingWorkspace cho học viên
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Save, Send, AlertCircle, Lightbulb } from 'lucide-react'
import { Button } from '@/components/button'
import type { WritingExercise } from '@/features/practice/types/writing'
import { resolveMediaUrlAsync } from '@/utils/media.utils'
import { toast } from '@/store/toast.store'
import { WritingTimer } from '@/features/practice/components/writing.timer'
import { PracticeExitConfirmModal } from './practice.exit-confirm.modal'

interface WritingWorkspaceProps {
  exercise: WritingExercise
  initialContent?: string
  versionNumber?: number
  timeLimitSeconds?: number
  onBack: () => void
  onSaveDraft: (content: string, wordCount: number) => void
  onSubmit: (content: string, wordCount: number, writingTimeSeconds: number) => void
}

export function WritingWorkspace({
  exercise,
  initialContent = '',
  versionNumber = 1,
  timeLimitSeconds = 10 * 60,
  onBack,
  onSaveDraft,
  onSubmit,
}: WritingWorkspaceProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [content, setContent] = useState(initialContent)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  useEffect(() => {
    let isMounted = true
    const mediaId = exercise.prompt_image_id || exercise.media_id
    if (!mediaId) {
      setImageUrl('')
      return
    }

    resolveMediaUrlAsync(mediaId)
      .then((url) => {
        if (isMounted) setImageUrl(url)
      })
      .catch((err) => {
        console.error('[WritingWorkspace] Error resolving media:', err)
      })

    return () => {
      isMounted = false
    }
  }, [exercise.prompt_image_id, exercise.media_id])

  // Callback khi hết giờ - auto submit
  const handleTimeUp = useCallback(() => {
    if (isSubmitted) return

    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

    toast.warning(
      isVietnamese ? 'Đã hết giờ! Bài viết đã được nộp tự động.' : 'Time is up! Your writing has been auto-submitted.',
      isVietnamese ? 'Hết giờ' : 'Time Up'
    )

    setIsSubmitted(true)
    onSubmit(content, wordCount, timeLimitSeconds)
  }, [content, timeLimitSeconds, onSubmit, isSubmitted, isVietnamese])

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const maxWords = exercise.max_words || Infinity
  const isWordCountValid = wordCount <= maxWords

  const handleSaveDraft = useCallback(() => {
    setIsSaving(true)
    onSaveDraft(content, wordCount)
    setTimeout(() => {
      setIsSaving(false)
      setLastSaved(new Date())
    }, 500)
  }, [content, wordCount, onSaveDraft])

  const handleSubmit = () => {
    if (isSubmitted) return

    if (wordCount > maxWords) {
      toast.warning(
        isVietnamese
          ? `Bài viết vượt quá ${maxWords} từ. Hiện tại: ${wordCount} từ. Vui lòng rút ngắn bài viết.`
          : `Writing exceeds ${maxWords} words. Current: ${wordCount} words. Please shorten your writing.`,
        isVietnamese ? 'Giới hạn số từ' : 'Word limit'
      )
      return
    }
    setIsSubmitted(true)
    onSubmit(content, wordCount, timeLimitSeconds)
  }

  useEffect(() => {
    if (content && content !== initialContent) {
      const timer = setTimeout(() => handleSaveDraft(), 30000)
      return () => clearTimeout(timer)
    }
  }, [content])

  const handleInitiateExit = () => {
    if (isSubmitted) {
      onBack()
      return
    }
    // Tự động lưu nháp để không mất bài
    if (content && content !== initialContent) {
      handleSaveDraft()
    }
    setShowExitConfirm(true)
  }

  const handleResume = () => {
    setShowExitConfirm(false)
  }

  const handleConfirmExit = () => {
    setShowExitConfirm(false)
    onBack()
  }

  return (
    <main className="flex h-[calc(100vh-4rem)] flex-col">
      <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between border-b border-border bg-surface/95 px-4 py-3 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-4">
          <button onClick={handleInitiateExit} className="flex items-center gap-2 text-[14px] text-text-secondary hover:text-primary cursor-pointer">
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
          <WritingTimer
            totalSeconds={timeLimitSeconds}
            onTimeUp={handleTimeUp}
            isPaused={showExitConfirm}
          />
          <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isSaving || !content || isSubmitted}>
            <Save size={16} className="mr-2" />
            {isSaving ? (isVietnamese ? 'Đang lưu...' : 'Saving...') : (isVietnamese ? 'Lưu nháp' : 'Save draft')}
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary-hover" onClick={handleSubmit} disabled={!isWordCountValid || isSubmitted}>
            <Send size={16} className="mr-2" />
            {isSubmitted ? (isVietnamese ? 'Đã nộp' : 'Submitted') : (isVietnamese ? 'Nộp bài' : 'Submit')}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 overflow-y-auto border-r border-border bg-surface p-6">
          <div className="space-y-6">
            {imageUrl && (
              <section className="overflow-hidden rounded-xl border border-border shadow-xs bg-surface-subtle">
                <img
                  src={imageUrl}
                  alt={exercise.title}
                  className="w-full max-h-[340px] object-cover rounded-xl"
                  loading="lazy"
                />
              </section>
            )}

            <section>
              <h2 className="mb-3 text-[14px] font-semibold uppercase text-text-tertiary">
                {isVietnamese ? 'Yêu cầu' : 'Requirements'}
              </h2>
              <p className="text-[15px] text-text-primary">{exercise.instructions || exercise.description}</p>
            </section>

            {exercise.guiding_questions && exercise.guiding_questions.length > 0 && (
              <section className="rounded-xl border border-primary/25 bg-primary/5 p-4">
                <h2 className="mb-2 text-[14px] font-semibold text-primary flex items-center gap-2">
                  <span>💡</span>
                  {isVietnamese ? '3 Câu hỏi gợi ý cho bức ảnh' : '3 Guiding Questions for the Picture'}
                </h2>
                <ol className="list-decimal list-inside space-y-2 text-[14px] text-text-primary">
                  {exercise.guiding_questions.map((q, idx) => (
                    <li key={idx} className="leading-relaxed">
                      <span className="font-medium">{q}</span>
                      {exercise.guiding_questions_vi?.[idx] && (
                        <p className="text-[12px] text-text-secondary italic ml-5 mt-0.5">
                          {exercise.guiding_questions_vi[idx]}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {exercise.prompt_en && (
              <section>
                <h2 className="mb-3 text-[14px] font-semibold uppercase text-text-tertiary">
                  {isVietnamese ? 'Đề bài' : 'Prompt'}
                </h2>
                <div className="rounded-lg bg-surface-subtle p-4">
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed italic text-text-primary">"{exercise.prompt_en}"</p>
                  {exercise.prompt_vi && (
                    <p className="mt-1 text-[13px] text-text-secondary italic">"{exercise.prompt_vi}"</p>
                  )}
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

            {exercise.keywords && exercise.keywords.filter(k => k && k.trim()).length > 0 && (
              <section>
                <h2 className="mb-3 text-[14px] font-semibold uppercase text-text-tertiary">
                  {isVietnamese ? 'Từ khóa cần có' : 'Required keywords'}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {exercise.keywords.filter(k => k && k.trim()).map((keyword, index) => (
                    <span key={index} className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[13px] font-medium text-primary">{keyword}</span>
                  ))}
                </div>
              </section>
            )}

            {exercise.ai_hints && exercise.ai_hints.length > 0 && (
              <section className="rounded-lg bg-purple-50 p-4">
                <h2 className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold text-purple-700">
                  <Lightbulb className="w-4 h-4 text-purple-600" />
                  <span>{isVietnamese ? 'Gợi ý từ AI' : 'AI Hints'}</span>
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
            </div>

            {lastSaved && (
              <p className="mt-2 text-[11px] text-text-tertiary">
                {isVietnamese ? 'Đã lưu lúc' : 'Saved at'} {lastSaved.toLocaleTimeString(isVietnamese ? 'vi-VN' : 'en-US')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Hộp thoại xác nhận tạm dừng & thoát phiên */}
      <PracticeExitConfirmModal
        isOpen={showExitConfirm}
        onClose={handleResume}
        onConfirmExit={handleConfirmExit}
        title={isVietnamese ? 'Tạm dừng bài viết?' : 'Pause Writing Session?'}
        description={
          isVietnamese
            ? 'Đồng hồ đếm thời gian đang được tạm ngưng. Bạn có chắc muốn dừng bài viết này?'
            : 'Writing timer is paused. Are you sure you want to exit?'
        }
        savedNotice={
          isVietnamese
            ? 'Bản nháp bài viết của bạn đã được tự động lưu lại vào hệ thống.'
            : 'Your writing draft has been automatically saved.'
        }
      />
    </main>
  )
}
