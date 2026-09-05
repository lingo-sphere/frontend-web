'use client'

/**
 * @file landing.workbench.tsx
 * @description Component hiển thị phương pháp học tập tương tác sâu của Landing Page
 */

import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"
import type { LandingLocale } from "@/components/landing/landing-locales"

function SeamlessCircleVideo() {
  const v1Ref = useRef<HTMLVideoElement | null>(null)
  const v2Ref = useRef<HTMLVideoElement | null>(null)
  const [activeVideo, setActiveVideo] = useState<1 | 2>(1)
  const crossfadeTriggeredRef = useRef(false)

  useEffect(() => {
    const v1 = v1Ref.current
    const v2 = v2Ref.current
    if (!v1 || !v2) return

    v1.play().catch(() => {})

    const checkTime = (e: Event) => {
      const vid = e.target as HTMLVideoElement
      const dur = vid.duration
      if (!dur || isNaN(dur)) return

      if (dur - vid.currentTime <= 1.8 && !crossfadeTriggeredRef.current) {
        crossfadeTriggeredRef.current = true
        if (activeVideo === 1) {
          v2.currentTime = 0
          v2.play().catch(() => {})
          setActiveVideo(2)
        } else {
          v1.currentTime = 0
          v1.play().catch(() => {})
          setActiveVideo(1)
        }
      } else if (dur - vid.currentTime > 2.2) {
        crossfadeTriggeredRef.current = false
      }
    }

    v1.addEventListener("timeupdate", checkTime)
    v2.addEventListener("timeupdate", checkTime)

    return () => {
      v1.removeEventListener("timeupdate", checkTime)
      v2.removeEventListener("timeupdate", checkTime)
    }
  }, [activeVideo])

  return (
    <div className="relative h-full w-full rounded-full overflow-hidden">
      <video
        ref={v1Ref}
        src="/video-contact.mp4"
        autoPlay
        muted
        playsInline
        className={`absolute inset-0 h-full w-full rounded-full object-cover transition-opacity duration-700 ease-in-out ${
          activeVideo === 1 ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <video
        ref={v2Ref}
        src="/video-contact.mp4"
        muted
        playsInline
        className={`absolute inset-0 h-full w-full rounded-full object-cover transition-opacity duration-700 ease-in-out ${
          activeVideo === 2 ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
    </div>
  )
}

interface LandingWorkbenchProps {
  t: LandingLocale
}

export function LandingWorkbench({ t }: LandingWorkbenchProps) {
  return (
    <section id="workbench" className="relative px-6 pt-32 pb-10 md:px-24 md:pt-36 md:pb-12">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-20 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10"
        >
          <h2 className="heading-glow mb-8 text-4xl sm:text-5xl font-bold tracking-tighter leading-tight text-white">
            {t.method.title}
            <br />
            <span className="font-serif font-light italic text-[#48c9b0] teal-glow">{t.method.highlight}</span> {t.method.suffix}
          </h2>
          <p className="mb-12 max-w-md text-base sm:text-lg leading-relaxed text-white/60">
            {t.method.desc}
          </p>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group flex cursor-help items-center gap-6"
            >
              <div className="glass-card flex h-12 w-12 items-center justify-center rounded-2xl transition-colors group-hover:text-[#48c9b0] font-bold text-sm">
                01
              </div>
              <div className="h-px flex-1 bg-white/10 transition-all group-hover:bg-[#2f7f78]/40" />
              <span className="text-[11px] uppercase tracking-[0.2em] opacity-60 font-semibold group-hover:opacity-100 transition-opacity">
                {t.method.step1}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="group flex cursor-help items-center gap-6"
            >
              <div className="glass-card flex h-12 w-12 items-center justify-center rounded-2xl transition-colors group-hover:text-[#48c9b0] font-bold text-sm">
                02
              </div>
              <div className="h-px flex-1 bg-white/10 transition-all group-hover:bg-[#2f7f78]/40" />
              <span className="text-[11px] uppercase tracking-[0.2em] opacity-60 font-semibold group-hover:opacity-100 transition-opacity">
                {t.method.step2}
              </span>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.88, rotate: -2 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-center"
        >
          <div className="relative h-[360px] w-[360px] sm:h-[420px] sm:w-[420px] aspect-square rounded-full overflow-hidden border border-[#48c9b0]/30 shadow-[0_0_50px_rgba(72,201,176,0.35),0_0_90px_rgba(47,127,120,0.2),0_16px_40px_rgba(0,0,0,0.7)]">
            <SeamlessCircleVideo />
            <div className="absolute inset-0 rounded-full bg-white/[0.04] pointer-events-none" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30, x: 20 }}
            whileInView={{ opacity: 1, y: 0, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="vellum-overlay absolute bottom-2 right-0 sm:right-4 max-w-[210px] rounded-2xl border border-[#48c9b0]/30 p-5 backdrop-blur-xl bg-black/60 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_25px_rgba(72,201,176,0.25)]"
          >
            <span className="font-serif font-medium mb-1.5 block text-lg italic text-[#5eead4] drop-shadow-[0_0_12px_rgba(94,234,212,0.85)]">
              {t.method.deepFocus}
            </span>
            <p className="text-[10px] uppercase tracking-wider text-white/90 font-bold leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
              {t.method.deepFocusDesc}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
