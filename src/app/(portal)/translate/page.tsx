'use client'

/**
 * @file page.tsx
 * @description Trang giao diện người dùng (Next.js App Router) cho tuyến (portal)/translate
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/icons/icon-map'
import { aiService, type TranslationResponse, type UserAiQuotaSummary } from '@/services/ai.service'
import { useAuthStore } from '@/store/auth-store'

export default function AiTranslationAppPage() {
  const { user } = useAuthStore()
  const [sourceText, setSourceText] = useState<string>(
    'The rapid advancement of artificial intelligence is fundamentally transforming the landscape of modern education.',
  )
  const [sourceLang, setSourceLang] = useState<string>('en')
  const [targetLang, setTargetLang] = useState<string>('vi')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [result, setResult] = useState<TranslationResponse | null>(null)
  const [quota, setQuota] = useState<UserAiQuotaSummary | null>(null)
  const [errorBanner, setErrorBanner] = useState<string | null>(null)

  const isPremiumUser = Boolean(user?.is_premium || quota?.is_premium)
  const transRemaining = quota ? (isPremiumUser ? 999999 : quota.translation.remaining) : 5
  const isOutOfQuota = !isPremiumUser && transRemaining <= 0

  const fetchQuota = async () => {
    try {
      const q = await aiService.getAiQuota()
      if (q) setQuota(q)
    } catch {}
  }

  useEffect(() => {
    fetchQuota()
  }, [])

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sourceText.trim() || isLoading) return

    if (isOutOfQuota) {
      setErrorBanner('Bạn đã sử dụng hết 5 lượt dịch thuật miễn phí. Vui lòng nâng cấp gói Premium để dịch thuật không giới hạn!')
      return
    }

    if (!isPremiumUser && sourceText.length > 3500) {
      setErrorBanner('Văn bản vượt quá giới hạn 1.000 tokens (~3.500 ký tự) của gói Miễn phí. Vui lòng rút gọn nội dung hoặc nâng cấp VIP.')
      return
    }

    setIsLoading(true)
    setErrorBanner(null)

    try {
      const res = await aiService.translate({
        text: sourceText,
        source_lang: sourceLang,
        target_lang: targetLang,
      })
      if (res && res.translated_text) {
        setResult(res)
        if (res.quota) {
          setQuota((prev) =>
            prev
              ? {
                  ...prev,
                  is_premium: res.quota!.is_premium,
                  translation: {
                    ...prev.translation,
                    remaining: res.quota!.remaining,
                    used: (prev.translation.used || 0) + 1,
                  },
                }
              : null
          )
        } else {
          fetchQuota()
        }
      }
    } catch (err: any) {
      const errMsg = err?.message || ''
      if (errMsg.includes('hết') || errMsg.includes('Premium') || errMsg.includes('hạn ngạch') || errMsg.includes('1.000 tokens')) {
        setErrorBanner(errMsg)
      } else {
        setErrorBanner('Dịch vụ AI đang bận hoặc xảy ra lỗi kết nối. Vui lòng thử lại sau.')
      }
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
    <>
      <div className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between border-b border-border pb-5 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
                <Icon name="sparkles" size={13} />
                AI Contextual Translation
              </span>
              <span className="text-xs text-text-tertiary">Chuyên sâu Tiếng Anh ⇋ Tiếng Việt</span>
            </div>
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight mt-1.5">
              Dịch Thuật Song Ngữ Thông Minh
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Phân tích cấu trúc ngữ pháp và trích xuất từ vựng trọng tâm trong từng câu dịch
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isPremiumUser ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-bold shadow-xs">
                <Icon name="award" size={14} className="text-amber-500" />
                <span>VIP Premium • Dịch không giới hạn</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-xs ${
                  transRemaining > 1
                    ? 'bg-surface-subtle border-border text-text-secondary'
                    : 'bg-destructive/10 border-destructive/30 text-destructive'
                }`}>
                  <Icon name="zap" size={13} className={transRemaining > 1 ? 'text-primary' : 'text-destructive'} />
                  <span>Gói Miễn phí: Còn {Math.max(0, transRemaining)}/5 lượt dịch (1k context)</span>
                </div>
                <Link href="/settings">
                  <Button size="sm" className="h-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs gap-1 shadow-xs cursor-pointer">
                    <Icon name="sparkles" size={13} />
                    Nâng cấp VIP
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {errorBanner && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-200 shadow-xs">
            <div className="flex items-center gap-2">
              <Icon name="alertCircle" size={16} className="text-amber-500 shrink-0" />
              <span>{errorBanner}</span>
            </div>
            <Link href="/settings" className="shrink-0">
              <Button size="sm" className="h-7 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] cursor-pointer">
                Nâng cấp VIP ngay
              </Button>
            </Link>
          </div>
        )}

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
              disabled={isLoading || !sourceText.trim() || isOutOfQuota}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="text-text-tertiary hover:text-primary transition-colors p-1 cursor-pointer"
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
              {!isPremiumUser && (
                <div className="text-[11px] text-text-tertiary flex items-center justify-between pt-1 border-t border-border/50">
                  <span>Giới hạn gói Miễn phí: tối đa 1.000 tokens (~3.500 ký tự)</span>
                  <span className={sourceText.length > 3500 ? 'text-destructive font-bold' : ''}>
                    {sourceText.length}/3500 ký tự
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 bg-surface-subtle/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-primary uppercase">Bản dịch AI</span>
                {result?.translated_text && (
                  <button
                    type="button"
                    onClick={() => handleSpeak(result.translated_text)}
                    className="text-text-tertiary hover:text-primary transition-colors p-1 cursor-pointer"
                    title="Phát âm"
                  >
                    <Icon name="volume2" size={16} />
                  </button>
                )}
              </div>
              <p className="text-sm font-medium text-text-primary leading-relaxed min-h-[100px] whitespace-pre-wrap">
                {result ? (
                  result.translated_text
                ) : (
                  <span className="text-text-tertiary italic">Kết quả dịch sẽ xuất hiện tại đây...</span>
                )}
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
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-surface-subtle border border-border flex items-center justify-between"
                  >
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
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-surface-subtle border border-border text-xs text-text-secondary flex items-start gap-2"
                  >
                    <span className="text-success font-bold mt-0.5">💡</span>
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
