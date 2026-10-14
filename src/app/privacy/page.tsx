// Trang công bố chính sách bảo mật thông tin cá nhân và dữ liệu học tập của học viên LingoSphere
import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { SITE_CONFIG } from '@/config/site.config'

export const metadata: Metadata = {
  title: 'Chính Sách Bảo Mật - LingoSphere',
  description:
    'Chính sách bảo mật thông tin và an toàn dữ liệu học viên tại nền tảng học tiếng Anh & luyện thi TOEIC LingoSphere.',
  alternates: {
    canonical: `${SITE_CONFIG.url}/privacy`,
  },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <header className="border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-black tracking-tight text-primary">
            <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_#34d399]" />
            LINGO<span className="font-light text-text-primary">SPHERE</span>
          </Link>
          <Link href="/" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
            Về trang chủ
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            An toàn dữ liệu
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
            Chính Sách Bảo Mật Thông Tin
          </h1>
          <p className="text-sm text-text-tertiary">Cập nhật lần cuối: Tháng 10 năm 2026</p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-sm sm:text-base text-text-secondary leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text-primary">1. Thu Thập Thông Tin</h2>
            <p>
              LingoSphere cam kết tôn trọng và bảo vệ quyền riêng tư của mọi học viên. Khi bạn đăng ký và sử dụng dịch vụ, chúng tôi thu thập một số thông tin cần thiết nhằm cá nhân hóa trải nghiệm học tập:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Thông tin tài khoản: Họ tên, địa chỉ email, ảnh đại diện (khi đăng nhập qua Google).</li>
              <li>Dữ liệu học tập: Kết quả làm bài thi TOEIC, lịch sử ôn từ vựng SRS, tiến độ khóa học, chuỗi ngày học liên tục (streak).</li>
              <li>Thông tin kỹ thuật: Địa chỉ IP, loại trình duyệt, hệ điều hành nhằm phục vụ bảo mật phiên đăng nhập và ngăn chặn gian lận.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text-primary">2. Mục Đích Sử Dụng Dữ Liệu</h2>
            <p>Dữ liệu thu thập được sử dụng duy nhất cho các mục đích:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Cung cấp nội dung khóa học và phân tích điểm số bài thi TOEIC.</li>
              <li>Tối ưu hóa thuật toán Spaced Repetition để nhắc nhở từ vựng đúng thời điểm.</li>
              <li>Bảo mật tài khoản, gửi mã xác thực OTP và thông báo quan trọng về tài khoản.</li>
              <li>Cải tiến chất lượng giảng dạy và trải nghiệm người dùng trên nền tảng.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text-primary">3. Cam Kết Bảo Mật</h2>
            <p>
              Mọi mật khẩu và token xác thực được mã hóa bằng thuật toán tiêu chuẩn ngành (bcrypt, SHA-256). Chúng tôi tuyệt đối không bán, chia sẻ hoặc thương mại hóa thông tin cá nhân của học viên cho bất kỳ bên thứ ba nào.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text-primary">4. Quyền Của Học Viên</h2>
            <p>
              Học viên có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa bỏ hoàn toàn dữ liệu cá nhân của mình bất kỳ lúc nào thông qua phần Cài đặt tài khoản hoặc liên hệ với đội ngũ hỗ trợ LingoSphere.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
