// Trang chủ chính (Landing Page) của LingoSphere.
'use client'

import { useEffect, useRef, useState, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { LingoShowcase } from "@/features/landing/components/lingo.showcase"
import { LingoPerformance } from "@/features/landing/components/lingo.performance"
import { ClickSpark } from "@/components/click.spark"
import { useLandingLocale } from "@/features/landing/components/landing.locales"
import { LandingHeader } from "@/features/landing/components/landing.header"
import { LandingHero } from "@/features/landing/components/landing.hero"
import { LandingWorkbench } from "@/features/landing/components/landing.workbench"
import { LandingIslands } from "@/features/landing/components/landing.islands"
import { LandingManifesto } from "@/features/landing/components/landing.manifesto"
import { LandingLanyardSection } from "@/features/landing/components/landing.lanyard.section"
import { LandingFooter } from "@/features/landing/components/landing.footer"

export default function RootLandingPage() {
  const { lang, toggleLang, t } = useLandingLocale()

  const heroVideoContainerRef = useRef<HTMLDivElement | null>(null)
  const videoARef = useRef<HTMLVideoElement | null>(null)
  const videoBRef = useRef<HTMLVideoElement | null>(null)
  const [activeVideo, setActiveVideo] = useState<"A" | "B">("A")
  const isTransitioningRef = useRef<boolean>(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isHeaderHidden, setIsHeaderHidden] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const lastScrollYRef = useRef(0)

  const navItems = useMemo(
    () => [
      { href: "#workbench", label: t.nav.workbench },
      { href: "#showcase", label: t.nav.showcase },
      { href: "#performance", label: t.nav.performance },
      { href: "#islands", label: t.nav.islands },
      { href: "#manifesto", label: t.nav.manifesto },
      { href: "#stargazer", label: t.nav.stargazer },
    ],
    [t.nav]
  )

  const islandsData = useMemo(() => {
    const accents = [
      { color: "#48c9b0", offset: "lg:translate-y-0" },
      { color: "#34d399", offset: "lg:translate-y-12 sm:translate-y-6" },
      { color: "#c084fc", offset: "lg:translate-y-3" },
      { color: "#38bdf8", offset: "lg:translate-y-16 sm:translate-y-6" },
    ]
    return t.pillars.items.map((item, idx) => ({
      ...item,
      electricColor: accents[idx]?.color || "#48c9b0",
      topOffset: accents[idx]?.offset || "",
    }))
  }, [t.pillars.items])

  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const currentVideo = e.currentTarget
    const duration = currentVideo.duration
    if (!duration || isNaN(duration) || isTransitioningRef.current) return

    if (duration - currentVideo.currentTime <= 0.1) {
      isTransitioningRef.current = true

      if (activeVideo === "A") {
        const next = videoBRef.current
        if (next) {
          next.currentTime = 0
          next.play().then(() => {
            setActiveVideo("B")
            setTimeout(() => {
              isTransitioningRef.current = false
            }, 800)
          }).catch(() => {
            isTransitioningRef.current = false
          })
        }
      } else {
        const next = videoARef.current
        if (next) {
          next.currentTime = 0
          next.play().then(() => {
            setActiveVideo("A")
            setTimeout(() => {
              isTransitioningRef.current = false
            }, 800)
          }).catch(() => {
            isTransitioningRef.current = false
          })
        }
      }
    }
  }

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
    const prevTheme = document.documentElement.dataset.theme
    const prevDark = document.documentElement.classList.contains("dark")

    document.documentElement.classList.add("scroll-smooth", "dark")
    document.documentElement.setAttribute("data-theme", "dark")

    return () => {
      document.documentElement.classList.remove("scroll-smooth")
      if (!prevDark) {
        document.documentElement.classList.remove("dark")
      }
      if (prevTheme) {
        document.documentElement.dataset.theme = prevTheme
      }
    }
  }, [])

  useEffect(() => {
    let ticking = false

    const update = () => {
      const scrollY = window.scrollY
      const deltaY = scrollY - lastScrollYRef.current

      setIsScrolled(scrollY > 20)
      setShowScrollTop(scrollY > 250)

      if (scrollY <= 60) {
        setIsHeaderHidden(false)
      } else if (deltaY < -6) {
        setIsHeaderHidden(false)
      } else if (deltaY > 45 && scrollY > 120) {
        setIsHeaderHidden(true)
      }

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
    update()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <main className="relative overflow-x-hidden bg-[oklch(20%_0.08_280)] text-white antialiased">
      <ClickSpark sparkColor="#5eead4" sparkSize={14} sparkRadius={26} sparkCount={8} duration={450}>
        <div className="noise pointer-events-none fixed inset-0 z-[9999]" />

        <LandingHeader
          isHeaderHidden={isHeaderHidden}
          isScrolled={isScrolled}
          navItems={navItems}
          lang={lang}
          toggleLang={toggleLang}
          t={t}
          onScrollToTop={scrollToTop}
        />

        <LandingHero
          t={t}
          heroVideoContainerRef={heroVideoContainerRef}
          videoARef={videoARef}
          videoBRef={videoBRef}
          activeVideo={activeVideo}
          onVideoTimeUpdate={handleVideoTimeUpdate}
          onScrollToWorkbench={() => scrollToSection("workbench")}
        />

        <LandingWorkbench t={t} />

        <LingoShowcase lang={lang} />
        <LingoPerformance lang={lang} />

        <LandingIslands t={t} islandsData={islandsData} />

        <LandingManifesto t={t} />

        <LandingLanyardSection t={t} lang={lang} />

        <LandingFooter t={t} />

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
      </ClickSpark>
    </main>
  )
}
