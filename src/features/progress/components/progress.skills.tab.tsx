// Component phân tích kỹ năng TOEIC và tiến độ từ vựng sử dụng TanStack Query tối ưu hiệu năng hỗ trợ đa ngôn ngữ.
"use client";

import { useState } from "react";
import { useLanguage } from "@/hooks/use.language";
import { PronunciationDetailTab } from "@/features/progress/components/pronunciation.detail.tab";
import type { VocabStatsSummary } from "@/features/progress/hooks/use.progress.data";
import type {
  SkillsSummary,
  TimePeriod,
} from "@/features/progress/services/progress.service";
import {
  useWeaknessesQuery,
  usePracticeDashboardQuery,
  useSkillsSummaryQuery,
} from "@/features/progress/hooks/use.progress.query";
import {
  OverviewTab,
  ReadingDetailTab,
  ListeningDetailTab,
  GrammarDetailTab,
  WritingDetailTab,
  SpeakingDetailTab,
  VocabularyDetailTab,
  type SkillTabType,
} from "@/features/progress/components/tabs";

// Re-export helpers for backwards compatibility
export {
  SKILL_VN_MAP,
  TREND_VN_MAP,
  EXERCISE_AND_DIMENSION_MAP,
  formatSkillName,
  formatTrendName,
  formatDimensionName,
} from "@/features/progress/components/progress.helpers";

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
  const { isVietnamese } = useLanguage();
  const isVi = isVietnamese;
  const [activeSkillTab, setActiveSkillTab] =
    useState<SkillTabType>("overview");
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("7d");
  const { data: selectedSummary } = useSkillsSummaryQuery(userId, selectedPeriod, Boolean(userId));
  const currentSummary = selectedSummary ?? (selectedPeriod === '7d' ? skillsSummary : null);
  const { data: allWeaknessesData, isLoading: loadingWeaknesses } = useWeaknessesQuery(
    userId,
    10,
    Boolean(userId)
  );
  const allWeaknesses = allWeaknessesData || [];

  const { data: dashboardDataRes, isLoading: loadingDashboard } = usePracticeDashboardQuery(
    userId,
    selectedPeriod,
    Boolean(userId)
  );
  const dashboardData = dashboardDataRes || null;

  const readingStats = currentSummary?.skills?.reading;
  const listeningStats = currentSummary?.skills?.listening;
  const grammarStats = currentSummary?.skills?.grammar;
  const writingStats = currentSummary?.skills?.writing;
  const speakingStats = currentSummary?.skills?.speaking;
  const rawPronStats = currentSummary?.skills?.pronunciation;
  const pronunciationStats = rawPronStats;

  return (
    <div className="space-y-4">
      {/* Bộ lọc thời gian */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">{isVi ? "Thời gian:" : "Period:"}</span>
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
                ? (isVi ? "7 ngày" : "7 days")
                : period === "30d"
                ? (isVi ? "30 ngày" : "30 days")
                : period === "90d"
                ? (isVi ? "90 ngày" : "90 days")
                : (isVi ? "Tất cả" : "All time")}
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
          {isVi ? "Tổng quan" : "Overview"}
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
          {isVi ? "📖 Đọc hiểu" : "📖 Reading"}
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
          {isVi ? "🎧 Nghe hiểu" : "🎧 Listening"}
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
          {isVi ? "📚 Ngữ pháp" : "📚 Grammar"}
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
          {isVi ? "✍️ Viết" : "✍️ Writing"}
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
          {isVi ? "🎤 Nói" : "🎤 Speaking"}
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
          {isVi ? "📝 Từ vựng" : "📝 Vocabulary"}
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
          {isVi ? "🗣️ Ngữ âm" : "🗣️ Pronunciation"}
        </button>
      </div>

      {/* Nội dung theo Tab đang chọn */}
      {activeSkillTab === "overview" && (
        <OverviewTab
          period={selectedPeriod}
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
          period={selectedPeriod}
          userId={userId}
          dashboardData={dashboardData}
          onNavigate={onNavigate}
        />
      )}

      {activeSkillTab === "grammar" && (
        <GrammarDetailTab
          stats={grammarStats}
          period={selectedPeriod}
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
        <><p className="text-xs text-text-secondary">Trạng thái SRS là số liệu hiện tại; hoạt động và độ chính xác được tính theo ngày lịch Việt Nam trong khoảng đã chọn.</p><VocabularyDetailTab period={selectedPeriod} stats={vocabStats} onNavigate={onNavigate} /></>
      )}

      {activeSkillTab === "pronunciation" && (
        <><p className="text-xs text-text-secondary">Ma trận làm chủ âm vị là tiến độ tích lũy; lượt luyện, lịch sử và hành vi theo khoảng thời gian đã chọn.</p><PronunciationDetailTab userId={userId} period={selectedPeriod} onNavigate={onNavigate} /></>
      )}
    </div>
  );
}

export default ProgressSkillsTab;
