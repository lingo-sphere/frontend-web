/**
 * @file welcome.banner.tsx
 * @description Banner chào mừng học viên, hiển thị streak, mục tiêu học tập hàng ngày và thông điệp động lực
 */

'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { useAuthStore } from '@/store/auth.store'

export function WelcomeBanner() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const { user, isAuthenticated } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getGreeting = () => {
    if (!mounted) return isVietnamese ? 'Chào bạn' : 'Welcome'
    const hour = new Date().getHours()
    if (isVietnamese) {
      if (hour < 12) return 'Chào buổi sáng'
      if (hour < 18) return 'Chào buổi chiều'
      return 'Chào buổi tối'
    }
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const studentName = mounted && isAuthenticated && user?.full_name
    ? user.full_name.split(' ').pop()
    : isVietnamese ? 'bạn' : 'Learner'

  return (
    <motion.section
      aria-labelledby="dashboard-title"
      className="flex min-h-[142px] items-center justify-between overflow-hidden rounded-2xl border border-primary/15 bg-primary-soft px-5 sm:px-8"
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      viewport={{ once: true, amount: 0.25 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">{t('dashboard.continueLearning')}</p>
        <h1 className="mt-2 text-h1 text-text-primary" id="dashboard-title" suppressHydrationWarning>
          {getGreeting()}, {studentName} 👋
        </h1>
        <p className="mt-1 text-[14px] text-text-secondary">
          {isVietnamese
            ? 'Sẵn sàng tiếp tục hành trình học tiếng Anh?'
            : 'Ready to continue your English journey?'}
        </p>
      </div>
      <img alt="Capybara mascot" className="mt-8 h-[120px] w-[120px] shrink-0 object-contain sm:h-[142px] sm:w-[142px]" height="142" src="/assets/capybara-mascot.png" width="142" />
    </motion.section>
  )
}
