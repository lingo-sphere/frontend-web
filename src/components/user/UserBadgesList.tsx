import { Icon } from '@/components/icons/icon-map'
import type { Achievement } from '@/types/user'

export function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <div
      className={`rounded-xl p-4 ${
        achievement.isCompleted ? 'bg-primary-10' : 'bg-surface-subtle'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`text-3xl ${
            achievement.isCompleted ? '' : 'grayscale opacity-50'
          }`}
        >
          {achievement.icon}
        </div>
        <div className="flex-1">
          <div className="font-medium text-text-primary">
            {achievement.title}
          </div>
          <div className="text-xs text-text-secondary">
            {achievement.description}
          </div>
          {!achievement.isCompleted && (
            <div className="mt-2">
              <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{
                    width: `${
                      (achievement.progress / achievement.maxProgress) * 100
                    }%`,
                  }}
                />
              </div>
              <div className="text-xs text-text-tertiary mt-1">
                {achievement.progress}/{achievement.maxProgress}
              </div>
            </div>
          )}
        </div>
        {achievement.isCompleted && (
          <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
            <Icon name="check" size={14} className="text-white" />
          </div>
        )}
      </div>
    </div>
  )
}

interface UserBadgesListProps {
  achievements: Achievement[]
}

export function UserBadgesList({ achievements }: UserBadgesListProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {achievements.map((achievement) => (
        <AchievementCard key={achievement.id} achievement={achievement} />
      ))}
    </div>
  )
}
