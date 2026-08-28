"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"

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
    topOffset: "",
  },
  {
    node: "NODE_02",
    title: "Luyện Nói Whisper AI",
    description:
      "Nhận diện giọng nói siêu chuẩn xác từng âm vị. Hướng dẫn phát âm, nối âm và ngữ điệu tự nhiên.",
    accent: "moss",
    topOffset: "md:mt-12",
  },
  {
    node: "NODE_03",
    title: "Siêu Trí Nhớ Từ Vựng SRS",
    description:
      "Khoa học SuperMemo SM-2 tự động nhắc lại từ vựng đúng thời điểm não bộ sắp quên để ghi nhớ vĩnh viễn.",
    accent: "neutral",
    topOffset: "",
  },
]

const stats = [
  { value: "990", label: "ETS Max Scale" },
  { value: "4,000+", label: "Học Viên 850+" },
  { value: "20k+", label: "Tâm Tình Học Viên" },
  { value: "0.4s", label: "AI Latency" },
]

export function LandingPage() {
  const manifestoRef = useRef<HTMLPreElement | null>(null)
  const heroVideoRef = useRef<HTMLVideoElement | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  useEffect(() => {
    document.documentElement.classList.add("scroll-smooth", "dark")
  }, [])

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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in")
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.16 }
    )

    const nodes = document.querySelectorAll<HTMLElement>(".reveal")
    nodes.forEach((node) => observer.observe(node))

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const heroVideo = heroVideoRef.current
    if (!heroVideo) return

    const islandsEls = Array.from(document.querySelectorAll<HTMLElement>(".parallax-island"))
    let ticking = false

    const update = () => {
      const scrollY = window.scrollY
      setShowScrollTop(scrollY > 250)
      const progress = scrollY / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
      document.body.style.setProperty("--scroll", String(progress))

      islandsEls.forEach((island, index) => {
        const speed = 0.05 + index * 0.02
        island.style.transform = `translateY(${scrollY * speed * -1}px)`
      })

      const heroProgress = Math.min(scrollY / (window.innerHeight * 1.15), 1)
      const scale = 1.07 + heroProgress * 0.1
      const translate = heroProgress * 14
      heroVideo.style.transform = `scale(${scale}) translateY(${translate}px)`
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(() => {
        update()
        ticking = false
      })
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  return (
    <main className="relative overflow-x-hidden bg-[oklch(20%_0.08_280)] text-white antialiased">
      <div className="noise pointer-events-none fixed inset-0 z-[9999]" />

      <header className="fixed left-0 top-0 z-[100] flex w-full items-center justify-between px-6 py-5 md:px-12 md:py-7 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-auto transition-all">
        <button
          onClick={scrollToTop}
          className="flex items-center gap-3 group cursor-pointer bg-transparent border-none p-0 outline-none"
          aria-label="Cuộn lên đầu trang"
        >
          <div className="h-2.5 w-2.5 rounded-full bg-[oklch(75%_0.15_50)] animate-pulse shadow-[0_0_12px_oklch(75%_0.15_50)]" />
          <div className="text-xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            LINGO <span className="font-light text-white/80">SPHERE</span>
          </div>
        </button>

        <nav className="hidden gap-10 text-[11px] font-bold uppercase tracking-[0.35em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] md:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="transition-all hover:text-[oklch(75%_0.15_50)] hover:scale-105">
              {item.label}
            </a>
          ))}
        </nav>

        <Link
          href="/home"
          className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/15 backdrop-blur-md px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-white shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:scale-105 hover:bg-white hover:text-black hover:border-white transition-all cursor-pointer"
        >
          Vào Bàn Học
        </Link>
      </header>

      <section className="relative flex h-screen w-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video ref={heroVideoRef} autoPlay muted loop playsInline className="hero-mask h-full w-full object-contain">
            <source src="/video.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="relative z-10 px-6 text-center">
          <span className="mb-8 block text-[11px] uppercase tracking-[0.6em] text-[oklch(75%_0.15_50)]/90 animate-[pulse-soft_4s_ease-in-out_infinite] font-semibold">
            Học Viện Tiếng Anh Tư Duy AI Thế Hệ Mới
          </span>

          <h1 className="shimmer-text mb-8 text-5xl font-extrabold leading-tight tracking-tighter md:text-[7.5rem] animate-[shimmer_4s_linear_infinite]">
            Tiếng Anh Tư Duy.
            <br />
            Bứt Phá TOEIC.
          </h1>

          <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 p-8 backdrop-blur-md bg-black/20">
            <p className="mb-8 font-serif text-lg md:text-xl leading-relaxed font-light italic text-white/95">
              &quot;Học tiếng Anh bằng tư duy logic và khoa học não bộ, nói không với học vẹt.&quot;
            </p>
            <Link href="/home">
              <button className="lantern-glow rounded-2xl border border-white/20 bg-black/40 px-12 py-4 text-[11px] font-black uppercase tracking-[0.35em] text-white transition-all hover:border-[oklch(75%_0.15_50)] hover:bg-[oklch(75%_0.15_50)] hover:text-black cursor-pointer">
                Bắt Đầu Học Miễn Phí
              </button>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 flex -translate-x-1/2 flex-col items-center gap-4">
          <div className="h-12 w-px bg-gradient-to-b from-white to-transparent" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/80 font-medium">Cuộn Để Khám Phá</span>
        </div>
      </section>

      <section id="workbench" className="relative min-h-screen px-6 py-40 md:px-24">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-20 lg:grid-cols-2">
          <div className="relative z-10">
            <h2 className="mb-8 text-4xl sm:text-5xl font-bold tracking-tighter leading-tight">
              Hệ Phương Pháp
              <br />
              <span className="font-serif font-light italic text-[oklch(75%_0.15_50)]">LingoThinking</span> Logic
            </h2>
            <p className="mb-12 max-w-md text-base sm:text-lg leading-relaxed text-white/60">
              Tách cấu trúc câu, hiểu trọn vẹn ngữ cảnh và ghi nhớ vĩnh viễn từ vựng bằng thuật toán lặp lại ngắt quãng Spaced Repetition.
            </p>

            <div className="space-y-6">
              <div className="group flex cursor-help items-center gap-6">
                <div className="glass-card flex h-12 w-12 items-center justify-center rounded-2xl transition-colors group-hover:text-[oklch(75%_0.15_50)] font-bold text-sm">
                  01
                </div>
                <div className="h-px flex-1 bg-white/10 transition-all group-hover:bg-[oklch(75%_0.15_50)]/30" />
                <span className="text-[11px] uppercase tracking-[0.2em] opacity-60 font-semibold">Tư Duy Logic (Simplify & Connect)</span>
              </div>

              <div className="group flex cursor-help items-center gap-6">
                <div className="glass-card flex h-12 w-12 items-center justify-center rounded-2xl transition-colors group-hover:text-[oklch(45%_0.1_150)] font-bold text-sm">
                  02
                </div>
                <div className="h-px flex-1 bg-white/10 transition-all group-hover:bg-[oklch(45%_0.1_150)]/30" />
                <span className="text-[11px] uppercase tracking-[0.2em] opacity-60 font-semibold">Chuẩn Hóa Âm Vị Whisper STT</span>
              </div>
            </div>
          </div>

          <div className="workbench-ui animate-[float-slow_8s_ease-in-out_infinite] rounded-[40px] p-1">
            <div className="flex items-center justify-between rounded-t-[39px] border-b border-white/10 bg-black/60 p-6">
              <div className="flex gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">lingothinking_engine.ts</span>
            </div>

            <div className="p-8 sm:p-10 font-mono text-sm leading-relaxed overflow-x-auto">
              <code className="block text-white/50">
                <span className="text-[oklch(75%_0.15_50)] italic">import</span> {"{ LingoThinking, SRSMemory }"}{" "}
                <span className="text-[oklch(75%_0.15_50)] italic">from</span> <span className="text-[oklch(45%_0.1_150)]">&quot;@lingosphere/core&quot;</span>;
              </code>
              <code className="mt-4 block">
                <span className="text-[oklch(75%_0.15_50)]">const</span> <span className="text-white font-bold">MasterEnglish</span> = (
                <span className="text-white">learner</span>: <span className="text-[oklch(45%_0.1_150)]">LearnerProfile</span>
                ) =&gt; {"{"}
              </code>
              <code className="block text-white/70">
                &nbsp;&nbsp;<span className="text-[oklch(75%_0.15_50)]">return</span> learner.activate({"{"}
              </code>
              <code className="block text-white/80">&nbsp;&nbsp;&nbsp;&nbsp;method: <span className="text-[oklch(45%_0.1_150)]">&quot;LingoThinking&quot;</span>,</code>
              <code className="block text-white/80">&nbsp;&nbsp;&nbsp;&nbsp;listening: <span className="text-[oklch(45%_0.1_150)]">&quot;WhisperSTT&quot;</span>,</code>
              <code className="block text-white/80">&nbsp;&nbsp;&nbsp;&nbsp;targetScore: <span className="text-[oklch(75%_0.15_50)]">850</span>,</code>
              <code className="block text-white/80">&nbsp;&nbsp;&nbsp;&nbsp;forgettingCurve: <span className="text-[oklch(75%_0.15_50)]">null</span></code>
              <code className="block text-white/70">&nbsp;&nbsp;{"});"}</code>
              <code className="block text-white/70">{"};"}</code>

              <div className="mt-8 flex gap-4 border-t border-white/10 pt-6">
                <div className="rounded-lg border border-[oklch(45%_0.1_150)]/30 bg-[oklch(45%_0.1_150)]/20 px-4 py-1.5 text-[11px] text-[oklch(45%_0.1_150)] font-bold">
                  TOEIC ETS 2024
                </div>
                <div className="rounded-lg bg-white/10 px-4 py-1.5 text-[11px] text-white/60 font-mono">v2.5.0-ai</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="islands" className="relative px-6 py-40">
        <div className="mb-24 text-center relative">
          <h2 className="absolute left-0 right-0 top-0 select-none text-[12vw] font-bold leading-none tracking-[-0.05em] opacity-5 pointer-events-none">
            LINGOSPHERE
          </h2>
          <span className="mb-4 block text-[11px] uppercase tracking-[0.5em] text-[oklch(75%_0.15_50)] font-bold">
            Khám Phá Hệ Sinh Thái Học Tập
          </span>
          <h3 className="text-3xl sm:text-5xl font-bold tracking-tighter">4 Trụ Cột Đột Phá Điểm Số</h3>
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {islands.map((item) => (
            <div
              key={item.node}
              className={`parallax-island glass-card group relative overflow-hidden rounded-[40px] p-10 ${item.topOffset}`}
            >
              <div
                className={[
                  "absolute -top-20 -right-20 h-40 w-40 blur-[80px] transition-all",
                  item.accent === "lantern"
                    ? "bg-[oklch(75%_0.15_50)]/20 group-hover:bg-[oklch(75%_0.15_50)]/40"
                    : item.accent === "moss"
                      ? "bg-[oklch(45%_0.1_150)]/20 group-hover:bg-[oklch(45%_0.1_150)]/40"
                      : "bg-white/10 group-hover:bg-white/20",
                ].join(" ")}
              />
              <div
                className={[
                  "mb-6 font-mono text-[11px] font-bold tracking-widest",
                  item.accent === "lantern" ? "text-[oklch(75%_0.15_50)]" : item.accent === "moss" ? "text-[oklch(45%_0.1_150)]" : "opacity-60",
                ].join(" ")}
              >
                {item.node}
              </div>
              <h4 className="mb-4 text-2xl font-bold tracking-tight text-white">{item.title}</h4>
              <p className="mb-8 text-sm leading-relaxed text-white/60">{item.description}</p>
              <div className="flex gap-2">
                <div className="h-[1px] w-8 bg-white/30" />
                <div
                  className={[
                    "h-[1px] w-2",
                    item.accent === "lantern" ? "bg-[oklch(75%_0.15_50)]" : item.accent === "moss" ? "bg-[oklch(45%_0.1_150)]" : "bg-white/50",
                  ].join(" ")}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="manifesto" className="relative overflow-hidden py-40">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_rgba(255,170,80,0.08)_0%,_transparent_70%)]" />
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <h2 className="mb-16 font-serif text-4xl sm:text-6xl md:text-7xl font-light leading-tight tracking-tighter italic text-white/95">
            Tiếng Anh không phải để học vẹt, mà là công cụ của <span className="text-[oklch(75%_0.15_50)] font-normal not-italic">tư duy logic</span>.
          </h2>

          <div className="grid grid-cols-2 gap-8 sm:gap-12 border-t border-white/10 pt-16 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="mb-2 text-3xl sm:text-4xl font-extrabold text-white">{stat.value}</div>
                <div className="text-[11px] uppercase tracking-widest text-white/50 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="stargazer" className="relative overflow-hidden bg-black/90 px-8 pb-16 pt-40">
        <div className="absolute top-0 left-1/2 h-[100vh] w-[200vw] -translate-x-1/2 -translate-y-1/2 rounded-[100%] border border-white/5 opacity-20" />

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-end gap-20 md:grid-cols-2">
          <div className="space-y-8">
            <div className="animate-[pulse-soft_4s_ease-in-out_infinite] flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 glass-card">
              <div className="h-2.5 w-2.5 rounded-full bg-[oklch(75%_0.15_50)]" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter">Sẵn sàng bứt phá?</h2>
            <p className="max-w-md text-base italic text-white/50 leading-relaxed">
              Hơn 20,000 học viên đã làm chủ tiếng Anh cùng LingoSphere. Nhập email hoặc bấm vào bàn học để trải nghiệm ngay.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/home">
                <button className="rounded-xl bg-[oklch(75%_0.15_50)] px-8 py-4 text-[11px] font-black uppercase tracking-widest text-[oklch(20%_0.08_280)] hover:opacity-90 transition-all cursor-pointer">
                  Vào Bàn Học Ngay
                </button>
              </Link>
              <Link href="/toeic">
                <button className="rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all cursor-pointer">
                  Thi Thử TOEIC ETS
                </button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 text-right">
            <div className="space-y-3">
              <div className="mb-6 text-[11px] uppercase tracking-[0.3em] text-[oklch(75%_0.15_50)] font-bold">Khóa Học</div>
              <Link href="/courses" className="block text-sm text-white/50 transition-all hover:text-white">
                TOEIC Foundation 450+
              </Link>
              <Link href="/courses" className="block text-sm text-white/50 transition-all hover:text-white">
                TOEIC Intensive 750+
              </Link>
              <Link href="/speaking" className="block text-sm text-white/50 transition-all hover:text-white">
                Luyện Nói Whisper AI
              </Link>
              <Link href="/vocabulary" className="block text-sm text-white/50 transition-all hover:text-white">
                Từ Vựng SRS Flashcard
              </Link>
            </div>
            <div className="space-y-3">
              <div className="mb-6 text-[11px] uppercase tracking-[0.3em] text-[oklch(75%_0.15_50)] font-bold">Hệ Thống</div>
              <Link href="/home" className="block text-sm text-white/50 transition-all hover:text-white">
                Bàn Học (Dashboard)
              </Link>
              <Link href="/ai-learning" className="block text-sm text-white/50 transition-all hover:text-white">
                Gia Sư AI 24/7
              </Link>
              <Link href="/leaderboard" className="block text-sm text-white/50 transition-all hover:text-white">
                Bảng Xếp Hạng
              </Link>
              <Link href="/journal" className="block text-sm text-white/50 transition-all hover:text-white">
                Nhật Ký Tiếng Anh
              </Link>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-32 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">© 2026 LingoSphere / Học Viện Tiếng Anh Tư Duy</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            <span className="text-[10px] uppercase tracking-widest text-white/50 font-medium">Hệ Thống Trực Tuyến: 24/7 AI Tutor Sẵn Sàng</span>
          </div>
        </div>
      </footer>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Cuộn lên đầu trang"
          className="fixed bottom-8 right-8 z-[100] flex h-12 w-12 items-center justify-center rounded-none border border-white/30 bg-black/70 backdrop-blur-xl text-white shadow-2xl transition-all duration-300 hover:border-[oklch(75%_0.15_50)] hover:bg-[oklch(75%_0.15_50)] hover:text-black hover:scale-110 cursor-pointer"
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
        </button>
      )}

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

        .lantern-glow {
          background: rgba(255, 170, 80, 0.05);
          backdrop-filter: blur(12px) saturate(1.5);
          border: 1px solid rgba(255, 170, 80, 0.2);
          box-shadow:
            0 0 30px rgba(255, 170, 80, 0.05),
            inset 0 0 10px rgba(255, 170, 80, 0.05);
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .lantern-glow:hover {
          background: rgba(255, 170, 80, 0.15);
          box-shadow: 0 0 50px rgba(255, 170, 80, 0.3);
          border-color: rgba(255, 170, 80, 0.5);
          transform: translateY(-5px);
        }

        .shimmer-text {
          background: linear-gradient(90deg, #fff 0%, #ffaa50 50%, #fff 100%);
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
          border-color: rgba(255, 170, 80, 0.3);
        }

        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition:
            opacity 0.8s ease,
            transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .reveal.in {
          opacity: 1;
          transform: translateY(0);
        }

        .ascending-bg {
          background: oklch(calc(20% - (var(--scroll) * 15%)) 0.08 280);
          transition: background 0.2s linear;
        }

        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-25px);
          }
        }

        @keyframes float-mid {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-18px);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @keyframes pulse-soft {
          0%,
          100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }
      `}</style>
    </main>
  )
}