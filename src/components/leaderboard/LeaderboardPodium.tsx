// Updated: 2026-08-22
// Podium component hiển thị top 3:
// - 3 cards cùng kích thước (min-h-[180px])
// - Gold/Silver/Bronze colors với vương miện tương ứng
// - Responsive layout

import { useTranslation } from 'react-i18next'
import { Crown } from "lucide-react";
import type {
  LeaderboardType,
  MonthlyLeaderboardUser,
} from "@/types/dashboard";

interface LeaderboardPodiumProps {
  users: MonthlyLeaderboardUser[];
  type: LeaderboardType;
}

const podiumConfig = [
  {
    rank: 2,
    order: 1,
    height: "h-[180px]",
    medal: "#9ca3af",
    medalSoft: "#f3f4f6",
    label: "2nd",
  },
  {
    rank: 1,
    order: 0,
    height: "h-[220px]",
    medal: "#d9a441",
    medalSoft: "#fef3c7",
    label: "1st",
  },
  {
    rank: 3,
    order: 2,
    height: "h-[140px]",
    medal: "#cd7f32",
    medalSoft: "#fdf2e9",
    label: "3rd",
  },
];

export function LeaderboardPodium({ users, type }: LeaderboardPodiumProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  // Reorder users to match podium layout: 2nd, 1st, 3rd
  const sortedUsers = podiumConfig.map(
    (p) => users.find((u) => u.rank === p.rank)!
  );

  // Translation helpers
  const getStatLabel = () => {
    if (type === "streak") return isVietnamese ? 'Ngày' : 'days'
    if (type === "learning") return isVietnamese ? 'Phút' : 'min'
    return ''
  }

  const getTypeLabel = () => {
    if (type === "streak") return isVietnamese ? 'Chuỗi' : 'Streak'
    if (type === "learning") return isVietnamese ? 'Học tập' : 'Learning'
    return isVietnamese ? 'Từ vựng' : 'Words'
  }

  const getRankLabel = (rank: number) => {
    if (isVietnamese) {
      if (rank === 1) return 'Nhất'
      if (rank === 2) return 'Nhì'
      if (rank === 3) return 'Ba'
    }
    return rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd'
  }

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-6">
      {sortedUsers.map((user, idx) => {
        const config = podiumConfig[idx];
        const isFirst = config.rank === 1;

        return (
          <div key={user.rank} className="flex flex-col items-center">
            {/* User info card */}
            <div
              className={`flex w-full min-h-[180px] flex-col items-center rounded-2xl border p-4 transition-transform ${
                isFirst
                  ? "border-warning/50 bg-gradient-to-b from-warning-soft to-surface shadow-lg"
                  : "border-border bg-surface"
              }`}
            >
              {/* Crown for top 3 */}
              {config.rank === 1 && (
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-warning to-warning/70 shadow-md">
                  <Crown className="h-4 w-4 text-white" />
                </div>
              )}
              {config.rank === 2 && (
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#9ca3af] to-[#6b7280] shadow-md">
                  <Crown className="h-4 w-4 text-white" />
                </div>
              )}
              {config.rank === 3 && (
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#cd7f32] to-[#8b5a2b] shadow-md">
                  <Crown className="h-4 w-4 text-white" />
                </div>
              )}

              {/* Avatar */}
              <div
                className="mb-2 flex h-12 w-12 items-center justify-center rounded-full text-[18px] font-bold text-white shadow-md"
                style={{ backgroundColor: user.avatarColor }}
              >
                {user.name.charAt(0)}
              </div>

              {/* Name */}
              <p className="mb-1 text-[13px] font-semibold text-text-primary text-center line-clamp-1">
                {user.name}
              </p>

              {/* Stats */}
              <p
                className="text-[15px] font-bold"
                style={{ color: config.medal }}
              >
                {type === "streak"
                  ? `${user.streakDays} ${isVietnamese ? 'ngày' : 'days'}`
                  : type === "learning"
                  ? `${user.totalMinutes} ${isVietnamese ? 'phút' : 'min'}`
                  : `${user.wordsLearned}`}
              </p>
              <p className="text-[11px] text-text-tertiary">
                {getTypeLabel()}
              </p>
            </div>

            {/* Podium base */}
            <div
              className="mt-2 w-full rounded-t-lg text-center"
              style={{
                backgroundColor: config.medalSoft,
                borderTop: `3px solid ${config.medal}`,
              }}
            >
              <p
                className="py-2 text-[12px] font-semibold"
                style={{ color: config.medal }}
              >
                {getRankLabel(config.rank)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
