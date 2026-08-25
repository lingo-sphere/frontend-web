
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useApp } from '@/contexts/AppContext'
import { userService } from '@/services/user.service'
import type { LeaderboardEntry } from '@/types/api.types'
import { getCurrentMonth, getLeaderboard, getNextMonth, getPrevMonth, getDaysUntilMonthEnd, getMonthLabel } from '@/data/leaderboard-data'
import type { LeaderboardType } from '@/types/dashboard'
import { LeaderboardCountdown } from './LeaderboardCountdown'
import { LeaderboardTabs } from './LeaderboardTabs'
import { LeaderboardPodium } from './LeaderboardPodium'
import { LeaderboardList } from './LeaderboardList'
import { LeaderboardRewards } from './LeaderboardRewards'

interface LeaderboardPageProps {
  onAction: (message: string) => void
}

export function LeaderboardPage({ onAction: _onAction }: LeaderboardPageProps) {
  useApp() 
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth())
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('streak')
  const [liveEntries, setLiveEntries] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    let isMounted = true
    const fetchLeaderboard = async () => {
      try {
        const data = await userService.getLeaderboard('weekly')
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setLiveEntries(data)
        }
      } catch {
        // Fallback to local leaderboard data
      }
    }
    fetchLeaderboard()
    return () => {
      isMounted = false
    }
  }, [])

  const leaderboard = getLeaderboard(currentMonth)
  const daysLeft = getDaysUntilMonthEnd()
  const isCurrentMonth = currentMonth === getCurrentMonth()

  const handlePrevMonth = () => setCurrentMonth(getPrevMonth(currentMonth))
  const handleNextMonth = () => {
    if (!isCurrentMonth) setCurrentMonth(getNextMonth(currentMonth))
  }

  if (!leaderboard) {
    return (
      <main className="mx-auto w-full max-w-[1280px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <p className="text-text-secondary">{isVietnamese ? 'Không có dữ liệu cho tháng này.' : 'No data for this month.'}</p>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      {/* Header with Countdown */}
      <section className="mb-6">
        <LeaderboardCountdown daysLeft={daysLeft} isCurrentMonth={isCurrentMonth} />
      </section>

      {/* Month Navigation + Tabs */}
      <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            className="h-9 w-9 rounded-xl border-border p-0"
            onClick={handlePrevMonth}
            size="icon"
            variant="outline"
          >
            <ChevronLeft size={18} />
          </Button>
          <h2 className="min-w-[140px] text-center text-[16px] font-bold text-text-primary">
            {getMonthLabel(currentMonth)}
          </h2>
          <Button
            className="h-9 w-9 rounded-xl border-border p-0"
            onClick={handleNextMonth}
            disabled={isCurrentMonth}
            size="icon"
            variant="outline"
          >
            <ChevronRight size={18} />
          </Button>
        </div>
        <LeaderboardTabs active={leaderboardType} onChange={setLeaderboardType} />
      </section>

      {/* Podium Top 3 */}
      <section className="mb-6">
        <LeaderboardPodium users={leaderboard.topThree} type={leaderboardType} />
      </section>

      {/* Full Rankings List */}
      <section className="mb-6">
        <LeaderboardList users={leaderboard.fullRanking} type={leaderboardType} />
      </section>

      {/* Rewards Section */}
      <section>
        <LeaderboardRewards rewards={leaderboard.rewards} />
      </section>
    </main>
  )
}
