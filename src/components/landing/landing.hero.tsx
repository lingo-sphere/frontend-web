'use client'

/**
 * @file landing.hero.tsx
 * @description Component Hero banner chính của Landing Page bao gồm nền video và CTA
 */

import React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { SpecularButton } from "@/components/ui/specular.button"
import type { LandingLocale } from "@/components/landing/landing-locales"

interface LandingHeroProps {
  t: LandingLocale
  heroVideoContainerRef: React.RefObject<HTMLDivElement | null>
  videoARef: React.RefObject<HTMLVideoElement | null>
  videoBRef: React.RefObject<HTMLVideoElement | null>
  activeVideo: "A" | "B"
  onVideoTimeUpdate: (e: React.SyntheticEvent<HTMLVideoElement>) => void
  onScrollToWorkbench: () => void
}

export function LandingHero({
  t,
  heroVideoContainerRef,
  videoARef,
  videoBRef,
  activeVideo,
  onVideoTimeUpdate,
  onScrollToWorkbench,
}: LandingHeroProps) {
  return (
    <section className="relative flex h-screen w-full max-w-full items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,_rgba(72,201,176,0.18)_0%,_transparent_70%)] blur-[100px] animate-pulse" />

      <motion.div
        ref={heroVideoContainerRef}
        initial={{ opacity: 0, scale: 1.14 }}
        animate={{ opacity: 1, scale: 1.07 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 z-0 overflow-hidden"
      >
        <video
          ref={videoARef}
          src="/video-banner.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          onTimeUpdate={activeVideo === "A" ? onVideoTimeUpdate : undefined}
          className={`hero-mask absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ease-in-out ${
            activeVideo === "A" ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        />
        <video
          ref={videoBRef}
          src="/video-banner.mp4"
          muted
          playsInline
          preload="auto"
          onTimeUpdate={activeVideo === "B" ? onVideoTimeUpdate : undefined}
          className={`hero-mask absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ease-in-out ${
            activeVideo === "B" ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        />
      </motion.div>

      <div className="relative z-10 px-4 sm:px-6 text-center w-full max-w-6xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 25, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2.5 rounded-full border border-[#48c9b0]/30 bg-black/50 px-4 py-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-[#5eead4] backdrop-blur-md shadow-[0_0_20px_rgba(72,201,176,0.2)] mb-6 select-none"
        >
          <span className="h-2 w-2 rounded-full bg-[#5eead4] shadow-[0_0_8px_#5eead4] animate-pulse" />
          {t.hero.tag}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 45, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="hero-gradient-flow mb-8 font-serif font-light italic text-4xl sm:text-6xl md:text-7xl lg:text-[5.2rem] xl:text-[5.8rem] leading-[1.1] tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] drop-shadow-[0_0_45px_rgba(94,234,212,0.45)] select-none flex flex-col items-center max-w-full overflow-hidden text-center"
        >
          <span className="block max-w-full">{t.hero.title1}</span>
          <span className="block max-w-full">{t.hero.title2}</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.1, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl rounded-3xl border border-white/10 p-8 backdrop-blur-[2px] bg-black/5 shadow-lg"
        >
          <p className="mb-8 font-serif text-lg md:text-xl leading-relaxed font-light italic text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            {t.hero.quote}
          </p>
          <Link href="/home" className="inline-block">
            <SpecularButton
              size="lg"
              radius={20}
              tint="#2f7f78"
              tintOpacity={0.35}
              blur={16}
              textColor="#ffffff"
              lineColor="#5eead4"
              baseColor="#2f7f78"
              intensity={1.3}
              shineSize={12}
              shineFade={45}
              thickness={1.5}
              speed={0.4}
              followMouse
              proximity={320}
              autoAnimate
              className="font-black tracking-[0.3em] text-[12px] sm:text-[13px] px-10 py-5"
            >
              {t.hero.btnStart}
            </SpecularButton>
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{
          opacity: { delay: 1.1, duration: 1 },
          y: { repeat: Infinity, duration: 2.2, ease: "easeInOut", delay: 1.1 },
        }}
        onClick={onScrollToWorkbench}
        className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3 cursor-pointer select-none group"
      >
        <div className="h-10 w-px bg-gradient-to-b from-[#5eead4] to-transparent group-hover:h-14 transition-all" />
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/80 font-medium group-hover:text-[#5eead4] transition-colors">
          {t.hero.scrollPrompt}
        </span>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[oklch(20%_0.08_280)] via-[oklch(20%_0.08_280)]/75 to-transparent z-10" />
    </section>
  )
}
