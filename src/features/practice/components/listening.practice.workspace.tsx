// Không gian làm bài luyện nghe thực hành với điều khiển tốc độ và lưu tiến độ.
'use client'

import { PracticeKeyboard, PracticeOptionKey } from './practice.keyboard'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/button'
import { AppSelect } from '@/components/select'
import { PracticeExitConfirmModal } from './practice.exit-confirm.modal'
import { ListeningSavedResult } from './listening.saved.result'
import { useListeningMedia } from '../hooks/use.listening.media'
import { listeningLifecycleService } from '../services/listening-lifecycle.service'
import { useListeningLifecycle } from '../hooks/use.listening.lifecycle'
import type {
  ListeningGroup,
  ListeningKind,
} from '../types/listening-lifecycle'

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
  const [showExit,setShowExit]=useState(false)
  const multiQuestionGroup = kind === 'part3' || kind === 'part4'
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
      await practice.refreshSession()
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
    <PracticeKeyboard as="main" withinGroup={multiQuestionGroup} enterMode={kind === 'dictation'} features={['answers','navigate','save','submit','audio',...(kind === 'dictation' ? ['check' as const] : [])]} className="mx-auto max-w-5xl px-4 py-6 space-y-5">
      <Button data-practice-action="exit" variant="ghost" disabled={busy} onClick={() => session && !result ? setShowExit(true) : void leave()}>
        {session && !result
          ? vi
            ? 'Lưu và quay lại'
            : 'Save and go back'
          : vi
          ? 'Quay lại'
          : 'Back'}
      </Button>
      {session && !result && <Button size="sm" variant="outline" data-practice-action="save" disabled={busy} onClick={() => void practice.save().catch(() => undefined)}>{vi ? 'Lưu tiến độ' : 'Save progress'}</Button>}
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
                <div className="flex flex-wrap items-center gap-3 text-sm text-text-primary">
                  <span className="font-medium text-text-secondary">{vi ? 'Mức luyện:' : 'Practice level:'}</span>
                  <AppSelect
                    ariaLabel={vi ? 'Mức luyện' : 'Practice level'}
                    value={difficulty}
                    disabled={busy}
                    onChange={(val) => setDifficulty(val)}
                    options={[
                      { value: 'EASY', label: vi ? 'Dễ' : 'Easy' },
                      { value: 'MEDIUM', label: vi ? 'Trung bình' : 'Medium' },
                      { value: 'HARD', label: vi ? 'Khó' : 'Hard' },
                    ]}
                    size="sm"
                  />
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3 text-sm text-text-primary">
                  <span className="font-medium text-text-secondary">{vi ? 'Thời gian cho phiên:' : 'Session time:'}</span>
                  <AppSelect
                    ariaLabel={vi ? 'Thời gian cho phiên' : 'Session time'}
                    value={preset}
                    disabled={busy}
                    onChange={(val) => setPreset(val)}
                    options={[
                      {
                        value: 'quick',
                        label: `${vi ? 'Nhanh' : 'Quick'} · 0.75×`,
                      },
                      {
                        value: 'standard',
                        label: `${vi ? 'Tiêu chuẩn' : 'Standard'} · 1×`,
                      },
                      {
                        value: 'intensive',
                        label: `${vi ? 'Luyện kỹ' : 'Intensive'} · 1.5×`,
                      },
                    ]}
                    size="sm"
                  />
                </div>
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
          <ListeningSavedResult result={result} vi={vi} onBack={onBack} />
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
                      ? 'Nhóm'
                      : 'Group'
                    : vi
                    ? 'Câu'
                    : 'Question'}{' '}
                  {draft.current_index + 1}/{session.groups.length}
                </span>
                <span role="timer">
                  {vi ? 'Thời gian đoạn/câu còn lại:' : 'Time for this group:'}{' '}
                  {Math.floor(remaining / 60)}:
                  {String(remaining % 60).padStart(2, '0')}
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                {vi
                  ? 'Thời gian trả lời bắt đầu sau lần nghe đầu hoặc khi bạn nhập/chọn đáp án.'
                  : 'Answer time starts after the first listen or when you enter/select an answer.'}
              </p>
              {multiQuestionGroup && <p className="text-sm text-text-secondary">{vi ? '← / →: đổi câu trong nhóm · Shift + ← / →: đổi nhóm. Phím mũi tên đơn không tự chuyển nhóm.' : '← / →: questions in this group · Shift + ← / →: change groups. Plain arrows never change groups.'}</p>}
              {expired && (
                <p role="status" className="text-amber-600 text-sm">
                  {vi
                    ? 'Đoạn/câu đã hết thời gian. Chuyển tiếp hoặc nộp bài.'
                    : 'Time is up. Submit to save your results.'}
                </p>
              )}
              {group.image && (group.showImageBefore || group.hasListened) && (
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
                kind={kind}
                sessionId={session.id}
                onRefresh={practice.refreshSession}
                disabled={busy || expired}
              />
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <span className="font-medium">{vi ? 'Tốc độ:' : 'Speed:'}</span>
                <AppSelect
                  ariaLabel={vi ? 'Tốc độ' : 'Speed'}
                  value={String(draft.playback_speed)}
                  disabled={busy}
                  onChange={(val) =>
                    practice.update({
                      playback_speed: Number(val),
                    })
                  }
                  options={[0.5, 0.75, 1, 1.25, 1.5].map((speed) => ({
                    value: String(speed),
                    label: `${speed}×`,
                  }))}
                  size="sm"
                />
              </div>
              {group.dialogue && group.dialogue.length > 0 && (
                <div className="rounded-xl bg-surface-subtle p-4 space-y-2">
                  {group.dialogue.map((line, index) => (
                    <p key={index}>
                      <span className="text-text-tertiary">
                        {line.start_time}–{line.end_time}s{' '}
                      </span>
                      {line.text}
                      {vi && line.text_vi ? (
                        <span className="block text-sm text-text-secondary">
                          {line.text_vi}
                        </span>
                      ) : null}
                    </p>
                  ))}
                </div>
              )}
              {group.completed && (
                <p role="status">
                  {vi
                    ? 'Đoạn đã kiểm tra; đáp án được khóa.'
                    : 'Segment checked; answers are locked.'}
                </p>
              )}
              {group.checkedResult?.answers?.map((answer) => (
                <p key={answer.blank_index}>
                  {answer.blank_index + 1}. {answer.user_answer || '—'} →{' '}
                  {answer.correct_answer} ·{' '}
                  {answer.is_correct
                    ? vi
                      ? 'Đúng'
                      : 'Correct'
                    : vi
                    ? 'Chưa đúng'
                    : 'Incorrect'}
                </p>
              ))}
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
                  {blank.length !== undefined && (
                    <span className="text-text-tertiary">
                      {blank.length} {vi ? 'ký tự' : 'characters'}
                    </span>
                  )}
                  <input
                    aria-label={`${vi ? 'Ô' : 'Blank'} ${blank.label}`}
                    value={draft.answers[blank.key] || ''}
                    disabled={busy || expired || Boolean(group.completed)}
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
                      session.settings?.enable_hints === false ||
                      Boolean(hintBusy) ||
                      Boolean(group.completed) ||
                      blank.hintsAvailable <= 0
                    }
                    aria-label={`${vi ? 'Gợi ý ô' : 'Hint for blank'} ${
                      blank.label
                    }`}
                    onClick={() => void requestHint(blank.key)}
                  >
                    {vi ? 'Gợi ý' : 'Hint'} · {blank.hintsAvailable}
                  </Button>
                  {(hints[blank.key]?.hint || blank.hint) && (
                    <span role="status" className="text-primary">
                      {hints[blank.key]?.hint || blank.hint}
                    </span>
                  )}
                </div>
              ))}
              {(group.showQuestionsBefore || group.hasListened
                ? group.questions
                : []
              ).map((question, questionIndex) => (
                <fieldset
                  data-practice-question tabIndex={-1} key={question.key}
                  className="space-y-3 rounded-xl border border-border p-4 data-[keyboard-current]:ring-2 data-[keyboard-current]:ring-primary/50 focus-visible:outline-2 focus-visible:outline-primary"
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
                    {question.options.map((option, optionIndex) => (
                      <button
                        data-practice-option={option.key} key={option.key}
                        disabled={busy || expired || Boolean(group.completed)}
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
                        <PracticeOptionKey index={optionIndex}/>
                      </button>
                    ))}
                  </div>
                </fieldset>
              ))}
              <div className="flex flex-wrap justify-between gap-3">
                <Button
                  variant="outline"
                  data-practice-action={multiQuestionGroup ? "previous-group" : "previous"} disabled={draft.current_index === 0 || busy}
                  onClick={() =>
                    practice.update({
                      current_index: draft.current_index - 1,
                      audio_position:
                        session.groups[draft.current_index - 1].start,
                    })
                  }
                >
                  {multiQuestionGroup ? (vi ? 'Nhóm trước' : 'Previous group') : kind === 'dictation' ? (vi ? 'Đoạn trước' : 'Previous segment') : (vi ? 'Câu trước' : 'Previous question')}
                  {multiQuestionGroup && <kbd aria-hidden="true" className="ml-2 rounded border border-current/25 px-1 font-mono text-[11px]">Shift + ←</kbd>}
                </Button>
                {draft.current_index < session.groups.length - 1 && (
                  <Button
                    variant="outline"
                    data-practice-action={multiQuestionGroup ? "next-group" : "next"} disabled={busy}
                    onClick={() =>
                      practice.update({
                        current_index: draft.current_index + 1,
                        audio_position:
                          session.groups[draft.current_index + 1].start,
                      })
                    }
                  >
                    {multiQuestionGroup ? (vi ? 'Nhóm tiếp theo' : 'Next group') : kind === 'dictation' ? (vi ? 'Đoạn tiếp' : 'Next segment') : (vi ? 'Câu tiếp' : 'Next question')}
                    {multiQuestionGroup && <kbd aria-hidden="true" className="ml-2 rounded border border-current/25 px-1 font-mono text-[11px]">Shift + →</kbd>}
                  </Button>
                )}
                {kind === 'dictation' &&
                  session.settings?.show_answers_immediately &&
                  !group.completed && (
                    <Button
                      variant="outline"
                      disabled={busy || expired}
                      data-practice-action="check" onClick={() => void practice.check()}
                    >
                      {vi ? 'Kiểm tra đoạn' : 'Check segment'}
                    </Button>
                  )}
                <Button data-practice-action="submit" disabled={busy} onClick={() => void practice.submit()}>
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
      <PracticeExitConfirmModal isOpen={showExit} onClose={()=>setShowExit(false)} onConfirmExit={()=>{setShowExit(false);void leave()}} title={vi?'Lưu và rời bài nghe?':'Save and leave listening?'} description={vi?'Tiến độ sẽ được đồng bộ trước khi quay về danh sách.':'Your progress will be synced before returning to the list.'} savedNotice={vi?'Bạn có thể tiếp tục phiên sau khi lưu thành công.':'Resume this session after saving successfully.'}/>
    </PracticeKeyboard>
  )
}

