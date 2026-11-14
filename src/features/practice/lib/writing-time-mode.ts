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
 * Format seconds thành MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Get time mode options với seconds được tính:
 * - Mốc Trung bình (normal): lấy theo mốc hiển thị ở danh sách writing (estimatedMinutes, mặc định 10 phút)
 * - Mốc Nhanh (fast): luyện tốc độ, thời gian ngắn hơn
 * - Mốc Chậm (slow): tập trung chất lượng, thời gian dài hơn
 */
export function getTimeModeOptions(exerciseType: ExerciseType, estimatedMinutes?: number): TimeModeConfig[] {
  const baseMinutes = estimatedMinutes && estimatedMinutes > 0
    ? estimatedMinutes
    : (WRITING_TIME_CONFIGS[exerciseType]?.normal ? Math.round(WRITING_TIME_CONFIGS[exerciseType].normal / 60) : 10)

  // Tính mốc Nhanh và Chậm dựa trên mốc Trung bình
  let fastMinutes: number
  let slowMinutes: number

  if (baseMinutes <= 8) {
    fastMinutes = Math.max(3, baseMinutes - 3)
    slowMinutes = baseMinutes + 4
  } else if (baseMinutes <= 12) {
    // Với mốc chuẩn 10 phút (ở danh sách): Nhanh = 5 phút, Trung bình = 10 phút, Chậm = 15 phút
    fastMinutes = Math.max(5, baseMinutes - 5)
    slowMinutes = baseMinutes + 5
  } else if (baseMinutes <= 16) {
    fastMinutes = baseMinutes - 5
    slowMinutes = baseMinutes + 5
  } else {
    fastMinutes = Math.round(baseMinutes * 0.7)
    slowMinutes = Math.round(baseMinutes * 1.4)
  }

  const secondsMap: Record<TimeMode, number> = {
    fast: fastMinutes * 60,
    normal: baseMinutes * 60,
    slow: slowMinutes * 60,
  }

  return TIME_MODE_OPTIONS.map((option) => ({
    ...option,
    seconds: secondsMap[option.mode],
  }))
}

/**
 * Lấy thời gian (seconds) cho exercise type và mode
 */
export function getTimeSeconds(exerciseType: ExerciseType, mode: TimeMode, estimatedMinutes?: number): number {
  const options = getTimeModeOptions(exerciseType, estimatedMinutes)
  const found = options.find((o) => o.mode === mode)
  return found ? found.seconds : 10 * 60
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
