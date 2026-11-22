"use client";

import { Card } from "@/components/card";
import { Button } from "@/components/button";
import type {
  SkillStats,
  PracticeDashboardData,
} from "@/features/progress/services/progress.service";
import { formatTrendName } from "@/features/progress/components/progress.helpers";

export interface WritingDetailTabProps {
  stats?: SkillStats;
  userId?: string;
  dashboardData?: PracticeDashboardData | null;
  onNavigate: (path: string) => void;
}

export function WritingDetailTab({
  stats,
  userId: _userId,
  dashboardData,
  onNavigate,
}: WritingDetailTabProps) {
  const writingBehavior =
    dashboardData?.growth_analytics?.advanced_insights?.behavioral_metrics
      ?.writing;
  const overallWriting = Math.round(stats?.accuracy ?? 0);

  return (
    <div className="space-y-4">
      <Card className="dashboard-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">✍️</span>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Kỹ năng Viết (Writing Proficiency)
              </h3>
              <p className="text-xs text-text-tertiary">
                Đánh giá theo 6 tiêu chuẩn chấm điểm AI Rubric & CEFR
              </p>
            </div>
          </div>
          <Button
            onClick={() => onNavigate("/practice/writing")}
            className="text-xs bg-purple-600 hover:bg-purple-700 text-white"
          >
            Vào Luyện Viết
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-surface-subtle/50 border border-border text-center">
            <span className="text-[10px] text-text-tertiary block">
              Điểm trung bình AI
            </span>
            <span className="text-lg font-black text-purple-600">
              {(stats?.graded_attempts ?? 0) > 0 ? `${overallWriting}/100` : "--"}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-surface-subtle/50 border border-border text-center">
            <span className="text-[10px] text-text-tertiary block">
              Bài đã nộp
            </span>
            <span className="text-lg font-black text-text-primary">
              {stats?.total_attempts ?? 0}{" "}
              bài
            </span>
            <span className="text-[10px] text-text-tertiary block">{stats?.graded_attempts ?? 0} bài có điểm</span>
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

      {/* CHỈ SỐ HÀNH VI (TOÀN BỘ LỊCH SỬ) VIẾT (BEHAVIORAL METRICS) */}
      <Card className="dashboard-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-base">⏱️</span>
          <h4 className="text-xs font-bold text-text-primary">
            Chỉ số Hành vi Viết · Toàn bộ lịch sử
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-surface-subtle/40 border border-border/50 text-center">
            <span className="text-[11px] text-text-tertiary block font-medium">
              Số từ trung bình / bài
            </span>
            <span className="text-lg font-black text-purple-600">
              {writingBehavior?.avg_word_count || 0} từ
            </span>
            <span className="text-[10px] text-text-tertiary block">
              Độ dài bài viết
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-subtle/40 border border-border/50 text-center">
            <span className="text-[11px] text-text-tertiary block font-medium">
              Thời gian viết trung bình
            </span>
            <span className="text-lg font-black text-primary">
              {writingBehavior?.avg_writing_time_minutes ||
                Math.round(
                  ((writingBehavior as any)?.avg_time_spent_seconds || 0) / 60
                )}{" "}
              phút
            </span>
            <span className="text-[10px] text-text-tertiary block">
              Tốc độ hoàn thành
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-subtle/40 border border-border/50 text-center">
            <span className="text-[11px] text-text-tertiary block font-medium">
              Tốc độ gõ phím
            </span>
            <span className="text-lg font-black text-emerald-600">
              {writingBehavior?.words_per_minute || 0} WPM
            </span>
            <span className="text-[10px] text-text-tertiary block">
              Từ trên phút (Words per minute)
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default WritingDetailTab;
