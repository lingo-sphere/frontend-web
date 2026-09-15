// Header tiện ích chính của hệ thống, quản lý tìm kiếm, giỏ hàng, thông báo và tài khoản.

"use client";

import { useState, useEffect, useRef } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { useMounted } from "@/hooks/use.mounted";

import { Button } from "@/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";
import { Icon } from "@/components/icon.map";
import { DictionaryModal } from "@/features/vocabulary/components/dictionary.modal";
import { UpgradeModal } from "@/features/upgrade/components/upgrade.modal";
import { AuthModal } from "@/features/auth/components/auth.modal";
import { HeaderMyLearningHover } from "@/layouts/header.learning";
import { HeaderWishlistHover } from "@/layouts/header.wishlist";
import { HeaderCartHover } from "@/layouts/header.cart";
import { HeaderSearchDictionary } from "@/layouts/header.search";
import { HeaderStatsBadges } from "@/layouts/header.stats";
import { HeaderNotificationDropdown } from "@/layouts/header.notification";
import { HeaderUserSection } from "@/layouts/header.user";
import { useDashboardStore } from "@/features/dashboard/store/dashboard.store";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useCartQuery } from "@/features/cart/hooks/use.cart.query";
import { useWishlistQuery } from "@/features/cart/hooks/use.wishlist.query";
import { useEnrollmentStore } from "@/features/courses/store/enrollment.store";
import { useNavigate } from "@/lib/navigation";
import {
  useMyNotifications,
  useMarkNotificationAsReadMutation,
} from "@/features/notifications/hooks/use.notifications.query";
import { useLanguage } from "@/hooks/use.language";
import type { Notification } from "@/features/notifications/types/notification";

export { getRemainingSubscriptionText } from "@/layouts/header.utils";

interface UtilityHeaderProps {
  onAction: (message: string) => void;
}

export function UtilityHeader({ onAction }: UtilityHeaderProps) {
  const mounted = useMounted();
  const { currentLanguage, toggleLanguage, isVietnamese } = useLanguage();
  const [dictionaryOpen, setDictionaryOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const theme = useDashboardStore((state) => state.theme);
  const toggleTheme = useDashboardStore((state) => state.toggleTheme);
  const setMobileSidebarOpen = useDashboardStore(
    (state) => state.setMobileSidebarOpen
  );
  const { user, isAuthenticated, logout } = useAuthStore();
  const { data: cart } = useCartQuery(isAuthenticated);
  const { data: wishlist } = useWishlistQuery(isAuthenticated);
  const cartItemCount = cart?.total_items || cart?.items?.length || 0;
  const wishlistCount = wishlist?.total_items || wishlist?.items?.length || 0;
  const navigate = useNavigate();
  const [hoveredHeaderMenu, setHoveredHeaderMenu] = useState<string | null>(
    null
  );
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { data: notifications = [] } = useMyNotifications(
    undefined,
    isAuthenticated
  );
  const { mutate: markNotificationAsRead } =
    useMarkNotificationAsReadMutation();

  const handleMouseEnter = (
    menu: "learning" | "wishlist" | "cart" | "user"
  ) => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setHoveredHeaderMenu(menu);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    hoverTimerRef.current = setTimeout(() => {
      setHoveredHeaderMenu(null);
      hoverTimerRef.current = null;
    }, 250);
  };

  useEffect(() => {
    if (isAuthenticated) {
      useEnrollmentStore.getState().fetchMyEnrollments();
    }

    // Listen for open auth modal event from anywhere
    const handleOpenAuthModal = () => {
      setAuthModalOpen(true);
    };
    window.addEventListener('lingosphere:open-auth-modal', handleOpenAuthModal);

    return () => {
      window.removeEventListener('lingosphere:open-auth-modal', handleOpenAuthModal);
    };
  }, [isAuthenticated]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
  };

  const isVi = mounted ? isVietnamese : true;
  const languageLabel = (currentLanguage || "vi").toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-40 flex min-h-18 shrink-0 items-center justify-between gap-4 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur-md shadow-xs sm:px-6 lg:px-8">
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
                aria-label={
                  isVi ? "Switch to English" : "Chuyển sang Tiếng Việt"
                }
                className="h-9 rounded-xl border-border px-3 text-[12px] font-bold text-text-secondary cursor-pointer"
                onClick={toggleLanguage}
                variant="outline"
              >
                <span suppressHydrationWarning>{languageLabel}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isVi ? "Chuyển sang English" : "Switch to Tiếng Việt"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label={
                  theme === "light" ? "Bật dark mode" : "Bật light mode"
                }
                className="h-9 w-9 rounded-xl border-border cursor-pointer"
                onClick={toggleTheme}
                size="icon"
                variant="outline"
              >
                <Icon name={theme === "light" ? "moon" : "sun"} size={17} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {theme === "light" ? "Dark mode" : "Light mode"}
            </TooltipContent>
          </Tooltip>

          <div
            className="relative hidden md:block"
            onMouseEnter={() => handleMouseEnter("learning")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => navigate("/courses?tab=my-courses")}
              className="h-9 px-3 text-[13px] font-semibold text-text-secondary hover:text-text-primary transition-colors rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <span suppressHydrationWarning>
                {isVi ? "Khóa học của tôi" : "My learning"}
              </span>
            </button>
            {hoveredHeaderMenu === "learning" && <HeaderMyLearningHover />}
          </div>

          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("wishlist")}
            onMouseLeave={handleMouseLeave}
          >
            <Button
              aria-label={isVi ? "Danh sách yêu thích" : "Wishlist"}
              className="relative h-9 w-9 rounded-xl border-border cursor-pointer"
              onClick={() => navigate("/courses?tab=wishlist")}
              size="icon"
              variant="outline"
            >
              <Heart size={17} />
              {mounted && wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Button>
            {hoveredHeaderMenu === "wishlist" && <HeaderWishlistHover />}
          </div>

          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("cart")}
            onMouseLeave={handleMouseLeave}
          >
            <Button
              aria-label={isVi ? "Giỏ hàng" : "Shopping Cart"}
              className="relative h-9 w-9 rounded-xl border-border cursor-pointer"
              onClick={() => {
                if (!isAuthenticated) {
                  setAuthModalOpen(true);
                } else {
                  navigate("/cart");
                }
              }}
              size="icon"
              variant="outline"
            >
              <ShoppingCart size={17} />
              {mounted && cartItemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm">
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              )}
            </Button>
            {hoveredHeaderMenu === "cart" && <HeaderCartHover />}
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
            isHovered={hoveredHeaderMenu === "user"}
            onMouseEnter={() => handleMouseEnter("user")}
            onMouseLeave={handleMouseLeave}
            onCloseHover={() => setHoveredHeaderMenu(null)}
            onLanguageToggle={toggleLanguage}
            currentLanguage={languageLabel as "VI" | "EN"}
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
        userId={user?.user_id}
      />

      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  );
}
