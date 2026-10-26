// Component hiển thị phân tích kỹ năng TOEIC và tiến độ từ vựng
// Refactored: Các tab chi tiết đã được tách thành các module riêng biệt trong thư mục ./tabs

"use client";

import { useState, useEffect } from "react";
import { PronunciationDetailTab } from "./pronunciation.detail.tab";
import type { VocabStatsSummary } from "@/features/progress/hooks/use.progress.data";
import type {
  SkillsSummary,
  WeaknessAnalysis,
  TimePeriod,
  PracticeDashboardData,
} from "@/features/progress/services/progress.service";
import { progressService } from "@/features/progress/services/progress.service";
import {
  OverviewTab,
  ReadingDetailTab,
  ListeningDetailTab,
  GrammarDetailTab,
  WritingDetailTab,
  SpeakingDetailTab,
  VocabularyDetailTab,
  type SkillTabType,
} from "./tabs";

// Re-export helpers for backwards compatibility
export {
  SKILL_VN_MAP,
  TREND_VN_MAP,
  EXERCISE_AND_DIMENSION_MAP,
  formatSkillName,
  formatTrendName,
  formatDimensionName,
} from "./progress.helpers";

export type { SkillTabType };

export interface ProgressSkillsTabProps {
  listeningScore: number;
  readingScore: number;
  speakingScore?: number;
  writingScore?: number;
  selectedSkillsType?: string;
  vocabStats: VocabStatsSummary;
  skillsSummary?: SkillsSummary | null;
  onNavigate: (path: string) => void;
  userId?: string;
}

