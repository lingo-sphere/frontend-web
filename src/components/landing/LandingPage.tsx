'use client'

import { useState } from 'react'
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
  const [activeDemoTab, setActiveDemoTab] = useState<'srs' | 'speaking' | 'writing' | 'toeic'>('srs')
  const [isFlipped, setIsFlipped] = useState(false)

  const toggleLanguage = () => {
    const nextLang = isVi ? 'en' : 'vi'
    i18n.changeLanguage(nextLang)
  }

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      {/* ─── STICKY BLURRED NAVBAR ─── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-surface/80 backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-primary-hover text-white shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
              <span className="font-black text-lg">L</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-text-primary">
                Lingo<span className="text-primary">Sphere</span>
              </span>
              <span className="text-[10px] font-semibold text-text-tertiary tracking-wider uppercase -mt-1">
                AI Ecosystem
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-text-secondary">
            <a href="#features" className="hover:text-primary transition-colors">
              {isVi ? 'Tính Năng' : 'Features'}
            </a>
            <a href="#demo" className="hover:text-primary transition-colors">
              {isVi ? 'Trải Nghiệm' : 'Demo'}
            </a>
            <a href="#toeic" className="hover:text-primary transition-colors">
              {isVi ? 'Luyện Thi TOEIC' : 'TOEIC Exam'}
            </a>
            <a href="#methodology" className="hover:text-primary transition-colors">
              {isVi ? 'Phương Pháp SRS' : 'SRS Method'}
            </a>
            <a href="#reviews" className="hover:text-primary transition-colors">
              {isVi ? 'Đánh Giá' : 'Reviews'}
            </a>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-subtle text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} />
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              aria-label="Toggle language"
              className="flex h-9 items-center gap-1.5 rounded-xl border border-border bg-surface-subtle px-2.5 text-xs font-semibold text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
            >
              <Icon name="globe" size={14} />
              <span>{isVi ? 'VI' : 'EN'}</span>
            </button>

            <Link href="/home">
              <Button className="h-9 gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-102 cursor-pointer">
                <span>{isVi ? 'Vào Bàn Học' : 'Open App'}</span>
                <Icon name="chevronRight" size={15} />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        {/* Glow ambient background effects */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 -z-10 h-[450px] w-[900px] max-w-full rounded-full bg-gradient-to-tr from-primary/20 via-accent/15 to-transparent blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-20 right-10 -z-10 h-72 w-72 rounded-full bg-success/15 blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary shadow-sm backdrop-blur-md"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>{isVi ? '✨ Nền Tảng Học Tiếng Anh & TOEIC Tích Hợp AI Thế Hệ Mới' : '✨ Next-Gen AI Powered English Learning'}</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-4xl text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.15] text-text-primary"
          >
            {isVi ? (
              <>
                Chinh Phục Tiếng Anh & Đột Phá Điểm Số{' '}
                <span className="bg-gradient-to-r from-primary via-primary-focus to-accent bg-clip-text text-transparent">
                  TOEIC 850+ Cùng AI
                </span>
              </>
            ) : (
              <>
                Master English & Achieve{' '}
                <span className="bg-gradient-to-r from-primary via-primary-focus to-accent bg-clip-text text-transparent">
                  TOEIC 850+ With AI
                </span>
              </>
            )}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-base sm:text-lg text-text-secondary leading-relaxed"
          >
            {isVi
              ? 'Hệ sinh thái học tập toàn diện 4 kỹ năng: Luyện thi TOEIC ETS 2024, ghi nhớ từ vựng Spaced Repetition (SRS), luyện nói phát âm cùng Whisper STT và gia sư cá nhân hóa AI tốc độ cao.'
              : 'All-in-one English learning ecosystem: ETS 2024 TOEIC Simulation, Spaced Repetition (SRS) Flashcards, Whisper STT speech evaluation, and instant AI tutor feedback.'}
          </motion.p>

          {/* Dual Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-2"
          >
            <Link href="/home">
              <Button className="h-13 gap-3 rounded-2xl bg-gradient-to-r from-primary to-primary-hover px-8 text-base font-extrabold text-white shadow-xl shadow-primary/30 hover:shadow-primary/45 hover:scale-102 transition-all cursor-pointer">
                <Icon name="sparkles" size={20} />
                <span>{isVi ? 'Bắt Đầu Học Miễn Phí' : 'Start Learning Free'}</span>
                <Icon name="arrowRight" size={18} />
              </Button>
            </Link>
            <a href="#demo">
              <Button variant="outline" className="h-13 gap-2.5 rounded-2xl border-border bg-surface/80 px-7 text-base font-bold text-text-primary backdrop-blur-md hover:bg-surface-hover transition-all cursor-pointer">
                <Icon name="playCircle" size={20} className="text-primary" />
                <span>{isVi ? 'Trải Nghiệm Trực Tiếp' : 'Interactive Demo'}</span>
              </Button>
            </a>
          </motion.div>

          {/* Trust stats bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="pt-6 flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-text-tertiary text-xs font-semibold"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-success" />
              <span className="text-text-primary font-bold text-sm">12,000+</span>
              <span>{isVi ? 'Học viên tích cực' : 'Active learners'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-primary" />
              <span className="text-text-primary font-bold text-sm">990</span>
              <span>{isVi ? 'Thang điểm TOEIC ETS' : 'ETS TOEIC Scale'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-accent" />
              <span className="text-text-primary font-bold text-sm">44</span>
              <span>{isVi ? 'Âm IPA Chuẩn Quốc Tế' : 'IPA Phonetics'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-warning" />
              <span className="text-text-primary font-bold text-sm">0.4s</span>
              <span>{isVi ? 'Phản hồi AI siêu tốc' : 'AI Latency'}</span>
            </div>
          </motion.div>

          {/* ─── FLOATING UI SHOWCASE ─── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="pt-6 relative mx-auto max-w-5xl"
          >
            <div className="rounded-3xl border border-border/80 bg-surface/90 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                {/* Showcase Item 1 */}
                <div className="rounded-2xl bg-surface-subtle border border-border p-5 space-y-3 relative overflow-hidden group hover:border-primary/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                      SRS Flashcard
                    </span>
                    <span className="text-xs text-text-tertiary font-mono">Card #128</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-text-primary">Resilience</h4>
                    <p className="font-mono text-xs text-primary font-semibold">/rɪˈzɪl.jəns/ (noun)</p>
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-2">
                    Khả năng phục hồi, sự kiên cường vượt qua khó khăn thử thách.
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-error/15 text-error font-semibold">Khó (+1d)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-warning/15 text-warning font-semibold">Tốt (+6d)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-success/15 text-success font-semibold">Dễ (+14d)</span>
                  </div>
                </div>

                {/* Showcase Item 2 */}
                <div className="rounded-2xl bg-surface-subtle border border-border p-5 space-y-3 relative overflow-hidden group hover:border-accent/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent/10 text-accent border border-accent/20">
                      Whisper Speech AI
                    </span>
                    <span className="text-xs font-bold text-success">Score: 98%</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">Đánh Giá Phát Âm & Ngữ Điệu</h4>
                    <p className="text-xs text-text-secondary mt-1">&ldquo;I look forward to hearing from you.&rdquo;</p>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px] font-semibold text-text-secondary">
                      <span>Độ chuẩn âm đuôi /d/</span>
                      <span className="text-success">Hoàn hảo</span>
                    </div>
                    <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-success to-primary w-[98%]" />
                    </div>
                  </div>
                </div>

                {/* Showcase Item 3 */}
                <div className="rounded-2xl bg-surface-subtle border border-border p-5 space-y-3 relative overflow-hidden group hover:border-success/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-success/10 text-success border border-success/20">
                      AI Essay Evaluator
                    </span>
                    <span className="text-xs font-bold text-primary">Band 8.0</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">Nhận Xét Sư Phạm</h4>
                    <p className="text-xs text-text-secondary mt-1 bg-surface p-2 rounded-lg border border-border">
                      💡 Thay &apos;good&apos; bằng <strong className="text-primary">&apos;exceptional&apos;</strong> để nâng cao tính học thuật.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
                    <Icon name="checkCircle" size={13} className="text-success" />
                    <span>Đã chấm 12 tiêu chí ngữ pháp</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── BENTO GRID FEATURES ─── */}
      <section id="features" className="py-20 border-t border-border bg-surface-subtle/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              {isVi ? 'Hệ Sinh Thái Học Tập Đột Phá' : 'Complete Ecosystem'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
              {isVi ? 'Tất Cả Công Cụ Bạn Cần Để Làm Chủ Tiếng Anh' : 'Everything You Need to Master English'}
            </h2>
            <p className="mx-auto max-w-2xl text-sm sm:text-base text-text-secondary">
              {isVi
                ? 'Tích hợp đầy đủ từ nền tảng phát âm, vốn từ vựng, rèn luyện 4 kỹ năng đến phòng thi TOEIC thực chiến.'
                : 'From pronunciation foundations to advanced TOEIC simulation, powered by cutting-edge AI.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: TOEIC Exam Engine */}
            <div className="md:col-span-2 rounded-3xl bg-surface border border-border p-8 shadow-sm hover:shadow-md transition-all space-y-4 relative overflow-hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon name="fileText" size={26} />
              </div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-primary text-white">
                TOEIC ETS 2024
              </span>
              <h3 className="text-2xl font-bold text-text-primary">
                {isVi ? 'Phòng Thi Thử TOEIC Chuẩn ETS Full 7 Part' : 'ETS 7-Part TOEIC Full Simulation'}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed max-w-xl">
                {isVi
                  ? 'Trải nghiệm thi thử 200 câu với đồng hồ bấm giờ chuẩn áp lực phòng thi thật. Engine phân tích điểm số từ 10 - 990 và phát hiện chính xác từng Part bạn còn yếu để bù đắp.'
                  : 'Experience 200-question timed tests matching real exam conditions with instant ETS score calculation and weakness diagnosis.'}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {['Part 1: Photographs', 'Part 2: Q&A', 'Part 3: Conversations', 'Part 4: Talks', 'Part 5: Incomplete Sentences', 'Part 6: Text Completion', 'Part 7: Reading Comprehension'].map((part) => (
                  <span key={part} className="text-xs px-2.5 py-1 rounded-lg bg-surface-subtle border border-border text-text-secondary font-medium">
                    {part}
                  </span>
                ))}
              </div>
            </div>

            {/* Feature 2: SRS Vocabulary */}
            <div className="rounded-3xl bg-surface border border-border p-8 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <Icon name="cards" size={26} />
              </div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-accent text-white">
                SuperMemo SM-2
              </span>
              <h3 className="text-2xl font-bold text-text-primary">
                {isVi ? 'Học Từ Vựng Không Quên' : 'Spaced Repetition Flashcards'}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {isVi
                  ? 'Thuật toán lặp lại ngắt quãng tính toán chính xác thời điểm vàng não bộ sắp quên để gợi nhắc ôn tập, giúp từ vựng đi thẳng vào trí nhớ dài hạn.'
                  : 'Scientifically timed review schedules based on Ebbinghaus forgetting curves for maximum retention.'}
              </p>
            </div>

            {/* Feature 3: Whisper Speaking STT */}
            <div className="rounded-3xl bg-surface border border-border p-8 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
                <Icon name="mic" size={26} />
              </div>
              <h3 className="text-xl font-bold text-text-primary">
                {isVi ? 'Luyện Nói & Ngữ Điệu Whisper' : 'Whisper STT Speaking Coach'}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {isVi
                  ? 'Ghi âm trực tiếp trên trình duyệt, Whisper AI nhận diện giọng nói siêu chính xác, chỉ ra lỗi sai phát âm từng âm tiết và hướng dẫn chỉnh sửa.'
                  : 'Browser-based voice recording evaluated by OpenAI Whisper with detailed syllable-level phonetic feedback.'}
              </p>
            </div>

            {/* Feature 4: AI Writing Tutor */}
            <div className="rounded-3xl bg-surface border border-border p-8 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ai/10 text-ai">
                <Icon name="pencil" size={26} />
              </div>
              <h3 className="text-xl font-bold text-text-primary">
                {isVi ? 'Chấm Viết Luận & Sửa Ngữ Pháp AI' : 'AI Essay & Grammar Tutor'}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {isVi
                  ? 'Nộp bài viết đoạn văn hoặc nhật ký hàng ngày để nhận đánh giá chi tiết về từ vựng, cấu trúc ngữ pháp và gợi ý phiên bản viết mượt mà hơn.'
                  : 'Instant writing evaluations highlighting grammatical enhancements and vocabulary tier upgrades.'}
              </p>
            </div>

            {/* Feature 5: Gamification & Streaks */}
            <div className="rounded-3xl bg-surface border border-border p-8 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/10 text-warning">
                <Icon name="flame" size={26} />
              </div>
              <h3 className="text-xl font-bold text-text-primary">
                {isVi ? 'Giữ Streak Lửa & Đua Top BXH' : 'Daily Streak & Leaderboards'}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {isVi
                  ? 'Tạo dựng thói quen học tiếng Anh mỗi ngày thông qua hệ thống Gamification: Tích lũy XP, thăng hạng Level, thu thập huy hiệu và tranh tài BXH.'
                  : 'Stay motivated with daily streaks, XP accumulation, badges, and weekly competitive leaderboards.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── INTERACTIVE DEMO PLAYGROUND ─── */}
      <section id="demo" className="py-20 border-t border-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              {isVi ? 'Trải Nghiệm Trực Quan' : 'Interactive Playground'}
            </span>
            <h2 className="text-3xl font-extrabold text-text-primary tracking-tight">
              {isVi ? 'Thử Ngay Các Tính Năng Nổi Bật' : 'Try Core Features In Action'}
            </h2>
            <p className="text-sm text-text-secondary">
              {isVi ? 'Chọn một kỹ năng bên dưới để xem cách hệ thống hoạt động thực tế' : 'Select a skill below to see how LingoSphere works in real-time'}
            </p>
          </div>

          {/* Demo Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-2 p-1.5 rounded-2xl bg-surface-subtle border border-border max-w-xl mx-auto">
            <button
              onClick={() => setActiveDemoTab('srs')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeDemoTab === 'srs' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon name="cards" size={15} />
              <span>Flashcard SRS</span>
            </button>
            <button
              onClick={() => setActiveDemoTab('speaking')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeDemoTab === 'speaking' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon name="mic" size={15} />
              <span>Whisper Speaking</span>
            </button>
            <button
              onClick={() => setActiveDemoTab('writing')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeDemoTab === 'writing' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon name="pencil" size={15} />
              <span>AI Writing</span>
            </button>
            <button
              onClick={() => setActiveDemoTab('toeic')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeDemoTab === 'toeic' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon name="fileText" size={15} />
              <span>TOEIC ETS</span>
            </button>
          </div>

          {/* Demo Content Box */}
          <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-xl min-h-[320px] flex flex-col justify-center">
            {activeDemoTab === 'srs' && (
              <div className="space-y-6 max-w-md mx-auto text-center w-full">
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="rounded-2xl border-2 border-dashed border-primary/40 bg-surface-subtle p-8 cursor-pointer hover:border-primary transition-all shadow-inner relative group"
                >
                  <span className="absolute top-3 right-3 text-[10px] uppercase font-bold text-text-tertiary bg-surface px-2 py-0.5 rounded border border-border">
                    {isFlipped ? 'Mặt sau' : 'Nhấn để lật thẻ'}
                  </span>
                  {!isFlipped ? (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-primary">Từ Vựng TOEIC C1</span>
                      <h3 className="text-3xl font-extrabold text-text-primary">Accommodate</h3>
                      <p className="font-mono text-sm text-text-secondary">/əˈkɑː.mə.deɪt/ (verb)</p>
                      <p className="text-xs text-text-tertiary pt-2">💡 Ví dụ: The hotel can accommodate up to 500 guests.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 animate-fadeIn">
                      <span className="text-xs font-semibold text-success">Nghĩa Tiếng Việt</span>
                      <h3 className="text-2xl font-extrabold text-text-primary">Cung cấp chỗ ở / Đáp ứng nhu cầu</h3>
                      <p className="text-xs text-text-secondary">Từ đồng nghĩa: Lodge, Shelter, Cater for, Adapt.</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-center gap-3">
                  <span className="text-xs font-bold text-text-tertiary flex items-center gap-1">
                    Đánh giá độ nhớ:
                  </span>
                  <button className="px-3 py-1 text-xs font-bold rounded-lg bg-error/15 text-error hover:bg-error/25">1 - Quên</button>
                  <button className="px-3 py-1 text-xs font-bold rounded-lg bg-warning/15 text-warning hover:bg-warning/25">3 - Nhớ vừa</button>
                  <button className="px-3 py-1 text-xs font-bold rounded-lg bg-success/15 text-success hover:bg-success/25">5 - Thuộc làu</button>
                </div>
              </div>
            )}

            {activeDemoTab === 'speaking' && (
              <div className="space-y-6 max-w-lg mx-auto text-center w-full">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-accent">Câu mẫu luyện đọc:</span>
                  <p className="text-xl font-bold text-text-primary leading-relaxed bg-surface-subtle p-4 rounded-2xl border border-border">
                    &ldquo;Good morning everyone, welcome to the international marketing seminar.&rdquo;
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-accent/30 animate-pulse">
                    <Icon name="mic" size={24} />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-text-tertiary">Whisper STT Analysis</div>
                    <div className="text-base font-black text-success">Độ chính xác: 96/100 Điểm</div>
                  </div>
                </div>

                <div className="rounded-xl bg-surface-subtle p-3 text-xs text-text-secondary border border-border text-left">
                  ✅ <strong>Ngữ điệu tự nhiên:</strong> Tốc độ nói 135 từ/phút chuẩn tốc độ người bản xứ.
                </div>
              </div>
            )}

            {activeDemoTab === 'writing' && (
              <div className="space-y-4 max-w-lg mx-auto w-full text-left">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-primary">Chủ đề: Lợi ích của công nghệ trong giáo dục</span>
                  <div className="p-3.5 rounded-xl bg-surface-subtle border border-border text-xs text-text-primary leading-relaxed">
                    Technology has a <span className="line-through text-error">big</span> <strong className="text-primary underline">profound</strong> effect on modern education because students can access information easily.
                  </div>
                </div>

                <div className="space-y-2 rounded-2xl bg-primary/10 border border-primary/20 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-primary flex items-center gap-1.5">
                      <Icon name="sparkles" size={14} /> Gia Sư AI Nhận Xét
                    </span>
                    <span className="text-xs font-black text-text-primary">8.5/10 Điểm</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    🌟 <strong>Nâng cấp từ vựng:</strong> Thay &apos;big effect&apos; bằng &apos;profound impact&apos; giúp bài viết đạt chuẩn học thuật C1.
                  </p>
                </div>
              </div>
            )}

            {activeDemoTab === 'toeic' && (
              <div className="space-y-5 max-w-lg mx-auto w-full text-left">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-xs font-bold text-primary">TOEIC Part 5: Incomplete Sentences</span>
                  <span className="text-xs font-mono font-bold text-warning flex items-center gap-1">
                    <Icon name="clock" size={14} /> 00:45s
                  </span>
                </div>

                <p className="text-sm font-semibold text-text-primary">
                  The newly appointed director decided to _______ the annual budget proposal before the board meeting.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl border border-border bg-surface-subtle text-xs font-medium hover:border-primary cursor-pointer">(A) review</div>
                  <div className="p-3 rounded-xl border border-success bg-success/10 text-xs font-bold text-success flex items-center justify-between">
                    <span>(B) finalize ✓</span>
                    <span className="text-[10px]">Đáp án đúng</span>
                  </div>
                  <div className="p-3 rounded-xl border border-border bg-surface-subtle text-xs font-medium hover:border-primary cursor-pointer">(C) finalization</div>
                  <div className="p-3 rounded-xl border border-border bg-surface-subtle text-xs font-medium hover:border-primary cursor-pointer">(D) final</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── SCIENCE & METHODOLOGY ─── */}
      <section id="methodology" className="py-20 border-t border-border bg-surface-subtle/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              {isVi ? 'Khoa Học & Phương Pháp' : 'Scientific Methodology'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
              {isVi ? 'Tại Sao Học Với LingoSphere Lại Hiệu Quả Gấp 3 Lần?' : 'Why LingoSphere is 3x More Effective'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-3xl bg-surface border border-border p-7 space-y-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white font-bold text-base">
                1
              </div>
              <h3 className="text-lg font-bold text-text-primary">
                {isVi ? 'Khắc Phục Đường Cong Quên Lãng' : 'Beating The Forgetting Curve'}
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {isVi
                  ? 'Theo nghiên cứu của Ebbinghaus, 70% kiến thức bị quên sau 24h. Thuật toán SRS của chúng tôi tự động nhắc lại đúng thời điểm vàng để biến trí nhớ ngắn hạn thành dài hạn.'
                  : 'Automated spaced intervals ensure you review cards exactly when they are about to fade from memory.'}
              </p>
            </div>

            <div className="rounded-3xl bg-surface border border-border p-7 space-y-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white font-bold text-base">
                2
              </div>
              <h3 className="text-lg font-bold text-text-primary">
                {isVi ? 'Phản Xạ Thực Chiến 4 Kỹ Năng' : 'Active Recall & Output'}
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {isVi
                  ? 'Không học vẹt thụ động. Bạn liên tục được kích hoạt phản xạ qua bài luyện Nghe chính tả (Dictation), ghi âm Nói (Whisper STT) và Viết nhật ký hàng ngày.'
                  : 'Continuous active retrieval exercises through dictation, speech recognition, and contextual composition.'}
              </p>
            </div>

            <div className="rounded-3xl bg-surface border border-border p-7 space-y-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success text-white font-bold text-base">
                3
              </div>
              <h3 className="text-lg font-bold text-text-primary">
                {isVi ? 'Gia Sư AI Cá Nhân Hóa 24/7' : '24/7 Personalized AI Tutoring'}
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {isVi
                  ? 'Mọi thắc mắc về ngữ pháp, phát âm và bài viết đều được mô hình AI chuyên sâu sư phạm giải thích cặn kẽ ngay lập tức, không cần chờ đợi giáo viên.'
                  : 'Instant pedagogical explanations tailored to your current learning weaknesses without waiting.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── REVIEWS / TESTIMONIALS ─── */}
      <section id="reviews" className="py-20 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              {isVi ? 'Cảm Nhận Học Viên' : 'Success Stories'}
            </span>
            <h2 className="text-3xl font-extrabold text-text-primary tracking-tight">
              {isVi ? 'Hơn 12,000+ Học Viên Đã Đạt Mục Tiêu' : 'Trusted by Over 12,000+ Learners'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl bg-surface border border-border p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-1 text-warning">
                {[...Array(5)].map((_, i) => (
                  <Icon key={i} name="star" size={16} />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed italic">
                &ldquo;Nhờ kho đề thi TOEIC chuẩn ETS và hệ thống giải thích chi tiết của LingoSphere, mình đã tăng từ 520 lên 865 điểm chỉ sau 2 tháng ôn luyện!&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                  NM
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">Nguyễn Minh Tuấn</h4>
                  <p className="text-[11px] text-text-tertiary">Sinh viên ĐH Bách Khoa • TOEIC 865</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-surface border border-border p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-1 text-warning">
                {[...Array(5)].map((_, i) => (
                  <Icon key={i} name="star" size={16} />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed italic">
                &ldquo;Tính năng chấm phát âm bằng Whisper STT cực kỳ chính xác. Mình đã tự tin giao tiếp tiếng Anh trong công việc văn phòng mỗi ngày.&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <div className="h-9 w-9 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent text-xs">
                  TH
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">Trần Thị Thu Hà</h4>
                  <p className="text-[11px] text-text-tertiary">Product Manager • Giao tiếp tự tin</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-surface border border-border p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-1 text-warning">
                {[...Array(5)].map((_, i) => (
                  <Icon key={i} name="star" size={16} />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed italic">
                &ldquo;Bộ thẻ Flashcard SRS học rất gây nghiện. Mỗi ngày dành 15 phút mà thuộc hơn 1,000 từ vựng chuyên ngành mà không bị quên.&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <div className="h-9 w-9 rounded-full bg-success/20 flex items-center justify-center font-bold text-success text-xs">
                  LH
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">Lê Hoàng Nam</h4>
                  <p className="text-[11px] text-text-tertiary">Lập trình viên • 90 Ngày Streak</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CALL TO ACTION BANNER ─── */}
      <section className="py-20 relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-primary via-primary-focus to-accent p-8 sm:p-14 text-white text-center shadow-2xl overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 -z-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10 space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-extrabold uppercase tracking-widest text-white/80">
                {isVi ? 'Bắt Đầu Hành Trình Của Bạn' : 'Start Your Journey Today'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                {isVi ? 'Sẵn Sàng Bứt Phá Trình Độ Tiếng Anh Cùng LingoSphere?' : 'Ready to Elevate Your English with LingoSphere?'}
              </h2>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                {isVi
                  ? 'Đăng ký miễn phí ngay hôm nay để trải nghiệm toàn bộ hệ sinh thái học tập và luyện thi thông minh.'
                  : 'Join thousands of learners achieving their English fluency goals with AI.'}
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link href="/home">
                <Button className="h-13 rounded-2xl bg-white px-8 text-base font-extrabold text-primary shadow-xl hover:bg-white/90 hover:scale-103 transition-all cursor-pointer">
                  <span>{isVi ? 'Bắt Đầu Học Ngay (Miễn Phí)' : 'Get Started for Free'}</span>
                  <Icon name="arrowRight" size={18} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border bg-surface py-12 text-text-tertiary text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white font-black text-sm">
              L
            </div>
            <span className="text-sm font-bold text-text-primary">
              Lingo<span className="text-primary">Sphere</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-text-secondary">
            <a href="#features" className="hover:text-primary transition-colors">{isVi ? 'Tính năng' : 'Features'}</a>
            <a href="#toeic" className="hover:text-primary transition-colors">{isVi ? 'Đề thi TOEIC' : 'TOEIC'}</a>
            <a href="#methodology" className="hover:text-primary transition-colors">{isVi ? 'Phương pháp SRS' : 'SRS Method'}</a>
            <Link href="/home" className="hover:text-primary transition-colors">{isVi ? 'Bàn học' : 'Dashboard'}</Link>
          </div>

          <p className="text-[11px]">
            © {new Date().getFullYear()} LingoSphere. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
