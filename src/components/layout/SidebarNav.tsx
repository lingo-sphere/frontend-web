
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Icon } from '@/components/icons/icon-map'
import type { NavGroup } from '@/types/dashboard'

interface SidebarNavProps {
  groups: NavGroup[]
  activeItem: string
  onNavigate: (id: string) => void
  collapsed?: boolean
}

const routeMap: Record<string, string> = {
  home: '/',
  courses: '/courses',
  roadmap: '/roadmap',
  vocabulary: '/vocabulary',
  practice: '/practice',
  listening: '/listening',
  writing: '/writing',
  speaking: '/speaking',
  ipa: '/ipa',
  notes: '/notes',
  'ai-learning': '/ai-learning',
  community: '/community',
  'public-decks': '/public-decks',
  topics: '/topics',
  leaderboard: '/leaderboard',
  progress: '/progress',
  notifications: '/notifications',
  settings: '/settings',
  profile: '/profile',
}

const navLabels: Record<string, { vi: string; en: string }> = {
  home: { vi: 'Trang chủ', en: 'Home' },
  courses: { vi: 'Khóa học', en: 'Courses' },
  roadmap: { vi: 'Lộ trình', en: 'Roadmap' },
  vocabulary: { vi: 'Từ vựng', en: 'Vocabulary' },
  practice: { vi: 'Luyện tập', en: 'Practice' },
  listening: { vi: 'Nghe', en: 'Listening' },
  writing: { vi: 'Viết', en: 'Writing' },
  speaking: { vi: 'Nói', en: 'Speaking' },
  ipa: { vi: 'IPA', en: 'IPA' },
  notes: { vi: 'Ghi chú', en: 'Notes' },
  'ai-learning': { vi: 'AI Learning', en: 'AI Learning' },
  community: { vi: 'Chat cộng đồng', en: 'Community Chat' },
  'public-decks': { vi: 'Bộ thẻ công khai', en: 'Public Decks' },
  topics: { vi: 'Chủ đề', en: 'Topics' },
  leaderboard: { vi: 'Bảng xếp hạng', en: 'Leaderboard' },
  progress: { vi: 'Tiến độ', en: 'Progress' },
  notifications: { vi: 'Thông báo', en: 'Notifications' },
  settings: { vi: 'Cài đặt', en: 'Settings' },
  profile: { vi: 'Hồ sơ', en: 'Profile' },
}

const groupLabels: Record<string, { vi: string; en: string }> = {
  home: { vi: '', en: '' },
  learning: { vi: 'HỌC TẬP', en: 'LEARNING' },
  ai: { vi: '', en: '' },
  community: { vi: '', en: '' },
  leaderboard: { vi: '', en: '' },
  progress: { vi: '', en: '' },
  system: { vi: '', en: '' },
}

const accentClasses: Record<string, string> = {
  ai: 'text-ai',
  info: 'text-info',
  neutral: 'text-text-secondary',
  primary: 'text-primary',
  yellow: 'text-warning',
}

export function SidebarNav({ groups, activeItem, onNavigate, collapsed = false }: SidebarNavProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const navigate = useNavigate()

  const handleClick = (itemId: string) => {
    onNavigate(itemId)

    if (itemId === 'profile') return
    const route = routeMap[itemId] ?? '/'
    navigate(route)
  }

  return (
    <nav aria-label="Primary navigation" className={`min-h-0 flex-1 overflow-y-auto py-5 pr-1 ${collapsed ? 'scrollbar-none' : ''}`}>
      {groups.map((group, index) => (
        <div className={index === 0 ? '' : 'pt-4'} key={group.id}>
          {index > 0 && <Separator className={collapsed ? 'mb-2' : 'mb-4'} />}
          {/* Group label */}
          {group.label && (
            <div className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary ${collapsed ? 'hidden' : ''}`}>
              {groupLabels[group.id]?.[isVietnamese ? 'vi' : 'en'] || group.label}
            </div>
          )}
          <div className={collapsed ? 'flex flex-col items-center gap-2' : 'space-y-1'}>
            {group.items.map((item) => {
              const isActive = activeItem === item.id
              const iconClass = isActive ? 'text-primary' : accentClasses[item.accent ?? 'neutral']
              const label = navLabels[item.id]?.[isVietnamese ? 'vi' : 'en'] || item.label

              return (
                <Button
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={collapsed ? label : undefined}
                  className={`h-9 justify-start gap-3 rounded-xl px-3 text-[13px] transition-colors ${
                    collapsed ? '!w-11 !flex-initial !justify-center !px-0' : 'w-full'
                  } ${
                    isActive
                      ? 'bg-primary-soft font-semibold text-primary hover:bg-primary-soft'
                      : 'font-normal text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                  }`}
                  key={item.id}
                  onClick={() => handleClick(item.id)}
                  variant="ghost"
                >
                  <Icon className={iconClass} name={item.icon} size={17} />
                  {!collapsed && <span className="truncate text-left">{label}</span>}
                </Button>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}
