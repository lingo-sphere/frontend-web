// Updated: 2026-08-22
// Modal nang cap Premium - LingoSphere

import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { X, Check, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Plan {
  id: string
  duration: { en: string; vi: string }
  price: number
  originalPrice?: number
  perMonth: { en: string; vi: string }
  discount?: string
  recommended?: boolean
}

const getPlans = (isVietnamese: boolean): Plan[] => [
  {
    id: '1-month',
    duration: { en: '1 Month', vi: '1 tháng' },
    price: 79000,
    perMonth: { en: '79,000/month', vi: '79.000đ/tháng' },
  },
  {
    id: '3-month',
    duration: { en: '3 Months', vi: '3 tháng' },
    price: 169000,
    originalPrice: 237000,
    perMonth: { en: '~56,333/month', vi: '~56.333đ/tháng' },
    discount: '-29%',
  },
  {
    id: '12-month',
    duration: { en: '1 Year', vi: '1 năm' },
    price: 499000,
    originalPrice: 948000,
    perMonth: { en: '~41,583/month', vi: '~41.583đ/tháng' },
    discount: '-47%',
    recommended: true,
  },
  {
    id: 'lifetime',
    duration: { en: 'Lifetime', vi: 'Vĩnh viễn' },
    price: 1849000,
    originalPrice: 2641429,
    perMonth: { en: 'Lifetime', vi: 'Trọn đời' },
    discount: '-30%',
  },
]

const getBenefits = (isVietnamese: boolean) => [
  { icon: '🤖', title: isVietnamese ? 'AI đánh giá Writing' : 'AI Writing Evaluation', desc: isVietnamese ? 'Phân tích ngữ pháp, từ vựng' : 'Grammar, vocabulary analysis' },
  { icon: '🎯', title: isVietnamese ? 'AI chấm điểm Speaking' : 'AI Speaking Scoring', desc: isVietnamese ? 'Đánh giá phát âm, ngữ điệu' : 'Pronunciation, intonation' },
  { icon: '📝', title: isVietnamese ? 'AI tạo bài tập' : 'AI Exercise Generation', desc: isVietnamese ? 'Gợi ý bài tập theo trình độ' : 'Level-based exercise suggestions' },
  { icon: '📊', title: isVietnamese ? 'Phân tích tiến trình' : 'Progress Analytics', desc: isVietnamese ? 'Theo dõi điểm mạnh, điểm yếu' : 'Track strengths, weaknesses' },
  { icon: '📚', title: isVietnamese ? 'Khóa học TOEIC' : 'TOEIC Courses', desc: isVietnamese ? 'Lộ trình học từ A1 đến B2' : 'Learning path from A1 to B2' },
  { icon: '✍️', title: isVietnamese ? 'AI Suggestions' : 'AI Suggestions', desc: isVietnamese ? 'Gợi ý từ vựng, cấu trúc' : 'Vocabulary, structure suggestions' },
]

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [selectedPlan, setSelectedPlan] = useState('12-month')

  if (!open) return null

  const plans = getPlans(isVietnamese)
  const benefits = getBenefits(isVietnamese)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)} />

      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="overflow-hidden rounded-2xl bg-surface shadow-xl">
          <div className="relative bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500 px-4 py-3 text-center text-white">
            <button onClick={() => onOpenChange(false)} className="absolute right-3 top-3 rounded-full p-1 transition-colors hover:bg-white/20">
              <X size={16} />
            </button>

            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">👑</span>
              <div className="text-left">
                <h2 className="text-base font-bold">LingoSphere Premium</h2>
                <p className="text-[11px] text-white/90">
                  {isVietnamese ? 'Mở khóa toàn bộ - học gấp 10x' : 'Unlock everything - learn 10x faster'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <h3 className="mb-2 text-xs font-semibold text-text-primary">
              {isVietnamese ? 'Chọn gói Premium' : 'Choose Premium Plan'}
            </h3>
            <div className="mb-3 grid grid-cols-2 gap-2">
              {plans.map((plan) => {
                const isSelected = selectedPlan === plan.id
                return (
                  <label key={plan.id}
                    className={`relative cursor-pointer rounded-xl border-2 p-2.5 transition-all ${
                      isSelected ? 'border-amber-500 bg-amber-50/50' : 'border-border bg-surface hover:border-amber-300'
                    }`}>
                    <input type="radio" name="plan" value={plan.id} checked={isSelected}
                      onChange={() => setSelectedPlan(plan.id)} className="sr-only" />
                    <div className="flex items-start gap-2">
                      <div className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${
                        isSelected ? 'border-amber-500 bg-amber-500' : 'border-border'
                      }`}>
                        {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="truncate text-xs font-medium text-text-primary">
                            {isVietnamese ? plan.duration.vi : plan.duration.en}
                          </span>
                          {plan.discount && (
                            <span className="shrink-0 rounded bg-emerald-100 px-1 py-0.5 text-[9px] font-semibold text-emerald-700">
                              {plan.discount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-text-primary">
                          {plan.price.toLocaleString(isVietnamese ? 'vi-VN' : 'en-US')}đ
                        </p>
                        {plan.originalPrice && (
                          <p className="text-[9px] text-text-tertiary line-through">
                            {plan.originalPrice.toLocaleString(isVietnamese ? 'vi-VN' : 'en-US')}đ
                          </p>
                        )}
                      </div>
                    </div>
                    {plan.recommended && (
                      <div className="absolute -top-2 left-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                        ✨ {isVietnamese ? 'TỐT NHẤT' : 'BEST VALUE'}
                      </div>
                    )}
                  </label>
                )
              })}
            </div>

            <Button className="h-10 w-full bg-gradient-to-r from-amber-500 to-orange-500 text-sm font-semibold text-white hover:from-amber-600 hover:to-orange-600"
              onClick={() => onOpenChange(false)}>
              {isVietnamese ? 'Mở khóa ngay' : 'Unlock Now'}
            </Button>

            <div className="mt-2 flex items-center justify-center gap-3 text-[10px] text-text-secondary">
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-emerald-600" />
                {isVietnamese ? 'Thanh toán bảo mật' : 'Secure payment'}
              </span>
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-500" />
                {isVietnamese ? 'Kích hoạt tức thì' : 'Instant activation'}
              </span>
            </div>

            <div className="mt-4 border-t border-border pt-3">
              <h3 className="mb-2 flex items-center gap-1 text-xs font-semibold text-amber-600">
                <span>✨</span> {isVietnamese ? 'Quyền lợi Premium' : 'Premium Benefits'}
              </h3>
              <div className="grid grid-cols-2 gap-1.5">
                {benefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-1.5 rounded-lg bg-surface-subtle p-2">
                    <span className="text-sm">{b.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-medium text-text-primary">{b.title}</p>
                      <p className="truncate text-[9px] text-text-secondary">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
