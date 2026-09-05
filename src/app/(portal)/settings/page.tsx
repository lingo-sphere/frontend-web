/**
 * @file page.tsx
 * @description Trang cài đặt hệ thống chính điều phối các tab chức năng độc lập
 */

'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { User, Layers, ExternalLink, RotateCcw, Save, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth.store'
import { dashboardStore } from '@/store/dashboard.store'
import { userService } from '@/services/user.service'
import { toast } from '@/store/toast.store'
import { UpgradeModal } from '@/components/upgrade/upgrade.modal'
import { useNavigate } from '@/lib/navigation'
import { getRemainingSubscriptionText } from '@/components/layout/header.utils'
import type { UserPreferences } from '@/types/user'

import { SettingsSidebar, type SettingsTab } from '@/components/settings/settings.sidebar'
import { SettingsAccountTab } from '@/components/settings/settings.account'
import { SettingsLearningTab } from '@/components/settings/settings.learning'
import { SettingsNotificationsTab } from '@/components/settings/settings.notifications'
import { SettingsAppearanceTab } from '@/components/settings/settings.appearance'
import { SettingsPrivacyTab } from '@/components/settings/settings.privacy'
import { SettingsVipTab } from '@/components/settings/settings.vip'

const defaultPreferences: UserPreferences = {
  language: 'vi',
  theme: 'system',
  notifications: {
    allEnabled: true,
    marketingEnabled: false,
    email: true,
    push: true,
    sound: true,
    sms: false,
    quietHoursEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    categories: {
      streak: { push: true, email: true, inApp: true },
      courses: { push: true, email: false, inApp: true },
      exams: { push: true, email: true, inApp: true },
      vip: { push: true, email: true, inApp: true },
    },
  },
  learning: {
    autoPlayAudio: true,
    showPhonetic: true,
    defaultExerciseDifficulty: 'medium',
    dailyGoal: 30,
  },
  privacy: {
    showProfile: true,
    showProgress: true,
    allowFriendRequests: true,
  },
}

