/**
 * @file lingo.performance.tsx
 * @description Thành phần Lingo Performance phục vụ phía người học (Web Client)
 */

'use client'

/**
 * @file LingoPerformance.tsx
 * @description Component giao diện React LingoPerformance cho học viên
 */

import { useRef } from "react"
import { motion, useScroll, useTransform } from "motion/react"
import {
  Brain,
  Mic,
  Award,
  Zap,
  Layers,
  Flame,
  CheckCircle2,
  Volume2,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { landingLocales, type LandingLang } from "@/components/landing/landing.locales"

interface LingoPerformanceProps {
  lang?: LandingLang
}

export function LingoPerformance({ lang = "vi" }: LingoPerformanceProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const t = landingLocales[lang]?.performance || landingLocales.vi.performance

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  const p1X = useTransform(scrollYProgress, [0.15, 0.52], [-40, -520])
  const p1Y = useTransform(scrollYProgress, [0.15, 0.52], [40, -230])
  const p1Rotate = useTransform(scrollYProgress, [0.15, 0.52], [0, -8])
  const p1Scale = useTransform(scrollYProgress, [0.15, 0.45], [0.75, 1.05])
  const p1Opacity = useTransform(scrollYProgress, [0.15, 0.35], [0, 1])

  const p2X = useTransform(scrollYProgress, [0.15, 0.52], [40, 520])
  const p2Y = useTransform(scrollYProgress, [0.15, 0.52], [40, -220])
  const p2Rotate = useTransform(scrollYProgress, [0.15, 0.52], [0, 7])
  const p2Scale = useTransform(scrollYProgress, [0.15, 0.45], [0.75, 1.05])
  const p2Opacity = useTransform(scrollYProgress, [0.15, 0.35], [0, 1])

  const p3X = useTransform(scrollYProgress, [0.15, 0.52], [50, 560])
  const p3Y = useTransform(scrollYProgress, [0.15, 0.52], [20, 75])
  const p3Rotate = useTransform(scrollYProgress, [0.15, 0.52], [0, -4])
  const p3Scale = useTransform(scrollYProgress, [0.15, 0.45], [0.75, 1.05])
  const p3Opacity = useTransform(scrollYProgress, [0.18, 0.38], [0, 1])

  const p4X = useTransform(scrollYProgress, [0.15, 0.52], [30, 420])
  const p4Y = useTransform(scrollYProgress, [0.15, 0.52], [-10, 320])
  const p4Rotate = useTransform(scrollYProgress, [0.15, 0.52], [0, 5])
  const p4Scale = useTransform(scrollYProgress, [0.15, 0.45], [0.75, 1.05])
  const p4Opacity = useTransform(scrollYProgress, [0.2, 0.4], [0, 1])

  const p5X = useTransform(scrollYProgress, [0.15, 0.52], [-50, -560])
  const p5Y = useTransform(scrollYProgress, [0.15, 0.52], [20, 65])
  const p5Rotate = useTransform(scrollYProgress, [0.15, 0.52], [0, 5])
  const p5Scale = useTransform(scrollYProgress, [0.15, 0.45], [0.75, 1.05])
  const p5Opacity = useTransform(scrollYProgress, [0.18, 0.38], [0, 1])

  const p6X = useTransform(scrollYProgress, [0.15, 0.52], [-30, -400])
  const p6Y = useTransform(scrollYProgress, [0.15, 0.52], [-10, 310])
  const p6Rotate = useTransform(scrollYProgress, [0.15, 0.52], [0, -5])
  const p6Scale = useTransform(scrollYProgress, [0.15, 0.45], [0.75, 1.05])
  const p6Opacity = useTransform(scrollYProgress, [0.2, 0.4], [0, 1])

  const centerScale = useTransform(scrollYProgress, [0.15, 0.5], [0.9, 1.08])

  return (
    <section
      ref={sectionRef}
      id="performance"
      className="relative z-20 w-full max-w-full overflow-hidden bg-[oklch(20%_0.08_280)] pt-14 pb-28 px-4 sm:px-6"
    >
      
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[1200px] rounded-full bg-[radial-gradient(circle,_rgba(72,201,176,0.16)_0%,_transparent_70%)] blur-[160px]" />

      <div className="mx-auto max-w-[1500px]">
        
        <div className="text-center mb-2.5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#48c9b0]/30 bg-black/60 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-[#5eead4] backdrop-blur-md shadow-[0_0_20px_rgba(72,201,176,0.2)] mb-3"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#5eead4] animate-pulse" />
            {t.tag}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="heading-glow text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight"
          >
            {t.title1}{" "}
            <span className="font-serif font-light italic text-[#48c9b0]">{t.title2}</span>
          </motion.h2>
        </div>

        
        <div className="relative h-[660px] sm:h-[760px] md:h-[840px] w-full flex items-center justify-center -mt-6 sm:-mt-8">
          
          <motion.div
            style={{ scale: centerScale }}
            className="relative z-10 flex flex-col items-center justify-center h-72 w-72 sm:h-88 sm:w-88 rounded-full border border-[#48c9b0]/50 bg-black/75 backdrop-blur-3xl shadow-[0_0_80px_rgba(72,201,176,0.45),inset_0_0_40px_rgba(72,201,176,0.25)] text-center p-8"
          >
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl bg-gradient-to-tr from-[#2f7f78] to-[#5eead4] flex items-center justify-center shadow-[0_0_40px_rgba(94,234,212,0.7)] mb-5 animate-pulse">
              <Brain className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
            </div>
            <h4 className="text-xl sm:text-2xl font-black text-white tracking-wider">
              LINGO CORE AI
            </h4>
            <p className="text-[12px] uppercase tracking-widest text-[#5eead4] font-bold mt-1">
              {t.coreEngine}
            </p>
            <div className="mt-4 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[10px] font-mono text-white/90 shadow-inner">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              {t.coreActive}
            </div>
          </motion.div>

          
          <motion.div
            style={{
              x: p1X,
              y: p1Y,
              rotate: p1Rotate,
              scale: p1Scale,
              opacity: p1Opacity,
            }}
            className="absolute z-20 w-72 sm:w-80 md:w-[350px] rounded-3xl border border-white/20 bg-black/70 backdrop-blur-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_30px_rgba(72,201,176,0.15)] hover:border-[#48c9b0]/60 transition-all"
          >
            <div className="flex items-center justify-between text-xs text-white/70 mb-3">
              <span className="flex items-center gap-2 font-bold text-[#48c9b0]">
                <Brain className="h-4 w-4" /> {t.card1Title}
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/25 text-emerald-300 px-2.5 py-1 rounded-full font-semibold">
                {t.card1Badge}
              </span>
            </div>
            <div className="text-2xl font-black text-white">{t.card1Word}</div>
            <div className="text-sm font-mono text-[#5eead4] mt-0.5">{t.card1Phonetic}</div>
            <p className="text-xs text-white/75 mt-2 leading-relaxed">
              {t.card1Desc}
            </p>
            <div className="mt-4 flex items-center justify-between text-xs text-white/60 border-t border-white/10 pt-3 font-mono">
              <span>{t.card1Retention}</span>
              <span className="text-[#48c9b0] font-bold">{t.card1Review}</span>
            </div>
          </motion.div>

          
          <motion.div
            style={{
              x: p2X,
              y: p2Y,
              rotate: p2Rotate,
              scale: p2Scale,
              opacity: p2Opacity,
            }}
            className="absolute z-20 w-72 sm:w-80 md:w-[350px] rounded-3xl border border-white/20 bg-black/70 backdrop-blur-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_30px_rgba(72,201,176,0.15)] hover:border-[#48c9b0]/60 transition-all"
          >
            <div className="flex items-center justify-between text-xs text-white/70 mb-3">
              <span className="flex items-center gap-2 font-bold text-[#48c9b0]">
                <Mic className="h-4 w-4" /> {t.card2Title}
              </span>
              <span className="text-[10px] font-mono bg-cyan-500/25 text-cyan-300 px-2.5 py-1 rounded-full font-semibold">
                {t.card2Badge}
              </span>
            </div>
            <div className="flex items-center gap-3 my-3">
              <Volume2 className="h-5 w-5 text-[#5eead4] shrink-0" />
              <div className="flex-1 flex items-center gap-1.5 h-7">
                {[40, 80, 55, 95, 70, 100, 60, 85, 45, 90, 65, 35, 75, 90].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className="w-1.5 rounded-full bg-gradient-to-t from-[#2f7f78] to-[#5eead4]"
                  />
                ))}
              </div>
            </div>
            <div className="text-xs text-emerald-400 font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> {t.card2Desc}
            </div>
          </motion.div>

          
          <motion.div
            style={{
              x: p3X,
              y: p3Y,
              rotate: p3Rotate,
              scale: p3Scale,
              opacity: p3Opacity,
            }}
            className="absolute z-20 w-68 sm:w-76 md:w-[330px] rounded-3xl border border-white/20 bg-black/70 backdrop-blur-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_30px_rgba(72,201,176,0.15)] hover:border-[#48c9b0]/60 transition-all"
          >
            <div className="flex items-center justify-between text-xs text-white/70 mb-3">
              <span className="flex items-center gap-2 font-bold text-[#48c9b0]">
                <Award className="h-4 w-4" /> {t.card3Title}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">{t.card3Score}</span>
              <span className="text-xs font-mono text-white/60">{t.card3Max}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="rounded-xl bg-white/5 p-2.5">
                <span className="text-[#5eead4] font-bold text-xs">{t.card3Listening}</span>
              </div>
              <div className="rounded-xl bg-white/5 p-2.5">
                <span className="text-[#5eead4] font-bold text-xs">{t.card3Reading}</span>
              </div>
            </div>
          </motion.div>

          
          <motion.div
            style={{
              x: p4X,
              y: p4Y,
              rotate: p4Rotate,
              scale: p4Scale,
              opacity: p4Opacity,
            }}
            className="absolute z-20 w-68 sm:w-76 md:w-[330px] rounded-3xl border border-white/20 bg-black/70 backdrop-blur-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_30px_rgba(72,201,176,0.15)] hover:border-[#48c9b0]/60 transition-all"
          >
            <div className="flex items-center justify-between text-xs text-white/70 mb-3">
              <span className="flex items-center gap-2 font-bold text-[#48c9b0]">
                <Zap className="h-4 w-4" /> {t.card4Title}
              </span>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-500/25 px-2.5 py-1 rounded-full font-semibold">
                {t.card4Badge}
              </span>
            </div>
            <div className="text-xs text-white/85 leading-relaxed font-sans">
              &quot;{t.card4Question}&quot;
            </div>
            <div className="mt-2 text-[11px] text-[#5eead4] leading-relaxed italic">
              &quot;{t.card4Answer}&quot;
            </div>
          </motion.div>

          
          <motion.div
            style={{
              x: p5X,
              y: p5Y,
              rotate: p5Rotate,
              scale: p5Scale,
              opacity: p5Opacity,
            }}
            className="absolute z-20 w-72 sm:w-80 md:w-[350px] rounded-3xl border border-white/20 bg-black/70 backdrop-blur-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_30px_rgba(72,201,176,0.15)] hover:border-[#48c9b0]/60 transition-all"
          >
            <div className="flex items-center justify-between text-xs text-white/70 mb-3">
              <span className="flex items-center gap-2 font-bold text-[#48c9b0]">
                <Layers className="h-4 w-4" /> {t.card5Title}
              </span>
              <span className="text-[10px] font-mono bg-purple-500/25 text-purple-300 px-2 py-0.5 rounded-full font-semibold">
                {t.card5Badge}
              </span>
            </div>
            <div className="rounded-xl bg-black/50 p-3 font-mono text-xs text-white/95 space-y-1.5">
              <div>
                <span className="text-pink-400 font-bold">[S]</span> The marketing team
              </div>
              <div>
                <span className="text-amber-400 font-bold">[V]</span> successfully launched
              </div>
              <div>
                <span className="text-emerald-400 font-bold">[O]</span> the new campaign.
              </div>
            </div>
            <p className="text-[11px] text-white/60 mt-2">
              {t.card5Desc}
            </p>
          </motion.div>

          
          <motion.div
            style={{
              x: p6X,
              y: p6Y,
              rotate: p6Rotate,
              scale: p6Scale,
              opacity: p6Opacity,
            }}
            className="absolute z-20 w-64 sm:w-72 md:w-[310px] rounded-3xl border border-white/20 bg-black/70 backdrop-blur-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_30px_rgba(72,201,176,0.15)] hover:border-[#48c9b0]/60 transition-all"
          >
            <div className="flex items-center justify-between text-xs text-white/70 mb-2">
              <span className="flex items-center gap-2 font-bold text-[#48c9b0]">
                <Flame className="h-4 w-4 text-orange-400 fill-orange-400 animate-bounce" /> {t.card6Title}
              </span>
            </div>
            <div className="text-xl font-black text-orange-400">
              {t.card6Streak}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs font-mono text-white/70 bg-white/5 p-2 rounded-xl">
              <span className="text-[#5eead4] font-bold">{t.card6XP}</span>
              <span className="text-emerald-400 font-bold">Top 1%</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
