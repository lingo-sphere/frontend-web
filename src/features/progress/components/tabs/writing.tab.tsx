"use client";

import React from "react";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import type {
  SkillStats,
  PracticeDashboardData,
} from "@/features/progress/services/progress.service";
import { SkillRadarChart } from "../skill-radar-chart";
import type { RadarDataPoint } from "../skill-radar-chart";
import { formatTrendName } from "../progress.helpers";

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
  const writingRadar = dashboardData?.skills?.writing?.radar_data;
  const writingBehavior =
    dashboardData?.growth_analytics?.advanced_insights?.behavioral_metrics
      ?.writing;
  const overallWriting = stats?.accuracy
    ? Math.round(stats.accuracy)
    : dashboardData?.skills?.writing?.avg_overall_score || 0;

  const defaultWritingRadar: RadarDataPoint[] = [
    {
      axis: "Đáp ứng đề",
      value: overallWriting,
      fullMark: 100,
    },
    { axis: "Mạch lạc", value: overallWriting, fullMark: 100 },
    {
      axis: "Từ vựng",
      value: overallWriting ? Math.min(overallWriting + 5, 100) : 0,
      fullMark: 100,
    },
    {
      axis: "Ngữ pháp",
      value: overallWriting ? Math.max(overallWriting - 5, 0) : 0,
      fullMark: 100,
    },
    { axis: "Cấu trúc câu", value: overallWriting, fullMark: 100 },
    { axis: "Sắc thái học thuật", value: overallWriting, fullMark: 100 },
  ];

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
              {overallWriting > 0 ? `${overallWriting}/100` : "--"}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-surface-subtle/50 border border-border text-center">
            <span className="text-[10px] text-text-tertiary block">
              Bài đã nộp
            </span>
            <span className="text-lg font-black text-text-primary">
              {stats?.total_attempts ||
                dashboardData?.skills?.writing?.total_submissions ||
                0}{" "}
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
              {dashboardData?.skills?.writing?.estimated_cefr || "B1"}
            </span>
          </div>
        </div>
      </Card>

      {/* BIỂU ĐỒ MẠNG NHỆN: 6 TIÊU CHUẨN KHẢO THÍ VIẾT (WRITING RADAR) */}
      <Card className="dashboard-card p-5 space-y-4">
        <SkillRadarChart
          data={
            writingRadar && writingRadar.length > 0
              ? writingRadar
              : defaultWritingRadar
          }
          title="Đánh giá 6 Tiêu chuẩn Khảo thí Viết (Writing Rubric)"
          subtitle="Biểu đồ mạng nhện đa giác thể hiện chi tiết năng lực triển khai bài viết"
          themeColor="violet"
          overallScore={overallWriting}
        />
      </Card>

      {/* CHỈ SỐ HÀNH VI VIẾT (BEHAVIORAL METRICS) */}
      <Card className="dashboard-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-base">⏱️</span>
          <h4 className="text-xs font-bold text-text-primary">
            Chỉ số Hành vi Viết (Writing Behavior)
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
