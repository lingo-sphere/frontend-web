// Thẻ hiển thị chi tiết câu hỏi, đáp án học viên chọn, bản ghi âm và đánh giá chấm điểm AI.
'use client'

import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Mic,
  PenTool,
  Sparkles,
  Bot,
  Volume2,
} from 'lucide-react'
import type { ToeicQuestion } from '@/features/toeic/types/toeic'

interface ToeicReviewQuestionCardProps {
  question: ToeicQuestion
  userAnswer?: string
  isExpanded: boolean
  onToggleExpand: () => void
  whisperTranscript?: string
  aiScore?: number
  aiFeedback?: {
    pronunciation_score?: number
    fluency_score?: number
    grammar_score?: number
    vocabulary_score?: number
    detailed_comment?: string
    improvement_tips?: string[]
  }
  isEvaluatingAI?: boolean
}

const getAudioSrc = (str?: string): string => {
  if (!str) return ''
  const trimmed = str.trim()
  if (/^data:audio/i.test(trimmed)) {
    const commaIdx = trimmed.indexOf(',')
    if (commaIdx !== -1) {
      const header = trimmed.substring(0, commaIdx).toLowerCase()
      const body = trimmed.substring(commaIdx + 1)
      return `${header},${body}`
    }
  }
  return trimmed
}

const isAudioContent = (str?: string): boolean => {
  if (!str) return false
  const s = str.trim().toLowerCase()
  return (
    s.startsWith('data:audio/') ||
    s.startsWith('blob:') ||
    s.includes('audio/webm') ||
    s.includes('audio/mp3') ||
    s.includes('audio/wav') ||
    s.includes('audio/ogg') ||
    s.includes('audio/m4a') ||
    /\.(mp3|wav|ogg|webm|m4a|aac)(\?.*)?$/i.test(s)
  )
}

