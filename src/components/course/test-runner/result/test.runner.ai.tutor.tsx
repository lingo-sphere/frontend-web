// Hiển thị phân tích lỗi sai và lời khuyên định hướng học tập từ gia sư trí tuệ nhân tạo.

'use client'

import {
  Bot,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Loader2,
  Target,
  XCircle,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { WrongQuestionItem, AiExplanationsData } from '../test.runner.types'

interface TestRunnerAiTutorProps {
  wrongQuestionsList: WrongQuestionItem[]
  isLoadingAi: boolean
  showAiDetails: boolean
  aiExplanations: AiExplanationsData | null
  onExplainMistakes: () => void
  onToggleAiDetails: () => void
}

export function TestRunnerAiTutor({
  wrongQuestionsList,
  isLoadingAi,
  showAiDetails,
  aiExplanations,
  onExplainMistakes,
  onToggleAiDetails,
}: TestRunnerAiTutorProps) {
  if (wrongQuestionsList.length === 0) return null

  return (
    <div className="p-4 rounded-2xl bg-purple-50/90 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-600 text-white shadow-xs">
            <Bot size={18} />
          </div>
          <div>
            <h5 className="text-xs font-bold text-purple-950 dark:text-purple-200 flex items-center gap-2">
              <span>Gia sư AI: Giải thích lỗi sai & Hướng dẫn học tập</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200/80 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 font-semibold">
                {wrongQuestionsList.length} câu chưa đúng
              </span>
            </h5>
            <p className="text-[11px] text-purple-700 dark:text-purple-300 mt-0.5">
              {isLoadingAi
                ? 'Đang phân tích nguyên nhân sai và đề xuất nội dung bạn nên chú trọng học thêm...'
                : aiExplanations?.summary ||
                  'Hệ thống đã phân tích chi tiết lỗi sai và chủ điểm kiến thức cần ôn tập.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={onExplainMistakes}
            disabled={isLoadingAi}
            variant="outline"
            size="sm"
            className="rounded-xl border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 text-xs font-semibold cursor-pointer h-8 px-2.5"
            title="Phân tích lại bằng AI"
          >
            <RotateCcw size={12} className={isLoadingAi ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Phân tích lại</span>
          </Button>
          {aiExplanations && (
            <Button
              onClick={onToggleAiDetails}
              variant="ghost"
              size="sm"
              className="rounded-xl text-purple-700 dark:text-purple-300 text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer h-8 px-2.5"
            >
              <span>{showAiDetails ? 'Thu gọn' : 'Xem toàn bộ'}</span>
              {showAiDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </Button>
          )}
        </div>
      </div>

      {isLoadingAi && !aiExplanations && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-purple-200/60 text-xs text-purple-800 dark:text-purple-300 animate-pulse">
          <Loader2
            size={15}
            className="animate-spin text-purple-600 dark:text-purple-400 shrink-0"
          />
          <span>
            Gia sư AI đang đối chiếu đáp án, bóc tách nguyên nhân sai và đề xuất các chủ điểm bạn
            nên chú trọng học thêm...
          </span>
        </div>
      )}

      {aiExplanations && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {aiExplanations.overall_advice && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-100/90 to-indigo-100/90 dark:from-purple-900/40 dark:to-indigo-900/40 border border-purple-300/80 dark:border-purple-700/60 text-xs space-y-1.5 shadow-xs">
              <div className="flex items-center gap-1.5 font-bold text-purple-950 dark:text-purple-100">
                <Target size={15} className="text-purple-600 dark:text-purple-400 shrink-0" />
                <span>🎯 Nên chú trọng học thêm chỗ nào (Định hướng từ AI):</span>
              </div>
              <p className="text-[12px] text-purple-950 dark:text-purple-200 leading-relaxed font-medium pl-5">
                {aiExplanations.overall_advice}
              </p>
            </div>
          )}

          {showAiDetails && (
            <div className="pt-2 border-t border-purple-200/60 dark:border-purple-800/40 space-y-2.5">
              <span className="text-[11px] font-bold text-purple-900 dark:text-purple-300 block uppercase tracking-wider">
                Danh sách chi tiết các câu sai & Chủ điểm kiến thức:
              </span>
              {aiExplanations.explanations.map((item, exIdx) => (
                <div
                  key={exIdx}
                  className="p-3.5 rounded-xl bg-white/95 dark:bg-slate-900/85 border border-purple-200/70 dark:border-purple-800/50 space-y-2 text-xs shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-text-primary">
                    <span className="text-purple-950 dark:text-purple-200">
                      Câu {item.question_number}: {item.question_text}
                    </span>
                    {item.recommended_topic && (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/70 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700 flex items-center gap-1">
                        <Target size={10} className="text-purple-600 dark:text-purple-400" />
                        <span>Chủ điểm: {item.recommended_topic}</span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/50 text-rose-800 dark:text-rose-200 space-y-0.5">
                      <div className="flex items-center gap-1 font-bold text-rose-700 dark:text-rose-300">
                        <XCircle size={12} className="shrink-0" />
                        <span>❌ Bạn đã chọn: {item.user_selected}</span>
                      </div>
                      <p className="leading-relaxed opacity-95 pl-4">{item.why_wrong}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-200 space-y-0.5">
                      <div className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300">
                        <CheckCircle size={12} className="shrink-0" />
                        <span>✅ Đáp án đúng: {item.correct_answer}</span>
                      </div>
                      <p className="leading-relaxed opacity-95 pl-4">{item.why_correct}</p>
                    </div>
                  </div>

                  {(item.study_focus || item.recommended_topic) && (
                    <div className="p-2.5 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 text-indigo-950 dark:text-indigo-200 text-[11px] leading-relaxed flex items-start gap-1.5">
                      <Target
                        size={12}
                        className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5"
                      />
                      <div>
                        <strong>Nên chú trọng học thêm: </strong>
                        {item.study_focus ||
                          `Cần ôn lại kỹ chủ điểm "${item.recommended_topic}" và luyện tập thêm bài tập liên quan.`}
                      </div>
                    </div>
                  )}

                  {item.trap_identified && (
                    <div className="px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 text-amber-900 dark:text-amber-200 text-[11px] flex items-center gap-1.5">
                      <span className="font-bold">⚠️ Bẫy cần tránh:</span>
                      <span>{item.trap_identified}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
