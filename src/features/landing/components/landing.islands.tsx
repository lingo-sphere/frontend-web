/**
 * @file landing.islands.tsx
 * @description Component hiển thị các trụ cột tính năng chính (Islands) trên Landing Page
 */

'use client'

import { motion } from "motion/react"
import { ElectricBorder } from "@/components/electric.border"
import { CurvedLoop } from "@/components/curved.loop"
import type { LandingLocale } from "@/features/landing/components/landing.locales"

interface IslandItem {
  node: string
  title: string
  description: string
  electricColor: string
  topOffset: string
}

interface LandingIslandsProps {
  t: LandingLocale
  islandsData: IslandItem[]
}

export function LandingIslands({ t, islandsData }: LandingIslandsProps) {
  return (
    <section id="islands" className="relative px-6 py-36 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mb-14 text-center relative z-20"
      >
        <span className="teal-glow mb-2 block text-[11px] uppercase tracking-[0.5em] text-[#48c9b0] font-bold">
          {t.pillars.tag}
        </span>

        <CurvedLoop
          marqueeText={t.marquee}
          speed={2}
          fontSize={62}
          curveAmount={140}
          direction="left"
          interactive
          className="tracking-wider fill-white drop-shadow-[0_0_35px_rgba(94,234,212,0.8)]"
          wrapperClassName="my-[-10px] max-w-7xl mx-auto"
        />
      </motion.div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 items-stretch pb-12">
        {islandsData.map((item, idx) => (
          <motion.div
            key={item.node}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.75,
              delay: idx * 0.12,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className={["group relative h-full flex flex-col cursor-pointer", item.topOffset].join(" ")}
          >
            <ElectricBorder
              color={item.electricColor}
              speed={1.2}
              chaos={0.14}
              borderRadius={32}
              className="h-full w-full"
            >
              <div className="glass-card relative h-full overflow-hidden rounded-[32px] p-8 flex flex-col justify-between min-h-[340px] bg-[oklch(18%_0.06_280/0.8)] backdrop-blur-2xl transition-all duration-500 hover:shadow-2xl">
                <div
                  className="absolute -top-20 -right-20 h-40 w-40 blur-[80px] transition-all opacity-30 group-hover:opacity-60"
                  style={{ backgroundColor: item.electricColor }}
                />
                <div className="relative z-10">
                  <div
                    className="mb-6 font-mono text-[11px] font-bold tracking-widest"
                    style={{ color: item.electricColor }}
                  >
                    {item.node}
                  </div>
                  <h4 className="mb-4 text-xl font-bold tracking-tight text-white transition-colors">
                    {item.title}
                  </h4>
                  <p className="mb-8 text-xs sm:text-sm leading-relaxed text-white/70">{item.description}</p>
                </div>
                <div className="relative z-10 flex gap-2 items-center">
                  <div className="h-[1px] w-8 bg-white/30 group-hover:w-12 transition-all" />
                  <div
                    className="h-[2px] w-3 rounded-full transition-all"
                    style={{ backgroundColor: item.electricColor }}
                  />
                </div>
              </div>
            </ElectricBorder>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
