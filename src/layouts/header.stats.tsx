// Component hiển thị huy hiệu Chuỗi ngày Streak và Nút nâng cấp VIP.

'use client'

import { Button } from '@/components/button'
import { Icon } from '@/components/icon.map'

interface HeaderStatsBadgesProps {
  mounted: boolean
  isPremium?: boolean
  isVi: boolean
  streak?: number
  onAction: (msg: string) => void
  onOpenUpgrade: () => void
}

export function HeaderStatsBadges({
  mounted,
  isPremium,
  isVi,
  streak,
  onAction,
  onOpenUpgrade,
}: HeaderStatsBadgesProps) {
  return (
    <>

      <Button
        className="hidden h-9 gap-2 rounded-xl border border-warning/30 bg-gradient-to-br from-warning/10 to-warning/5 px-3 text-[12px] font-semibold text-warning hover:border-warning/50 hover:from-warning/15 hover:to-warning/10 sm:inline-flex cursor-pointer"
        onClick={() => onAction(isVi ? 'Đã mở Streak Details.' : 'Opened Streak Details.')}
        variant="ghost"
      >
        <Icon name="flame" size={16} />
        <span suppressHydrationWarning>
          {(mounted ? (streak ?? 0) : 0).toLocaleString('vi-VN')}
        </span>
      </Button>

      {mounted && !isPremium && (
        <Button
          className="hidden h-9 gap-2 rounded-xl border border-warning bg-gradient-to-r from-warning/20 to-warning/10 px-3 text-[12px] font-semibold text-warning hover:border-warning hover:from-warning/30 hover:to-warning/20 sm:inline-flex cursor-pointer"
          onClick={onOpenUpgrade}
          variant="ghost"
        >
          <Icon name="crown" size={16} />
          <span suppressHydrationWarning>{isVi ? 'Nâng cấp' : 'Upgrade'}</span>
        </Button>
      )}
    </>
  )
}
