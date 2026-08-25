// Updated: 2026-08-22
// Dictionary Modal

import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import { Search, X, Volume2, Plus, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { searchDictionary } from '@/data/dictionary-data'
import type { DictionaryEntry, PartOfSpeech } from '@/data/dictionary-data'

interface DictionaryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAction: (message: string) => void
}

const getPOSLabels = (isVietnamese: boolean): Record<PartOfSpeech, string> => ({
  NOUN: isVietnamese ? 'DANH TỪ' : 'NOUN',
  VERB: isVietnamese ? 'ĐỘNG TỪ' : 'VERB',
  ADJ: isVietnamese ? 'TÍNH TỪ' : 'ADJECTIVE',
  ADV: isVietnamese ? 'PHÓ TỪ' : 'ADVERB',
  PRON: isVietnamese ? 'ĐẠI TỪ' : 'PRONOUN',
  PREP: isVietnamese ? 'GIỚI TỪ' : 'PREPOSITION',
  CONJ: isVietnamese ? 'LIÊN TỪ' : 'CONJUNCTION',
  PHRASE: isVietnamese ? 'CỤM TỪ' : 'PHRASE',
  PHRASAL_VERB: isVietnamese ? 'CỤM ĐỘNG TỪ' : 'PHRASAL VERB',
})

const POS_COLORS: Record<PartOfSpeech, string> = {
  NOUN: 'bg-info/10 text-info',
  VERB: 'bg-primary/10 text-primary',
  ADJ: 'bg-ai/10 text-ai',
  ADV: 'bg-warning/10 text-warning',
  PRON: 'bg-success/10 text-success',
  PREP: 'bg-surface-subtle text-text-secondary',
  CONJ: 'bg-surface-subtle text-text-secondary',
  PHRASE: 'bg-primary/10 text-primary',
  PHRASAL_VERB: 'bg-warning/10 text-warning',
}

export function DictionaryModal({ open, onOpenChange, onAction }: DictionaryModalProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [query, setQuery] = useState('')

  const results = useMemo(() => searchDictionary(query), [query])
  const POS_LABELS = getPOSLabels(isVietnamese)

  const handleSave = (word: DictionaryEntry) => {
    onAction(isVietnamese ? `Đã lưu "${word.word}"` : `Saved "${word.word}"`)
  }

  const handlePlay = (word: DictionaryEntry) => {
    onAction(`${isVietnamese ? 'Phát âm' : 'Pronouncing'}: ${word.word}`)
  }

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4" onClick={() => onOpenChange(false)}>
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="text-primary" size={20} />
            <h2 className="text-lg font-semibold text-text-primary">{isVietnamese ? 'Từ điển' : 'Dictionary'}</h2>
          </div>
          <button onClick={() => onOpenChange(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover">
            <X size={18} />
          </button>
        </div>

        <div className="border-b border-border px-5 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input autoFocus type="text"
              placeholder={isVietnamese ? 'Tìm từ vựng hoặc cụm từ...' : 'Search for a word or phrase...'}
              value={query} onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-[14px] text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none" />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {query.trim() === '' ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="mb-3 text-text-tertiary" size={48} />
              <p className="text-[14px] text-text-secondary">{isVietnamese ? 'Nhập từ hoặc cụm từ để tra cứu' : 'Enter a word or phrase to search'}</p>
              <p className="mt-1 text-[12px] text-text-tertiary">e.g. book, about, topic of conversation</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="mb-3 text-text-tertiary" size={48} />
              <p className="text-[14px] text-text-secondary">{isVietnamese ? `Không tìm thấy kết quả cho "${query}"` : `No results found for "${query}"`}</p>
              <p className="mt-1 text-[12px] text-text-tertiary">{isVietnamese ? 'Thử từ khác hoặc kiểm tra chính tả' : 'Try a different word or check spelling'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((entry) => (
                <EntryCard key={entry.id} entry={entry} onSave={handleSave} onPlay={handlePlay} POS_LABELS={POS_LABELS} isVietnamese={isVietnamese} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

interface EntryCardProps {
  entry: DictionaryEntry
  onSave: (entry: DictionaryEntry) => void
  onPlay: (entry: DictionaryEntry) => void
  POS_LABELS: Record<PartOfSpeech, string>
  isVietnamese: boolean
}

function EntryCard({ entry, onSave, onPlay, POS_LABELS, isVietnamese }: EntryCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 transition-all hover:border-primary/30">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[18px] font-bold text-text-primary">{entry.word}</h3>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${POS_COLORS[entry.wordType]}`}>
              {POS_LABELS[entry.wordType]}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-text-secondary">
            <button onClick={() => onPlay(entry)} className="flex items-center gap-1 rounded-md px-1.5 py-0.5 hover:bg-surface-hover">
              <span className="text-text-tertiary">UK</span>
              <span className="font-mono">{entry.pronunciationUk}</span>
              <Volume2 size={12} className="text-primary" />
            </button>
            <button onClick={() => onPlay(entry)} className="flex items-center gap-1 rounded-md px-1.5 py-0.5 hover:bg-surface-hover">
              <span className="text-text-tertiary">US</span>
              <span className="font-mono">{entry.pronunciationUs}</span>
              <Volume2 size={12} className="text-primary" />
            </button>
            {entry.isCommon && (
              <span className="rounded bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success">Common</span>
            )}
            <span className="text-text-tertiary">{entry.cefrLevel}</span>
          </div>
        </div>
        <Button size="sm" className="shrink-0 gap-1 bg-primary hover:bg-primary-hover" onClick={() => onSave(entry)}>
          <Plus size={14} />
          {isVietnamese ? 'Lưu' : 'Save'}
        </Button>
      </div>

      <div className="mt-3 space-y-3">
        {entry.meanings.map((meaning) => (
          <div key={meaning.id} className="border-l-2 border-primary/30 pl-3">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-[11px] text-text-tertiary">#{meaning.meaningOrder}</span>
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${POS_COLORS[meaning.partOfSpeech]}`}>
                {POS_LABELS[meaning.partOfSpeech]}
              </span>
            </div>
            <p className="text-[13px] text-text-primary">
              <span className="font-medium text-primary">VI: </span>{meaning.definitionVi}
            </p>
            <p className="mt-0.5 text-[12px] text-text-secondary">
              <span className="font-medium">EN: </span>{meaning.definitionEn}
            </p>
            {meaning.examples.length > 0 && (
              <div className="mt-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">{isVietnamese ? 'Ví dụ' : 'Examples'}</p>
                <ul className="mt-1 space-y-0.5">
                  {meaning.examples.map((example, idx) => (
                    <li key={idx} className="flex gap-2 text-[12px] italic text-text-secondary">
                      <span className="text-primary">•</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
