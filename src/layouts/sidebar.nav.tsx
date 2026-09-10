/**
 * @file sidebar.nav.tsx
 * @description Component giao diện React SidebarNav cho học viên
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocation } from '@/lib/navigation'
import { useTranslation } from 'react-i18next'
import { useMounted } from '@/hooks/use.mounted'
import { Button } from '@/components/button'
import { Icon } from '@/components/icon.map'
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
  'courses-all': '/courses?tab=all',
  'courses-my': '/courses?tab=my-courses',
  'courses-liked': '/courses?tab=wishlist',
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
  const location = useLocation()
  const currentPath = location.pathname
  const currentSearch = location.search

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({})

  const isVietnamese = mounted ? i18n.language === 'vi' : true

  const toggleSubMenu = (itemId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    setExpandedMenus((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  const isChildActive = (child: NavItem) => {
    const tabParam = new URLSearchParams(currentSearch).get('tab')
    if (child.id === 'courses-all') {
      return currentPath === '/courses' && (!tabParam || tabParam === 'all')
    }
    if (child.id === 'courses-my') {
      return currentPath === '/courses' && tabParam === 'my-courses'
    }
    if (child.id === 'courses-liked') {
      return currentPath === '/courses' && tabParam === 'wishlist'
    }
    return currentPath === child.path || `${currentPath}${currentSearch}` === child.path
  }

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

  return (
    <nav aria-label="Primary navigation" className={`min-h-0 flex-1 overflow-y-auto py-2 pr-1 ${collapsed ? 'scrollbar-none' : ''}`}>
      {groups.map((group, index) => (
        <div className={index === 0 ? '' : 'pt-1'} key={group.id}>
          {index > 0 && (
            <div className={`my-3 border-t border-border/70 ${collapsed ? 'mx-1' : 'mx-2'}`} />
          )}
          {(group.titleVi || group.titleEn) && (
            <div
              suppressHydrationWarning
              className={`mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-text-secondary/80 ${collapsed ? 'hidden' : ''}`}
            >
              {isVietnamese ? group.titleVi : group.titleEn}
            </div>
          )}
          <div className={collapsed ? 'flex flex-col items-center gap-2' : 'space-y-1'}>
            {group.items.map((item) => {
              const isActive = isItemActive(item)
              const hasChildren = Boolean(item.children && item.children.length > 0)
              const isExpanded = Boolean(expandedMenus[item.id])
              const iconClass = isActive ? 'text-primary' : 'text-text-primary/70'
              const label = isVietnamese ? item.labelVi : item.labelEn
              const itemRoute = routeMap[item.id] || item.path

              if (!hasChildren) {
                return (
                  <Link
                    key={item.id}
                    href={itemRoute}
                    prefetch={true}
                    onClick={() => onNavigate(item.id)}
                    className="block w-full"
                  >
                    <Button
                      aria-current={isActive ? 'page' : undefined}
                      aria-label={collapsed ? label : undefined}
                      className={`h-9 justify-start gap-3 rounded-xl px-3 text-[13px] transition-colors ${
                        collapsed ? '!w-11 !flex-initial !justify-center !px-0' : 'w-full'
                      } ${
                        isActive
                          ? 'bg-primary-soft font-semibold text-primary hover:bg-primary-soft'
                          : 'font-medium text-text-primary/80 hover:bg-surface-hover hover:text-text-primary'
                      }`}
                      variant="ghost"
                    >
                      <Icon className={iconClass} name={item.icon} size={17} />
                      {!collapsed && (
                        <span suppressHydrationWarning className="flex-1 truncate text-left">
                          {label}
                        </span>
                      )}
                    </Button>
                  </Link>
                )
              }

              return (
                <div key={item.id} className="w-full">
                  <Button
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={collapsed ? label : undefined}
                    className={`h-9 justify-start gap-3 rounded-xl px-3 text-[13px] transition-colors ${
                      collapsed ? '!w-11 !flex-initial !justify-center !px-0' : 'w-full'
                    } ${
                      isActive
                        ? 'font-semibold text-text-primary hover:bg-surface-hover'
                        : 'font-medium text-text-primary/80 hover:bg-surface-hover hover:text-text-primary'
                    }`}
                    onClick={() => {
                      toggleSubMenu(item.id)
                    }}
                    variant="ghost"
                  >
                    <Icon className={iconClass} name={item.icon} size={17} />
                    {!collapsed && (
                      <span suppressHydrationWarning className="flex-1 truncate text-left">
                        {label}
                      </span>
                    )}
                    {!collapsed && (
                      <span
                        onClick={(e) => toggleSubMenu(item.id, e)}
                        className={`flex items-center justify-center p-1 bg-transparent transition-transform duration-300 ease-in-out ${
                          isActive ? 'text-primary/70 hover:text-primary' : 'text-text-primary/50 hover:text-text-primary'
                        } ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                      >
                        <Icon name="chevronDown" size={14} />
                      </span>
                    )}
                  </Button>

                  {!collapsed && (
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isExpanded ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                      }`}
                    >
                      <div className="ml-5 mt-1 space-y-0.5 border-l border-border/80 pl-2">
                        {item.children!.map((child) => {
                          const childActive = isChildActive(child)
                          const childLabel = isVietnamese ? child.labelVi : child.labelEn
                          const childIconClass = childActive ? 'text-primary' : 'text-text-primary/60'

                          return (
                            <Link
                              key={child.id}
                              href={child.path}
                              prefetch={true}
                              onClick={() => onNavigate(child.id)}
                              className={`flex h-8 w-full items-center gap-2.5 rounded-lg px-2.5 text-[12px] transition-colors cursor-pointer ${
                                childActive
                                  ? 'bg-primary-soft font-bold text-primary'
                                  : 'font-medium text-text-primary/75 hover:bg-surface-hover hover:text-text-primary'
                              }`}
                            >
                              <Icon className={childIconClass} name={child.icon} size={14} />
                              <span suppressHydrationWarning className="truncate text-left">
                                {childLabel}
                              </span>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}
