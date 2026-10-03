// Component chọn chế độ thời gian trước khi bắt đầu luyện viết
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Clock, Zap, Target, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ExerciseType, TimeMode, TimeModeConfig } from '@/features/practice/types/writing'
import { getTimeModeOptions, getSavedTimeModePreference, saveTimeModePreference, formatTime } from '@/features/practice/lib/writing-time-mode'

interface WritingTimeModeSelectorProps {
  exerciseType: ExerciseType
  onSelect: (mode: TimeMode, seconds: number) => void
  onCancel: () => void
}

const modeIcons = {
  fast: Zap,
  normal: Target,
  slow: Trophy,
}

const modeColors = {
  fast: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    selectedBg: 'bg-orange-500',
    selectedText: 'text-white',
    text: 'text-orange-700',
    iconBg: 'bg-orange-100',
  },
  normal: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    selectedBg: 'bg-blue-500',
    selectedText: 'text-white',
    text: 'text-blue-700',
    iconBg: 'bg-blue-100',
  },
  slow: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    selectedBg: 'bg-green-500',
    selectedText: 'text-white',
    text: 'text-green-700',
    iconBg: 'bg-green-100',
  },
}

export function WritingTimeModeSelector({
  exerciseType,
  onSelect,
  onCancel,
}: WritingTimeModeSelectorProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [selectedMode, setSelectedMode] = useState<TimeMode>('normal')
  const [options, setOptions] = useState<TimeModeConfig[]>([])

  // Load saved preference và options
  useEffect(() => {
    const opts = getTimeModeOptions(exerciseType)
    setOptions(opts)

    // Lấy preference đã lưu
    const saved = getSavedTimeModePreference(exerciseType)
    if (saved) {
      setSelectedMode(saved.mode)
    }
  }, [exerciseType])

  const handleSelect = (mode: TimeMode) => {
    setSelectedMode(mode)
  }

  const handleStart = () => {
    const option = options.find((o) => o.mode === selectedMode)
    if (option) {
      saveTimeModePreference(selectedMode, exerciseType)
      onSelect(selectedMode, option.seconds)
    }
  }

  return (
    <div className="mb-6 rounded-xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="text-[15px] font-semibold text-text-primary">
          {isVietnamese ? 'Chọn thời gian luyện tập' : 'Choose Practice Time'}
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {options.map((option) => {
          const Icon = modeIcons[option.mode]
          const colors = modeColors[option.mode]
          const isSelected = selectedMode === option.mode

          return (
            <button
              key={option.mode}
              onClick={() => handleSelect(option.mode)}
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
                {isVietnamese ? option.labelVi : option.label}
              </span>

              <span className={cn('text-[20px] font-bold', isSelected ? 'text-white' : 'text-text-primary')}>
                {formatTime(option.seconds)}
              </span>

              <span className={cn('mt-1 text-[11px]', isSelected ? 'text-white/80' : 'text-text-tertiary')}>
                {isVietnamese ? option.descriptionVi : option.description}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-[12px] text-text-tertiary">
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
            {isVietnamese ? 'Bắt đầu viết' : 'Start Writing'}
          </button>
        </div>
      </div>
    </div>
  )
}
