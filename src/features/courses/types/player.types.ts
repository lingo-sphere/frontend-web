// Định nghĩa kiểu dữ liệu và hàm tiện ích cho video player của khóa học
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]


export function isDirectVideoUrl(url?: string): boolean {
  if (!url || !url.trim()) return false
  const clean = url.toLowerCase().trim()
  if (
    clean.includes('youtube.com') ||
    clean.includes('youtu.be') ||
    clean.includes('vimeo.com') ||
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
