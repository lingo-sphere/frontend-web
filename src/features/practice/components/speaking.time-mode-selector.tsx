// Component chọn chế độ thời gian trước khi bắt đầu luyện nói Speaking (Modal đồng bộ Writing & Reading)
'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Clock, Zap, Target, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SpeakingExercise, DifficultyLevel } from '@/features/practice/types/speaking'
import {
  resolveSpeakingPolicy,
  getSavedSpeakingTimeModePreference,
  saveSpeakingTimeModePreference,
} from '@/features/practice/lib/speaking-policy'

interface SpeakingTimeModeSelectorProps {
  exercise: SpeakingExercise
  exerciseTitle?: string
  isStarting?: boolean
  error?: string
  onSelect: (mode: DifficultyLevel) => void
  onCancel: () => void
}

const modeIcons = {
  HARD: Zap,
  MEDIUM: Target,
  EASY: Trophy,
}

const modeColors = {
  HARD: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    selectedBg: 'bg-orange-500',
    selectedText: 'text-white',
    text: 'text-orange-700',
    iconBg: 'bg-orange-100',
  },
  MEDIUM: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    selectedBg: 'bg-blue-500',
    selectedText: 'text-white',
    text: 'text-blue-700',
    iconBg: 'bg-blue-100',
  },
  EASY: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    selectedBg: 'bg-green-500',
    selectedText: 'text-white',
    text: 'text-green-700',
    iconBg: 'bg-green-100',
  },
}

const MODES: DifficultyLevel[] = ['HARD', 'MEDIUM', 'EASY']

export function SpeakingTimeModeSelector({
  exercise,
  exerciseTitle,
  isStarting = false,
  error,
  onSelect,
  onCancel,
}: SpeakingTimeModeSelectorProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language.toLowerCase().startsWith('vi')
  const [selectedMode, setSelectedMode] = useState<DifficultyLevel>(getSavedSpeakingTimeModePreference)

  // Lắng nghe phím Escape để đóng modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isStarting) {
        onCancel()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isStarting, onCancel])

  const handleStart = () => {
    saveSpeakingTimeModePreference(selectedMode)
    onSelect(selectedMode)
  }

  const currentPolicy = resolveSpeakingPolicy(exercise, selectedMode)

  const modeDescriptions: Record<DifficultyLevel, { labelVi: string; labelEn: string; descVi: string; descEn: string }> = {
    HARD: {
      labelVi: 'Phản xạ',
      labelEn: 'Reflex',
      descVi: 'Khó · Phản xạ nhanh',
      descEn: 'Hard · Quick reaction',
    },
    MEDIUM: {
      labelVi: 'Tiêu chuẩn',
      labelEn: 'Standard',
      descVi: 'Chuẩn · Phòng thi',
      descEn: 'Standard · Exam pace',
    },
    EASY: {
      labelVi: 'Thư thả',
      labelEn: 'Relaxed',
      descVi: 'Dễ · Thoải mái luyện',
      descEn: 'Easy · Practice at ease',
    },
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl border border-border animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">
              {isVietnamese ? 'Chọn chế độ luyện nói' : 'Choose Speaking Mode'}
            </h3>
            <p className="text-xs text-text-tertiary">
              {exerciseTitle ||
                (isVietnamese
                  ? 'Thời gian chuẩn bị và trả lời sẽ tính tự động'
                  : 'Prep and response time are set automatically')}
            </p>
          </div>
        </div>

        {/* Mode Options */}
        <div className="grid grid-cols-3 gap-3">
          {MODES.map((mode) => {
            const Icon = modeIcons[mode]
            const colors = modeColors[mode]
            const isSelected = selectedMode === mode
            const policy = resolveSpeakingPolicy(exercise, mode)
            const desc = modeDescriptions[mode]

            return (
              <button
                key={mode}
                type="button"
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
                    <div
                      className={cn(
                        'flex h-full w-full items-center justify-center rounded-full',
                        colors.selectedBg
                      )}
                    >
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                )}

                <div
                  className={cn(
                    'mb-2 rounded-full p-2',
                    isSelected ? 'bg-white/20' : colors.iconBg
                  )}
                >
                  <Icon className={cn('h-5 w-5', isSelected ? 'text-white' : colors.text)} />
                </div>

                <span
                  className={cn(
                    'mb-1 text-[14px] font-semibold',
                    isSelected ? 'text-white' : colors.text
                  )}
                >
                  {isVietnamese ? desc.labelVi : desc.labelEn}
                </span>

                <span
                  className={cn(
                    'text-[15px] font-bold tracking-tight',
                    isSelected ? 'text-white' : 'text-text-primary'
                  )}
                >
                  {policy.preparation_time_seconds}s / {policy.response_time_seconds}s
                </span>

                <span
                  className={cn(
                    'mt-1 text-[11px]',
                    isSelected ? 'text-white/80' : 'text-text-tertiary'
                  )}
                >
                  {isVietnamese ? desc.descVi : desc.descEn}
                </span>
              </button>
            )
          })}
        </div>

        {/* Time breakdown info */}
        <div className="mt-4 rounded-lg bg-surface-elevated p-3 text-xs text-text-tertiary space-y-1.5">
          <div className="flex items-center justify-between">
            <span>{isVietnamese ? 'Thời gian chuẩn bị:' : 'Preparation time:'}</span>
            <span className="font-semibold text-text-primary">
              {currentPolicy.preparation_time_seconds}s
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>{isVietnamese ? 'Thời gian trả lời tối đa:' : 'Max speaking time:'}</span>
            <span className="font-semibold text-text-primary">
              {currentPolicy.response_time_seconds}s
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-border/50 pt-1">
            <span>{isVietnamese ? 'Số lần thu âm tối đa:' : 'Max retakes:'}</span>
            <span className="font-semibold text-text-primary">
              {currentPolicy.max_record_attempts} {isVietnamese ? 'lần' : 'takes'}
            </span>
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="mt-5 flex items-center justify-between">
          <p className="text-[11px] text-text-tertiary">
            {isVietnamese
              ? 'Lần sau sẽ nhớ lựa chọn của bạn'
              : 'Your preference will be saved for next time'}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-border px-4 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-subtle"
            >
              {isVietnamese ? 'Hủy' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleStart}
              disabled={isStarting}
              className="rounded-lg bg-primary px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              {isStarting
                ? isVietnamese
                  ? 'Đang mở phiên…'
                  : 'Starting…'
                : isVietnamese
                ? 'Bắt đầu nói'
                : 'Start Speaking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
