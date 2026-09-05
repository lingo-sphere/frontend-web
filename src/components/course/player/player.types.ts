export const PLAYBACK_SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]

export const QUALITIES = [
  { id: 'auto', label: 'Tự động (Auto)', badge: 'Thích ứng' },
  { id: '1080p', label: '1080p (Full HD)', badge: 'HD' },
  { id: '720p', label: '720p (HD)', badge: 'HD' },
  { id: '360p', label: '360p (Tiết kiệm)' },
]

export function detectNetworkQuality(): '1080p' | '720p' | '360p' {
  if (typeof window === 'undefined') return '1080p'
  const nav = navigator as unknown as {
    connection?: {
      effectiveType?: 'slow-2g' | '2g' | '3g' | '4g'
      downlink?: number
      saveData?: boolean
    }
  }

  const conn = nav.connection
  if (!conn) return '1080p'
  if (conn.saveData) return '360p'
  if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') return '360p'
  if (conn.effectiveType === '3g') return conn.downlink && conn.downlink < 0.4 ? '360p' : '720p'
  return '1080p'
}

export function isDirectVideoUrl(url?: string): boolean {
  if (!url || !url.trim()) return false
  const clean = url.toLowerCase().trim()
  if (
    clean.endsWith('.jpg') ||
    clean.endsWith('.jpeg') ||
    clean.endsWith('.png') ||
    clean.endsWith('.webp') ||
    clean.endsWith('.svg') ||
    clean.endsWith('.gif') ||
    clean.includes('/course-thumbnails/')
  ) {
    return false
  }
  return true
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00'
  const totalSec = Math.floor(seconds)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)

  if (h > 0) {
    return `${h}:${pad(m)}:${pad(s)}`
  }
  return `${m}:${pad(s)}`
}
