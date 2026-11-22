"use client";

import { VocabularyDashboardView } from "@/features/vocabulary/components/vocabulary.dashboard.view";
import type { VocabStatsSummary } from "@/features/progress/hooks/use.progress.data";

export interface VocabularyDetailTabProps {
  period?: '7d' | '30d' | '90d' | 'all';
  stats: VocabStatsSummary;
  onNavigate: (path: string) => void;
}

export function VocabularyDetailTab({
  period = '7d',
  stats: _stats,
  onNavigate: _onNavigate,
}: VocabularyDetailTabProps) {
  return (
    <div className="space-y-6">
      <VocabularyDashboardView isEmbedded={true} period={period} />
    </div>
  );
}

export default VocabularyDetailTab;

