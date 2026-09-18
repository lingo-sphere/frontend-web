// Component hiển thị từng khóa học trong giỏ hàng kèm hình ảnh, mức giá và thao tác xóa
'use client'

import { Trash2, CheckCircle2, Heart, Sparkles, User } from 'lucide-react'
import type { CartItem } from '@/features/cart/types/cart'
import { buildCourseUrl } from '@/features/courses/lib/course.url'
import { formatCurrency } from '@/lib/format'
import { useWishlist } from '@/features/cart/hooks/use.wishlist.query'
import { toast } from '@/store/toast.store'

interface CartItemCardProps {
  item: CartItem
  isVi: boolean
  onNavigate: (url: string) => void
  onRemove: (courseId: string) => void
}

export function CartItemCard({ item, isVi, onRemove, onNavigate }: CartItemCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist()
  const rawPrice = item.price || 0
  const rawDiscount = item.discount_price || 0
  const hasDiscount = rawDiscount > 0 && rawDiscount < rawPrice
  const itemSalePrice = hasDiscount ? rawDiscount : rawPrice > 0 ? rawPrice : rawDiscount
  const itemOriginalPrice = hasDiscount ? rawPrice : null
  const discountPercent = hasDiscount && rawPrice > 0 ? Math.round(((rawPrice - rawDiscount) / rawPrice) * 100) : 0
  const isFavorite = isInWishlist(item.course_id)

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await toggleWishlist(item.course_id)
      toast.success(
        isFavorite
          ? isVi
            ? 'Đã xóa khỏi danh sách yêu thích'
            : 'Removed from wishlist'
          : isVi
            ? 'Đã thêm vào danh sách yêu thích'
            : 'Added to wishlist',
        isVi ? 'Yêu thích' : 'Wishlist'
      )
    } catch {
      toast.error(
        isVi ? 'Không thể cập nhật danh sách yêu thích' : 'Failed to update wishlist',
        isVi ? 'Lỗi' : 'Error'
      )
    }
  }

  const courseUrl = buildCourseUrl({ id: item.course_id, title: item.title })

  return (
    <div className="group relative rounded-2xl border border-border/80 bg-surface p-4 sm:p-5 flex flex-col md:flex-row gap-5 justify-between items-start md:items-center transition-all duration-200 hover:border-purple-500/40 hover:shadow-md">
      <div className="flex items-start gap-4 flex-1 min-w-0 w-full md:w-auto">
        <div
          onClick={() => onNavigate(courseUrl)}
          className="relative aspect-video w-32 sm:w-44 rounded-xl overflow-hidden shrink-0 border border-border/60 bg-surface-subtle cursor-pointer shadow-xs"
        >
          <img
            src={
              item.thumbnail_url ||
              'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600'
            }
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {hasDiscount && discountPercent > 0 && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-[10px] tracking-wider shadow-xs">
              -{discountPercent}%
            </span>
          )}
        </div>

        <div className="space-y-2 min-w-0 flex-1">
          {item.category && (
            <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              {item.category.replace(/_/g, ' ')}
            </span>
          )}

          <h3
            onClick={() => onNavigate(courseUrl)}
            className="text-sm sm:text-base font-bold text-text-primary line-clamp-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer leading-snug"
          >
            {item.title}
          </h3>

          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <User size={13} className="text-text-tertiary shrink-0" />
            <span className="truncate">{item.instructor_name || 'LingoSphere Academic Team'}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[11px]">
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 size={13} />
              {isVi ? 'Truy cập trọn đời' : 'Lifetime access'}
            </span>
            <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
              <Sparkles size={13} />
              {isVi ? 'Chấm chữa AI 24/7' : '24/7 AI Feedback'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 shrink-0 border-t md:border-t-0 border-border/50 pt-3 md:pt-0">
        <div className="flex md:flex-col items-baseline md:items-end gap-1.5">
          <span className="text-lg sm:text-xl font-extrabold text-text-primary tracking-tight">
            {formatCurrency(itemSalePrice, isVi ? 'Miễn phí' : 'Free')}
          </span>
          {itemOriginalPrice && (
            <span className="text-xs text-text-tertiary line-through font-medium">
              {formatCurrency(itemOriginalPrice)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleWishlist}
            className={`p-2 rounded-xl border border-border text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              isFavorite
                ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-500 border-rose-300 dark:border-rose-900/50'
                : 'bg-surface hover:bg-surface-hover text-text-secondary'
            }`}
            title={isVi ? 'Lưu vào danh sách yêu thích' : 'Save to wishlist'}
          >
            <Heart size={14} className={isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
            <span className="hidden sm:inline text-[11px] font-semibold">
              {isFavorite ? (isVi ? 'Đã thích' : 'Saved') : (isVi ? 'Lưu' : 'Save')}
            </span>
          </button>

          <button
            onClick={() => onRemove(item.course_id)}
            className="p-2 rounded-xl border border-red-200 dark:border-red-950/40 text-red-500 hover:text-white hover:bg-red-500 transition-all text-xs cursor-pointer flex items-center gap-1.5"
            title={isVi ? 'Xóa khỏi giỏ hàng' : 'Remove from cart'}
          >
            <Trash2 size={14} />
            <span className="text-[11px] font-semibold">{isVi ? 'Xóa' : 'Remove'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
