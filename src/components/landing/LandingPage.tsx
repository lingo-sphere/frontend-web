'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Icon } from '@/components/icons/icon-map'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { useDashboardStore } from '@/store/dashboard-store'

export function LandingPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const theme = useDashboardStore((state) => state.theme)
  const toggleTheme = useDashboardStore((state) => state.toggleTheme)

  const [bannerVisible, setBannerVisible] = useState(true)
  const [, setSelectedCategory] = useState<'toeic' | 'skills' | 'kids' | 'all'>('toeic')
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleLanguage = () => {
    const nextLang = isVi ? 'en' : 'vi'
    i18n.changeLanguage(nextLang)
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#242938] font-sans antialiased selection:bg-[#D14242]/20 selection:text-[#D14242] relative">
      {/* ─── 1. TOP HEADER (STICKY TOP-0 VỚI SHADOW KHI CUỘN) ─── */}
      <header
        className={`sticky top-0 z-50 w-full border-b border-[#E3E7ED] bg-white/95 backdrop-blur-md transition-all duration-300 ${
          isScrolled ? 'shadow-md shadow-[#304278]/10' : ''
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1340px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo DOL LingoSphere */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D14242] text-white shadow-md shadow-[#D14242]/25 transition-transform group-hover:scale-105">
              <span className="font-black text-lg">L</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-[#242938] leading-none">
                LINGO<span className="text-[#D14242]">SPHERE</span>
              </span>
              <span className="text-[10px] font-extrabold text-[#7C8793] tracking-wider uppercase mt-0.5">
                TIẾNG ANH TƯ DUY
              </span>
            </div>
          </Link>

          {/* Nav Menu */}
          <nav className="hidden xl:flex items-center gap-6 text-[14px] font-semibold text-[#242938]">
            <div className="relative group cursor-pointer py-5 flex items-center gap-1 hover:text-[#D14242]">
              <span>Về LingoSphere</span>
              <Icon name="chevronDown" size={14} className="text-[#7C8793] group-hover:text-[#D14242]" />
            </div>

            <div className="relative group cursor-pointer py-5 flex items-center gap-1 hover:text-[#D14242]">
              <span>Điểm khác biệt</span>
              <Icon name="chevronDown" size={14} className="text-[#7C8793] group-hover:text-[#D14242]" />
            </div>

            <Link href="#methodology" className="hover:text-[#D14242] transition-colors">
              LingoThinking
            </Link>

            <Link href="#hall-of-fame" className="hover:text-[#D14242] transition-colors">
              Điểm và review
            </Link>

            <div className="relative group cursor-pointer py-5 flex items-center gap-1 hover:text-[#D14242]">
              <span>Khóa học</span>
              <Icon name="chevronDown" size={14} className="text-[#7C8793] group-hover:text-[#D14242]" />
            </div>

            <div className="relative group cursor-pointer py-5 flex items-center gap-1 hover:text-[#D14242]">
              <span>Lịch khai giảng</span>
              <Icon name="chevronDown" size={14} className="text-[#7C8793] group-hover:text-[#D14242]" />
            </div>

            <div className="relative group cursor-pointer py-5 flex items-center gap-1 hover:text-[#D14242]">
              <span>Kiến thức</span>
              <Icon name="chevronDown" size={14} className="text-[#7C8793] group-hover:text-[#D14242]" />
            </div>

            <Link href="/toeic" className="hover:text-[#D14242] transition-colors">
              Đề thi ETS
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E3E7ED] bg-[#F4F4F6] text-[#5A6877] hover:text-[#242938]"
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
            </button>

            <button
              onClick={toggleLanguage}
              aria-label="Toggle language"
              className="flex h-9 items-center gap-1 rounded-lg border border-[#E3E7ED] bg-[#F4F4F6] px-2.5 text-xs font-bold text-[#5A6877] hover:text-[#242938]"
            >
              <Icon name="globe" size={13} />
              <span>{isVi ? 'VN' : 'EN'}</span>
            </button>

            <Link href="/home">
              <Button className="h-9 rounded-lg bg-[#D14242] hover:bg-[#DE4C47] px-4 text-xs font-bold text-white shadow-md shadow-[#D14242]/20 transition-all cursor-pointer">
                Vào Bàn Học
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── 2. TOP BANNER KHAI GIẢNG (GIỐNG 100% THANH MÀU XANH NHẠT CỦA DOL) ─── */}
      {bannerVisible && (
        <div className="bg-[#EBF7F0] border-b border-[#D1EEDD] py-2.5 px-4 transition-all">
          <div className="mx-auto max-w-[1340px] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#358756]/15 text-[#358756]">
                <Icon name="calendar" size={18} />
              </div>
              <div className="text-xs text-[#242938] leading-tight">
                <span className="font-bold text-[#358756]">Đã có lịch khai giảng tháng 8, 9 với ưu đãi đặc biệt</span>
                <span className="hidden md:inline text-[#5A6877]">
                  {' '}— Các khóa học: <strong className="text-[#242938]">TOEIC / 4 KỸ NĂNG / TỪ VỰNG SRS / GIA SƯ AI</strong> tư duy tháng 8, 9 đang hết slot rất nhanh <strong>với ưu đãi đặc biệt</strong> của năm.
                </span>
                <Link href="/home" className="text-[#358756] font-bold hover:underline ml-2">
                  Xem ngay →
                </Link>
              </div>
            </div>
            <button
              onClick={() => setBannerVisible(false)}
              className="text-[#7C8793] hover:text-[#242938] p-1 rounded-md"
              aria-label="Close banner"
            >
              <Icon name="x" size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ─── 3. RIGHT FLOATING SIDEBAR WIDGETS (GIỐNG 100% CÁC NÚT BÊN PHẢI CỦA DOL) ─── */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-2.5 pr-1">
        {/* Nút 1: Điểm & Review */}
        <Link
          href="#hall-of-fame"
          className="group flex flex-col items-center justify-center w-[76px] py-2.5 rounded-l-2xl bg-white border border-[#E3E7ED] border-r-0 shadow-lg shadow-[#304278]/10 hover:translate-x-[-4px] transition-all"
        >
          <div className="h-9 w-9 rounded-xl bg-[#358756] text-white flex items-center justify-center font-black text-xs shadow-sm">
            ⭐ 850+
          </div>
          <span className="text-[11px] font-bold text-[#358756] mt-1 text-center leading-tight">
            Điểm &amp; Review
          </span>
        </Link>

        {/* Nút 2: LingoThinking */}
        <Link
          href="#methodology"
          className="group flex flex-col items-center justify-center w-[76px] py-2.5 rounded-l-2xl bg-white border border-[#E3E7ED] border-r-0 shadow-lg shadow-[#304278]/10 hover:translate-x-[-4px] transition-all"
        >
          <div className="h-9 w-9 rounded-xl bg-[#D14242] text-white flex items-center justify-center shadow-sm">
            <Icon name="sparkles" size={18} />
          </div>
          <span className="text-[11px] font-bold text-[#D14242] mt-1 text-center leading-tight">
            Lingo<br />thinking
          </span>
        </Link>

        {/* Nút 3: Sách độc quyền */}
        <Link
          href="/vocabulary"
          className="group flex flex-col items-center justify-center w-[76px] py-2.5 rounded-l-2xl bg-white border border-[#E3E7ED] border-r-0 shadow-lg shadow-[#304278]/10 hover:translate-x-[-4px] transition-all"
        >
          <div className="h-9 w-9 rounded-xl bg-[#5243AA] text-white flex items-center justify-center shadow-sm">
            <Icon name="cards" size={18} />
          </div>
          <span className="text-[11px] font-bold text-[#5243AA] mt-1 text-center leading-tight">
            Sách độc quyền
          </span>
        </Link>
      </div>

      {/* ─── 4. FLOATING MESSENGER & ZALO (GÓC PHẢI DƯỚI GIỐNG DOL) ─── */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        <Link
          href="/ai-learning"
          aria-label="Gia sư AI"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0084FF] text-white shadow-xl shadow-[#0084FF]/30 hover:scale-110 transition-transform"
        >
          <Icon name="bot" size={22} />
        </Link>
        <Link
          href="/home"
          aria-label="Zalo tư vấn"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0068FF] text-white font-black text-xs shadow-xl shadow-[#0068FF]/30 hover:scale-110 transition-transform"
        >
          Zalo
        </Link>
      </div>

      {/* ─── 5. HERO SECTION CHÍNH (CHUẨN 100% CẤU TRÚC ẢNH CHỤP) ─── */}
      <section className="relative pt-10 pb-24 overflow-hidden">
        <div className="mx-auto max-w-[1340px] px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Top Pill Badges (IELTS, THCS, Flyers -> TOEIC, THCS, SKILLS) */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2.5 mb-6"
          >
            <span className="inline-flex items-center justify-center rounded-full bg-[#D14242] text-white font-black text-xs px-4 py-1.5 shadow-sm">
              TOEIC
            </span>
            <span className="inline-flex items-center justify-center rounded-full bg-[#1E293B] text-white font-black text-xs px-4 py-1.5 shadow-sm">
              4 KỸ NĂNG
            </span>
            <span className="inline-flex items-center justify-center rounded-full bg-[#1D4ED8] text-white font-black text-xs px-4 py-1.5 shadow-sm">
              AI TUTOR
            </span>
          </motion.div>

          {/* Main Hero Heading */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-1"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#242938] tracking-tight">
              Học viện Tiếng Anh Tư Duy
            </h1>
            <div className="text-4xl sm:text-5xl md:text-6xl font-black text-[#D14242] tracking-tight flex items-center justify-center gap-2">
              <span>LingoSphere</span>
              <span className="text-[#D14242] text-2xl sm:text-3xl animate-bounce">✨</span>
            </div>
          </motion.div>

          {/* Key Stats Bar (Linearthinking | 4,000+ | 20,000+) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 my-10"
          >
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-black text-[#242938]">LingoThinking</div>
              <div className="text-[11px] font-bold text-[#7C8793] uppercase tracking-wider mt-0.5">
                TIẾNG ANH TƯ DUY
              </div>
            </div>

            <div className="h-8 w-[1px] bg-[#E3E7ED] hidden sm:block" />

            <div className="text-center">
              <div className="text-xl sm:text-2xl font-black text-[#242938]">4,000+</div>
              <div className="text-[11px] font-bold text-[#7C8793] uppercase tracking-wider mt-0.5">
                HỌC VIÊN ĐẠT 850+ TOEIC
              </div>
            </div>

            <div className="h-8 w-[1px] bg-[#E3E7ED] hidden sm:block" />

            <div className="text-center">
              <div className="text-xl sm:text-2xl font-black text-[#242938]">20,000+</div>
              <div className="text-[11px] font-bold text-[#7C8793] uppercase tracking-wider mt-0.5">
                TÂM TÌNH HỌC VIÊN
              </div>
            </div>
          </motion.div>

          {/* ─── VÒNG CUNG HỌC VIÊN + KHUNG TRUNG TÂM 4 KHỐI (CHUẨN 100% ẢNH DOL) ─── */}
          <div className="relative mx-auto max-w-4xl pt-4">
            {/* Ảnh học viên cánh trái 1 */}
            <div className="hidden lg:block absolute -left-28 top-6 z-0 w-36 rounded-2xl overflow-hidden shadow-lg border-2 border-white -rotate-6">
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 h-28 flex flex-col items-center justify-center p-3 text-center">
                <span className="text-2xl">🎓</span>
                <span className="text-[10px] font-bold text-[#242938] mt-1">Lớp TOEIC 850+</span>
              </div>
            </div>

            {/* Ảnh học viên cánh trái 2 */}
            <div className="hidden lg:block absolute -left-20 bottom-0 z-0 w-36 rounded-2xl overflow-hidden shadow-lg border-2 border-white -rotate-12">
              <div className="bg-gradient-to-br from-success/20 to-primary/20 h-28 flex flex-col items-center justify-center p-3 text-center">
                <span className="text-2xl">🏆</span>
                <span className="text-[10px] font-bold text-[#242938] mt-1">Thủ khoa 990</span>
              </div>
            </div>

            {/* Ảnh học viên cánh phải 1 */}
            <div className="hidden lg:block absolute -right-28 top-6 z-0 w-36 rounded-2xl overflow-hidden shadow-lg border-2 border-white rotate-6">
              <div className="bg-gradient-to-br from-accent/20 to-warning/20 h-28 flex flex-col items-center justify-center p-3 text-center">
                <span className="text-2xl">🌟</span>
                <span className="text-[10px] font-bold text-[#242938] mt-1">Đội ngũ Giảng viên</span>
              </div>
            </div>

            {/* Ảnh học viên cánh phải 2 */}
            <div className="hidden lg:block absolute -right-20 bottom-0 z-0 w-36 rounded-2xl overflow-hidden shadow-lg border-2 border-white rotate-12">
              <div className="bg-gradient-to-br from-primary/20 to-success/20 h-28 flex flex-col items-center justify-center p-3 text-center">
                <span className="text-2xl">🚀</span>
                <span className="text-[10px] font-bold text-[#242938] mt-1">Học viên xuất sắc</span>
              </div>
            </div>

            {/* KHUNG TRUNG TÂM 4 KHỐI PHÂN LOẠI (GIỐNG 100% CARD TRONG ẢNH) */}
            <div className="relative z-10 rounded-3xl border border-[#E3E7ED] bg-white shadow-xl overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E3E7ED]">
                {/* Khối 1: TOEIC Người Lớn */}
                <Link
                  href="/courses"
                  className="p-8 text-center hover:bg-[#F9FAFA] transition-colors group cursor-pointer"
                >
                  <div className="flex justify-center mb-3">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-[#D14242] text-white">
                      TOEIC
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#242938] group-hover:text-[#D14242] transition-colors">
                    TOEIC Người Lớn
                  </h3>
                  <p className="text-xs text-[#7C8793] mt-1">
                    Học sinh THPT, Sinh viên &amp; Người đi làm
                  </p>
                </Link>

                {/* Khối 2: 4 Kỹ Năng & Giao Tiếp */}
                <Link
                  href="/speaking"
                  className="p-8 text-center hover:bg-[#F9FAFA] transition-colors group cursor-pointer"
                >
                  <div className="flex justify-center mb-3">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-[#1E293B] text-white">
                      4 KỸ NĂNG
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#242938] group-hover:text-[#D14242] transition-colors">
                    Luyện Nói Whisper &amp; Viết AI
                  </h3>
                  <p className="text-xs text-[#7C8793] mt-1">
                    Chuẩn hóa phát âm và tư duy viết học thuật
                  </p>
                </Link>
              </div>

              <div className="border-t border-[#E3E7ED] grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E3E7ED]">
                {/* Khối 3: Flashcard SRS */}
                <Link
                  href="/vocabulary"
                  className="p-6 text-center hover:bg-[#F9FAFA] transition-colors group cursor-pointer"
                >
                  <span className="text-sm font-extrabold text-[#242938] group-hover:text-[#D14242] transition-colors uppercase tracking-wider">
                    TỪ VỰNG SRS
                  </span>
                </Link>

                {/* Khối 4: Tổng Hợp */}
                <Link
                  href="/courses"
                  className="p-6 text-center hover:bg-[#F9FAFA] transition-colors group cursor-pointer"
                >
                  <span className="text-sm font-extrabold text-[#242938] group-hover:text-[#D14242] transition-colors uppercase tracking-wider">
                    TỔNG HỢP KHÓA HỌC
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. FOOTER ─── */}
      <footer className="border-t border-[#E3E7ED] bg-white py-12 text-center text-xs text-[#7C8793]">
        <div className="mx-auto max-w-[1340px] px-4 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D14242] text-white font-black text-xs">
              L
            </div>
            <span className="text-base font-black text-[#242938]">
              Lingo<span className="text-[#D14242]">Sphere</span>
            </span>
          </div>
          <p>© {new Date().getFullYear()} LingoSphere - Hệ Sinh Thái Học Tiếng Anh Tư Duy Chuẩn Quốc Tế.</p>
        </div>
      </footer>
    </div>
  )
}
