// Component nút cuộn lên đầu trang kèm vòng tròn tiến trình cuộn cho giao diện web.
'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowUp } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tooltip'

const emptySubscribe = () => () => {}

interface ScrollToTopButtonProps {
  embedded?: boolean
}

export function ScrollToTopButton({ embedded = false }: ScrollToTopButtonProps) {
  const pathname = usePathname() || '/'
  const { t } = useTranslation()
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false)

  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    setIsVisible(false)
    setScrollProgress(0)

    let ticking = false

    const updateScroll = () => {
      const winScroll = window.scrollY || document.documentElement.scrollTop || 0
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const currentProgress = docHeight > 0 ? Math.min(Math.max(winScroll / docHeight, 0), 1) : 0

      setIsVisible(winScroll > 300)
      setScrollProgress(currentProgress)
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    updateScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [pathname])

  if (!isMounted || pathname === '/') {
    return null
  }

  const isStandalone =
    pathname.startsWith('/verify-email') ||
    pathname.startsWith('/course/')

  const positionClasses = embedded
    ? 'relative flex items-center justify-center'
    : isStandalone
      ? 'fixed bottom-6 right-6 z-40 flex items-center justify-center'
      : 'fixed bottom-[152px] right-[27px] z-40 flex items-center justify-center'

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const radius = 19.5
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - scrollProgress)

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 12 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className={positionClasses}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleScrollToTop}
                aria-label={t('common.scrollToTop')}
                className="group relative flex h-[46px] w-[46px] items-center justify-center cursor-pointer transition-transform duration-150 hover:scale-105 active:scale-95"
              >
                <svg
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  viewBox="0 0 46 46"
                >
                  <circle
                    cx="23"
                    cy="23"
                    r={radius}
                    fill="none"
                    className="stroke-slate-300/70 dark:stroke-slate-700/70"
                    strokeWidth="2.5"
                  />
                  <circle
                    cx="23"
                    cy="23"
                    r={radius}
                    fill="none"
                    className="stroke-primary dark:stroke-teal-400 transition-[stroke-dashoffset] duration-150 ease-out"
                    strokeWidth="2.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 23 23)"
                  />
                </svg>

                <span className="absolute inset-[3.5px] flex items-center justify-center rounded-full border border-border/80 bg-surface/95 text-primary shadow-lg shadow-slate-900/10 backdrop-blur-md transition-all duration-200 group-hover:bg-primary group-hover:text-white dark:border-teal-500/30 dark:bg-slate-900/95 dark:text-teal-400 dark:shadow-[0_4px_20px_rgba(45,212,191,0.25)] dark:group-hover:bg-teal-500 dark:group-hover:text-slate-950">
                  <ArrowUp className="h-4.5 w-4.5 stroke-[2.4] transition-transform duration-200 group-hover:-translate-y-0.5" />
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" sideOffset={10}>
              <span className="text-xs font-medium">{t('common.scrollToTop')}</span>
            </TooltipContent>
          </Tooltip>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
