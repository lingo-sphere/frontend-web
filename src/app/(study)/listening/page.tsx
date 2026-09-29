// Trang luyện nghe theo chủ đề với Session Practice
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { SectionHeading } from "@/features/dashboard/components/section.heading";
import { ListeningContextNavigation } from "@/features/practice/components/listening.context.navigation";
import { ListeningSessionWorkspace } from "@/features/practice/components/listening.session.workspace";
import type { ListeningExercise } from "@/features/practice/types/listening";

type ViewMode = "list" | "session";

export default function ListeningAppPage() {
  const { t, i18n } = useTranslation();
  const searchParams = useSearchParams();
  const contextIdParam = searchParams.get("context_id");
  const topicNameParam = searchParams.get("topic_name");

  const isVietnamese = i18n.language === "vi";
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedContextId, setSelectedContextId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (contextIdParam || topicNameParam) {
      if (contextIdParam) {
        setSelectedContextId(contextIdParam);
      }
      setViewMode("session");
    }
  }, [contextIdParam, topicNameParam]);

  const handleSelectContext = (contextId: string) => {
    setSelectedContextId(contextId);
    setViewMode("session");
  };

  // Luyện tập theo chủ đề đang chọn
  const handlePracticeByContext = (contextId: string) => {
    setSelectedContextId(contextId);
    setViewMode("session");
  };

  // Luyện tập random - không theo context cụ thể
  const handlePracticeRandom = () => {
    setSelectedContextId(undefined); // undefined = random
    setViewMode("session");
  };

  const handleSelectExercise = (_exercise: ListeningExercise) => {
    // (deprecated flow) - giữ để không lỗi type, sẽ dùng session sau
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedContextId(undefined);
  };

  const handleComplete = (result: any) => {
    console.log("Session completed:", result);
  };

  // Session workspace view
  if (viewMode === "session") {
    return (
      <ListeningSessionWorkspace
        contextId={selectedContextId}
        topicName={topicNameParam || undefined}
        onBack={handleBackToList}
        onComplete={handleComplete}
      />
    );
  }

  // List view
  return (
    <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <SectionHeading
        eyebrow={t("practice.listeningPractice")}
        title={
          isVietnamese
            ? "Luyện nghe theo chủ đề"
            : "Context-Based Listening Practice"
        }
        description={
          isVietnamese
            ? "Chọn chủ đề và luyện nghe theo ngữ cảnh thực tế"
            : "Choose a topic and practice listening in real-world contexts"
        }
      />

      <section className="mt-6">
        <ListeningContextNavigation
          isVietnamese={isVietnamese}
          onSelectContext={handlePracticeByContext}
          onSelectRandom={handlePracticeRandom}
        />
      </section>
    </main>
  );
}
