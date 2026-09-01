/**
 * @file audio-utils.ts
 * @description Mã nguồn thành phần audio-utils.ts
 */

import type { VocabularyItem } from '@/types/vocabulary-learn'

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function speakWord(word: string, rate: number = 0.9) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    utterance.rate = rate
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
