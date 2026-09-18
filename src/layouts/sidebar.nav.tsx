// Component hiển thị danh mục điều hướng thanh bên cho học viên.

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useLocation } from '@/lib/navigation'
import { useTranslation } from 'react-i18next'
import { useMounted } from '@/hooks/use.mounted'
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

  const isVietnamese = mounted ? i18n.language === 'vi' : true

  const isChildActive = (child: NavItem) => {
    const tabParam = new URLSearchParams(currentSearch).get('tab')
    if (child.id === 'courses-all') {
      return (currentPath === '/courses' || currentPath.startsWith('/courses/')) && (!tabParam || tabParam === 'all')
    }
    if (child.id === 'courses-my') {
      return (currentPath === '/courses' || currentPath.startsWith('/courses/')) && tabParam === 'my-courses'
    }
    if (child.id === 'courses-liked') {
      return (currentPath === '/courses' || currentPath.startsWith('/courses/')) && tabParam === 'wishlist'
    }
    return currentPath === child.path || `${currentPath}${currentSearch}` === child.path
  }

  const isItemActive = (item: NavItem) => {
    if (item.children && item.children.some((c) => isChildActive(c))) {
      return true
    }
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

  const [expandedItem, setExpandedItem] = useState<string | null>(() => {
    for (const group of groups) {
      for (const item of group.items) {
        if (item.children && (isItemActive(item) || item.children.some((c) => isChildActive(c)))) {
          return item.id
        }
      }
    }
    return null
  })

  useEffect(() => {
    for (const group of groups) {
      for (const item of group.items) {
        if (item.children && (isItemActive(item) || item.children.some((c) => isChildActive(c)))) {
          setExpandedItem(item.id)
          return
        }
      }
    }
  }, [currentPath, currentSearch, groups])

  const toggleExpand = (id: string) => {
    setExpandedItem((prev) => (prev === id ? null : id))
  }

  return (
    <nav aria-label="Primary navigation" className={`min-h-0 flex-1 overflow-y-auto py-2 pr-0.5 space-y-1 ${collapsed ? 'scrollbar-none' : ''}`}>
      {groups.map((group, groupIdx) => (
        <div key={group.id} className="space-y-1">
          {groupIdx > 0 && (
            <div className={`my-2 border-t border-border ${collapsed ? 'mx-1' : 'mx-2'}`} />
          )}
          {!collapsed && (group.titleVi || group.titleEn) && (
            <div
              suppressHydrationWarning
              className="pt-1 pb-1 px-3 text-[10.5px] font-extrabold uppercase tracking-wider text-text-tertiary"
            >
              {isVietnamese ? group.titleVi : group.titleEn}
            </div>
          )}
          <div className="space-y-1">
            {group.items.map((item) => {
              const active = isItemActive(item)
              const hasChildren = Boolean(item.children && item.children.length > 0)
              const isExpanded = expandedItem === item.id
              const label = isVietnamese ? item.labelVi : item.labelEn
              const itemRoute = routeMap[item.id] || item.path

              if (collapsed) {
                return (
                  <Link
                    key={item.id}
                    href={itemRoute}
                    prefetch={true}
                    onClick={() => onNavigate(item.id)}
                    className={`relative w-full flex items-center justify-center p-1.5 rounded-2xl transition-all cursor-pointer ${
                      active ? 'bg-primary-soft' : 'hover:bg-surface-hover'
                    }`}
                    title={label}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-r-full" />
                    )}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        active
                          ? 'bg-primary text-white shadow-sm shadow-primary/30'
                          : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" name={item.icon} size={18} />
                    </div>
                  </Link>
                )
              }

              if (!hasChildren) {
                return (
                  <Link
                    key={item.id}
                    href={itemRoute}
                    prefetch={true}
                    onClick={() => onNavigate(item.id)}
                    className={`group relative w-full flex items-center justify-between px-2.5 py-2 rounded-2xl text-xs sm:text-[13px] transition-all cursor-pointer ${
                      active ? 'bg-primary-soft' : 'hover:bg-surface-hover'
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-r-full" />
                    )}

                    <div className="flex items-center gap-3 min-w-0 pl-1">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                          active
                            ? 'bg-primary text-white shadow-sm shadow-primary/25'
                            : 'bg-surface-subtle text-text-secondary group-hover:bg-surface-hover group-hover:text-text-primary'
                        }`}
                      >
                        <Icon className="w-4 h-4" name={item.icon} size={16} />
                      </div>
                      <span
                        className={`truncate ${
                          active
                            ? 'text-primary font-bold'
                            : 'text-text-secondary font-medium group-hover:text-text-primary'
                        }`}
                        suppressHydrationWarning
                      >
                        {label}
                      </span>
                    </div>

                    {item.badge && (
                      <div className="flex items-center shrink-0 pr-1">
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                          {item.badge}
                        </span>
                      </div>
                    )}
                  </Link>
                )
              }

              return (
                <div key={item.id} className="space-y-0.5">
                  <button
                    className={`group relative w-full flex items-center justify-between px-2.5 py-2 rounded-2xl text-xs sm:text-[13px] transition-all cursor-pointer ${
                      active ? 'bg-primary-soft' : 'hover:bg-surface-hover'
                    }`}
                    onClick={() => toggleExpand(item.id)}
                    type="button"
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-r-full" />
                    )}

                    <div className="flex items-center gap-3 min-w-0 pl-1">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                          active
                            ? 'bg-primary text-white shadow-sm shadow-primary/25'
                            : 'bg-surface-subtle text-text-secondary group-hover:bg-surface-hover group-hover:text-text-primary'
                        }`}
                      >
                        <Icon className="w-4 h-4" name={item.icon} size={16} />
                      </div>
                      <span
                        className={`truncate ${
                          active
                            ? 'text-primary font-bold'
                            : 'text-text-secondary font-medium group-hover:text-text-primary'
                        }`}
                        suppressHydrationWarning
                      >
                        {label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pr-1">
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                          {item.badge}
                        </span>
                      )}
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                          isExpanded
                            ? 'rotate-0 text-primary opacity-100'
                            : `-rotate-90 ${active ? 'text-primary opacity-90' : 'text-text-tertiary opacity-60'}`
                        }`}
                      />
                    </div>
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                      isExpanded
                        ? 'grid-rows-[1fr] opacity-100'
                        : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="ml-4 pl-3 border-l-2 border-border space-y-0.5 py-1">
                        {item.children!.map((child) => {
                          const childActive = isChildActive(child)
                          const childLabel = isVietnamese ? child.labelVi : child.labelEn
                          const childPath = child.path

                          return (
                            <Link
                              key={child.id}
                              href={childPath}
                              prefetch={true}
                              onClick={() => onNavigate(child.id)}
                              className={`relative w-full flex items-center justify-between pl-3 pr-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                                childActive
                                  ? 'text-primary bg-primary-soft font-bold'
                                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover font-medium'
                              }`}
                            >
                              {childActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-r-full" />
                              )}
                              <span className="truncate" suppressHydrationWarning>{childLabel}</span>
                              {childActive && (
                                <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
                              )}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}




