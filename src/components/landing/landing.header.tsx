/**
 * @file landing.header.tsx
 * @description Thành phần Landing Header phục vụ phía người học (Web Client)
 */

'use client'

/**
 * @file landing.header.tsx
 * @description Component thanh điều hướng chính của trang Landing Page
 */

import Link from "next/link"
import { motion } from "motion/react"
import { LanguageSkewSwitch } from "@/components/ui/language.skew.switch"
import type { LandingLocale } from "@/components/landing/landing.locales"

interface LandingHeaderProps {
  isHeaderHidden: boolean
  isScrolled: boolean
  navItems: Array<{ href: string; label: string }>
  lang: "vi" | "en"
  toggleLang: () => void
  t: LandingLocale
  onScrollToTop: () => void
}

export function LandingHeader({
  isHeaderHidden,
  isScrolled,
  navItems,
  lang,
  toggleLang,
  t,
  onScrollToTop,
}: LandingHeaderProps) {
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{
        y: isHeaderHidden ? -110 : 0,
        opacity: isHeaderHidden ? 0 : 1,
      }}
      transition={{
        y: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.25 },
      }}
      className={`fixed left-0 top-0 z-[100] flex w-full items-center justify-between px-6 transition-all duration-500 pointer-events-auto ${
        isHeaderHidden ? "pointer-events-none" : ""
      } ${
        isScrolled
          ? "py-4 md:px-12 md:py-4.5 bg-black/80 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
          : "py-6 md:px-12 md:py-7 bg-gradient-to-b from-black/80 via-black/30 to-transparent backdrop-blur-[2px]"
      }`}
    >
      <motion.button
        initial={{ opacity: 0, x: -25 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        onClick={onScrollToTop}
        className="flex items-center gap-3 group cursor-pointer bg-transparent border-none p-0 outline-none"
        aria-label="Cuộn lên đầu trang"
      >
        <div className="h-2.5 w-2.5 rounded-full bg-[#2f7f78] shadow-[0_0_12px_#48c9b0] group-hover:scale-125 transition-transform" />
        <div className="text-xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
          LINGO <span className="font-light text-white/80 group-hover:text-[#48c9b0] transition-colors">SPHERE</span>
        </div>
      </motion.button>

      <nav className="hidden gap-10 text-[11px] font-bold uppercase tracking-[0.35em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] md:flex">
        {navItems.map((item, idx) => (
          <motion.a
            key={item.href}
            href={item.href}
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 + idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="relative transition-all hover:text-[#48c9b0] hover:scale-105"
          >
            {item.label}
          </motion.a>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="flex items-center"
        >
          <LanguageSkewSwitch lang={lang} onToggle={toggleLang} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85, x: 25 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href="/home"
            className="inline-flex items-center justify-center rounded-full border border-white/30 bg-[#2f7f78]/30 backdrop-blur-md px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-white shadow-[0_4px_20px_rgba(47,127,120,0.4)] hover:scale-105 hover:bg-[#2f7f78] hover:text-white hover:border-[#2f7f78] transition-all cursor-pointer active:scale-95"
          >
            {t.nav.enterStudio}
          </Link>
        </motion.div>
      </div>
    </motion.header>
  )
}
