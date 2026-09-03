/**
 * @file ExploreTopics.tsx
 * @description Component giao diện React ExploreTopics cho học viên
 */

import { useTranslation } from 'react-i18next'
import { ArrowUpRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeading } from '@/components/dashboard/section.heading'
import type { Topic } from '@/types/dashboard'

interface ExploreTopicsProps {
  topics: Topic[]
  onAction: (message: string) => void
}

export function ExploreTopics({ topics, onAction }: ExploreTopicsProps) {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  return (
    <Card className="dashboard-card flex h-full flex-col p-0">
      <CardContent className="flex h-full flex-col p-5 sm:p-6">
        <SectionHeading
          actionLabel={isVietnamese ? 'Xem tất cả' : 'View all'}
          onAction={() => onAction(isVietnamese ? 'Đã mở tất cả chủ đề.' : 'Opened all topics.')}
          title={isVietnamese ? 'Khám phá chủ đề' : 'Explore Topics'}
          eyebrow={isVietnamese ? 'Xây dựng vốn từ' : 'Build your vocabulary'}
          description={isVietnamese ? 'Học từ vựng theo chủ đề' : 'Learn vocabulary by topic'}
        />
        <div className="mt-5 grid flex-1 gap-3 sm:grid-cols-2">
          {topics.map((topic) => (
            <article
              className="rounded-xl border border-border bg-background p-4 transition-transform hover:-translate-y-0.5 hover:bg-surface-hover"
              key={topic.id}
            >
              <div className="flex items-center justify-between">
                <span className="text-[22px]" role="img" aria-label={`${topic.label} topic`}>
                  {topic.emoji}
                </span>
                <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-primary" />
              </div>
              <h3 className="mt-4 text-[14px] font-semibold text-text-primary">{topic.label}</h3>
              <p className="mt-1 text-[12px] text-text-tertiary">
                {topic.words} {isVietnamese ? 'từ' : 'words'}
              </p>
              <Button
                className="mt-4 h-auto p-0 text-[11px] font-semibold text-primary hover:bg-transparent hover:text-primary-hover"
                onClick={() => onAction(`${isVietnamese ? 'Đã mở chủ đề' : 'Opened topic'} ${topic.label}.`)}
                variant="ghost"
              >
                {isVietnamese ? 'Khám phá' : 'Explore'} →
              </Button>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
