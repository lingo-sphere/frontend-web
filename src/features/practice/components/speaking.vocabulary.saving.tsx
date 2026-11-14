'use client'

import { useState, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { speakingVocabularyService } from '../services/speaking-vocabulary.service'
import { speakingWordSourceKey, validSpeakingWordTarget } from '../lib/speaking-vocabulary'
import type { SpeakingWordTarget, SpeakingSavedWord } from '../types/speaking-vocabulary'
import { SpeakingVocabularySaveDialog } from './speaking.vocabulary.save.dialog'

export interface SpeakingVocabularyActions {
  renderSaveButton: (target: SpeakingWordTarget) => ReactNode
}

/** One batched status query and one dialog for all word buttons on a screen. */
export function SpeakingVocabularySaving({
  targets,
  children,
}: {
  targets: SpeakingWordTarget[]
  children: (actions: SpeakingVocabularyActions) => ReactNode
}) {
  const { i18n } = useTranslation(),
    vi = i18n.language.startsWith('vi')
  const userId = useAuthStore((state) => state.user?.user_id)
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<SpeakingWordTarget | null>(null)
  const sourceKeys = [
    ...new Set(targets.filter(validSpeakingWordTarget).map(speakingWordSourceKey)),
  ].sort()
  const status = useQuery({
    queryKey: ['vocabulary', 'speaking-saved-status', userId, sourceKeys],
    queryFn: () => speakingVocabularyService.status(sourceKeys),
    enabled: Boolean(userId && sourceKeys.length),
    staleTime: 0,
  })
  const savedWords = new Map<string, SpeakingSavedWord>()
  for (const item of status.data || [])
    if (!savedWords.has(item.source_key)) savedWords.set(item.source_key, item)
  const renderSaveButton = (target: SpeakingWordTarget) => {
    if (!validSpeakingWordTarget(target)) return null
    const saved = savedWords.get(speakingWordSourceKey(target))
    const label = saved
      ? vi
        ? `Đã lưu “${saved.word}” — xem hoặc học`
        : `“${saved.word}” saved — view or learn`
      : vi
      ? `Lưu từ “${target.word}” để học`
      : `Save “${target.word}” to learn`
    return (
      <button
        type="button"
        aria-label={label}
        title={label}
        onClick={() => setSelected(target)}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border text-primary transition hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-primary"
      >
        {saved ? (
          <BookmarkCheck aria-hidden="true" size={18} />
        ) : (
          <Bookmark aria-hidden="true" size={18} />
        )}
      </button>
    )
  }
  return (
    <>
      {children({ renderSaveButton })}
      {selected && (
        <SpeakingVocabularySaveDialog
          key={`${userId}:${speakingWordSourceKey(selected)}`}
          target={selected}
          userId={userId}
          existing={status.data?.find(
            (item) => item.source_key === speakingWordSourceKey(selected),
          )}
          onClose={() => setSelected(null)}
          onSaved={() => {
            void queryClient.invalidateQueries({ queryKey: ['vocabulary'] })
          }}
        />
      )}
    </>
  )
}
