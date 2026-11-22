// Không gian làm bài luyện nghe thực hành với điều khiển tốc độ và lưu tiến độ.
'use client'

import { PracticeKeyboard, PracticeOptionKey } from './practice.keyboard'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw, Play, Pause } from 'lucide-react'
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

function LiveDictationInput({ sessionId, blankKey, label, value, limit, disabled, onChange }: {
  sessionId: string; blankKey: string; label: string; value: string; limit?: number; disabled: boolean; onChange: (value: string) => void
}) {
  const [feedback, setFeedback] = useState<{ answer: string; correct: boolean } | null>(null)
  const [unavailable, setUnavailable] = useState(false)
  const composing = useRef(false)
  const normalized = value.normalize('NFC')
  useEffect(() => {
    if (!limit || normalized.length !== limit || disabled) return
    let active = true
    const timer = window.setTimeout(() => {
      void listeningLifecycleService.checkBlank(sessionId, blankKey, normalized).then(result => {
        if (active) { setFeedback({ answer: normalized, correct: result.is_correct }); setUnavailable(false) }
      }).catch(() => { if (active) setUnavailable(true) })
    }, 350)
    return () => { active = false; clearTimeout(timer) }
  }, [sessionId, blankKey, normalized, limit, disabled])
  const current = feedback?.answer === normalized && limit === normalized.length ? feedback : null
  const update = (text: string) => onChange(limit ? text.normalize('NFC').slice(0, limit) : text)
  return <div className="min-w-0 w-full sm:w-72">
    <input aria-label={label} aria-invalid={current ? !current.correct : undefined} value={value} disabled={disabled} maxLength={3000}
      onCompositionStart={() => { composing.current = true }} onCompositionEnd={event => { composing.current = false; update(event.currentTarget.value) }}
      onChange={event => { setUnavailable(false); if (composing.current) onChange(event.target.value); else update(event.target.value) }}
      className={`w-full rounded-lg border bg-surface-subtle p-3 ${current ? current.correct ? 'border-success text-success' : 'border-red-500' : 'border-border'}`} />
    {unavailable && !current && <span className="text-xs text-text-secondary" role="status">Chưa kiểm tra được, hãy thử sửa lại.</span>}
  </div>
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
  const [showExit,setShowExit]=useState(false)
  const multiQuestionGroup = kind === 'part3' || kind === 'part4'
  const group = session?.groups[draft.current_index]
  const expired = Boolean(session && !group?.untimed && remaining <= 0)
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
    <PracticeKeyboard as="main" withinGroup={multiQuestionGroup} enterMode={kind === 'dictation'} features={['answers','navigate','submit','audio',...(kind === 'dictation' ? ['check' as const] : [])]} className="mx-auto max-w-5xl px-4 py-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          data-practice-action="exit"
          variant="outline"
          disabled={busy}
          onClick={() => session && !result ? setShowExit(true) : void leave()}
          className="h-10 gap-2 rounded-xl bg-surface px-4 text-text-secondary shadow-none hover:text-text-primary"
        >
          <ArrowLeft aria-hidden="true" />
          {session && !result
            ? vi
              ? 'Lưu và quay lại'
              : 'Save and go back'
            : vi
            ? 'Quay lại'
            : 'Back'}
        </Button>
      </div>
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
                {kind === 'dictation' && difficulty === 'EASY'
                  ? vi
                    ? 'Mức Dễ không giới hạn thời gian và lượt nghe. Tiến độ được tự động lưu để bạn tiếp tục sau.'
                    : 'Easy mode has no time or replay limits. Progress saves automatically so you can continue later.'
                  : vi
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
          <ListeningSavedResult
            result={result}
            vi={vi}
            onBack={onBack}
            onRetry={() => void practice.start(exerciseId, filters, preset, difficulty)}
            kind={kind}
            title={title}
          />
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
                {!group.untimed && <span role="timer">
                  {vi ? 'Thời gian đoạn/câu còn lại:' : 'Time for this group:'}{' '}
                  {Math.floor(remaining / 60)}:
                  {String(remaining % 60).padStart(2, '0')}
                </span>}
              </div>
              <p className="text-xs text-text-secondary">
                {group.untimed
                  ? vi ? 'Luyện theo nhịp của bạn, nghe lại tùy nhu cầu.' : 'Practice at your own pace and listen again whenever you need.'
                  : vi
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
              <div className="rounded-2xl border border-border bg-surface-subtle/60 p-4 space-y-3">
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
                onPrevious={draft.current_index > 0 ? () => practice.update({ current_index: draft.current_index - 1, audio_position: session.groups[draft.current_index - 1].start }) : undefined}
                onNext={draft.current_index < session.groups.length - 1 ? () => practice.update({ current_index: draft.current_index + 1, audio_position: session.groups[draft.current_index + 1].start }) : undefined}
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
              {kind === 'dictation' && <div className="border-t border-border pt-5"><p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{vi ? 'Điền những gì bạn nghe được' : 'Fill in what you hear'}</p></div>}
              {group.preview && (
                <p className="rounded-xl border border-border bg-surface p-4 leading-7 text-text-primary whitespace-pre-wrap">
                  {group.preview}
                </p>
              )}
              {group.blanks.map((blank) => {
                const checked = group.checkedResult?.answers?.find(answer => answer.blank_index === Number(blank.key.split('_')[1]))
                return <div
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
                  {checked ? (
                    <div
                      role="group"
                      aria-label={`${vi ? 'Kết quả ô' : 'Result for blank'} ${blank.label}`}
                      className={`flex min-h-12 min-w-0 w-full sm:w-72 flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border bg-surface-subtle px-3 py-2 ${checked.is_correct ? 'border-success' : 'border-red-500'}`}
                    >
                      {checked.is_correct ? (
                        <span className="font-medium text-success">{checked.user_answer}</span>
                      ) : (
                        <>
                          <span className="text-red-600 line-through decoration-2">{checked.user_answer || (vi ? 'Bỏ trống' : 'No answer')}</span>
                          <span aria-label={vi ? 'Đáp án đúng' : 'Correct answer'} className="font-semibold text-success">{checked.correct_answer}</span>
                        </>
                      )}
                    </div>
                  ) : <LiveDictationInput
                    sessionId={session.id} blankKey={blank.key} label={`${vi ? 'Ô' : 'Blank'} ${blank.label}`} limit={blank.inputLength}
                    value={draft.answers[blank.key] || ''}
                    disabled={busy || expired || Boolean(group.completed)}
                    onChange={(value) =>
                      practice.update({
                        answers: {
                          ...draft.answers,
                          [blank.key]: value,
                        },
                      })
                    }
                  />}
                  {!group.completed && <Button
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
                  </Button>}
                  {(hints[blank.key]?.hint || blank.hint) && (
                    <span role="status" className="text-primary">
                      {hints[blank.key]?.hint || blank.hint}
                    </span>
                  )}
                </div>
              })}
              {(group.showQuestionsBefore || group.hasListened
                ? group.questions
                : []
              ).map((question, questionIndex) => (
                <fieldset
                  data-practice-question tabIndex={-1} key={question.key}
                  className="space-y-4 rounded-2xl border border-border bg-surface p-4 sm:p-5 focus-visible:outline-2 focus-visible:outline-primary data-[keyboard-current]:border-primary/50"
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
                  {kind === 'part1' && <p className="text-sm text-text-secondary">{vi ? 'Nghe và chọn mô tả phù hợp nhất với bức ảnh.' : 'Listen and choose the description that best matches the photograph.'}</p>}
                  {kind === 'part2' && <p className="text-sm text-text-secondary">{vi ? 'Nghe và chọn câu trả lời phù hợp nhất.' : 'Listen and choose the best response.'}</p>}
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
                        className={`${kind === 'part1' || kind === 'part2' ? 'flex min-h-14 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-center font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2' : 'min-h-14 rounded-xl border px-4 py-3 text-left leading-relaxed transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2'} ${
                          draft.answers[question.key] === option.key
                            ? 'border-primary bg-primary-soft text-primary ring-1 ring-primary'
                            : 'border-border bg-surface text-text-primary hover:border-primary/50 hover:bg-primary-soft'
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
              <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
                {multiQuestionGroup && <Button
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
                  {multiQuestionGroup ? (vi ? 'Nhóm trước' : 'Previous group') : (vi ? 'Câu trước' : 'Previous question')}
                  {multiQuestionGroup && <kbd aria-hidden="true" className="ml-2 rounded border border-current/25 px-1 font-mono text-[11px]">Shift + ←</kbd>}
                </Button>}
                {multiQuestionGroup && draft.current_index < session.groups.length - 1 && (
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
                    {multiQuestionGroup ? (vi ? 'Nhóm tiếp theo' : 'Next group') : (vi ? 'Câu tiếp' : 'Next question')}
                    {multiQuestionGroup && <kbd aria-hidden="true" className="ml-2 rounded border border-current/25 px-1 font-mono text-[11px]">Shift + →</kbd>}
                  </Button>
                )}
                {kind === 'dictation' &&
                  session.settings?.show_answers_immediately &&
                  !group.completed && (
                    <Button
                      variant="outline"
                      disabled={busy || expired}
                      className="min-h-10 px-5" data-practice-action="check" onClick={() => void practice.check()}
                    >
                      {vi ? 'Kiểm tra đoạn' : 'Check segment'}
                    </Button>
                  )}
                <Button className="ml-auto min-h-10 px-5" data-practice-action="submit" disabled={busy} onClick={() => void practice.submit()}>
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
  onPrevious,
  onNext,
}: {
  group: ListeningGroup
  position: number
  speed: number
  onPosition: (position: number) => void
  kind: ListeningKind
  sessionId: string
  onRefresh: () => Promise<void>
  disabled: boolean
  onPrevious?: () => void
  onNext?: () => void
}) {
  const audio = useRef<HTMLAudioElement>(null)
  const media = useListeningMedia(group.audio)
  const { i18n } = useTranslation(),
    vi = i18n.language === 'vi'
  const [playing, setPlaying] = useState(false),
    [pending, setPending] = useState(false),
    [error, setError] = useState('')
  const [state, setState] = useState<{ starts: number; completed: boolean; remaining?: number | null }>({
    starts: group.playCount || 0,
    completed: group.playbackCompleted ?? Boolean(group.hasListened),
    remaining: group.replaysRemaining,
  })
  const completing = useRef(false)
  const requestLock = useRef(false)
  const mounted = useRef(true)
  const authorized = useRef(false)
  const [completionFailed, setCompletionFailed] = useState(false)
  const clip = useRef({ start: group.start, end: group.end })
  const [mediaTime, setMediaTime] = useState(group.start)
  const [duration, setDuration] = useState(group.end || 0)
  const remaining =
    group.allowReplay === false
      ? 0
      : state.remaining ?? Math.max(0, (group.replayLimit ?? 1) - Math.max(0, state.starts - 1))
  const exhausted = !group.unlimitedReplay && state.completed && remaining <= 0
  useEffect(() => {
    mounted.current = true
    const element = audio.current
    return () => { mounted.current = false; element?.pause() }
  }, [media.url])
  useEffect(() => {
    if (authorized.current || requestLock.current) return
    setState(previous => {
      const next = { starts: group.playCount || 0, completed: group.playbackCompleted ?? Boolean(group.hasListened), remaining: group.replaysRemaining }
      if (next.starts < previous.starts || (next.starts === previous.starts && previous.completed && !next.completed)) return previous
      return { ...next, remaining: next.remaining ?? (next.starts === previous.starts ? previous.remaining : undefined) }
    })
  }, [group.playCount, group.playbackCompleted, group.hasListened, group.replaysRemaining, pending])
  useEffect(() => {
    if (audio.current) audio.current.playbackRate = speed
  }, [speed])
  useEffect(() => {
    if (disabled) {
      audio.current?.pause()
    }
  }, [disabled])
  const complete = async () => {
    if (!authorized.current || completing.current || requestLock.current) return
    completing.current = true
    requestLock.current = true
    setCompletionFailed(false)
    setError('')
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
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : 'Không lưu được lượt nghe',
      )
      completing.current = false
      setCompletionFailed(true)
    } finally {
      try { await onRefresh() } catch { /* A refresh failure must not discard the acknowledged playback state. */ }
      requestLock.current = false
      setPending(false)
    }
  }
  const play = async (selected?: { start_time: number; end_time: number }) => {
    const element = audio.current
    if (!element || requestLock.current || pending || disabled || completionFailed) return
    if (playing && !selected) {
      element.pause()
      return
    }
    if (exhausted) return
    if (selected && !group.unlimitedReplay && state.starts > 0 && remaining <= 0) return
    requestLock.current = true
    setPending(true)
    setError('')
    try {
      if (selected && authorized.current) {
        element.pause()
        const completed = await listeningLifecycleService.playback(
          kind,
          sessionId,
          group.index,
          'complete',
        )
        setState(completed)
        authorized.current = false
      }
      if (selected)
        clip.current = { start: selected.start_time, end: selected.end_time }
      else if (!authorized.current)
        clip.current = { start: group.start, end: group.end }
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
          next.starts > state.starts ||
          element.ended ||
          (clip.current.end !== undefined &&
            element.currentTime >= clip.current.end)
        )
          element.currentTime = clip.current.start
      }
      if (!mounted.current) return
      element.playbackRate = speed
      await element.play()
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : 'Không phát được audio',
      )
      try { await onRefresh() } catch { /* Keep the previous state visible until synchronization succeeds. */ }
    } finally {
      requestLock.current = false
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
          // Keep an already granted listen so loading/retrying the same audio does not spend another replay.
        }}
      />
      <progress
        className="block h-1.5 w-full overflow-hidden rounded-full accent-primary"
        aria-label={vi ? 'Tiến độ audio' : 'Audio progress'}
        value={Math.max(0, mediaTime - group.start)}
        max={Math.max(1, duration - group.start)}
      />
      <div className="flex flex-wrap items-center gap-1">
        <Button variant="ghost" size="icon" data-practice-action={kind === 'part3' || kind === 'part4' ? undefined : 'previous'} aria-label={kind === 'dictation' ? (vi ? 'Đoạn trước' : 'Previous segment') : kind === 'part3' || kind === 'part4' ? (vi ? 'Audio: nhóm trước' : 'Audio: previous group') : (vi ? 'Câu trước' : 'Previous question')} title={vi ? 'Trước' : 'Previous'} disabled={disabled || pending || !onPrevious} onClick={onPrevious}><ChevronLeft aria-hidden="true" /></Button>
        <Button variant="ghost" size="icon" aria-label={vi ? 'Nghe lại từ đầu' : 'Replay from beginning'} title={vi ? 'Nghe lại từ đầu' : 'Replay from beginning'} disabled={disabled || pending || completionFailed || (!group.unlimitedReplay && state.starts > 0 && remaining <= 0)} onClick={() => void play({ start_time: group.start, end_time: group.end ?? duration })}><RotateCcw aria-hidden="true" /></Button>
        <Button variant="ghost" size="icon" aria-label={playing ? (vi ? 'Tạm dừng' : 'Pause') : kind !== 'dictation' && state.completed ? (vi ? 'Nghe lại' : 'Replay') : (vi ? 'Phát audio' : 'Play audio')} title={playing ? (vi ? 'Tạm dừng' : 'Pause') : kind !== 'dictation' && state.completed ? (vi ? 'Nghe lại' : 'Replay') : (vi ? 'Phát audio' : 'Play audio')} disabled={pending || disabled || completionFailed || (!playing && exhausted)} data-practice-action="play" onClick={() => void play()}>{playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}</Button>
        <Button variant="ghost" size="icon" data-practice-action={kind === 'part3' || kind === 'part4' ? undefined : 'next'} aria-label={kind === 'dictation' ? (vi ? 'Đoạn tiếp' : 'Next segment') : kind === 'part3' || kind === 'part4' ? (vi ? 'Audio: nhóm tiếp theo' : 'Audio: next group') : (vi ? 'Câu tiếp' : 'Next question')} title={vi ? 'Tiếp theo' : 'Next'} disabled={disabled || pending || !onNext} onClick={onNext}><ChevronRight aria-hidden="true" /></Button>
        {!group.unlimitedReplay && <span className="ml-2 text-xs text-text-secondary">{vi ? 'Lượt nghe lại còn:' : 'Replays remaining:'} {remaining}</span>}
      </div>
      {group.dialogue && group.dialogue.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {group.dialogue.map((line, index) => (
            <Button
              key={index}
              size="sm"
              variant="outline"
              disabled={disabled || pending || completionFailed || (!group.unlimitedReplay && state.starts > 0 && remaining <= 0)}
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
          {((!exhausted && !disabled) || completionFailed) && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (completionFailed) { void complete(); return }
              audio.current?.load()
              media.retry()
              setError('')
            }}
          >
            {vi ? 'Thử lại audio' : 'Retry audio'}
          </Button>
          )}
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
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-subtle p-2 sm:p-3">
    <Image
      unoptimized
      width={960}
      height={540}
      src={media.url}
      alt={vi ? 'Ảnh câu hỏi Listening' : 'Listening photograph'}
      className="mx-auto max-h-[26rem] w-full rounded-xl object-contain"
    />
    </div>
  )
}
