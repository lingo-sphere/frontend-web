'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import { SectionHeading } from '@/features/dashboard/components/section.heading'
import { Icon } from '@/components/icon.map'
import { useApp } from '@/contexts/app.context'
import { Volume2, AlertTriangle, Sparkles, Target, Info } from 'lucide-react'
import type { BackendIpaSymbol } from '@/features/vocabulary/services/vocabulary.service'
import { useIpaSymbolsQuery } from '@/features/vocabulary/hooks/use.vocabulary.query'
import { vocabularyService } from '@/features/vocabulary/services/vocabulary.service'
import { resolveAudioUrl } from '@/utils/media.utils'
import { speakWord } from '@/features/practice/lib/audio.utils'
import { useAuthStore } from '@/features/auth/store/auth.store'
import {
  pronunciationService,
  type PhonemeMasteryResponse,
} from '@/features/practice/services/pronunciation.service'
import { IpaPracticeModal } from '@/features/practice/components/ipa.practice.modal'
import { PhonemeDetailDrawer } from '@/features/practice/components/phoneme.detail.drawer'

function IpaPageContent() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const { showAction } = useApp()
  const { user } = useAuthStore()
  const userId = user?.user_id || (user as any)?.id || (user as any)?._id || 'guest'

  const [selectedAccent, setSelectedAccent] = useState<'us' | 'uk'>('us')
  const [playingKey, setPlayingKey] = useState<string | null>(null)
  const { data: ipaSymbols = [], isLoading } = useIpaSymbolsQuery()

  const [masteryData, setMasteryData] = useState<PhonemeMasteryResponse | null>(null)
  const [selectedPhonemeForDrawer, setSelectedPhonemeForDrawer] = useState<BackendIpaSymbol | null>(null)
  const [practiceModalOpen, setPracticeModalOpen] = useState(false)
  const [practicePhoneme, setPracticePhoneme] = useState<string | undefined>(undefined)
  const [practiceMode, setPracticeMode] = useState<'TARGETED' | 'FREE_PRACTICE'>('FREE_PRACTICE')

  const searchParams = useSearchParams()

  // Tự động mở modal khi có query ?phoneme=...&action=practice
  useEffect(() => {
    const phonemeParam = searchParams.get('phoneme')
    const actionParam = searchParams.get('action')
    if (phonemeParam && actionParam === 'practice') {
      const cleanP = phonemeParam.trim()
      const formattedP = cleanP.startsWith('/') ? cleanP : `/${cleanP}/`
      setPracticePhoneme(formattedP)
      setPracticeMode('TARGETED')
      setPracticeModalOpen(true)
    }
  }, [searchParams])

  const fetchMastery = () => {
    if (!userId || userId === 'guest') return
    pronunciationService
      .getPhonemeMastery(userId)
      .then((res) => {
        setMasteryData(res)
      })
      .catch((err) => {
        console.warn('Could not fetch phoneme mastery:', err)
      })
  }

  useEffect(() => {
    fetchMastery()
  }, [userId])

  const vowels = ipaSymbols.filter((s) => s.symbol_type === 'VOWEL')
  const diphthongs = ipaSymbols.filter((s) => s.symbol_type === 'DIPHTHONG')
  const consonants = ipaSymbols.filter((s) => s.symbol_type === 'CONSONANT')

  // Phát âm ký hiệu IPA (Âm thanh phát âm IPA chuẩn từ UCLA & Neural TTS)
  const handlePlayIpaSound = (symbol: BackendIpaSymbol) => {
    const symbolId = symbol.id || symbol._id || symbol.symbol
    const playId = `symbol-${symbolId}`
    setPlayingKey(playId)

    const rawUrl =
      selectedAccent === 'us'
        ? (symbol.audio_url_us || symbol.audio_url)
        : (symbol.audio_url_uk || symbol.audio_url)

    if (rawUrl) {
      const resolved = resolveAudioUrl(rawUrl)
      if (resolved) {
        const audio = new Audio(resolved)
        audio.onended = () => setPlayingKey(null)
        audio.onerror = () => setPlayingKey(null)
        audio.play().catch(() => {
          setPlayingKey(null)
        })
      } else {
        setPlayingKey(null)
      }
    } else {
      setPlayingKey(null)
    }

    showAction(
      `${isVietnamese ? 'Âm IPA' : 'IPA Sound'}: /${symbol.symbol}/`
    )
    setTimeout(() => {
      setPlayingKey((curr) => (curr === playId ? null : curr))
    }, 1200)
  }

  // Phát từ ví dụ của âm IPA (Cơ chế Hybrid: R2 -> Web Speech Fallback -> Auto-generate Edge TTS)
  const handlePlayExampleWord = (symbol: BackendIpaSymbol, e: React.MouseEvent) => {
    e.stopPropagation()
    const symbolId = symbol.id || symbol._id || symbol.symbol
    const playId = `example-${symbolId}`
    setPlayingKey(playId)

    const wordText = symbol.example_word || ''
    const rawAudioUrl =
      selectedAccent === 'us'
        ? (symbol.example_audio_url_us || symbol.example_audio_url)
        : (symbol.example_audio_url_uk || symbol.example_audio_url)

    const fallbackAndAutoGenerate = () => {
      // 1. Phát ngay bằng Web Speech API
      if (wordText) {
        speakWord(wordText, 0.9, selectedAccent === 'uk' ? 'en-GB' : 'en-US')
      }

      // 2. Tự động sinh file bù vào kho vocabulary bằng Edge TTS
      if (wordText) {
        const cefrLevel = symbol.cefr_min_level || 'A1'
        vocabularyService
          .autoGenerateAudio({
            word: wordText,
            accent: selectedAccent,
            cefr_level: cefrLevel,
          })
          .then((res) => {
            const targetUrl = selectedAccent === 'us' ? res.audio_url_us : res.audio_url_uk
            if (targetUrl) {
              setPlayingKey(playId)
              const genAudio = new Audio(resolveAudioUrl(targetUrl))
              genAudio.onended = () => setPlayingKey(null)
              genAudio.play().catch(() => {})
            }
          })
          .catch(() => {})
      }
    }

    if (rawAudioUrl) {
      const resolved = resolveAudioUrl(rawAudioUrl)
      if (resolved) {
        const audio = new Audio(resolved)
        let hasFailed = false
        audio.onended = () => setPlayingKey(null)
        audio.onerror = () => {
          if (!hasFailed) {
            hasFailed = true
            fallbackAndAutoGenerate()
          }
        }
        audio.play().catch(() => {
          if (!hasFailed) {
            hasFailed = true
            fallbackAndAutoGenerate()
          }
        })
      } else {
        fallbackAndAutoGenerate()
      }
    } else {
      fallbackAndAutoGenerate()
    }

    setTimeout(() => {
      setPlayingKey((curr) => (curr === playId ? null : curr))
    }, 1200)

    showAction(
      `${isVietnamese ? 'Ví dụ' : 'Example'}: "${wordText}" (${selectedAccent === 'us' ? 'en-US' : 'en-UK'})`
    )
  }

  const handlePractice = () => {
    setPracticePhoneme(undefined)
    setPracticeMode('FREE_PRACTICE')
    setPracticeModalOpen(true)
  }

  const renderSymbolCard = (item: BackendIpaSymbol) => {
    const symbolId = item.id || item._id || item.symbol
    const symbolKey = `symbol-${symbolId}`
    const exampleKey = `example-${symbolId}`
    const isPlayingSymbol = playingKey === symbolKey
    const isPlayingExample = playingKey === exampleKey

    // Lấy thông tin Mastery của âm vị
    const cleanSym = item.symbol.replace(/^\/+|\/+$/g, '')
    const skill =
      masteryData?.phoneme_skills?.[`/${cleanSym}/`] ||
      masteryData?.phoneme_skills?.[cleanSym] ||
      masteryData?.phoneme_skills?.[item.symbol]

    const masteryScore = skill?.mastery_score || 0
    const topSubstitution = skill?.top_substitution

    return (
      <Card
        key={symbolId}
        className={`relative overflow-hidden transition-all hover:scale-[1.03] hover:shadow-md ${
          isPlayingSymbol ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'
        }`}
      >
        <CardContent className="flex flex-col items-center p-3 text-center">
          {/* Vùng bấm nghe âm IPA */}
          <button
            type="button"
            onClick={() => handlePlayIpaSound(item)}
            className="group/ipa flex w-full flex-col items-center justify-center rounded-lg py-1 transition cursor-pointer hover:bg-surface-hover/70"
            title={isVietnamese ? `Nghe âm /${item.symbol}/` : `Listen to /${item.symbol}/`}
          >
            <span className={`font-mono text-[22px] font-bold transition transform group-hover/ipa:scale-110 ${
              isPlayingSymbol ? 'text-primary scale-110' : 'text-primary'
            }`}>
              /{item.symbol}/
            </span>
            <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-medium text-text-tertiary">
              <Volume2 size={11} className={isPlayingSymbol ? 'animate-pulse text-primary' : ''} />
              <span>âm IPA</span>
            </span>
          </button>

          {/* Đường ngăn cách nhẹ */}
          <div className="my-1.5 h-[1px] w-4/5 bg-border/60" />

          {/* Vùng bấm nghe từ ví dụ theo giọng en-US / en-UK */}
          <button
            type="button"
            onClick={(e) => handlePlayExampleWord(item, e)}
            className={`group/ex flex w-full flex-col items-center justify-center rounded-lg px-1 py-1 transition cursor-pointer ${
              isPlayingExample
                ? 'bg-primary/10 border border-primary/30'
                : 'hover:bg-surface-hover/80 border border-transparent'
            }`}
            title={isVietnamese ? `Phát âm từ ví dụ "${item.example_word}" (${selectedAccent === 'us' ? 'en-US' : 'en-UK'})` : `Play "${item.example_word}"`}
          >
            <span className="text-[13px] font-semibold text-text-primary transition group-hover/ex:text-primary">
              {item.example_word}
            </span>
            <span className="text-[11px] font-mono text-text-tertiary">
              {item.example_word_ipa}
            </span>
            <span className={`mt-1 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-semibold transition ${
              isPlayingExample
                ? 'bg-primary text-white'
                : 'bg-surface-subtle text-text-secondary border border-border/80'
            }`}>
              <Volume2 size={10} className={isPlayingExample ? 'animate-pulse' : ''} />
              <span>{selectedAccent === 'us' ? 'en-US' : 'en-UK'}</span>
            </span>
          </button>

          {/* Thanh Mastery & Lịch sử tiến độ */}
          <div className="mt-2.5 w-full border-t border-border/60 pt-2 flex flex-col items-center">
            <div className="flex w-full items-center justify-between text-[10px] font-bold">
              <span className={
                masteryScore >= 70
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : masteryScore >= 45
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-text-tertiary'
              }>
                {masteryScore > 0 ? `${masteryScore}%` : 'Chưa luyện'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setPracticePhoneme(item.symbol)
                    setPracticeMode('TARGETED')
                    setPracticeModalOpen(true)
                  }}
                  className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary hover:bg-primary hover:text-white transition cursor-pointer"
                  title={isVietnamese ? `Luyện tập riêng âm /${item.symbol}/` : `Practice /${item.symbol}/`}
                >
                  <Target size={10} />
                  <span>{isVietnamese ? 'Luyện' : 'Practice'}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedPhonemeForDrawer(item)
                  }}
                  className="text-text-tertiary hover:text-primary transition p-0.5 rounded cursor-pointer"
                  title={isVietnamese ? 'Xem chi tiết năng lực & lịch sử' : 'View skill details'}
                >
                  <Info size={12} />
                </button>
              </div>
            </div>
            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-border/60">
              <div
                className={`h-full transition-all duration-300 ${
                  masteryScore >= 85
                    ? 'bg-emerald-500'
                    : masteryScore >= 70
                      ? 'bg-blue-500'
                      : masteryScore >= 45
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                }`}
                style={{ width: `${masteryScore}%` }}
              />
            </div>
            {topSubstitution && (
              <span className="mt-1 text-[9px] font-semibold text-rose-500 truncate max-w-full">
                ⚠ {topSubstitution}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <SectionHeading
            eyebrow={t('practice.title')}
            title={
              isVietnamese
                ? 'Bảng phiên âm quốc tế IPA (44 âm)'
                : 'International Phonetic Alphabet (44 Sounds)'
            }
            description={
              isVietnamese
                ? 'Theo dõi mức độ làm chủ từng âm vị (Mastery) và khắc phục các lỗi phát âm từ bài Speaking'
                : 'Track individual phoneme mastery and resolve recurring pronunciation weaknesses'
            }
          />
          <div className="flex flex-wrap items-center gap-3">
            {/* Toggle chọn giọng en-US / en-UK */}
            <div className="flex items-center rounded-xl border border-border bg-surface-subtle p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  setSelectedAccent('us')
                  showAction(
                    isVietnamese
                      ? 'Đã chuyển sang giọng Anh - Mỹ (en-US)'
                      : 'Switched to American English (en-US)'
                  )
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  selectedAccent === 'us'
                    ? 'border-primary bg-primary text-white shadow-xs'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                }`}
                title="Chuẩn giọng Anh - Mỹ (en-US)"
              >
                <span>en-US</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedAccent('uk')
                  showAction(
                    isVietnamese
                      ? 'Đã chuyển sang giọng Anh - Anh (en-UK)'
                      : 'Switched to British English (en-UK)'
                  )
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  selectedAccent === 'uk'
                    ? 'border-primary bg-primary text-white shadow-xs'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                }`}
                title="Chuẩn giọng Anh - Anh (en-UK)"
              >
                <span>en-UK</span>
              </button>
            </div>

            <Button
              className="gap-2 bg-primary hover:bg-primary-hover shadow-xs"
              onClick={handlePractice}
            >
              <Sparkles size={16} />
              {isVietnamese ? 'Luyện tập tổng hợp (Random)' : 'Adaptive Practice'}
            </Button>
          </div>
        </div>

        {/* Banner Cảnh báo âm yếu từ Speaking */}
        {masteryData?.top_chronic_phonemes && masteryData.top_chronic_phonemes.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4 text-sm shadow-xs animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center gap-2 text-orange-900 dark:text-orange-200">
              <AlertTriangle size={18} className="text-orange-500 shrink-0" />
              <span className="font-bold">
                {isVietnamese ? 'Phát hiện lỗi lặp lại từ bài Speaking:' : 'Chronic Speaking Errors Detected:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {masteryData.top_chronic_phonemes.slice(0, 4).map((p) => (
                  <button
                    key={`${p.expected_phoneme}-${p.actual_phoneme}`}
                    type="button"
                    onClick={() => {
                      setPracticePhoneme(p.expected_phoneme)
                      setPracticeMode('TARGETED')
                      setPracticeModalOpen(true)
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2 py-0.5 font-mono text-xs font-bold text-text-primary hover:border-primary transition cursor-pointer"
                    title="Bấm để luyện cặp âm này"
                  >
                    <span>{p.expected_phoneme}</span>
                    <span className="text-text-tertiary">➔</span>
                    <span className="text-rose-500">{p.actual_phoneme}</span>
                  </button>
                ))}
              </div>
            </div>
            <Button
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white gap-1.5 text-xs shadow-xs"
              onClick={() => {
                setPracticePhoneme(masteryData.top_chronic_phonemes[0]?.expected_phoneme)
                setPracticeMode('TARGETED')
                setPracticeModalOpen(true)
              }}
            >
              <Target size={14} />
              {isVietnamese ? 'Khắc phục ngay' : 'Practice Weak Sounds'}
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="mt-12 flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            <section className="mt-8">
              <h3 className="mb-3 text-[16px] font-bold text-text-primary">
                {isVietnamese
                  ? '1. Nguyên âm đơn (Monophthongs)'
                  : '1. Monophthongs'}{' '}
                ({vowels.length})
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {vowels.map(renderSymbolCard)}
              </div>
            </section>

            <section className="mt-8">
              <h3 className="mb-3 text-[16px] font-bold text-text-primary">
                {isVietnamese
                  ? '2. Nguyên âm đôi (Diphthongs)'
                  : '2. Diphthongs'}{' '}
                ({diphthongs.length})
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {diphthongs.map(renderSymbolCard)}
              </div>
            </section>

            <section className="mt-8">
              <h3 className="mb-3 text-[16px] font-bold text-text-primary">
                {isVietnamese ? '3. Phụ âm (Consonants)' : '3. Consonants'} (
                {consonants.length})
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {consonants.map(renderSymbolCard)}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Interactive Practice Modal */}
      <IpaPracticeModal
        isOpen={practiceModalOpen}
        onClose={() => setPracticeModalOpen(false)}
        userId={userId}
        targetPhoneme={practicePhoneme}
        mode={practiceMode}
        onPracticeComplete={() => {
          fetchMastery()
        }}
      />

      {/* Phoneme Detail Drawer */}
      <PhonemeDetailDrawer
        isOpen={!!selectedPhonemeForDrawer}
        onClose={() => setSelectedPhonemeForDrawer(null)}
        symbol={selectedPhonemeForDrawer?.symbol || ''}
        exampleWord={selectedPhonemeForDrawer?.example_word}
        skillData={
          selectedPhonemeForDrawer
            ? masteryData?.phoneme_skills?.[`/${selectedPhonemeForDrawer.symbol.replace(/^\/+|\/+$/g, '')}/`] ||
              masteryData?.phoneme_skills?.[selectedPhonemeForDrawer.symbol]
            : undefined
        }
        onPlaySound={() => {
          if (selectedPhonemeForDrawer) {
            handlePlayIpaSound(selectedPhonemeForDrawer)
          }
        }}
        onStartTargetedPractice={(sym) => {
          setPracticePhoneme(sym)
          setPracticeMode('TARGETED')
          setPracticeModalOpen(true)
        }}
      />
    </>
  )
}

export default function IpaAppPage() {
  return (
    <Suspense fallback={null}>
      <IpaPageContent />
    </Suspense>
  )
}

