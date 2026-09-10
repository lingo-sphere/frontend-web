// Thành phần tóm tắt danh sách khóa học và tổng số tiền thanh toán trong modal checkout.

import { BookOpen } from 'lucide-react'
import type { CheckoutCourseItem } from '@/features/courses/components/course.checkout.modal'

interface CheckoutOrderSummaryProps {
  courses: CheckoutCourseItem[]
  formattedTotal: string
  isVi: boolean
}

export function CheckoutOrderSummary({
  courses,
  formattedTotal,
  isVi,
}: CheckoutOrderSummaryProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface-subtle/50 p-3.5 space-y-2.5">
      <div className="flex items-center justify-between text-xs font-bold text-text-secondary uppercase tracking-wider">
        <span>{isVi ? 'Khóa học đăng ký' : 'Selected Courses'}</span>
        <span className="text-primary">
          {courses.length} {isVi ? 'khóa' : 'items'}
        </span>
      </div>

      <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
        {courses.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-text-primary truncate flex-1 flex items-center gap-1.5">
              <BookOpen size={12} className="text-primary shrink-0" />
              <span className="truncate">{c.title}</span>
            </span>
            <span className="font-bold text-text-secondary shrink-0">
              ₫{c.price.toLocaleString('vi-VN')}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-2 flex items-center justify-between">
        <span className="text-xs font-bold text-text-primary">
          {isVi ? 'Tổng thanh toán:' : 'Total:'}
        </span>
        <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
          {formattedTotal}
        </span>
      </div>
    </div>
  )
}
