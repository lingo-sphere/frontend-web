'use client'

/**
 * @file SettingsSidebar.tsx
 * @description Component thanh điều hướng các danh mục cài đặt bên trái trang Settings
 */

import {
  ShieldCheck,
  GraduationCap,
  Bell,
  Sun,
  Eye,
  Crown,
} from 'lucide-react'

export type SettingsTab = 'account' | 'learning' | 'notifications' | 'appearance' | 'privacy' | 'vip'

interface SettingsSidebarProps {
  activeTab: SettingsTab
  onSelectTab: (tab: SettingsTab) => void
  isVi: boolean
  isPremium: boolean
}

export function SettingsSidebar({
  activeTab,
  onSelectTab,
  isVi,
  isPremium,
}: SettingsSidebarProps) {
  const tabsConfig = [
    {
      id: 'account' as SettingsTab,
      label: isVi ? 'Tài khoản & Bảo mật' : 'Account & Security',
      desc: isVi ? 'Thông tin cá nhân, email, mật khẩu' : 'Personal info, email, password',
      icon: ShieldCheck,
    },
    {
      id: 'learning' as SettingsTab,
      label: isVi ? 'Trải nghiệm học tập' : 'Learning Experience',
      desc: isVi ? 'Phát âm, phiên âm IPA, mục tiêu ngày' : 'Audio, IPA, daily study goals',
      icon: GraduationCap,
    },
    {
      id: 'notifications' as SettingsTab,
      label: isVi ? 'Thông báo & Nhắc nhở' : 'Notifications',
      desc: isVi ? 'Thông báo đẩy, email, giờ yên tĩnh' : 'Push alerts, email, quiet hours',
      icon: Bell,
    },
    {
      id: 'appearance' as SettingsTab,
      label: isVi ? 'Giao diện & Ngôn ngữ' : 'Appearance & Language',
      desc: isVi ? 'Chế độ sáng tối, ngôn ngữ hệ thống' : 'Dark/Light mode, app language',
      icon: Sun,
    },
    {
      id: 'privacy' as SettingsTab,
      label: isVi ? 'Quyền riêng tư' : 'Privacy & Social',
      desc: isVi ? 'Bảng xếp hạng, hiển thị hồ sơ' : 'Leaderboard, profile visibility',
      icon: Eye,
    },
    {
      id: 'vip' as SettingsTab,
      label: isVi ? 'Gói thành viên VIP' : 'VIP Membership',
      desc: isVi ? 'Đặc quyền học tập không giới hạn' : 'Unlimited learning access',
      icon: Crown,
      badge: isPremium ? (isVi ? 'Đang hoạt động' : 'Active') : (isVi ? 'Nâng cấp' : 'Upgrade'),
    },
  ]

  return (
    <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 space-y-1.5 bg-surface rounded-2xl border border-border p-2.5 shadow-xs">
      <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
        {isVi ? 'Danh mục cài đặt' : 'Settings Navigation'}
      </div>

      {tabsConfig.map((tab) => {
        const IconComp = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer group ${
              isActive
                ? 'bg-primary text-white shadow-md shadow-primary/20 font-semibold'
                : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-primary/10 text-primary group-hover:bg-primary/15'
                }`}
              >
                <IconComp size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold truncate leading-snug">
                  {tab.label}
                </div>
                <div
                  className={`text-[11px] truncate hidden sm:block ${
                    isActive ? 'text-white/80' : 'text-text-tertiary'
                  }`}
                >
                  {tab.desc}
                </div>
              </div>
            </div>

            {tab.badge && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : isPremium
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    : 'bg-primary/15 text-primary'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
