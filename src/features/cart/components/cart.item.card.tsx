/**
 * @file cart.item.card.tsx
 * @description Component hiển thị từng khóa học trong giỏ hàng kèm giá ưu đãi và nút xóa
 */

'use client'

import { Trash2, CheckCircle2 } from 'lucide-react'
import type { CartItem } from '@/features/cart/types/cart'
import { buildCourseUrl } from '@/features/courses/lib/course.url'

interface CartItemCardProps {
  item: CartItem
  isVi: boolean
  onNavigate: (url: string) => void
  onRemove: (courseId: string) => void
}

export function CartItemCard({ item, isVi, onRemove, onNavigate }: CartItemCardProps) {
  const rawPrice = item.price || 0
  const rawDiscount = item.discount_price || 0
  const hasDiscount = rawDiscount > 0 && rawDiscount < rawPrice
  const itemSalePrice = hasDiscount ? rawDiscount : rawPrice > 0 ? rawPrice : rawDiscount
  const itemOriginalPrice = hasDiscount ? rawPrice : null

  return (
    <div className="rounded-2xl border border-border/80 bg-surface p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center transition-all hover:shadow-sm">
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        <img
          src={
            item.thumbnail_url ||
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600'
          }
          alt={item.title}
          className="h-20 w-32 rounded-xl object-cover shrink-0 border border-border/60"
        />
        <div className="space-y-1 min-w-0 flex-1">
          <h3
            onClick={() => onNavigate(buildCourseUrl({ id: item.course_id, title: item.title }))}
            className="text-sm font-bold text-text-primary line-clamp-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer leading-snug"
          >
            {item.title}
          </h3>
          <div className="text-xs text-text-tertiary">
            {item.instructor_name || 'LingoSphere Academic Team'}
          </div>
          <div className="flex items-center gap-3 pt-1 text-[11px] text-text-secondary">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 size={12} />
              {isVi ? 'Truy cập trọn đời' : 'Lifetime access'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0 border-t sm:border-t-0 border-border/40 pt-2 sm:pt-0">
        <div className="flex sm:flex-col items-baseline sm:items-end gap-1.5">
          <span className="text-base font-extrabold text-text-primary">
            {itemSalePrice > 0
              ? `₫${itemSalePrice.toLocaleString('vi-VN')}`
              : isVi
              ? 'Miễn phí'
              : 'Free'}
          </span>
          {itemOriginalPrice && (
            <span className="text-xs text-text-tertiary line-through">
              ₫{itemOriginalPrice.toLocaleString('vi-VN')}
            </span>
          )}
        </div>

        <button
          onClick={() => onRemove(item.course_id)}
          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
          title={isVi ? 'Xóa khỏi giỏ hàng' : 'Remove from cart'}
        >
          <Trash2 size={14} />
          <span className="text-[11px] font-semibold">{isVi ? 'Xóa' : 'Remove'}</span>
        </button>
      </div>
    </div>
  )
}
