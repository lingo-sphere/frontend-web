/**
 * @file landing.lanyard.section.tsx
 * @description Component hiển thị phần trải nghiệm thẻ học viên 3D (Lanyard) trên Landing Page
 */

'use client'

import { motion } from "motion/react"
import { Lanyard } from "@/components/ui/lanyard"
import type { LandingLocale } from "@/components/landing/landing.locales"

interface LandingLanyardSectionProps {
  t: LandingLocale
  lang: "vi" | "en"
}

export function LandingLanyardSection({ t, lang }: LandingLanyardSectionProps) {
  return (
    <section className="relative overflow-hidden pt-20 pb-10 px-0 text-center border-t border-white/10 bg-gradient-to-b from-black/40 via-[oklch(20%_0.08_280)] to-[oklch(18%_0.08_280)]">
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-[radial-gradient(circle,_rgba(94,234,212,0.12)_0%,_transparent_70%)] blur-[100px]" />

      <div className="relative z-10 max-w-4xl mx-auto mb-4 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8 }}
        >
          <span className="teal-glow mb-2 block text-[11px] uppercase tracking-[0.4em] text-[#48c9b0] font-bold">
            {t.lanyard.tag}
          </span>
          <h3 className="heading-glow text-2xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            {t.lanyard.title}
          </h3>
          <p className="text-xs sm:text-sm text-white/60 max-w-md mx-auto">
            {t.lanyard.subtitle}
          </p>
        </motion.div>
      </div>

      <Lanyard lang={lang} destinationUrl="/home" />
    </section>
  )
}
