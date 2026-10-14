/**
 * @file listening.session.time-preset-selector.tsx
 * @description Component chọn thời gian cho Listening Session
 */

'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Clock, Zap, Target, BookOpen } from 'lucide-react'
import { Button } from '@/components/button'
import {
  TimePreset,
  TIME_PRESET_CONFIG,
} from '../types/listening-session'

interface TimePresetSelectorProps {
  onSelect: (preset: TimePreset) => void
  onCustomTime?: (seconds: number) => void
  defaultPreset?: TimePreset
  topicName?: string
}

export function TimePresetSelector({
  onSelect,
  defaultPreset = TimePreset.STANDARD,
  topicName,
}: TimePresetSelectorProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [selectedPreset, setSelectedPreset] = useState<TimePreset>(defaultPreset)

  const handleSelect = (preset: TimePreset) => {
    setSelectedPreset(preset)
    onSelect(preset)
  }

  const presets = [
    {
      key: TimePreset.QUICK,
      icon: Zap,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
    },
    {
      key: TimePreset.STANDARD,
      icon: Target,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
    },
    {
      key: TimePreset.INTENSIVE,
      icon: BookOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-text-secondary" />
        <span className="text-sm font-medium text-text-secondary">
          {isVietnamese ? 'Chọn thời gian' : 'Select Time'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {presets.map(({ key, icon: Icon, color, bgColor, borderColor }) => {
          const config = TIME_PRESET_CONFIG[key]
          const isSelected = selectedPreset === key

          return (
            <button
              key={key}
              type="button"
              onClick={() => handleSelect(key)}
              className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? `${borderColor} ${bgColor}`
                  : 'border-border hover:border-primary/30 hover:bg-surface-subtle'
              }`}
            >
              {isSelected && (
                <div className={`absolute top-2 right-2 w-5 h-5 rounded-full ${bgColor} ${color} flex items-center justify-center`}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              <div className={`w-10 h-10 rounded-xl ${bgColor} ${color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>

              <h3 className={`font-bold text-sm mb-1 ${isSelected ? color : 'text-text-primary'}`}>
                {isVietnamese ? config.label : config.label_en}
              </h3>

              <p className="text-xs text-text-secondary leading-relaxed">
                {isVietnamese ? config.description : config.description_en}
              </p>

              <div className={`mt-2 text-xs font-bold ${color}`}>
                {Math.floor(config.seconds / 60)}:{(config.seconds % 60).toString().padStart(2, '0')}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
