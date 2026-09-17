/**
 * @file vocabulary-detail.modal.tsx
 * @description Modal chi tiết từ vựng - có bookmark riêng cho từng meaning
 */

"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import {
  X,
  Volume2,
  Volume1,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Star,
  Loader2,
  LogIn,
} from "lucide-react";
import { vocabularyService } from "@/features/vocabulary/services/vocabulary.service";
import { playAudio } from "@/utils/media.utils";
import { API_CONFIG } from "@/config/api.config";
import { api } from "@/services/api.client";
import { useAuthStore } from "@/features/auth/store/auth.store";

interface Meaning {
  meaning_order: number;
  part_of_speech: string;
  definition_vi: string;
  definition_en?: string;
  short_meaning_vi?: string;
  synonyms?: string[];
  antonyms?: string[];
  is_primary?: boolean;
  cefr_level?: string;
  domain?: string;
  examples?: Array<{
    sentence_en: string;
    sentence_vi: string;
  }>;
}

interface VocabularyDetail {
  id: string;
  _id: string;
  word: string;
  word_lowercase?: string;
  slug?: string;
  lexical_type?: string;
  pronunciation?: string;
  cefr_level?: string;
  is_root_word?: boolean;
  is_verified?: boolean;
  is_active?: boolean;
  source?: string;
  audio_url_us?: string;
  audio_url_uk?: string;
  meanings: Meaning[];
  meanings_count?: number;
  examples_count?: number;
  created_at?: string;
  updated_at?: string;
}

interface VocabularyDetailModalProps {
  wordId: string;
  word: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (message: string) => void;
}

