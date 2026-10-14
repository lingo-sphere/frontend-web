// Trang danh mục cẩm nang và hướng dẫn luyện thi TOEIC LingoSphere
import Link from 'next/link'
import { BookOpen, Sparkles, Target, ArrowRight } from 'lucide-react'
import { BLOG_POSTS } from '@/features/blog/data/blog.posts'
import { BlogCard } from '@/features/blog/components/blog.card'

export default function BlogIndexPage() {
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
              Đề thi TOEIC
            </Link>
            <Link href="/vocabulary" className="text-text-secondary hover:text-text-primary transition-colors">
              Từ vựng SRS
            </Link>
            <Link href="/login" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all">
              Đăng nhập
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12 sm:py-16 space-y-12">
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Kiến thức & Cẩm nang TOEIC
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary leading-tight">
            Kho Bí Quyết & Lộ Trình Luyện Thi TOEIC Chuẩn Quốc Tế
          </h1>
          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            Tổng hợp bài viết hướng dẫn chuyên sâu từ đội ngũ giảng viên LingoSphere: phân tích ma trận đề thi ETS, chiến lược phân bổ thời gian, mẹo tránh bẫy ngữ pháp và phương pháp ghi nhớ từ vựng Spaced Repetition.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4 text-xs sm:text-sm font-medium">
          <span className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold">Tất cả bài viết</span>
          <span className="px-3 py-1.5 rounded-lg text-text-secondary hover:bg-surface-hover transition-colors">Lộ trình học</span>
          <span className="px-3 py-1.5 rounded-lg text-text-secondary hover:bg-surface-hover transition-colors">Kỹ năng Listening</span>
          <span className="px-3 py-1.5 rounded-lg text-text-secondary hover:bg-surface-hover transition-colors">Kỹ năng Reading</span>
          <span className="px-3 py-1.5 rounded-lg text-text-secondary hover:bg-surface-hover transition-colors">Từ vựng & Ngữ pháp</span>
        </div>

        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </section>

        <section className="p-8 sm:p-12 rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-surface to-surface flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
              Kiểm Tra Năng Lực TOEIC Miễn Phí Ngay Hôm Nay
            </h2>
            <p className="text-text-secondary text-sm sm:text-base max-w-xl">
              Thực hiện bài kiểm tra mô phỏng chuẩn ETS với hệ thống chấm điểm tự động và nhận lộ trình học tập cá nhân hóa từ AI.
            </p>
          </div>
          <Link
            href="/toeic"
            className="px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold shrink-0 shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            Làm bài thi thử
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>
    </div>
  )
}
