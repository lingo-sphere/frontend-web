import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Heart, ShoppingCart } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Icon } from '@/components/icons/icon-map'
import { DictionaryModal } from '@/components/dictionary/DictionaryModal'
import { UpgradeModal } from '@/components/layout/UpgradeModal'
import { AuthModal } from '@/components/auth/AuthModal'
import { HeaderMyLearningHover } from '@/components/layout/HeaderMyLearningHover'
import { HeaderWishlistHover } from '@/components/layout/HeaderWishlistHover'
import { HeaderCartHover } from '@/components/layout/HeaderCartHover'
import { useDashboardStore } from '@/store/dashboard-store'
import { useAuthStore } from '@/store/auth-store'
import { useCartStore } from '@/store/cart-store'
import { useWishlistStore } from '@/store/wishlist-store'
import { useNavigate } from '@/lib/navigation'
import { getCategoryColor, getCategoryLabel } from '@/types/notification'
import type { Notification } from '@/types/notification'

interface UtilityHeaderProps {
  onAction: (message: string) => void
}

export function UtilityHeader({ onAction }: UtilityHeaderProps) {
  const { i18n } = useTranslation()
  const [language, setLanguage] = useState<'VI' | 'EN'>(i18n.language === 'en' ? 'EN' : 'VI')
  const [dictionaryOpen, setDictionaryOpen] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const theme = useDashboardStore((state) => state.theme)
  const toggleTheme = useDashboardStore((state) => state.toggleTheme)
  const setMobileSidebarOpen = useDashboardStore((state) => state.setMobileSidebarOpen)
  const { user, isAuthenticated, logout } = useAuthStore()
  const { getTotalItems, fetchCart } = useCartStore()
  const { items: wishlistItems, fetchWishlist } = useWishlistStore()
  const cartItemCount = getTotalItems()
  const wishlistCount = wishlistItems.length
  const navigate = useNavigate()
  const [hoveredHeaderMenu, setHoveredHeaderMenu] = useState<'learning' | 'wishlist' | 'cart' | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
      fetchWishlist()
    }
  }, [isAuthenticated, fetchCart, fetchWishlist])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const latestNotifications = useMemo(() => {
    return [...notifications]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }, [notifications])

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString()
  }

  const handleLanguageToggle = () => {
    const newLang = language === 'VI' ? 'en' : 'vi'
    setLanguage(newLang === 'en' ? 'EN' : 'VI')
    i18n.changeLanguage(newLang)
    localStorage.setItem('i18nextLng', newLang)
  }

  return (
    <>
      <header className="sticky top-0 z-10 flex min-h-[72px] items-center justify-between gap-4 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur-sm sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Button
            aria-label="Open navigation"
            className="lg:hidden"
            onClick={() => setMobileSidebarOpen(true)}
            size="icon"
            variant="outline"
          >
            <Icon name="menu" size={17} />
          </Button>
          <button
            onClick={() => setDictionaryOpen(true)}
            className="group relative flex h-10 min-w-0 max-w-[330px] flex-1 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-3.5 text-left transition-colors hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/15"
          >
            <Icon className="shrink-0 text-text-tertiary" name="search" size={18} />
            <span className="flex-1 truncate text-[13px] text-text-tertiary">
              {language === 'VI' ? 'Tra từ điển...' : 'Search dictionary...'}
            </span>
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <Button
            className="hidden h-9 gap-2 rounded-xl border border-info/30 bg-gradient-to-br from-info/10 to-info/5 px-3 text-[12px] font-semibold text-info hover:border-info/50 hover:from-info/15 hover:to-info/10 sm:inline-flex"
            onClick={() => onAction(language === 'VI' ? 'Đã mở Diamonds.' : 'Opened Diamonds.')}
            variant="ghost"
          >
            <Icon name="diamond" size={16} />
            <span>1,250</span>
          </Button>
          <Button
            className="hidden h-9 gap-2 rounded-xl border border-warning/30 bg-gradient-to-br from-warning/10 to-warning/5 px-3 text-[12px] font-semibold text-warning hover:border-warning/50 hover:from-warning/15 hover:to-warning/10 sm:inline-flex"
            onClick={() => onAction(language === 'VI' ? 'Đã mở Streak Details.' : 'Opened Streak Details.')}
            variant="ghost"
          >
            <Icon name="flame" size={16} />
            <span>12</span>
          </Button>
          <Button
            className={`hidden h-9 gap-2 rounded-xl border px-3 text-[12px] font-semibold sm:inline-flex ${
              user?.is_premium
                ? 'border-amber-500 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 hover:border-amber-600 hover:from-amber-500/30 hover:to-orange-500/30'
                : 'border-warning bg-gradient-to-r from-warning/20 to-warning/10 text-warning hover:border-warning hover:from-warning/30 hover:to-warning/20'
            }`}
            onClick={() => setUpgradeOpen(true)}
            variant="ghost"
          >
            <Icon name="crown" size={16} className={user?.is_premium ? 'text-amber-500 fill-amber-500' : ''} />
            <span>{user?.is_premium ? (language === 'VI' ? 'Premium VIP' : 'Premium VIP') : (language === 'VI' ? 'Nâng cấp' : 'Upgrade')}</span>
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label={language === 'VI' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
                className="h-9 rounded-xl border-border px-3 text-[12px] font-bold text-text-secondary"
                onClick={handleLanguageToggle}
                variant="outline"
              >
                {language}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{language === 'VI' ? 'Chuyển sang English' : 'Switch to Tiếng Việt'}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button aria-label={theme === 'light' ? 'Bật dark mode' : 'Bật light mode'} className="h-9 w-9 rounded-xl border-border" onClick={toggleTheme} size="icon" variant="outline">
                <Icon name={theme === 'light' ? 'moon' : 'sun'} size={17} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{theme === 'light' ? 'Dark mode' : 'Light mode'}</TooltipContent>
          </Tooltip>
          <div
            className="relative hidden md:block"
            onMouseEnter={() => setHoveredHeaderMenu('learning')}
            onMouseLeave={() => setHoveredHeaderMenu(null)}
          >
            <button
              onClick={() => navigate('/courses')}
              className="h-9 px-3 text-[13px] font-semibold text-text-secondary hover:text-text-primary transition-colors rounded-xl flex items-center gap-1 cursor-pointer"
            >
              {language === 'VI' ? 'Khóa học của tôi' : 'My learning'}
            </button>
            {hoveredHeaderMenu === 'learning' && <HeaderMyLearningHover />}
          </div>

          <div
            className="relative"
            onMouseEnter={() => setHoveredHeaderMenu('wishlist')}
            onMouseLeave={() => setHoveredHeaderMenu(null)}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label="Wishlist"
                  className="relative h-9 w-9 rounded-xl border-border"
                  onClick={() => navigate('/courses')}
                  size="icon"
                  variant="outline"
                >
                  <Heart size={17} />
                  {wishlistCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{language === 'VI' ? 'Yêu thích' : 'Wishlist'}</TooltipContent>
            </Tooltip>
            {hoveredHeaderMenu === 'wishlist' && <HeaderWishlistHover />}
          </div>

          <div
            className="relative"
            onMouseEnter={() => setHoveredHeaderMenu('cart')}
            onMouseLeave={() => setHoveredHeaderMenu(null)}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label="Shopping Cart"
                  className="relative h-9 w-9 rounded-xl border-border"
                  onClick={() => {
                    if (!isAuthenticated) {
                      setAuthModalOpen(true)
                    } else {
                      navigate('/cart')
                    }
                  }}
                  size="icon"
                  variant="outline"
                >
                  <ShoppingCart size={17} />
                  {cartItemCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white shadow-sm">
                      {cartItemCount > 9 ? '9+' : cartItemCount}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{language === 'VI' ? 'Giỏ hàng' : 'Shopping Cart'}</TooltipContent>
            </Tooltip>
            {hoveredHeaderMenu === 'cart' && <HeaderCartHover />}
          </div>

          <div className="relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label="Notifications"
                  className="relative h-9 w-9 rounded-xl border-border"
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  size="icon"
                  variant="outline"
                >
                  <Icon name="bell" size={17} />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>

            {notificationOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotificationOpen(false)} />
                <Card className="absolute right-0 top-full z-50 mt-2 w-80 shadow-xl">
                  <div className="flex items-center justify-between border-b border-border p-3">
                    <span className="font-semibold text-text-primary">{language === 'VI' ? 'Thông báo' : 'Notifications'}</span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">
                        {unreadCount} {language === 'VI' ? 'mới' : 'new'}
                      </span>
                    )}
                  </div>
                  <CardContent className="max-h-96 overflow-y-auto p-0">
                    {latestNotifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Icon name="bellOff" size={32} className="mb-2 text-text-tertiary" />
                        <p className="text-sm text-text-tertiary">{language === 'VI' ? 'Không có thông báo' : 'No notifications'}</p>
                      </div>
                    ) : (
                      latestNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`flex cursor-pointer items-start gap-3 border-b border-border p-3 last:border-0 hover:bg-surface-subtle ${
                            !notif.isRead ? 'bg-primary/5' : ''
                          }`}
                          onClick={() => {
                            handleMarkAsRead(notif.id)
                            onAction(`Viewed: ${notif.title}`)
                          }}
                        >
                          <div className={`mt-0.5 shrink-0 rounded-lg p-1.5 ${getCategoryColor(notif.notificationCategory)}/10`}>
                            <Icon
                              name={getNotifIcon(notif.notificationType)}
                              size={14}
                              className={getCategoryColor(notif.notificationCategory).replace('bg-', 'text-')}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className={`truncate text-sm ${notif.isRead ? 'text-text-secondary' : 'font-medium text-text-primary'}`}>
                                {notif.title}
                              </span>
                              {!notif.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                            </div>
                            <p className="mt-0.5 line-clamp-1 text-xs text-text-tertiary">{notif.content}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-[10px] text-text-tertiary">{formatTime(notif.createdAt)}</span>
                              <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${getCategoryColor(notif.notificationCategory)} text-white`}>
                                {getCategoryLabel(notif.notificationCategory)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                  <div className="border-t border-border p-2">
                    <Button
                      variant="ghost"
                      className="w-full text-xs text-primary"
                      onClick={() => {
                        setNotificationOpen(false)
                        window.location.href = '/notifications'
                      }}
                    >
                      {language === 'VI' ? 'Xem tất cả thông báo' : 'View all notifications'}
                    </Button>
                  </div>
                </Card>
              </>
            )}
          </div>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 border-l border-border pl-3">
              <button
                onClick={() => (window.location.href = '/profile')}
                className="flex items-center gap-2 rounded-xl p-1 hover:bg-surface-subtle transition-colors text-left"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs ring-2 ring-primary/20 overflow-hidden">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="h-full w-full object-cover" />
                  ) : (
                    user.full_name?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-text-primary leading-tight line-clamp-1">
                    {user.full_name || 'Học viên'}
                  </div>
                  <div className="text-[10px] text-text-tertiary">
                    {user.email}
                  </div>
                </div>
              </button>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-text-tertiary hover:text-error rounded-lg"
                    onClick={() => logout()}
                  >
                    <Icon name="logOut" size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Đăng xuất</TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <Button
              onClick={() => setAuthModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm h-9"
            >
              <Icon name="logIn" size={15} className="mr-1.5" />
              <span>{language === 'VI' ? 'Đăng nhập' : 'Sign in'}</span>
            </Button>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <DictionaryModal
        open={dictionaryOpen}
        onAction={onAction}
        onOpenChange={setDictionaryOpen}
      />

      <UpgradeModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
      />
    </>
  )
}

function getNotifIcon(type: string): string {
  const iconMap: Record<string, string> = {
    LOGIN_SUCCESS: 'logIn',
    LOGIN_FAILED: 'alertTriangle',
    PASSWORD_CHANGED: 'lock',
    EMAIL_VERIFIED: 'checkCircle',
    TWO_FACTOR_ENABLED: 'shield',
    ACCOUNT_BLOCKED: 'xCircle',
    NEW_LOGIN_LOCATION: 'mapPin',
    SUBSCRIPTION_CREATED: 'creditCard',
    SUBSCRIPTION_RENEWED: 'refresh',
    SUBSCRIPTION_EXPIRING: 'clock',
    SUBSCRIPTION_EXPIRED: 'alertCircle',
    PAYMENT_SUCCESS: 'checkCircle',
    PAYMENT_FAILED: 'xCircle',
    STREAK_REMINDER: 'flame',
    STREAK_BROKEN: 'zapOff',
    STREAK_MILESTONE: 'award',
    LEVEL_UP: 'trendingUp',
    XP_MILESTONE: 'star',
    ACHIEVEMENT_UNLOCKED: 'trophy',
    GEM_EARNED: 'gem',
    SRS_DUE: 'clock',
    NEW_CARDS_AVAILABLE: 'plusCircle',
    DECK_COMPLETED: 'checkCircle',
    VOCABULARY_MASTERED: 'checkSquare',
    PRACTICE_SESSION_REMINDER: 'activity',
    PRACTICE_STREAK: 'flame',
    SPEAKING_EVALUATION_READY: 'mic',
    WRITING_EVALUATION_READY: 'pencil',
    LISTENING_EVALUATION_READY: 'headphones',
    TOEIC_TEST_REMINDER: 'fileText',
    TOEIC_RESULT_READY: 'barChart',
    TOEIC_SCORE_IMPROVED: 'trendingUp',
    TOEIC_PART_WEAK: 'alertTriangle',
    COURSE_ENROLLED: 'book',
    LESSON_AVAILABLE: 'playCircle',
    LESSON_COMPLETED: 'checkCircle',
    COURSE_COMPLETED: 'graduation',
    COURSE_CERTIFICATE_READY: 'award',
    AI_QUOTA_WARNING: 'alertTriangle',
    AI_RECOMMENDATION_AVAILABLE: 'lightbulb',
    DAILY_GOAL_REMINDER: 'target',
    DAILY_GOAL_COMPLETED: 'checkCircle',
    SYSTEM_MAINTENANCE: 'settings',
  }
  return iconMap[type] || 'bell'
}
