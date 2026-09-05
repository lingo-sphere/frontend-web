/**
 * @file page.tsx
 * @description Thành phần Page phục vụ phía người học (Web Client)
 */

'use client'

/**
 * @file page.tsx
 * @description Trang chủ chính (Landing Page) của LingoSphere
 */

import { useEffect, useRef, useState, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronUp } from "lucide-react"
import { LingoShowcase } from "@/components/landing/lingo.showcase"
import { LingoPerformance } from "@/components/landing/lingo.performance"
import { ClickSpark } from "@/components/ui/click.spark"
import { useLandingLocale } from "@/components/landing/landing.locales"
import { LandingHeader } from "@/components/landing/landing.header"
import { LandingHero } from "@/components/landing/landing.hero"
import { LandingWorkbench } from "@/components/landing/landing.workbench"
import { LandingIslands } from "@/components/landing/landing.islands"
import { LandingManifesto } from "@/components/landing/landing.manifesto"
import { LandingLanyardSection } from "@/components/landing/landing.lanyard.section"
import { LandingFooter } from "@/components/landing/landing.footer"

export default function RootLandingPage() {
  const { lang, toggleLang, t } = useLandingLocale()

  const heroVideoContainerRef = useRef<HTMLDivElement | null>(null)
  const videoARef = useRef<HTMLVideoElement | null>(null)
  const videoBRef = useRef<HTMLVideoElement | null>(null)
  const [activeVideo, setActiveVideo] = useState<"A" | "B">("A")
  const isTransitioningRef = useRef<boolean>(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isHeaderHidden, setIsHeaderHidden] = useState(false)
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

      setShowScrollTop(scrollY > 250)
      setIsScrolled(scrollY > 20)

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
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-none border border-[#48c9b0]/60 bg-black/85 text-[#48c9b0] shadow-[0_0_20px_rgba(72,201,176,0.35)] backdrop-blur-md transition-all hover:scale-110 hover:bg-[#2f7f78] hover:text-white hover:border-[#5eead4] hover:shadow-[0_0_25px_rgba(94,234,212,0.6)] cursor-pointer active:scale-95"
              aria-label="Cuộn lên đầu trang"
            >
              <ChevronUp className="h-5 w-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </ClickSpark>
    </main>
  )
}
