// Component giao diện React WritingExerciseDetail cho học viên
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Clock, BookOpen, Lightbulb } from 'lucide-react'
import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import type { WritingExercise, TimeMode } from '@/features/practice/types/writing'
import { resolveMediaUrlAsync } from '@/utils/media.utils'
import { WritingTimeModeSelector } from '@/features/practice/components/writing.time-mode-selector'

interface WritingExerciseDetailProps {
  exercise: WritingExercise
  onBack: () => void
  onStart: (timeSeconds: number) => void
}

export function WritingExerciseDetail({
  exercise,
  onBack,
  onStart,
}: WritingExerciseDetailProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [imageUrl, setImageUrl] = useState<string>('')
  const [showTimeSelector, setShowTimeSelector] = useState(false)

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
        console.error('[WritingExerciseDetail] Error resolving media:', err)
      })

    return () => {
      isMounted = false
    }
  }, [exercise.prompt_image_id, exercise.media_id])

  const levelColors = {
    BASIC: 'bg-emerald-100 text-emerald-700',
    INTERMEDIATE: 'bg-amber-100 text-amber-700',
    ADVANCED: 'bg-red-100 text-red-700',
  }

  const levelLabels = {
    BASIC: isVietnamese ? 'Cơ bản' : 'Basic',
    INTERMEDIATE: isVietnamese ? 'Trung bình' : 'Intermediate',
    ADVANCED: isVietnamese ? 'Nâng cao' : 'Advanced',
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-[14px] text-text-secondary hover:text-primary">
        <ArrowLeft size={18} />
        {isVietnamese ? 'Quay lại' : 'Back'}
      </button>

      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-[24px] font-bold text-text-primary">{exercise.title}</h1>
            {exercise.title_vi && <p className="mt-1 text-[14px] text-text-secondary">{exercise.title_vi}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className={`whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-medium ${levelColors[exercise.writing_level]}`}>
              {levelLabels[exercise.writing_level]} · {exercise.cefr_level}
            </span>
          </div>
        </div>
      </div>

      <section className="mb-4 rounded-xl border border-border p-4"><p className="font-semibold">{exercise.grading_standard === 'TOEIC' ? 'TOEIC Writing' : isVietnamese ? 'Giao tiếp thực tế · 0–100' : 'Practical communication · 0–100'}</p>{!!exercise.task_requirements?.length && <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">{exercise.task_requirements.map((requirement, index) => <li key={index}>{requirement}</li>)}</ul>}</section>
      {imageUrl && (
        <Card className="mb-6 overflow-hidden dashboard-card">
          <CardContent className="p-0">
            <img
              src={imageUrl}
              alt={exercise.title}
              className="w-full max-h-[420px] object-cover"
              loading="lazy"
            />
          </CardContent>
        </Card>
      )}

      {exercise.description && exercise.description.trim() && exercise.description !== exercise.instructions && (
        <Card className="mb-6 dashboard-card">
          <CardContent className="p-4">
            <p className="text-[14px] text-text-primary">{exercise.description_vi || exercise.description}</p>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6 dashboard-card">
        <CardContent className="p-6">
          <h2 className="mb-4 text-[16px] font-semibold text-text-primary">
            {isVietnamese ? 'Yêu cầu bài tập' : 'Exercise requirements'}
          </h2>

          {/* Time Mode Selector */}
          {showTimeSelector ? (
            <WritingTimeModeSelector
              exerciseType={exercise.exercise_type}
              onSelect={(_mode, seconds) => {
                setShowTimeSelector(false)
                onStart(seconds)
              }}
              onCancel={() => setShowTimeSelector(false)}
            />
          ) : null}

          {exercise.source_text && <section className="mb-6 rounded-lg bg-surface-subtle p-4">
              <h2 className="mb-2 text-[13px] font-semibold uppercase text-text-tertiary">{exercise.exercise_type === 'WRITE_EMAIL' ? (isVietnamese ? 'Email nguồn' : 'Original email') : (isVietnamese ? 'Văn bản nguồn' : 'Source text')}</h2>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-text-primary">{exercise.source_text}</p>
              {isVietnamese && exercise.source_text_vi && <p className="mt-2 whitespace-pre-wrap text-[14px] italic text-text-secondary">{exercise.source_text_vi}</p>}
            </section>}

          {exercise.prompt_en && (
            <div className="mb-6">
              <p className="mb-2 text-[12px] font-medium uppercase text-text-tertiary">
                {isVietnamese ? 'Câu/Đề bài' : 'Prompt/Question'}
              </p>
              <div className="rounded-lg bg-surface-subtle p-4">
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-text-primary">{exercise.prompt_en}</p>
                {exercise.prompt_vi && <p className="mt-2 text-[14px] italic text-text-secondary">{exercise.prompt_vi}</p>}
              </div>
            </div>
          )}

          {exercise.guiding_questions && exercise.guiding_questions.length > 0 && (
            <div className="mb-6 rounded-xl border border-primary/25 bg-primary/5 p-4">
              <p className="mb-2 text-[13px] font-semibold text-primary flex items-center gap-1.5">
                <span>💡</span>
                {isVietnamese ? '3 Câu hỏi gợi ý cho bức ảnh' : '3 Guiding Questions for the Picture'}
              </p>
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
            </div>
          )}

          {exercise.instructions && (
            <div className="mb-6">
              <p className="mb-2 text-[12px] font-medium uppercase text-text-tertiary">
                {isVietnamese ? 'Hướng dẫn' : 'Instructions'}
              </p>
              <p className="whitespace-pre-wrap text-[14px] text-text-secondary">{exercise.instructions}</p>
            </div>
          )}

          <div className="mb-6 space-y-2">
            <p className="text-[12px] font-medium uppercase text-text-tertiary">
              {isVietnamese ? 'Yêu cầu' : 'Requirements'}
            </p>
            <ul className="space-y-2">
              {exercise.min_words && exercise.max_words && (
                <li className="flex items-center gap-2 text-[14px] text-text-secondary">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-medium text-primary">✓</span>
                  {isVietnamese ? 'Số từ:' : 'Word count:'} {exercise.min_words}–{exercise.max_words} {isVietnamese ? 'từ' : 'words'}
                </li>
              )}
              {exercise.keywords && exercise.keywords.length > 0 && (
                <li className="flex items-center gap-2 text-[14px] text-text-secondary">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-medium text-primary">✓</span>
                  {isVietnamese ? 'Sử dụng các từ khóa:' : 'Use keywords:'} {exercise.keywords.join(', ')}
                </li>
              )}
              {exercise.exercise_type === 'PARAPHRASING' && (
                <>
                  <li className="flex items-center gap-2 text-[14px] text-text-secondary">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-medium text-primary">✓</span>
                    {isVietnamese ? 'Giữ nguyên nghĩa của câu gốc' : 'Keep the original meaning'}
                  </li>
                  <li className="flex items-center gap-2 text-[14px] text-text-secondary">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-medium text-primary">✓</span>
                    {isVietnamese ? 'Sử dụng cách diễn đạt của riêng bạn' : 'Use your own expressions'}
                  </li>
                </>
              )}
            </ul>
          </div>

          {exercise.keywords && exercise.keywords.filter(k => k && k.trim()).length > 0 && (
            <div className="mb-6">
              <p className="mb-3 text-[12px] font-medium uppercase text-text-tertiary">
                <BookOpen className="mr-1 inline h-4 w-4" />
                {isVietnamese ? 'Từ khóa cần có' : 'Required keywords'}
              </p>
              <div className="flex flex-wrap gap-2">
                {exercise.keywords.filter(k => k && k.trim()).map((keyword, index) => (
                  <span key={index} className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[13px] font-medium text-primary">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {exercise.writing_level !== 'BASIC' && exercise.ai_hints && exercise.ai_hints.length > 0 && (
            <div className="mb-6 rounded-lg bg-purple-50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[13px] font-medium text-purple-700">
                <Lightbulb className="w-4 h-4 text-purple-600" />
                <span>{isVietnamese ? 'Gợi ý từ AI' : 'AI Hints'}</span>
              </p>
              <ul className="space-y-1">
                {exercise.ai_hints.map((hint, index) => (
                  <li key={index} className="text-[13px] text-purple-600">• {hint}</li>
                ))}
              </ul>
            </div>
          )}

          {exercise.estimated_minutes && (
            <div className="flex items-center gap-2 text-[14px] text-text-tertiary">
              <Clock size={16} />
              <span>{isVietnamese ? 'Thời gian ước tính:' : 'Estimated time:'} {exercise.estimated_minutes} {isVietnamese ? 'phút' : 'minutes'}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mb-8 flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft size={16} className="mr-2" />
          {isVietnamese ? 'Quay lại' : 'Back'}
        </Button>
        {showTimeSelector ? (
          <Button variant="outline" onClick={() => setShowTimeSelector(false)}>
            {isVietnamese ? 'Hủy chọn' : 'Cancel'}
          </Button>
        ) : (
          <Button className="bg-primary hover:bg-primary-hover" onClick={() => setShowTimeSelector(true)}>
            {isVietnamese ? 'Chọn thời gian & Bắt đầu' : 'Select Time & Start'}
            <ArrowLeft size={16} className="ml-2 rotate-180" />
          </Button>
        )}
      </div>
    </main>
  )
}
