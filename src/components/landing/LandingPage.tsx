"use client"

import { useEffect, useRef } from "react"

const manifestoLines = [
  "Engineering is the poetry of logic.",
  "Every module is a floating island of intention.",
  "We prioritize human rhythm over machine efficiency.",
  "Software should breathe with the person using it.",
]

const navItems = [
  { href: "#workbench", label: "The Forge" },
  { href: "#islands", label: "Archipelago" },
  { href: "#manifesto", label: "Manifesto" },
  { href: "#stargazer", label: "Signal" },
]

const islands = [
  {
    node: "NODE_01",
    title: "Reactive Architecture",
    description:
      "We do not just build interfaces; we build ecosystems that respond to the emotional state of the user.",
    accent: "lantern",
    topOffset: "",
  },
  {
    node: "NODE_02",
    title: "Fluid Motion APIs",
    description:
      "Movement is life. Our motion layer mimics natural sways so the digital feels organic and alive.",
    accent: "moss",
    topOffset: "md:mt-12",
  },
  {
    node: "NODE_03",
    title: "Semantic Clarity",
    description:
      "Code should be readable like a late-night novel. Clean structures tell the story before the comments do.",
    accent: "neutral",
    topOffset: "",
  },
]

const stats = [
  { value: "12ms", label: "Avg Latency" },
  { value: "∞", label: "Creativity" },
  { value: "43k", label: "Lines of Love" },
  { value: "0.1", label: "Energy Bias" },
]

