/**
 * @file media.utils.ts
 * @description Tiện ích xử lý và chuẩn hóa URL media (Audio, Video, Image) cho Web
 */

// R2 Public URL cho audio files - Next.js dùng NEXT_PUBLIC_
const R2_PUBLIC_URL =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_R2_PUBLIC_URL) ||
  (typeof window !== 'undefined' && (window as any).__ENV?.NEXT_PUBLIC_R2_PUBLIC_URL) ||
  ''

/**
 * Resolve any audio URL - ghép R2 URL với audio path
 * Backend trả về: audio/ipa/vowels/i.mp3 hoặc media/word_audio/xxx.mp3
 * Cần ghép thành: https://pub-xxx.r2.dev/audio/ipa/vowels/i.mp3
 */
export function resolveAudioUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed) return ''

  // Nếu đã là full URL (bắt đầu bằng http)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  // Nếu là relative path, ghép với R2 URL
  if (trimmed.startsWith('/') || trimmed.startsWith('audio/') || trimmed.startsWith('media/')) {
    const cleanPath = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed
    return `${R2_PUBLIC_URL}/${cleanPath}`
  }

  return trimmed
}

/**
 * Resolve IPA audio URL - ghép R2 URL với audio path
 * Backend trả về: audio/ipa/vowels/i.mp3
 * Cần ghép thành: https://pub-xxx.r2.dev/audio/ipa/vowels/i.mp3
 */
export function resolveIpaAudioUrl(url?: string | null): string {
  return resolveAudioUrl(url)
}

/**
 * Play audio từ URL (dùng chung cho IPA và Vocabulary)
 */
export function playAudio(url?: string | null): void {
  if (!url) return
  const resolvedUrl = resolveAudioUrl(url)
  if (!resolvedUrl) return

  console.log('[playAudio] Playing:', resolvedUrl)

  const audio = new Audio(resolvedUrl)
  audio.play().catch((err) => {
    console.error('[playAudio] Error:', err)
  })
}
