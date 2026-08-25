
import { useTranslation } from 'react-i18next'
import { Flame, BookOpen, GraduationCap } from 'lucide-react'
import type { LeaderboardType } from '@/types/dashboard'

interface LeaderboardTabsProps {
  active: LeaderboardType
  onChange: (type: LeaderboardType) => void
}

export function LeaderboardTabs({ active, onChange }: LeaderboardTabsProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  return (
    <div className="inline-flex rounded-xl border border-border bg-surface p-1">
      <button
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition-all ${
          active === 'streak'
            ? 'bg-gradient-to-br from-warning/20 to-warning/10 text-warning shadow-sm'
            : 'text-text-secondary hover:text-text-primary'
        }`}
        onClick={() => onChange('streak')}
      >
        <Flame className="h-4 w-4" />
        {isVietnamese ? 'Chuỗi' : 'Streak'}
      </button>
      <button
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition-all ${
          active === 'learning'
            ? 'bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-sm'
            : 'text-text-secondary hover:text-text-primary'
        }`}
        onClick={() => onChange('learning')}
      >
        <BookOpen className="h-4 w-4" />
        {isVietnamese ? 'Học tập' : 'Learning'}
      </button>
      <button
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition-all ${
          active === 'vocabulary'
            ? 'bg-gradient-to-br from-info/20 to-info/10 text-info shadow-sm'
            : 'text-text-secondary hover:text-text-primary'
        }`}
        onClick={() => onChange('vocabulary')}
      >
        <GraduationCap className="h-4 w-4" />
        {isVietnamese ? 'Từ vựng' : 'Vocabulary'}
      </button>
    </div>
  )
}