export function LandingPage() {
  const manifestoRef = useRef<HTMLPreElement | null>(null)
  const heroVideoRef = useRef<HTMLVideoElement | null>(null)

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

      <header className="fixed left-0 top-0 z-[100] flex w-full items-center justify-between p-6 mix-blend-difference md:p-10">
        <div className="flex items-center gap-4">
          <div className="h-2 w-2 rounded-full bg-[oklch(75%_0.15_50)]" />
          <div className="text-xl font-medium tracking-tighter">
            HAVEN <span className="font-light opacity-40">CORE</span>
          </div>
        </div>

        <nav className="hidden gap-12 text-[10px] font-bold uppercase tracking-[0.4em] opacity-60 transition-opacity hover:opacity-100 md:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="transition-colors hover:text-[oklch(75%_0.15_50)]">
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <section className="relative flex h-screen w-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video ref={heroVideoRef} autoPlay muted loop playsInline className="hero-mask h-full w-full object-contain">
            <source src="/video.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="relative z-10 px-6 text-center">
          <span className="mb-8 block text-[10px] uppercase tracking-[0.8em] text-[oklch(75%_0.15_50)]/60 animate-[pulse-soft_4s_ease-in-out_infinite]">
            Establishing Connection
          </span>

          <h1 className="shimmer-text mb-8 text-6xl font-bold leading-none tracking-tighter md:text-[9rem] animate-[shimmer_4s_linear_infinite]">
            Soulful
            <br />
            Systems.
          </h1>

          <div className="mx-auto max-w-xl rounded-3xl border border-white/10 p-8 backdrop-blur-sm">
            <p className="mb-10 font-serif text-lg leading-relaxed font-light italic text-white">
              &quot;Engineering is the poetry of logic.&quot;
            </p>
            <button className="lantern-glow rounded-2xl border border-white/10 bg-black/30 px-12 py-5 text-[10px] font-black uppercase tracking-[0.4em] text-white transition-all hover:border-[oklch(75%_0.15_50)] hover:bg-[oklch(75%_0.15_50)]">
              Initiate Workspace
            </button>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 flex -translate-x-1/2 flex-col items-center gap-4">
          <div className="h-12 w-px bg-gradient-to-b from-white to-transparent" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-white">Scroll to Descend</span>
        </div>
      </section>

      <section id="workbench" className="relative min-h-screen px-6 py-60 md:px-24">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-20 lg:grid-cols-2">
          <div className="relative z-10">
            <h2 className="mb-8 text-5xl font-bold tracking-tighter leading-tight">
              The Digital
              <br />
              <span className="font-serif font-light italic text-[oklch(75%_0.15_50)]">Craftsman’s</span> Forge
            </h2>
            <p className="mb-12 max-w-md text-lg leading-relaxed text-white/40">
              Every module is a floating island of logic. We prioritize the human rhythm over machine efficiency, creating tools that breathe with you.
            </p>

            <div className="space-y-6">
              <div className="group flex cursor-help items-center gap-6">
                <div className="glass-card flex h-12 w-12 items-center justify-center rounded-2xl transition-colors group-hover:text-[oklch(75%_0.15_50)]">
                  01
                </div>
                <div className="h-px flex-1 bg-white/10 transition-all group-hover:bg-[oklch(75%_0.15_50)]/30" />
                <span className="text-[10px] uppercase tracking-[0.2em] opacity-40">Latency Optimization</span>
              </div>

              <div className="group flex cursor-help items-center gap-6">
                <div className="glass-card flex h-12 w-12 items-center justify-center rounded-2xl transition-colors group-hover:text-[oklch(45%_0.1_150)]">
                  02
                </div>
                <div className="h-px flex-1 bg-white/10 transition-all group-hover:bg-[oklch(45%_0.1_150)]/30" />
                <span className="text-[10px] uppercase tracking-[0.2em] opacity-40">Reactive Life-cycles</span>
              </div>
            </div>
          </div>

          <div className="workbench-ui animate-[float-slow_8s_ease-in-out_infinite] rounded-[40px] p-1">
            <div className="flex items-center justify-between rounded-t-[39px] border-b border-white/10 bg-black/60 p-6">
              <div className="flex gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
              </div>
              <span className="text-[9px] uppercase tracking-widest text-white/20">core_engine.tsx</span>
            </div>

            <div className="p-10 font-mono text-sm leading-relaxed">
              <code className="block text-white/40">
                <span className="text-[oklch(75%_0.15_50)] italic">import</span> {"{ Soul }"}{" "}
                <span className="text-[oklch(75%_0.15_50)] italic">from</span> <span className="text-[oklch(45%_0.1_150)]">&quot;@haven/core&quot;</span>;
              </code>
              <code className="mt-4 block">
                <span className="text-[oklch(75%_0.15_50)]">const</span> <span className="text-white">Dream</span> = (
                <span className="text-white">intent</span>: <span className="text-[oklch(45%_0.1_150)]">CreativeIntent</span>
                ) =&gt; {"{"}
              </code>
              <code className="block text-white/60">
                &nbsp;&nbsp;<span className="text-[oklch(75%_0.15_50)]">return</span> intent.map(synapse =&gt; ({"{"}
              </code>
              <code className="block">&nbsp;&nbsp;&nbsp;&nbsp;...synapse,</code>
              <code className="block text-white/60">&nbsp;&nbsp;&nbsp;&nbsp;state: <span className="text-[oklch(45%_0.1_150)]">&quot;floating&quot;</span>,</code>
              <code className="block text-white/60">&nbsp;&nbsp;&nbsp;&nbsp;latency: <span className="text-[oklch(75%_0.15_50)]">null</span></code>
              <code className="block text-white/60">&nbsp;&nbsp;{"})"});</code>
              <code className="block text-white/60">{"};"}</code>

              <div className="mt-8 flex gap-4 border-t border-white/5 pt-8">
                <div className="rounded-lg border border-[oklch(45%_0.1_150)]/20 bg-[oklch(45%_0.1_150)]/20 px-4 py-2 text-[10px] text-[oklch(45%_0.1_150)]">
                  Active Session
                </div>
                <div className="rounded-lg bg-white/5 px-4 py-2 text-[10px] text-white/30">v2.4.0-cloud</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="islands" className="relative px-6 py-60">
        <div className="mb-32 text-center">
          <h2 className="absolute left-0 right-0 top-40 select-none text-[10vw] font-bold leading-none tracking-[-0.05em] opacity-5">
            ARCHIPELAGO
          </h2>
          <span className="mb-6 block text-[10px] uppercase tracking-[0.5em] text-[oklch(75%_0.15_50)]">Explore the Cloud Islands</span>
          <h3 className="text-4xl font-bold tracking-tighter md:text-6xl">Personal Nodes of Innovation</h3>
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {islands.map((item) => (
            <div
              key={item.node}
              className={`parallax-island glass-card group relative overflow-hidden rounded-[50px] p-12 ${item.topOffset}`}
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
                  "mb-8 font-mono text-[10px]",
                  item.accent === "lantern" ? "text-[oklch(75%_0.15_50)]" : item.accent === "moss" ? "text-[oklch(45%_0.1_150)]" : "opacity-40",
                ].join(" ")}
              >
                {item.node}
              </div>
              <h4 className="mb-6 text-2xl font-bold tracking-tight">{item.title}</h4>
              <p className="mb-10 text-sm leading-loose text-white/40">{item.description}</p>
              <div className="flex gap-2">
                <div className="h-[1px] w-8 bg-white/20" />
                <div
                  className={[
                    "h-[1px] w-2",
                    item.accent === "lantern" ? "bg-[oklch(75%_0.15_50)]" : item.accent === "moss" ? "bg-[oklch(45%_0.1_150)]" : "bg-white/40",
                  ].join(" ")}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="manifesto" className="relative overflow-hidden py-60">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_rgba(255,170,80,0.05)_0%,_transparent_70%)]" />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-16 font-serif text-6xl font-light leading-tight tracking-tighter italic md:text-8xl">
            Software is the <span className="text-[oklch(75%_0.15_50)]">mirror</span> of the developer&apos;s soul.
          </h2>

          <div className="grid grid-cols-2 gap-12 border-t border-white/5 pt-20 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="mb-2 text-4xl font-bold">{stat.value}</div>
                <div className="text-[10px] uppercase tracking-widest opacity-40">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="stargazer" className="relative overflow-hidden bg-black px-10 pb-20 pt-60">
        <div className="absolute top-0 left-1/2 h-[100vh] w-[200vw] -translate-x-1/2 -translate-y-1/2 rounded-[100%] border border-white/5 opacity-20" />

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-end gap-32 md:grid-cols-2">
          <div className="space-y-12">
            <div className="animate-[pulse-soft_4s_ease-in-out_infinite] flex h-16 w-16 items-center justify-center rounded-full border border-white/5 bg-white/2.5 glass-card">
              <div className="h-2 w-2 rounded-full bg-[oklch(75%_0.15_50)]" />
            </div>
            <h2 className="text-5xl font-bold tracking-tighter">Ready to float?</h2>
            <p className="max-w-sm text-lg italic text-white/30">
              The archipelago is always expanding. Send a signal and join the haven.
            </p>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="your@email.com"
                className="w-full max-w-xs rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-sm outline-none transition-all placeholder:text-white/30 focus:border-[oklch(75%_0.15_50)]/50"
              />
              <button className="rounded-xl bg-[oklch(75%_0.15_50)] px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[oklch(20%_0.08_280)]">
                Connect
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-20 text-right">
            <div className="space-y-4">
              <div className="mb-8 text-[10px] uppercase tracking-[0.3em] text-[oklch(75%_0.15_50)]">Navigation</div>
              <a href="#" className="block text-sm opacity-40 transition-all hover:opacity-100">
                Archive
              </a>
              <a href="#" className="block text-sm opacity-40 transition-all hover:opacity-100">
                Telemetry
              </a>
              <a href="#" className="block text-sm opacity-40 transition-all hover:opacity-100">
                Open Source
              </a>
            </div>
            <div className="space-y-4">
              <div className="mb-8 text-[10px] uppercase tracking-[0.3em] text-[oklch(75%_0.15_50)]">Social Signal</div>
              <a href="#" className="block text-sm opacity-40 transition-all hover:opacity-100">
                GitHub
              </a>
              <a href="#" className="block text-sm opacity-40 transition-all hover:opacity-100">
                LinkedIn
              </a>
              <a href="#" className="block text-sm opacity-40 transition-all hover:opacity-100">
                Bluesky
              </a>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-40 flex flex-col items-center justify-between gap-8 border-t border-white/5 pt-10 md:flex-row">
          <p className="text-[10px] uppercase tracking-[0.5em] text-white/20">© 2026 Code Haven / Soulful Engineering</p>
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 animate-pulse rounded-full bg-green-500" />
            <span className="text-[9px] uppercase tracking-widest text-white/30">System Operational: Clouds Clear</span>
          </div>
        </div>
      </footer>

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