// Trang bảng phiên âm quốc tế IPA tương tác và luyện phát âm chuẩn.
'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import { SectionHeading } from '@/features/dashboard/components/section.heading'
import { Icon } from '@/components/icon.map'
import { useApp } from '@/contexts/app.context'
import type { BackendIpaSymbol } from '@/features/vocabulary/services/vocabulary.service'
import { useIpaSymbolsQuery } from '@/features/vocabulary/hooks/use.vocabulary.query'

export default function IpaAppPage() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const { showAction } = useApp()
  const [playingSymbol, setPlayingSymbol] = useState<string | null>(null)
  const { data: ipaSymbols = [], isLoading } = useIpaSymbolsQuery()

  const vowels = ipaSymbols.filter((s) => s.symbol_type === 'VOWEL')
  const diphthongs = ipaSymbols.filter((s) => s.symbol_type === 'DIPHTHONG')
  const consonants = ipaSymbols.filter((s) => s.symbol_type === 'CONSONANT')

  const handlePlaySound = (symbol: BackendIpaSymbol, index: number) => {
    setPlayingSymbol(symbol._id || `symbol-${index}`)
    if (symbol.audio_url) {
      const audio = new Audio(symbol.audio_url)
      audio.play().catch(() => {})
    }
    showAction(
      `${isVietnamese ? 'Phát âm' : 'Pronouncing'}: /${symbol.symbol}/ (${symbol.example_word})`
    )
    setTimeout(() => setPlayingSymbol(null), 400)
  }

  const handlePractice = () => {
    showAction(
      isVietnamese
        ? 'Đã mở chế độ Luyện tập ngữ âm IPA'
        : 'Opened IPA Practice Mode'
    )
  }

  const renderSymbolCard = (item: BackendIpaSymbol, index: number) => {
    const key = item._id || `symbol-${index}`
    const isPlaying = playingSymbol === key

    return (
      <Card
        key={key}
        className={`cursor-pointer transition-all hover:scale-105 hover:shadow-md ${
          isPlaying ? 'border-primary ring-2 ring-primary/20' : ''
        }`}
        onClick={() => handlePlaySound(item, index)}
      >
        <CardContent className="flex flex-col items-center p-3 text-center">
          <span className="font-mono text-[22px] font-bold text-primary">
            /{item.symbol}/
          </span>
          <span className="mt-1 text-[13px] font-semibold text-text-primary">
            {item.example_word}
          </span>
          <span className="text-[11px] font-mono text-text-tertiary">
            {item.example_word_ipa}
          </span>
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
                ? 'Nắm vững 44 âm trong tiếng Anh chuẩn quốc tế để phát âm chuẩn xác'
                : 'Master the 44 International Phonetic Alphabet sounds for accurate pronunciation'
            }
          />
          <Button
            className="self-start gap-2 bg-primary hover:bg-primary-hover"
            onClick={handlePractice}
          >
            <Icon name="mic" size={16} />
            {isVietnamese ? 'Luyện phát âm' : 'Practice Pronunciation'}
          </Button>
        </div>

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
    </>
  )
}
