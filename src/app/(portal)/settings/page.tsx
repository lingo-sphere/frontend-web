'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SectionHeading } from '@/components/dashboard/SectionHeading'
import { Icon } from '@/components/icons/icon-map'
import type { UserPreferences } from '@/types/user'

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
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    categories: {
      auth: { push: true, email: true, inApp: true },
      subscription: { push: true, email: true, inApp: true },
      user: { push: true, email: false, inApp: true },
      vocabulary: { push: true, email: false, inApp: true },
      practice: { push: true, email: false, inApp: true },
      exam: { push: true, email: true, inApp: true },
      course: { push: false, email: false, inApp: true },
      ai: { push: false, email: false, inApp: true },
      gamification: { push: true, email: false, inApp: true },
      marketing: { push: false, email: false, inApp: false },
    },
  },
  learning: {
    autoPlayAudio: true,
    showPhonetic: true,
    defaultExerciseDifficulty: 'medium',
    dailyGoal: 20,
  },
  privacy: {
    showProfile: true,
    showProgress: true,
    allowFriendRequests: true,
  },
}

const categoryConfig: Record<
  string,
  { label: { vi: string; en: string }; description: { vi: string; en: string }; icon: string }
> = {
  auth: {
    label: { vi: 'Bảo mật', en: 'Auth & Security' },
    description: { vi: 'Đăng nhập, mật khẩu, 2FA', en: 'Login, password, 2FA, account' },
    icon: 'shield',
  },
  subscription: {
    label: { vi: 'Đăng ký', en: 'Subscription' },
    description: { vi: 'Gói, thanh toán', en: 'Plans, billing, payments' },
    icon: 'credit-card',
  },
  user: {
    label: { vi: 'Người dùng', en: 'User' },
    description: { vi: 'Hồ sơ, cài đặt', en: 'Profile, settings, activity' },
    icon: 'user',
  },
  vocabulary: {
    label: { vi: 'Từ vựng', en: 'Vocabulary' },
    description: { vi: 'Từ, SRS, flashcards', en: 'Words, SRS, flashcards, decks' },
    icon: 'book',
  },
  practice: {
    label: { vi: 'Luyện tập', en: 'Practice' },
    description: { vi: 'Nói, viết, nghe', en: 'Speaking, writing, listening' },
    icon: 'activity',
  },
  exam: {
    label: { vi: 'Bài thi', en: 'Exam' },
    description: { vi: 'TOEIC, bài kiểm tra', en: 'TOEIC, tests, results' },
    icon: 'file-text',
  },
  course: {
    label: { vi: 'Khóa học', en: 'Course' },
    description: { vi: 'Khóa, bài học', en: 'Courses, lessons, progress' },
    icon: 'library',
  },
  ai: {
    label: { vi: 'AI', en: 'AI' },
    description: { vi: 'Tính năng AI', en: 'AI features, quotas' },
    icon: 'sparkles',
  },
  gamification: {
    label: { vi: 'Gamification', en: 'Gamification' },
    description: { vi: 'Streak, XP, thành tựu', en: 'Streak, XP, achievements' },
    icon: 'trophy',
  },
  marketing: {
    label: { vi: 'Marketing', en: 'Marketing' },
    description: { vi: 'Khuyến mãi', en: 'Promotions, campaigns' },
    icon: 'megaphone',
  },
}

const channels = [
  { key: 'push', label: { vi: 'Push', en: 'Push' } },
  { key: 'email', label: { vi: 'Email', en: 'Email' } },
  { key: 'inApp', label: { vi: 'App', en: 'In-App' } },
]

