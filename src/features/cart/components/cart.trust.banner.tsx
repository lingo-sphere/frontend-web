// Thanh thông tin cam kết và chính sách hỗ trợ học viên khi thanh toán khóa học
'use client'

import { ShieldCheck, Zap, Infinity as InfinityIcon, Sparkles } from 'lucide-react'

interface CartTrustBannerProps {
  isVi: boolean
}

export function CartTrustBanner({ isVi }: CartTrustBannerProps) {
  const perks = [
    {
      icon: ShieldCheck,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      title: isVi ? 'Bảo đảm hoàn tiền 30 ngày' : '30-Day Money-Back Guarantee',
      description: isVi ? 'Hoàn 100% nếu không hài lòng' : '100% refund if not satisfied',
    },
    {
      icon: Zap,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      title: isVi ? 'Kích hoạt tức thì 24/7' : 'Instant 24/7 Activation',
      description: isVi ? 'Học ngay sau khi chuyển khoản' : 'Access immediately upon transfer',
    },
    {
      icon: InfinityIcon,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      title: isVi ? 'Truy cập khóa học trọn đời' : 'Lifetime Course Access',
      description: isVi ? 'Không giới hạn thời gian học tập' : 'Learn at your own pace anytime',
    },
    {
      icon: Sparkles,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      title: isVi ? 'Trợ giảng AI & Chấm chữa' : 'AI Tutor & Scoring Feedback',
      description: isVi ? 'Đánh giá Speaking & Writing tự động' : 'Instant AI evaluation on practice',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 p-4 rounded-2xl bg-surface border border-border/80 shadow-xs">
      {perks.map((perk) => {
        const Icon = perk.icon
        return (
          <div key={perk.title} className="flex items-center gap-3 p-2 rounded-xl">
            <div className={`p-2.5 rounded-xl border shrink-0 ${perk.color}`}>
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-text-primary truncate">{perk.title}</h4>
              <p className="text-[11px] text-text-secondary truncate">{perk.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
