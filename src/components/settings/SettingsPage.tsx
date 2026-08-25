import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SectionHeading } from '@/components/dashboard/SectionHeading'
import { Icon } from '@/components/icons/icon-map'
import { currentUser } from '@/data/user-data'

// Category config synced with notification-service.dbml
const categoryConfig: Record<string, { label: { vi: string; en: string }; description: { vi: string; en: string }; icon: string }> = {
  auth: { label: { vi: 'Bảo mật', en: 'Auth & Security' }, description: { vi: 'Đăng nhập, mật khẩu, 2FA', en: 'Login, password, 2FA, account' }, icon: 'shield' },
  subscription: { label: { vi: 'Đăng ký', en: 'Subscription' }, description: { vi: 'Gói, thanh toán', en: 'Plans, billing, payments' }, icon: 'credit-card' },
  user: { label: { vi: 'Người dùng', en: 'User' }, description: { vi: 'Hồ sơ, cài đặt', en: 'Profile, settings, activity' }, icon: 'user' },
  vocabulary: { label: { vi: 'Từ vựng', en: 'Vocabulary' }, description: { vi: 'Từ, SRS, flashcards', en: 'Words, SRS, flashcards, decks' }, icon: 'book' },
  practice: { label: { vi: 'Luyện tập', en: 'Practice' }, description: { vi: 'Nói, viết, nghe', en: 'Speaking, writing, listening' }, icon: 'activity' },
  exam: { label: { vi: 'Bài thi', en: 'Exam' }, description: { vi: 'TOEIC, bài kiểm tra', en: 'TOEIC, tests, results' }, icon: 'file-text' },
  course: { label: { vi: 'Khóa học', en: 'Course' }, description: { vi: 'Khóa, bài học', en: 'Courses, lessons, progress' }, icon: 'library' },
  ai: { label: { vi: 'AI', en: 'AI' }, description: { vi: 'Tính năng AI', en: 'AI features, quotas' }, icon: 'sparkles' },
  gamification: { label: { vi: 'Gamification', en: 'Gamification' }, description: { vi: 'Streak, XP, thành tựu', en: 'Streak, XP, achievements' }, icon: 'trophy' },
  marketing: { label: { vi: 'Marketing', en: 'Marketing' }, description: { vi: 'Khuyến mãi', en: 'Promotions, campaigns' }, icon: 'megaphone' },
}

const channels = [
  { key: 'push', label: { vi: 'Push', en: 'Push' } },
  { key: 'email', label: { vi: 'Email', en: 'Email' } },
  { key: 'inApp', label: { vi: 'App', en: 'In-App' } },
]

