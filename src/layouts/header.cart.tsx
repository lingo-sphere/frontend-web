// Component dropdown hiển thị tóm tắt giỏ hàng người dùng trên thanh điều hướng Header.
'use client'

import { useTranslation } from 'react-i18next'
import { useNavigate } from '@/lib/navigation'
import { useCartQuery } from '@/features/cart/hooks/use.cart.query'
import { formatCurrency } from '@/lib/format'

interface HeaderCartHoverProps {
  isOpen: boolean
}

export function HeaderCartHover({ isOpen }: HeaderCartHoverProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const navigate = useNavigate()
  const { data: cart } = useCartQuery()

  const items = cart?.items || []
  const totalAmount = items.reduce(
    (acc, it) => acc + (it.discount_price && it.discount_price > 0 ? it.discount_price : it.price || 0),
    0
  )

  return (
    <div
      className={`absolute right-0 top-full pt-2 z-50 transition-all duration-200 ease-out origin-top-right ${
        isOpen
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto visible'
          : 'opacity-0 -translate-y-2 scale-[0.98] pointer-events-none invisible duration-150 ease-in'
      }`}
    >
      <div className="w-72 sm:w-80 rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden text-left">
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
                      {formatCurrency(itemPrice)}
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
                {formatCurrency(totalAmount)}
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
    </div>
  )
}
