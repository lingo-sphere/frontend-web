/**
 * @file UserActivityList.tsx
 * @description Component giao diện React UserActivityList cho học viên
 */

import { Icon } from '@/components/icons/icon-map'
import type { Activity } from '@/types/user'

const typeIcons: Record<string, string> = {
  vocabulary: 'book',
  listening: 'headphones',
  speaking: 'mic',
  exercise: 'check-square',
  streak: 'flame',
  achievement: 'award',
}

const typeColors: Record<string, string> = {
  vocabulary: 'bg-primary-10 text-primary',
  listening: 'bg-info-10 text-info',
  speaking: 'bg-warning-10 text-warning',
  exercise: 'bg-success-10 text-success',
  streak: 'bg-error-10 text-error',
  achievement: 'bg-purple-10 text-purple',
}

export function ActivityItem({ activity }: { activity: Activity }) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 24) return `${hours} giờ trước`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days} ngày trước`
    return date.toLocaleDateString('vi-VN')
  }

  return (
    <div className="flex items-start gap-3 py-3 border-b border-surface-subtle last:border-0">
      <div
        className={`w-8 h-8 ${
          typeColors[activity.type] || 'bg-primary-10 text-primary'
        } rounded-lg flex items-center justify-center flex-shrink-0`}
      >
        <Icon name={typeIcons[activity.type] || 'activity'} size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-text-primary text-sm">
          {activity.title}
        </div>
        <div className="text-xs text-text-secondary">
          {activity.description}
        </div>
        <div className="text-xs text-text-tertiary mt-1">
          {formatTime(activity.timestamp)}
        </div>
      </div>
      <div className="text-sm font-medium text-primary flex-shrink-0">
        +{activity.xpEarned} XP
      </div>
    </div>
  )
}

interface UserActivityListProps {
  activities: Activity[]
}

export function UserActivityList({ activities }: UserActivityListProps) {
  return (
    <div className="divide-y divide-surface-subtle">
      {activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  )
}
