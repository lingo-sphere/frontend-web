/**
 * @file UtilityHeader.tsx
 * @description Component giao diện React UtilityHeader cho học viên
 */

import { useState, useMemo, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Heart, ShoppingCart } from 'lucide-react'
import { useMounted } from '@/hooks/use-mounted'

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
import { HeaderUserHover } from '@/components/layout/HeaderUserHover'
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
  const mounted = useMounted()
  const [language, setLanguage] = useState<'VI' | 'EN'>('VI')
  const [dictionaryOpen, setDictionaryOpen] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const theme = useDashboardStore((state) => state.theme)
  const toggleTheme = useDashboardStore((state) => state.toggleTheme)
  const setMobileSidebarOpen = useDashboardStore((state) => state.setMobileSidebarOpen)
  const { user, isAuthenticated, logout } = useAuthStore()
  const fetchCart = useCartStore((state) => state.fetchCart)
  const cart = useCartStore((state) => state.cart)
  const cartItemCount = cart?.total_items || 0
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist)
  const wishlistItems = useWishlistStore((state) => state.items)
  const wishlistCount = wishlistItems?.length || 0
  const navigate = useNavigate()
  const [hoveredHeaderMenu, setHoveredHeaderMenu] = useState<'learning' | 'wishlist' | 'cart' | 'user' | null>(null)
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = (menu: 'learning' | 'wishlist' | 'cart' | 'user') => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
    setHoveredHeaderMenu(menu)
  }

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
    }
    hoverTimerRef.current = setTimeout(() => {
      setHoveredHeaderMenu(null)
      hoverTimerRef.current = null
    }, 250)
  }

  useEffect(() => {
    setLanguage(i18n.language === 'en' ? 'EN' : 'VI')
  }, [i18n.language])

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
      fetchWishlist()
    }
  }, [isAuthenticated])

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

  const isVi = mounted ? language === 'VI' : true

  return (
    <>
      <header className="sticky top-0 z-30 flex min-h-[72px] items-center justify-between gap-4 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur-md shadow-xs sm:px-6 lg:px-8">
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
            <span suppressHydrationWarning className="flex-1 truncate text-[13px] text-text-tertiary">
              {isVi ? 'Tra từ điển...' : 'Search dictionary...'}
            </span>
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <Button
            className="hidden h-9 gap-2 rounded-xl border border-info/30 bg-gradient-to-br from-info/10 to-info/5 px-3 text-[12px] font-semibold text-info hover:border-info/50 hover:from-info/15 hover:to-info/10 sm:inline-flex"
            onClick={() => onAction(isVi ? 'Đã mở Diamonds.' : 'Opened Diamonds.')}
            variant="ghost"
          >
            <Icon name="diamond" size={16} />
            <span>1,250</span>
          </Button>
          <Button
            className="hidden h-9 gap-2 rounded-xl border border-warning/30 bg-gradient-to-br from-warning/10 to-warning/5 px-3 text-[12px] font-semibold text-warning hover:border-warning/50 hover:from-warning/15 hover:to-warning/10 sm:inline-flex"
            onClick={() => onAction(isVi ? 'Đã mở Streak Details.' : 'Opened Streak Details.')}
            variant="ghost"
          >
            <Icon name="flame" size={16} />
            <span>12</span>
          </Button>
          {mounted && !user?.is_premium && (
            <Button
              className="hidden h-9 gap-2 rounded-xl border border-warning bg-gradient-to-r from-warning/20 to-warning/10 px-3 text-[12px] font-semibold text-warning hover:border-warning hover:from-warning/30 hover:to-warning/20 sm:inline-flex"
              onClick={() => setUpgradeOpen(true)}
              variant="ghost"
            >
              <Icon name="crown" size={16} />
              <span suppressHydrationWarning>{isVi ? 'Nâng cấp' : 'Upgrade'}</span>
            </Button>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label={isVi ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
                className="h-9 rounded-xl border-border px-3 text-[12px] font-bold text-text-secondary"
                onClick={handleLanguageToggle}
                variant="outline"
              >
                <span suppressHydrationWarning>{language}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isVi ? 'Chuyển sang English' : 'Switch to Tiếng Việt'}</TooltipContent>
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
            onMouseEnter={() => handleMouseEnter('learning')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => navigate('/courses')}
              className="h-9 px-3 text-[13px] font-semibold text-text-secondary hover:text-text-primary transition-colors rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <span suppressHydrationWarning>{isVi ? 'Khóa học của tôi' : 'My learning'}</span>
            </button>
            {hoveredHeaderMenu === 'learning' && <HeaderMyLearningHover />}
          </div>

          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('wishlist')}
            onMouseLeave={handleMouseLeave}
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
                  {mounted && wishlistCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isVi ? 'Yêu thích' : 'Wishlist'}</TooltipContent>
            </Tooltip>
            {hoveredHeaderMenu === 'wishlist' && <HeaderWishlistHover />}
          </div>

          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('cart')}
            onMouseLeave={handleMouseLeave}
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
                  {mounted && cartItemCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white shadow-sm">
                      {cartItemCount > 9 ? '9+' : cartItemCount}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isVi ? 'Giỏ hàng' : 'Shopping Cart'}</TooltipContent>
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
                    <span suppressHydrationWarning className="font-semibold text-text-primary">{isVi ? 'Thông báo' : 'Notifications'}</span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">
                        {unreadCount} {isVi ? 'mới' : 'new'}
                      </span>
                    )}
                  </div>
                  <CardContent className="max-h-96 overflow-y-auto p-0">
                    {latestNotifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Icon name="bellOff" size={32} className="mb-2 text-text-tertiary" />
                        <p suppressHydrationWarning className="text-sm text-text-tertiary">{isVi ? 'Không có thông báo' : 'No notifications'}</p>
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
                        navigate('/notifications')
                      }}
                    >
                      <span suppressHydrationWarning>{isVi ? 'Xem tất cả thông báo' : 'View all notifications'}</span>
                    </Button>
                  </div>
                </Card>
              </>
            )}
          </div>

          {mounted && isAuthenticated && user ? (
            <div
              className="relative flex items-center gap-2 border-l border-border pl-3"
              onMouseEnter={() => handleMouseEnter('user')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 rounded-xl p-1 hover:bg-surface-subtle transition-colors text-left cursor-pointer group"
              >
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs ring-2 ring-primary/20 overflow-hidden shrink-0 shadow-xs">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="h-full w-full object-cover" />
                  ) : (
                    user.full_name?.charAt(0)?.toUpperCase() || 'U'
                  )}
                  {user.is_premium && (
                    <div className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white">
                      <Icon name="crown" size={8} className="fill-white text-white" />
                    </div>
                  )}
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-text-primary leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                      {user.full_name || 'Học viên'}
                    </span>
                    {user.is_premium && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[9px] font-extrabold text-white shadow-xs">
                        <Icon name="crown" size={9} className="fill-white text-white" />
                        VIP
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-text-tertiary">
                    {user.is_premium ? (
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        {getRemainingSubscriptionText(user.subscription_expires_at, user.subscription_plan, isVi)}
                      </span>
                    ) : (
                      user.email
                    )}
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

              {hoveredHeaderMenu === 'user' && (
                <HeaderUserHover
                  onClose={() => setHoveredHeaderMenu(null)}
                  onLanguageToggle={handleLanguageToggle}
                  currentLanguage={language}
                />
              )}
            </div>
          ) : (
            <Button
              onClick={() => setAuthModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm h-9"
            >
              <Icon name="logIn" size={15} className="mr-1.5" />
              <span suppressHydrationWarning>{isVi ? 'Đăng nhập' : 'Sign in'}</span>
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

export function getRemainingSubscriptionText(expiresAt?: string, plan?: string, isVi: boolean = true): string {
  if (plan === 'LIFETIME') {
    return isVi ? 'Gói Vĩnh Viễn' : 'Lifetime Access'
  }
  if (!expiresAt) {
    return isVi ? 'Gói Premium VIP' : 'Premium VIP'
  }
  const exp = new Date(expiresAt).getTime()
  const diffMs = exp - Date.now()
  if (diffMs <= 0) {
    return isVi ? 'VIP đã hết hạn' : 'VIP Expired'
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 30) {
    const months = Math.floor(days / 30)
    const remDays = days % 30
    return isVi ? `Còn ${months} tháng ${remDays > 0 ? `${remDays} ngày` : ''}` : `${months}mo ${remDays}d left`
  }
  if (days > 0) {
    return isVi ? `Còn ${days} ngày ${hours > 0 ? `${hours}h` : ''}` : `${days}d ${hours}h left`
  }
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  return isVi ? `Còn ${hours}h ${mins}m` : `${hours}h ${mins}m left`
}