function ListeningSegmentAudio({
  group,
  position,
  speed,
  onPosition,
  kind,
  sessionId,
  onRefresh,
  disabled,
}: {
  group: ListeningGroup
  position: number
  speed: number
  onPosition: (position: number) => void
  kind: ListeningKind
  sessionId: string
  onRefresh: () => Promise<void>
  disabled: boolean
}) {
  const audio = useRef<HTMLAudioElement>(null)
  const media = useListeningMedia(group.audio)
  const { i18n } = useTranslation(),
    vi = i18n.language === 'vi'
  const [playing, setPlaying] = useState(false),
    [pending, setPending] = useState(false),
    [error, setError] = useState('')
  const [state, setState] = useState({
    starts: group.playCount || 0,
    completed: group.playbackCompleted ?? Boolean(group.hasListened),
  })
  const completing = useRef(false)
  const authorized = useRef(false)
  const clip = useRef({ start: group.start, end: group.end })
  const [mediaTime, setMediaTime] = useState(group.start)
  const [duration, setDuration] = useState(group.end || 0)
  const remaining =
    group.allowReplay === false
      ? 0
      : Math.max(0, (group.replayLimit ?? 1) - Math.max(0, state.starts - 1))
  const exhausted = state.completed && remaining <= 0
  useEffect(() => {
    if (audio.current) audio.current.playbackRate = speed
  }, [speed])
  useEffect(() => {
    if (disabled) {
      audio.current?.pause()
    }
  }, [disabled])
  const complete = async () => {
    if (completing.current) return
    completing.current = true
    setPending(true)
    audio.current?.pause()
    setPlaying(false)
    try {
      const next = await listeningLifecycleService.playback(
        kind,
        sessionId,
        group.index,
        'complete',
      )
      setState(next)
      authorized.current = false
      await onRefresh()
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : 'Không lưu được lượt nghe',
      )
      completing.current = false
    } finally {
      setPending(false)
    }
  }
  const play = async (selected?: { start_time: number; end_time: number }) => {
    const element = audio.current
    if (!element || pending || disabled) return
    if (playing && !selected) {
      element.pause()
      return
    }
    if (exhausted) return
    setPending(true)
    setError('')
    try {
      if (selected && authorized.current) {
        element.pause()
        await listeningLifecycleService.playback(
          kind,
          sessionId,
          group.index,
          'complete',
        )
        authorized.current = false
      }
      if (selected)
        clip.current = { start: selected.start_time, end: selected.end_time }
      if (!authorized.current) {
        const next = await listeningLifecycleService.playback(
          kind,
          sessionId,
          group.index,
          'start',
        )
        setState(next)
        authorized.current = true
        completing.current = false
        if (
          selected ||
          state.completed ||
          element.ended ||
          (clip.current.end !== undefined &&
            element.currentTime >= clip.current.end)
        )
          element.currentTime = clip.current.start
      }
      element.playbackRate = speed
      await element.play()
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : 'Không phát được audio',
      )
    } finally {
      setPending(false)
    }
  }
  if (!group.audio)
    return (
      <p role="alert">{vi ? 'Audio chưa khả dụng' : 'Audio unavailable'}</p>
    )
  if (!media.url)
    return (
      <Button disabled={!media.ready} onClick={media.retry}>
        {vi ? 'Tải lại audio' : 'Retry audio'}
      </Button>
    )
  return (
    <div data-practice-media tabIndex={0} aria-label={vi ? "Trình phát audio · Space để phát/tạm dừng" : "Audio player · Space to play/pause"} className="space-y-2 rounded-lg focus-visible:outline-2 focus-visible:outline-primary">
      <audio
        ref={audio}
        src={media.url}
        preload="metadata"
        onLoadedMetadata={(event) => {
          setDuration(group.end ?? event.currentTarget.duration)
          event.currentTarget.currentTime = Math.max(
            group.start,
            Math.min(
              position || group.start,
              group.end ?? event.currentTarget.duration,
            ),
          )
          event.currentTarget.playbackRate = speed
        }}
        onPlay={(event) => {
          if (!authorized.current || disabled) event.currentTarget.pause()
          else setPlaying(true)
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => void complete()}
        onTimeUpdate={(event) => {
          const element = event.currentTarget
          const end = clip.current.end
          if (end !== undefined && element.currentTime >= end) {
            element.pause()
            if (element.currentTime > end) element.currentTime = end
            if (authorized.current) void complete()
          }
          setMediaTime(element.currentTime)
          onPosition(element.currentTime)
        }}
        onSeeking={(event) => {
          const element = event.currentTarget
          if (element.currentTime < clip.current.start)
            element.currentTime = clip.current.start
          if (
            clip.current.end !== undefined &&
            element.currentTime > clip.current.end
          )
            element.currentTime = clip.current.end
        }}
        onError={() => {
          setError(
            vi
              ? 'Không tải được audio. Thử phát lại.'
              : 'Could not load audio. Try again.',
          )
          authorized.current = false
        }}
      />
      <progress
        className="block w-full accent-primary"
        aria-label={vi ? 'Tiến độ audio' : 'Audio progress'}
        value={Math.max(0, mediaTime - group.start)}
        max={Math.max(1, duration - group.start)}
      />
      <Button
        variant="outline"
        disabled={pending || disabled || (!playing && exhausted)}
        data-practice-action="play" onClick={() => void play()}
      >
        {pending
          ? vi
            ? 'Đang xử lý…'
            : 'Loading…'
          : playing
          ? vi
            ? 'Tạm dừng'
            : 'Pause'
          : state.completed
          ? vi
            ? 'Nghe lại'
            : 'Replay'
          : vi
          ? 'Phát audio'
          : 'Play audio'}
      </Button>
      <span className="ml-3 text-sm text-text-secondary">
        {vi ? 'Lượt nghe lại còn:' : 'Replays remaining:'} {remaining}
      </span>
      {group.dialogue && group.dialogue.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {group.dialogue.map((line, index) => (
            <Button
              key={index}
              size="sm"
              variant="outline"
              disabled={disabled || pending || remaining <= 0}
              onClick={() => void play(line)}
            >
              {vi ? 'Nghe đoạn' : 'Play segment'} {index + 1} ·{' '}
              {line.start_time}–{line.end_time}s
            </Button>
          ))}
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}{' '}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              audio.current?.load()
              media.retry()
              setError('')
            }}
          >
            {vi ? 'Thử lại audio' : 'Retry audio'}
          </Button>
        </p>
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