export default function SettingsAppPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const navigate = useNavigate()
  const { user: authUser, setUser: setAuthUser } = useAuthStore()

  const [activeTab, setActiveTab] = useState<SettingsTab>('account')
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lingosphere_user_preferences')
        if (saved) return JSON.parse(saved)
      } catch {}
    }
    return defaultPreferences
  })

  const [isSaving, setIsSaving] = useState(false)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)

  const [fullName, setFullName] = useState(authUser?.full_name || '')
  const [phoneNumber, setPhoneNumber] = useState((authUser as any)?.phone_number || '')

  useEffect(() => {
    if (authUser) {
      setFullName(authUser.full_name || '')
      setPhoneNumber((authUser as any)?.phone_number || '')
    }
  }, [authUser])

  useEffect(() => {
    let isMounted = true
    const loadSettingsFromBackend = async () => {
      try {
        const res: any = await userService.getMySettings()
        const backendSettings = res?.data || res
        if (isMounted && backendSettings) {
          setPreferences((prev) => ({
            ...prev,
            theme: backendSettings.dark_mode_enabled ? 'dark' : prev.theme,
            learning: {
              ...prev.learning,
              dailyGoal: backendSettings.study_duration_minutes || prev.learning.dailyGoal,
            },
            notifications: {
              ...prev.notifications,
              allEnabled: backendSettings.is_reminder_enabled !== undefined ? backendSettings.is_reminder_enabled : prev.notifications.allEnabled,
              email: backendSettings.is_email_notification_enabled !== undefined ? backendSettings.is_email_notification_enabled : prev.notifications.email,
              push: backendSettings.is_push_notification_enabled !== undefined ? backendSettings.is_push_notification_enabled : prev.notifications.push,
              sound: backendSettings.sound_effects_enabled !== undefined ? backendSettings.sound_effects_enabled : prev.notifications.sound,
              quietHoursStart: backendSettings.reminder_time || prev.notifications.quietHoursStart,
            },
          }))
        }
      } catch (err) {
      }
    }
    loadSettingsFromBackend()
    return () => {
      isMounted = false
    }
  }, [])

  const handleSavePreferences = async () => {
    setIsSaving(true)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('lingosphere_user_preferences', JSON.stringify(preferences))
      }

      await userService.updateMySettings({
        is_reminder_enabled: preferences.notifications.allEnabled,
        is_push_notification_enabled: preferences.notifications.push,
        is_email_notification_enabled: preferences.notifications.email,
        sound_effects_enabled: preferences.notifications.sound,
        dark_mode_enabled: preferences.theme === 'dark',
        study_duration_minutes: preferences.learning.dailyGoal,
        reminder_time: preferences.notifications.quietHoursStart || '22:00',
      })

      if (authUser?.id) {
        await userService.updateProfile({
          full_name: fullName,
          phone_number: phoneNumber,
          learning_goal_minutes_per_day: preferences.learning.dailyGoal,
        } as any)
        if (authUser) {
          setAuthUser({
            ...authUser,
            full_name: fullName,
          })
        }
      }

      toast.success(
        isVi ? 'Đã lưu mọi thay đổi cài đặt lên máy chủ thành công!' : 'Settings updated on server successfully!',
        isVi ? 'Cài đặt hệ thống' : 'System Settings'
      )
    } catch (error) {
      toast.error(
        isVi ? 'Không thể lưu cài đặt. Vui lòng thử lại!' : 'Failed to save settings. Please try again!',
        isVi ? 'Lỗi' : 'Error'
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetDefaults = () => {
    setPreferences(defaultPreferences)
    if (typeof window !== 'undefined') {
      localStorage.setItem('lingosphere_user_preferences', JSON.stringify(defaultPreferences))
    }
    toast.info(
      isVi ? 'Đã khôi phục cài đặt về mặc định của hệ thống.' : 'Restored system default settings.',
      isVi ? 'Khôi phục' : 'Reset'
    )
  }

  const handleSelectTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setPreferences((prev) => ({ ...prev, theme: newTheme }))
    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      dashboardStore.getState().setTheme(prefersDark ? 'dark' : 'light')
    } else {
      dashboardStore.getState().setTheme(newTheme)
    }
  }

  const handleSelectLanguage = (lang: 'vi' | 'en') => {
    setPreferences((prev) => ({ ...prev, language: lang }))
    i18n.changeLanguage(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('i18nextLng', lang)
    }
  }

  const isPremium = Boolean(authUser?.is_premium || authUser?.subscription_expires_at)
  const remainingSubText = isPremium
    ? getRemainingSubscriptionText(authUser?.subscription_expires_at, authUser?.subscription_plan, isVi)
    : ''

  const initials = (authUser?.full_name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <>
      <main className="w-full min-h-screen bg-background text-text-primary px-4 py-6 sm:px-6 sm:py-8 lg:px-10 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-primary mb-1 uppercase tracking-wider">
              <Layers size={14} />
              <span>{isVi ? 'Trung tâm cài đặt' : 'Control Center'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
              {isVi ? 'Cài đặt hệ thống' : 'Account & App Settings'}
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              {isVi
                ? 'Tùy chỉnh thông tin tài khoản, bảo mật, thông báo và trải nghiệm học tập của bạn.'
                : 'Personalize your account credentials, security, notifications, and study experience.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              onClick={() => navigate('/profile')}
              className="rounded-xl border-border hover:bg-surface-subtle text-xs font-semibold gap-1.5 h-10 px-3.5 cursor-pointer shadow-xs"
            >
              <User size={15} />
              <span>{isVi ? 'Xem trang hồ sơ' : 'View Profile'}</span>
              <ExternalLink size={13} className="text-text-tertiary" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 pt-6 sm:pt-8 items-start">
          <SettingsSidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            isVi={isVi}
            isPremium={isPremium}
          />

          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            {activeTab === 'account' && (
              <SettingsAccountTab
                fullName={fullName}
                setFullName={setFullName}
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
                authUser={authUser}
                isVi={isVi}
                initials={initials}
              />
            )}

            {activeTab === 'learning' && (
              <SettingsLearningTab
                preferences={preferences}
                setPreferences={setPreferences}
                isVi={isVi}
              />
            )}

            {activeTab === 'notifications' && (
              <SettingsNotificationsTab
                preferences={preferences}
                setPreferences={setPreferences}
                isVi={isVi}
              />
            )}

            {activeTab === 'appearance' && (
              <SettingsAppearanceTab
                preferences={preferences}
                onSelectTheme={handleSelectTheme}
                onSelectLanguage={handleSelectLanguage}
                currentLanguage={i18n.language}
                isVi={isVi}
              />
            )}

            {activeTab === 'privacy' && (
              <SettingsPrivacyTab
                preferences={preferences}
                setPreferences={setPreferences}
                isVi={isVi}
              />
            )}

            {activeTab === 'vip' && (
              <SettingsVipTab
                isPremium={isPremium}
                remainingSubText={remainingSubText}
                onOpenUpgrade={() => setUpgradeModalOpen(true)}
                isVi={isVi}
              />
            )}

            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
              <Button
                variant="ghost"
                onClick={handleResetDefaults}
                className="w-full sm:w-auto text-xs text-text-secondary hover:text-text-primary rounded-xl cursor-pointer"
              >
                <RotateCcw size={14} className="mr-1.5" />
                <span>{isVi ? 'Khôi phục mặc định' : 'Reset to Default'}</span>
              </Button>

              <Button
                onClick={handleSavePreferences}
                disabled={isSaving}
                className="w-full sm:w-auto rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold px-6 h-11 transition-all shadow-md shadow-primary/20 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    <span>{isVi ? 'Đang lưu cài đặt...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    <span>{isVi ? 'Lưu mọi thay đổi' : 'Save Changes'}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
      />
    </>
  )
}
