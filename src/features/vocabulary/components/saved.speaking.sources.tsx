'use client'

import type { SpeakingVocabularySource } from '../types/vocabulary-source'
import { vocabularySourceTime } from '../lib/vocabulary-source'

export function SavedSpeakingSources({
  sources,
  vi,
}: {
  sources?: SpeakingVocabularySource[]
  vi: boolean
}) {
  if (!sources?.length) return null
  return (
    <details
      className="my-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm"
      onClick={(event) => event.stopPropagation()}
    >
      <summary className="cursor-pointer font-medium text-primary">
        {vi ? 'Nguồn từ bài luyện' : 'Practice sources'} ({sources.length})
      </summary>
      <ul className="mt-2 space-y-3">
        {sources.map((source) => (
          <li key={source.source_key} className="space-y-1 break-words text-xs text-text-secondary">
            <p className="font-medium text-text-primary">
              {source.exercise_title}
              {source.turn_number && source.source_kind !== 'WRITING' ? ` · ${vi ? 'Lượt' : 'Turn'} ${source.turn_number}` : ''}
            </p>
            <p>{vocabularySourceTime(source.recorded_at, vi)} (UTC+7)</p>
            {source.original_word !== source.confirmed_word && (
              <p>
                {vi ? 'Từ được ghi nhận: ' : 'Recorded word: '}
                {source.original_word} → {source.confirmed_word}
              </p>
            )}
            <p>“{source.transcript}”</p>
            <a
              href={`/${source.source_kind === 'WRITING' ? 'writing' : 'speaking'}/result/${encodeURIComponent(source.attempt_id)}`}
              className="inline-flex min-h-11 items-center font-medium text-primary underline"
            >
              {source.source_kind === 'WRITING' ? (vi ? 'Xem lại bài viết và câu sửa' : 'Review writing and correction') : (vi ? 'Xem và nghe lại bài nói' : 'View and replay speaking result')}
            </a>
          </li>
        ))}
      </ul>
    </details>
  )
}
