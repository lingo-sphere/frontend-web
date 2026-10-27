// Hiển thị câu hỏi trắc nghiệm, các lựa chọn đáp án và đáp án chi tiết khi review.

'use client'

import { AlertCircle, Bot, Target, XCircle, CheckCircle, Loader2 } from 'lucide-react'
import {
  CourseTestQuestion,
  AiExplanationDetail,
  getCorrectOptionIndex,
} from '@/features/courses/types/test.runner.types'

interface TestRunnerQuestionItemProps {
  question: CourseTestQuestion
  index: number
  chosenIdx?: number
  isSubmitted: boolean
  isLocked?: boolean
  testAudioUrl?: string
  chapterTitle?: string
  matchingAiExp?: AiExplanationDetail
  isLoadingAi: boolean
  onSelectOption: (questionIndex: number, optionIndex: number) => void
}

export function TestRunnerQuestionItem({
  question,
  index,
  chosenIdx,
  isSubmitted,
  isLocked,
  testAudioUrl,
  chapterTitle,
  matchingAiExp,
  isLoadingAi,
  onSelectOption,
}: TestRunnerQuestionItemProps) {
  const options = question.options ?? []
  const correctIdx = isSubmitted ? getCorrectOptionIndex(question, options) : -1

  return (
    <div
      id={`question-card-${index}`}
      className={`p-5 rounded-2xl border transition-all scroll-mt-20 ${
        isSubmitted
          ? chosenIdx === correctIdx
            ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/10'
            : 'border-rose-500/40 bg-rose-500/5 dark:bg-rose-950/10'
          : chosenIdx !== undefined
          ? 'border-primary/40 bg-surface shadow-xs'
          : 'border-border bg-surface'
      }`}
    >
      <div className="flex items-start gap-3 mb-3.5">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl font-black text-xs ${
            chosenIdx !== undefined && !isSubmitted
              ? 'bg-primary text-white shadow-xs'
              : 'bg-primary/10 text-primary'
          }`}
        >
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary leading-relaxed">
            {question.question_text}
          </p>
          {isSubmitted && (
            <div className="mt-2">
              {chosenIdx === correctIdx ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-2xs">
                  <CheckCircle size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Làm đúng (+1 điểm)</span>
                </div>
              ) : chosenIdx !== undefined ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold shadow-2xs">
                  <XCircle size={14} className="text-rose-600 dark:text-rose-400" />
                  <span>Chưa chính xác (0 điểm)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold shadow-2xs">
                  <AlertCircle size={14} className="text-amber-600 dark:text-amber-400" />
                  <span>Chưa trả lời (0 điểm)</span>
                </div>
              )}
            </div>
          )}
          {question.media_url &&
            (question.media_url.match(/\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i) ||
            question.media_url.includes('audio') ||
            question.media_url.includes('quiz-audio') ? (
              question.media_url !== testAudioUrl ? (
                <div className="mt-2.5 max-w-md rounded-xl overflow-hidden border border-border">
                  <audio controls src={question.media_url} className="w-full" />
                </div>
              ) : null
            ) : (
              <div className="mt-3 max-w-xl xl:max-w-2xl rounded-2xl overflow-hidden border border-border bg-surface-subtle shadow-2xs">
                <img
                  src={question.media_url}
                  alt={`Question ${index + 1}`}
                  className="w-full object-contain max-h-80"
                />
              </div>
            ))}
        </div>
      </div>

      <div className="space-y-2 pl-9">
        {options.map((opt, optIdx) => {
          const isSelected = chosenIdx === optIdx
          const isCorrectAnswer = isSubmitted && optIdx === correctIdx
          const isWrongSelected = isSubmitted && isSelected && optIdx !== correctIdx

          return (
            <button
              key={optIdx}
              type="button"
              disabled={isSubmitted || isLocked}
              onClick={() => onSelectOption(index, optIdx)}
              className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-3 cursor-pointer ${
                isCorrectAnswer
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold'
                  : isWrongSelected
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 line-through'
                  : isSelected
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                  : 'border-border/70 hover:border-primary/50 bg-surface-subtle/30 text-text-secondary hover:text-text-primary'
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                  isCorrectAnswer
                    ? 'bg-emerald-500 text-white'
                    : isWrongSelected
                    ? 'bg-rose-500 text-white'
                    : isSelected
                    ? 'bg-primary text-white'
                    : 'bg-surface border border-border text-text-tertiary'
                }`}
              >
                {String.fromCharCode(65 + optIdx)}
              </span>
              <span className="flex-1">{opt}</span>
              {isCorrectAnswer && (
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                  Đáp án đúng
                </span>
              )}
              {isWrongSelected && (
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
                  Lựa chọn của bạn
                </span>
              )}
            </button>
          )
        })}
      </div>

      {isSubmitted &&
        (() => {
          const isWrong = chosenIdx !== correctIdx
          const chosenLetter = chosenIdx !== undefined ? String.fromCharCode(65 + chosenIdx) : 'Chưa chọn'
          const chosenText = chosenIdx !== undefined ? options[chosenIdx] : 'Chưa trả lời'
          const correctLetter = String.fromCharCode(65 + correctIdx)
          const correctText = options[correctIdx] || ''
          const effectiveExplanation =
            question.explanation ||
            `Đáp án đúng là ${correctLetter}. Hãy chú ý các từ khóa và ngữ cảnh ngữ pháp quan trọng trong câu hỏi để chọn đáp án chuẩn xác nhất.`

          if (isWrong) {
            return (
              <div className="mt-4 ml-0 sm:ml-9 p-4 rounded-2xl bg-purple-50/90 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 shadow-xs space-y-3 animate-in fade-in duration-200">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-200/60 dark:border-purple-800/40 pb-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-950 dark:text-purple-200">
                    <Bot size={15} className="text-purple-600 dark:text-purple-400" />
                    <span>Đáp án chi tiết & Phân tích chuyên sâu</span>
                  </div>
                  {(matchingAiExp?.recommended_topic || chapterTitle) && (
                    <span className="text-[10.5px] px-2.5 py-0.5 rounded-full bg-purple-200/80 dark:bg-purple-900/70 text-purple-900 dark:text-purple-200 font-semibold flex items-center gap-1">
                      <Target size={11} className="text-purple-600 dark:text-purple-400" />
                      <span>Chủ điểm: {matchingAiExp?.recommended_topic || chapterTitle}</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/50 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-300">
                      <XCircle size={13} className="shrink-0" />
                      <span>❌ Lựa chọn của bạn ({chosenLetter}):</span>
                    </div>
                    <p className="text-[11.5px] text-rose-950 dark:text-rose-200 leading-relaxed font-medium pl-4.5">
                      {matchingAiExp?.why_wrong ||
                        (chosenIdx !== undefined
                          ? `Bạn đã chọn "${chosenLetter}. ${chosenText}". Lựa chọn này chưa chuẩn xác với quy tắc ngữ pháp hoặc ngữ cảnh của đề bài.`
                          : 'Bạn chưa đưa ra câu trả lời cho câu hỏi này.')}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                      <CheckCircle size={13} className="shrink-0" />
                      <span>✅ Đáp án chính xác ({correctLetter}):</span>
                    </div>
                    <p className="text-[11.5px] text-emerald-950 dark:text-emerald-200 leading-relaxed font-medium pl-4.5">
                      {matchingAiExp?.why_correct ||
                        `"${correctLetter}. ${correctText}" là phương án đúng.`}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
                    💡 Giải thích chi tiết:
                  </span>
                  <p className="text-[11.5px] leading-relaxed pl-4 font-medium">
                    {effectiveExplanation}
                  </p>
                </div>

                {isLoadingAi && !matchingAiExp && (
                  <div className="flex items-center gap-2 py-2 text-xs text-purple-700 dark:text-purple-300 animate-pulse">
                    <Loader2
                      size={14}
                      className="animate-spin text-purple-600 dark:text-purple-400 shrink-0"
                    />
                    <span>
                      Gia sư AI đang đối chiếu và tổng hợp hướng dẫn ôn tập trọng tâm...
                    </span>
                  </div>
                )}

                {matchingAiExp && (
                  <>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-50/90 to-purple-50/90 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200/70 dark:border-indigo-800/60 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-950 dark:text-indigo-200 text-xs">
                        <Target size={13} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>🎯 Nên chú trọng học thêm chỗ nào:</span>
                      </div>
                      <p className="text-[11.5px] text-indigo-950 dark:text-indigo-200 leading-relaxed pl-5 font-semibold">
                        {matchingAiExp.study_focus ||
                          (matchingAiExp.recommended_topic
                            ? `Bạn nên chú trọng học thêm phần "${matchingAiExp.recommended_topic}". Hãy ôn lại các dạng bài tập tương tự để nắm chắc bản chất.`
                            : `Bạn nên chú trọng học thêm các bài học trong chương "${
                                chapterTitle || 'này'
                              }", ôn lại từ vựng và cấu trúc tương ứng.`)}
                      </p>
                    </div>

                    {matchingAiExp.trap_identified && (
                      <div className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-1.5">
                        <span className="font-bold shrink-0">⚠️ Cạm bẫy cần tránh:</span>
                        <span className="opacity-95">{matchingAiExp.trap_identified}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          }

          return (
            <div className="mt-4 ml-0 sm:ml-9 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 shadow-xs space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between gap-2 border-b border-emerald-500/20 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  <CheckCircle size={15} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Đáp án chi tiết & Lời giải thích</span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-200">
                  Bạn đã chọn đúng: {correctLetter}
                </span>
              </div>

              <div className="text-xs space-y-1.5">
                <div className="p-2.5 rounded-xl bg-surface border border-emerald-500/20 text-emerald-950 dark:text-emerald-200">
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">
                    ✅ Lựa chọn chính xác: {correctLetter}. {correctText}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface border border-border text-xs text-text-secondary leading-relaxed">
                  <span className="font-bold text-primary">💡 Giải thích chi tiết: </span>
                  <span>{effectiveExplanation}</span>
                </div>
              </div>
            </div>
          )
        })()}
    </div>
  )
}