export function SettingsPage() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [preferences, setPreferences] = useState(currentUser.preferences)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  // Toggle master switch
  const toggleMasterNotification = () => {
    setPreferences({
      ...preferences,
      notifications: {
        ...preferences.notifications,
        allEnabled: !preferences.notifications.allEnabled,
      },
    })
  }

  // Toggle channel
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

  // Toggle category channel
  const toggleCategoryChannel = (category: string, channel: string) => {
    setPreferences({
      ...preferences,
      notifications: {
        ...preferences.notifications,
        categories: {
          ...preferences.notifications.categories,
          [category]: {
            ...preferences.notifications.categories[category as keyof typeof preferences.notifications.categories],
            [channel]: !preferences.notifications.categories[category as keyof typeof preferences.notifications.categories][channel as keyof { push: boolean; email: boolean; inApp: boolean }],
          },
        },
      },
    })
  }

  // Toggle all channels for a category
  const toggleCategoryAll = (category: string) => {
    const cat = preferences.notifications.categories[category as keyof typeof preferences.notifications.categories]
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

  // Toggle quiet hours
  const toggleQuietHours = () => {
    setPreferences({
      ...preferences,
      notifications: {
        ...preferences.notifications,
        quietHoursEnabled: !preferences.notifications.quietHoursEnabled,
      },
    })
  }

  // Toggle learning
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
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow={t('settings.title')}
        title={isVietnamese ? 'Cài đặt tài khoản' : 'Account Settings'}
        description={isVietnamese ? 'Quản lý thông báo và cài đặt học tập' : 'Manage notifications and learning preferences'}
      />

      {/* Account Settings */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-text-primary">
            <Icon name="user" size={18} />
            {t('settings.account')}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-text-primary">{currentUser.email}</div>
                <div className="text-sm text-text-tertiary">{isVietnamese ? 'Email đăng nhập' : 'Login email'}</div>
              </div>
            </div>
            <div className="border-t border-surface-subtle pt-2">
              <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
                <Icon name="lock" size={16} />
                <span className="ml-2">{t('settings.changePassword')}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-text-primary">
            <Icon name="bell" size={18} />
            {t('settings.notifications')}
          </h3>

          {/* Master Toggle */}
          <div className="mb-4 flex items-center justify-between rounded-xl bg-surface-subtle p-4">
            <div>
              <div className="font-medium text-text-primary">{isVietnamese ? 'Bật tất cả thông báo' : 'Enable All Notifications'}</div>
              <div className="text-sm text-text-tertiary">{isVietnamese ? 'Nhận thông báo từ ứng dụng' : 'Receive notifications from the app'}</div>
            </div>
            <button
              onClick={toggleMasterNotification}
              className={`relative h-6 w-11 rounded-full transition-colors ${preferences.notifications.allEnabled ? 'bg-primary' : 'bg-surface-hover'}`}
            >
              <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${preferences.notifications.allEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {/* Channel Toggles */}
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(['push', 'email', 'sms', 'sound'] as const).map((key) => {
              const labels: Record<string, { vi: string; en: string }> = {
                push: { vi: 'Push', en: 'Push Notifications' },
                email: { vi: 'Email', en: 'Email' },
                sms: { vi: 'SMS', en: 'SMS' },
                sound: { vi: 'Âm thanh', en: 'Sound' },
              }
              const enabled = preferences.notifications[key] as boolean
              return (
                <div
                  key={key}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-colors ${enabled ? 'border-primary/30 bg-primary/5' : 'border-surface-subtle'}`}
                  onClick={() => toggleChannel(key)}
                >
                  <span className="text-xs font-medium text-text-primary">{labels[key][isVietnamese ? 'vi' : 'en']}</span>
                  <div className={`h-2 w-2 rounded-full ${enabled ? 'bg-primary' : 'bg-surface-hover'}`} />
                </div>
              )
            })}
          </div>

          {/* Quiet Hours */}
          <div className="mb-6 rounded-xl border border-surface-subtle p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-text-primary">{isVietnamese ? 'Giờ yên tĩnh' : 'Quiet Hours'}</div>
                <div className="text-sm text-text-tertiary">{isVietnamese ? 'Tắt thông báo trong khung giờ' : 'Pause notifications during set hours'}</div>
              </div>
              <button
                onClick={toggleQuietHours}
                className={`relative h-6 w-11 rounded-full transition-colors ${preferences.notifications.quietHoursEnabled ? 'bg-primary' : 'bg-surface-hover'}`}
              >
                <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${preferences.notifications.quietHoursEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {preferences.notifications.quietHoursEnabled && (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <span>{isVietnamese ? 'Từ' : 'From'}</span>
                <Input
                  type="time"
                  value={preferences.notifications.quietHoursStart}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      notifications: { ...preferences.notifications, quietHoursStart: e.target.value },
                    })
                  }
                  className="w-32"
                />
                <span>{isVietnamese ? 'đến' : 'to'}</span>
                <Input
                  type="time"
                  value={preferences.notifications.quietHoursEnd}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      notifications: { ...preferences.notifications, quietHoursEnd: e.target.value },
                    })
                  }
                  className="w-32"
                />
              </div>
            )}
          </div>

          {/* Category Settings */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-text-secondary">{isVietnamese ? 'Danh mục thông báo' : 'Notification Categories'}</h4>
            {Object.entries(categoryConfig).map(([key, config]) => {
              const cat = preferences.notifications.categories[key as keyof typeof preferences.notifications.categories]
              if (!cat) return null
              const hasAnyEnabled = cat.push || cat.email || cat.inApp

              return (
                <div
                  key={key}
                  className={`rounded-xl border p-4 transition-colors ${hasAnyEnabled ? 'border-primary/30 bg-primary/5' : 'border-surface-subtle'}`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name={config.icon as any} size={16} className="text-text-tertiary" />
                      <div>
                        <div className="font-medium text-text-primary">{config.label[isVietnamese ? 'vi' : 'en']}</div>
                        <div className="text-xs text-text-tertiary">{config.description[isVietnamese ? 'vi' : 'en']}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleCategoryAll(key)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${hasAnyEnabled ? 'bg-primary text-white' : 'bg-surface-subtle text-text-tertiary'}`}
                    >
                      {hasAnyEnabled ? (isVietnamese ? 'BẬT' : 'ON') : (isVietnamese ? 'TẮT' : 'OFF')}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {channels.map((ch) => {
                      const isEnabled = cat[ch.key as keyof typeof cat] as boolean
                      return (
                        <button
                          key={ch.key}
                          onClick={() => toggleCategoryChannel(key, ch.key)}
                          className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${isEnabled ? 'bg-primary text-white' : 'bg-surface-subtle text-text-tertiary hover:bg-surface-hover'}`}
                        >
                          {ch.label[isVietnamese ? 'vi' : 'en']}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Marketing Toggle */}
          <div className="mt-4 flex items-center justify-between rounded-xl border border-surface-subtle p-4">
            <div className="flex items-center gap-2">
              <Icon name="megaphone" size={16} className="text-text-tertiary" />
              <div>
                <div className="font-medium text-text-primary">{isVietnamese ? 'Marketing & Khuyến mãi' : 'Marketing & Promotions'}</div>
                <div className="text-xs text-text-tertiary">{isVietnamese ? 'Ưu đãi đặc biệt' : 'Special offers and campaigns'}</div>
              </div>
            </div>
            <button
              onClick={() => toggleChannel('marketingEnabled')}
              className={`relative h-6 w-11 rounded-full transition-colors ${preferences.notifications.marketingEnabled ? 'bg-primary' : 'bg-surface-hover'}`}
            >
              <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${preferences.notifications.marketingEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Learning Settings */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-text-primary">
            <Icon name="book" size={18} />
            {t('settings.learning')}
          </h3>
          <div className="space-y-4">
            {Object.entries(preferences.learning)
              .filter(([key]) => typeof preferences.learning[key as keyof typeof preferences.learning] === 'boolean')
              .map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{learningLabels[key]?.[isVietnamese ? 'vi' : 'en'] || key}</span>
                  <button
                    onClick={() => toggleLearning(key as keyof typeof preferences.learning)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${value ? 'bg-primary' : 'bg-surface-subtle'}`}
                  >
                    <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}

            <div className="flex items-center justify-between border-t border-surface-subtle pt-4">
              <div>
                <div className="text-sm text-text-secondary">{t('settings.dailyGoal')}</div>
                <div className="text-xs text-text-tertiary">{isVietnamese ? 'Số phút học mỗi ngày' : 'Minutes to study each day'}</div>
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
                      learning: { ...preferences.learning, dailyGoal: parseInt(e.target.value) || 30 },
                    })
                  }
                  className="w-20 text-center"
                />
                <span className="text-sm text-text-tertiary">min</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-text-secondary">{t('settings.defaultDifficulty')}</div>
                <div className="text-xs text-text-tertiary">{isVietnamese ? 'Cấp độ khi bắt đầu' : 'Exercise level when starting'}</div>
              </div>
              <select
                value={preferences.learning.defaultExerciseDifficulty}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    learning: { ...preferences.learning, defaultExerciseDifficulty: e.target.value as 'easy' | 'medium' | 'hard' },
                  })
                }
                className="rounded-lg border border-surface-subtle bg-surface px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="easy">{t('settings.easy')}</option>
                <option value="medium">{t('settings.medium')}</option>
                <option value="hard">{t('settings.hard')}</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Modal */}
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} isVietnamese={isVietnamese} />}
    </main>
  )
}

