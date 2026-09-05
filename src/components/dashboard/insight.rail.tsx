/**
 * @file insight.rail.tsx
 * @description Component giao diện React InsightRail cho học viên
 */

import { useTranslation } from 'react-i18next'
import { ArrowRight, Brain, Flame } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@/components/icons/icon.map'

interface InsightRailProps {
  onAction: (message: string) => void
}

export function InsightRail({ onAction }: InsightRailProps) {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  return (
    <div className="flex h-full flex-col gap-6">

      <Card className="dashboard-card flex-1 border-ai/30 bg-ai-soft p-0 shadow-none">
        <CardContent className="flex h-full flex-col p-5">
          <div className="flex items-center gap-2 text-ai">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface/70"><Brain className="h-4 w-4" /></span>
            <h2 className="text-[16px] font-bold">{isVietnamese ? 'Gợi ý từ AI' : 'AI Recommendation'}</h2>
          </div>
          <p className="mt-4 text-[13px] leading-5 text-text-secondary">
            {isVietnamese
              ? 'Kỹ năng nghe của bạn thấp hơn so với các kỹ năng khác.'
              : 'Your listening performance is lower than your other skills.'}
          </p>
          <p className="mt-4 text-[13px] leading-5 text-text-secondary">
            {isVietnamese
              ? 'Chúng tôi khuyên bạn nên luyện TOEIC Listening Part 3.'
              : 'We recommend practicing TOEIC Listening Part 3.'}
          </p>
          <Button
            className="mt-auto h-auto self-start p-0 text-[12px] font-semibold text-ai hover:bg-transparent hover:text-ai/80"
            onClick={() => onAction(isVietnamese ? 'Đã mở TOEIC Listening Part 3.' : 'Opened TOEIC Listening Part 3.')}
            variant="ghost"
          >
            {isVietnamese ? 'Luyện ngay' : 'Practice Now'} <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardContent>
      </Card>

      <div className="grid flex-1 grid-cols-2 gap-3">

        <Card className="dashboard-card flex h-full flex-col p-0 shadow-none">
          <CardContent className="flex h-full flex-col p-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-warning-soft text-warning"><Icon name="cards" size={15} /></span>
              <h2 className="text-[14px] font-bold text-text-primary">{t('vocabulary.title')}</h2>
            </div>
            <p className="mt-4 text-[25px] font-bold text-text-primary">356</p>
            <p className="text-[11px] text-text-tertiary">{isVietnamese ? 'từ đã học' : 'words learned'}</p>
            <dl className="mt-4 space-y-2 text-[11px]">
              <div className="flex justify-between gap-2"><dt className="text-text-secondary">{isVietnamese ? 'Đang học' : 'Learning'}</dt><dd className="font-semibold text-text-primary">42</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-text-secondary">{isVietnamese ? 'Đã thành thạo' : 'Mastered'}</dt><dd className="font-semibold text-text-primary">356</dd></div>
            </dl>
            <p className="mt-4 text-[11px] font-semibold text-error">
              {isVietnamese ? '18 từ sẵn sàng ôn tập' : '18 words ready for review'}
            </p>
            <Button
              className="mt-auto h-auto self-start p-0 text-[11px] font-semibold text-primary hover:bg-transparent hover:text-primary-hover"
              onClick={() => onAction(isVietnamese ? 'Đã mở Vocabulary Review.' : 'Opened Vocabulary Review.')}
              variant="ghost"
            >
              {isVietnamese ? 'Ôn từ vựng' : 'Review Vocabulary'} <ArrowRight className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        <Card className="dashboard-card flex h-full flex-col border-warning/40 bg-gradient-to-br from-warning-soft to-warning/10 p-0 shadow-none">
          <CardContent className="flex h-full flex-col p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-warning/20 text-streak">
                  <Flame className="h-4 w-4 fill-current" />
                </span>
                <h2 className="text-[14px] font-bold text-text-primary">{isVietnamese ? 'Phần thưởng' : 'Rewards'}</h2>
              </div>
              <span className="flex h-6 items-center gap-1 rounded-full bg-streak/20 px-2 text-[10px] font-bold text-streak">
                <Flame className="h-3 w-3 fill-current" />
                {isVietnamese ? 'Hoạt động' : 'Active'}
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-[32px] font-bold text-streak">12</span>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-streak">{isVietnamese ? 'Ngày Streak' : 'Day Streak'}</span>
                <span className="text-[11px] text-warning">{isVietnamese ? '🔥 Tiếp tục nhé!' : '🔥 Keep it up!'}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 text-[11px] text-text-secondary">
              <div className="flex items-center gap-1">
                <span>💎</span>
                <span className="font-semibold text-text-primary">1,250</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🧊</span>
                <span className="font-semibold text-text-primary">{isVietnamese ? '1 Freeze' : '1 Freeze'}</span>
              </div>
            </div>
            <Button
              className="mt-auto h-auto self-start p-0 text-[11px] font-semibold text-warning hover:bg-transparent hover:text-warning"
              onClick={() => onAction(isVietnamese ? 'Đã mở Manage Rewards.' : 'Opened Manage Rewards.')}
              variant="ghost"
            >
              {isVietnamese ? 'Quản lý phần thưởng' : 'Manage Rewards'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
