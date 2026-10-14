// Trang giới thiệu tổng quan sứ mệnh và hệ sinh thái học tập LingoSphere
import type { Metadata } from 'next'
import Link from 'next/link'
import { Award, BookOpen, Brain, Sparkles, Target, Users, ShieldCheck, ArrowRight } from 'lucide-react'
import { SITE_CONFIG } from '@/config/site.config'

export const metadata: Metadata = {
  title: 'Giới Thiệu LingoSphere - Hệ Sinh Thái Luyện Thi TOEIC Thông Minh',
  description:
    'Tìm hiểu về LingoSphere - nền tảng tiên phong ứng dụng gia sư AI, thuật toán lặp lại ngắt quãng SRS và đề thi mô phỏng chuẩn ETS giúp học viên bứt phá điểm số TOEIC.',
  alternates: {
    canonical: `${SITE_CONFIG.url}/about`,
  },
  openGraph: {
    title: 'Giới Thiệu LingoSphere - Hệ Sinh Thái Luyện Thi TOEIC Thông Minh',
    description:
      'Tìm hiểu về LingoSphere - nền tảng tiên phong ứng dụng gia sư AI, thuật toán lặp lại ngắt quãng SRS và đề thi mô phỏng chuẩn ETS.',
    url: `${SITE_CONFIG.url}/about`,
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <header className="border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-black tracking-tight text-primary">
            <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_#34d399]" />
            LINGO<span className="font-light text-text-primary">SPHERE</span>
          </Link>
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="/courses" className="text-text-secondary hover:text-text-primary transition-colors">
              Khóa học
            </Link>
            <Link href="/toeic" className="text-text-secondary hover:text-text-primary transition-colors">
              Thi thử TOEIC
            </Link>
            <Link href="/login" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all">
              Đăng nhập
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-12">
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Về chúng tôi
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary leading-tight">
            Đột Phá Điểm Số TOEIC Cùng <span className="text-primary">LingoSphere</span>
          </h1>
          <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            LingoSphere ra đời với sứ mệnh xóa bỏ cách học vẹt thụ động, mang đến phương pháp học tiếng Anh tư duy logic, kết hợp công nghệ trí tuệ nhân tạo và khoa học não bộ.
          </p>
        </section>

        <section className="grid sm:grid-cols-3 gap-6 pt-6">
          <div className="p-6 rounded-2xl border border-border bg-surface space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">Khoa Học Trí Nhớ SRS</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Thuật toán lặp lại ngắt quãng Spaced Repetition tính toán chính xác chu kỳ quên lãng để nhắc nhở từ vựng vào đúng thời điểm vàng.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-surface space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">Mô Phỏng Chuẩn ETS</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Ngân hàng đề thi TOEIC bám sát cấu trúc mới nhất của ETS với đầy đủ 7 Part, audio thực chiến và phân tích đáp án chi tiết.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-surface space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">Gia Sư AI Đồng Hành</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Trợ lý AI hỗ trợ giải thích bẫy đề thi, chấm điểm phát âm qua Whisper STT và định hướng lộ trình học tập cá nhân hóa 24/7.
            </p>
          </div>
        </section>

        <section className="p-8 rounded-3xl border border-border bg-surface-subtle space-y-6">
          <h2 className="text-2xl font-bold text-text-primary">Triết Lý Đào Tạo</h2>
          <div className="space-y-4 text-text-secondary text-sm sm:text-base leading-relaxed">
            <p>
              Tại LingoSphere, chúng tôi tin rằng ngôn ngữ là cánh cửa mở ra cơ hội nghề nghiệp toàn cầu. Mỗi học viên đều sở hữu tốc độ tiếp thu và mục tiêu khác biệt. Vì vậy, nền tảng được thiết kế xoay quanh tính cá nhân hóa tối đa.
            </p>
            <p>
              Từ những người mất gốc muốn đạt 450+ để tốt nghiệp đại học, đến những chuyên viên muốn bứt phá 850+ để thăng tiến trong môi trường quốc tế, LingoSphere cung cấp lộ trình trực quan và hệ thống đo lường tiến độ minh bạch.
            </p>
          </div>
        </section>

        <section className="text-center py-6">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all cursor-pointer"
          >
            Khám phá các khóa học TOEIC ngay
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>
    </div>
  )
}
