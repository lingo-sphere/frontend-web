'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/button'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { resolveAudioUrl, resolveImageUrl } from '@/utils/media.utils'
import { part1SessionService } from '../services/listening-part1-session.service'
import type {
  Part1Session,
  Part1SessionFilters,
  Part1SessionResult,
} from '../types/listening-part1-session'
import { PracticeExitConfirmModal } from './practice.exit-confirm.modal'

export function ListeningPart1SessionWorkspace({
  exerciseId,
  title,
  filters,
  onBack,
}: {
  exerciseId?: string
  title?: string
  filters: Part1SessionFilters
  onBack: () => void
}) {
  const { i18n } = useTranslation()
  const vi = i18n.language === 'vi'
  const user = useAuthStore((state) => state.user)
  const [preset, setPreset] = useState('standard')
  const [session, setSession] = useState<Part1Session | null>(null)
  const [result, setResult] = useState<Part1SessionResult | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [index, setIndex] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [remaining, setRemaining] = useState(0)
  const [showExit, setShowExit] = useState(false)
  const lock = useRef(false)
  const started = useRef(0)
  const question = session?.questions[index]
  const expired = Boolean(session && remaining <= 0)

  useEffect(() => {
    if (!session || result) return
    const tick = () =>
      setRemaining(
        Math.max(
          0,
          session.total_time_seconds -
            Math.floor((Date.now() - started.current) / 1000),
        ),
      )
    const timer = window.setInterval(tick, 1000)
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener('beforeunload', beforeUnload)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('beforeunload', beforeUnload)
    }
  }, [session, result])

  const start = async () => {
    if (lock.current) return
    if (!user?.user_id) {
      window.dispatchEvent(new CustomEvent('lingosphere:open-auth-modal'))
      return
    }
    lock.current = true
    setBusy(true)
    setError('')
    try {
      const next = await part1SessionService.create({
        ...filters,
        ...(exerciseId ? { exercise_ids: [exerciseId] } : {}),
        limit: exerciseId ? 1 : 6,
        random: !exerciseId,
        time_preset: preset,
      })
      started.current = Date.now()
      setRemaining(next.total_time_seconds)
      setSession(next)
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : vi
          ? 'Không tạo được phiên. Hãy thử lại.'
          : 'Could not start. Please retry.',
      )
    } finally {
      lock.current = false
      setBusy(false)
    }
  }
  const submit = async () => {
    if (!session || lock.current) return
    lock.current = true
    setBusy(true)
    setError('')
    try {
      const elapsed = Math.min(
        session.total_time_seconds,
        Math.max(0, Math.floor((Date.now() - started.current) / 1000)),
      )
      setResult(
        await part1SessionService.submit(session.session_id, answers, elapsed),
      )
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : vi
          ? 'Chưa lưu được kết quả. Hãy thử lại.'
          : 'Could not save. Please retry.',
      )
    } finally {
      lock.current = false
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 space-y-5">
      <Button
        variant="ghost"
        disabled={busy}
        onClick={() => (session && !result ? setShowExit(true) : onBack())}
      >
        {vi ? 'Quay lại' : 'Back'}
      </Button>
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 space-y-5">
        <h1 className="text-xl font-bold text-text-primary">
          {title ||
            (vi
              ? 'Luyện Part 1 theo bộ lọc'
              : 'Part 1 practice with your filters')}
        </h1>
        {error && (
          <p role="alert" className="text-red-500 text-sm">
            {error}
          </p>
        )}
        {!session ? (
          <>
            <p className="text-sm text-text-secondary">
              {vi
                ? 'Phiên luyện có bấm giờ và lưu kết quả vào lịch sử. Đáp án và giải thích hiển thị sau khi nộp bài.'
                : 'Timed practice with saved results. Answers and explanations appear after submission.'}
            </p>
            <label className="flex flex-wrap items-center gap-3 text-sm text-text-primary">
              {vi ? 'Thời gian cho phiên:' : 'Session time:'}
              <select
                aria-label={vi ? 'Thời gian cho phiên' : 'Session time'}
                value={preset}
                disabled={busy}
                onChange={(event) => setPreset(event.target.value)}
                className="rounded-lg border border-border bg-surface-subtle p-2"
              >
                <option value="quick">
                  {vi ? 'Nhanh · 30 giây' : 'Quick · 30 seconds'}
                </option>
                <option value="standard">
                  {vi ? 'Tiêu chuẩn · 48 giây' : 'Standard · 48 seconds'}
                </option>
                <option value="intensive">
                  {vi ? 'Luyện kỹ · 60 giây' : 'Intensive · 60 seconds'}
                </option>
              </select>
            </label>
            <Button disabled={busy} onClick={() => void start()}>
              {busy
                ? vi
                  ? 'Đang tạo phiên…'
                  : 'Starting…'
                : vi
                ? 'Bắt đầu luyện'
                : 'Start practice'}
            </Button>
          </>
        ) : result ? (
          <>
            <h2 className="text-lg font-semibold text-text-primary">
              {vi ? 'Kết quả đã lưu' : 'Results saved'}: {result.score_percent}%
            </h2>
            <p className="text-sm text-text-secondary">
              {result.correct_count}/{result.total_questions}{' '}
              {vi ? 'câu đúng' : 'correct'}
            </p>
            {result.details.map((detail) => (
              <div
                key={detail.question_index}
                className="rounded-xl border border-border p-4 text-sm space-y-2"
              >
                <p className="font-semibold text-text-primary">
                  {vi ? 'Câu' : 'Question'} {detail.question_index + 1} ·{' '}
                  {detail.is_correct
                    ? vi
                      ? 'Đúng'
                      : 'Correct'
                    : vi
                    ? 'Chưa đúng'
                    : 'Incorrect'}
                </p>
                <p className="text-text-secondary">
                  {vi ? 'Bạn chọn:' : 'Your answer:'}{' '}
                  {detail.user_answer || (vi ? 'Bỏ qua' : 'Skipped')}
                </p>
                <p className="text-text-primary">
                  {vi ? 'Đáp án:' : 'Answer:'} {detail.correct_answer}
                </p>
                <p className="text-text-secondary">{detail.transcript}</p>
                <p className="text-text-secondary">
                  {vi
                    ? detail.explanation_vi || detail.explanation
                    : detail.explanation}
                </p>
              </div>
            ))}
            <Button onClick={onBack}>
              {vi ? 'Về danh sách' : 'Back to exercises'}
            </Button>
          </>
        ) : (
          question && (
            <>
              <div className="flex justify-between gap-3 text-sm text-text-primary">
                <span>
                  {vi ? 'Câu' : 'Question'} {index + 1}/
                  {session.total_questions}
                </span>
                <span role="timer">
                  {vi ? 'Còn lại:' : 'Remaining:'} {remaining}s
                </span>
              </div>
              {expired && (
                <p role="status" className="text-amber-600 text-sm">
                  {vi
                    ? 'Hết thời gian. Hãy nộp bài để lưu kết quả.'
                    : 'Time is up. Submit to save your results.'}
                </p>
              )}
              {question.image_url && (
                <Image
                  unoptimized
                  width={960}
                  height={540}
                  src={resolveImageUrl(question.image_url)}
                  alt={vi ? 'Ảnh câu hỏi Part 1' : 'Part 1 question photograph'}
                  className="max-h-80 w-full object-contain rounded-xl"
                />
              )}
              {question.audio_url ? (
                <audio
                  key={question.question_id}
                  controls
                  preload="metadata"
                  src={resolveAudioUrl(question.audio_url)}
                  className="w-full"
                />
              ) : (
                <p role="alert">
                  {vi ? 'Bài chưa có audio khả dụng.' : 'Audio is unavailable.'}
                </p>
              )}
              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                aria-label={vi ? 'Đáp án' : 'Answers'}
              >
                {question.options.map((option) => (
                  <button
                    key={option.key}
                    disabled={busy || expired}
                    aria-pressed={answers[String(index)] === option.key}
                    onClick={() =>
                      setAnswers((previous) => ({
                        ...previous,
                        [String(index)]: option.key,
                      }))
                    }
                    className={`rounded-xl border p-4 font-semibold ${
                      answers[String(index)] === option.key
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-text-primary'
                    }`}
                  >
                    {option.key}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap justify-between gap-3">
                <Button
                  variant="outline"
                  disabled={index === 0 || busy}
                  onClick={() => setIndex(index - 1)}
                >
                  {vi ? 'Câu trước' : 'Previous'}
                </Button>
                {index < session.total_questions - 1 && (
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => setIndex(index + 1)}
                  >
                    {vi ? 'Câu tiếp' : 'Next'}
                  </Button>
                )}
                <Button disabled={busy} onClick={() => void submit()}>
                  {busy
                    ? vi
                      ? 'Đang lưu…'
                      : 'Saving…'
                    : vi
                    ? 'Nộp bài'
                    : 'Submit'}
                </Button>
              </div>
            </>
          )
        )}
      </div>
      <PracticeExitConfirmModal
        isOpen={showExit}
        onClose={() => setShowExit(false)}
        onConfirmExit={onBack}
        title={vi ? 'Thoát phiên luyện?' : 'Leave practice?'}
        description={
          vi
            ? 'Đồng hồ vẫn chạy khi mở hộp thoại này.'
            : 'The timer continues while this dialog is open.'
        }
        savedNotice={
          vi
            ? 'Đáp án hiện tại chưa được nộp. Chọn tiếp tục và nộp bài để lưu kết quả.'
            : 'Your current answers have not been submitted. Continue and submit to save results.'
        }
      />
    </main>
  )
}
