'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { vocabularyService } from '@/features/vocabulary/services/vocabulary.service'
import { Button } from '@/components/button'
import type { SaveSpeakingWordResult } from '../types/speaking-vocabulary'
import { speakingVocabularyService } from '../services/speaking-vocabulary.service'

export function SpeakingVocabularySavedActions({
  saved,
  userId,
}: {
  saved: Pick<SaveSpeakingWordResult, 'word' | 'lexical_item_id' | 'meaning_index'>
  userId: string
}) {
  const { i18n } = useTranslation(),
    vi = i18n.language.startsWith('vi')
  const queryClient = useQueryClient()
  const [deckId, setDeckId] = useState('')
  const [addedDecks, setAddedDecks] = useState<string[]>([])
  const detail = useQuery({
    queryKey: ['vocabulary', 'detail-speaking-word', saved.lexical_item_id],
    queryFn: () => speakingVocabularyService.detail(saved.lexical_item_id),
  })
  const meaning = detail.data?.meanings[saved.meaning_index]
  const decks = useQuery({
    queryKey: ['vocabulary', 'my-enrollments', userId],
    queryFn: () => vocabularyService.getMyEnrollments(),
  })
  const ownedDecks = (decks.data || []).filter(
    (deck) => deck.creator_id === userId && deck.creator_type === 'USER',
  )
  const add = useMutation({
    mutationFn: (id: string) =>
      vocabularyService.addCardToDeck(id, {
        lexical_item_id: saved.lexical_item_id,
        meaning_index: saved.meaning_index,
      }),
    onSuccess: (_, id) => {
      setAddedDecks((previous) => [...new Set([...previous, id])])
      void queryClient.invalidateQueries({ queryKey: ['vocabulary'] })
    },
  })
  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        {vi ? 'Nghĩa' : 'Meaning'} #{saved.meaning_index + 1}
        {meaning
          ? `: ${
              vi
                ? meaning.definition_vi || meaning.definition_en
                : meaning.definition_en || meaning.definition_vi
            }`
          : ''}
      </p>
      <p role="status" className="rounded-xl bg-primary/10 p-3 text-sm text-text-primary">
        {vi ? `Đã lưu “${saved.word}” vào Sổ tay.` : `“${saved.word}” is saved to your notebook.`}
      </p>
      <p className="text-sm text-text-secondary">
        {vi
          ? 'Thêm từ vào bộ thẻ rồi bắt đầu học để cập nhật tiến độ và lịch ôn SRS từ vựng. Tiến độ đã có của từ được giữ nguyên.'
          : 'Add the word to a deck and start learning to update vocabulary progress and SRS scheduling. Existing progress is preserved.'}
      </p>
      <a
        className="inline-flex min-h-11 items-center font-medium text-primary underline"
        href="/vocabulary/notebook"
      >
        {vi ? 'Xem trong Sổ tay' : 'View notebook'}
      </a>
      {decks.isPending ? (
        <p role="status">{vi ? 'Đang tải bộ thẻ…' : 'Loading decks…'}</p>
      ) : decks.isError ? (
        <div role="alert">
          <p>
            {vi
              ? 'Từ đã lưu, nhưng chưa tải được bộ thẻ.'
              : 'The word is saved, but decks could not be loaded.'}
          </p>
          <Button variant="outline" onClick={() => void decks.refetch()}>
            {vi ? 'Tải lại bộ thẻ' : 'Retry decks'}
          </Button>
        </div>
      ) : ownedDecks.length ? (
        <>
          <label className="block space-y-2 text-sm">
            <span>{vi ? 'Thêm vào bộ thẻ của bạn' : 'Add to your deck'}</span>
            <select
              className="min-h-11 w-full rounded-lg border border-border bg-surface px-3"
              value={deckId}
              disabled={add.isPending}
              onChange={(event) => setDeckId(event.target.value)}
            >
              <option value="">{vi ? 'Chọn bộ thẻ' : 'Choose a deck'}</option>
              {ownedDecks.map((deck) => (
                <option key={deck._id} value={deck._id} disabled={deck.card_count >= 30}>
                  {deck.name}
                  {deck.card_count >= 30
                    ? vi
                      ? ' — đã đủ 30 thẻ'
                      : ' — 30-card limit reached'
                    : ''}
                </option>
              ))}
            </select>
          </label>
          <Button
            disabled={!deckId || add.isPending || addedDecks.includes(deckId)}
            onClick={() => add.mutate(deckId)}
          >
            {add.isPending
              ? vi
                ? 'Đang thêm…'
                : 'Adding…'
              : addedDecks.includes(deckId)
              ? vi
                ? 'Đã có trong bộ thẻ'
                : 'Ready in deck'
              : vi
              ? 'Thêm từ vào bộ thẻ'
              : 'Add word to deck'}
          </Button>
          {add.isError && (
            <p role="alert" className="text-sm text-red-600">
              {vi
                ? 'Chưa thêm được vào bộ thẻ. Từ vẫn được giữ trong Sổ tay; bạn có thể thử lại.'
                : 'Could not add to the deck. The word remains saved in your notebook; you can retry.'}
            </p>
          )}
          {addedDecks.includes(deckId) && (
            <a
              href={`/vocabulary/learn/${encodeURIComponent(deckId)}`}
              className="ml-3 inline-flex min-h-11 items-center font-medium text-primary underline"
            >
              {vi ? 'Học ngay' : 'Learn now'}
            </a>
          )}
        </>
      ) : (
        <p className="text-sm text-text-secondary">
          {vi
            ? 'Bạn chưa có bộ thẻ cá nhân phù hợp. Có thể tích lũy từ trong Sổ tay và tạo bộ thẻ khi có ít nhất 5 từ.'
            : 'No personal deck is available. Collect words in your notebook and create a deck once you have at least five words.'}
        </p>
      )}
    </div>
  )
}
