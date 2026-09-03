'use client'

/**
 * @file UtilityHeader.tsx
 * @description Header tiện ích chính của hệ thống, quản lý tìm kiếm, giỏ hàng, thông báo và tài khoản
 */

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Heart, ShoppingCart } from 'lucide-react'
import { useMounted } from '@/hooks/use-mounted'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Icon } from '@/components/icons/icon-map'
import { DictionaryModal } from '@/components/dictionary/dictionary.modal'
import { UpgradeModal } from '@/components/upgrade/upgrade.modal'
import { AuthModal } from '@/components/auth/auth.modal'
import { HeaderMyLearningHover } from '@/components/layout/header.learning'
import { HeaderWishlistHover } from '@/components/layout/header.wishlist'
import { HeaderCartHover } from '@/components/layout/header.cart'
import { HeaderSearchDictionary } from '@/components/layout/header.search'
import { HeaderStatsBadges } from '@/components/layout/header.stats'
import { HeaderNotificationDropdown } from '@/components/layout/header.notification'
import { HeaderUserSection } from '@/components/layout/header.user'
import { useDashboardStore } from '@/store/dashboard-store'
import { useAuthStore } from '@/store/auth-store'
import { useCartStore } from '@/store/cart-store'
import { useWishlistStore } from '@/store/wishlist-store'
import { useEnrollmentStore } from '@/store/enrollment-store'
import { useNavigate } from '@/lib/navigation'
import type { Notification } from '@/types/notification'

export { getRemainingSubscriptionText } from '@/components/layout/header.utils'

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
      useEnrollmentStore.getState().fetchMyEnrollments()
    }
  }, [isAuthenticated])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
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
        <HeaderSearchDictionary
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenDictionary={() => setDictionaryOpen(true)}
          isVi={isVi}
        />

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <HeaderStatsBadges
            mounted={mounted}
            isPremium={Boolean(user?.is_premium)}
            isVi={isVi}
            onAction={onAction}
            onOpenUpgrade={() => setUpgradeOpen(true)}
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label={isVi ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
                className="h-9 rounded-xl border-border px-3 text-[12px] font-bold text-text-secondary cursor-pointer"
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
              <Button
                aria-label={theme === 'light' ? 'Bật dark mode' : 'Bật light mode'}
                className="h-9 w-9 rounded-xl border-border cursor-pointer"
                onClick={toggleTheme}
                size="icon"
                variant="outline"
              >
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
              onClick={() => navigate('/courses?tab=my-courses')}
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
            <Button
              aria-label={isVi ? 'Danh sách yêu thích' : 'Wishlist'}
              className="relative h-9 w-9 rounded-xl border-border cursor-pointer"
              onClick={() => navigate('/courses?tab=wishlist')}
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
            {hoveredHeaderMenu === 'wishlist' && <HeaderWishlistHover />}
          </div>

          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('cart')}
            onMouseLeave={handleMouseLeave}
          >
            <Button
              aria-label={isVi ? 'Giỏ hàng' : 'Shopping Cart'}
              className="relative h-9 w-9 rounded-xl border-border cursor-pointer"
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
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </Button>
            {hoveredHeaderMenu === 'cart' && <HeaderCartHover />}
          </div>

          <HeaderNotificationDropdown
            notifications={notifications}
            unreadCount={unreadCount}
            isOpen={notificationOpen}
            onToggle={() => setNotificationOpen(!notificationOpen)}
            onClose={() => setNotificationOpen(false)}
            onMarkAsRead={handleMarkAsRead}
            onAction={onAction}
            isVi={isVi}
          />

          <HeaderUserSection
            mounted={mounted}
            isAuthenticated={isAuthenticated}
            user={user}
            isVi={isVi}
            isHovered={hoveredHeaderMenu === 'user'}
            onMouseEnter={() => handleMouseEnter('user')}
            onMouseLeave={handleMouseLeave}
            onCloseHover={() => setHoveredHeaderMenu(null)}
            onLanguageToggle={handleLanguageToggle}
            currentLanguage={language}
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenUpgrade={() => setUpgradeOpen(true)}
            onLogout={() => logout()}
          />
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
