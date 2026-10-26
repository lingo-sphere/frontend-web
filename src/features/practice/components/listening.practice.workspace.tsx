'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/button'
import { useListeningMedia } from '../hooks/use.listening.media'
import { listeningLifecycleService } from '../services/listening-lifecycle.service'
import { useListeningLifecycle } from '../hooks/use.listening.lifecycle'
import type {
  ListeningGroup,
  ListeningKind,
} from '../types/listening-lifecycle'

const presets = {
  part1: [30, 48, 60],
  part2: [200, 250, 375],
  part3: [585, 780, 1170],
  part4: [450, 600, 900],
  dictation: [],
}
export function ListeningPracticeWorkspace({
  kind,
  exerciseId,
  resumeId,
  title,
  filters,
  onStarted,
  onBack,
}: {
  kind: ListeningKind
  exerciseId?: string
  resumeId?: string
  title?: string
  filters: {
    context_id?: string
    cefr_level?: string
    difficulty?: string
    subtype?: string
  }
  onStarted: (id: string) => void
  onBack: () => void
}) {
  const { i18n } = useTranslation(),
    vi = i18n.language === 'vi'
  const [preset, setPreset] = useState('standard'),
    [difficulty, setDifficulty] = useState('MEDIUM')
  const practice = useListeningLifecycle(kind, resumeId, onStarted)
  const { session, draft, result, busy, error, remaining, saveStatus } =
    practice
  const group = session?.groups[draft.current_index]
  const expired = Boolean(session && remaining <= 0)
  const [hints, setHints] = useState<
    Record<string, { hint: string; hints_remaining: number }>
  >({})
  const [hintBusy, setHintBusy] = useState(''),
    [hintError, setHintError] = useState('')
  const requestHint = async (key: string) => {
    if (!session || hintBusy || busy) return
    setHintBusy(key)
    setHintError('')
    try {
      const next = await listeningLifecycleService.hint(session.id, key)
      setHints((previous) => ({ ...previous, [key]: next }))
    } catch (failure) {
      setHintError(
        failure instanceof Error ? failure.message : 'Không lấy được gợi ý',
      )
    } finally {
      setHintBusy('')
    }
  }

  const leave = async () => {
    if (session && !result) {
      try {
        await practice.save()
      } catch {
        return
      }
    }
    onBack()
  }
  return (
    <main className="mx-auto max-w-5xl px-4 py-6 space-y-5">
      <Button variant="ghost" disabled={busy} onClick={() => void leave()}>
        {session && !result
          ? vi
            ? 'Lưu và quay lại'
            : 'Save and go back'
          : vi
          ? 'Quay lại'
          : 'Back'}
      </Button>
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-7 space-y-5">
        <h1 className="text-xl font-bold text-text-primary">
          {title ||
            session?.title ||
            (kind === 'dictation'
              ? 'Dictation'
              : kind.replace('part', 'Part '))}
        </h1>
        {hintError && (
          <p role="alert" className="text-sm text-red-500">
            {hintError}
          </p>
        )}
        {error && (
          <div role="alert" className="text-sm text-red-500 space-y-2">
            <p>{error}</p>
            {session && (
              <p>
                {vi
                  ? 'Đáp án trên màn hình vẫn được giữ. Có thể thử lưu lại hoặc tải bản đã lưu.'
                  : 'Your answers are kept. Retry saving or load the saved version.'}
              </p>
            )}
          </div>
        )}
        {session && !result && (
          <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
            <span role="status">
              {saveStatus === 'saving'
                ? vi
                  ? 'Đang lưu tiến độ…'
                  : 'Saving progress…'
                : saveStatus === 'saved'
                ? vi
                  ? 'Đã lưu tiến độ'
                  : 'Progress saved'
                : saveStatus === 'error'
                ? vi
                  ? 'Chưa đồng bộ được tiến độ'
                  : 'Progress not synced'
                : vi
                ? 'Tự động lưu tiến độ'
                : 'Progress saves automatically'}
            </span>
            {saveStatus === 'error' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => void practice.save().catch(() => undefined)}
                >
                  {vi ? 'Lưu lại' : 'Retry save'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => void practice.reload()}
                >
                  {vi ? 'Tải bản đã lưu' : 'Load saved version'}
                </Button>
              </>
            )}
          </div>
        )}
        {!session ? (
          resumeId ? (
            <div className="space-y-3">
              <p>
                {busy
                  ? vi
                    ? 'Đang phục hồi phiên…'
                    : 'Restoring session…'
                  : vi
                  ? 'Không tải được phiên. Hãy kiểm tra kết nối và thử lại.'
                  : 'Could not restore session. Check your connection and retry.'}
              </p>
              {!busy && (
                <Button onClick={() => window.location.reload()}>
                  {vi ? 'Thử lại' : 'Retry'}
                </Button>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-text-secondary">
                {vi
                  ? 'Phiên luyện có bấm giờ và tự lưu tiến độ. Có thể tiếp tục sau khi tải lại trang hoặc quay lại danh sách.'
                  : 'Timed practice with saved progress. Resume after reloading or returning to the catalog.'}
              </p>
              {kind === 'dictation' ? (
                <label className="flex flex-wrap items-center gap-3 text-sm text-text-primary">
                  {vi ? 'Mức luyện:' : 'Practice level:'}
                  <select
                    aria-label={vi ? 'Mức luyện' : 'Practice level'}
                    value={difficulty}
                    disabled={busy}
                    onChange={(event) => setDifficulty(event.target.value)}
                    className="rounded-lg border border-border bg-surface-subtle p-2"
                  >
                    <option value="EASY">{vi ? 'Dễ' : 'Easy'}</option>
                    <option value="MEDIUM">
                      {vi ? 'Trung bình' : 'Medium'}
                    </option>
                    <option value="HARD">{vi ? 'Khó' : 'Hard'}</option>
                  </select>
                </label>
              ) : (
                <label className="flex flex-wrap items-center gap-3 text-sm text-text-primary">
                  {vi ? 'Thời gian cho phiên:' : 'Session time:'}
                  <select
                    aria-label={vi ? 'Thời gian cho phiên' : 'Session time'}
                    value={preset}
                    disabled={busy}
                    onChange={(event) => setPreset(event.target.value)}
                    className="rounded-lg border border-border bg-surface-subtle p-2"
                  >
                    {['quick', 'standard', 'intensive'].map((value, index) => (
                      <option key={value} value={value}>
                        {
                          (vi
                            ? ['Nhanh', 'Tiêu chuẩn', 'Luyện kỹ']
                            : ['Quick', 'Standard', 'Intensive'])[index]
                        }{' '}
                        · {presets[kind][index]}s
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <Button
                disabled={busy}
                onClick={() =>
                  void practice.start(exerciseId, filters, preset, difficulty)
                }
              >
                {busy
                  ? vi
                    ? 'Đang tạo phiên…'
                    : 'Starting…'
                  : vi
                  ? 'Bắt đầu luyện'
                  : 'Start practice'}
              </Button>
            </>
          )
        ) : result ? (
          <>
            <h2 className="text-lg font-semibold text-text-primary">
              {vi ? 'Kết quả đã lưu' : 'Results saved'}: {result.score_percent}%
            </h2>
            <p className="text-sm text-text-secondary">
              {result.correct_count}/
              {result.total_questions ?? result.total_blanks}{' '}
              {vi ? 'câu/ô đúng' : 'correct'}
            </p>
            {result.details?.map((detail, index) => (
              <article
                key={`${detail.question_id}-${index}`}
                className="rounded-xl border border-border p-4 text-sm space-y-2"
              >
                <p className="font-semibold text-text-primary">
                  {vi ? 'Câu' : 'Question'} {index + 1} ·{' '}
                  {detail.is_correct
                    ? vi
                      ? 'Đúng'
                      : 'Correct'
                    : vi
                    ? 'Chưa đúng'
                    : 'Incorrect'}
                </p>
                <p>{detail.question_text}</p>
                <p>
                  {vi ? 'Bạn chọn:' : 'Your answer:'}{' '}
                  {detail.user_answer || (vi ? 'Bỏ qua' : 'Skipped')}
                </p>
                <p>
                  {vi ? 'Đáp án:' : 'Answer:'} {detail.correct_answer}
                </p>
                <p className="text-text-secondary">
                  {vi
                    ? detail.explanation_vi || detail.explanation
                    : detail.explanation}
                </p>
                {(detail.distractor_reason || detail.distractor_reason_vi) && (
                  <p className="text-text-secondary">
                    {vi
                      ? detail.distractor_reason_vi || detail.distractor_reason
                      : detail.distractor_reason}
                  </p>
                )}
              </article>
            ))}
            {result.segment_results?.map((segment) => (
              <article
                key={segment.segment_index}
                className="rounded-xl border border-border p-4 text-sm space-y-2"
              >
                <h3 className="font-semibold">
                  {vi ? 'Đoạn' : 'Segment'} {segment.segment_index + 1}
                </h3>
                <p>{segment.text}</p>
                {segment.answers.map((blank) => (
                  <p key={blank.blank_index}>
                    {blank.blank_index + 1}. {blank.user_answer || '—'} →{' '}
                    {blank.correct_answer} ·{' '}
                    {blank.is_correct
                      ? vi
                        ? 'Đúng'
                        : 'Correct'
                      : vi
                      ? 'Chưa đúng'
                      : 'Incorrect'}
                  </p>
                ))}
              </article>
            ))}
            <Button onClick={onBack}>
              {vi ? 'Về danh sách' : 'Back to exercises'}
            </Button>
          </>
        ) : (
          group && (
            <>
              <div className="flex flex-wrap justify-between gap-3 text-sm text-text-primary">
                <span>
                  {kind === 'dictation'
                    ? vi
                      ? 'Đoạn'
                      : 'Segment'
                    : kind === 'part3' || kind === 'part4'
                    ? vi
                      ? 'Bài'
                      : 'Group'
                    : vi
                    ? 'Câu'
                    : 'Question'}{' '}
                  {draft.current_index + 1}/{session.groups.length}
                </span>
                <span role="timer">
                  {vi ? 'Còn lại:' : 'Remaining:'} {Math.floor(remaining / 60)}:
                  {String(remaining % 60).padStart(2, '0')}
                </span>
              </div>
              {expired && (
                <p role="status" className="text-amber-600 text-sm">
                  {vi
                    ? 'Hết thời gian. Hãy nộp bài để lưu kết quả.'
                    : 'Time is up. Submit to save your results.'}
                </p>
              )}
              {group.image && (
                <ListeningPracticeImage value={group.image} vi={vi} />
              )}
              {(kind === 'part3' || kind === 'part4') && (
                <h2 className="font-semibold text-text-primary">
                  {group.title}
                </h2>
              )}
              <ListeningSegmentAudio
                key={group.id}
                group={group}
                position={draft.audio_position}
                speed={draft.playback_speed}
                onPosition={practice.position}
              />
              <label className="flex items-center gap-3 text-sm text-text-secondary">
                {vi ? 'Tốc độ:' : 'Speed:'}
                <select
                  aria-label={vi ? 'Tốc độ' : 'Speed'}
                  value={draft.playback_speed}
                  disabled={busy}
                  onChange={(event) =>
                    practice.update({
                      playback_speed: Number(event.target.value),
                    })
                  }
                  className="rounded-lg border border-border bg-surface-subtle p-2"
                >
                  {[0.5, 0.75, 1, 1.25, 1.5].map((speed) => (
                    <option key={speed} value={speed}>
                      {speed}×
                    </option>
                  ))}
                </select>
              </label>
              {group.preview && (
                <p className="rounded-xl bg-surface-subtle p-4 text-text-primary whitespace-pre-wrap">
                  {group.preview}
                </p>
              )}
              {group.blanks.map((blank) => (
                <div
                  key={blank.key}
                  className="flex flex-wrap items-center gap-3 text-sm text-text-primary"
                >
                  {vi ? 'Ô' : 'Blank'} {blank.label}
                  {blank.firstLetter && (
                    <span className="text-text-tertiary">
                      {vi ? 'Bắt đầu bằng' : 'Starts with'} {blank.firstLetter}
                    </span>
                  )}
                  <input
                    aria-label={`${vi ? 'Ô' : 'Blank'} ${blank.label}`}
                    value={draft.answers[blank.key] || ''}
                    disabled={busy || expired}
                    maxLength={3000}
                    onChange={(event) =>
                      practice.update({
                        answers: {
                          ...draft.answers,
                          [blank.key]: event.target.value,
                        },
                      })
                    }
                    className="min-w-0 w-full sm:w-72 rounded-lg border border-border bg-surface-subtle p-3"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={
                      busy ||
                      expired ||
                      Boolean(hintBusy) ||
                      (hints[blank.key]?.hints_remaining ??
                        blank.hintsAvailable) <= 0
                    }
                    aria-label={`${vi ? 'Gợi ý ô' : 'Hint for blank'} ${
                      blank.label
                    }`}
                    onClick={() => void requestHint(blank.key)}
                  >
                    {vi ? 'Gợi ý' : 'Hint'} ·{' '}
                    {hints[blank.key]?.hints_remaining ?? blank.hintsAvailable}
                  </Button>
                  {(hints[blank.key]?.hint || blank.hint) && (
                    <span role="status" className="text-primary">
                      {hints[blank.key]?.hint || blank.hint}
                    </span>
                  )}
                </div>
              ))}
              {group.questions.map((question, questionIndex) => (
                <fieldset
                  key={question.key}
                  className="space-y-3 rounded-xl border border-border p-4"
                >
                  <legend className="px-2 font-semibold text-text-primary">
                    {vi ? 'Câu' : 'Question'} {questionIndex + 1}
                    {question.text ? `: ${question.text}` : ''}
                  </legend>
                  {vi && question.textVi && (
                    <p className="text-sm text-text-secondary">
                      {question.textVi}
                    </p>
                  )}
                  <div
                    className={`grid gap-3 ${
                        kind === 'part1'
                        ? 'grid-cols-2 sm:grid-cols-4'
                        : kind === 'part2'
                        ? 'grid-cols-3'
                        : 'grid-cols-1 sm:grid-cols-2'
                    }`}
                  >
                    {question.options.map((option) => (
                      <button
                        key={option.key}
                        disabled={busy || expired}
                        aria-pressed={
                          draft.answers[question.key] === option.key
                        }
                        aria-label={`${option.key}${
                          kind === 'part1' || kind === 'part2'
                            ? ''
                            : `. ${option.text}`
                        }`}
                        onClick={() =>
                          practice.update({
                            answers: {
                              ...draft.answers,
                              [question.key]: option.key,
                            },
                          })
                        }
                        className={`rounded-xl border p-4 text-left ${
                          draft.answers[question.key] === option.key
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-text-primary'
                        }`}
                      >
                        {option.key}
                        {kind === 'part1' || kind === 'part2'
                          ? ''
                          : `. ${option.text}`}
                      </button>
                    ))}
                  </div>
                </fieldset>
              ))}
              <div className="flex flex-wrap justify-between gap-3">
                <Button
                  variant="outline"
                  disabled={draft.current_index === 0 || busy}
                  onClick={() =>
                    practice.update({
                      current_index: draft.current_index - 1,
                      audio_position:
                        session.groups[draft.current_index - 1].start,
                    })
                  }
                >
                  {vi ? 'Câu trước' : 'Previous'}
                </Button>
                {draft.current_index < session.groups.length - 1 && (
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() =>
                      practice.update({
                        current_index: draft.current_index + 1,
                        audio_position:
                          session.groups[draft.current_index + 1].start,
                      })
                    }
                  >
                    {vi ? 'Câu tiếp' : 'Next'}
                  </Button>
                )}
                <Button disabled={busy} onClick={() => void practice.submit()}>
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
      </section>
    </main>
  )
}

function ListeningSegmentAudio({
  group,
  position,
  speed,
  onPosition,
}: {
  group: ListeningGroup
  position: number
  speed: number
  onPosition: (position: number) => void
}) {
  const audio = useRef<HTMLAudioElement>(null)
  const media = useListeningMedia(group.audio)
  const [failed, setFailed] = useState(false)
  const { i18n } = useTranslation()
  const vi = i18n.language === 'vi'
  useEffect(() => {
    if (audio.current) audio.current.playbackRate = speed
  }, [speed])
  if (!group.audio)
    return (
      <p role="alert" className="text-sm text-text-secondary">
        Audio chưa khả dụng / Audio unavailable
      </p>
    )
  const bound = (element: HTMLAudioElement) => {
    if (element.currentTime < group.start) element.currentTime = group.start
    if (group.end !== undefined && element.currentTime >= group.end) {
      element.pause()
      if (element.currentTime > group.end) element.currentTime = group.end
    }
    onPosition(element.currentTime)
  }
  if (!media.url)
    return (
      <div className="text-sm text-text-secondary">
        {media.ready
          ? vi
            ? 'Không lấy được audio.'
            : 'Could not resolve audio.'
          : vi
          ? 'Đang tải audio…'
          : 'Loading audio…'}
        {media.ready && (
          <Button size="sm" variant="outline" onClick={media.retry}>
            {vi ? 'Thử lại audio' : 'Retry audio'}
          </Button>
        )}
      </div>
    )
  return (
    <div className="space-y-2">
      <audio
        ref={audio}
        controls
        preload="metadata"
        src={media.url}
        className="w-full"
        onError={() => setFailed(true)}
        onLoadedMetadata={(event) => {
          setFailed(false)
          const element = event.currentTarget
          element.playbackRate = speed
          element.currentTime = Math.max(
            group.start,
            Math.min(position || group.start, group.end ?? element.duration),
          )
        }}
        onPlay={(event) => {
          if (
            group.end !== undefined &&
            event.currentTarget.currentTime >= group.end
          )
            event.currentTarget.currentTime = group.start
        }}
        onTimeUpdate={(event) => bound(event.currentTarget)}
        onSeeking={(event) => bound(event.currentTarget)}
      />
      {failed && (
        <div role="alert" className="text-sm text-red-500">
          {vi ? 'Không tải được audio.' : 'Could not load audio.'}{' '}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setFailed(false)
              audio.current?.load()
            }}
          >
            {vi ? 'Thử lại audio' : 'Retry audio'}
          </Button>
        </div>
      )}
    </div>
  )
}

function ListeningPracticeImage({ value, vi }: { value: string; vi: boolean }) {
  const media = useListeningMedia(value)
  if (!media.url)
    return (
      <p className="text-sm text-text-secondary">
        {vi
          ? 'Ảnh đang tải hoặc chưa khả dụng.'
          : 'Image is loading or unavailable.'}
      </p>
    )
  return (
    <Image
      unoptimized
      width={960}
      height={540}
      src={media.url}
      alt={vi ? 'Ảnh câu hỏi Listening' : 'Listening photograph'}
      className="max-h-80 w-full object-contain rounded-xl"
    />
  )
}