export function ProgressSkillsTab({
  listeningScore,
  readingScore,
  vocabStats,
  skillsSummary,
  onNavigate,
  userId,
}: ProgressSkillsTabProps) {
  const [activeSkillTab, setActiveSkillTab] =
    useState<SkillTabType>("overview");
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("7d");
  const [allWeaknesses, setAllWeaknesses] = useState<WeaknessAnalysis[]>([]);
  const [loadingWeaknesses, setLoadingWeaknesses] = useState(false);
  const [dashboardData, setDashboardData] =
    useState<PracticeDashboardData | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // Tự động tải điểm yếu ngay khi có userId
  useEffect(() => {
    if (userId) {
      setLoadingWeaknesses(true);
      progressService
        .getAllWeaknesses(userId, 10)
        .then((data: WeaknessAnalysis[]) => {
          setAllWeaknesses(data || []);
          setLoadingWeaknesses(false);
        })
        .catch(() => {
          setAllWeaknesses([]);
          setLoadingWeaknesses(false);
        });
    }
  }, [userId]);

  // Tự động tải dashboard analytics theo mốc thời gian người dùng chọn
  useEffect(() => {
    if (userId) {
      setLoadingDashboard(true);
      progressService
        .getPracticeDashboard(userId, selectedPeriod)
        .then((data: PracticeDashboardData | null) => {
          setDashboardData(data);
          setLoadingDashboard(false);
        })
        .catch(() => {
          setLoadingDashboard(false);
        });
    }
  }, [userId, selectedPeriod]);

  // Lấy dữ liệu 5 kỹ năng từ skillsSummary
  const readingStats = skillsSummary?.skills?.reading;
  const listeningStats = skillsSummary?.skills?.listening;
  const grammarStats = skillsSummary?.skills?.grammar;
  const writingStats = skillsSummary?.skills?.writing;
  const speakingStats = skillsSummary?.skills?.speaking;
  const rawPronStats =
    skillsSummary?.skills?.pronunciation ||
    (dashboardData?.skills as any)?.pronunciation;
  const pronunciationStats = rawPronStats
    ? {
        ...rawPronStats,
        accuracy:
          rawPronStats.accuracy !== undefined
            ? rawPronStats.accuracy
            : rawPronStats.accuracy_rate ?? 0,
        total_attempts: rawPronStats.total_attempts || 0,
      }
    : undefined;

  return (
    <div className="space-y-4">
      {/* Bộ lọc thời gian */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">Thời gian:</span>
          {(["7d", "30d", "90d", "all"] as TimePeriod[]).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 text-xs rounded-lg transition-colors cursor-pointer ${
                selectedPeriod === period
                  ? "bg-primary text-white font-bold"
                  : "bg-surface-subtle text-text-secondary hover:text-text-primary"
              }`}
            >
              {period === "7d"
                ? "7 ngày"
                : period === "30d"
                ? "30 ngày"
                : period === "90d"
                ? "90 ngày"
                : "Tất cả"}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách Tab Kỹ năng */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveSkillTab("overview")}
          className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeSkillTab === "overview"
              ? "bg-primary text-white shadow-xs"
              : "bg-surface-subtle text-text-secondary hover:text-text-primary"
          }`}
        >
          Tổng quan
        </button>
        <button
          type="button"
          onClick={() => setActiveSkillTab("reading")}
          className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeSkillTab === "reading"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-surface-subtle text-text-secondary hover:text-text-primary"
          }`}
        >
          📖 Đọc hiểu
        </button>
        <button
          type="button"
          onClick={() => setActiveSkillTab("listening")}
          className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeSkillTab === "listening"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-surface-subtle text-text-secondary hover:text-text-primary"
          }`}
        >
          🎧 Nghe hiểu
        </button>
        <button
          type="button"
          onClick={() => setActiveSkillTab("grammar")}
          className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeSkillTab === "grammar"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-surface-subtle text-text-secondary hover:text-text-primary"
          }`}
        >
          📚 Ngữ pháp
        </button>
        <button
          type="button"
          onClick={() => setActiveSkillTab("writing")}
          className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeSkillTab === "writing"
              ? "bg-violet-600 text-white shadow-xs"
              : "bg-surface-subtle text-text-secondary hover:text-text-primary"
          }`}
        >
          ✍️ Viết
        </button>
        <button
          type="button"
          onClick={() => setActiveSkillTab("speaking")}
          className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeSkillTab === "speaking"
              ? "bg-pink-600 text-white shadow-xs"
              : "bg-surface-subtle text-text-secondary hover:text-text-primary"
          }`}
        >
          🎤 Nói
        </button>
        <button
          type="button"
          onClick={() => setActiveSkillTab("vocabulary")}
          className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeSkillTab === "vocabulary"
              ? "bg-rose-600 text-white shadow-xs"
              : "bg-surface-subtle text-text-secondary hover:text-text-primary"
          }`}
        >
          📝 Từ vựng
        </button>
        <button
          type="button"
          onClick={() => setActiveSkillTab("pronunciation")}
          className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeSkillTab === "pronunciation"
              ? "bg-teal-600 text-white shadow-xs"
              : "bg-surface-subtle text-text-secondary hover:text-text-primary"
          }`}
        >
          🗣️ Ngữ âm
        </button>
      </div>

      {/* Nội dung theo Tab đang chọn */}
      {activeSkillTab === "overview" && (
        <OverviewTab
          readingStats={readingStats}
          listeningStats={listeningStats}
          grammarStats={grammarStats}
          writingStats={writingStats}
          speakingStats={speakingStats}
          pronunciationStats={pronunciationStats}
          vocabStats={vocabStats}
          listeningScore={listeningScore}
          readingScore={readingScore}
          weaknesses={allWeaknesses}
          loadingWeaknesses={loadingWeaknesses}
          dashboardData={dashboardData}
          loadingDashboard={loadingDashboard}
          onNavigate={onNavigate}
          onSelectSkillTab={(tab) => setActiveSkillTab(tab)}
        />
      )}

      {activeSkillTab === "reading" && (
        <ReadingDetailTab
          stats={readingStats}
          userId={userId}
          dashboardData={dashboardData}
          onNavigate={onNavigate}
        />
      )}

      {activeSkillTab === "listening" && (
        <ListeningDetailTab
          stats={listeningStats}
          userId={userId}
          dashboardData={dashboardData}
          onNavigate={onNavigate}
        />
      )}

      {activeSkillTab === "grammar" && (
        <GrammarDetailTab
          stats={grammarStats}
          userId={userId}
          dashboardData={dashboardData}
          onNavigate={onNavigate}
        />
      )}

      {activeSkillTab === "writing" && (
        <WritingDetailTab
          stats={writingStats}
          userId={userId}
          dashboardData={dashboardData}
          onNavigate={onNavigate}
        />
      )}

      {activeSkillTab === "speaking" && (
        <SpeakingDetailTab
          stats={speakingStats}
          userId={userId}
          dashboardData={dashboardData}
          onNavigate={onNavigate}
        />
      )}

      {activeSkillTab === "vocabulary" && (
        <VocabularyDetailTab stats={vocabStats} onNavigate={onNavigate} />
      )}

      {activeSkillTab === "pronunciation" && (
        <PronunciationDetailTab userId={userId} onNavigate={onNavigate} />
      )}
    </div>
  );
}

export default ProgressSkillsTab;
