"use client"

import { useRef } from "react"
import Link from "next/link"
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
  ArrowRight,
  TrendingUp,
} from "lucide-react"

export function LingoPerformance() {
  const sectionRef = useRef<HTMLDivElement | null>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  // 🚀 Parallax Exploded Floating Card Transforms (Wide & Grand Expansive Fly-Out)
  // Card 1: Top Left (Flashcard SRS)
  const p1X = useTransform(scrollYProgress, [0.15, 0.52], [-40, -520])
  const p1Y = useTransform(scrollYProgress, [0.15, 0.52], [40, -230])
  const p1Rotate = useTransform(scrollYProgress, [0.15, 0.52], [0, -8])
  const p1Scale = useTransform(scrollYProgress, [0.15, 0.45], [0.75, 1.05])
  const p1Opacity = useTransform(scrollYProgress, [0.15, 0.35], [0, 1])

  // Card 2: Top Right (Whisper STT)
  const p2X = useTransform(scrollYProgress, [0.15, 0.52], [40, 520])
  const p2Y = useTransform(scrollYProgress, [0.15, 0.52], [40, -220])
  const p2Rotate = useTransform(scrollYProgress, [0.15, 0.52], [0, 7])
  const p2Scale = useTransform(scrollYProgress, [0.15, 0.45], [0.75, 1.05])
  const p2Opacity = useTransform(scrollYProgress, [0.15, 0.35], [0, 1])

  // Card 3: Mid Right (ETS TOEIC)
  const p3X = useTransform(scrollYProgress, [0.15, 0.52], [50, 560])
  const p3Y = useTransform(scrollYProgress, [0.15, 0.52], [20, 75])
  const p3Rotate = useTransform(scrollYProgress, [0.15, 0.52], [0, -4])
  const p3Scale = useTransform(scrollYProgress, [0.15, 0.45], [0.75, 1.05])
  const p3Opacity = useTransform(scrollYProgress, [0.18, 0.38], [0, 1])

  // Card 4: Bottom Right (Groq LPU AI)
  const p4X = useTransform(scrollYProgress, [0.15, 0.52], [30, 420])
  const p4Y = useTransform(scrollYProgress, [0.15, 0.52], [-10, 320])
  const p4Rotate = useTransform(scrollYProgress, [0.15, 0.52], [0, 5])
  const p4Scale = useTransform(scrollYProgress, [0.15, 0.45], [0.75, 1.05])
  const p4Opacity = useTransform(scrollYProgress, [0.2, 0.4], [0, 1])

  // Card 5: Mid Left (LingoThinking Logic)
  const p5X = useTransform(scrollYProgress, [0.15, 0.52], [-50, -560])
  const p5Y = useTransform(scrollYProgress, [0.15, 0.52], [20, 65])
  const p5Rotate = useTransform(scrollYProgress, [0.15, 0.52], [0, 5])
  const p5Scale = useTransform(scrollYProgress, [0.15, 0.45], [0.75, 1.05])
  const p5Opacity = useTransform(scrollYProgress, [0.18, 0.38], [0, 1])

  // Card 6: Bottom Left (Streak & Gamification)
  const p6X = useTransform(scrollYProgress, [0.15, 0.52], [-30, -400])
  const p6Y = useTransform(scrollYProgress, [0.15, 0.52], [-10, 310])
  const p6Rotate = useTransform(scrollYProgress, [0.15, 0.52], [0, -5])
  const p6Scale = useTransform(scrollYProgress, [0.15, 0.45], [0.75, 1.05])
  const p6Opacity = useTransform(scrollYProgress, [0.2, 0.4], [0, 1])

  // Core Center Scale
  const centerScale = useTransform(scrollYProgress, [0.15, 0.5], [0.9, 1.08])

  return (
    <section
      ref={sectionRef}
      id="performance"
      className="relative z-20 w-screen overflow-hidden bg-[oklch(20%_0.08_280)] py-36 px-4 sm:px-6"
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[1200px] rounded-full bg-[radial-gradient(circle,_rgba(72,201,176,0.16)_0%,_transparent_70%)] blur-[160px]" />

      <div className="mx-auto max-w-[1500px]">
        {/* Title Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#48c9b0]/30 bg-black/60 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-[#5eead4] backdrop-blur-md shadow-[0_0_20px_rgba(72,201,176,0.2)] mb-4"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#5eead4] animate-pulse" />
            Kiến Trúc Đa Tầng Hiệu Năng Cao
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="heading-glow text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight"
          >
            Hiệu Năng Học Tập Đỉnh Cao.{" "}
            <span className="font-serif font-light italic text-[#48c9b0]">Bứt Phá Giới Hạn.</span>
          </motion.h2>
        </div>

        {/* 🌌 Grand 3D Parallax Exploded Stage */}
        <div className="relative h-[750px] sm:h-[860px] md:h-[940px] w-full flex items-center justify-center">
          {/* 🌟 Center Core (LingoSphere Study Engine) */}
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
              Neural Study Engine
            </p>
            <div className="mt-4 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[10px] font-mono text-white/90 shadow-inner">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              100% Active Learning
            </div>
          </motion.div>

          {/* 🃏 Card 1: Top Left - Spaced Repetition SRS Flashcard */}
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
                <Brain className="h-4 w-4" /> Spaced Repetition
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/25 text-emerald-300 px-2.5 py-1 rounded-full font-semibold">
                SM-2 SuperMemo
              </span>
            </div>
            <div className="text-2xl font-black text-white">Resilience</div>
            <div className="text-sm font-mono text-[#5eead4] mt-0.5">/rɪˈzɪl.jəns/</div>
            <p className="text-xs text-white/75 mt-2 leading-relaxed">
              Khả năng phục hồi & bứt phá giới hạn nhận thức
            </p>
            <div className="mt-4 flex items-center justify-between text-xs text-white/60 border-t border-white/10 pt-3 font-mono">
              <span>Độ nhớ: <strong className="text-white">98%</strong></span>
              <span className="text-[#48c9b0] font-bold">Ôn lại: sau 6 ngày</span>
            </div>
          </motion.div>

          {/* 🎙️ Card 2: Top Right - Whisper STT Phoneme Accuracy */}
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
                <Mic className="h-4 w-4" /> Whisper AI STT
              </span>
              <span className="text-[10px] font-mono bg-cyan-500/25 text-cyan-300 px-2.5 py-1 rounded-full font-semibold">
                99.2% Match
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
              <CheckCircle2 className="h-4 w-4" /> Chuẩn hóa cặp âm khó /θ/ & /ð/
            </div>
          </motion.div>

          {/* 🏆 Card 3: Mid Right - ETS TOEIC Exam Certificate */}
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
                <Award className="h-4 w-4" /> ETS TOEIC Engine
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">965</span>
              <span className="text-xs font-mono text-white/60">/ 990 max</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="rounded-xl bg-white/5 p-2.5">
                <span className="text-white/50 block text-[10px]">Listening</span>
                <span className="text-[#5eead4] font-bold text-sm">490/495</span>
              </div>
              <div className="rounded-xl bg-white/5 p-2.5">
                <span className="text-white/50 block text-[10px]">Reading</span>
                <span className="text-[#5eead4] font-bold text-sm">475/495</span>
              </div>
            </div>
          </motion.div>

          {/* ⚡ Card 4: Bottom Right - Groq LPU Hybrid AI Tutor */}
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
                <Zap className="h-4 w-4" /> Groq LPU Chip
              </span>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-500/25 px-2.5 py-1 rounded-full font-semibold">
                0.3s Latency
              </span>
            </div>
            <div className="text-xs text-white/85 leading-relaxed font-sans">
              &quot;AI Tutor phân tích cấu trúc đảo ngữ trong Part 5 ngay tức thì.&quot;
            </div>
            <div className="mt-3 text-xs font-mono text-[#5eead4] flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> Hybrid Failover Sư Phạm
            </div>
          </motion.div>

          {/* 📖 Card 5: Mid Left - LingoThinking Logic Syntax Breakdown */}
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
                <Layers className="h-4 w-4" /> LingoThinking Logic
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
            <div className="mt-3 text-xs text-white/60">
              Tách cấu trúc đa mệnh đề trong 3 giây
            </div>
          </motion.div>

          {/* 🔥 Card 6: Bottom Left - Streak & Gamification */}
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
            <div className="flex items-center gap-2.5 text-amber-400 font-black text-xl">
              <Flame className="h-7 w-7 fill-amber-400 animate-bounce" /> 365 Ngày Streak
            </div>
            <p className="text-xs text-white/75 mt-1.5">Duy trì phản xạ tư duy liên tục mỗi ngày</p>
            <div className="mt-3 flex items-center justify-between text-xs font-mono text-white/60 border-t border-white/10 pt-3">
              <span>Hạng: <strong className="text-white">Kim Cương #1</strong></span>
              <span className="text-amber-300 font-bold">+12,500 XP</span>
            </div>
          </motion.div>
        </div>

        {/* Narrative Description & CTA below */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto max-w-2xl text-center mt-14 space-y-6"
        >
          <p className="text-base sm:text-lg text-white/70 leading-relaxed font-light">
            Mọi tính năng trong hệ sinh thái LingoSphere đều được thiết kế dựa trên khoa học nhận thức và công nghệ xử lý ngôn ngữ tự nhiên tiên tiến nhất, giúp bạn bứt phá 200 - 400+ điểm TOEIC trong thời gian ngắn nhất.
          </p>

          <Link
            href="/courses"
            className="inline-flex items-center gap-3 rounded-full border border-[#48c9b0]/50 bg-[#2f7f78]/30 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_25px_rgba(72,201,176,0.3)] hover:scale-105 hover:bg-[#2f7f78] transition-all cursor-pointer"
          >
            Bắt Đầu Hành Trình Của Bạn <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