export function VocabularyDetailModal({
  wordId,
  word,
  open,
  onOpenChange,
  onAction,
}: VocabularyDetailModalProps) {
  const { i18n } = useTranslation();
  const isVietnamese = i18n.language === "vi";

  // Auth state
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.user?.user_id);

  const [vocabulary, setVocabulary] = useState<VocabularyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState<"us" | "uk" | null>(null);

  // Saved meanings state
  const [savedMeaningIndices, setSavedMeaningIndices] = useState<Set<number>>(
    new Set()
  );
  const [savingMeaningIndex, setSavingMeaningIndex] = useState<number | null>(
    null
  );

  // Fetch vocabulary detail by ID
  useEffect(() => {
    if (!open || !wordId) return;

    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        const data = await api.get<VocabularyDetail>(
          API_CONFIG.ENDPOINTS.VOCABULARY.ITEM_BY_ID(wordId)
        );
        setVocabulary(data);

        // Fetch saved meaning indices - chỉ khi đã login
        if (isAuthenticated && userId) {
          try {
            const indices = await vocabularyService.getSavedMeaningIndices(
              userId,
              data._id || data.id
            );
            setSavedMeaningIndices(new Set(indices));
          } catch (err) {
            console.error("Failed to fetch saved indices:", err);
            setSavedMeaningIndices(new Set());
          }
        } else {
          setSavedMeaningIndices(new Set());
        }
      } catch (err) {
        console.error("Failed to fetch vocabulary detail:", err);
        setVocabulary(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [open, wordId, isAuthenticated, userId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSavedMeaningIndices(new Set());
      setSavingMeaningIndex(null);
    }
  }, [open]);

  // Play audio
  const handlePlayAudio = (type: "us" | "uk") => {
    setIsPlaying(type);
    const audioUrl =
      type === "us" ? vocabulary?.audio_url_us : vocabulary?.audio_url_uk;
    if (audioUrl) {
      playAudio(audioUrl);
    }
    setTimeout(() => setIsPlaying(null), 1000);
    onAction(`${isVietnamese ? "Phát âm" : "Playing"}: ${vocabulary?.word}`);
  };

  // Handle save/unsave meaning
  const handleToggleSaveMeaning = async (meaningIndex: number) => {
    if (!vocabulary) return;
    if (!userId) {
      onAction(isVietnamese ? "Cần đăng nhập để lưu từ" : "Please login to save words");
      return;
    }

    const lexicalItemId = vocabulary._id || vocabulary.id;
    console.log('[VocabularyDetail] Save request:', {
      userId,
      lexicalItemId,
      vocabularyId: vocabulary._id,
      vocabularyIdAlt: vocabulary.id,
      word: vocabulary.word,
      meaningIndex
    });

    const isSaved = savedMeaningIndices.has(meaningIndex);

    try {
      setSavingMeaningIndex(meaningIndex);

      if (isSaved) {
        // Unsave
        await vocabularyService.unsaveVocabulary(userId, lexicalItemId, meaningIndex);
        setSavedMeaningIndices((prev) => {
          const next = new Set(prev);
          next.delete(meaningIndex);
          return next;
        });
        onAction(
          isVietnamese
            ? `Đã bỏ lưu nghĩa #${meaningIndex + 1} của "${vocabulary.word}"`
            : `Unsaved meaning #${meaningIndex + 1} of "${vocabulary.word}"`
        );
      } else {
        // Save
        await vocabularyService.saveVocabulary(userId, lexicalItemId, meaningIndex);
        setSavedMeaningIndices((prev) => new Set([...prev, meaningIndex]));
        onAction(
          isVietnamese
            ? `Đã lưu nghĩa #${meaningIndex + 1} của "${vocabulary.word}"`
            : `Saved meaning #${meaningIndex + 1} of "${vocabulary.word}"`
        );
      }
    } catch (err) {
      console.error("Failed to toggle save:", err);
      onAction(
        isVietnamese ? "Không thể lưu/bỏ lưu từ này" : "Failed to save/unsave"
      );
    } finally {
      setSavingMeaningIndex(null);
    }
  };

  // Body scroll lock
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="text-primary" size={20} />
            <h2 className="text-lg font-semibold text-text-primary">
              {isVietnamese ? "Chi tiết từ vựng" : "Vocabulary Detail"}
            </h2>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-80px)] overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : vocabulary ? (
            <div className="space-y-5">
              {/* Word Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-text-primary">
                    {vocabulary.word}
                  </h1>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {vocabulary.cefr_level && (
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
                        {vocabulary.cefr_level}
                      </span>
                    )}
                    {vocabulary.lexical_type && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {vocabulary.lexical_type}
                      </span>
                    )}
                  </div>
                </div>

                {/* Audio Buttons */}
                <div className="flex gap-2">
                  {vocabulary.audio_url_us && (
                    <button
                      onClick={() => handlePlayAudio("us")}
                      className={`flex h-11 w-11 items-center justify-center rounded-full transition-all ${
                        isPlaying === "us"
                          ? "bg-primary text-white scale-95"
                          : "bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105"
                      }`}
                      title={
                        isVietnamese ? "Phát âm US" : "Play US Pronunciation"
                      }
                    >
                      <Volume1 size={20} />
                    </button>
                  )}
                  {vocabulary.audio_url_uk && (
                    <button
                      onClick={() => handlePlayAudio("uk")}
                      className={`flex h-11 w-11 items-center justify-center rounded-full transition-all ${
                        isPlaying === "uk"
                          ? "bg-emerald-500 text-white scale-95"
                          : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 hover:scale-105"
                      }`}
                      title={
                        isVietnamese ? "Phát âm UK" : "Play UK Pronunciation"
                      }
                    >
                      <Volume2 size={20} />
                    </button>
                  )}
                </div>
              </div>

              {/* IPA Pronunciation */}
              {vocabulary.pronunciation && (
                <div className="rounded-xl bg-surface-hover px-4 py-3">
                  <span className="font-mono text-xl text-primary">
                    /{vocabulary.pronunciation}/
                  </span>
                </div>
              )}

              {/* Meanings */}
              {vocabulary.meanings && vocabulary.meanings.length > 0 && (
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-tertiary">
                    <BookOpen size={16} />
                    {isVietnamese ? "Nghĩa" : "Meanings"}
                  </h3>

                  {vocabulary.meanings.map((meaning, idx) => {
                    const isSaved = savedMeaningIndices.has(idx);
                    const isSaving = savingMeaningIndex === idx;

                    return (
                      <div
                        key={idx}
                        className={`rounded-xl border p-4 ${
                          meaning.is_primary
                            ? "border-primary/30 bg-primary/5"
                            : "border-border"
                        }`}
                      >
                        {/* Header: POS & Level & Bookmark */}
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              {meaning.part_of_speech}
                            </span>
                            {meaning.cefr_level && (
                              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                {meaning.cefr_level}
                              </span>
                            )}
                            {meaning.is_primary && (
                              <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                <Star size={10} />
                                {isVietnamese ? "Nghĩa chính" : "Primary"}
                              </span>
                            )}
                          </div>

                          {/* Bookmark Button - chỉ hiện khi đã login */}
                          {isAuthenticated ? (
                            <button
                              onClick={() => handleToggleSaveMeaning(idx)}
                              disabled={isSaving}
                              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                                isSaved
                                  ? "bg-primary text-white hover:bg-primary-hover"
                                  : "bg-surface-hover text-text-secondary hover:bg-primary/10 hover:text-primary"
                              }`}
                              title={
                                isSaved
                                  ? isVietnamese
                                    ? "Bỏ lưu nghĩa này"
                                    : "Unsave this meaning"
                                  : isVietnamese
                                  ? "Lưu nghĩa này"
                                  : "Save this meaning"
                              }
                            >
                              {isSaving ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : isSaved ? (
                                <BookmarkCheck size={14} />
                              ) : (
                                <Bookmark size={14} />
                              )}
                              <span>
                                {isSaving
                                  ? isVietnamese
                                    ? "Đang lưu..."
                                    : "Saving..."
                                  : isSaved
                                  ? isVietnamese
                                    ? "Đã lưu"
                                    : "Saved"
                                  : isVietnamese
                                  ? "Lưu"
                                  : "Save"}
                              </span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-1 rounded-full bg-surface-hover px-3 py-1.5 text-xs text-text-tertiary">
                              <LogIn size={14} />
                              <span>
                                {isVietnamese
                                  ? "Đăng nhập để lưu"
                                  : "Login to save"}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Definition */}
                        <p className="text-[15px] text-text-primary">
                          {meaning.short_meaning_vi || meaning.definition_vi}
                        </p>
                        {meaning.definition_en &&
                          meaning.short_meaning_vi !==
                            meaning.definition_en && (
                            <p className="mt-1 text-[13px] text-text-secondary">
                              {meaning.definition_en}
                            </p>
                          )}

                        {/* Synonyms & Antonyms */}
                        {(meaning.synonyms?.length ?? 0) > 0 ||
                        (meaning.antonyms?.length ?? 0) > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-4">
                            {meaning.synonyms &&
                              meaning.synonyms.length > 0 && (
                                <div>
                                  <span className="text-[11px] font-medium text-text-tertiary">
                                    {isVietnamese ? "Đồng nghĩa:" : "Synonyms:"}
                                  </span>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {meaning.synonyms
                                      .slice(0, 5)
                                      .map((syn, i) => (
                                        <span
                                          key={i}
                                          className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                                        >
                                          {syn}
                                        </span>
                                      ))}
                                  </div>
                                </div>
                              )}
                            {meaning.antonyms &&
                              meaning.antonyms.length > 0 && (
                                <div>
                                  <span className="text-[11px] font-medium text-text-tertiary">
                                    {isVietnamese ? "Trái nghĩa:" : "Antonyms:"}
                                  </span>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {meaning.antonyms
                                      .slice(0, 5)
                                      .map((ant, i) => (
                                        <span
                                          key={i}
                                          className="rounded bg-red-50 px-1.5 py-0.5 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-400"
                                        >
                                          {ant}
                                        </span>
                                      ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        ) : null}

                        {/* Examples */}
                        {meaning.examples && meaning.examples.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <span className="text-[11px] font-medium text-text-tertiary">
                              {isVietnamese ? "Ví dụ:" : "Examples:"}
                            </span>
                            {meaning.examples.slice(0, 2).map((ex, i) => (
                              <div
                                key={i}
                                className="rounded-lg border-l-3 border-primary/50 bg-surface-hover/50 px-3 py-2"
                              >
                                <p className="text-[13px] italic text-text-primary">
                                  "{ex.sentence_en}"
                                </p>
                                {ex.sentence_vi && (
                                  <p className="mt-0.5 text-[12px] text-text-secondary">
                                    {ex.sentence_vi}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Not found */}
              {(!vocabulary.meanings || vocabulary.meanings.length === 0) && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="mb-3 text-text-tertiary" size={48} />
                  <p className="text-[14px] text-text-secondary">
                    {isVietnamese
                      ? "Không tìm thấy nghĩa của từ này"
                      : "No meanings found for this word"}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="mb-3 text-text-tertiary" size={48} />
              <p className="text-[14px] text-text-secondary">
                {isVietnamese
                  ? "Không tìm thấy thông tin từ vựng"
                  : "Vocabulary not found"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
