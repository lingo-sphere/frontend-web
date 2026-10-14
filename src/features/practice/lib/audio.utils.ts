/**
 * @file audio.utils.ts
 * @description Mã nguồn thành phần audio-utils.ts
 */

import type { VocabularyItem } from '@/features/vocabulary/types/vocabulary.learn'

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function speakWord(word: string, rate: number = 0.9, lang: string = 'en-US') {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.rate = rate

    try {
      const voices = window.speechSynthesis.getVoices()
      if (voices && voices.length > 0) {
        const langLower = lang.toLowerCase().replace('_', '-')
        // Tìm giọng khớp với lang yêu cầu (VD: en-GB hoặc en-US)
        const matchedVoice = voices.find((v) =>
          v.lang.toLowerCase().replace('_', '-').startsWith(langLower)
        )
        if (matchedVoice) {
          utterance.voice = matchedVoice
          utterance.lang = matchedVoice.lang
        } else {
          // Fallback: nếu thiết bị không có giọng en-GB, dùng bất kỳ giọng English nào có sẵn
          const anyEnVoice = voices.find((v) =>
            v.lang.toLowerCase().replace('_', '-').startsWith('en')
          )
          if (anyEnVoice) {
            utterance.voice = anyEnVoice
            utterance.lang = anyEnVoice.lang
          } else {
            utterance.lang = 'en-US'
          }
        }
      } else {
        // Nếu trình duyệt chưa tải xong voice list hoặc không có en-GB, dùng en-US làm chuẩn
        utterance.lang = lang.startsWith('en') ? 'en-US' : lang
      }
    } catch {
      utterance.lang = 'en-US'
    }

    window.speechSynthesis.speak(utterance)
  }
}

export function speakSentence(sentence: string, rate: number = 0.85) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(sentence)
    utterance.lang = 'en-US'
    utterance.rate = rate
    window.speechSynthesis.speak(utterance)
  }
}

export function getRandomDistractors(
  currentWord: VocabularyItem,
  allWords: VocabularyItem[],
  count: number = 3
): VocabularyItem[] {
  const otherWords = (allWords || []).filter((w) => w.id !== currentWord.id)
  const shuffled = shuffleArray(otherWords)
  return shuffled.slice(0, count)
}
