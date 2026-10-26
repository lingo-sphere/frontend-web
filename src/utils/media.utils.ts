// Tiện ích xử lý và chuẩn hóa URL media (Audio, Video, Image) cho Web.

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'

const EXTERNAL_TRUSTED_HOSTS = [
  'images.unsplash.com',
  'lh3.googleusercontent.com',
  'avatars.githubusercontent.com',
  'res.cloudinary.com',
]

export const IMAGE_FALLBACK_PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" viewBox="0 0 160 120" fill="none"><rect width="160" height="120" fill="%23f1f5f9" rx="8"/><path d="M70 52a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM50 78h60l-18-24-14 18-8-10-20 16Z" fill="%2394a3b8"/><text x="80" y="98" fill="%2394a3b8" font-size="10" font-family="sans-serif" text-anchor="middle">Ảnh không khả dụng</text></svg>'

export interface MediaFileInfo {
  _id: string
  file_name: string
  content_type: string
  public_url?: string
  url?: string
  file_path?: string
  storage_key?: string
}

const mediaUrlCache = new Map<string, string>()

export function isExternalStorageUrl(urlOrPath?: string | null): boolean {
  if (!urlOrPath || typeof urlOrPath !== 'string') return false
  const trimmed = urlOrPath.trim()
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return true
  }
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false

  try {
    const parsed = new URL(trimmed)
    const host = parsed.hostname.toLowerCase()
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
      return false
    }
    return EXTERNAL_TRUSTED_HOSTS.some((trusted) => host.includes(trusted))
  } catch {
    return false
  }
}

export function normalizeToRelativePath(urlOrPath?: string | null): string {
  if (!urlOrPath || typeof urlOrPath !== 'string') return ''
  const trimmed = urlOrPath.trim()
  if (!trimmed) return ''

  if (isExternalStorageUrl(trimmed)) {
    return trimmed
  }

  let raw = trimmed
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed)
      raw = parsed.pathname
    } catch {
      raw = trimmed
    }
  }

  try {
    raw = decodeURIComponent(raw)
  } catch {
    raw = raw
  }

  let cleaned = raw.replace(/^\/+/, '')
  cleaned = cleaned.replace(/^(api\/)?media\/stream\//i, '')
  cleaned = cleaned.replace(/^lingosphere-media\//i, '')
  cleaned = cleaned.replace(/^\/+/, '')

  return cleaned
}

export function resolveMediaUrl(urlOrPath?: string | null): string {
  if (!urlOrPath || typeof urlOrPath !== 'string') return ''
  const trimmed = urlOrPath.trim()
  if (!trimmed) return ''

  if (isExternalStorageUrl(trimmed)) {
    return trimmed
  }

  const cleanKey = normalizeToRelativePath(trimmed)
  if (!cleanKey) return ''

  const base = (API_CONFIG.BASE_URL ?? '').replace(/\/+$/, '')
  return `${base}/media/stream/${cleanKey}`
}

export function resolveAudioUrl(url?: string | null): string {
  return resolveMediaUrl(url)
}

export function resolveIpaAudioUrl(url?: string | null): string {
  return resolveMediaUrl(url)
}

export function resolveImageUrl(url?: string | null): string {
  return resolveMediaUrl(url)
}

export function playAudio(url?: string | null): void {
  if (!url) return
  const resolvedUrl = resolveAudioUrl(url)
  if (!resolvedUrl) return

  const audio = new Audio(resolvedUrl)
  audio.play().catch(() => { })
}

export async function resolveMediaUrlAsync(mediaId: string): Promise<string> {
  if (!mediaId) return ''

  let cleanId = mediaId.trim()
  if (cleanId.startsWith('/api/media/')) cleanId = cleanId.replace('/api/media/', '')
  else if (cleanId.startsWith('/media/')) cleanId = cleanId.replace('/media/', '')
  else if (cleanId.startsWith('api/media/')) cleanId = cleanId.replace('api/media/', '')
  else if (cleanId.startsWith('media/')) cleanId = cleanId.replace('media/', '')

  if (mediaUrlCache.has(mediaId)) {
    return mediaUrlCache.get(mediaId)!
  }
  if (mediaUrlCache.has(cleanId)) {
    return mediaUrlCache.get(cleanId)!
  }

  if (cleanId.match(/^[0-9a-fA-F]{24}$/)) {
    try {
      const response = await api.get<MediaFileInfo>(
        API_CONFIG.ENDPOINTS.MEDIA.GET_BY_ID(cleanId),
        undefined,
        undefined
      )

      if (response) {
        const storageKey = response.storage_key || response.file_path?.replace(/^\//, '') || ''

        if (storageKey) {
          const streamUrl = resolveMediaUrl(storageKey)
          mediaUrlCache.set(mediaId, streamUrl)
          mediaUrlCache.set(cleanId, streamUrl)
          return streamUrl
        }
      }

      return ''
    } catch {
      return ''
    }
  }

  return resolveMediaUrl(cleanId)
}

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

export function clearMediaCache(): void {
  mediaUrlCache.clear()
}

/**
 * Lấy hoặc sinh audio TTS cho bài luyện tập (Part 1, 2, 3, 4, Dictation, Speaking).
 * - Lần đầu tiên phát: Backend sinh TTS qua Edge Neural & lưu lên Cloudflare R2 vĩnh viễn.
 * - Các lần sau đó: Lấy trực tiếp từ R2 (Cache hit tức thì).
 */
export async function getOrGeneratePracticeAudio(
  text: string,
  existingUrlOrMediaId?: string | null,
  category: 'listening' | 'speaking' = 'listening'
): Promise<string> {
  if (existingUrlOrMediaId && existingUrlOrMediaId.trim()) {
    const resolved = await resolveMediaUrlAsync(existingUrlOrMediaId)
    if (resolved) return resolved
  }

  if (!text || !text.trim()) return ''

  try {
    const res = await api.post<{ url: string; cached?: boolean }>(
      API_CONFIG.ENDPOINTS.MEDIA.PRACTICE_AUDIO_GENERATE,
      { text, category }
    )
    if (res?.url) {
      return resolveAudioUrl(res.url)
    }
  } catch (err) {
    console.warn('[getOrGeneratePracticeAudio] Failed to generate/fetch audio:', err)
  }

  return ''
}