export default function SettingsAppPage() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const toggleMasterNotification = () => {
    setPreferences({
      ...preferences,
      notifications: {
        ...preferences.notifications,
        allEnabled: !preferences.notifications.allEnabled,
      },
    })
  }

  const toggleChannel = (key: keyof typeof preferences.notifications) => {
    if (typeof preferences.notifications[key] === 'boolean') {
      setPreferences({
        ...preferences,
        notifications: {
          ...preferences.notifications,
          [key]: !preferences.notifications[key],
        },
      })
    }
  }

  const toggleCategoryChannel = (category: string, channel: string) => {
    if (!preferences.notifications.categories) return
    const prevCat = preferences.notifications.categories[category] || {
      push: true,
      email: true,
      inApp: true,
    }
    const channelKey = channel as keyof { push: boolean; email: boolean; inApp: boolean }
    setPreferences({
      ...preferences,
      notifications: {
        ...preferences.notifications,
        categories: {
          ...preferences.notifications.categories,
          [category]: {
            ...prevCat,
            [channelKey]: !prevCat[channelKey],
          },
        },
      },
    })
  }

  const toggleCategoryAll = (category: string) => {
    if (!preferences.notifications.categories) return
    const cat = preferences.notifications.categories[category]
    if (!cat) return
    const allEnabled = cat.push && cat.email && cat.inApp
    setPreferences({
      ...preferences,
      notifications: {
        ...preferences.notifications,
        categories: {
          ...preferences.notifications.categories,
          [category]: { push: !allEnabled, email: !allEnabled, inApp: !allEnabled },
        },
      },
    })
  }

  const toggleQuietHours = () => {
    setPreferences({
      ...preferences,
      notifications: {
        ...preferences.notifications,
        quietHoursEnabled: !preferences.notifications.quietHoursEnabled,
      },
    })
  }

  const toggleLearning = (key: keyof typeof preferences.learning) => {
    if (typeof preferences.learning[key] === 'boolean') {
      setPreferences({
        ...preferences,
        learning: { ...preferences.learning, [key]: !preferences.learning[key] },
      })
    }
  }

  const learningLabels: Record<string, { vi: string; en: string }> = {
    autoPlayAudio: { vi: 'Tự động phát âm', en: 'Auto-play audio' },
    showPhonetic: { vi: 'Hiển thị IPA', en: 'Show IPA phonetic' },
  }

  return (
    <Layout>
      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('settings.title') || 'Cài đặt'}
          title={isVietnamese ? 'Cài đặt tài khoản' : 'Account Settings'}
          description={
            isVietnamese
              ? 'Quản lý thông báo và cài đặt học tập'
              : 'Manage notifications and learning preferences'
          }
        />

        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-text-primary">
              <Icon name="user" size={18} />
              {t('settings.account') || 'Tài khoản'}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-text-primary">user@lingosphere.edu.vn</div>
                  <div className="text-sm text-text-tertiary">
                    {isVietnamese ? 'Email đăng nhập' : 'Login email'}
                  </div>
                </div>
              </div>
              <div className="border-t border-surface-subtle pt-2">
                <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
                  <Icon name="lock" size={16} />
                  <span className="ml-2">{t('settings.changePassword') || 'Đổi mật khẩu'}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Icon name="bell" size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">
                    {t('settings.notifications') || 'Thông báo'}
                  </h3>
                  <p className="text-xs text-text-tertiary">
                    {isVietnamese
                      ? 'Bật/tắt tất cả thông báo từ hệ thống'
                      : 'Toggle all system notifications'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleMasterNotification}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  preferences.notifications.allEnabled ? 'bg-primary' : 'bg-surface-subtle'
                }`}
              >
                <div
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    preferences.notifications.allEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="mb-6 grid grid-cols-3 gap-3">
              {channels.map((ch) => {
                const isEnabled =
                  preferences.notifications[ch.key as keyof typeof preferences.notifications]
                return (
                  <button
                    key={ch.key}
                    onClick={() =>
                      toggleChannel(ch.key as keyof typeof preferences.notifications)
                    }
                    className={`flex flex-col items-center justify-center rounded-xl border p-3 transition-colors ${
                      isEnabled ? 'border-primary bg-primary/5' : 'border-surface-subtle'
                    }`}
                  >
                    <span className="text-xs font-medium text-text-primary">
                      {ch.label[isVietnamese ? 'vi' : 'en']}
                    </span>
                    <span className="mt-1 text-[11px] text-text-tertiary">
                      {isEnabled
                        ? isVietnamese
                          ? 'Đang bật'
                          : 'Enabled'
                        : isVietnamese
                        ? 'Đang tắt'
                        : 'Disabled'}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-text-secondary">
                {isVietnamese ? 'Danh mục thông báo' : 'Notification Categories'}
              </h4>
              {Object.entries(categoryConfig).map(([key, config]) => {
                const cat = (preferences.notifications.categories as Record<string, any>)?.[key]
                if (!cat) return null
                const hasAnyEnabled = cat.push || cat.email || cat.inApp

                return (
                  <div
                    key={key}
                    className={`rounded-xl border p-4 transition-colors ${
                      hasAnyEnabled ? 'border-primary/30 bg-primary/5' : 'border-surface-subtle'
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon name={config.icon} size={16} className="text-text-tertiary" />
                        <div>
                          <div className="font-medium text-text-primary">
                            {config.label[isVietnamese ? 'vi' : 'en']}
                          </div>
                          <div className="text-xs text-text-tertiary">
                            {config.description[isVietnamese ? 'vi' : 'en']}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleCategoryAll(key)}
                        className="text-xs text-primary hover:underline"
                      >
                        {hasAnyEnabled
                          ? isVietnamese
                            ? 'Tắt hết'
                            : 'Disable all'
                          : isVietnamese
                          ? 'Bật hết'
                          : 'Enable all'}
                      </button>
                    </div>

                    <div className="flex gap-4">
                      {channels.map((ch) => (
                        <label
                          key={ch.key}
                          className="flex cursor-pointer items-center gap-1.5 text-xs text-text-secondary"
                        >
                          <input
                            type="checkbox"
                            checked={cat[ch.key]}
                            onChange={() => toggleCategoryChannel(key, ch.key)}
                            className="rounded border-surface-subtle text-primary focus:ring-primary"
                          />
                          {ch.label[isVietnamese ? 'vi' : 'en']}
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-text-primary">
              <Icon name="book" size={18} />
              {t('settings.learning') || 'Học tập'}
            </h3>
            <div className="space-y-4">
              {Object.entries(preferences.learning)
                .filter(
                  ([key]) =>
                    typeof preferences.learning[key as keyof typeof preferences.learning] ===
                    'boolean'
                )
                .map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">
                      {learningLabels[key]?.[isVietnamese ? 'vi' : 'en'] || key}
                    </span>
                    <button
                      onClick={() => toggleLearning(key as keyof typeof preferences.learning)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        value ? 'bg-primary' : 'bg-surface-subtle'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                          value ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}

              <div className="flex items-center justify-between border-t border-surface-subtle pt-4">
                <div>
                  <div className="text-sm text-text-secondary">
                    {t('settings.dailyGoal') || 'Mục tiêu học'}
                  </div>
                  <div className="text-xs text-text-tertiary">
                    {isVietnamese ? 'Số phút học mỗi ngày' : 'Minutes to study each day'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={5}
                    max={180}
                    value={preferences.learning.dailyGoal}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        learning: {
                          ...preferences.learning,
                          dailyGoal: parseInt(e.target.value) || 30,
                        },
                      })
                    }
                    className="w-20 text-center"
                  />
                  <span className="text-sm text-text-tertiary">min</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-text-secondary">
                    {t('settings.defaultDifficulty') || 'Độ khó mặc định'}
                  </div>
                  <div className="text-xs text-text-tertiary">
                    {isVietnamese ? 'Cấp độ khi bắt đầu' : 'Exercise level when starting'}
                  </div>
                </div>
                <select
                  value={preferences.learning.defaultExerciseDifficulty}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      learning: {
                        ...preferences.learning,
                        defaultExerciseDifficulty: e.target.value as 'easy' | 'medium' | 'hard',
                      },
                    })
                  }
                  className="rounded-lg border border-surface-subtle bg-surface px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="easy">{t('settings.easy') || 'Dễ'}</option>
                  <option value="medium">{t('settings.medium') || 'Trung bình'}</option>
                  <option value="hard">{t('settings.hard') || 'Khó'}</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </Layout>
  )
}
