/**
 * @file settings.notifications.tsx
 * @description Thành phần Settings Notifications phục vụ phía người học (Web Client)
 */

'use client'

/**
 * @file SettingsNotificationsTab.tsx
 * @description Component tab cài đặt thông báo, kênh nhận tin và chế độ giờ yên tĩnh
 */

import {
  Bell,
  Smartphone,
  Mail,
  Clock,
  Check,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { UserPreferences } from '@/types/user'

interface SettingsNotificationsTabProps {
  preferences: UserPreferences
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>
  isVi: boolean
}

export function SettingsNotificationsTab({
  preferences,
  setPreferences,
  isVi,
}: SettingsNotificationsTabProps) {
  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-border bg-surface shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-border bg-surface-subtle/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                {isVi ? 'Cho phép nhận thông báo' : 'Allow System Notifications'}
              </h3>
              <p className="text-xs text-text-tertiary">
                {isVi ? 'Bật/tắt toàn bộ thông báo từ LingoSphere' : 'Master notification switch'}
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              setPreferences((prev) => ({
                ...prev,
                notifications: {
                  ...prev.notifications,
                  allEnabled: !prev.notifications.allEnabled,
                },
              }))
            }
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer ${
              preferences.notifications.allEnabled ? 'bg-primary' : 'bg-surface-subtle border border-border'
            }`}
          >
            <div
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                preferences.notifications.allEnabled ? 'translate-x-5 shadow-sm' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <CardContent className="p-5 sm:p-6 space-y-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-3">
              {isVi ? 'Kênh tiếp nhận thông báo' : 'Delivery Channels'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    notifications: { ...prev.notifications, push: !prev.notifications.push },
                  }))
                }
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  preferences.notifications.push ? 'border-primary/40 bg-primary/5' : 'border-border bg-surface'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Smartphone size={18} className="text-primary" />
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-text-primary">
                      {isVi ? 'Thông báo đẩy trình duyệt' : 'Browser Push Notifications'}
                    </div>
                    <div className="text-[11px] text-text-tertiary">
                      {isVi ? 'Hiển thị popup khi có bài học hoặc nhắc nhở' : 'Direct browser popups'}
                    </div>
                  </div>
                </div>
                <div
                  className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                    preferences.notifications.push ? 'bg-primary border-primary text-white' : 'border-border'
                  }`}
                >
                  {preferences.notifications.push && <Check size={11} />}
                </div>
              </div>

              <div
                onClick={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    notifications: { ...prev.notifications, email: !prev.notifications.email },
                  }))
                }
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  preferences.notifications.email ? 'border-primary/40 bg-primary/5' : 'border-border bg-surface'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-primary" />
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-text-primary">
                      {isVi ? 'Gửi qua Email cá nhân' : 'Email Notifications'}
                    </div>
                    <div className="text-[11px] text-text-tertiary">
                      {isVi ? 'Nhận tổng hợp kết quả học tập tuần' : 'Weekly summaries and receipts'}
                    </div>
                  </div>
                </div>
                <div
                  className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                    preferences.notifications.email ? 'bg-primary border-primary text-white' : 'border-border'
                  }`}
                >
                  {preferences.notifications.email && <Check size={11} />}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface-subtle/30">
              <div className="flex items-start gap-3">
                <Clock size={18} className="text-amber-500 mt-0.5" />
                <div>
                  <div className="text-xs sm:text-sm font-bold text-text-primary">
                    {isVi ? 'Chế độ giờ yên tĩnh (Không làm phiền ban đêm)' : 'Quiet Hours (Do Not Disturb)'}
                  </div>
                  <div className="text-xs text-text-tertiary mt-0.5">
                    {isVi
                      ? 'Hệ thống tự động tắt âm và tạm hoãn gửi thông báo từ 22:00 đến 08:00 sáng hôm sau.'
                      : 'Mutes and holds notifications between 22:00 and 08:00.'}
                  </div>
                </div>
              </div>
              <button
                onClick={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      quietHoursEnabled: !prev.notifications.quietHoursEnabled,
                    },
                  }))
                }
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer ${
                  preferences.notifications.quietHoursEnabled ? 'bg-primary' : 'bg-surface-subtle border border-border'
                }`}
              >
                <div
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    preferences.notifications.quietHoursEnabled ? 'translate-x-5 shadow-sm' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