// Change password modal
function ChangePasswordModal({ onClose, isVietnamese }: { onClose: () => void; isVietnamese: boolean }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (form.newPassword !== form.confirmPassword) {
      setError(isVietnamese ? 'Mật khẩu không khớp' : 'Passwords do not match')
      return
    }
    if (form.newPassword.length < 6) {
      setError(isVietnamese ? 'Mật khẩu phải có ít nhất 6 ký tự' : 'Password must be at least 6 characters')
      return
    }
    console.log('Change password:', form)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t('settings.changePassword')}</h3>
            <button onClick={onClose} className="text-text-tertiary hover:text-text-primary">
              <Icon name="x" size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-text-secondary">{t('settings.currentPassword')}</label>
              <Input
                type="password"
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                placeholder={isVietnamese ? 'Nhập mật khẩu hiện tại' : 'Enter current password'}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text-secondary">{t('settings.newPassword')}</label>
              <Input
                type="password"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                placeholder={isVietnamese ? 'Nhập mật khẩu mới' : 'Enter new password'}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text-secondary">{t('settings.confirmPassword')}</label>
              <Input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder={isVietnamese ? 'Xác nhận mật khẩu mới' : 'Confirm new password'}
              />
            </div>
            {error && <div className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</div>}
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              {t('settings.changePassword')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
