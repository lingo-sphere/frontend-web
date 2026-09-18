// Component giao diện hiển thị danh sách phần thưởng hàng tháng trên bảng xếp hạng.
import { useTranslation } from 'react-i18next'
import { Diamond } from 'lucide-react'
import { useMounted } from '@/hooks/use.mounted'
import type { MonthlyReward } from '@/features/dashboard/types/dashboard'

interface LeaderboardRewardsProps {
  rewards: MonthlyReward[]
}

const rewardColors = [
  { bg: 'bg-gradient-to-br from-warning/20 to-warning/5', border: 'border-warning/30', text: 'text-warning' },
  { bg: 'bg-gradient-to-br from-[#9ca3af]/20 to-[#9ca3af]/5', border: 'border-[#9ca3af]/30', text: 'text-[#9ca3af]' },
  { bg: 'bg-gradient-to-br from-[#cd7f32]/20 to-[#cd7f32]/5', border: 'border-[#cd7f32]/30', text: 'text-[#cd7f32]' },
]

export function LeaderboardRewards({ rewards }: LeaderboardRewardsProps) {
  const { i18n } = useTranslation()
  const mounted = useMounted()
  const isVietnamese = mounted ? i18n.language === 'vi' : true

  return (
    <div className="dashboard-card p-5">
      <h3 className="mb-4 text-[16px] font-bold text-text-primary" suppressHydrationWarning>
        {isVietnamese ? 'Phần thưởng hàng tháng' : 'Monthly Rewards'}
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {rewards.map((reward, idx) => {
          const colors = rewardColors[idx]
          return (
            <div
              key={reward.rank}
              className={`flex flex-col items-center rounded-xl border p-4 text-center ${colors.bg} ${colors.border}`}
            >
              <div className={`mb-2 text-[24px] font-bold ${colors.text}`}>#{reward.rank}</div>
              <div className="mb-2 flex items-center gap-1">
                <Diamond className={`h-5 w-5 ${colors.text}`} />
                <span className={`text-[20px] font-bold ${colors.text}`}>{reward.diamonds}</span>
              </div>
              <p className="text-[11px] text-text-tertiary">{isVietnamese ? 'Kim cương' : 'Diamonds'}</p>
              {reward.specialBadge && (
                <span className="mt-2 rounded-full bg-warning/20 px-2 py-1 text-[10px] font-semibold text-warning">
                  {reward.specialBadge}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
