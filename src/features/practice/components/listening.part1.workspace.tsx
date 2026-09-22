/**
 * @file listening.part1.workspace.tsx
 * @description Component luyện nghe Part 1 - Picture Description (format thi thực tế TOEIC)
 */

"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/card";
import { Button } from "@/components/button";
import { Icon } from "@/components/icon.map";
import {
  resolveImageUrl,
  resolveAudioUrl,
  resolveMediaUrlAsync,
} from "@/utils/media.utils";
import type { ListeningExercise } from "@/features/practice/types/listening";

interface ListeningPart1WorkspaceProps {
  exercise: ListeningExercise;
  onBack: () => void;
  onComplete: (result: { selectedOption: string; isCorrect: boolean }) => void;
}

export function ListeningPart1Workspace({
  exercise,
  onBack,
  onComplete,
}: ListeningPart1WorkspaceProps) {
  const { i18n } = useTranslation();
  const isVietnamese = i18n.language === "vi";

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Resolve media URLs (ObjectId -> full URL)
  useEffect(() => {
    async function resolveMedia() {
      setIsLoading(true);
      try {
        const [imgId, audId] = await Promise.all([
          resolveMediaUrlAsync(exercise.imageMediaId || exercise.mediaId || ""),
          resolveMediaUrlAsync(
            exercise.audioMediaId || exercise.mediaUrl || ""
          ),
        ]);

        setImageUrl(
          imgId || resolveImageUrl(exercise.imageMediaId || exercise.mediaId)
        );
        setAudioUrl(
          audId || resolveAudioUrl(exercise.audioMediaId || exercise.mediaUrl)
        );
      } catch (error) {
        console.error("[ListeningPart1] Error resolving media:", error);
        setImageUrl(resolveImageUrl(exercise.imageMediaId || exercise.mediaId));
        setAudioUrl(
          resolveAudioUrl(exercise.audioMediaId || exercise.mediaUrl)
        );
      } finally {
        setIsLoading(false);
      }
    }

    resolveMedia();
  }, [
    exercise.imageMediaId,
    exercise.audioMediaId,
    exercise.mediaId,
    exercise.mediaUrl,
  ]);

  // Get options from questionData
  const options = exercise.questionData?.options || [];

  // Find correct answer
  const correctOption = options.find((opt) => opt.is_correct);

  // Build options map for display
  const optionsMap = new Map(options.map(opt => [opt.key, opt]));

  const handleOptionClick = (key: string) => {
    if (hasAnswered) return;
    setSelectedOption(key);
  };

  const handleSubmit = () => {
    if (!selectedOption || !correctOption) return;

    setHasAnswered(true);
    const isCorrect = selectedOption === correctOption.key;

    onComplete({
      selectedOption,
      isCorrect,
    });
  };

  const handlePlayAudio = () => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    audio.play();
  };

  const getOptionStyle = (key: string) => {
    if (!hasAnswered) {
      return selectedOption === key
        ? "border-primary bg-primary-soft"
        : "border-border hover:border-primary hover:bg-surface-subtle";
    }

    // After answered
    if (key === correctOption?.key) {
      return "border-green bg-green-soft";
    }
    if (key === selectedOption && key !== correctOption?.key) {
      return "border-red bg-red-soft";
    }
    return "border-border opacity-50";
  };

  const getOptionLabel = (key: string) => {
    const opt = optionsMap.get(key);
    return opt ? `${key}. ${opt.text}` : key;
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <Icon name="arrow-left" size={18} />
          <span className="ml-2">{isVietnamese ? "Quay lại" : "Back"}</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Title */}
          <h1 className="mb-4 text-xl font-bold text-text-primary text-center">
            {isVietnamese ? exercise.titleVi : exercise.title}
          </h1>

          {/* Image */}
          <div className="mb-6 flex justify-center">
            {isLoading ? (
              <div className="flex h-64 w-full items-center justify-center rounded-lg bg-surface-subtle">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : imageUrl ? (
              <img
                src={imageUrl}
                alt="Question"
                className="max-h-72 rounded-lg object-contain"
              />
            ) : (
              <div className="flex h-64 w-full items-center justify-center rounded-lg bg-surface-subtle text-text-tertiary">
                <Icon name="image" size={48} />
              </div>
            )}
          </div>

          {/* Audio Player */}
          <div className="mb-8 flex items-center justify-center gap-4">
            <Button
              variant="default"
              onClick={isPlaying ? () => {} : handlePlayAudio}
              className="px-8 py-6 text-lg"
            >
              <Icon name={isPlaying ? "volume-2" : "headphones"} size={24} />
              <span className="ml-2">
                {isPlaying
                  ? isVietnamese
                    ? "Đang nghe..."
                    : "Playing..."
                  : isVietnamese
                  ? "Nghe câu hỏi"
                  : "Listen to the question"}
              </span>
            </Button>
          </div>

          {/* Options - Chỉ hiển thị A, B, C, D */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            {["A", "B", "C", "D"].map((key) => (
              <button
                key={key}
                onClick={() => handleOptionClick(key)}
                disabled={hasAnswered}
                className={`h-16 rounded-xl border-2 text-xl font-bold transition-all ${getOptionStyle(
                  key
                )}`}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Submit Button */}
          {!hasAnswered && (
            <div className="flex justify-center">
              <Button
                variant="default"
                onClick={handleSubmit}
                disabled={!selectedOption}
                className="px-12"
              >
                {isVietnamese ? "Nộp bài" : "Submit"}
              </Button>
            </div>
          )}

          {/* Results after answering */}
          {hasAnswered && (
            <div className="mt-6 space-y-4">
              {/* Result */}
              <div
                className={`rounded-lg p-4 text-center ${
                  selectedOption === correctOption?.key
                    ? "bg-green-soft text-green"
                    : "bg-red-soft text-red"
                }`}
              >
                <p className="text-xl font-bold">
                  {selectedOption === correctOption?.key
                    ? isVietnamese
                      ? "✅ Chính xác!"
                      : "✅ Correct!"
                    : isVietnamese
                    ? "❌ Chưa đúng"
                    : "❌ Incorrect"}
                </p>
                <p className="mt-2 text-lg">
                  {isVietnamese ? "Đáp án đúng:" : "Correct answer:"}{" "}
                  <span className="font-bold">{correctOption?.key}</span>
                </p>
              </div>

              {/* Show correct answer text */}
              {correctOption && (
                <div className="rounded-lg bg-surface-subtle p-4">
                  <h4 className="mb-2 font-semibold text-text-primary">
                    {isVietnamese ? "Đáp án:" : "Answer:"}{" "}
                    <span className="font-bold">
                      {correctOption.key}. {correctOption.text}
                    </span>
                  </h4>
                  {exercise.questionData?.explanation && (
                    <>
                      <h4 className="mb-2 font-semibold text-text-primary">
                        {isVietnamese ? "Giải thích:" : "Explanation:"}
                      </h4>
                      <p className="text-text-secondary">
                        {isVietnamese && exercise.questionData.explanation_vi
                          ? exercise.questionData.explanation_vi
                          : exercise.questionData.explanation}
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Back button */}
              <div className="flex justify-center">
                <Button variant="default" onClick={onBack}>
                  {isVietnamese ? "Tiếp tục" : "Continue"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
