import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { X, Check, Shield, Zap, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth-store'
import { subscriptionService } from '@/services/subscription.service'
import { API_CONFIG } from '@/config/api.config'

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Plan {
  id: string
  cycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'LIFETIME'
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
    cycle: 'MONTHLY',
    duration: { en: '1 Month', vi: '1 tháng' },
    price: 79000,
    perMonth: { en: '79,000/month', vi: '79.000đ/tháng' },
  },
  {
    id: '3-month',
    cycle: 'QUARTERLY',
    duration: { en: '3 Months', vi: '3 tháng' },
    price: 169000,
    originalPrice: 237000,
    perMonth: { en: '~56,333/month', vi: '~56.333đ/tháng' },
    discount: '-29%',
  },
  {
    id: '12-month',
    cycle: 'YEARLY',
    duration: { en: '1 Year', vi: '1 năm' },
    price: 499000,
    originalPrice: 948000,
    perMonth: { en: '~41,583/month', vi: '~41.583đ/tháng' },
    discount: '-47%',
    recommended: true,
  },
  {
    id: 'lifetime',
    cycle: 'LIFETIME',
    duration: { en: 'Lifetime', vi: 'Vĩnh viễn' },
    price: 1849000,
    originalPrice: 2641429,
    perMonth: { en: 'Lifetime', vi: 'Trọn đời' },
    discount: '-30%',
  },
]

const getBenefits = (isVietnamese: boolean) => [
  { icon: '👑', title: isVietnamese ? 'Tất cả khóa học' : 'All Courses Unlocked', desc: isVietnamese ? 'Học không giới hạn toàn bộ khóa học' : 'Unlimited access to all courses' },
  { icon: '🤖', title: isVietnamese ? 'AI đánh giá Writing' : 'AI Writing Evaluation', desc: isVietnamese ? 'Phân tích ngữ pháp, từ vựng 100%' : 'Grammar, vocabulary analysis' },
  { icon: '🎯', title: isVietnamese ? 'AI chấm điểm Speaking' : 'AI Speaking Scoring', desc: isVietnamese ? 'Đánh giá phát âm chuẩn Whisper' : 'Pronunciation & intonation STT' },
  { icon: '📝', title: isVietnamese ? 'AI Gia sư 24/7' : '24/7 AI Tutor', desc: isVietnamese ? 'Giải đáp thắc mắc câu hỏi siêu tốc' : 'Ultra-fast pedagocial tutor' },
  { icon: '📊', title: isVietnamese ? 'Đề thi TOEIC Full/Mini' : 'Full TOEIC Exams', desc: isVietnamese ? 'Không giới hạn lượt thi ETS' : 'Unlimited ETS mock exams' },
  { icon: '⚡', title: isVietnamese ? 'Không quảng cáo' : 'Ad-free Experience', desc: isVietnamese ? 'Tập trung tối đa khi học' : 'Distraction-free learning' },
]

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [selectedPlan, setSelectedPlan] = useState('12-month')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { user, isAuthenticated, setUser } = useAuthStore()

  if (!open) return null

  const plans = getPlans(isVietnamese)
  const benefits = getBenefits(isVietnamese)

  const handleUpgrade = async () => {
    if (!isAuthenticated || !user) {
      alert(isVietnamese ? 'Vui lòng đăng nhập để nâng cấp gói Premium!' : 'Please log in to upgrade to Premium!')
      return
    }

    const currentPlan = plans.find((p) => p.id === selectedPlan) || plans[2]
    setIsSubmitting(true)

    try {
      const res = await subscriptionService.subscribe({
        plan_slug: 'premium',
        billing_cycle: currentPlan.cycle,
        payment_method: 'VNPAY',
      })

      const updatedUser = {
        ...user,
        is_premium: true,
        subscription_expires_at: res.expires_at || res.subscription?.expires_at,
        subscription_plan: currentPlan.cycle,
      }

      setUser(updatedUser)
      if (typeof window !== 'undefined') {
        localStorage.setItem(API_CONFIG.STORAGE_KEYS.USER, JSON.stringify(updatedUser))
      }

      setSuccessMessage(isVietnamese ? 'Chúc mừng! Bạn đã nâng cấp thành công gói LingoSphere Premium!' : 'Congratulations! You have successfully upgraded to LingoSphere Premium!')

      setTimeout(() => {
        setSuccessMessage(null)
        onOpenChange(false)
      }, 2000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (isVietnamese ? 'Có lỗi xảy ra khi kích hoạt gói' : 'Failed to upgrade subscription')
      alert(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isSubmitting && onOpenChange(false)} />

      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="overflow-hidden rounded-2xl bg-surface shadow-xl">
          <div className="relative bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500 px-4 py-3 text-center text-white">
            <button
              onClick={() => !isSubmitting && onOpenChange(false)}
              disabled={isSubmitting}
              className="absolute right-3 top-3 rounded-full p-1 transition-colors hover:bg-white/20"
            >
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
            {successMessage ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <Sparkles className="h-8 w-8 animate-bounce text-amber-500" />
                </div>
                <h3 className="text-base font-bold text-text-primary">{isVietnamese ? 'Kích Hoạt Thành Công!' : 'Upgrade Successful!'}</h3>
                <p className="mt-1 text-xs text-text-secondary">{successMessage}</p>
              </div>
            ) : (
              <>
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

                <Button
                  disabled={isSubmitting}
                  className="h-10 w-full bg-gradient-to-r from-amber-500 to-orange-500 text-sm font-semibold text-white hover:from-amber-600 hover:to-orange-600"
                  onClick={handleUpgrade}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isVietnamese ? 'Đang kích hoạt...' : 'Activating...'}
                    </span>
                  ) : (
                    isVietnamese ? 'Mở khóa ngay' : 'Unlock Now'
                  )}
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
