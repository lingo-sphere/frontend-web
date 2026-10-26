"use client";

import React from "react";
import { VocabularyDashboardView } from "@/features/vocabulary/components/vocabulary.dashboard.view";
import type { VocabStatsSummary } from "@/features/progress/hooks/use.progress.data";

export interface VocabularyDetailTabProps {
  stats: VocabStatsSummary;
  onNavigate: (path: string) => void;
}

export function VocabularyDetailTab({
  stats: _stats,
  onNavigate: _onNavigate,
}: VocabularyDetailTabProps) {
  return (
    <div className="space-y-6">
      <VocabularyDashboardView isEmbedded={true} />
    </div>
  );
}

export default VocabularyDetailTab;

