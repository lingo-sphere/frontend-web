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
  const speakingRadar = dashboardData?.skills?.speaking?.radar_data;
  const speakingBehavior =
    dashboardData?.growth_analytics?.advanced_insights?.behavioral_metrics
      ?.speaking;
  const overallSpeaking = stats?.accuracy
    ? Math.round(stats.accuracy)
    : dashboardData?.skills?.speaking?.avg_overall_score || 0;

  const defaultSpeakingRadar: RadarDataPoint[] = [
    { axis: "Phát âm", value: overallSpeaking, fullMark: 100 },
    {
      axis: "Lưu loát",
      value: overallSpeaking ? Math.max(overallSpeaking - 4, 0) : 0,
      fullMark: 100,
    },
    { axis: "Ngữ pháp", value: overallSpeaking, fullMark: 100 },
    { axis: "Từ vựng", value: overallSpeaking, fullMark: 100 },
    { axis: "Mạch lạc", value: overallSpeaking, fullMark: 100 },
    {
      axis: "Nội dung",
      value: overallSpeaking ? Math.min(overallSpeaking + 2, 100) : 0,
      fullMark: 100,
    },
  ];

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
              {overallSpeaking > 0 ? `${overallSpeaking}/100` : "--"}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-surface-subtle/50 border border-border text-center">
            <span className="text-[10px] text-text-tertiary block">
              Lượt thu âm
            </span>
            <span className="text-lg font-black text-text-primary">
              {stats?.total_attempts ||
                dashboardData?.skills?.speaking?.total_submissions ||
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
              {dashboardData?.skills?.speaking?.estimated_cefr || "B1"}
            </span>
          </div>
        </div>
      </Card>

      {/* BIỂU ĐỒ MẠNG NHỆN: 6 TIÊU CHUẨN KHẢO THÍ NÓI (SPEAKING RADAR) */}
      <Card className="dashboard-card p-5 space-y-4">
        <SkillRadarChart
          data={
            speakingRadar && speakingRadar.length > 0
              ? speakingRadar
              : defaultSpeakingRadar
          }
          title="Đánh giá 6 Tiêu chuẩn Khảo thí Nói (Speaking Rubric)"
          subtitle="Biểu đồ mạng nhện đa giác thể hiện phát âm, lưu loát, ngữ âm và ngữ điệu"
          themeColor="pink"
          overallScore={overallSpeaking}
        />
      </Card>

      {/* CHỈ SỐ HÀNH VI NÓI (BEHAVIORAL METRICS) */}
      <Card className="dashboard-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🎙️</span>
          <h4 className="text-xs font-bold text-text-primary">
            Thời lượng & Nhịp độ Nói (Speaking Activity)
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
              {speakingBehavior?.total_recordings || stats?.total_attempts || 0}{" "}
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

