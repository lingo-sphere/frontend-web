import { useWritingReviewDraft } from '../hooks/use.writing.review.draft'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useWritingReviewSession, writingSrsKey } from '../hooks/use.writing.srs'
import { writingSrsService } from '../services/writing-srs.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
// Component giao diện React WritingWorkspace cho học viên
import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Save, Send, AlertCircle, Lightbulb } from 'lucide-react'
import { Button } from '@/components/button'
import type { WritingExercise } from '@/features/practice/types/writing'
import { resolveMediaUrlAsync } from '@/utils/media.utils'
import { toast } from '@/store/toast.store'
import { WritingTimer } from '@/features/practice/components/writing.timer'
import { PracticeExitConfirmModal } from './practice.exit-confirm.modal'

interface WritingWorkspaceProps {
  reviewSessionId?: string
  exercise: WritingExercise
  initialContent?: string
  versionNumber?: number
  timeLimitSeconds?: number
  onBack: () => void
  onSaveDraft: (content: string, wordCount: number) => void
  onSubmit: (content: string, wordCount: number, writingTimeSeconds: number) => Promise<boolean> | boolean
}

export function WritingWorkspace({
  reviewSessionId,
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
  const review = useWritingReviewSession(reviewSessionId)
  const queryClient = useQueryClient()
  const hint = useMutation({ mutationFn: () => writingSrsService.hint(reviewSessionId!), onSuccess: () => queryClient.invalidateQueries({ queryKey: writingSrsKey }) })
  const reviewReady = !reviewSessionId || (!!review.data && review.data.can_submit && !review.data.submission_id && review.data.exercise_id === exercise.id && new Date(review.data.expires_at).getTime() > Date.now() && !hint.isPending && !review.isFetching)

  const draftOwner = useAuthStore(state => state.user?.user_id)
  const reviewDraft = useWritingReviewDraft(reviewSessionId && draftOwner ? `writing-review-draft:${draftOwner}:${reviewSessionId}:${exercise.id}` : null)
  const [editedContent, setContent] = useState<string | undefined>(initialContent || undefined)
  const content = editedContent ?? reviewDraft.content ?? ''
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitFailed, setSubmitFailed] = useState(false)
  const submitLock = useRef(false)
  const elapsedSeconds = useRef(0)
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

  const submit = useCallback(async () => {
    if (submitLock.current || !content.trim() || !reviewReady) return
    submitLock.current = true; setIsSubmitted(true); setSubmitFailed(false)
    try { const success = await onSubmit(content, content.trim().split(/\s+/).length, elapsedSeconds.current); if (!success) setSubmitFailed(true); else reviewDraft.clear() }
    catch { setSubmitFailed(true) }
    finally { submitLock.current = false; setIsSubmitted(false) }
  }, [content, onSubmit, reviewReady, reviewDraft.clear])
  const handleTimeUp = useCallback(() => {
    toast.warning(isVietnamese ? 'Đã hết giờ. Đang gửi chấm bài.' : 'Time is up. Submitting your writing.')
    void submit()
  }, [submit, isVietnamese])

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const maxWords = exercise.max_words || Infinity
  const isWordCountValid = wordCount <= maxWords

  const handleSaveDraft = useCallback(() => {
    if (reviewSessionId && !reviewDraft.save(content)) { toast.error(isVietnamese ? 'Không lưu được bản nháp trên thiết bị. Hãy giữ trang này mở.' : 'Unable to save a device draft. Keep this page open.'); return }
    setIsSaving(true)
    onSaveDraft(content, wordCount)
    setTimeout(() => {
      setIsSaving(false)
      setLastSaved(new Date())
    }, 500)
  }, [content, wordCount, onSaveDraft, reviewSessionId, reviewDraft.save, isVietnamese])

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
    void submit()
  }

  useEffect(() => {
    if (content && content !== initialContent) {
      const timer = setTimeout(() => handleSaveDraft(), 30000)
      return () => clearTimeout(timer)
    }
  }, [content])

  const handleInitiateExit = () => {
    if (isSubmitted) return
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
      <header className="sticky top-0 z-30 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur-md shadow-xs">
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
            onElapsedChange={value => { elapsedSeconds.current = value }}
            onTimeUp={handleTimeUp}
            isPaused={showExitConfirm || isSubmitted}
          />
          <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isSaving || !content || isSubmitted}>
            <Save size={16} className="mr-2" />
            {isSaving ? (isVietnamese ? 'Đang lưu...' : 'Saving...') : (isVietnamese ? 'Lưu nháp' : 'Save draft')}
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary-hover" onClick={handleSubmit} disabled={!wordCount || !isWordCountValid || isSubmitted || !reviewReady}>
            <Send size={16} className="mr-2" />
            {isSubmitted ? (isVietnamese ? 'Đang chấm…' : 'Grading…') : (isVietnamese ? 'Nộp bài' : 'Submit')}
          </Button>
        </div>
      </header>

      {reviewSessionId && <aside aria-label={isVietnamese ? 'Mục tiêu lượt ôn Writing' : 'Writing review targets'} className="space-y-2 border-b border-primary/20 bg-primary/5 p-4 text-sm">
        {review.isLoading ? <p>{isVietnamese ? 'Đang tải mục tiêu ôn…' : 'Loading review targets…'}</p> : review.isError ? <div role="alert"><p>{review.error.message}</p><Button variant="outline" onClick={() => review.refetch()}>{isVietnamese ? 'Thử lại' : 'Retry'}</Button></div> : review.data && <>
          <p className="font-semibold">{review.data.mode === 'REWRITE' ? (isVietnamese ? 'Sửa lại bài gốc · chưa xác nhận vận dụng độc lập' : 'Original task revision · not independent transfer') : (isVietnamese ? 'Vận dụng mục tiêu trong bài khác' : 'Apply the target in another task')}</p>
          <ul className="list-disc pl-5">{review.data.targets.map(target => <li key={target.id}>{isVietnamese ? target.label : target.label_en}</li>)}</ul>
          {!review.data.can_submit && !review.data.submission_id && <p role="alert">{isVietnamese ? 'Mục tiêu đang tạm dừng hoặc không còn khả dụng. Hãy quay lại sổ tay để chọn lượt ôn mới.' : 'The target is paused or unavailable. Return to your notebook to start another review.'}</p>}
          {review.data.submission_id && <a className="inline-block underline text-primary" href={`/writing/result/${review.data.submission_id}`}>{isVietnamese ? 'Mở kết quả lượt ôn đã lưu' : 'Open the saved review result'}</a>}
          {review.data.submission_id ? <p role="alert">{isVietnamese ? 'Lượt ôn đã được nộp. Xem kết quả trong lịch sử; hãy bắt đầu lượt mới nếu muốn viết tiếp.' : 'This review has already been submitted. Open your history or start a new review.'}</p> : <Button variant="outline" disabled={isSubmitted || hint.isPending || review.data.assisted || !review.data.can_submit} onClick={() => hint.mutate()}>{hint.isPending ? (isVietnamese ? 'Đang mở gợi ý…' : 'Opening hint…') : review.data.assisted ? (isVietnamese ? 'Đã dùng gợi ý trong lượt ôn' : 'Hint used in this review') : (isVietnamese ? 'Xem gợi ý · ghi nhận có hỗ trợ' : 'Show hint · recorded as assisted')}</Button>}
          {review.data.assisted && review.data.targets.map(target => <div key={target.id} className="rounded-lg bg-surface p-3"><p>{target.original} {target.corrected && `→ ${target.corrected}`}</p><p className="mt-1 text-text-secondary">{target.explanation}</p></div>)}
        </>}
        <p className="text-xs text-text-secondary">{isVietnamese ? 'Bản nháp lượt ôn được lưu trên thiết bị này theo tài khoản.' : 'This review draft is saved on this device for your account.'}</p>
        {reviewDraft.storageFailed && <p role="alert" className="text-red-700">{isVietnamese ? 'Chưa lưu được bản nháp trên thiết bị. Nội dung vẫn ở màn hình; hãy giữ trang mở.' : 'The device draft could not be saved. Your text is still on screen; keep this page open.'}</p>}
        {hint.isError && <p role="alert" className="text-red-700">{hint.error.message}</p>}
      </aside>}
      {submitFailed && <p role="alert" className="border-b border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{isVietnamese ? 'Chưa chấm được bài. Nội dung được giữ nguyên; bạn có thể bấm Nộp bài để thử lại.' : 'Grading failed. Your writing is preserved; press Submit to retry.'}</p>}
      <div className="flex flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        <div className="w-full shrink-0 lg:w-1/2 lg:shrink lg:overflow-y-auto lg:border-r border-border bg-surface p-6">
          <div className="space-y-6">
            <section className="rounded-xl border border-border p-4"><p className="font-semibold">{exercise.grading_standard === 'TOEIC' ? 'TOEIC Writing' : isVietnamese ? 'Giao tiếp thực tế · 0–100' : 'Practical communication · 0–100'}</p>{!!exercise.task_requirements?.length && <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">{exercise.task_requirements.map((requirement, index) => <li key={index}>{requirement}</li>)}</ul>}</section>
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

            {exercise.source_text && <section className="mb-6 rounded-lg bg-surface-subtle p-4">
              <h2 className="mb-2 text-[13px] font-semibold uppercase text-text-tertiary">{exercise.exercise_type === 'WRITE_EMAIL' ? (isVietnamese ? 'Email nguồn' : 'Original email') : (isVietnamese ? 'Văn bản nguồn' : 'Source text')}</h2>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-text-primary">{exercise.source_text}</p>
              {isVietnamese && exercise.source_text_vi && <p className="mt-2 whitespace-pre-wrap text-[14px] italic text-text-secondary">{exercise.source_text_vi}</p>}
            </section>}

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

        <div className="flex min-h-[450px] w-full shrink-0 flex-col lg:w-1/2 lg:shrink bg-surface-subtle/50">
          <div className="mb-4 border-b border-border bg-surface px-6 py-4">
            <h2 className="text-[14px] font-semibold text-text-primary">
              {isVietnamese ? 'Bài viết của bạn' : 'Your writing'}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto px-6">
            <textarea
              value={content}
              disabled={isSubmitted}
              onChange={(e) => { setContent(e.target.value); if (reviewSessionId) reviewDraft.save(e.target.value) }}
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
