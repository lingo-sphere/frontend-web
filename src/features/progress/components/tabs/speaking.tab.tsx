"use client";

import { Card } from "@/components/card";
import { Button } from "@/components/button";
import type {
  SkillStats,
  PracticeDashboardData,
} from "@/features/progress/services/progress.service";
import { formatTrendName } from "@/features/progress/components/progress.helpers";

export interface SpeakingDetailTabProps {
  stats?: SkillStats;
  userId?: string;
  dashboardData?: PracticeDashboardData | null;
  onNavigate: (path: string) => void;
}

export function SpeakingDetailTab({
  stats,
  userId: _userId,
  dashboardData,
  onNavigate,
}: SpeakingDetailTabProps) {
  const speakingBehavior =
    dashboardData?.growth_analytics?.advanced_insights?.behavioral_metrics
      ?.speaking;
  const overallSpeaking = Math.round(stats?.accuracy ?? 0);

  return (
    <div className="space-y-4">
      <Card className="dashboard-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎤</span>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Kỹ năng Nói (Speaking Proficiency)
              </h3>
              <p className="text-xs text-text-tertiary">
                Đánh giá phát âm, độ lưu loát và ngữ pháp qua AI Rubric
              </p>
            </div>
          </div>
          <Button
            onClick={() => onNavigate("/speaking")}
            className="text-xs bg-pink-600 hover:bg-pink-700 text-white"
          >
            Vào Luyện Nói
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-surface-subtle/50 border border-border text-center">
            <span className="text-[10px] text-text-tertiary block">
              Điểm trung bình AI
            </span>
            <span className="text-lg font-black text-pink-600">
              {(stats?.graded_attempts ?? 0) > 0 ? `${overallSpeaking}/100` : "--"}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-surface-subtle/50 border border-border text-center">
            <span className="text-[10px] text-text-tertiary block">
              Lượt thu âm
            </span>
            <span className="text-lg font-black text-text-primary">
              {stats?.total_attempts ?? 0}{" "}
              bài
            </span>
          </div>
          <div className="p-3 rounded-xl bg-surface-subtle/50 border border-border text-center">
            <span className="text-[10px] text-text-tertiary block">
              Xu hướng
            </span>
            <span className="text-lg font-black text-emerald-600">
              {formatTrendName(stats?.trend)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-surface-subtle/50 border border-border text-center">
            <span className="text-[10px] text-text-tertiary block">
              Ước tính CEFR
            </span>
            <span className="text-lg font-black text-primary">
              Chưa đủ dữ liệu
            </span>
          </div>
        </div>
      </Card>

      {/* CHỈ SỐ HÀNH VI (TOÀN BỘ LỊCH SỬ) NÓI (BEHAVIORAL METRICS) */}
      <Card className="dashboard-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🎙️</span>
          <h4 className="text-xs font-bold text-text-primary">
            Thời lượng & Nhịp độ Nói · Toàn bộ lịch sử
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-surface-subtle/40 border border-border/50 text-center">
            <span className="text-[11px] text-text-tertiary block font-medium">
              Thời lượng bài nói trung bình
            </span>
            <span className="text-lg font-black text-pink-600">
              {speakingBehavior?.avg_speaking_time_seconds || 0} giây
            </span>
            <span className="text-[10px] text-text-tertiary block">
              Độ dài ghi âm mỗi lượt
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-subtle/40 border border-border/50 text-center">
            <span className="text-[11px] text-text-tertiary block font-medium">
              Tổng lượt thu âm hoàn thành
            </span>
            <span className="text-lg font-black text-text-primary">
              {speakingBehavior?.total_recordings ?? 0}{" "}
              bài
            </span>
            <span className="text-[10px] text-text-tertiary block">
              Dữ liệu luyện phát âm và giao tiếp
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default SpeakingDetailTab;

