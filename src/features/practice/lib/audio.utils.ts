/**
 * @file audio.utils.ts
 * @description Tiện ích phát âm thanh và Web Speech API
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

// Giữ tham chiếu utterance để tránh bị Chrome Garbage Collector thu hồi trước khi kịp nói
let activeUtterance: SpeechSynthesisUtterance | null = null

// Khởi động sớm danh sách giọng đọc của trình duyệt ngay khi load module
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.getVoices()
  if ('onvoiceschanged' in window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices()
    }
  }
}

export function speakWord(word: string, rate: number = 0.9, lang: string = 'en-US') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  if (!word || !word.trim()) return

  const synth = window.speechSynthesis

  // Khắc phục lỗi Chrome: Đảm bảo audio context không bị đóng băng/paused
  if (synth.paused) {
    synth.resume()
  }

  // Nếu đang nói hoặc đang chờ thì hủy, nhưng nếu đã rảnh thì không gọi cancel() để tránh race condition
  if (synth.speaking || synth.pending) {
    synth.cancel()
  }

  const doSpeak = () => {
    if (synth.paused) {
      synth.resume()
    }

    const utterance = new SpeechSynthesisUtterance(word.trim())
    utterance.rate = rate
    activeUtterance = utterance

    try {
      const voices = synth.getVoices()
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
          // Fallback: nếu thiết bị không có giọng chỉ định, dùng bất kỳ giọng English nào có sẵn
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
        utterance.lang = lang.startsWith('en') ? 'en-US' : lang
      }
    } catch {
      utterance.lang = 'en-US'
    }

    utterance.onend = () => {
      activeUtterance = null
    }
    utterance.onerror = () => {
      activeUtterance = null
    }

    synth.speak(utterance)
  }

  // Trì hoãn 15ms để Chrome hoàn tất luồng cancel trước khi nhận lệnh speak mới
  setTimeout(doSpeak, 15)
}

export function speakSentence(sentence: string, rate: number = 0.85) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  if (!sentence || !sentence.trim()) return

  const synth = window.speechSynthesis
  if (synth.paused) {
    synth.resume()
  }
  if (synth.speaking || synth.pending) {
    synth.cancel()
  }

  const doSpeak = () => {
    if (synth.paused) {
      synth.resume()
    }
    const utterance = new SpeechSynthesisUtterance(sentence.trim())
    utterance.lang = 'en-US'
    utterance.rate = rate
    activeUtterance = utterance

    utterance.onend = () => {
      activeUtterance = null
    }
    utterance.onerror = () => {
      activeUtterance = null
    }

    synth.speak(utterance)
  }

  setTimeout(doSpeak, 15)
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
