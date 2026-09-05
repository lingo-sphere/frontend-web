/**
 * @file settings.vip.tsx
 * @description Thành phần Settings Vip phục vụ phía người học (Web Client)
 */

'use client'

/**
 * @file SettingsVipTab.tsx
 * @description Component tab hiển thị thông tin gói thành viên VIP, đặc quyền và kích hoạt gia hạn
 */

import { Crown, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SettingsVipTabProps {
  isPremium: boolean
  remainingSubText: string
  onOpenUpgrade: () => void
  isVi: boolean
}

export function SettingsVipTab({
  isPremium,
  remainingSubText,
  onOpenUpgrade,
  isVi,
}: SettingsVipTabProps) {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 h-48 w-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider">
              <Crown size={14} className="fill-white" />
              <span>
                {isPremium
                  ? isVi
                    ? 'Đang hoạt động'
                    : 'Active Member'
                  : isVi
                  ? 'Gói đặc quyền'
                  : 'VIP Benefits'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">
              LingoSphere Premium VIP
            </h2>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
              {isPremium
                ? `Tài khoản của bạn đang có đầy đủ quyền lợi VIP cao cấp nhất (${remainingSubText}).`
                : isVi
                ? 'Mở khóa không giới hạn toàn bộ khóa học, đề thi TOEIC độc quyền và trợ lý AI chấm nói & viết Whisper.'
                : 'Unlock all courses, AI speaking scoring and exclusive TOEIC exams.'}
            </p>
          </div>

          <Button
            onClick={onOpenUpgrade}
            className="rounded-2xl bg-white text-amber-600 hover:bg-white/90 text-xs sm:text-sm font-extrabold px-6 py-3 h-12 shadow-lg transition-transform hover:scale-105 cursor-pointer shrink-0"
          >
            <Crown size={16} className="fill-amber-600 mr-2" />
            <span>
              {isPremium
                ? isVi
                  ? 'Gia hạn gói VIP'
                  : 'Renew VIP'
                : isVi
                ? 'Nâng cấp VIP ngay'
                : 'Upgrade to VIP'}
            </span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            title: isVi ? 'Không giới hạn bài học' : 'Unlimited Lessons',
            desc: isVi ? 'Truy cập trọn đời mọi bài giảng video & bài tập' : 'Access all video lectures',
          },
          {
            title: isVi ? 'AI Whisper chấm nói & viết' : 'Whisper AI Speech Scoring',
            desc: isVi ? 'Đánh giá phát âm chuẩn xác từng âm vị IPA' : 'Phonetic accuracy grading',
          },
          {
            title: isVi ? 'Chứng chỉ hoàn thành' : 'Certified Diplomas',
            desc: isVi ? 'Cấp chứng chỉ tốt nghiệp sau mỗi khóa học' : 'Accredited certificate issuance',
          },
        ].map((feat, idx) => (
          <div key={idx} className="p-4 rounded-2xl border border-border bg-surface shadow-xs">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3">
              <Zap size={16} />
            </div>
            <h4 className="text-sm font-bold text-text-primary mb-1">{feat.title}</h4>
            <p className="text-xs text-text-tertiary">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
