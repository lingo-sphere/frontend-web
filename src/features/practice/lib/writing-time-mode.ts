// Utility quản lý preference thời gian luyện viết (localStorage)
import type { TimeMode, ExerciseType, TimeModeConfig } from '@/features/practice/types/writing'
import { WRITING_TIME_CONFIGS, TIME_MODE_OPTIONS } from '@/features/practice/types/writing'

const STORAGE_KEY = 'lingosphere_writing_time_mode'

export interface TimeModePreference {
  mode: TimeMode
  exerciseType: ExerciseType
  updatedAt: string
}

/**
 * Lấy preference đã lưu từ localStorage
 */
export function getSavedTimeModePreference(exerciseType: ExerciseType): TimeModePreference | null {
  if (typeof window === 'undefined') return null

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return null

    const preference: TimeModePreference = JSON.parse(saved)

    // Nếu preference cùng exercise type thì trả về
    if (preference.exerciseType === exerciseType) {
      return preference
    }

    return null
  } catch {
    return null
  }
}

/**
 * Lưu preference vào localStorage
 */
export function saveTimeModePreference(mode: TimeMode, exerciseType: ExerciseType): void {
  if (typeof window === 'undefined') return

  try {
    const preference: TimeModePreference = {
      mode,
      exerciseType,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preference))
  } catch {
    console.warn('[WritingTimeMode] Failed to save preference')
  }
}

/**
 * Lấy thời gian (seconds) cho exercise type và mode
 */
export function getTimeSeconds(exerciseType: ExerciseType, mode: TimeMode): number {
  const config = WRITING_TIME_CONFIGS[exerciseType]
  if (!config) return 10 * 60 // Default 10 phút

  return config[mode]
}

/**
 * Format seconds thành MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Get time mode options với seconds được fill theo exercise type
 */
export function getTimeModeOptions(exerciseType: ExerciseType): TimeModeConfig[] {
  const config = WRITING_TIME_CONFIGS[exerciseType]

  return TIME_MODE_OPTIONS.map((option) => ({
    ...option,
    seconds: config ? config[option.mode] : 10 * 60,
  }))
}

/**
 * Tính % progress của thời gian
 */
export function getTimeProgress(elapsed: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(100, (elapsed / total) * 100)
}

/**
 * Xác định trạng thái thời gian
 */
export function getTimeStatus(remaining: number, total: number): 'normal' | 'warning' | 'urgent' {
  const percentage = (remaining / total) * 100

  if (remaining <= 0) return 'urgent'
  if (percentage <= 25) return 'urgent'  // <= 25% còn lại
  if (percentage <= 50) return 'warning'  // <= 50% còn lại
  return 'normal'
}

/**
 * Số giây warning trước khi chuyển urgent
 */
export const URGENT_THRESHOLD_SECONDS = 30
