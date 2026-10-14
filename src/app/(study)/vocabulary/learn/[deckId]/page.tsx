"use client";

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "@/lib/navigation";
import { useApp } from "@/contexts/app.context";
import { useDeckDetailQuery } from "@/features/vocabulary/hooks/use.vocabulary.query";
import type {
  VocabularyDeck,
  LearningResult,
  VocabularyItem,
} from "@/features/vocabulary/types/vocabulary.learn";
import { BookOpen } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { vocabularyKeys } from "@/features/vocabulary/keys/vocabulary.keys";
import { VocabularyLearningSession } from "@/features/vocabulary/components/vocabulary.learning.session";
import { LearningResultView } from "@/features/vocabulary/components/learning.result.view";

export default function VocabularyDeckLearnAppPage() {
  const { i18n } = useTranslation();
  const isVietnamese = i18n.language === "vi";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { deckId } = useParams<{ deckId?: string }>();
  const { showAction } = useApp();
  const [learningResult, setLearningResult] = useState<LearningResult | null>(
    null
  );
  const [isFinished, setIsFinished] = useState(false);

  const isSpecialSession = deckId === "wrong-words" || deckId === "due-srs";
  const isWrongWordsSession = deckId === "wrong-words";
  const isDueSrsSession = deckId === "due-srs";

  const { data: deck, isLoading } = useDeckDetailQuery(
    deckId || "",
    Boolean(deckId && !isSpecialSession)
  );

  const selectedDeck: VocabularyDeck | null = useMemo(() => {
    if (isWrongWordsSession) {
      return {
        id: "wrong-words",
        title: isVietnamese ? "Bộ ôn lại từ sai" : "Wrong Words Review",
        description: isVietnamese
          ? "Củng cố các từ vựng bạn đã từng trả lời sai hoặc gặp lỗi chính tả"
          : "Reinforce words you missed or had spelling mistakes",
        coverColor: "#e17055",
        cardCount: 15,
        creatorType: "SYSTEM",
        visibility: "PUBLIC",
        vocabularyItems: [],
      };
    }

    if (isDueSrsSession) {
      return {
        id: "due-srs",
        title: isVietnamese
          ? "Ôn tập Spaced Repetition (SRS)"
          : "Spaced Repetition Review",
        description: isVietnamese
          ? "Ôn tập các từ vựng đến hạn ghi nhớ hôm nay theo thuật toán ngắt quãng"
          : "Review words due for retention today with spaced repetition algorithm",
        coverColor: "#f39c12",
        cardCount: 15,
        creatorType: "SYSTEM",
        visibility: "PUBLIC",
        vocabularyItems: [],
      };
    }

    if (!deck) return null;
    const cards =
      (deck as unknown as { cards?: Array<Record<string, unknown>> }).cards ||
      [];
    const mappedItems: VocabularyItem[] = cards.map((c, index) => {
      const populated = (c.lexical_item_id as Record<string, unknown>) || {};
      const formatted = (c.lexical_item as Record<string, unknown>) || {};
      const rawMeanings = (populated.m as Array<Record<string, unknown>>) || [];
      const primaryRawMeaning = rawMeanings[0] || {};

      const word = String(
        formatted.word ||
          populated.word ||
          populated.w ||
          c.front_text ||
          "Vocabulary"
      );
      const pronunciation = String(
        formatted.pronunciation_us ||
          populated.pronunciation_us ||
          populated.p ||
          c.user_notes ||
          ""
      );
      const partOfSpeech = String(
        formatted.word_type ||
          populated.word_type ||
          primaryRawMeaning.p ||
          "noun"
      );
      const definitionVi = String(
        formatted.meaning_vi ||
          populated.meaning_vi ||
          primaryRawMeaning.d ||
          c.back_text ||
          ""
      );
      const definitionEn = String(
        formatted.meaning_en || populated.meaning_en || ""
      );
      const audioUrl = (formatted.audio_url_us ||
        populated.audio_url_us ||
        populated.us ||
        c.audio_url) as string | undefined;
      const cefrLevel = String(
        formatted.cefr_level || populated.cefr_level || populated.l || "B1"
      );

      const rawEx =
        (primaryRawMeaning.ex as Array<{ e: string; v: string }>) || [];
      const examples = formatted.example_sentence
        ? [
            {
              id: `ex-${index}`,
              sentence: String(formatted.example_sentence),
              translationVi: String(formatted.example_meaning_vi || ""),
            },
          ]
        : rawEx.length > 0
        ? rawEx.map((ex, exIdx) => ({
            id: `ex-${index}-${exIdx}`,
            sentence: ex.e,
            translationVi: ex.v,
          }))
        : [];

      const primaryExample = examples[0];

      return {
        id: String(c._id || `card-${index}`),
        word,
        pronunciation,
        partOfSpeech,
        meaningVi: definitionVi,
        example: primaryExample?.sentence || "",
        exampleMeaningVi: primaryExample?.translationVi || "",
        meanings: [
          {
            id: `m-${index}`,
            partOfSpeech,
            definitionVi,
            definitionEn,
            examples,
          },
        ],
        audioUrl,
        audioUs: audioUrl,
        cefrLevel,
      };
    });

    const deckTitle =
      isVietnamese && (deck as any).name_vi
        ? (deck as any).name_vi
        : deck.name || "Vocabulary Deck";
    const deckDescription =
      isVietnamese && (deck as any).description_vi
        ? (deck as any).description_vi
        : deck.description || "";

    return {
      id: deck._id || deckId || "",
      title: deckTitle,
      description: deckDescription,
      coverColor: "#6b5ce7",
      cardCount: mappedItems.length || deck.card_count || 10,
      creatorType: "SYSTEM",
      visibility: "PUBLIC",
      vocabularyItems: mappedItems,
    };
  }, [deck, deckId, isVietnamese, isWrongWordsSession, isDueSrsSession]);

  const [sessionKey, setSessionKey] = useState(0);

  const handleSessionComplete = (result: LearningResult) => {
    setLearningResult(result);
    setIsFinished(true);
    queryClient.invalidateQueries({ queryKey: vocabularyKeys.all });
  };

  const handleBackToVocabulary = () => {
    queryClient.invalidateQueries({ queryKey: vocabularyKeys.all });
    navigate("/vocabulary");
  };

  const handleRetrySession = () => {
    setIsFinished(false);
    setLearningResult(null);
    setSessionKey((prev) => prev + 1);
  };

  const handleReviewWeakWords = () => {
    if (isWrongWordsSession) {
      handleRetrySession();
    } else {
      navigate("/vocabulary/learn/wrong-words");
    }
  };

  if (isFinished && learningResult) {
    return (
      <LearningResultView
        result={learningResult}
        onRetry={handleRetrySession}
        onBackToHome={handleBackToVocabulary}
        onAction={showAction}
        onReviewWeakWords={handleReviewWeakWords}
      />
    );
  }

  if (isLoading && !isSpecialSession) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!selectedDeck) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-3">
          <BookOpen size={28} />
        </div>
        <h3 className="text-[17px] font-bold text-text-primary">
          {isVietnamese ? "Không tìm thấy bộ thẻ từ vựng" : "Deck Not Found"}
        </h3>
        <p className="mt-1 text-[13px] text-text-secondary max-w-sm">
          {isVietnamese
            ? "Bộ thẻ này có thể đã bị xóa hoặc đường dẫn không hợp lệ."
            : "This deck might have been deleted or the link is invalid."}
        </p>
        <button
          onClick={handleBackToVocabulary}
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-[13px] font-bold text-white hover:bg-primary-hover transition"
        >
          {isVietnamese ? "Quay lại kho từ vựng" : "Back to Vocabulary"}
        </button>
      </div>
    );
  }

  return (
    <VocabularyLearningSession
      key={sessionKey}
      deck={selectedDeck}
      sourceType={
        isWrongWordsSession
          ? "WRONG_WORDS"
          : isDueSrsSession
          ? "DUE_SRS"
          : "DECK"
      }
      sourceId={isSpecialSession ? undefined : selectedDeck.id}
      sessionMode={isSpecialSession ? "SMART_ADAPTIVE" : "FLASHCARD_ONLY"}
      sessionType={isSpecialSession ? "REVIEW" : "LEARN_NEW"}
      onComplete={handleSessionComplete}
      onExit={handleBackToVocabulary}
      onAction={showAction}
    />
  );
}
