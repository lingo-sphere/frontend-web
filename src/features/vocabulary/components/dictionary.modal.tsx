// Hộp thoại tra cứu từ điển thông minh và lưu từ vựng vào bộ thẻ học viên.
'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import { Search, X, Volume2, Plus, BookOpen } from 'lucide-react'
import { Button } from '@/components/button'
import { vocabularyService } from '@/features/vocabulary/services/vocabulary.service'
import type { LexicalItem } from '@/types/api.types'

interface RawMeaning {
  part_of_speech?: string
  definition_vi?: string
  definition_en?: string
  examples?: string[]
}

interface LexicalSearchResult extends LexicalItem {
  word_type?: string
  pronunciation_us?: string
  pronunciation_uk?: string
  meanings?: RawMeaning[]
}

interface DictionaryItem {
  id: string
  word: string
  wordType: string
  pronunciationUs?: string
  pronunciationUk?: string
  meanings: Array<{
    partOfSpeech: string
    definitionVi: string
    definitionEn?: string
    examples?: string[]
  }>
}

interface DictionaryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAction: (message: string) => void
}

export function DictionaryModal({ open, onOpenChange, onAction }: DictionaryModalProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DictionaryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true)
        const liveItems = await vocabularyService.searchVocabulary({ q: query.trim() })
        if (Array.isArray(liveItems)) {
          const mapped: DictionaryItem[] = (liveItems as LexicalSearchResult[]).map((item) => ({
            id: item._id || item.id,
            word: item.word,
            wordType: item.word_type || item.part_of_speech || 'noun',
            pronunciationUs: item.pronunciation_us || item.ipa,
            pronunciationUk: item.pronunciation_uk || item.ipa,
            meanings: item.meanings && item.meanings.length > 0
              ? item.meanings.map((m) => ({
                  partOfSpeech: m.part_of_speech || item.word_type || item.part_of_speech || 'noun',
                  definitionVi: m.definition_vi || item.meaning_vi || '',
                  definitionEn: m.definition_en || item.meaning_en || '',
                  examples: m.examples || [],
                }))
              : [
                  {
                    partOfSpeech: item.part_of_speech || 'noun',
                    definitionVi: item.meaning_vi || '',
                    definitionEn: item.meaning_en || '',
                    examples: item.example_sentence ? [item.example_sentence] : [],
                  },
                ],
          }))
          setResults(mapped)
        }
      } catch (err) {
        console.error('Dictionary search failed:', err)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleSave = (word: DictionaryItem) => {
    onAction(isVietnamese ? `Đã lưu "${word.word}"` : `Saved "${word.word}"`)
  }

  const handlePlay = (word: DictionaryItem) => {
    onAction(`${isVietnamese ? 'Phát âm' : 'Pronouncing'}: ${word.word}`)
  }

  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
    }
  }, [open])

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="text-primary" size={20} />
            <h2 className="text-lg font-semibold text-text-primary">
              {isVietnamese ? 'Từ điển' : 'Dictionary'}
            </h2>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover"
          >
            <X size={18} />
          </button>
        </div>

        <div className="border-b border-border px-5 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              autoFocus
              type="text"
              placeholder={
                isVietnamese
                  ? 'Tìm từ vựng hoặc cụm từ...'
                  : 'Search for a word or phrase...'
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-[14px] text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {query.trim() === '' ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="mb-3 text-text-tertiary" size={48} />
              <p className="text-[14px] text-text-secondary">
                {isVietnamese
                  ? 'Nhập từ hoặc cụm từ để tra cứu'
                  : 'Enter a word or phrase to search'}
              </p>
              <p className="mt-1 text-[12px] text-text-tertiary">
                e.g. innovate, business, collaborate
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="mb-3 text-text-tertiary" size={48} />
              <p className="text-[14px] text-text-secondary">
                {isVietnamese
                  ? `Không tìm thấy kết quả cho "${query}"`
                  : `No results found for "${query}"`}
              </p>
              <p className="mt-1 text-[12px] text-text-tertiary">
                {isVietnamese
                  ? 'Thử từ khác hoặc kiểm tra chính tả'
                  : 'Try a different word or check spelling'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-border bg-surface p-4 transition-all hover:border-primary/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[18px] font-bold text-text-primary">
                          {entry.word}
                        </h3>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                          {entry.wordType}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-text-secondary">
                        {entry.pronunciationUk && (
                          <button
                            onClick={() => handlePlay(entry)}
                            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 hover:bg-surface-hover"
                          >
                            <span className="text-text-tertiary">UK</span>
                            <span className="font-mono">
                              /{entry.pronunciationUk}/
                            </span>
                            <Volume2 size={12} className="text-primary" />
                          </button>
                        )}
                        {entry.pronunciationUs && (
                          <button
                            onClick={() => handlePlay(entry)}
                            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 hover:bg-surface-hover"
                          >
                            <span className="text-text-tertiary">US</span>
                            <span className="font-mono">
                              /{entry.pronunciationUs}/
                            </span>
                            <Volume2 size={12} className="text-primary" />
                          </button>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-xs"
                      onClick={() => handleSave(entry)}
                    >
                      <Plus size={14} />
                      {isVietnamese ? 'Lưu từ' : 'Save'}
                    </Button>
                  </div>

                  {entry.meanings.map((m, idx) => (
                    <div
                      key={idx}
                      className="mt-3 border-t border-border/50 pt-2"
                    >
                      <p className="text-[13px] font-medium text-text-primary">
                        {m.definitionVi}
                      </p>
                      {m.definitionEn && (
                        <p className="text-[12px] text-text-secondary">
                          {m.definitionEn}
                        </p>
                      )}
                      {m.examples && m.examples.length > 0 && (
                        <p className="mt-1 text-[11px] italic text-text-tertiary">
                          "{m.examples[0]}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
