/**
 * @file media.utils.ts
 * @description Tiện ích xử lý và chuẩn hóa URL media (Audio, Video, Image) cho Web
 */

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'

// R2 Public URL cho audio files - Next.js dùng NEXT_PUBLIC_
const R2_PUBLIC_URL =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_R2_PUBLIC_URL) ||
  (typeof window !== 'undefined' && (window as any).__ENV?.NEXT_PUBLIC_R2_PUBLIC_URL) ||
  ''

export interface MediaFileInfo {
  _id: string
  file_name: string
  content_type: string
  public_url?: string
  url?: string
  file_path?: string
  storage_key?: string
}

// Cache cho media URLs để tránh gọi API nhiều lần
const mediaUrlCache = new Map<string, string>()

/**
 * Resolve any audio URL - ghép R2 URL với audio path
 * Backend trả về: audio/ipa/vowels/i.mp3 hoặc media/word_audio/xxx.mp3
 * Cần ghép thành: https://pub-xxx.r2.dev/audio/ipa/vowels/i.mp3
 */
export function resolveAudioUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed) return ''

  // Nếu là full URL (bắt đầu bằng http)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // Nếu là public domain r2.dev bị 401, chuyển sang stream endpoint qua API Gateway
    if (trimmed.includes('.r2.dev/')) {
      const pathAfterR2 = trimmed.split('.r2.dev/')[1]
      if (pathAfterR2) {
        return `${getMediaBaseUrl()}/media/stream/${pathAfterR2}`
      }
    }
    return trimmed
  }

  // Nếu là relative path, sử dụng stream endpoint qua API Gateway để không bị 401
  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('audio/') ||
    trimmed.startsWith('media/') ||
    trimmed.startsWith('vocabulary/') ||
    trimmed.startsWith('ipa/')
  ) {
    const cleanPath = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed
    return `${getMediaBaseUrl()}/media/stream/${cleanPath}`
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

/**
 * Resolve image URL - ghép R2 URL với image path
 */
export function resolveImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed) return ''

  // Nếu đã là full URL (bắt đầu bằng http)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  // Nếu là relative path, ghép với R2 URL
  if (trimmed.startsWith('/') || trimmed.startsWith('images/') || trimmed.startsWith('media/') || trimmed.startsWith('practice/')) {
    const cleanPath = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed
    return `${R2_PUBLIC_URL}/${cleanPath}`
  }

  // ObjectId sẽ được resolve bằng resolveMediaUrlAsync
  return trimmed
}

/**
 * Resolve media ObjectId thành URL đầy đủ (async)
 * Cần gọi API để lấy file_path/storage_key, rồi dùng stream endpoint
 */
export async function resolveMediaUrlAsync(mediaId: string): Promise<string> {
  if (!mediaId) return ''

  let cleanId = mediaId.trim()
  if (cleanId.startsWith('/api/media/')) cleanId = cleanId.replace('/api/media/', '')
  else if (cleanId.startsWith('/media/')) cleanId = cleanId.replace('/media/', '')
  else if (cleanId.startsWith('api/media/')) cleanId = cleanId.replace('api/media/', '')
  else if (cleanId.startsWith('media/')) cleanId = cleanId.replace('media/', '')

  // Check cache trước
  if (mediaUrlCache.has(mediaId)) {
    return mediaUrlCache.get(mediaId)!
  }
  if (mediaUrlCache.has(cleanId)) {
    return mediaUrlCache.get(cleanId)!
  }

  // Nếu đã là full URL, trả về luôn
  if (cleanId.startsWith('http://') || cleanId.startsWith('https://')) {
    return cleanId
  }

  // Nếu là ObjectId, gọi API lấy thông tin
  if (cleanId.match(/^[0-9a-fA-F]{24}$/)) {
    try {
      const response = await api.get<MediaFileInfo>(
        API_CONFIG.ENDPOINTS.MEDIA.GET_BY_ID(cleanId),
        undefined,
        undefined
      )

      if (response) {
        // Ưu tiên sử dụng file_path/storage_key để tạo stream URL
        const storageKey = response.storage_key || response.file_path?.replace(/^\//, '') || ''

        if (storageKey) {
          // Sử dụng stream endpoint
          const baseUrl = getMediaBaseUrl()
          const streamUrl = `${baseUrl}/media/stream/${storageKey}`

          // Cache kết quả
          mediaUrlCache.set(mediaId, streamUrl)
          mediaUrlCache.set(cleanId, streamUrl)
          return streamUrl
        }
      }

      return ''
    } catch (error) {
      console.error('[resolveMediaUrlAsync] Error:', error)
      return ''
    }
  }

  return resolveAudioUrl(cleanId)
}

/**
 * Lấy base URL cho media service
 */
function getMediaBaseUrl(): string {
  // Trong production, đây là API Gateway URL
  // Trong dev, có thể là localhost:port
  const gatewayUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
  return gatewayUrl
}

/**
 * Resolve nhiều media IDs cùng lúc
 */
export async function resolveMediaUrlsAsync(mediaIds: string[]): Promise<Map<string, string>> {
  const result = new Map<string, string>()

  await Promise.all(
    mediaIds.map(async (id) => {
      const url = await resolveMediaUrlAsync(id)
      result.set(id, url)
    })
  )

  return result
}

/**
 * Clear media URL cache
 */
export function clearMediaCache(): void {
  mediaUrlCache.clear()
}
