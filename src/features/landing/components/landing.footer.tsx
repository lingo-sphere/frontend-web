/**
 * @file landing.footer.tsx
 * @description Component chân trang (Footer) của Landing Page
 */

'use client'

import Link from "next/link"
import { motion } from "motion/react"
import type { LandingLocale } from "@/features/landing/components/landing.locales"

interface LandingFooterProps {
  t: LandingLocale
}

export function LandingFooter({ t }: LandingFooterProps) {
  return (
    <footer id="stargazer" className="relative overflow-hidden bg-gradient-to-b from-[oklch(20%_0.08_280)] via-black/90 to-black px-6 sm:px-12 pt-16 pb-10 border-t border-white/10">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-32 w-full max-w-4xl bg-[radial-gradient(ellipse_at_top,_rgba(72,201,176,0.18),_transparent_70%)]" />

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, x: -35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-5 lg:col-span-5"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            {t.footer.tag}
          </div>
          <h2 className="heading-glow text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {t.footer.title}
          </h2>
          <p className="max-w-md text-sm text-white/60 leading-relaxed">
            {t.footer.subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link href="/home">
              <button className="rounded-xl bg-emerald-500 px-7 py-3.5 text-[11px] font-black uppercase tracking-widest text-slate-950 hover:bg-emerald-400 transition-all cursor-pointer shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95">
                {t.footer.btnEnter}
              </button>
            </Link>
            <Link href="/toeic">
              <button className="rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/10 hover:border-white/40 transition-all cursor-pointer hover:scale-105 active:scale-95">
                {t.footer.btnToeic}
              </button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:col-span-7 pt-2"
        >
          <div className="space-y-3">
            <div className="text-[11px] uppercase tracking-[0.25em] text-[#48c9b0] font-bold">{t.footer.colCourses}</div>
            <ul className="space-y-2.5 text-xs text-white/60">
              <li><Link href="/courses" className="hover:text-white transition-colors">{t.footer.course1}</Link></li>
              <li><Link href="/courses" className="hover:text-white transition-colors">{t.footer.course2}</Link></li>
              <li><Link href="/speaking" className="hover:text-white transition-colors">{t.footer.course3}</Link></li>
              <li><Link href="/vocabulary" className="hover:text-white transition-colors">{t.footer.course4}</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-[11px] uppercase tracking-[0.25em] text-[#48c9b0] font-bold">{t.footer.colPractice}</div>
            <ul className="space-y-2.5 text-xs text-white/60">
              <li><Link href="/toeic" className="hover:text-white transition-colors">{t.footer.prac1}</Link></li>
              <li><Link href="/listening" className="hover:text-white transition-colors">{t.footer.prac2}</Link></li>
              <li><Link href="/writing" className="hover:text-white transition-colors">{t.footer.prac3}</Link></li>
              <li><Link href="/grammar" className="hover:text-white transition-colors">{t.footer.prac4}</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-[11px] uppercase tracking-[0.25em] text-[#48c9b0] font-bold">{t.footer.colSystem}</div>
            <ul className="space-y-2.5 text-xs text-white/60">
              <li><Link href="/about" className="hover:text-white transition-colors">{t.footer.sys1}</Link></li>
              <li><Link href="/leaderboard" className="hover:text-white transition-colors">{t.footer.sys2}</Link></li>
              <li><Link href="/leaderboard" className="hover:text-white transition-colors">{t.footer.sys3}</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">{t.footer.sys4}</Link></li>
            </ul>
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl border-t border-white/10 mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
        <div>{t.footer.copyright}</div>
        <div className="flex items-center gap-6">
          <Link href="/blog" className="hover:text-white transition-colors">Cẩm Nang TOEIC</Link>
          <Link href="/about" className="hover:text-white transition-colors">Về LingoSphere</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Chính Sách Bảo Mật</Link>
          <span className="hover:text-white transition-colors cursor-pointer">System Operational</span>
        </div>
      </div>
    </footer>
  )
}
