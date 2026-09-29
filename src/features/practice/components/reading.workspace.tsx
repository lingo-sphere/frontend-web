/**
 * @file reading.workspace.tsx
 * @description Màn hình không gian luyện tập Reading Practice với Giao diện Split-Screen 2 bên đồng bộ
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { Icon } from '@/components/icon.map'
import { Button } from '@/components/button'
import { Card, CardContent } from '@/components/card'
import { VocabQuickPopover } from './vocab.quick.popover'
import type {
  ReadingPassage,
  ReadingQuestion,
  ReadingType,
  TimerPresetMode,
  ReadingAttemptResult,
} from '../types/reading'
import { readingPracticeService } from '../services/reading-practice.service'

interface ReadingWorkspaceProps {
  passage: ReadingPassage
  onBack: () => void
  onComplete?: () => void
}

export function ReadingWorkspace({ passage, onBack, onComplete }: ReadingWorkspaceProps) {
  const readingType: ReadingType = passage.reading_type || 'PART_7'
  const questions: ReadingQuestion[] = passage.questions || []

  // Timer & Preset States
  const [timerPreset, setTimerPreset] = useState<TimerPresetMode>('STANDARD')
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true)
  const [elapsedTime, setElapsedTime] = useState<number>(0)

  // Question & Answers State
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [attemptResult, setAttemptResult] = useState<ReadingAttemptResult | null>(null)
  const [showResultModal, setShowResultModal] = useState<boolean>(false)

  // Target Vocab State for interactive popover
  const currentQuestion = questions[activeQuestionIndex]

  // Calculate target timer duration based on preset and question count
  const targetSeconds = useMemo(() => {
    const qCount = Math.max(1, questions.length)
    if (timerPreset === 'QUICK') return qCount * 30 // 30s per question
    if (timerPreset === 'STANDARD') return qCount * 60 // 60s per question
    return qCount * 120 // 120s per question
  }, [questions.length, timerPreset])

  // Reset timer when preset or passage changes
  useEffect(() => {
    setTimeLeft(targetSeconds)
    setElapsedTime(0)
    setIsTimerActive(true)
  }, [targetSeconds, passage._id])

  // Timer tick effect
  useEffect(() => {
    if (!isTimerActive || showResultModal) return

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsTimerActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isTimerActive, showResultModal])

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Handle selecting answer for a question
  const handleSelectOption = (questionId: string, optionKey: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }))
  }

  // Submit attempt to backend
  const handleSubmitAttempt = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setIsTimerActive(false)

    try {
      const answersPayload = questions.map((q) => ({
        question_id: q._id || q.id || '',
        user_answer: userAnswers[q._id || q.id || ''] || '',
        time_spent_seconds: Math.round(elapsedTime / Math.max(1, questions.length)),
      }))

      const result = await readingPracticeService.submitAttempt({
        passage_id: passage._id || passage.id || '',
        answers: answersPayload,
      })

      setAttemptResult(result)
      setShowResultModal(true)
    } catch (err) {
      console.error('Lỗi nộp bài đọc:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if all questions are answered
  const answeredCount = Object.keys(userAnswers).length
  const isAllAnswered = questions.length > 0 && answeredCount === questions.length

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] w-full gap-3 overflow-hidden">
      {/* Top Bar Navigation & Timer Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 bg-surface p-3 shadow-xs">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-xs">
            <Icon name="arrow-left" size={16} />
            <span>Quay lại</span>
          </Button>

          <div className="h-4 w-px bg-border" />

          <div>
            <h2 className="text-sm font-bold text-text-primary line-clamp-1">
              {passage.title_vi || passage.title}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
              <span className="rounded bg-primary/10 px-1.5 py-0.5 font-semibold text-primary">
                {passage.cefr_level || 'B1'}
              </span>
              <span>• {passage.word_count || 0} từ</span>
              <span>• {questions.length} câu hỏi</span>
            </div>
          </div>
        </div>

        {/* Timer & Preset Controls */}
        <div className="flex items-center gap-3">
          {/* 3 Mốc Thời Gian Timer Presets */}
          {(readingType === 'PART_6' || readingType === 'PART_7') && (
            <div className="flex items-center rounded-lg bg-surface-elevated p-1 border border-border/40">
              <button
                type="button"
                onClick={() => setTimerPreset('QUICK')}
                className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-all ${
                  timerPreset === 'QUICK'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text-tertiary hover:text-text-primary'
                }`}
              >
                ⚡ Quick (30s/câu)
              </button>
              <button
                type="button"
                onClick={() => setTimerPreset('STANDARD')}
                className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-all ${
                  timerPreset === 'STANDARD'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text-tertiary hover:text-text-primary'
                }`}
              >
                🎯 Standard (60s/câu)
              </button>
              <button
                type="button"
                onClick={() => setTimerPreset('INTENSIVE')}
                className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-all ${
                  timerPreset === 'INTENSIVE'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text-tertiary hover:text-text-primary'
                }`}
              >
                🔍 Intensive (120s/câu)
              </button>
            </div>
          )}

          {/* Clock Display */}
          <div className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-mono font-bold text-primary">
            <Icon name="clock" size={14} className={timeLeft <= 30 ? 'animate-pulse text-error' : ''} />
            <span className={timeLeft <= 30 ? 'text-error' : ''}>{formatTime(timeLeft)}</span>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={handleSubmitAttempt}
            disabled={isSubmitting || questions.length === 0}
            className="gap-1.5 text-xs font-semibold"
          >
            {isSubmitting ? <Icon name="loader" className="animate-spin" size={14} /> : <Icon name="check-circle" size={14} />}
            <span>Nộp bài ({answeredCount}/{questions.length})</span>
          </Button>
        </div>
      </div>

      {/* Main Split-Screen Workspace Container (50/50 Layout) */}
      <div className="grid flex-1 grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden min-h-0">
        
        {/* LEFT PANEL: Passage / Document / Scenario / Info Cards */}
        <div className="flex flex-col rounded-2xl border border-border/50 bg-surface overflow-hidden shadow-xs">
          <div className="border-b border-border/40 bg-surface-elevated/50 px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="book-open" size={15} className="text-primary" />
              <span>Nội dung bài đọc & Thông tin dữ liệu</span>
            </span>
            <span className="text-[11px] text-text-tertiary">
              Click từ vựng để tra nghĩa
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            
            {/* RENDER 1: TOEIC Part 6 (Text Completion) */}
            {readingType === 'PART_6' && (
              <div className="prose prose-sm dark:prose-invert max-w-none text-text-primary leading-relaxed whitespace-pre-line text-sm">
                {renderPart6Content(passage.content, questions, userAnswers, (qIdx) => setActiveQuestionIndex(qIdx))}
              </div>
            )}

            {/* RENDER 2: TOEIC Part 7 (Document Format) */}
            {readingType === 'PART_7' && (
              <div className="rounded-xl border border-border/60 bg-surface-elevated p-5 shadow-xs space-y-4">
                <div className="border-b border-border/40 pb-3">
                  <h3 className="text-base font-bold text-text-primary">{passage.title}</h3>
                  {passage.source && <p className="text-xs text-text-tertiary">Nguồn: {passage.source}</p>}
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none text-text-primary leading-relaxed text-sm whitespace-pre-line">
                  {passage.content}
                </div>
              </div>
            )}

            {/* RENDER 3: REAL-WORLD TASK-BASED READING */}
            {readingType === 'REAL_WORLD_TASK' && (
              <div className="space-y-4">
                {/* Mission Brief Box */}
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <Icon name="target" size={16} />
                    <span>Nhiệm vụ của bạn (Mission Brief)</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed font-medium">
                    {passage.passage_metadata?.scenario_description || passage.content}
                  </p>

                  {/* Requirements Checklist */}
                  {passage.passage_metadata?.requirements && (
                    <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-primary/10">
                      {passage.passage_metadata.requirements.map((req, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-text-primary font-semibold">
                          <Icon name="check-circle-2" size={14} className="text-success shrink-0" />
                          <span>{req.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Data Cards (Hotel listings, Flight options, Products...) */}
                {passage.passage_metadata?.data_cards ? (
                  <div className="grid grid-cols-1 gap-3">
                    {passage.passage_metadata.data_cards.map((card) => (
                      <div key={card.id} className="rounded-xl border border-border/60 bg-surface p-3.5 hover:border-primary/40 transition-all shadow-2xs">
                        <div className="flex items-center justify-between border-b border-border/30 pb-2 mb-2">
                          <h4 className="text-xs font-bold text-text-primary">{card.title}</h4>
                          {card.subtitle && <span className="text-xs font-bold text-primary">{card.subtitle}</span>}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary">
                          {Object.entries(card.details).map(([key, val]) => (
                            <div key={key} className="flex justify-between gap-1">
                              <span className="text-text-tertiary">{key}:</span>
                              <span className="font-medium text-text-primary">{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="prose prose-sm text-text-primary leading-relaxed text-sm whitespace-pre-line">
                    {passage.content}
                  </div>
                )}
              </div>
            )}

            {/* RENDER 4: INFORMATION MATCHING */}
            {readingType === 'INFO_MATCHING' && (
              <div className="space-y-3">
                {passage.passage_metadata?.info_paragraphs ? (
                  passage.passage_metadata.info_paragraphs.map((p) => (
                    <div key={p.key} className="rounded-xl border border-border/60 bg-surface-elevated p-4 space-y-1.5">
                      <div className="inline-flex items-center rounded-md bg-primary px-2 py-0.5 text-xs font-bold text-white">
                        Đoạn [{p.key}] - {p.title}
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">{p.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="prose prose-sm text-text-primary leading-relaxed text-sm whitespace-pre-line">
                    {passage.content}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* RIGHT PANEL: Questions & Options Selection */}
        <div className="flex flex-col rounded-2xl border border-border/50 bg-surface overflow-hidden shadow-xs">
          
          {/* Question Pills Navigation Header */}
          <div className="border-b border-border/40 bg-surface-elevated/50 p-3 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1.5">
              {questions.map((q, idx) => {
                const qId = q._id || q.id || ''
                const isAnswered = Boolean(userAnswers[qId])
                const isActive = idx === activeQuestionIndex

                return (
                  <button
                    key={qId}
                    type="button"
                    onClick={() => setActiveQuestionIndex(idx)}
                    className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-primary text-white ring-2 ring-primary/40 shadow-xs'
                        : isAnswered
                        ? 'bg-success/20 text-success border border-success/40'
                        : 'bg-surface-elevated text-text-secondary border border-border/40 hover:bg-surface-hover'
                    }`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
            <span className="text-xs text-text-tertiary font-medium shrink-0">
              Câu {activeQuestionIndex + 1} / {questions.length}
            </span>
          </div>

          {/* Question Details & Option Choices Container */}
          {currentQuestion ? (
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              
              {/* Question Skill Tag & Header */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary uppercase tracking-wider">
                    {currentQuestion.exercise_type || 'READING_QUESTION'}
                  </span>
                  {currentQuestion.line_start && (
                    <span className="text-[11px] text-text-tertiary">
                      dòng {currentQuestion.line_start} - {currentQuestion.line_end}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-text-primary leading-snug">
                  Câu {activeQuestionIndex + 1}: {currentQuestion.question_text_en}
                </h3>

                {currentQuestion.question_text_vi && (
                  <p className="text-xs text-text-tertiary italic">
                    {currentQuestion.question_text_vi}
                  </p>
                )}
              </div>

              {/* Options List (A, B, C, D) */}
              <div className="space-y-2.5">
                {(currentQuestion.options || currentQuestion.question_data?.options || []).map((opt) => {
                  const qId = currentQuestion._id || currentQuestion.id || ''
                  const isSelected = userAnswers[qId] === opt.key

                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handleSelectOption(qId, opt.key)}
                      className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-xs transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/30 font-medium text-text-primary shadow-xs'
                          : 'border-border/60 bg-surface-elevated hover:border-primary/40 hover:bg-surface-hover text-text-secondary'
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-primary text-white'
                            : 'bg-surface text-text-secondary border border-border'
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span className="mt-0.5 flex-1 leading-relaxed">{opt.text}</span>
                    </button>
                  )
                })}
              </div>

              {/* Target Vocab Popover */}
              <VocabQuickPopover vocabularies={[]} />

              {/* Previous / Next Question Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-border/40">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={activeQuestionIndex === 0}
                  className="gap-1 text-xs"
                >
                  <Icon name="chevron-left" size={14} />
                  <span>Câu trước</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  disabled={activeQuestionIndex === questions.length - 1}
                  className="gap-1 text-xs"
                >
                  <span>Câu tiếp</span>
                  <Icon name="chevron-right" size={14} />
                </Button>
              </div>

            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-xs text-text-tertiary">
              Chưa có câu hỏi cho bài đọc này.
            </div>
          )}

        </div>
      </div>

      {/* RESULTS MODAL UPON SUBMISSION */}
      {showResultModal && attemptResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl border border-border space-y-5 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon name="award" size={32} />
              </div>
              <h3 className="text-lg font-bold text-text-primary">Kết quả bài làm Reading</h3>
              <p className="text-xs text-text-tertiary">
                Bạn đã hoàn thành bài đọc {passage.title}
              </p>
            </div>

            {/* Score Card Stats */}
            <div className="grid grid-cols-3 gap-3 rounded-xl bg-surface-elevated p-4 text-center border border-border/40">
              <div>
                <div className="text-xl font-black text-primary">{attemptResult.score_percent}%</div>
                <div className="text-[11px] text-text-tertiary">Điểm chính xác</div>
              </div>
              <div>
                <div className="text-xl font-black text-success">
                  {attemptResult.correct_count}/{attemptResult.total_questions}
                </div>
                <div className="text-[11px] text-text-tertiary">Số câu đúng</div>
              </div>
              <div>
                <div className="text-xl font-black text-text-primary">
                  {formatTime(attemptResult.time_spent_seconds || elapsedTime)}
                </div>
                <div className="text-[11px] text-text-tertiary">Thời gian</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button
                variant="default"
                onClick={() => {
                  setShowResultModal(false)
                  if (onComplete) onComplete()
                  else onBack()
                }}
                className="w-full justify-center"
              >
                Hoàn tất & Quay về
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Helper renderer cho TOEIC Part 6 (Text Completion)
 * Biến các vị trí `[1]`, `[2]`, `[3]` thành interactive badge buttons
 */
function renderPart6Content(
  text: string,
  questions: ReadingQuestion[],
  answers: Record<string, string>,
  onSelectBlank: (qIndex: number) => void
) {
  if (!text) return null
  const regex = /\[(\d+)\]/g
  const parts = []
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    const blankNum = parseInt(match[1], 10)
    const qIdx = questions.findIndex((q) => q.question_number === blankNum || questions.indexOf(q) + 1 === blankNum)
    const q = questions[qIdx]
    const qId = q ? (q._id || q.id || '') : ''
    const selectedKey = answers[qId]
    const options = q ? (q.options || q.question_data?.options || []) : []
    const selectedOptionText = options.find((o) => o.key === selectedKey)?.text

    // Push preceding normal text
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    // Push Interactive Blank Badge
    parts.push(
      <button
        key={`blank-${blankNum}-${match.index}`}
        type="button"
        onClick={() => onSelectBlank(qIdx >= 0 ? qIdx : 0)}
        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold transition-all mx-1 ${
          selectedOptionText
            ? 'bg-primary/20 text-primary border border-primary/40 ring-1 ring-primary/20'
            : 'bg-warning/20 text-warning-dark border border-warning/40 animate-pulse'
        }`}
      >
        <span className="underline decoration-dashed">[{blankNum}]</span>
        {selectedOptionText ? (
          <span className="font-bold text-primary">{selectedOptionText}</span>
        ) : (
          <span className="italic opacity-80">(Chọn đáp án)</span>
        )}
      </button>
    )

    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts
}
