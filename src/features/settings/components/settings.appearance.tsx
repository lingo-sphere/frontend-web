/**
 * @file settings.appearance.tsx
 * @description Component tab cài đặt giao diện hiển thị (Dark/Light/System) và ngôn ngữ ứng dụng
 */

'use client'

import {
  Sun,
  Moon,
  Laptop,
  Globe,
  Check,
} from 'lucide-react'
import { Card, CardContent } from '@/components/card'
import type { UserPreferences } from '@/features/user/types/user'

interface SettingsAppearanceTabProps {
  preferences: UserPreferences
  onSelectTheme: (theme: 'light' | 'dark' | 'system') => void
  onSelectLanguage: (lang: 'vi' | 'en') => void
  currentLanguage: string
  isVi: boolean
}

export function SettingsAppearanceTab({
  preferences,
  onSelectTheme,
  onSelectLanguage,
  currentLanguage,
  isVi,
}: SettingsAppearanceTabProps) {
  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-border bg-surface shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-border bg-surface-subtle/30">
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Sun size={18} className="text-amber-500" />
            <span>{isVi ? 'Giao diện hiển thị (Chế độ Sáng / Tối)' : 'Theme Mode'}</span>
          </h3>
          <p className="text-xs text-text-tertiary mt-0.5">
            {isVi ? 'Chọn giao diện phù hợp với thị giác và điều kiện ánh sáng của bạn' : 'Select your display theme'}
          </p>
        </div>

        <CardContent className="p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                id: 'light' as const,
                title: isVi ? 'Giao diện Sáng' : 'Light Mode',
                desc: isVi ? 'Sáng sủa, rõ ràng ban ngày' : 'Clean daytime contrast',
                icon: Sun,
              },
              {
                id: 'dark' as const,
                title: isVi ? 'Giao diện Tối' : 'Dark Mode',
                desc: isVi ? 'Dịu mắt, tiết kiệm pin ban đêm' : 'Relaxing dark tones',
                icon: Moon,
              },
              {
                id: 'system' as const,
                title: isVi ? 'Theo hệ thống' : 'System Sync',
                desc: isVi ? 'Tự động đồng bộ theo thiết bị' : 'Sync with OS settings',
                icon: Laptop,
              },
            ].map((item) => {
              const isSelected = preferences.theme === item.id
              const IconComponent = item.icon
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectTheme(item.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center group ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/20'
                      : 'border-border bg-surface hover:bg-surface-subtle'
                  }`}
                >
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                      isSelected
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-surface-subtle text-text-secondary group-hover:text-primary'
                    }`}
                  >
                    <IconComponent size={24} />
                  </div>
                  <div className="text-sm font-bold text-text-primary">{item.title}</div>
                  <p className="text-xs text-text-tertiary mt-1">{item.desc}</p>
                  {isSelected && (
                    <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                      <Check size={13} />
                      {isVi ? 'Đang chọn' : 'Selected'}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border bg-surface shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-border bg-surface-subtle/30">
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Globe size={18} className="text-primary" />
            <span>{isVi ? 'Ngôn ngữ giao diện' : 'System Language'}</span>
          </h3>
        </div>

        <CardContent className="p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            {[
              { code: 'vi' as const, name: 'Tiếng Việt', native: 'Tiếng Việt (Việt Nam)', flag: '🇻🇳' },
              { code: 'en' as const, name: 'English', native: 'English (United States)', flag: '🇬🇧' },
            ].map((lang) => {
              const isSelected = currentLanguage === lang.code
              return (
                <div
                  key={lang.code}
                  onClick={() => onSelectLanguage(lang.code)}
                  className={`p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/20'
                      : 'border-border bg-surface hover:bg-surface-subtle'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <div>
                      <div className="text-sm font-bold text-text-primary">{lang.name}</div>
                      <div className="text-xs text-text-tertiary">{lang.native}</div>
                    </div>
                  </div>
                  {isSelected && <Check size={18} className="text-primary" />}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
