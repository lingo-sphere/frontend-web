'use client'

/**
 * @file ToastContainer.tsx
 * @description Component hiển thị thông báo Toast với animation mượt mà cho học viên
 */

import { useToastStore, type ToastType } from '@/store/toast-store'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

function ToastIcon({ type }: { type: ToastType }) {
  switch (type) {
    case 'success':
      return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
    case 'error':
      return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
    case 'info':
    default:
      return <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
  }
}

const typeStyles: Record<ToastType, string> = {
  success:
    'border-emerald-500/30 bg-surface/95 text-text-primary shadow-emerald-500/10 dark:bg-zinc-900/95 dark:border-emerald-500/30',
  error:
    'border-rose-500/30 bg-surface/95 text-text-primary shadow-rose-500/10 dark:bg-zinc-900/95 dark:border-rose-500/30',
  warning:
    'border-amber-500/30 bg-surface/95 text-text-primary shadow-amber-500/10 dark:bg-zinc-900/95 dark:border-amber-500/30',
  info:
    'border-sky-500/30 bg-surface/95 text-text-primary shadow-sky-500/10 dark:bg-zinc-900/95 dark:border-sky-500/30',
}

const badgeStyles: Record<ToastType, string> = {
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  error: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
}

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts)
  const removeToast = useToastStore((state) => state.removeToast)

  return (
    <div
      className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-4"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.15 } }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border backdrop-blur-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 ${typeStyles[item.type]}`}
          >
            <div className={`p-1 rounded-xl ${badgeStyles[item.type]}`}>
              <ToastIcon type={item.type} />
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              {item.title && (
                <h4 className="text-xs sm:text-sm font-bold text-text-primary leading-tight mb-1">
                  {item.title}
                </h4>
              )}
              <p className="text-xs text-text-secondary leading-relaxed break-words font-medium">
                {item.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(item.id)}
              className="text-text-tertiary hover:text-text-primary p-1 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer shrink-0"
              aria-label="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
