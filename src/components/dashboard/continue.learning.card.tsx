/**
 * @file continue.learning.card.tsx
 * @description Component giao diện React ContinueLearningCard cho học viên
 */

import { useTranslation } from 'react-i18next'
import { ArrowRight, Play } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface ContinueLearningCardProps {
  onAction: (message: string) => void
}

export function ContinueLearningCard({ onAction }: ContinueLearningCardProps) {
  const { t } = useTranslation()

  return (
    <Card className="dashboard-card p-0">
      <CardHeader className="p-5 pb-0 sm:p-6 sm:pb-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary"><Play aria-hidden="true" className="h-4 w-4 fill-current" /></span>
              <h2 className="text-[19px] font-bold text-text-primary">{t('dashboard.continueLearning')}</h2>
            </div>
            <h3 className="mt-5 text-[22px] font-bold text-text-primary">TOEIC Foundation</h3>
            <p className="mt-1 text-[13px] text-text-secondary">Unit 04 · Daily Communication</p>
          </div>
          <span className="shrink-0 rounded-xl bg-warning-soft px-3 py-2 text-[12px] font-bold text-warning">72% complete</span>
        </div>
      </CardHeader>
      <CardContent className="gap-0 p-5 sm:p-6">
        <div className="mt-5 flex justify-between text-[12px] text-text-tertiary">
          <span>18 / 25 lessons</span>
          <span>72%</span>
        </div>
        <Progress aria-label="TOEIC Foundation progress" className="mt-1.5 h-2 bg-primary-soft [&_[data-slot=progress-indicator]]:rounded-full" value={72} />
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-3 border-t border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 sm:pt-4">
        <span className="text-[12px] text-text-tertiary">Unit 04 · Daily Communication</span>
        <Button className="dashboard-button w-full bg-primary px-4 text-primary-foreground hover:bg-primary-hover sm:w-auto" onClick={() => onAction('Đã mở Unit 04 · Daily Communication.')}>
          {t('dashboard.continueLearning')} <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  )
}
