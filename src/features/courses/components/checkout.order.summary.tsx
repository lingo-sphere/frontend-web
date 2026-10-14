// Thành phần tóm tắt danh sách khóa học và tổng số tiền thanh toán trong modal checkout
import { BookOpen, CheckCircle2 } from 'lucide-react'
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
    <div className="rounded-2xl border border-border/80 bg-surface-subtle/50 p-4 space-y-3 shadow-xs">
      <div className="flex items-center justify-between text-xs font-bold text-text-secondary uppercase tracking-wider">
        <span className="flex items-center gap-1.5">
          <BookOpen size={14} className="text-purple-600 dark:text-purple-400" />
          <span>{isVi ? 'Khóa học đăng ký' : 'Selected Courses'}</span>
        </span>
        <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[11px] font-extrabold border border-purple-500/20 whitespace-nowrap">
          {courses.length} {isVi ? 'khóa' : 'items'}
        </span>
      </div>

      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
        {courses.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between gap-3 text-xs p-2.5 rounded-xl bg-surface border border-border/50"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {c.thumbnail ? (
                <img
                  src={c.thumbnail}
                  alt={c.title}
                  className="w-12 h-8 rounded-md object-cover shrink-0 border border-border/40"
                />
              ) : (
                <div className="w-8 h-8 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={15} />
                </div>
              )}
              <span className="font-semibold text-text-primary text-xs line-clamp-2 leading-snug">
                {c.title}
              </span>
            </div>
            <span className="font-bold text-text-primary shrink-0 whitespace-nowrap">
              ₫{c.price.toLocaleString('vi-VN')}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-2.5 flex items-center justify-between">
        <span className="text-xs font-bold text-text-secondary whitespace-nowrap">
          {isVi ? 'Tổng thanh toán:' : 'Total Amount:'}
        </span>
        <span className="text-lg font-black text-purple-600 dark:text-purple-400 tracking-tight whitespace-nowrap">
          {formattedTotal}
        </span>
      </div>
    </div>
  )
}
