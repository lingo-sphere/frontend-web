// Modal luyện tập trắc nghiệm chuyên sâu theo từng chủ đề kiến thức (Targeted Topic Practice Drill).

'use client'

import { useState, useMemo } from 'react'
import {
  X,
  Target,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Loader2,
  Trophy,
} from 'lucide-react'
import { Button } from '@/components/button'
import { useTopicDrillQuery } from '@/features/practice/hooks/use.mistake.query'

interface TopicDrillModalProps {
  open: boolean
  onClose: () => void
  topicTag: string
}

export function TopicDrillModal({ open, onClose, topicTag }: TopicDrillModalProps) {
  const { data, isLoading, refetch } = useTopicDrillQuery(topicTag, 10, open)
  const questions = useMemo(() => data?.questions || [], [data])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [isFinished, setIsFinished] = useState(false)

  const currentQuestion = questions[currentIndex]

  const handleSelectOption = (opt: string) => {
    if (isAnswerRevealed) return
    setSelectedOption(opt)
  }

  const handleCheckAnswer = () => {
    if (!selectedOption || !currentQuestion) return
    const isCorrect = selectedOption === currentQuestion.correct_answer
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1)
    }
    setIsAnswerRevealed(true)
  }

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedOption(null)
      setIsAnswerRevealed(false)
    } else {
      setIsFinished(true)
    }
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setSelectedOption(null)
    setIsAnswerRevealed(false)
    setCorrectCount(0)
    setIsFinished(false)
    refetch()
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  if (!open) return null

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-surface border border-border shadow-2xl transition-all flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs">
              <Target size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <span>Luyện đề chuyên sâu theo chủ đề</span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                  {topicTag}
                </span>
              </h3>
              <p className="text-[11px] text-text-secondary">
                Rèn luyện phản xạ và củng cố vững chắc kiến thức câu sai
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-xl p-1.5 text-text-tertiary hover:bg-surface-hover hover:text-text-primary transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 size={32} className="animate-spin text-purple-600" />
              <p className="text-xs font-semibold text-text-secondary">
                Đang tuyển chọn các câu hỏi trắc nghiệm tương tự cho chủ đề &ldquo;{topicTag}&rdquo;...
              </p>
            </div>
          ) : questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                <Sparkles size={28} />
              </div>
              <h4 className="text-sm font-bold text-text-primary">
                Chưa có thêm câu hỏi cho chủ đề này
              </h4>
              <p className="text-xs text-text-secondary max-w-sm">
                Ngân hàng đề đang được bổ sung liên tục. Bạn hãy ôn lại câu hỏi trong sổ tay hoặc chọn chủ điểm khác nhé!
              </p>
              <Button onClick={handleClose} variant="outline" size="sm" className="mt-2">
                Đóng
              </Button>
            </div>
          ) : isFinished ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-500/25">
                <Trophy size={40} />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-text-primary">Hoàn thành bài luyện tập!</h4>
                <p className="text-xs text-text-secondary">
                  Chủ đề: <strong className="text-purple-600 dark:text-purple-400">{topicTag}</strong>
                </p>
              </div>

              <div className="flex items-center gap-4 py-3 px-6 rounded-2xl bg-surface-hover border border-border">
                <div className="text-center">
                  <div className="text-2xl font-black text-text-primary">
                    {correctCount}/{questions.length}
                  </div>
                  <div className="text-[11px] text-text-secondary font-medium">Số câu đúng</div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                    {Math.round((correctCount / questions.length) * 100)}%
                  </div>
                  <div className="text-[11px] text-text-secondary font-medium">Độ chính xác</div>
                </div>
              </div>

              <p className="text-xs text-text-secondary max-w-md">
                {correctCount === questions.length
                  ? 'Xuất sắc! Bạn đã hoàn toàn làm chủ kiến thức chủ đề này!'
                  : correctCount >= questions.length * 0.7
                  ? 'Rất tốt! Bạn đã tiến bộ rõ rệt và tự tin hơn rất nhiều với dạng câu hỏi này.'
                  : 'Đừng nản lòng! Hãy tiếp tục duy trì ôn tập lặp lại ngắt quãng để ghi nhớ sâu sắc nhé.'}
              </p>

              <div className="flex items-center gap-3 pt-2">
                <Button onClick={handleReset} variant="outline" size="sm" className="gap-1.5">
                  <RotateCcw size={14} />
                  <span>Luyện lại bài này</span>
                </Button>
                <Button onClick={handleClose} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                  Hoàn tất
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-text-secondary font-semibold">
                  <span>
                    Câu {currentIndex + 1} trên {questions.length}
                  </span>
                  <span>Đã đúng {correctCount} câu</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-secondary">
                  <div
                    className="h-full bg-purple-600 transition-all duration-300 rounded-full"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-secondary border border-border space-y-1.5">
                <p className="text-sm font-semibold text-text-primary leading-relaxed">
                  {currentQuestion.question_text}
                </p>
                {currentQuestion.question_text_vi && (
                  <p className="text-xs text-text-secondary italic">
                    {currentQuestion.question_text_vi}
                  </p>
                )}
              </div>

              <div className="space-y-2.5">
                {currentQuestion.options.map((opt, oIdx) => {
                  const letter = String.fromCharCode(65 + oIdx)
                  const isSelected = selectedOption === opt
                  const isCorrectAnswer = opt === currentQuestion.correct_answer

                  let optionStyle = 'bg-surface border-border hover:border-purple-300 dark:hover:border-purple-700'
                  if (isSelected && !isAnswerRevealed) {
                    optionStyle = 'bg-purple-500/10 border-purple-600 text-purple-700 dark:text-purple-300 font-semibold'
                  } else if (isAnswerRevealed) {
                    if (isCorrectAnswer) {
                      optionStyle = 'bg-emerald-500/15 border-emerald-600 text-emerald-700 dark:text-emerald-300 font-semibold'
                    } else if (isSelected && !isCorrectAnswer) {
                      optionStyle = 'bg-rose-500/15 border-rose-600 text-rose-700 dark:text-rose-300 line-through'
                    } else {
                      optionStyle = 'opacity-60 bg-surface border-border'
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={isAnswerRevealed}
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-xs text-left transition-all cursor-pointer ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-surface-hover text-[11px] font-bold text-text-secondary">
                          {letter}
                        </span>
                        <span className="text-text-primary">{opt}</span>
                      </div>
                      {isAnswerRevealed && isCorrectAnswer && (
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      )}
                      {isAnswerRevealed && isSelected && !isCorrectAnswer && (
                        <XCircle size={16} className="text-rose-600 shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>

              {isAnswerRevealed && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 space-y-1.5 text-xs animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-200">
                    <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
                    <span>Giải thích chi tiết:</span>
                  </div>
                  <p className="text-indigo-950 dark:text-indigo-200 leading-relaxed">
                    {currentQuestion.explanation ||
                      `Đáp án đúng là "${currentQuestion.correct_answer}". Dạng bài này kiểm tra kiến thức về "${topicTag}".`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {!isLoading && questions.length > 0 && !isFinished && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface-secondary/50">
            <span className="text-xs text-text-tertiary">
              {isAnswerRevealed ? 'Đã xem kết quả' : 'Chọn 1 phương án và kiểm tra'}
            </span>

            <div className="flex items-center gap-2">
              {!isAnswerRevealed ? (
                <Button
                  onClick={handleCheckAnswer}
                  disabled={!selectedOption}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer px-4"
                >
                  Kiểm tra
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer gap-1.5 px-4"
                >
                  <span>{currentIndex + 1 === questions.length ? 'Xem kết quả' : 'Câu kế tiếp'}</span>
                  <ArrowRight size={14} />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
