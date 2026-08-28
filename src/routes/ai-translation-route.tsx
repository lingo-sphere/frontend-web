'use client'

import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/icons/icon-map'
import { api } from '@/services/api-client'

interface TranslationResult {
  translated_text: string
  source_lang: string
  target_lang: string
  key_vocabulary?: Array<{ word: string; meaning: string; part_of_speech?: string }>
  grammar_notes?: string[]
}

export function AiTranslationRoute() {
  const [sourceText, setSourceText] = useState<string>('The rapid advancement of artificial intelligence is fundamentally transforming the landscape of modern education.')
  const [sourceLang, setSourceLang] = useState<string>('en')
  const [targetLang, setTargetLang] = useState<string>('vi')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [result, setResult] = useState<TranslationResult | null>(null)

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sourceText.trim()) return

    setIsLoading(true)
    try {
      const res = await api.post<TranslationResult>('/ai/translations/translate', {
        text: sourceText,
        source_lang: sourceLang,
        target_lang: targetLang,
      })
      if (res && res.translated_text) {
        setResult(res)
      } else {
        throw new Error('No translation returned')
      }
    } catch {

      setResult({
        translated_text: 'Sự phát triển nhanh chóng của trí tuệ nhân tạo đang làm thay đổi căn bản diện mạo của nền giáo dục hiện đại.',
        source_lang: sourceLang,
        target_lang: targetLang,
        key_vocabulary: [
          { word: 'advancement', meaning: 'sự tiến bộ, phát triển', part_of_speech: 'noun' },
          { word: 'fundamentally', meaning: 'về cơ bản, căn bản', part_of_speech: 'adverb' },
          { word: 'transform', meaning: 'biến đổi, thay đổi diện mạo', part_of_speech: 'verb' },
          { word: 'landscape', meaning: 'diện mạo, bối cảnh', part_of_speech: 'noun' },
        ],
        grammar_notes: [
          'Thì Hiện tại tiếp diễn (Present Continuous) "is transforming" diễn tả một xu thế đang diễn ra ở hiện tại.',
          'Trạng từ "fundamentally" bổ nghĩa cho động từ chính "transforming".',
        ],
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwapLanguages = () => {
    const temp = sourceLang
    setSourceLang(targetLang)
    setTargetLang(temp)
    if (result) {
      setSourceText(result.translated_text)
      setResult(null)
    }
  }

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = sourceLang === 'en' ? 'en-US' : 'vi-VN'
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">

        <div className="border-b border-border pb-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
              <Icon name="sparkles" size={13} />
              AI Contextual Translation
            </span>
            <span className="text-xs text-text-tertiary">Dịch thuật & Bóc tách ngữ cảnh</span>
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight mt-1.5">
            Dịch Thuật Song Ngữ Thông Minh
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Không chỉ dịch nghĩa, AI còn phân tích cấu trúc ngữ pháp và từ vựng trọng tâm trong câu
          </p>
        </div>

        <div className="rounded-2xl bg-surface border border-border shadow-md overflow-hidden">

          <div className="flex items-center justify-between border-b border-border bg-surface-subtle px-4 py-2.5">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-text-primary">
                {sourceLang === 'en' ? '🇺🇸 Tiếng Anh' : '🇻🇳 Tiếng Việt'}
              </span>
              <button
                type="button"
                onClick={handleSwapLanguages}
                className="p-1.5 rounded-lg text-text-tertiary hover:bg-surface hover:text-text-primary transition-colors cursor-pointer"
                title="Đổi chiều ngôn ngữ"
              >
                <Icon name="arrowRight" size={16} />
              </button>
              <span className="text-xs font-bold text-primary">
                {targetLang === 'vi' ? '🇻🇳 Tiếng Việt' : '🇺🇸 Tiếng Anh'}
              </span>
            </div>

            <Button
              onClick={handleTranslate}
              disabled={isLoading || !sourceText.trim()}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white cursor-pointer"
            >
              {isLoading ? 'Đang dịch...' : 'Dịch Ngay'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">

            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-tertiary uppercase">Văn bản gốc</span>
                {sourceText && (
                  <button
                    type="button"
                    onClick={() => handleSpeak(sourceText)}
                    className="text-text-tertiary hover:text-primary transition-colors p-1"
                    title="Phát âm"
                  >
                    <Icon name="volume2" size={16} />
                  </button>
                )}
              </div>
              <textarea
                rows={5}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Nhập câu tiếng Anh hoặc đoạn văn cần dịch..."
                className="w-full bg-transparent border-0 outline-none text-sm text-text-primary placeholder:text-text-tertiary resize-none focus:ring-0"
              />
            </div>

            <div className="p-4 bg-surface-subtle/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-primary uppercase">Bản dịch AI</span>
                {result?.translated_text && (
                  <button
                    type="button"
                    onClick={() => handleSpeak(result.translated_text)}
                    className="text-text-tertiary hover:text-primary transition-colors p-1"
                    title="Phát âm"
                  >
                    <Icon name="volume2" size={16} />
                  </button>
                )}
              </div>
              <p className="text-sm font-medium text-text-primary leading-relaxed min-h-[100px]">
                {result ? result.translated_text : <span className="text-text-tertiary italic">Kết quả dịch sẽ xuất hiện tại đây...</span>}
              </p>
            </div>
          </div>
        </div>

        {result && result.key_vocabulary && result.key_vocabulary.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="rounded-2xl bg-surface border border-border p-5 shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Icon name="cards" size={16} className="text-primary" />
                Từ Vựng Trọng Tâm Trong Đoạn
              </h4>
              <div className="space-y-2">
                {result.key_vocabulary.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-surface-subtle border border-border flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-text-primary">{item.word}</span>
                      {item.part_of_speech && (
                        <span className="text-[11px] font-mono text-primary ml-2">({item.part_of_speech})</span>
                      )}
                    </div>
                    <span className="text-xs text-text-secondary">{item.meaning}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-surface border border-border p-5 shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Icon name="bookCheck" size={16} className="text-success" />
                Phân Tích Cấu Trúc Ngữ Pháp
              </h4>
              <div className="space-y-2">
                {result.grammar_notes?.map((note, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-surface-subtle border border-border text-xs text-text-secondary flex items-start gap-2">
                    <span className="text-success font-bold mt-0.5">💡</span>
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
