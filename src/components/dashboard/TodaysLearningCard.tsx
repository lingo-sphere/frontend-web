/**
 * @file TodaysLearningCard.tsx
 * @description Component giao diện React TodaysLearningCard cho học viên
 */

import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@/components/icons/icon-map'
import { SectionHeading } from '@/components/dashboard/SectionHeading'
import type { LearningTask } from '@/types/dashboard'

interface TodaysLearningCardProps {
  tasks: LearningTask[]
  onAction: (message: string) => void
}

export function TodaysLearningCard({ tasks, onAction }: TodaysLearningCardProps) {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const getTaskLabel = (task: LearningTask) => {
    const kindLabels: Record<string, { vi: string; en: string }> = {
      vocabulary: { vi: 'Từ vựng', en: 'Vocabulary' },
      listening: { vi: 'Nghe', en: 'Listening' },
      writing: { vi: 'Viết', en: 'Writing' },
      speaking: { vi: 'Nói', en: 'Speaking' },
    }
    return kindLabels[task.kind]?.[isVietnamese ? 'vi' : 'en'] || task.label
  }

  return (
    <Card className="dashboard-card p-0">
      <CardContent className="p-5 sm:p-6">
        <SectionHeading
          actionLabel={isVietnamese ? 'Bắt đầu học' : 'Start Learning'}
          onAction={() => onAction(isVietnamese ? 'Đã bắt đầu kế hoạch học hôm nay.' : 'Started today\'s learning plan.')}
          title={isVietnamese ? "Học hôm nay" : "Today's Learning"}
          eyebrow={isVietnamese ? 'Kế hoạch hôm nay' : 'Plan for today'}
        />
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {tasks.map((task) => (
            <Button
              className={`h-auto min-h-[62px] justify-start gap-3 rounded-xl border px-3 text-left transition-all hover:-translate-y-0.5 ${
                task.completed ? 'border-success/35 bg-success-soft hover:bg-success-soft' : 'border-border bg-background hover:bg-surface-hover'
              }`}
              key={task.id}
              onClick={() => onAction(`${getTaskLabel(task)} ${isVietnamese ? 'đã sẵn sàng.' : 'is ready.'}`)}
              variant="ghost"
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                task.completed ? 'bg-success/10 text-success' : 'bg-surface text-text-secondary'
              }`}>
                <Icon name={task.icon} size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-text-primary">{getTaskLabel(task)}</span>
                <span className="mt-0.5 block text-[11px] text-text-tertiary">{task.durationLabel}</span>
              </span>
              {task.completed ? <Icon className="text-success" name="check" size={15} /> : <ArrowRight className="h-4 w-4 text-text-tertiary" />}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
