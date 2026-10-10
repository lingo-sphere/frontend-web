// Tiện ích xử lý và chuẩn hóa URL media (Audio, Video, Image) cho Web.

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'

const EXTERNAL_TRUSTED_HOSTS = [
  'images.unsplash.com',
  'lh3.googleusercontent.com',
  'avatars.githubusercontent.com',
  'res.cloudinary.com',
]

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
