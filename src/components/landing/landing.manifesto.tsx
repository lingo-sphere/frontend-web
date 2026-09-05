/**
 * @file landing.manifesto.tsx
 * @description Thành phần Landing Manifesto phục vụ phía người học (Web Client)
 */

'use client'

/**
 * @file landing.manifesto.tsx
 * @description Component hiển thị tuyên ngôn và các chỉ số thống kê (Stats) trên Landing Page
 */

import { useEffect, useRef } from "react"
import { motion, animate, useInView } from "motion/react"
import type { LandingLocale } from "@/components/landing/landing.locales"

function StatCounter({ target, suffix = "", decimals = 0 }: { target: number; suffix?: string; decimals?: number }) {
  const nodeRef = useRef<HTMLSpanElement | null>(null)
  const isInView = useInView(nodeRef, { once: true, margin: "-40px" })

  useEffect(() => {
    if (!isInView || !nodeRef.current) return
    const controls = animate(0, target, {
      duration: 2,
      ease: "easeOut",
      onUpdate(value) {
        if (nodeRef.current) {
          nodeRef.current.textContent = `${decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toLocaleString("en-US")}${suffix}`
        }
      },
    })
    return () => controls.stop()
  }, [isInView, target, suffix, decimals])

  return <span ref={nodeRef}>{decimals > 0 ? (0).toFixed(decimals) : "0"}{suffix}</span>
}

interface LandingManifestoProps {
  t: LandingLocale
}

export function LandingManifesto({ t }: LandingManifestoProps) {
  return (
    <section id="manifesto" className="relative overflow-hidden py-40">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_rgba(47,127,120,0.12)_0%,_transparent_70%)]" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 40, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="heading-glow mb-16 font-serif text-4xl sm:text-6xl md:text-7xl font-light leading-tight tracking-tighter italic text-white/95"
        >
          {t.manifesto.title} <span className="text-[#48c9b0] teal-glow font-normal not-italic">{t.manifesto.titleHighlight}</span>.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 gap-8 sm:gap-12 border-t border-white/10 pt-16 md:grid-cols-4"
        >
          {t.stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
              className="group"
            >
              <div className="mb-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white heading-glow tracking-tight">
                <StatCounter target={stat.target} suffix={stat.suffix} decimals={stat.decimals} />
              </div>
              <div className="text-[11px] uppercase tracking-widest text-white/50 font-medium group-hover:text-[#48c9b0] transition-colors">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