export function ToeicReviewQuestionCard({
  question,
  userAnswer,
  isExpanded,
  onToggleExpand,
  whisperTranscript,
  aiScore,
  aiFeedback,
  isEvaluatingAI,
}: ToeicReviewQuestionCardProps) {
  const isWriting =
    question.questionType === 'WRITING' ||
    question.skillType === 'WRITING' ||
    String(question.partNumber).toLowerCase().includes('writ')
  const isSpeaking =
    !isWriting &&
    (question.questionType === 'SPEAKING' ||
      question.skillType === 'SPEAKING' ||
      String(question.partNumber).toLowerCase().includes('speak'))

  const selected = userAnswer || ''
  const isAudioAnswer = isAudioContent(selected)
  const isTextAnswer = isWriting || (!isAudioAnswer && selected.length > 15 && (!question.options || question.options.length === 0))
  const isAnswered = selected.trim() !== ''
  const isCorrect = isAnswered && !isAudioAnswer && !isTextAnswer && selected.trim().toUpperCase() === question.correctOption.trim().toUpperCase()

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        isWriting || isSpeaking
          ? 'border-indigo-200/60 dark:border-indigo-900/40 bg-surface'
          : isCorrect
          ? 'border-emerald-500/30 bg-emerald-50/5 dark:bg-emerald-950/10'
          : isAnswered
          ? 'border-rose-500/30 bg-rose-50/5 dark:bg-rose-950/10'
          : 'border-amber-500/30 bg-amber-50/5 dark:bg-amber-950/10'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
              isSpeaking
                ? 'bg-purple-600 text-white'
                : isWriting
                ? 'bg-indigo-600 text-white'
                : isCorrect
                ? 'bg-emerald-600 text-white'
                : isAnswered
                ? 'bg-rose-600 text-white'
                : 'bg-amber-500 text-white'
            }`}
          >
            {question.questionNumber}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-text-primary uppercase tracking-wide">
                Part {question.partNumber || 1}
              </span>
              {question.skillType && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-subtle text-text-tertiary">
                  {question.skillType}
                </span>
              )}
              {isAudioAnswer && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
                  <Mic size={10} /> Speaking
                </span>
              )}
              {isTextAnswer && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                  <PenTool size={10} /> Writing
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-text-primary font-medium leading-relaxed">
              {question.questionTextEn || question.questionTextVi || ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAudioAnswer || isSpeaking ? (
            aiScore !== undefined ? (
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                aiScore >= 50
                  ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30'
                  : 'text-rose-700 dark:text-rose-300 bg-rose-500/15 border border-rose-500/30'
              }`}>
                <Mic size={12} /> {aiScore >= 50 ? 'Đạt chuẩn' : 'Cần cải thiện'} • {aiScore}/100
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                <Mic size={12} /> {isEvaluatingAI ? 'Đang chấm điểm...' : 'Đã thu âm'}
              </span>
            )
          ) : isTextAnswer || isWriting ? (
            aiScore !== undefined ? (
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                aiScore >= 50
                  ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30'
                  : 'text-rose-700 dark:text-rose-300 bg-rose-500/15 border border-rose-500/30'
              }`}>
                <PenTool size={12} /> {aiScore >= 50 ? 'Đạt chuẩn' : 'Cần cải thiện'} • {aiScore}/100
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full">
                <PenTool size={12} /> Tự luận
              </span>
            )
          ) : isCorrect ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="hidden sm:inline">Chính xác</span>
            </span>
          ) : isAnswered ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
              <XCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Chưa đúng</span>
            </span>
          ) : (
            <span className="text-xs font-semibold text-amber-600">Bỏ qua</span>
          )}

          <button
            type="button"
            onClick={onToggleExpand}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {isAudioAnswer && (
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-purple-50/80 via-indigo-50/50 to-blue-50/30 dark:from-purple-950/30 dark:via-indigo-950/20 dark:to-slate-900 border border-purple-200/80 dark:border-purple-800/50 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300">
              <Mic className="w-4 h-4 text-purple-600 animate-pulse" />
              <span>Bản Ghi Âm Giọng Nói Của Bạn (Speaking Voice):</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              Audio Recorded
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-purple-100 dark:border-purple-900/40">
            <audio controls className="w-full h-10 rounded-lg" src={getAudioSrc(selected)} preload="auto" />
          </div>
        </div>
      )}

      {isTextAnswer && !isAudioAnswer && (
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <PenTool className="w-4 h-4 text-indigo-600" />
              <span>Bài Viết / Câu Trả Lời Của Bạn:</span>
            </div>
            <span className="text-[11px] text-slate-400 font-normal">
              {selected.split(/\s+/).filter(Boolean).length} từ
            </span>
          </div>
          <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            {selected}
          </div>
        </div>
      )}

      {question.options && question.options.length > 0 && (
        <div className="mt-3.5 space-y-2 pl-9">
          {question.options.map((opt) => {
            const isCorrectOption = opt.key.trim().toUpperCase() === question.correctOption.trim().toUpperCase()
            const isUserSelected = selected && selected.trim().toUpperCase() === opt.key.trim().toUpperCase()

            return (
              <div
                key={opt.key}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors ${
                  isCorrectOption
                    ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-950 dark:text-emerald-200 font-bold'
                    : isUserSelected
                    ? 'bg-rose-500/15 border border-rose-500/40 text-rose-950 dark:text-rose-200 font-semibold'
                    : 'bg-surface-subtle text-text-secondary border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      isCorrectOption
                        ? 'bg-emerald-600 text-white'
                        : isUserSelected
                        ? 'bg-rose-600 text-white'
                        : 'bg-surface text-text-tertiary border border-border'
                    }`}
                  >
                    {opt.key}
                  </span>
                  <span className="truncate">{opt.textEn}</span>
                </div>

                <div className="shrink-0 flex items-center gap-1.5 text-[10px] font-bold">
                  {isCorrectOption && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                      Đáp án đúng
                    </span>
                  )}
                  {isUserSelected && !isCorrectOption && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                      Bạn đã chọn
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {isAudioAnswer && !whisperTranscript && !aiFeedback && (
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-violet-50/70 via-purple-50/50 to-indigo-50/40 dark:from-violet-950/20 dark:via-purple-950/15 dark:to-indigo-950/15 border border-violet-200/60 dark:border-violet-800/40 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-violet-600 animate-spin shrink-0" />
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-violet-800 dark:text-violet-300">
              {isEvaluatingAI
                ? 'Hệ thống AI đang phân tích phát âm và chấm điểm bài nói của bạn...'
                : 'Bản ghi âm giọng nói đã được tải lên và lưu trữ an toàn.'}
            </p>
            <p className="text-[11px] text-text-tertiary">
              Whisper STT và AI Evaluator chấm điểm 4 tiêu chí: Phát âm, Độ trôi chảy, Ngữ pháp và Từ vựng.
            </p>
          </div>
        </div>
      )}

      {(whisperTranscript || aiScore !== undefined || aiFeedback) && (
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-violet-50/90 via-purple-50/60 to-indigo-50/40 dark:from-violet-950/30 dark:via-purple-950/20 dark:to-indigo-950/20 border border-violet-200/80 dark:border-violet-800/60 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-violet-700 dark:text-violet-300">
              <Bot className="w-4 h-4 text-violet-600" />
              <span>Đánh Giá & Chấm Điểm Từ AI (Whisper STT + AI Evaluator):</span>
            </div>
            {aiScore !== undefined && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-violet-600 text-white shadow-xs">
                Điểm AI: {aiScore}/100
              </span>
            )}
          </div>

          {whisperTranscript && (
            <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-violet-100 dark:border-violet-900/40 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-violet-600 dark:text-violet-400">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Nội dung bài nói đã nhận diện (Whisper STT Transcript):</span>
              </div>
              <p className="text-xs text-text-primary font-medium italic pl-1">
                "{whisperTranscript}"
              </p>
            </div>
          )}

          {aiFeedback && (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {aiFeedback.pronunciation_score !== undefined && (
                  <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-violet-100 dark:border-violet-900/40 text-center">
                    <span className="text-[10px] font-bold text-text-tertiary uppercase block">Phát âm</span>
                    <span className="text-xs font-black text-violet-600 dark:text-violet-400">
                      {aiFeedback.pronunciation_score}/100
                    </span>
                  </div>
                )}
                {aiFeedback.fluency_score !== undefined && (
                  <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-violet-100 dark:border-violet-900/40 text-center">
                    <span className="text-[10px] font-bold text-text-tertiary uppercase block">Trôi chảy</span>
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                      {aiFeedback.fluency_score}/100
                    </span>
                  </div>
                )}
                {aiFeedback.grammar_score !== undefined && (
                  <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-violet-100 dark:border-violet-900/40 text-center">
                    <span className="text-[10px] font-bold text-text-tertiary uppercase block">Ngữ pháp</span>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                      {aiFeedback.grammar_score}/100
                    </span>
                  </div>
                )}
                {aiFeedback.vocabulary_score !== undefined && (
                  <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-violet-100 dark:border-violet-900/40 text-center">
                    <span className="text-[10px] font-bold text-text-tertiary uppercase block">Từ vựng</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      {aiFeedback.vocabulary_score}/100
                    </span>
                  </div>
                )}
              </div>

              {aiFeedback.detailed_comment && (
                <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-violet-100 dark:border-violet-900/40 text-xs text-text-primary space-y-1">
                  <span className="font-bold text-violet-700 dark:text-violet-300 block">Nhận xét chi tiết từ AI:</span>
                  <p className="leading-relaxed whitespace-pre-wrap">{aiFeedback.detailed_comment}</p>
                </div>
              )}

              {aiFeedback.improvement_tips && aiFeedback.improvement_tips.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Gợi ý cải thiện:</span>
                  </span>
                  <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                    {aiFeedback.improvement_tips.map((tip, tIdx) => (
                      <li key={tIdx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {(question.explanationEn || question.explanationVi) && (
        <div className="mt-3.5 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-200 space-y-1">
          <span className="font-bold flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Giải thích đáp án chi tiết & Tiêu chuẩn chấm:</span>
          </span>
          {question.explanationEn && (
            <p className="text-[11.5px] leading-relaxed pl-4 font-medium">
              {question.explanationEn}
            </p>
          )}
          {question.explanationVi && (
            <p className="text-[11.5px] leading-relaxed pl-4 font-medium italic">
              {question.explanationVi}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
