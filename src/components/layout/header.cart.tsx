/**
 * @file header.cart.tsx
 * @description Thành phần Header Cart phục vụ phía người học (Web Client)
 */

'use client'

/**
 * @file HeaderCartHover.tsx
 * @description Component giao diện React HeaderCartHover cho học viên
 */

import { useTranslation } from 'react-i18next'
import { useNavigate } from '@/lib/navigation'
import { useCartStore } from '@/store/cart.store'

export function HeaderCartHover() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const navigate = useNavigate()
  const { cart } = useCartStore()

  const items = cart?.items || []
  const totalAmount = items.reduce(
    (acc, it) => acc + (it.discount_price && it.discount_price > 0 ? it.discount_price : it.price || 0),
    0
  )

  return (
    <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl border border-border bg-surface shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-left">
      {items.length === 0 ? (
        <div className="py-8 px-6 text-center space-y-3">
          <p className="text-sm text-text-secondary font-medium">
            {isVi ? 'Giỏ hàng của bạn đang trống.' : 'Your cart is empty.'}
          </p>
          <button
            onClick={() => navigate('/courses')}
            className="text-xs font-bold text-primary hover:underline cursor-pointer block mx-auto"
          >
            {isVi ? 'Khám phá khóa học' : 'Keep shopping'}
          </button>
        </div>
      ) : (
        <>
          <div className="divide-y divide-border/60 max-h-[340px] overflow-y-auto">
            {items.map((item) => {
              const itemPrice =
                item.discount_price && item.discount_price > 0
                  ? item.discount_price
                  : item.price || 0

              return (
                <div
                  key={item.course_id}
                  onClick={() => navigate('/cart')}
                  className="flex items-start gap-3 p-3 hover:bg-surface-subtle transition-colors cursor-pointer group"
                >
                  <img
                    src={
                      item.thumbnail_url ||
                      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'
                    }
                    alt={item.title}
                    className="h-12 w-12 rounded-xl object-cover shrink-0 border border-border/60"
                  />
                  <div className="flex-1 space-y-1 min-w-0">
                    <h4 className="text-xs font-bold text-text-primary line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    <span className="text-xs font-extrabold text-text-primary block">
                      ₫{itemPrice.toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="p-3.5 border-t border-border bg-surface-subtle/30 space-y-2.5">
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-semibold text-text-secondary">
                {isVi ? 'Tổng thanh toán:' : 'Total:'}
              </span>
              <span className="text-sm font-extrabold text-primary">
                ₫{totalAmount.toLocaleString('vi-VN')}
              </span>
            </div>

            <button
              onClick={() => navigate('/cart')}
              className="w-full rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs py-2.5 transition-colors shadow-sm shadow-primary/20 cursor-pointer text-center"
            >
              {isVi ? 'Đến giỏ hàng' : 'Go to cart'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
