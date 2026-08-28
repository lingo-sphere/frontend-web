"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence, animate, useInView } from "motion/react"

const manifestoLines = [
  "Học tiếng Anh bằng tư duy logic, không học vẹt.",
  "Mỗi bài học là một bước đột phá điểm số vững chắc.",
  "Tối ưu hóa trí nhớ dài hạn cùng thuật toán Spaced Repetition SRS.",
  "Gia sư AI Hybrid và Whisper STT đồng hành sửa lỗi 24/7.",
]

const navItems = [
  { href: "#workbench", label: "LingoThinking" },
  { href: "#islands", label: "4 Trụ Cột" },
  { href: "#manifesto", label: "Triết Lý" },
  { href: "#stargazer", label: "Bắt Đầu" },
]

const islands = [
  {
    node: "NODE_01",
    title: "Luyện Thi TOEIC Chuẩn ETS",
    description:
      "Phòng thi thử 200 câu 7 Part bấm giờ thực tế. Thuật toán chấm điểm và phân tích điểm yếu tức thì.",
    accent: "lantern",
    topOffset: "lg:translate-y-0",
  },
  {
    node: "NODE_02",
    title: "Luyện Nói Whisper AI",
    description:
      "Nhận diện giọng nói siêu chuẩn xác từng âm vị. Hướng dẫn phát âm, nối âm và ngữ điệu tự nhiên.",
    accent: "moss",
    topOffset: "lg:translate-y-12 sm:translate-y-6",
  },
  {
    node: "NODE_03",
    title: "Siêu Trí Nhớ Từ Vựng SRS",
    description:
      "Khoa học SuperMemo SM-2 tự động nhắc lại từ vựng đúng thời điểm não bộ sắp quên để ghi nhớ vĩnh viễn.",
    accent: "neutral",
    topOffset: "lg:translate-y-3",
  },
  {
    node: "NODE_04",
    title: "Gia Sư AI Hybrid 24/7",
    description:
      "Trợ lý AI Gemini Flash kết hợp Groq LPU giải đáp thắc mắc, phân tích ngữ pháp và sửa bài viết tức thì.",
    accent: "lantern",
    topOffset: "lg:translate-y-16 sm:translate-y-6",
  },
]

const stats = [
  { target: 990, suffix: "", decimals: 0, label: "ETS Max Scale" },
  { target: 4000, suffix: "+", decimals: 0, label: "Học Viên 850+" },
  { target: 20, suffix: "k+", decimals: 0, label: "Tâm Tình Học Viên" },
  { target: 0.4, suffix: "s", decimals: 1, label: "AI Latency" },
]

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

