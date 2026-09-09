// Component giao diện React LearningRoadmap cho học viên.

import { useTranslation } from 'react-i18next'
import { Check, Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeading } from '@/components/dashboard/section.heading'
import type { RoadmapUnit } from '@/types/dashboard'

interface LearningRoadmapProps {
  units: RoadmapUnit[]
  onAction: (message: string) => void
}

export function LearningRoadmap({ units, onAction }: LearningRoadmapProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const getStatusLabel = (status: string) => {
    if (isVietnamese) {
      if (status === 'completed') return 'Hoàn thành'
      if (status === 'current') return 'Hiện tại'
      return 'Khóa'
    }
    if (status === 'completed') return 'Completed'
    if (status === 'current') return 'Current'
    return 'Locked'
  }

  return (
    <Card className="dashboard-card p-0">
      <CardContent className="p-5 sm:p-6">
        <SectionHeading
          actionLabel={isVietnamese ? 'Xem lộ trình' : 'View roadmap'}
          onAction={() => onAction(isVietnamese ? 'Đã mở Learning Roadmap.' : 'Opened Learning Roadmap.')}
          title={isVietnamese ? 'Lộ trình học tập' : 'My Learning Roadmap'}
          eyebrow={isVietnamese ? 'Hành trình khóa học' : 'Course journey'}
          description="TOEIC Foundation"
        />
        <div className="mt-6 flex min-w-[590px] items-start justify-between gap-3 px-2">
          {units.map((unit, index) => {
            const completed = unit.status === 'completed'
            const current = unit.status === 'current'
            return (
              <div className="relative flex min-w-[70px] flex-1 flex-col items-center text-center" key={unit.id}>
                {index < units.length - 1 && <span aria-hidden="true" className={`absolute left-[calc(50%+18px)] right-[calc(-50%+18px)] top-[18px] h-px ${completed ? 'bg-success/50' : 'bg-border'}`} />}
                <Button
                  aria-label={`${unit.label} · ${unit.status}`}
                  className={`relative z-[1] h-9 w-9 rounded-full p-0 ${
                    completed ? 'bg-primary text-primary-foreground hover:bg-primary-hover' :
                    current ? 'border-4 border-primary/20 bg-primary text-primary-foreground hover:bg-primary-hover' :
                    'bg-surface-subtle text-text-disabled hover:bg-surface-hover'
                  }`}
                  onClick={() => onAction(`${unit.label} ${isVietnamese ? 'đang ở trạng thái' : 'is at status'} ${getStatusLabel(unit.status)}.`)}
                  size="icon"
                  variant={completed || current ? 'default' : 'outline'}
                >
                  {completed ? <Check className="h-4 w-4" /> : current ? <span className="h-2 w-2 rounded-full bg-primary-foreground" /> : <Lock className="h-3.5 w-3.5" />}
                </Button>
                <span className="mt-2 text-[12px] font-semibold text-text-primary">{unit.label}</span>
                <span className={`mt-0.5 text-[10px] ${current ? 'font-semibold text-primary' : 'text-text-tertiary'}`}>{getStatusLabel(unit.status)}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
