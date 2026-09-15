// Component hiển thị chi tiết câu hỏi, lựa chọn và giải thích cho từng câu bài làm.

import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Card } from '@/components/card'
import { Badge } from '@/components/badge'

export interface AttemptAnswerDetail {
  question_number: number
  selected_option?: string
  correct_option: string
  is_correct: boolean
  is_skipped: boolean
  question_id?: {
    question_text_en?: string
    question_text_vi?: string
    options?: Array<{ key: string; text_en: string; text_vi?: string }>
    explanation_en?: string
    explanation_vi?: string
    correct_option?: string
    image_url?: string
    audio_url?: string
  }
}

export interface CourseQuestionDetail {
  question_number: number
  question_text: string
  options: string[]
  correct_answer: string
  correct_index?: number
  selected_index?: number
  selected_option?: string
  is_correct?: boolean
  explanation?: string
  media_url?: string
  image_url?: string
}

interface ToeicQuestionCardProps {
  answer: AttemptAnswerDetail
}

export function ToeicQuestionCard({ answer }: ToeicQuestionCardProps) {
  const q = answer.question_id
  const isCorrect = answer.is_correct
  const isSkipped = answer.is_skipped || !answer.selected_option
  const correctKey = answer.correct_option

  return (
    <Card
      className={`p-5 rounded-2xl border text-xs space-y-3 transition-all ${
        isCorrect
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : isSkipped
          ? 'border-amber-500/30 bg-amber-500/5'
          : 'border-rose-500/30 bg-rose-500/5'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-black text-text-primary text-sm">
          Câu {answer.question_number}:
        </span>
        {isCorrect ? (
          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-full text-xs">
            <CheckCircle size={13} /> Làm đúng
          </span>
        ) : isSkipped ? (
          <span className="inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-full text-xs">
            <AlertCircle size={13} /> Chưa làm
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 font-bold text-rose-700 dark:text-rose-300 bg-rose-500/15 px-2.5 py-1 rounded-full text-xs">
            <XCircle size={13} /> Chưa chính xác
          </span>
        )}
      </div>

      {q?.question_text_en && (
        <p className="text-text-primary text-sm leading-relaxed">{q.question_text_en}</p>
      )}

      {q?.image_url && (
        <div className="max-w-md rounded-xl overflow-hidden border border-border">
          <img
            src={q.image_url}
            alt={`Câu ${answer.question_number}`}
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {q?.audio_url && (
        <div className="pt-1">
          <audio controls className="w-full h-8" src={q.audio_url} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
        <div className="p-3 rounded-xl bg-surface border border-border">
          <span className="font-semibold text-text-secondary block">
            Lựa chọn của bạn:
          </span>
          <span
            className={`text-sm font-black ${
              isCorrect
                ? 'text-emerald-600 dark:text-emerald-400'
                : isSkipped
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-rose-600 dark:text-rose-400 line-through'
            }`}
          >
            {answer.selected_option ?? 'Chưa chọn'}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-surface border border-border">
          <span className="font-semibold text-text-secondary block">
            Đáp án chuẩn xác:
          </span>
          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
            {correctKey}
          </span>
        </div>
      </div>

      {q?.options && q.options.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
          {q.options.map((opt, oIdx) => {
            const optKey = opt.key || ['A', 'B', 'C', 'D'][oIdx]
            const isUserChoice = answer.selected_option === optKey
            const isOptCorrect = correctKey === optKey

            return (
              <div
                key={oIdx}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                  isOptCorrect
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold'
                    : isUserChoice
                    ? 'border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-300 font-semibold'
                    : 'border-border bg-surface-subtle/50 text-text-secondary'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isOptCorrect
                      ? 'bg-emerald-600 text-white'
                      : isUserChoice
                      ? 'bg-rose-600 text-white'
                      : 'bg-border text-text-tertiary'
                  }`}
                >
                  {optKey}
                </span>
                <span className={`flex-1 ${!isOptCorrect && isUserChoice ? 'line-through' : ''}`}>
                  {opt.text_en || opt.text_vi}
                </span>
                {isOptCorrect && (
                  <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
                {!isOptCorrect && isUserChoice && (
                  <XCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      )}

      {q?.explanation_en && (
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-200">
          <span className="font-bold text-blue-700 dark:text-blue-300 block mb-1">
            💡 Giải thích chi tiết:
          </span>
          <p className="leading-relaxed">{q.explanation_en}</p>
        </div>
      )}
      {q?.explanation_vi && (
        <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/10 text-blue-900 dark:text-blue-200">
          <span className="font-bold text-blue-700 dark:text-blue-300 block mb-1">
            💡 Giải thích (Tiếng Việt):
          </span>
          <p className="leading-relaxed italic">{q.explanation_vi}</p>
        </div>
      )}
    </Card>
  )
}

interface CourseQuestionCardProps {
  question: CourseQuestionDetail
  courseTitle?: string
  courseId?: string
}

export function CourseQuestionCard({
  question,
  courseTitle,
  courseId,
}: CourseQuestionCardProps) {
  const isAnswered =
    (question.selected_index !== undefined && question.selected_index >= 0) ||
    Boolean(question.selected_option)
  const isCorrect = question.is_correct === true
  const isSkipped = !isAnswered

  const selectedLabel = (() => {
    if (question.selected_index !== undefined && question.selected_index >= 0) {
      const letter = ['A', 'B', 'C', 'D'][question.selected_index] || String(question.selected_index + 1)
      const text = question.options?.[question.selected_index]
      return text ? `${letter}. ${text}` : letter
    }
    if (question.selected_option) {
      return question.selected_option
    }
    return 'Chưa chọn'
  })()

  const correctLabel = (() => {
    if (question.correct_index !== undefined && question.correct_index >= 0) {
      const letter = ['A', 'B', 'C', 'D'][question.correct_index] || String(question.correct_index + 1)
      const text = question.options?.[question.correct_index]
      return text ? `${letter}. ${text}` : letter
    }
    if (question.correct_answer) {
      return question.correct_answer
    }
    return 'Đang cập nhật'
  })()

  return (
    <Card
      className={`p-5 rounded-2xl border text-xs space-y-3 transition-all ${
        isCorrect
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : isSkipped
          ? 'border-amber-500/30 bg-amber-500/5'
          : 'border-rose-500/30 bg-rose-500/5'
      }`}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="font-black text-text-primary text-sm">
            Câu {question.question_number}:
          </span>
          {isCorrect ? (
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-full text-xs">
              <CheckCircle size={13} /> Làm đúng (+1 điểm)
            </span>
          ) : isSkipped ? (
            <span className="inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-full text-xs">
              <AlertCircle size={13} /> Chưa làm
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-bold text-rose-700 dark:text-rose-300 bg-rose-500/15 px-2.5 py-1 rounded-full text-xs">
              <XCircle size={13} /> Chưa chính xác (0 điểm)
            </span>
          )}
        </div>
        {courseTitle && (
          <Badge variant="outline" className="text-[10px] font-bold">
            {courseTitle}
          </Badge>
        )}
      </div>

      {question.question_text && (
        <p className="text-text-primary text-sm leading-relaxed">{question.question_text}</p>
      )}

      {question.image_url && (
        <div className="max-w-md rounded-xl overflow-hidden border border-border">
          <img
            src={question.image_url}
            alt={`Câu ${question.question_number}`}
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {question.media_url && (
        <div className="pt-1">
          <audio controls className="w-full h-8" src={question.media_url} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
        <div className="p-3 rounded-xl bg-surface border border-border">
          <span className="font-semibold text-text-secondary block">
            Lựa chọn của bạn:
          </span>
          <span
            className={`text-sm font-black ${
              isCorrect
                ? 'text-emerald-600 dark:text-emerald-400'
                : isSkipped
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-rose-600 dark:text-rose-400 line-through'
            }`}
          >
            {selectedLabel}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-surface border border-border">
          <span className="font-semibold text-text-secondary block">
            Đáp án chuẩn xác:
          </span>
          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
            {correctLabel}
          </span>
        </div>
      </div>

      {question.options && question.options.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
          {question.options.map((opt, oIdx) => {
            const optKey = ['A', 'B', 'C', 'D'][oIdx] || String(oIdx + 1)
            const isOptCorrect =
              question.correct_index === oIdx ||
              question.correct_answer === optKey ||
              question.correct_answer?.toLowerCase() === opt.toLowerCase() ||
              question.correct_answer?.startsWith(optKey)

            const isOptSelected =
              question.selected_index === oIdx ||
              question.selected_option === optKey ||
              question.selected_option?.toLowerCase() === opt.toLowerCase() ||
              question.selected_option?.startsWith(optKey)

            return (
              <div
                key={oIdx}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                  isOptCorrect
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold'
                    : isOptSelected
                    ? 'border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-300 font-semibold'
                    : 'border-border bg-surface-subtle/50 text-text-secondary'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isOptCorrect
                      ? 'bg-emerald-600 text-white'
                      : isOptSelected
                      ? 'bg-rose-600 text-white'
                      : 'bg-border text-text-tertiary'
                  }`}
                >
                  {optKey}
                </span>
                <span className={`flex-1 ${!isOptCorrect && isOptSelected ? 'line-through' : ''}`}>
                  {opt}
                </span>
                {isOptCorrect && (
                  <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
                {!isOptCorrect && isOptSelected && (
                  <XCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      )}

      {question.explanation && (
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-200 text-xs">
          <span className="font-bold text-blue-700 dark:text-blue-300 block mb-1">
            💡 Giải thích chi tiết:
          </span>
          <p className="leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </Card>
  )
}
