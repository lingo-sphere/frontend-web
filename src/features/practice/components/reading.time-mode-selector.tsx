// Component chọn chế độ thời gian cho Reading Practice
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Clock, Zap, Target, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TimerPresetMode } from '@/features/practice/types/reading'
import {
  getSavedReadingTimeModePreference,
  saveReadingTimeModePreference,
  getReadingTimePerQuestion,
  calculateTotalReadingTime,
  formatReadingTime,
} from '@/features/practice/lib/reading-time-mode'

interface ReadingTimeModeSelectorProps {
  questionCount: number
  onSelect: (mode: TimerPresetMode, totalSeconds: number) => void
  onCancel: () => void
}

const modeConfig: Record<TimerPresetMode, {
  icon: typeof Zap
  colors: {
    bg: string
    border: string
    selectedBg: string
    selectedText: string
    text: string
    iconBg: string
  }
  labelVi: string
  labelEn: string
  descriptionVi: string
  descriptionEn: string
}> = {
  QUICK: {
    icon: Zap,
    colors: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      selectedBg: 'bg-orange-500',
      selectedText: 'text-white',
      text: 'text-orange-700',
      iconBg: 'bg-orange-100',
    },
    labelVi: 'Nhanh',
    labelEn: 'Quick',
    descriptionVi: 'Luyện tốc độ',
    descriptionEn: 'Speed Training',
  },
  STANDARD: {
    icon: Target,
    colors: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      selectedBg: 'bg-blue-500',
      selectedText: 'text-white',
      text: 'text-blue-700',
      iconBg: 'bg-blue-100',
    },
    labelVi: 'Bình thường',
    labelEn: 'Standard',
    descriptionVi: 'Tiêu chuẩn thi',
    descriptionEn: 'Exam Standard',
  },
  INTENSIVE: {
    icon: Search,
    colors: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      selectedBg: 'bg-green-500',
      selectedText: 'text-white',
      text: 'text-green-700',
      iconBg: 'bg-green-100',
    },
    labelVi: 'Cẩn thận',
    labelEn: 'Intensive',
    descriptionVi: 'Tập trung chất lượng',
    descriptionEn: 'Quality Focus',
  },
}

const PRESET_MODES: TimerPresetMode[] = ['QUICK', 'STANDARD', 'INTENSIVE']

export function ReadingTimeModeSelector({
  questionCount,
  onSelect,
  onCancel,
}: ReadingTimeModeSelectorProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [selectedMode, setSelectedMode] = useState<TimerPresetMode>('STANDARD')

  // Load saved preference
  useEffect(() => {
    const saved = getSavedReadingTimeModePreference()
    setSelectedMode(saved)
  }, [])

  const handleStart = () => {
    saveReadingTimeModePreference(selectedMode)
    const totalSeconds = calculateTotalReadingTime(questionCount, selectedMode)
    onSelect(selectedMode, totalSeconds)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl border border-border animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">
              {isVietnamese ? 'Chọn chế độ thời gian' : 'Choose Time Mode'}
            </h3>
            <p className="text-xs text-text-tertiary">
              {isVietnamese
                ? `${questionCount} câu hỏi - Thời gian sẽ được tính tự động`
                : `${questionCount} questions - Time will be calculated automatically`}
            </p>
          </div>
        </div>

        {/* Mode Options */}
        <div className="grid grid-cols-3 gap-3">
          {PRESET_MODES.map((mode) => {
            const config = modeConfig[mode]
            const Icon = config.icon
            const colors = config.colors
            const isSelected = selectedMode === mode
            const secondsPerQuestion = getReadingTimePerQuestion(mode)
            const totalSeconds = calculateTotalReadingTime(questionCount, mode)

            return (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={cn(
                  'relative flex flex-col items-center rounded-xl border-2 p-4 transition-all',
                  isSelected
                    ? `${colors.selectedBg} ${colors.selectedText} border-transparent shadow-md`
                    : `${colors.bg} ${colors.border} hover:scale-[1.02] hover:shadow-sm`
                )}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-white shadow-sm">
                    <div className={cn('flex h-full w-full items-center justify-center rounded-full', colors.selectedBg)}>
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}

                <div className={cn('mb-2 rounded-full p-2', isSelected ? 'bg-white/20' : colors.iconBg)}>
                  <Icon className={cn('h-5 w-5', isSelected ? 'text-white' : colors.text)} />
                </div>

                <span className={cn('mb-1 text-[14px] font-semibold', isSelected ? 'text-white' : colors.text)}>
                  {isVietnamese ? config.labelVi : config.labelEn}
                </span>

                <span className={cn('text-[18px] font-bold', isSelected ? 'text-white' : 'text-text-primary')}>
                  {formatReadingTime(totalSeconds)}
                </span>

                <span className={cn('mt-1 text-[11px]', isSelected ? 'text-white/80' : 'text-text-tertiary')}>
                  {secondsPerQuestion}s/{isVietnamese ? 'câu' : 'q'}
                </span>
              </button>
            )
          })}
        </div>

        {/* Time breakdown info */}
        <div className="mt-4 rounded-lg bg-surface-elevated p-3 text-xs text-text-tertiary">
          <div className="flex items-center justify-between">
            <span>{isVietnamese ? 'Thời gian trung bình mỗi câu:' : 'Average time per question:'}</span>
            <span className="font-semibold text-text-primary">
              {getReadingTimePerQuestion(selectedMode)}s
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-between">
          <p className="text-[11px] text-text-tertiary">
            {isVietnamese
              ? 'Lần sau sẽ nhớ lựa chọn của bạn'
              : 'Your preference will be saved for next time'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="rounded-lg border border-border px-4 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-subtle"
            >
              {isVietnamese ? 'Hủy' : 'Cancel'}
            </button>
            <button
              onClick={handleStart}
              className="rounded-lg bg-primary px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              {isVietnamese ? 'Bắt đầu luyện tập' : 'Start Practice'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
