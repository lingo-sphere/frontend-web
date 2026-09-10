/**
 * @file upgrade.data.ts
 * @description Định nghĩa dữ liệu các gói thành viên VIP và danh sách quyền lợi
 */

import {
  BookOpen,
  PenTool,
  Mic,
  Bot,
  GraduationCap,
  Sparkle,
} from 'lucide-react'

export interface Plan {
  id: string
  cycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'LIFETIME'
  duration: { en: string; vi: string }
  price: number
  originalPrice?: number
  perMonth: { en: string; vi: string }
  discount?: string
  recommended?: boolean
}

export const getPlans = (): Plan[] => [
  {
    id: '1-month',
    cycle: 'MONTHLY',
    duration: { en: '1 Month', vi: '1 tháng' },
    price: 79000,
    perMonth: { en: '79,000/mo', vi: '79.000đ/tháng' },
  },
  {
    id: '3-month',
    cycle: 'QUARTERLY',
    duration: { en: '3 Months', vi: '3 tháng' },
    price: 169000,
    originalPrice: 237000,
    perMonth: { en: '~56,333/mo', vi: '~56.333đ/tháng' },
    discount: '-29%',
  },
  {
    id: '12-month',
    cycle: 'YEARLY',
    duration: { en: '1 Year', vi: '1 năm' },
    price: 499000,
    originalPrice: 948000,
    perMonth: { en: '~41,583/mo', vi: '~41.583đ/tháng' },
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

export const getBenefits = (isVietnamese: boolean) => [
  {
    icon: BookOpen,
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    title: isVietnamese ? 'Mở khóa toàn bộ khóa học' : 'All Courses Unlocked',
    desc: isVietnamese ? 'Học không giới hạn mọi bài giảng' : 'Unlimited access to all curriculum',
  },
  {
    icon: PenTool,
    color: 'text-violet-600 dark:text-violet-400 bg-violet-500/10',
    title: isVietnamese ? 'AI chấm chữa Writing' : 'AI Writing Evaluation',
    desc: isVietnamese ? 'Sửa chi tiết ngữ pháp & từ vựng' : 'Deep grammar & lexical feedback',
  },
  {
    icon: Mic,
    color: 'text-sky-600 dark:text-sky-400 bg-sky-500/10',
    title: isVietnamese ? 'AI chấm điểm Speaking' : 'AI Speaking Scoring',
    desc: isVietnamese ? 'Phát âm chuẩn xác cùng Whisper AI' : 'Pronunciation analysis via Whisper AI',
  },
  {
    icon: Bot,
    color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
    title: isVietnamese ? 'Gia sư AI 24/7' : '24/7 AI Tutor',
    desc: isVietnamese ? 'Giải đáp thắc mắc chuyên sâu siêu tốc' : 'Real-time interactive tutoring',
  },
  {
    icon: GraduationCap,
    color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10',
    title: isVietnamese ? 'Thi thử TOEIC Full/Mini' : 'TOEIC Mock Exams',
    desc: isVietnamese ? 'Không giới hạn lượt thi đề chuẩn ETS' : 'Unlimited ETS test simulations',
  },
  {
    icon: Sparkle,
    color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10',
    title: isVietnamese ? 'Trải nghiệm không quảng cáo' : 'Ad-free Experience',
    desc: isVietnamese ? 'Tập trung tối đa vào việc học' : 'Zero interruptions & priority speed',
  },
]
