// Hiển thị quy trình học tập 3 bước và 4 cam kết chất lượng đào tạo TOEIC.

'use client'

import {
  Award,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Clock,
} from 'lucide-react'

export function RoadmapMethodologySection() {
  return (
    <>
      <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-900/50 shadow-xl space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-indigo-300 border border-white/10">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Phương Pháp Đột Phá Điểm Số</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Quy Trình Học Tập 3 Bước Tinh Gọn
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200/80">
            Tối ưu thời gian, học đúng trọng tâm trình độ và tự tin chinh phục mục tiêu TOEIC của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-400/40 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-base border border-emerald-500/30">
              1
            </div>
            <h3 className="font-bold text-base text-white">Test Đánh Giá Đầu Vào</h3>
            <p className="text-xs text-indigo-200/80 leading-relaxed">
              Làm bài thi rút gọn 40 hoặc 60 câu để hệ thống tính điểm TOEIC quy đổi chuẩn ETS và chẩn đoán kỹ năng yếu.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-400/40 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-black text-base border border-indigo-500/30">
              2
            </div>
            <h3 className="font-bold text-base text-white">Học Khóa Học Đề Xuất</h3>
            <p className="text-xs text-indigo-200/80 leading-relaxed">
              Bắt đầu học ngay với giáo trình đúng năng lực: video bài giảng, từ vựng thông minh SRS và nghe chép chính tả.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-400/40 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-base border border-amber-500/30">
              3
            </div>
            <h3 className="font-bold text-base text-white">Thi Chặng Vượt Cấp</h3>
            <p className="text-xs text-indigo-200/80 leading-relaxed">
              Hoàn thành bài kiểm tra cuối chương và tốt nghiệp khóa học để hệ thống tự động gợi ý và mở khóa khóa học tiếp theo.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-text-primary">Chuẩn Đề Thi ETS</h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            Ngân hàng câu hỏi cập nhật theo format đề thi TOEIC mới nhất của IIG/ETS.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-text-primary">Đo Lường Tăng Trưởng</h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            Theo dõi sự tiến bộ điểm số rõ ràng sau từng bài kiểm tra chặng và bài thi thử.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-text-primary">Chấm Điểm AI 4 Kỹ Năng</h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            Nhận diện phát âm bằng Whisper AI và sửa lỗi ngữ pháp, chấm điểm bài viết tức thì.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-text-primary">Học Linh Hoạt 24/7</h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            Tự do điều chỉnh tốc độ học tập trên máy tính và điện thoại mọi lúc mọi nơi.
          </p>
        </div>
      </section>
    </>
  )
}
