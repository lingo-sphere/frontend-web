/**
 * @file grammar.workspace.tsx
 * @description Không gian luyện tập ngữ pháp tương tác (Grammar Practice Session Workspace)
 */

'use client'

import { useState } from 'react'
import { useGrammarSession } from '../hooks/use.grammar.session'
import { GrammarMedia } from './grammar.media'
import { DictionaryModal } from '@/features/vocabulary/components/dictionary.modal'
import { toast } from '@/store/toast.store'
import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import { Icon } from '@/components/icon.map'
import { useNavigate } from '@/lib/navigation'
import { PracticeExitConfirmModal } from './practice.exit-confirm.modal'
import type {
  GrammarSession,
  GrammarQuestionItem,
} from '../types/grammar-practice'

interface GrammarWorkspaceProps {
  session: GrammarSession
  userId?: string
  onClose: () => void
  onRetry: () => void
}

export function GrammarWorkspace({ session, userId, onClose, onRetry }: GrammarWorkspaceProps) {
  const navigate = useNavigate()
  const state = useGrammarSession(session, userId)
  const { index: currentIndex, currentAnswer, result: sessionResult, submitting: isSubmitting } = state
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [exitError, setExitError] = useState('')
  const [lookupWord, setLookupWord] = useState('')
  const currentQuestion: GrammarQuestionItem | undefined = session.questions[currentIndex]
  const totalQuestions = session.total_questions
  const checkedState = { isChecked: Boolean(state.checked), isCorrect: state.checked?.is_correct || false }
  const reorderSelectedWords = currentAnswer ? currentAnswer.split(' ') : []
  const locked = !state.ready || state.checking || isSubmitting || state.pending || checkedState.isChecked
  const formattedTime = Math.floor(state.seconds / 60).toString().padStart(2, '0') + ':' + (state.seconds % 60).toString().padStart(2, '0')
  const handleInitiateExit = () => { if (sessionResult) onClose(); else { state.setPaused(true); setShowExitConfirm(true) } }
  const handleResume = () => { state.setPaused(false); setShowExitConfirm(false) }
  const handleConfirmExit = async () => { try { await state.exit(); onClose() } catch { setExitError('Chưa đồng bộ được bản nháp. Hãy thử lại hoặc tiếp tục làm bài.'); setShowExitConfirm(false); state.setPaused(false) } }
  const handleSelectWord = (word: string) => state.change([...reorderSelectedWords, word].join(' '))
  const handleRemoveWord = (index: number) => state.change(reorderSelectedWords.filter((_word, i) => i !== index).join(' '))
  const handleResetReorder = () => state.change('')
  const handleCheckAnswer = () => { void state.check() }
  const handleNextOrFinish = () => { if (currentIndex < totalQuestions - 1) state.next(); else void state.submit() }
  if (!currentQuestion) return <p role="alert">Phiên không có câu hỏi. <Button onClick={onClose}>Quay lại</Button></p>

  // ==========================================================================
  // RENDER: KẾT QUẢ PHIÊN LUYỆN TẬP
  // ==========================================================================
  if (sessionResult) {
    const isPassed = sessionResult.accuracy_rate >= 80

    return (
      <div className="mx-auto max-w-2xl px-4 py-8 animate-in fade-in zoom-in-95 duration-200">
        <Card className="overflow-hidden border border-border shadow-2xl">
          <div className={`p-8 text-center text-white ${isPassed ? 'bg-gradient-to-r from-success to-emerald-600' : 'bg-gradient-to-r from-primary to-indigo-600'}`}>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-3xl shadow-inner">
              {isPassed ? '🏆' : '🎯'}
            </div>
            <h2 className="text-2xl font-bold">
              {isPassed ? 'Hoàn thành xuất sắc!' : 'Đã hoàn thành phiên luyện tập!'}
            </h2>
            <p className="mt-1 text-sm text-white/80">{session.topic_name_vi}</p>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-xl bg-surface-subtle p-4">
                <span className="text-xs text-text-tertiary">Độ chính xác</span>
                <p className={`mt-1 text-2xl font-black ${sessionResult.accuracy_rate >= 80 ? 'text-success' : 'text-primary'}`}>
                  {sessionResult.accuracy_rate}%
                </p>
              </div>

              <div className="rounded-xl bg-surface-subtle p-4">
                <span className="text-xs text-text-tertiary">Số câu đúng</span>
                <p className="mt-1 text-2xl font-black text-text-primary">
                  {sessionResult.correct_count} / {sessionResult.total_questions}
                </p>
              </div>

              <div className="rounded-xl bg-surface-subtle p-4">
                <span className="text-xs text-text-tertiary">Thời gian làm</span>
                <p className="mt-1 text-2xl font-black text-text-primary">{formattedTime}</p>
              </div>
            </div>

            {/* Note about Mistake Vault */}
            {sessionResult.incorrect_count + sessionResult.skipped_count > 0 && (
              <div className="rounded-xl border border-warning/30 bg-warning/10 p-4">
                <div className="flex items-start gap-3">
                  <Icon name="alertCircle" className="mt-0.5 text-warning flex-shrink-0" size={18} />
                  <div className="text-xs text-text-primary">
                    <span className="font-bold">Đã tự động lưu {sessionResult.incorrect_count + sessionResult.skipped_count} câu sai/bỏ qua vào Sổ tay lỗi sai:</span>
                    <p className="mt-0.5 text-text-secondary">
                      Bạn có thể ôn tập lại bất kỳ lúc nào với thuật toán lặp lại ngắt quãng (SRS) để ghi nhớ bền vững.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <section className="space-y-3"><h3 className="font-bold">Chi tiết bài làm</h3>{sessionResult.details.map(detail => <div key={detail.question_index} className="rounded-xl border border-border p-3 text-sm"><p className="font-semibold">Câu {detail.question_index + 1}: {detail.question_text_en || session.questions[detail.question_index]?.question_text_en}</p><p>{detail.is_correct ? 'Đúng' : detail.user_answer ? 'Chưa đúng' : 'Bỏ qua'} · Đáp án của bạn: {detail.user_answer || '(Bỏ qua)'}</p><p>Đáp án đúng: {detail.correct_answer}</p>{(detail.explanation_vi || detail.explanation) && <p className="mt-2 text-text-secondary">{detail.explanation_vi || detail.explanation}</p>}</div>)}</section>
            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={onRetry}
              >
                <Icon name="rotateCcw" size={16} />
                Luyện tập lại
              </Button>

              {sessionResult.incorrect_count > 0 && (
                <Button
                  variant="outline"
                  className="flex-1 gap-2 text-warning hover:border-warning/50 hover:bg-warning/10"
                  onClick={() => navigate('/practice/mistakes')}
                >
                  <Icon name="bookOpen" size={16} />
                  Ôn tập lỗi sai
                </Button>
              )}

              <Button
                variant="default"
                className="flex-1 gap-2"
                onClick={onClose}
              >
                <Icon name="check" size={16} />
                Về danh sách chủ đề
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ==========================================================================
  // RENDER: WORKSPACE ĐANG LÀM BÀI
  // ==========================================================================
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100)

  return (
    <div className="mx-auto max-w-3xl px-4 py-4 sm:py-6">
      {(state.error || exitError) && <div role="alert" className="mb-3 rounded-lg border border-red-300 p-3 text-sm">{state.error || exitError}</div>}
      {state.saveError && <div role="alert" className="mb-3 rounded-lg border border-amber-300 p-3 text-sm">{state.saveError} <button type="button" className="underline" onClick={() => void state.save().catch(() => {})}>Đồng bộ lại</button> <button type="button" className="underline" onClick={() => window.location.reload()}>Tải lại phiên</button></div>}
      <Card className="overflow-hidden border border-border shadow-xl">
        {/* Workspace Top Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface-subtle px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-white">
              {session.cefr_level}
            </span>
            <h3 className="text-sm font-semibold text-text-primary sm:text-base line-clamp-1">
              {session.topic_name_vi}
            </h3>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-text-secondary">
              <Icon name="clock" size={14} />
              <span>{formattedTime}</span>
            </div>

            <button
              type="button"
              aria-label="Tạm dừng và quay lại" disabled={!state.ready || state.checking || isSubmitting} onClick={handleInitiateExit}
              className="rounded-lg p-1 text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary cursor-pointer"
            >
              <Icon name="x" size={18} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-surface-subtle">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Question Meta & Question Index */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Câu {currentIndex + 1} / {totalQuestions}
            </span>
            <span className="text-xs text-text-tertiary">
              {currentQuestion.question_type === 'MULTIPLE_CHOICE' && 'Trắc nghiệm'}
              {currentQuestion.question_type === 'FILL_BLANK' && 'Điền vào chỗ trống'}
              {currentQuestion.question_type === 'ORDERING' && 'Sắp xếp câu'}
            </span>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <p className="text-lg font-semibold text-text-primary leading-relaxed sm:text-xl">
              {currentQuestion.question_text_en}
            </p>
            {currentQuestion.question_text_vi && (
              <p className="text-sm text-text-secondary italic">
                {currentQuestion.question_text_vi}
              </p>
            )}
          </div>

          {/* Quick Vocab Popover for embedded words/phrases */}
          {currentQuestion.instruction_vi || currentQuestion.instruction_en ? <p className="text-sm text-text-secondary">{currentQuestion.instruction_vi || currentQuestion.instruction_en}</p> : null}
          {currentQuestion.media_id && <GrammarMedia key={currentQuestion.media_id} id={currentQuestion.media_id} />}
          {Boolean(currentQuestion.target_vocabularies?.length) && <div className="flex flex-wrap gap-2">{currentQuestion.target_vocabularies?.map(word => <Button key={word.word} variant="outline" size="sm" onClick={() => setLookupWord(word.word)}>{word.word}{word.pos ? ' (' + word.pos + ')' : ''}</Button>)}</div>}

          {/* INTERACTION TYPES */}
          {/* 1. MULTIPLE CHOICE */}
          {currentQuestion.question_type === 'MULTIPLE_CHOICE' && currentQuestion.options && (
            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              {currentQuestion.options.map((opt) => {
                const isSelected = currentAnswer.toUpperCase() === opt.key.toUpperCase()
                return (
                  <button
                    key={opt.key}
                    type="button"
                    disabled={locked}
                    onClick={() => state.change(opt.key)}
                    className={`flex items-center gap-3.5 rounded-xl border p-4 text-left font-medium transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary shadow-sm ring-2 ring-primary/20'
                        : 'border-border bg-surface-subtle hover:border-primary/40 hover:bg-surface-elevated text-text-primary'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        isSelected ? 'bg-primary text-white' : 'bg-surface-elevated text-text-secondary'
                      }`}
                    >
                      {opt.key}
                    </span>
                    <span className="text-sm sm:text-base leading-snug">{opt.text}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* 2. FILL IN THE BLANK */}
          {currentQuestion.question_type === 'FILL_BLANK' && (
            <div className="space-y-3 pt-2">
              <label className="text-xs font-medium text-text-secondary">
                Nhập câu trả lời chính xác:
              </label>
              <input
                type="text"
                disabled={locked}
                value={currentAnswer}
                onChange={(e) => state.change(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !locked && currentAnswer.trim()) {
                    handleCheckAnswer()
                  }
                }}
                placeholder="Nhập từ hoặc cụm từ..."
                className="w-full rounded-xl border border-border bg-surface-subtle px-4 py-3 text-base font-medium text-text-primary placeholder:text-text-tertiary focus:border-primary focus:bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}

          {/* 3. SENTENCE REORDERING */}
          {currentQuestion.question_type === 'ORDERING' && currentQuestion.ordering_items && (
            <div className="space-y-4 pt-2">
              {/* Drop area / Sentence Constructed */}
              <div className="min-h-[64px] rounded-xl border-2 border-dashed border-primary/30 bg-surface-subtle p-3 flex flex-wrap items-center gap-2">
                {reorderSelectedWords.length === 0 ? (
                  <span className="text-sm text-text-tertiary select-none">
                    Nhấp vào các khối từ bên dưới để ghép thành câu đúng...
                  </span>
                ) : (
                  reorderSelectedWords.map((word, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={locked}
                      onClick={() => handleRemoveWord(idx)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover active:scale-95 transition-all"
                    >
                      <span>{word}</span>
                      <Icon name="x" size={13} className="opacity-70" />
                    </button>
                  ))
                )}
              </div>

              {/* Word Bank */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                    Ngân hàng từ:
                  </span>
                  {reorderSelectedWords.length > 0 && !checkedState.isChecked && (
                    <button
                      type="button"
                      disabled={locked} onClick={handleResetReorder}
                      className="text-xs font-medium text-text-secondary hover:text-primary transition-colors"
                    >
                      Đặt lại
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {currentQuestion.ordering_items.map((word, idx) => {
                    const timesUsed = reorderSelectedWords.filter((w) => w === word).length
                    const timesInSource = currentQuestion.ordering_items?.filter((w) => w === word).length || 1
                    const isExhausted = timesUsed >= timesInSource

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isExhausted || locked}
                        onClick={() => handleSelectWord(word)}
                        className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-all ${
                          isExhausted
                            ? 'border-border bg-surface-subtle text-text-tertiary opacity-40 cursor-not-allowed'
                            : 'border-border bg-surface-elevated text-text-primary shadow-sm hover:border-primary/40 hover:bg-surface-subtle active:scale-95'
                        }`}
                      >
                        {word}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* CHECK RESULT BANNER */}
          {checkedState.isChecked && (
            <div
              className={`rounded-xl p-4 animate-in fade-in duration-200 ${
                checkedState.isCorrect
                  ? 'border border-success/30 bg-success/10 text-success'
                  : 'border border-error/30 bg-error/10 text-error'
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon
                  name={checkedState.isCorrect ? 'checkCircle2' : 'xCircle'}
                  className="mt-0.5 flex-shrink-0"
                  size={20}
                />
                <div className="flex-1 space-y-1">
                  <p className="font-bold text-sm sm:text-base">
                    {checkedState.isCorrect ? 'Chính xác! Làm rất tốt!' : 'Chưa chính xác!'}
                  </p>
                  {!checkedState.isCorrect && (
                    <p className="text-xs text-text-secondary">
                      Câu sai sẽ được lưu vào Sổ tay lỗi sai khi bạn nộp cả bài.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {state.checked && <div className="rounded-lg bg-surface-subtle p-3 text-sm"><p className="font-semibold">Đáp án đúng: {state.checked.correct_answer}</p>{(state.checked.explanation_vi || state.checked.explanation) && <p className="mt-2">{state.checked.explanation_vi || state.checked.explanation}</p>}</div>}
          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-between border-t border-border pt-5">
            <span className="text-xs text-text-tertiary">
              {currentIndex + 1} của {totalQuestions} câu
            </span>

            <div className="flex items-center gap-3">
              {!checkedState.isChecked && !state.pending ? (
                <Button
                  variant="default"
                  disabled={!currentAnswer.trim() || locked}
                  onClick={handleCheckAnswer}
                  className="min-w-[120px]"
                >
                  {state.checking ? 'Đang kiểm tra…' : 'Kiểm tra'}
                </Button>
              ) : (
                <Button
                  variant="default"
                  disabled={isSubmitting || state.checking || !state.ready}
                  onClick={state.pending ? () => void state.submit() : handleNextOrFinish}
                  className="min-w-[140px] gap-2"
                >
                  <span>{state.pending ? 'Thử nộp lại' : currentIndex < totalQuestions - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}</span>
                  <Icon name="arrowRight" size={16} />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <DictionaryModal open={Boolean(lookupWord)} initialQuery={lookupWord} onOpenChange={open => { if (!open) setLookupWord('') }} userId={userId} onAction={message => { if (/không thể|thất bại|cần đăng nhập|failed|please login/i.test(message)) toast.error(message); else toast.success(message) }} />
      {/* Hộp thoại xác nhận tạm dừng & thoát phiên */}
      <PracticeExitConfirmModal
        isOpen={showExitConfirm}
        onClose={handleResume}
        onConfirmExit={handleConfirmExit}
        title="Tạm dừng bài luyện ngữ pháp?"
        description="Đồng hồ đếm thời gian đang được tạm ngưng. Bạn có chắc muốn dừng bài luyện tập ngữ pháp này?"
        savedNotice="Đáp án và thời gian được lưu để làm tiếp. Câu sai chưa được thêm vào Sổ tay lỗi sai; bạn cần mở lại phiên và nộp cả bài thành công."
      />
    </div>
  )
}