export function LandingPage() {
  const manifestoRef = useRef<HTMLPreElement | null>(null)
  const heroVideoContainerRef = useRef<HTMLDivElement | null>(null)
  const heroVideo1Ref = useRef<HTMLVideoElement | null>(null)
  const heroVideo2Ref = useRef<HTMLVideoElement | null>(null)
  const [activeHeroVideo, setActiveHeroVideo] = useState<1 | 2>(1)
  const crossfadeTriggeredRef = useRef<boolean>(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isHeaderHidden, setIsHeaderHidden] = useState(false)
  const lastScrollYRef = useRef(0)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  useEffect(() => {
    document.documentElement.classList.add("scroll-smooth", "dark")
  }, [])

  // 🎬 Seamless Video Loop Cross-fade Engine (Double Buffering)
  useEffect(() => {
    const v1 = heroVideo1Ref.current
    const v2 = heroVideo2Ref.current
    if (!v1 || !v2) return

    v1.play().catch(() => {})

    const checkTime = (e: Event) => {
      const vid = e.target as HTMLVideoElement
      const dur = vid.duration
      if (!dur || isNaN(dur)) return

      // When reaching 2s before end, cross-fade to the other video
      if (dur - vid.currentTime <= 2 && !crossfadeTriggeredRef.current) {
        crossfadeTriggeredRef.current = true
        if (activeHeroVideo === 1) {
          v2.currentTime = 0
          v2.play().catch(() => {})
          setActiveHeroVideo(2)
        } else {
          v1.currentTime = 0
          v1.play().catch(() => {})
          setActiveHeroVideo(1)
        }
      } else if (dur - vid.currentTime > 2.5) {
        crossfadeTriggeredRef.current = false
      }
    }

    v1.addEventListener("timeupdate", checkTime)
    v2.addEventListener("timeupdate", checkTime)

    return () => {
      v1.removeEventListener("timeupdate", checkTime)
      v2.removeEventListener("timeupdate", checkTime)
    }
  }, [activeHeroVideo])

  useEffect(() => {
    const el = manifestoRef.current
    if (!el) return

    let cancelled = false
    let lineIndex = 0
    let charIndex = 0
    let completedText = ""

    const type = () => {
      if (cancelled || !manifestoRef.current) return
      if (lineIndex >= manifestoLines.length) return

      const currentLine = manifestoLines[lineIndex]
      const progress = currentLine.slice(0, charIndex + 1)

      manifestoRef.current.textContent = `${completedText}${lineIndex > 0 ? "\n\n" : ""}${progress}`

      charIndex += 1

      if (charIndex < currentLine.length) {
        window.setTimeout(type, 25)
        return
      }

      completedText += `${lineIndex > 0 ? "\n\n" : ""}${currentLine}`
      lineIndex += 1
      charIndex = 0
      window.setTimeout(type, 800)
    }

    type()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let ticking = false

    const update = () => {
      const scrollY = window.scrollY
      const deltaY = scrollY - lastScrollYRef.current

      setShowScrollTop(scrollY > 250)
      setIsScrolled(scrollY > 20)

      if (scrollY <= 60) {
        // Ở đỉnh trang: luôn hiện
        setIsHeaderHidden(false)
      } else if (deltaY < -6) {
        // Cuộn ngược lên: hiện lại ngay lập tức
        setIsHeaderHidden(false)
      } else if (deltaY > 45 && scrollY > 120) {
        // Cuộn xuống MẠNH / NHANH (bước nhảy > 45px): ẩn Header
        setIsHeaderHidden(true)
      }
      // Nếu cuộn nhẹ (deltaY <= 45): Header vẫn hiển thị bình thường!

      lastScrollYRef.current = scrollY

      const progress = scrollY / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
      document.body.style.setProperty("--scroll", String(progress))

      const heroContainer = heroVideoContainerRef.current
      if (heroContainer) {
        const heroProgress = Math.min(scrollY / (window.innerHeight * 1.15), 1)
        const scale = 1.07 + heroProgress * 0.1
        const translate = heroProgress * 14
        heroContainer.style.transform = `scale(${scale}) translateY(${translate}px)`
      }
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(() => {
        update()
        ticking = false
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  return (
    <main className="relative overflow-x-hidden bg-[oklch(20%_0.08_280)] text-white antialiased">
      <div className="noise pointer-events-none fixed inset-0 z-[9999]" />

      {/* 🧭 1. Ultra-Smooth Cinematic Header */}
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
          onClick={scrollToTop}
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

        <motion.div
          initial={{ opacity: 0, scale: 0.85, x: 25 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href="/home"
            className="inline-flex items-center justify-center rounded-full border border-white/30 bg-[#2f7f78]/30 backdrop-blur-md px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-white shadow-[0_4px_20px_rgba(47,127,120,0.4)] hover:scale-105 hover:bg-[#2f7f78] hover:text-white hover:border-[#2f7f78] transition-all cursor-pointer active:scale-95"
          >
            Vào Bàn Học
          </Link>
        </motion.div>
      </motion.header>

      {/* 🚀 2. Smooth Cinematic Hero Section */}
      <section className="relative flex h-screen w-screen items-center justify-center overflow-hidden">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,_rgba(72,201,176,0.18)_0%,_transparent_70%)] blur-[100px] animate-pulse" />

        <motion.div
          ref={heroVideoContainerRef}
          initial={{ opacity: 0, scale: 1.14 }}
          animate={{ opacity: 1, scale: 1.07 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0 overflow-hidden"
        >
          <video
            ref={heroVideo1Ref}
            src="/video-banner.mp4"
            autoPlay
            muted
            playsInline
            className={`hero-mask absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ease-in-out ${
              activeHeroVideo === 1 ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          />
          <video
            ref={heroVideo2Ref}
            src="/video-banner.mp4"
            muted
            playsInline
            className={`hero-mask absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ease-in-out ${
              activeHeroVideo === 2 ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          />
        </motion.div>

        <div className="relative z-10 px-4 sm:px-6 text-center w-full max-w-6xl mx-auto flex flex-col items-center">
          {/* Top Pill Tag */}
          <motion.div
            initial={{ opacity: 0, y: 25, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2.5 rounded-full border border-[#48c9b0]/30 bg-black/50 px-4 py-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-[#5eead4] backdrop-blur-md shadow-[0_0_20px_rgba(72,201,176,0.2)] mb-6 select-none"
          >
            <span className="h-2 w-2 rounded-full bg-[#5eead4] shadow-[0_0_8px_#5eead4] animate-pulse" />
            Hệ Sinh Thái Học Tiếng Anh Tư Duy & AI
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 45, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.2, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="hero-gradient-flow mb-8 text-4xl sm:text-6xl md:text-7xl lg:text-[5.6rem] xl:text-[6.5rem] font-extrabold leading-[1.1] tracking-tighter drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] drop-shadow-[0_0_45px_rgba(94,234,212,0.45)] select-none flex flex-col items-center"
          >
            <span className="whitespace-nowrap">Tiếng Anh Tư Duy</span>
            <span className="whitespace-nowrap">Bứt Phá TOEIC</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.1, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-2xl rounded-3xl border border-white/10 p-8 backdrop-blur-[2px] bg-black/5 shadow-lg"
          >
            <p className="mb-8 font-serif text-lg md:text-xl leading-relaxed font-light italic text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              &quot;Học tiếng Anh bằng tư duy logic và khoa học não bộ, nói không với học vẹt.&quot;
            </p>
            <Link href="/home">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(72,201,176,0.6)" }}
                whileTap={{ scale: 0.96 }}
                className="rounded-2xl border border-white/20 bg-black/10 backdrop-blur-sm px-12 py-4 text-[11px] font-black uppercase tracking-[0.35em] text-white/90 shadow-lg transition-all duration-300 ease-out hover:border-[#48c9b0] hover:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.9)] hover:shadow-[0_0_30px_rgba(72,201,176,0.6),inset_0_0_15px_rgba(72,201,176,0.25)] cursor-pointer"
              >
                Bắt Đầu Học Miễn Phí
              </motion.button>
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
          onClick={() => scrollToSection("workbench")}
          className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 cursor-pointer select-none group"
        >
          <div className="h-10 w-px bg-gradient-to-b from-[#5eead4] to-transparent group-hover:h-14 transition-all" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/80 font-medium group-hover:text-[#5eead4] transition-colors">
            Cuộn Để Khám Phá
          </span>
        </motion.div>
      </section>

      {/* 🧠 3. Hệ Phương Pháp LingoThinking Logic */}
      <section id="workbench" className="relative min-h-screen px-6 py-40 md:px-24">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-20 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10"
          >
            <h2 className="heading-glow mb-8 text-4xl sm:text-5xl font-bold tracking-tighter leading-tight text-white">
              Hệ Phương Pháp
              <br />
              <span className="font-serif font-light italic text-[#48c9b0] teal-glow">LingoThinking</span> Logic
            </h2>
            <p className="mb-12 max-w-md text-base sm:text-lg leading-relaxed text-white/60">
              Tách cấu trúc câu, hiểu trọn vẹn ngữ cảnh và ghi nhớ vĩnh viễn từ vựng bằng thuật toán lặp lại ngắt quãng Spaced Repetition.
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
                <span className="text-[11px] uppercase tracking-[0.2em] opacity-60 font-semibold group-hover:opacity-100 transition-opacity">Tư Duy Logic (Simplify & Connect)</span>
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
                <span className="text-[11px] uppercase tracking-[0.2em] opacity-60 font-semibold group-hover:opacity-100 transition-opacity">Chuẩn Hóa Âm Vị Whisper STT</span>
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
              <video
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full rounded-full object-cover"
              >
                <source src="/video-contact.mp4" type="video/mp4" />
              </video>

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
                Deep Focus
              </span>
              <p className="text-[10px] uppercase tracking-wider text-white/90 font-bold leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                Tối ưu hóa tải nhận thức cho học viên
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 🏝️ 4. Bốn Trụ Cột Đột Phá Điểm Số */}
      <section id="islands" className="relative px-6 py-40">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-28 text-center relative z-20"
        >
          <h2 className="absolute left-0 right-0 top-0 select-none text-[12vw] font-bold leading-none tracking-[-0.05em] opacity-5 pointer-events-none">
            LINGOSPHERE
          </h2>
          <span className="teal-glow mb-4 block text-[11px] uppercase tracking-[0.5em] text-[#48c9b0] font-bold">
            Khám Phá Hệ Sinh Thái Học Tập
          </span>
          <h3 className="heading-glow text-3xl sm:text-5xl font-bold tracking-tighter text-white">4 Trụ Cột Đột Phá Điểm Số</h3>
        </motion.div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 items-start pb-12">
          {islands.map((item, idx) => (
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
              className={[
                "glass-card group relative overflow-hidden rounded-[32px] p-8 transition-shadow duration-500 hover:shadow-2xl flex flex-col justify-between min-h-[320px] cursor-pointer",
                item.topOffset,
              ].join(" ")}
            >
              <div
                className={[
                  "absolute -top-20 -right-20 h-40 w-40 blur-[80px] transition-all",
                  item.accent === "lantern"
                    ? "bg-[#2f7f78]/20 group-hover:bg-[#2f7f78]/40"
                    : item.accent === "moss"
                      ? "bg-[#3f8f68]/20 group-hover:bg-[#3f8f68]/40"
                      : "bg-white/10 group-hover:bg-white/20",
                ].join(" ")}
              />
              <div>
                <div
                  className={[
                    "mb-6 font-mono text-[11px] font-bold tracking-widest",
                    item.accent === "lantern" ? "text-[#48c9b0]" : item.accent === "moss" ? "text-[#3f8f68]" : "opacity-60",
                  ].join(" ")}
                >
                  {item.node}
                </div>
                <h4 className="mb-4 text-xl font-bold tracking-tight text-white group-hover:text-[#5eead4] transition-colors">{item.title}</h4>
                <p className="mb-8 text-xs sm:text-sm leading-relaxed text-white/60">{item.description}</p>
              </div>
              <div className="flex gap-2">
                <div className="h-[1px] w-8 bg-white/30 group-hover:w-12 transition-all" />
                <div
                  className={[
                    "h-[1px] w-2",
                    item.accent === "lantern" ? "bg-[#48c9b0]" : item.accent === "moss" ? "bg-[#3f8f68]" : "bg-white/50",
                  ].join(" ")}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 📜 5. Triết Lý & Thống Kê Điểm Số */}
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
            Tiếng Anh không phải để học vẹt, mà là công cụ của <span className="text-[#48c9b0] teal-glow font-normal not-italic">tư duy logic</span>.
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 gap-8 sm:gap-12 border-t border-white/10 pt-16 md:grid-cols-4"
          >
            {stats.map((stat, idx) => (
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

      {/* 🌟 6. Call To Action Footer */}
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
            <div className="inline-flex items-center gap-2 rounded-full border border-[#48c9b0]/30 bg-[#2f7f78]/15 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#48c9b0] backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#48c9b0] shadow-[0_0_8px_#48c9b0]" />
              LingoSphere Platform
            </div>
            <h2 className="heading-glow text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Sẵn sàng bứt phá điểm số?
            </h2>
            <p className="max-w-md text-sm text-white/60 leading-relaxed">
              Hơn 20,000 học viên đã làm chủ tiếng Anh cùng LingoSphere. Học bằng tư duy logic não bộ và chinh phục mục tiêu TOEIC ngay hôm nay.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link href="/home">
                <button className="rounded-xl bg-[#2f7f78] px-7 py-3.5 text-[11px] font-black uppercase tracking-widest text-white hover:bg-[#236b65] transition-all cursor-pointer shadow-lg shadow-[#2f7f78]/30 hover:scale-105 active:scale-95">
                  Vào Bàn Học Ngay
                </button>
              </Link>
              <Link href="/toeic">
                <button className="rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/10 hover:border-white/40 transition-all cursor-pointer hover:scale-105 active:scale-95">
                  Thi Thử TOEIC ETS
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
              <div className="text-[11px] uppercase tracking-[0.25em] text-[#48c9b0] font-bold">Khóa Học</div>
              <ul className="space-y-2.5 text-xs text-white/60">
                <li><Link href="/courses" className="hover:text-white transition-colors">TOEIC Foundation 450+</Link></li>
                <li><Link href="/courses" className="hover:text-white transition-colors">TOEIC Intensive 750+</Link></li>
                <li><Link href="/speaking" className="hover:text-white transition-colors">Luyện Nói Whisper AI</Link></li>
                <li><Link href="/vocabulary" className="hover:text-white transition-colors">Từ Vựng SRS 44 Âm</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="text-[11px] uppercase tracking-[0.25em] text-[#48c9b0] font-bold">Tính Năng</div>
              <ul className="space-y-2.5 text-xs text-white/60">
                <li><Link href="/ai-learning" className="hover:text-white transition-colors">Gia Sư AI Hybrid 24/7</Link></li>
                <li><Link href="/practice" className="hover:text-white transition-colors">Luyện Nghe Dictation</Link></li>
                <li><Link href="/writing" className="hover:text-white transition-colors">Luyện Viết Sư Phạm</Link></li>
                <li><Link href="/journal" className="hover:text-white transition-colors">Nhật Ký Học Tập</Link></li>
              </ul>
            </div>

            <div className="space-y-3 col-span-2 sm:col-span-1">
              <div className="text-[11px] uppercase tracking-[0.25em] text-[#48c9b0] font-bold">Hệ Thống</div>
              <ul className="space-y-2.5 text-xs text-white/60">
                <li><Link href="/home" className="hover:text-white transition-colors">Bàn Học Dashboard</Link></li>
                <li><Link href="/leaderboard" className="hover:text-white transition-colors">Bảng Xếp Hạng XP</Link></li>
                <li><Link href="/progress" className="hover:text-white transition-colors">Heatmap Hoạt Động</Link></li>
                <li><Link href="/toeic" className="hover:text-white transition-colors">ETS Exam Simulator</Link></li>
              </ul>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row text-center sm:text-left">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">© 2026 LingoSphere — Học Viện Tiếng Anh Tư Duy</p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-white/50 font-medium">Hệ Thống: 24/7 AI Tutor Sẵn Sàng</span>
          </div>
        </div>
      </footer>

      {/* ⬆️ 7. Floating Scroll Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            aria-label="Cuộn lên đầu trang"
            className="fixed bottom-8 right-8 z-[100] flex h-12 w-12 items-center justify-center rounded-none border border-[#2f7f78]/50 bg-black/80 backdrop-blur-xl text-white shadow-[0_0_20px_rgba(47,127,120,0.4),0_0_40px_rgba(47,127,120,0.2),inset_0_0_12px_rgba(47,127,120,0.15)] transition-colors duration-300 hover:border-[#48c9b0] hover:bg-[#2f7f78] hover:text-white hover:shadow-[0_0_30px_rgba(47,127,120,0.8),0_0_60px_rgba(47,127,120,0.4)] cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      <style jsx global>{`
        :root {
          color-scheme: dark;
          --scroll: 0;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          overflow-x: hidden;
          background: oklch(20% 0.08 280);
        }

        body::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.03;
          z-index: 9999;
          background: url("https://grainy-gradients.vercel.app/noise.svg");
        }

        ::-webkit-scrollbar {
          display: none;
        }

        .hero-mask {
          -webkit-mask-image: radial-gradient(circle, black 40%, transparent 75%);
          mask-image: radial-gradient(circle, black 40%, transparent 75%);
        }

        .squircle-mask {
          mask-image: radial-gradient(circle at center, black 30%, transparent 75%);
          -webkit-mask-image: radial-gradient(circle at center, black 30%, transparent 75%);
          border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
        }

        .vellum-overlay {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px) contrast(0.95);
          -webkit-backdrop-filter: blur(20px) contrast(0.95);
        }

        .lantern-glow {
          background: rgba(47, 127, 120, 0.05);
          backdrop-filter: blur(12px) saturate(1.5);
          border: 1px solid rgba(47, 127, 120, 0.3);
          box-shadow:
            0 0 30px rgba(47, 127, 120, 0.08),
            inset 0 0 10px rgba(47, 127, 120, 0.08);
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .lantern-glow:hover {
          background: #2f7f78;
          color: #ffffff;
          box-shadow: 0 0 50px rgba(47, 127, 120, 0.7);
          border-color: #2f7f78;
          transform: translateY(-2px);
        }

        .heading-glow {
          text-shadow:
            0 0 30px rgba(72, 201, 176, 0.45),
            0 0 60px rgba(47, 127, 120, 0.3),
            0 4px 20px rgba(0, 0, 0, 0.95);
        }

        .teal-glow {
          text-shadow:
            0 0 20px rgba(72, 201, 176, 0.85),
            0 0 45px rgba(47, 127, 120, 0.6);
        }

        .hero-gradient-flow {
          background: linear-gradient(
            115deg,
            #ffffff 0%,
            #5eead4 25%,
            #ffffff 50%,
            #2dd4bf 75%,
            #ffffff 100%
          );
          background-size: 250% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: text-flow 5s ease-in-out infinite alternate;
        }

        @keyframes text-flow {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 100% 50%;
          }
        }

        .shimmer-text {
          background: linear-gradient(90deg, #fff 0%, #48c9b0 50%, #fff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .workbench-ui {
          background: rgba(15, 15, 30, 0.3);
          backdrop-filter: blur(50px) saturate(1.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.5);
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.5s ease;
        }

        .glass-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(47, 127, 120, 0.4);
        }
      `}</style>
    </main>
  )
}