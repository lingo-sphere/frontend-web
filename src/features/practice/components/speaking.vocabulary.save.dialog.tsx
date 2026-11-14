'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Volume2, X } from 'lucide-react'
import { Button } from '@/components/button'
import { vocabularyService } from '@/features/vocabulary/services/vocabulary.service'
import { vocabularySourceTime } from '@/features/vocabulary/lib/vocabulary-source'
import { playAudio } from '@/utils/media.utils'
import { speakWord } from '../lib/audio.utils'
import { normalizeSpeakingWord } from '../lib/speaking-vocabulary'
import { speakingVocabularyService } from '../services/speaking-vocabulary.service'
import type {
  SpeakingWordTarget,
  SaveSpeakingWordResult,
  SpeakingSavedWord,
} from '../types/speaking-vocabulary'
import { SpeakingVocabularySavedActions } from './speaking.vocabulary.saved.actions'

export function SpeakingVocabularySaveDialog({
  target,
  userId,
  onClose,
  onSaved,
  existing,
}: {
  target: SpeakingWordTarget
  userId?: string
  onClose: () => void
  onSaved: () => void
  existing?: SpeakingSavedWord
}) {
  const { i18n } = useTranslation(),
    vi = i18n.language.startsWith('vi')
  const dialog = useRef<HTMLDialogElement>(null)
  const [input, setInput] = useState(target.word),
    [query, setQuery] = useState(target.word)
  const [chosenId, setChosenId] = useState(''),
    [meaningIndex, setMeaningIndex] = useState<number | null>(null)
  const [confirmed, setConfirmed] = useState(false),
    [saved, setSaved] = useState<SaveSpeakingWordResult | null>(null)
  const [choosingAnotherMeaning, setChoosingAnotherMeaning] = useState(false)
  const readyWord = saved || (!choosingAnotherMeaning ? existing : undefined)
  useEffect(() => {
    const node = dialog.current
    node?.showModal()
    return () => {
      node?.close()
    }
  }, [])
  const source = useQuery({
    queryKey: ['speaking-word-source', userId, target],
    queryFn: () => speakingVocabularyService.source(target),
    enabled: Boolean(userId && !readyWord),
  })
  const lookup = useQuery({
    queryKey: ['vocabulary', 'lookup-speaking-word', query],
    queryFn: () => vocabularyService.lookup(query, 8),
    enabled: Boolean(userId && query.trim() && !readyWord),
  })
  const exact = (lookup.data?.results || []).filter(
    (item) => normalizeSpeakingWord(item.word) === normalizeSpeakingWord(query),
  )
  const selectedId = chosenId || (exact.length === 1 ? exact[0].id : '')
  const detail = useQuery({
    queryKey: ['vocabulary', 'detail-speaking-word', selectedId],
    queryFn: () => speakingVocabularyService.detail(selectedId),
    enabled: Boolean(userId && selectedId && !readyWord),
  })
  const meanings = detail.data?.meanings || []
  const selectedMeaning = meaningIndex ?? (meanings.length === 1 ? 0 : null)
  const confirmationNeeded =
    source.data?.requires_confirmation ||
    (detail.data &&
      normalizeSpeakingWord(detail.data.word) !==
        normalizeSpeakingWord(source.data?.original_word || target.word))
  const save = useMutation({
    mutationFn: (choice: { id: string; meaning: number; confirmed: boolean }) =>
      speakingVocabularyService.save(target, choice.id, choice.meaning, choice.confirmed),
    onSuccess: (result) => {
      setSaved(result)
      onSaved()
    },
  })
  const canSave = Boolean(
    input.trim() === query &&
      source.data &&
      detail.data &&
      !source.isError &&
      !detail.isError &&
      selectedMeaning !== null &&
      (!confirmationNeeded || confirmed) &&
      !save.isPending &&
      !lookup.isFetching &&
      !detail.isFetching,
  )
  const close = () => {
    if (!save.isPending) onClose()
  }
  return (
    <dialog
      ref={dialog}
      aria-labelledby="speaking-word-save-title"
      onCancel={(event) => {
        event.preventDefault()
        close()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close()
      }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-0 text-text-primary shadow-xl backdrop:bg-black/50"
    >
      <header className="flex items-center justify-between border-b border-border px-5 py-3">
        <h2 id="speaking-word-save-title" className="font-semibold">
          {vi ? 'Lưu từ để học' : 'Save word to learn'}
        </h2>
        <button
          type="button"
          aria-label={vi ? 'Đóng cửa sổ lưu từ' : 'Close save word dialog'}
          onClick={close}
          disabled={save.isPending}
          className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-surface-subtle"
        >
          <X aria-hidden="true" size={20} />
        </button>
      </header>
      <div className="space-y-4 p-5">
        {!userId ? (
          <div role="alert">
            <p>
              {vi
                ? 'Đăng nhập để lưu từ vào Sổ tay của bạn.'
                : 'Sign in to save words to your notebook.'}
            </p>
            <Button
              onClick={() => window.dispatchEvent(new CustomEvent('lingosphere:open-auth-modal'))}
            >
              {vi ? 'Đăng nhập' : 'Sign in'}
            </Button>
          </div>
        ) : readyWord ? (
          <>
            <SpeakingVocabularySavedActions saved={readyWord} userId={userId} />
            <Button
              variant="outline"
              onClick={() => {
                setChoosingAnotherMeaning(true)
                setSaved(null)
                setMeaningIndex(null)
                setConfirmed(false)
              }}
            >
              {vi ? 'Chọn hoặc lưu thêm nghĩa khác' : 'Choose or save another meaning'}
            </Button>
          </>
        ) : (
          <>
            {source.isPending ? (
              <p role="status">
                {vi ? 'Đang kiểm tra nguồn bài nói…' : 'Checking your speaking result…'}
              </p>
            ) : source.isError ? (
              <div role="alert">
                <p>
                  {vi
                    ? 'Không xác minh được từ trong bài nói của bạn. Chưa lưu từ.'
                    : 'Could not verify the word in your speaking result. Nothing has been saved.'}
                </p>
                <Button variant="outline" onClick={() => void source.refetch()}>
                  {vi ? 'Thử lại' : 'Retry'}
                </Button>
              </div>
            ) : (
              source.data && (
                <aside className="space-y-1 rounded-xl bg-surface-subtle p-3 text-sm">
                  <p className="font-medium">
                    {source.data.exercise_title} ·{' '}
                    {source.data.turn_number && target.source_kind !== 'WRITING'
                      ? `${vi ? 'Lượt' : 'Turn'} ${source.data.turn_number}`
                      : vi
                      ? (target.source_kind === 'WRITING' ? 'Bài viết' : 'Bản thu')
                      : (target.source_kind === 'WRITING' ? 'Writing submission' : 'Recording')}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {vocabularySourceTime(source.data.recorded_at, vi)} (UTC+7)
                  </p>
                  <p className="break-words text-text-secondary">“{source.data.transcript}”</p>
                </aside>
              )
            )}
            <form
              className="flex items-end gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                if (input.trim()) {
                  setQuery(input.trim())
                  setChosenId('')
                  setMeaningIndex(null)
                  setConfirmed(false)
                  save.reset()
                }
              }}
            >
              <label className="min-w-0 flex-1 space-y-1 text-sm">
                <span>{vi ? 'Từ bạn muốn học' : 'Word you want to learn'}</span>
                <input
                  value={input}
                  maxLength={120}
                  disabled={save.isPending}
                  onChange={(event) => setInput(event.target.value)}
                  className="min-h-11 w-full rounded-lg border border-border bg-surface px-3"
                />
              </label>
              <Button type="submit" variant="outline" disabled={!input.trim() || save.isPending}>
                {vi ? 'Tra từ' : 'Look up'}
              </Button>
            </form>
            {lookup.isFetching ? (
              <p role="status">{vi ? 'Đang tra từ điển…' : 'Looking up the dictionary…'}</p>
            ) : lookup.isError ? (
              <div role="alert">
                <p>{vi ? 'Chưa tra được từ điển.' : 'Dictionary lookup failed.'}</p>
                <Button variant="outline" onClick={() => void lookup.refetch()}>
                  {vi ? 'Tra lại' : 'Retry lookup'}
                </Button>
              </div>
            ) : !lookup.data?.results.length ? (
              <p>
                {vi
                  ? 'Chưa tìm thấy từ. Bạn có thể sửa từ và tra lại; hệ thống không tự tạo từ từ bản nhận dạng.'
                  : 'No matching entry found. Edit the word and try again; no entry is created from the transcript.'}
              </p>
            ) : (
              <label className="block space-y-1 text-sm">
                <span>{vi ? 'Chọn mục từ trong từ điển' : 'Choose a dictionary entry'}</span>
                <select
                  className="min-h-11 w-full rounded-lg border border-border bg-surface px-3"
                  value={selectedId}
                  disabled={save.isPending}
                  onChange={(event) => {
                    setChosenId(event.target.value)
                    setMeaningIndex(null)
                    setConfirmed(false)
                    save.reset()
                  }}
                >
                  <option value="">{vi ? 'Chọn từ phù hợp' : 'Choose the correct word'}</option>
                  {lookup.data.results.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.word}
                      {item.ipa ? ` /${item.ipa}/` : ''} · {item.meaning || item.pos.join(', ')}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {selectedId &&
              (detail.isPending ? (
                <p role="status">{vi ? 'Đang tải nghĩa…' : 'Loading meanings…'}</p>
              ) : detail.isError ? (
                <div role="alert">
                  <p>{vi ? 'Chưa tải được nghĩa của từ.' : 'Could not load this entry.'}</p>
                  <Button variant="outline" onClick={() => void detail.refetch()}>
                    {vi ? 'Tải lại' : 'Retry'}
                  </Button>
                </div>
              ) : (
                detail.data && (
                  <>
                    <div className="flex items-center gap-2">
                      <strong className="text-lg">{detail.data.word}</strong>
                      <span className="text-sm text-text-secondary">
                        {detail.data.pronunciation}
                      </span>
                      <button
                        type="button"
                        aria-label={vi ? 'Nghe phát âm mẫu của từ' : 'Listen to word pronunciation'}
                        className="flex h-11 w-11 items-center justify-center rounded-lg text-primary"
                        onClick={() => {
                          if (detail.data?.audio_url_us) playAudio(detail.data.audio_url_us)
                          else speakWord(detail.data?.word || query)
                        }}
                      >
                        <Volume2 aria-hidden="true" size={18} />
                      </button>
                    </div>
                    <fieldset className="space-y-2">
                      <legend className="mb-2 text-sm font-medium">
                        {vi
                          ? 'Chọn đúng nghĩa trong câu bạn nói'
                          : 'Choose the meaning used in your sentence'}
                      </legend>
                      {meanings.map((meaning, index) => (
                        <label
                          key={index}
                          className="flex cursor-pointer gap-3 rounded-xl border border-border p-3 text-sm"
                        >
                          <input
                            type="radio"
                            name="speaking-word-meaning"
                            checked={selectedMeaning === index}
                            disabled={save.isPending}
                            onChange={() => {
                              setMeaningIndex(index)
                              save.reset()
                            }}
                          />
                          <span>
                            <span className="text-xs text-text-secondary">
                              {meaning.part_of_speech}
                            </span>
                            <span className="block">
                              {vi
                                ? meaning.definition_vi || meaning.definition_en
                                : meaning.definition_en || meaning.definition_vi}
                            </span>
                            {meaning.examples?.[0] && (
                              <span className="mt-1 block italic text-text-secondary">
                                {meaning.examples[0].sentence_en}
                              </span>
                            )}
                          </span>
                        </label>
                      ))}
                    </fieldset>
                    {confirmationNeeded && (
                      <label className="flex gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
                        <input
                          type="checkbox"
                          checked={confirmed}
                          disabled={save.isPending}
                          onChange={(event) => setConfirmed(event.target.checked)}
                        />
                        <span>
                          {target.source_kind === 'WRITING' ? (vi ? `Bạn đã chọn từ khác với gợi ý sửa. Tôi xác nhận muốn học “${detail.data.word}”.` : `I selected a different word and confirm that I want to learn “${detail.data.word}”.`) : vi
                            ? `Bản nhận dạng có thể chưa đúng hoặc bạn đã chọn từ khác. Tôi xác nhận từ muốn học là “${detail.data.word}”.`
                            : `The transcript may be inaccurate or you selected a different word. I confirm that “${detail.data.word}” is the word I want to learn.`}
                        </span>
                      </label>
                    )}
                  </>
                )
              ))}
            {save.isError && (
              <p role="alert" className="text-sm text-red-600">
                {save.error instanceof Error
                  ? save.error.message
                  : vi
                  ? 'Chưa lưu được từ. Vui lòng thử lại.'
                  : 'Could not save. Please retry.'}
              </p>
            )}
            <Button
              disabled={!canSave}
              onClick={() => {
                if (selectedMeaning !== null)
                  save.mutate({ id: selectedId, meaning: selectedMeaning, confirmed })
              }}
            >
              {save.isPending
                ? vi
                  ? 'Đang lưu…'
                  : 'Saving…'
                : vi
                ? 'Lưu nghĩa này vào Sổ tay'
                : 'Save this meaning to notebook'}
            </Button>
          </>
        )}
      </div>
    </dialog>
  )
}
