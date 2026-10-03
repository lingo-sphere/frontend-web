// Utility quản lý preference thời gian luyện đọc (localStorage)
import type { TimerPresetMode } from '@/features/practice/types/reading'

const STORAGE_KEY = 'lingosphere_reading_time_mode'

export interface ReadingTimeModePreference {
  mode: TimerPresetMode
  updatedAt: string
}

/**
 * Lấy preference đã lưu từ localStorage
 */
export function getSavedReadingTimeModePreference(): TimerPresetMode {
  if (typeof window === 'undefined') return 'STANDARD'

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return 'STANDARD'

    const preference: ReadingTimeModePreference = JSON.parse(saved)
    return preference.mode
  } catch {
    return 'STANDARD'
  }
}

/**
 * Lưu preference vào localStorage
 */
export function saveReadingTimeModePreference(mode: TimerPresetMode): void {
  if (typeof window === 'undefined') return

  try {
    const preference: ReadingTimeModePreference = {
      mode,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preference))
  } catch {
    console.warn('[ReadingTimeMode] Failed to save preference')
  }
}

/**
 * Tính thời gian theo preset (seconds per question)
 */
export function getReadingTimePerQuestion(mode: TimerPresetMode): number {
  switch (mode) {
    case 'QUICK': return 30
    case 'STANDARD': return 60
    case 'INTENSIVE': return 120
    default: return 60
  }
}

/**
 * Tính tổng thời gian cho N câu hỏi
 */
export function calculateTotalReadingTime(questionCount: number, mode: TimerPresetMode): number {
  return Math.max(1, questionCount) * getReadingTimePerQuestion(mode)
}

/**
 * Format seconds thành MM:SS
 */
export function formatReadingTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
