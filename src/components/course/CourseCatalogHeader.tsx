'use client'

/**
 * @file CourseCatalogHeader.tsx
 * @description Component giao diện React CourseCatalogHeader cho học viên
 */

import { useTranslation } from 'react-i18next'
import type { CourseTabType } from '@/types/course'

interface CourseCatalogHeaderProps {
  totalCourses: number
  activeTab: CourseTabType
  onTabChange: (tab: CourseTabType) => void
  wishlistCount: number
}

const TABS: { id: CourseTabType; labelVi: string; labelEn: string }[] = [
  { id: 'all', labelVi: 'Tất cả khóa học', labelEn: 'All courses' },
  { id: 'my-courses', labelVi: 'Khóa học của tôi', labelEn: 'My courses' },
  { id: 'wishlist', labelVi: 'Khóa học tôi đã thích', labelEn: 'Liked courses' },
]

export function CourseCatalogHeader({
  totalCourses,
  activeTab,
  onTabChange,
  wishlistCount,
}: CourseCatalogHeaderProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  return (
    <div className="w-full bg-[#1c1d1f] text-white pt-8 pb-0 px-4 sm:px-6 lg:px-8 border-b border-white/10">
      <div className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-serif">
            {isVi ? 'Khóa học của tôi' : 'My learning'}
          </h1>
          <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{totalCourses} {isVi ? 'Khóa học trực tuyến' : 'Online Courses'}</span>
          </div>
        </div>

        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar border-b border-white/10 text-xs font-bold tracking-wide">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`pb-3.5 transition-all whitespace-nowrap relative cursor-pointer ${
                  isActive
                    ? 'text-white border-b-2 border-white font-extrabold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {isVi ? tab.labelVi : tab.labelEn}
                {tab.id === 'wishlist' && wishlistCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.2 text-[10px] text-white">
                    {wishlistCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
