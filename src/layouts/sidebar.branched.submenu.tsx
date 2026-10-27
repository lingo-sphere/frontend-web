// Component hiển thị danh mục con thanh bên với hiệu ứng đường rẽ nhánh SVG động.
'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Icon } from '@/components/icon.map'
import type { NavItem } from '@/config/navigation.config'

interface SidebarBranchedSubmenuProps {
  items: NavItem[]
  isChildActive: (child: NavItem) => boolean
  onNavigate: (id: string) => void
  isExpanded: boolean
  isVietnamese: boolean
}

const PAD = 4
const ROW_HEIGHT = 34
const INDENT = 36
const TRUNK = 14
const RADIUS = 8
const LINE_WIDTH = 1.5
const END_X = INDENT - 6

export function SidebarBranchedSubmenu({
  items,
  isChildActive,
  onNavigate,
  isExpanded,
  isVietnamese,
}: SidebarBranchedSubmenuProps) {
  const r = Math.min(RADIUS, ROW_HEIGHT / 2 - 2)
  const endX = END_X
  const rowY = (k: number) => PAD + k * ROW_HEIGHT + ROW_HEIGHT / 2
  const branch = (k: number) => `M ${TRUNK} ${rowY(k) - r} A ${r} ${r} 0 0 0 ${TRUNK + r} ${rowY(k)} H ${endX}`
  const reach = (k: number) => `M ${TRUNK} 0 V ${rowY(k) - r} A ${r} ${r} 0 0 0 ${TRUNK + r} ${rowY(k)} H ${endX}`
  const length = (k: number) => rowY(k) - r + (Math.PI * r) / 2 + (endX - TRUNK - r)

  const bodyH = PAD * 2 + items.length * ROW_HEIGHT
  const activeIndex = items.findIndex((item) => isChildActive(item))

  return (
    <div className="relative box-border ml-2" style={{ height: bodyH }}>
      <svg
        className={`pointer-events-none absolute top-0 left-0 overflow-visible transition-opacity duration-300 ${
          isExpanded ? 'opacity-100' : 'opacity-0'
        }`}
        width={INDENT}
        height={bodyH}
        aria-hidden="true"
      >
        <path
          className="fill-none stroke-border"
          strokeWidth={LINE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
          d={`M ${TRUNK} 0 V ${rowY(items.length - 1) - r}`}
        />
        {items.map((item, k) => (
          <path
            key={`branch-${item.id}`}
            className="fill-none stroke-border"
            strokeWidth={LINE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
            d={branch(k)}
          />
        ))}
        {items.map((item, k) => (
          <path
            key={`reach-${item.id}`}
            className="fill-none stroke-primary transition-[stroke-dashoffset] duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            strokeWidth={LINE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
            d={reach(k)}
            style={{
              strokeDasharray: length(k),
              strokeDashoffset: activeIndex === k ? 0 : length(k),
            }}
          />
        ))}
      </svg>

      {items.map((item) => {
        const active = isChildActive(item)
        const label = isVietnamese ? item.labelVi : item.labelEn

        return (
          <Link
            key={item.id}
            href={item.path}
            prefetch={true}
            onClick={() => onNavigate(item.id)}
            tabIndex={isExpanded ? 0 : -1}
            className={`group relative box-border flex w-full items-center gap-2 rounded-xl text-xs bg-transparent transition-colors duration-200 cursor-pointer ${
              active
                ? 'text-primary font-bold'
                : 'text-text-secondary hover:text-text-primary font-medium'
            }`}
            style={{
              height: ROW_HEIGHT,
              paddingLeft: INDENT,
              paddingRight: 8,
            }}
          >
            {item.icon && (
              <span
                className={`inline-flex shrink-0 transition-colors ${
                  active ? 'text-primary' : 'text-text-tertiary group-hover:text-text-primary'
                }`}
                aria-hidden="true"
              >
                <Icon name={item.icon} size={15} strokeWidth={1.8} />
              </span>
            )}
            <span className="truncate flex-1" suppressHydrationWarning>
              {label}
            </span>
            {active && (
              <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
            )}
          </Link>
        )
      })}
    </div>
  )
}
