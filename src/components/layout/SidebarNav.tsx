'use client'

import { useNavigate, useLocation } from '@/lib/navigation'
import { useTranslation } from 'react-i18next'
import { useMounted } from '@/hooks/use-mounted'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Icon } from '@/components/icons/icon-map'
import type { NavGroup, NavItem } from '@/config/navigation.config'

interface SidebarNavProps {
  groups: NavGroup[]
  activeItem?: string
  onNavigate: (id: string) => void
  collapsed?: boolean
}

const routeMap: Record<string, string> = {
  home: '/home',
  courses: '/courses',
  toeic: '/toeic',
  vocabulary: '/vocabulary',
  listening: '/listening',
  writing: '/writing',
  speaking: '/speaking',
  journal: '/journal',
  grammar: '/grammar',
  ipa: '/ipa',
  'ai-learning': '/ai-learning',
  translate: '/translate',
  community: '/community',
  leaderboard: '/leaderboard',
  notes: '/notes',
  roadmap: '/roadmap',
  'public-decks': '/public-decks',
  topics: '/topics',
  progress: '/progress',
  notifications: '/notifications',
  settings: '/settings',
  profile: '/profile',
}

export function SidebarNav({ groups, onNavigate, collapsed = false }: SidebarNavProps) {
  const { i18n } = useTranslation()
  const mounted = useMounted()
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname

  const isVietnamese = mounted ? i18n.language === 'vi' : true

  const isItemActive = (item: NavItem) => {
    const itemRoute = routeMap[item.id] || item.path
    if (item.id === 'home') {
      return currentPath === '/home' || currentPath === '/'
    }
    if (item.id === 'courses') {
      return currentPath === '/courses' || currentPath.startsWith('/course/') || currentPath.startsWith('/courses/')
    }
    if (item.id === 'vocabulary') {
      return (
        currentPath === '/vocabulary' ||
        currentPath.startsWith('/vocabulary/') ||
        currentPath === '/topics' ||
        currentPath.startsWith('/topics/') ||
        currentPath === '/public-decks' ||
        currentPath.startsWith('/public-decks/')
      )
    }
    if (item.id === 'toeic') {
      return currentPath === '/toeic' || currentPath.startsWith('/toeic/')
    }
    return currentPath === itemRoute || (itemRoute !== '/' && currentPath.startsWith(`${itemRoute}/`))
  }

  const handleClick = (itemId: string) => {
    onNavigate(itemId)
    const route = routeMap[itemId] ?? '/home'
    navigate(route)
  }

  return (
    <nav aria-label="Primary navigation" className={`min-h-0 flex-1 overflow-y-auto py-5 pr-1 ${collapsed ? 'scrollbar-none' : ''}`}>
      {groups.map((group, index) => (
        <div className={index === 0 ? '' : 'pt-4'} key={group.id}>
          {index > 0 && <Separator className={collapsed ? 'mb-2' : 'mb-4'} />}
          {(group.titleVi || group.titleEn) && (
            <div
              suppressHydrationWarning
              className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary ${collapsed ? 'hidden' : ''}`}
            >
              {isVietnamese ? group.titleVi : group.titleEn}
            </div>
          )}
          <div className={collapsed ? 'flex flex-col items-center gap-2' : 'space-y-1'}>
            {group.items.map((item) => {
              const isActive = isItemActive(item)
              const iconClass = isActive ? 'text-primary' : 'text-text-secondary'
              const label = isVietnamese ? item.labelVi : item.labelEn

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
                  {!collapsed && (
                    <span suppressHydrationWarning className="truncate text-left">
                      {label}
                    </span>
                  )}
                </Button>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}
