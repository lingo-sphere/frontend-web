/**
 * @file page.tsx
 * @description Trang Sổ tay từ vựng - hiển thị các từ đã lưu theo từng meaning riêng biệt
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Bookmark,
  Search,
  Volume2,
  Volume1,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/button";
import { SectionHeading } from "@/features/dashboard/components/section.heading";
import { useApp } from "@/contexts/app.context";
import { vocabularyService } from "@/features/vocabulary/services/vocabulary.service";
import { playAudio } from "@/utils/media.utils";
import { useAuthStore } from "@/features/auth/store/auth.store";

interface SavedMeaningItem {
  saved_id: string;
  lexical_item_id: string;
  word: string;
  ipa?: string;
  part_of_speech: string;
  cefr?: string;
  meaning_index: number;
  meaning: string;
  examples: Array<{ en: string; vi?: string }>;
  audio_us?: string;
  audio_uk?: string;
  saved_at: string;
}

const ITEMS_PER_PAGE = 20;

export default function NotebookAppPage() {
  const { i18n } = useTranslation();
  const isVietnamese = i18n.language === "vi";
  const { showAction } = useApp();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.user?.user_id);

  // State
  const [savedItems, setSavedItems] = useState<SavedMeaningItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isUnsaveLoading, setIsUnsaveLoading] = useState<string | null>(null);

  // Fetch saved vocabulary - chỉ khi đã login
  const fetchSavedVocabulary = useCallback(
    async (pageNum: number) => {
      if (!isAuthenticated) {
        setSavedItems([]);
        setTotalItems(0);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await vocabularyService.getSavedVocabulary({
          page: pageNum,
          limit: ITEMS_PER_PAGE,
        });

        setSavedItems(response.items || []);
        setTotalPages(response.pagination?.total_pages || 1);
        setTotalItems(response.pagination?.total || 0);
      } catch (err) {
        console.error("Failed to fetch saved vocabulary:", err);
        showAction(
          isVietnamese
            ? "Không thể tải danh sách từ đã lưu"
            : "Failed to load saved vocabulary"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, showAction, isVietnamese]
  );

  useEffect(() => {
    fetchSavedVocabulary(page);
  }, [fetchSavedVocabulary, page, isAuthenticated]);

  // Filter by search
  const filteredItems = searchQuery
    ? savedItems.filter((item) => {
        const query = searchQuery.toLowerCase();
        return (
          item.word.toLowerCase().includes(query) ||
          item.meaning.toLowerCase().includes(query) ||
          item.part_of_speech.toLowerCase().includes(query)
        );
      })
    : savedItems;

  // Handle unsave
  const handleUnsave = async (item: SavedMeaningItem) => {
    if (!userId) {
      showAction(isVietnamese ? "Cần đăng nhập" : "Please login");
      return;
    }
    try {
      setIsUnsaveLoading(item.saved_id);
      await vocabularyService.unsaveVocabulary(
        userId,
        item.lexical_item_id,
        item.meaning_index
      );

      // Update UI
      setSavedItems((prev) => prev.filter((i) => i.saved_id !== item.saved_id));
      setTotalItems((prev) => Math.max(0, prev - 1));

      showAction(
        isVietnamese ? `Đã bỏ lưu "${item.word}"` : `Unsaved "${item.word}"`
      );
    } catch (err) {
      console.error("Failed to unsave:", err);
      showAction(isVietnamese ? "Không thể bỏ lưu từ này" : "Failed to unsave");
    } finally {
      setIsUnsaveLoading(null);
    }
  };

  // Play audio
  const handlePlayAudio = (type: "us" | "uk", item: SavedMeaningItem) => {
    const audioUrl = type === "us" ? item.audio_us : item.audio_uk;
    if (audioUrl) {
      playAudio(audioUrl);
    }
  };

  return (
    <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <SectionHeading
        eyebrow={isVietnamese ? "Từ vựng" : "Vocabulary"}
        title={isVietnamese ? "Sổ tay từ vựng" : "Vocabulary Notebook"}
        description={
          isVietnamese
            ? "Quản lý các từ đã lưu theo từng nghĩa riêng biệt"
            : "Manage saved words by individual meanings"
        }
      />

      {/* Search & Stats */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder={
              isVietnamese ? "Tìm kiếm từ đã lưu..." : "Search saved words..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-[13px] text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
          />
        </div>

        <div className="text-sm text-text-secondary">
          {isVietnamese ? "Tổng cộng" : "Total"}:{" "}
          <span className="font-medium text-text-primary">{totalItems}</span>{" "}
          {isVietnamese ? "từ đã lưu" : "saved words"}
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !isAuthenticated ? (
          /* Chưa đăng nhập */
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-subtle">
              <Bookmark className="text-text-tertiary" size={40} />
            </div>
            <h3 className="text-[16px] font-semibold text-text-primary">
              {isVietnamese
                ? "Đăng nhập để lưu từ vựng"
                : "Login to save vocabulary"}
            </h3>
            <p className="mt-2 max-w-sm text-[14px] text-text-secondary">
              {isVietnamese
                ? "Đăng nhập để lưu các từ vựng yêu thích và xây dựng bộ sưu tập của riêng bạn."
                : "Login to save your favorite words and build your personal vocabulary collection."}
            </p>
            <Button
              className="mt-6 gap-2"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("lingosphere:open-auth-modal")
                )
              }
            >
              <LogIn size={16} />
              {isVietnamese ? "Đăng nhập" : "Login"}
            </Button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-subtle">
              <Bookmark className="text-text-tertiary" size={40} />
            </div>
            <h3 className="text-[16px] font-semibold text-text-primary">
              {searchQuery
                ? isVietnamese
                  ? "Không tìm thấy từ nào"
                  : "No words found"
                : isVietnamese
                ? "Chưa có từ nào đã lưu"
                : "No saved words yet"}
            </h3>
            <p className="mt-2 max-w-sm text-[14px] text-text-secondary">
              {searchQuery
                ? isVietnamese
                  ? "Thử tìm kiếm với từ khóa khác"
                  : "Try a different search term"
                : isVietnamese
                ? "Bắt đầu lưu từ từ điển để xây dựng bộ sưu tập từ vựng cá nhân của bạn."
                : "Start saving words from the dictionary to build your personal vocabulary collection."}
            </p>
          </div>
        ) : (
          <>
            {/* Cards Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredItems.map((item) => (
                <SavedMeaningCard
                  key={`${item.lexical_item_id}-${item.meaning_index}`}
                  item={item}
                  onUnsave={handleUnsave}
                  onPlayAudio={handlePlayAudio}
                  isUnsaveLoading={isUnsaveLoading === item.saved_id}
                  isVietnamese={isVietnamese}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && !searchQuery && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft size={16} />
                </Button>

                <span className="px-3 text-sm text-text-secondary">
                  {page} / {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

// ==================== SAVED MEANING CARD ====================

interface SavedMeaningCardProps {
  item: SavedMeaningItem;
  onUnsave: (item: SavedMeaningItem) => void;
  onPlayAudio: (type: "us" | "uk", item: SavedMeaningItem) => void;
  isUnsaveLoading: boolean;
  isVietnamese: boolean;
}

function SavedMeaningCard({
  item,
  onUnsave,
  onPlayAudio,
  isUnsaveLoading,
  isVietnamese,
}: SavedMeaningCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isVietnamese ? "vi-VN" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="group relative flex h-full flex-col rounded-xl border border-border bg-surface p-4 transition-all hover:border-primary/30 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 pr-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-text-primary">{item.word}</h3>
            <Bookmark size={14} className="fill-primary text-primary" />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {item.cefr && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {item.cefr}
              </span>
            )}
            <span className="text-xs text-text-secondary">
              {item.part_of_speech}
            </span>
          </div>
        </div>

        {/* Audio buttons */}
        <div className="flex shrink-0 gap-1">
          {item.audio_us && (
            <button
              onClick={() => onPlayAudio("us", item)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
              title={isVietnamese ? "Phát âm US" : "Play US"}
            >
              <Volume1 size={14} />
            </button>
          )}
          {item.audio_uk && (
            <button
              onClick={() => onPlayAudio("uk", item)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 transition-colors hover:bg-emerald-500/20"
              title={isVietnamese ? "Phát âm UK" : "Play UK"}
            >
              <Volume2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* IPA */}
      {item.ipa && (
        <p className="mt-2 font-mono text-sm text-primary">/{item.ipa}/</p>
      )}

      {/* Meaning */}
      <div className="mt-3">
        <span className="text-xs font-medium text-text-tertiary">
          {isVietnamese ? "Nghĩa" : "Meaning"} #{item.meaning_index + 1}:
        </span>
        <p className="mt-1 line-clamp-3 min-h-[3.6em] text-sm leading-[1.2em] text-text-primary">
          {item.meaning}
        </p>
      </div>

      {/* Examples */}
      {item.examples && item.examples.length > 0 && (
        <div className="mt-3 min-h-[3.5rem] space-y-2">
          {item.examples.slice(0, 1).map((ex, idx) => (
            <div
              key={idx}
              className="rounded-lg border-l-2 border-primary/30 bg-surface-hover/50 px-3 py-2"
            >
              <p className="text-xs italic text-text-primary">"{ex.en}"</p>
              {ex.vi && (
                <p className="mt-0.5 text-xs text-text-secondary">{ex.vi}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs text-text-tertiary">
          {formatDate(item.saved_at)}
        </span>

        <button
          onClick={() => onUnsave(item)}
          disabled={isUnsaveLoading}
          className="flex items-center gap-1 text-xs text-text-tertiary transition-colors hover:text-red-500 disabled:opacity-50"
        >
          {isUnsaveLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Trash2 size={14} />
          )}
          {isVietnamese ? "Xóa" : "Remove"}
        </button>
      </div>
    </div>
  );
}
