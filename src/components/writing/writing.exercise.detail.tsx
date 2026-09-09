// Component giao diện React WritingExerciseDetail cho học viên
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Clock, BookOpen } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { WritingExercise } from '@/types/writing'

interface WritingExerciseDetailProps {
  exercise: WritingExercise
  onBack: () => void
  onStart: () => void
}

export function WritingExerciseDetail({
  exercise,
  onBack,
  onStart,
}: WritingExerciseDetailProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

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
          <div>
            <h1 className="text-[24px] font-bold text-text-primary">{exercise.title}</h1>
            {exercise.title_vi && <p className="mt-1 text-[14px] text-text-secondary">{exercise.title_vi}</p>}
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-[12px] font-medium ${levelColors[exercise.writing_level]}`}>
              {levelLabels[exercise.writing_level]} · {exercise.cefr_level}
            </span>
          </div>
        </div>
      </div>

      <Card className="mb-6 dashboard-card">
        <CardContent className="p-4">
          <p className="text-[14px] text-text-primary">{exercise.description_vi || exercise.description}</p>
        </CardContent>
      </Card>

      <Card className="mb-6 dashboard-card">
        <CardContent className="p-6">
          <h2 className="mb-4 text-[16px] font-semibold text-text-primary">
            {isVietnamese ? 'Yêu cầu bài tập' : 'Exercise requirements'}
          </h2>

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

          {exercise.keywords && exercise.keywords.length > 0 && (
            <div className="mb-6">
              <p className="mb-3 text-[12px] font-medium uppercase text-text-tertiary">
                <BookOpen className="mr-1 inline h-4 w-4" />
                {isVietnamese ? 'Từ khóa cần có' : 'Required keywords'}
              </p>
              <div className="flex flex-wrap gap-2">
                {exercise.keywords.map((keyword, index) => (
                  <span key={index} className="inline-flex items-center rounded-full bg-surface-subtle px-3 py-1 text-[13px] text-secondary">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {exercise.writing_level !== 'BASIC' && exercise.ai_hints && exercise.ai_hints.length > 0 && (
            <div className="mb-6 rounded-lg bg-purple-50 p-4">
              <p className="mb-2 text-[13px] font-medium text-purple-700">
                💡 {isVietnamese ? 'Gợi ý từ AI' : 'AI Hints'}
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
        <Button className="bg-primary hover:bg-primary-hover" onClick={onStart}>
          {isVietnamese ? 'Bắt đầu viết' : 'Start writing'}
          <ArrowLeft size={16} className="ml-2 rotate-180" />
        </Button>
      </div>
    </main>
  )
}
