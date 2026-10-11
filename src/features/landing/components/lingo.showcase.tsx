// Component giao diện showcase tính năng và hiệu năng LingoSphere.
'use client'

import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import { motion, useMotionValue, useTransform } from "motion/react"
import { Sparkles, Brain, ArrowRight, CheckCircle2, Cpu } from "lucide-react"
import { landingLocales, type LandingLang } from "@/features/landing/components/landing.locales"

interface LingoShowcaseProps {
  lang?: LandingLang
}

export function LingoShowcase({ lang = "vi" }: LingoShowcaseProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const v1Ref = useRef<HTMLVideoElement | null>(null)
  const v2Ref = useRef<HTMLVideoElement | null>(null)
  const [activeVideo, setActiveVideo] = useState<1 | 2>(1)
  const crossfadeTriggeredRef = useRef(false)

  const t = landingLocales[lang]?.showcase || landingLocales.vi.showcase

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

  const scrollYProgress = useMotionValue(0)

  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const totalDist = windowHeight + rect.height
      const currentPos = windowHeight - rect.top
      scrollYProgress.set(Math.min(Math.max(currentPos / totalDist, 0), 1))
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
    }
  }, [scrollYProgress])

  const maskScale = useTransform(scrollYProgress, [0.15, 0.52], [3.8, 1])
  const videoScale = useTransform(scrollYProgress, [0.15, 0.52], [1.12, 1.02])

  return (
    <section
      ref={sectionRef}
      id="showcase"
      className="relative z-20 w-full max-w-full overflow-x-hidden bg-[oklch(20%_0.08_280)] pt-[62px] pb-24"
    >
      
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[900px] rounded-full bg-[radial-gradient(circle,_rgba(72,201,176,0.15)_0%,_transparent_70%)] blur-[140px]" />

      
      <div className="mx-auto max-w-7xl px-6 text-center mb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center gap-2 rounded-full border border-[#48c9b0]/30 bg-black/60 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-[#5eead4] backdrop-blur-md shadow-[0_0_20px_rgba(72,201,176,0.2)] mb-4"
        >
          <Cpu className="h-3.5 w-3.5 text-[#5eead4] animate-pulse" />
          {t.tag}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="heading-glow text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white"
        >
          {t.title}
        </motion.h2>
      </div>

      
      <div className="relative w-full max-w-full h-[220px] sm:h-[280px] md:h-[340px] overflow-hidden bg-[oklch(20%_0.08_280)] mb-5">
        <motion.div style={{ scale: videoScale }} className="absolute inset-0 h-full w-full">
          <video
            ref={v1Ref}
            src="/video-contact.mp4"
            autoPlay
            muted
            playsInline
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ease-in-out ${
              activeVideo === 1 ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          />
          <video
            ref={v2Ref}
            src="/video-contact.mp4"
            muted
            playsInline
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ease-in-out ${
              activeVideo === 2 ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          />
        </motion.div>

        <motion.div
          style={{ scale: maskScale }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none origin-center will-change-transform"
        >
          <svg viewBox="0 0 1920 340" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
            <defs>
              <mask id="lingo-cutout-mask" x="0" y="0" width="100%" height="100%">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                <g fill="black">
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="190"
                    fontWeight="900"
                    letterSpacing="0.08em"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    LINGOSPHERE
                  </text>
                </g>
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="oklch(20% 0.08 280)"
              mask="url(#lingo-cutout-mask)"
            />
          </svg>
        </motion.div>
      </div>

      
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-left">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
              {t.heading} <span className="text-[#5eead4]">{t.headingHighlight}</span>
            </h3>
            <p className="text-base sm:text-lg text-white/70 leading-relaxed font-light">
              {t.desc}
            </p>

            <ul className="space-y-3.5 pt-2 text-sm sm:text-base text-white/80">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#48c9b0] shrink-0" />
                <span>{t.bullet1}</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#48c9b0] shrink-0" />
                <span>{t.bullet2}</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#48c9b0] shrink-0" />
                <span>{t.bullet3}</span>
              </li>
            </ul>

            <div className="pt-4">
              <Link
                href="/home"
                className="inline-flex items-center gap-3 rounded-2xl border border-emerald-400/50 bg-emerald-500/25 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:scale-105 hover:bg-emerald-400 hover:text-slate-950 transition-all cursor-pointer"
              >
                {t.btnTry} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6 text-left shadow-lg hover:border-emerald-400/40 transition-colors">
              <div className="flex items-center gap-2 text-emerald-400 mb-3 font-mono text-xs font-bold">
                <Brain className="h-4 w-4" /> {lang === "vi" ? "TRÍ NHỚ SRS" : "SRS RETENTION"}
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white">4.2x</div>
              <div className="text-xs text-white/60 mt-1.5">{lang === "vi" ? "Tăng tốc độ nhớ dài hạn" : "Faster memory consolidation"}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6 text-left shadow-lg hover:border-[#48c9b0]/40 transition-colors">
              <div className="flex items-center gap-2 text-[#48c9b0] mb-3 font-mono text-xs font-bold">
                <Cpu className="h-4 w-4" /> GROQ LPU
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white">0.3s</div>
              <div className="text-xs text-white/60 mt-1.5">{lang === "vi" ? "Tốc độ phản hồi Gia sư AI" : "AI Tutor response latency"}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6 text-left shadow-lg hover:border-[#48c9b0]/40 transition-colors">
              <div className="flex items-center gap-2 text-[#48c9b0] mb-3 font-mono text-xs font-bold">
                <Sparkles className="h-4 w-4" /> WHISPER STT
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white">99.2%</div>
              <div className="text-xs text-white/60 mt-1.5">{lang === "vi" ? "Độ chuẩn xác âm vị" : "Phoneme recognition accuracy"}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6 text-left shadow-lg hover:border-[#48c9b0]/40 transition-colors">
              <div className="flex items-center gap-2 text-[#48c9b0] mb-3 font-mono text-xs font-bold">
                <Brain className="h-4 w-4" /> ETS 990
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white">+240</div>
              <div className="text-xs text-white/60 mt-1.5">{lang === "vi" ? "Điểm tăng trung bình / 60 ngày" : "Avg. score jump in 60 days"}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
