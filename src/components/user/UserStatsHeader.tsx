/**
 * @file UserStatsHeader.tsx
 * @description Component giao diện React UserStatsHeader cho học viên
 */

import { Icon } from '@/components/icons/icon-map'
import { Button } from '@/components/ui/button'
import type { User } from '@/types/user'

interface UserAvatarProps {
  src?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  editable?: boolean
  onClick?: () => void
}

export function UserAvatar({
  src,
  size = 'md',
  editable = false,
  onClick,
}: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  }

  return (
    <div className="relative group">
      {src ? (
        <img
          src={src}
          alt="Avatar"
          className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-surface-subtle`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-primary-20 flex items-center justify-center`}
        >
          <Icon
            name="user"
            size={size === 'xl' ? 40 : size === 'lg' ? 24 : 16}
          />
        </div>
      )}
      {editable && (
        <button
          onClick={onClick}
          className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Icon name="camera" size={20} className="text-white" />
        </button>
      )}
    </div>
  )
}

interface UserStatsHeaderProps {
  user: User
  onEditClick: () => void
}

export function UserStatsHeader({ user, onEditClick }: UserStatsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
      <UserAvatar src={user.avatar} size="xl" />
      <div className="flex-1 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
          <h2 className="text-xl font-bold text-text-primary">
            {user.displayName}
          </h2>
          <span className="text-xs px-2.5 py-0.5 bg-primary-10 text-primary font-semibold rounded-full w-fit mx-auto sm:mx-0">
            Level {user.stats?.level || 1}
          </span>
        </div>
        <p className="text-sm text-text-secondary mb-2">{user.email}</p>
        {user.bio && (
          <p className="text-xs text-text-tertiary max-w-lg mb-3">
            {user.bio}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onEditClick}
            className="text-xs"
          >
            <Icon name="edit" size={14} />
            Chỉnh sửa hồ sơ
          </Button>
        </div>
      </div>
    </div>
  )
}
