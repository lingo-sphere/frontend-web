"use client"

import React from "react"
import type { LandingLang } from "@/components/landing/landing-locales"

interface LanguageSkewSwitchProps {
  lang: LandingLang
  onToggle: () => void
  className?: string
}

export function LanguageSkewSwitch({
  lang,
  onToggle,
  className = "",
}: LanguageSkewSwitchProps) {
  const isEn = lang === "en"

  return (
    <label
      className={`switch cursor-pointer relative flex w-[6.7rem] scale-[0.8] sm:scale-[0.88] overflow-hidden p-1.5 select-none ${className}`}
      title={isEn ? "Chuyển sang Tiếng Việt" : "Switch to English"}
    >
      <input
        type="checkbox"
        checked={isEn}
        onChange={onToggle}
        className="peer hidden"
        aria-label="Toggle language between Vietnamese and English"
      />

      {/* 🇬🇧 EN State (Slid in from right on checked) */}
      <div className="absolute -right-[6.5rem] z-[1] flex h-10 w-24 skew-x-12 items-center justify-center text-xs font-black tracking-wider text-white duration-500 ease-out peer-checked:right-1.5">
        <span className="-skew-x-12 flex items-center gap-1.5 drop-shadow-[0_0_8px_rgba(94,234,212,0.9)]">
          <span className="text-sm">🇬🇧</span>
          <span className="font-mono text-[#5eead4] font-black">EN</span>
        </span>
      </div>

      {/* ⚡ Skewed Dynamic Background Container */}
      <div className="z-0 h-10 w-24 -skew-x-12 rounded-lg border border-[#48c9b0]/50 bg-black/65 shadow-[0_0_15px_rgba(72,201,176,0.25)] backdrop-blur-md duration-500 ease-out peer-checked:skew-x-12 peer-checked:bg-[#2f7f78]/80 peer-checked:border-[#5eead4] peer-checked:shadow-[0_0_22px_rgba(94,234,212,0.7)]" />

      {/* 🇻🇳 VI State (Visible when unchecked, slides out left on checked) */}
      <div className="absolute left-[0.35rem] z-[1] flex h-10 w-24 -skew-x-12 items-center justify-center text-xs font-black tracking-wider text-white duration-500 ease-out peer-checked:-left-[6.5rem]">
        <span className="skew-x-12 flex items-center gap-1.5 drop-shadow-[0_0_8px_rgba(72,201,176,0.9)]">
          <span className="text-sm">🇻🇳</span>
          <span className="font-mono text-[#48c9b0] font-black">VI</span>
        </span>
      </div>
    </label>
  )
}

export default LanguageSkewSwitch
