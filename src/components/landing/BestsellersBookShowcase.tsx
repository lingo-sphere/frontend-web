"use client"

import { useState, type CSSProperties } from "react"
import { motion } from "motion/react"
import { BookOpen, Sparkles, Loader2 } from "lucide-react"

export interface BestsellersBookShowcaseProps {
  className?: string
  title?: string
  sourceUrl?: string
  height?: string | number
  style?: CSSProperties
  showBadge?: boolean
  headingFont?: string
  bodyFont?: string
  headingWeight?: string
  bodyWeight?: string
  primaryColor?: string
  headingSize?: number
  bodySize?: number
  headingLetterSpacing?: number
}

export function BestsellersBookShowcase({
  className = "",
  title = "Field Manuals — Tools for Thought",
  sourceUrl = "/landing-pages/bestsellers-book-showcase.html",
  height = "86vh",
  style,
  showBadge = true,
}: BestsellersBookShowcaseProps) {
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  return (
    <div
      className={`relative w-full overflow-hidden rounded-3xl border border-white/10 bg-[#1a1712] shadow-[0_25px_80px_rgba(0,0,0,0.85),0_0_50px_rgba(195,164,123,0.12)] transition-all duration-500 hover:border-[#c3a47b]/30 ${className}`}
      style={{
        minHeight: "680px",
        height: typeof height === "number" ? `${height}px` : height,
        maxHeight: "960px",
        ...style,
      }}
    >
      {/* 🌟 Ambient Glow Backgrounds */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#c3a47b]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[#5f684f]/15 blur-3xl" />

      {/* ⏳ Smooth Loading Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#1d1a15] text-[#eee2ca] gap-4">
          <div className="relative flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#c3a47b]" />
            <BookOpen className="absolute h-5 w-5 text-[#dbc39c]/80" />
          </div>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <span className="font-serif text-lg font-medium tracking-wide text-[#eee2ca]">
              Đang tải Thư Viện Sách 3D...
            </span>
            <span className="text-xs uppercase tracking-[0.2em] text-[#c5b79e]/60">
              Interactive 3D Book Showcase
            </span>
          </div>
        </div>
      )}

      {/* 🏷️ Interactive Hint Badge */}
      {showBadge && isLoaded && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="pointer-events-none absolute top-4 right-4 z-20 hidden sm:flex items-center gap-2 rounded-full border border-[#c3a47b]/30 bg-[#1d1a15]/80 px-3.5 py-1.5 text-xs text-[#eee2ca] shadow-lg backdrop-blur-md"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#dbc39c] animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#c5b79e]">
            Kéo chuột & Click để lật sách 3D
          </span>
        </motion.div>
      )}

      {/* 📖 Standalone Byte-Exact WebGL/3D iframe Host */}
      <iframe
        src={sourceUrl}
        title={title}
        className={`h-full w-full border-0 transition-opacity duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        allow="fullscreen; accelerometer; gyroscope; autoplay; encrypted-media; clipboard-write; web-share"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals"
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  )
}
