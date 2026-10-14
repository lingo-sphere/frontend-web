/**
 * @file vocab.quick.popover.tsx
 * @description Component tra từ nhanh 1-chạm (Quick Vocab Popover) tích hợp trong bài tập
 */

'use client'

import { useState } from 'react'
import { Icon } from '@/components/icon.map'
import type { TargetVocabularyRef } from '../types/grammar-practice'

interface VocabQuickPopoverProps {
  vocabularies?: TargetVocabularyRef[]
}

export function VocabQuickPopover({ vocabularies = [] }: VocabQuickPopoverProps) {
  const [selectedWord, setSelectedWord] = useState<TargetVocabularyRef | null>(null)
  const [savedWords, setSavedWords] = useState<Record<string, boolean>>({})

  if (!vocabularies || vocabularies.length === 0) {
    return null
  }

  const handleSaveToFlashcard = (word: string) => {
    setSavedWords((prev) => ({ ...prev, [word]: true }))
  }

  return (
    <div className="relative mt-3 inline-block w-full">
      {/* Target Vocab Pills / Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
          Từ vựng / Cụm từ:
        </span>
        {vocabularies.map((item, idx) => {
          const isSelected = selectedWord?.word === item.word
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedWord(isSelected ? null : item)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-primary text-white shadow-sm ring-2 ring-primary/30'
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              <Icon name="search" size={13} />
              <span>{item.word}</span>
              {item.pos && <span className="opacity-70">({item.pos})</span>}
            </button>
          )
        })}
      </div>

      {/* Popover Card */}
      {selectedWord && (
        <div className="mt-2 w-full max-w-sm rounded-xl border border-primary/20 bg-surface-elevated p-4 shadow-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-text-primary">{selectedWord.word}</h4>
                {selectedWord.pos && (
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-semibold text-primary">
                    {selectedWord.pos}
                  </span>
                )}
              </div>
              {selectedWord.ipa && (
                <p className="mt-0.5 font-mono text-xs text-text-secondary">{selectedWord.ipa}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedWord(null)}
              className="rounded p-1 text-text-tertiary hover:bg-surface-subtle hover:text-text-primary"
            >
              <Icon name="x" size={16} />
            </button>
          </div>

          <div className="mt-3 rounded-lg bg-surface-subtle p-2.5">
            <span className="text-[11px] font-semibold uppercase text-text-tertiary">
              Nghĩa trong ngữ cảnh này:
            </span>
            <p className="mt-0.5 text-sm font-semibold text-text-primary">
              {selectedWord.meaning_vi}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5">
            <span className="text-[11px] text-text-tertiary">Dữ liệu từ Vocabulary Engine</span>
            <button
              type="button"
              onClick={() => handleSaveToFlashcard(selectedWord.word)}
              disabled={savedWords[selectedWord.word]}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                savedWords[selectedWord.word]
                  ? 'bg-success/15 text-success'
                  : 'bg-primary text-white hover:bg-primary-hover active:scale-95'
              }`}
            >
              <Icon name={savedWords[selectedWord.word] ? 'check' : 'plus'} size={14} />
              <span>{savedWords[selectedWord.word] ? 'Đã lưu' : 'Lưu Flashcard'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
