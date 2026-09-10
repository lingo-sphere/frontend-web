/**
 * @file settings.privacy.tsx
 * @description Component tab cài đặt quyền riêng tư, hiển thị hồ sơ trên bảng xếp hạng và kết nối xã hội
 */

'use client'

import { Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/card'
import type { UserPreferences } from '@/features/user/types/user'

interface SettingsPrivacyTabProps {
  preferences: UserPreferences
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>
  isVi: boolean
}

export function SettingsPrivacyTab({
  preferences,
  setPreferences,
  isVi,
}: SettingsPrivacyTabProps) {
  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-border bg-surface shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-border bg-surface-subtle/30">
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Eye size={18} className="text-primary" />
            <span>{isVi ? 'Hiển thị hồ sơ & Xã hội' : 'Profile & Social Visibility'}</span>
          </h3>
          <p className="text-xs text-text-tertiary mt-0.5">
            {isVi ? 'Kiểm soát những thông tin người học khác có thể nhìn thấy về bạn' : 'Control what others can see'}
          </p>
        </div>

        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface-subtle/30">
            <div>
              <div className="text-xs sm:text-sm font-bold text-text-primary">
                {isVi ? 'Hiển thị tên trên Bảng xếp hạng học tập' : 'Display Name on Leaderboard'}
              </div>
              <div className="text-xs text-text-tertiary mt-0.5">
                {isVi
                  ? 'Cho phép xếp hạng điểm kinh nghiệm (XP) và chuỗi ngày học của bạn cùng cộng đồng.'
                  : 'Compete and show your weekly rank to peers.'}
              </div>
            </div>
            <button
              onClick={() =>
                setPreferences((prev) => ({
                  ...prev,
                  privacy: { ...prev.privacy, showProfile: !prev.privacy.showProfile },
                }))
              }
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer ${
                preferences.privacy.showProfile ? 'bg-primary' : 'bg-surface-subtle border border-border'
              }`}
            >
              <div
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  preferences.privacy.showProfile ? 'translate-x-5 shadow-sm' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface-subtle/30">
            <div>
              <div className="text-xs sm:text-sm font-bold text-text-primary">
                {isVi ? 'Cho phép kết nối & Nhận lời mời học tập' : 'Allow Study Invitations'}
              </div>
              <div className="text-xs text-text-tertiary mt-0.5">
                {isVi
                  ? 'Bạn bè và học viên khác có thể tìm kiếm hồ sơ và gửi lời mời học nhóm cùng bạn.'
                  : 'Allow other students to invite you to study.'}
              </div>
            </div>
            <button
              onClick={() =>
                setPreferences((prev) => ({
                  ...prev,
                  privacy: { ...prev.privacy, allowFriendRequests: !prev.privacy.allowFriendRequests },
                }))
              }
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer ${
                preferences.privacy.allowFriendRequests ? 'bg-primary' : 'bg-surface-subtle border border-border'
              }`}
            >
              <div
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  preferences.privacy.allowFriendRequests ? 'translate-x-5 shadow-sm' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
