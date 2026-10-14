/**
 * @file page.tsx
 * @description Trang Sổ tay từ vựng - quản lý các từ đã lưu và đóng gói vào Bộ thẻ Flashcard (Min 5, Max 30)
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  ArrowLeft,
  Layers3,
  Check,
  X,
  AlertCircle,
  Sparkles,
  CheckSquare,
  Square,
} from "lucide-react";
import { Button } from "@/components/button";
import { SectionHeading } from "@/features/dashboard/components/section.heading";
import { useNavigate } from "@/lib/navigation";
import { useApp } from "@/contexts/app.context";
import { vocabularyService } from "@/features/vocabulary/services/vocabulary.service";
import { useMyVocabularyEnrollmentsQuery } from "@/features/vocabulary/hooks/use.vocabulary.query";
import { playAudio } from "@/utils/media.utils";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  AddSavedWordsToDeckModal,
  MIN_DECK_WORDS,
  MAX_DECK_WORDS,
  type SavedWordItem,
} from "@/features/vocabulary/components/add.saved.words.to.deck.modal";

export interface SavedMeaningItem {
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
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isVietnamese = i18n.language === "vi";
  const { showAction } = useApp();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.user?.user_id);

  // State dữ liệu
  const [savedItems, setSavedItems] = useState<SavedMeaningItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isUnsaveLoading, setIsUnsaveLoading] = useState<string | null>(null);

  // State chọn từ để đóng gói vào bộ thẻ (Min 5, Max 30)
  const [selectedWordIds, setSelectedWordIds] = useState<Set<string>>(new Set());
  const [isAddToDeckModalOpen, setIsAddToDeckModalOpen] = useState(false);

  // Lấy danh sách bộ thẻ của user để thêm vào
  const { data: myDecks = [] } = useMyVocabularyEnrollmentsQuery(isAuthenticated);

  // Fetch saved vocabulary
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
  const filteredItems = useMemo(() => {
    if (!searchQuery) return savedItems;
    const query = searchQuery.toLowerCase();
    return savedItems.filter(
      (item) =>
        item.word.toLowerCase().includes(query) ||
        item.meaning.toLowerCase().includes(query) ||
        item.part_of_speech.toLowerCase().includes(query)
    );
  }, [savedItems, searchQuery]);

  // Danh sách các từ được chọn
  const selectedWords = useMemo<SavedWordItem[]>(() => {
    return savedItems
      .filter((item) => selectedWordIds.has(item.saved_id))
      .map((item) => ({
        saved_id: item.saved_id,
        lexical_item_id: item.lexical_item_id,
        word: item.word,
        ipa: item.ipa,
        meaning_index: item.meaning_index,
        meaning: item.meaning,
        examples: item.examples,
      }));
  }, [savedItems, selectedWordIds]);

  const selectedCount = selectedWordIds.size;

  // Toggle chọn 1 từ (Chặn khi đạt MAX 30 từ)
  const handleToggleSelect = (item: SavedMeaningItem) => {
    setSelectedWordIds((prev) => {
      const next = new Set(prev);
      if (next.has(item.saved_id)) {
        next.delete(item.saved_id);
      } else {
        if (next.size >= MAX_DECK_WORDS) {
          showAction(
            isVietnamese
              ? `Một bộ thẻ tối đa ${MAX_DECK_WORDS} từ để đảm bảo hiệu quả ghi nhớ!`
              : `A deck can have at most ${MAX_DECK_WORDS} words!`
          );
          return prev;
        }
        next.add(item.saved_id);
      }
      return next;
    });
  };

  // Chọn nhanh tất cả từ trên trang hiện tại (tối đa 30 từ)
  const handleSelectAllCurrentPage = () => {
    setSelectedWordIds((prev) => {
      const next = new Set(prev);
      for (const item of filteredItems) {
        if (next.size >= MAX_DECK_WORDS) break;
        next.add(item.saved_id);
      }
      return next;
    });
  };

  // Bỏ chọn tất cả
  const handleClearSelection = () => {
    setSelectedWordIds(new Set());
  };

  // Xóa từ khỏi sổ tay (Unsave)
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

      setSavedItems((prev) => prev.filter((i) => i.saved_id !== item.saved_id));
      setSelectedWordIds((prev) => {
        const next = new Set(prev);
        next.delete(item.saved_id);
        return next;
      });
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

  // Phát âm
  const handlePlayAudio = (type: "us" | "uk", item: SavedMeaningItem) => {
    const audioUrl = type === "us" ? item.audio_us : item.audio_uk;
    if (audioUrl) {
      playAudio(audioUrl);
    }
  };

  // Callback sau khi đóng gói thành công
  const handleAddToDeckSuccess = (removedWordIds: string[]) => {
    if (removedWordIds.length > 0) {
      // Cập nhật lại state sau khi đã xóa khỏi sổ tay
      setSavedItems((prev) => prev.filter((i) => !removedWordIds.includes(i.saved_id)));
      setTotalItems((prev) => Math.max(0, prev - removedWordIds.length));
    }
    setSelectedWordIds(new Set());
  };

  return (
    <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8 pb-28">
      {/* Nút quay về & Tiêu đề */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl text-text-secondary hover:text-text-primary"
            onClick={() => navigate("/vocabulary")}
          >
            <ArrowLeft size={16} />
            <span>{isVietnamese ? "Quay về Từ vựng" : "Back to Vocabulary"}</span>
          </Button>
        </div>

        {/* Nút tác vụ đóng gói nhanh vào bộ thẻ */}
        {isAuthenticated && totalItems > 0 && (
          <div className="flex items-center gap-2">
            {totalItems < MIN_DECK_WORDS ? (
              <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                <AlertCircle size={14} />
                <span>
                  {isVietnamese
                    ? `Cần tối thiểu ${MIN_DECK_WORDS} từ để tạo bộ thẻ (hiện có: ${totalItems}/${MIN_DECK_WORDS})`
                    : `Need min ${MIN_DECK_WORDS} words to create deck (have: ${totalItems}/${MIN_DECK_WORDS})`}
                </span>
              </div>
            ) : (
              <Button
                className="gap-2 bg-primary hover:bg-primary-hover shadow-sm"
                onClick={() => {
                  if (selectedCount === 0) {
                    handleSelectAllCurrentPage();
                  }
                  setIsAddToDeckModalOpen(true);
                }}
              >
                <Layers3 size={16} />
                <span>
                  {selectedCount > 0
                    ? isVietnamese
                      ? `Đóng gói ${selectedCount} từ vào bộ thẻ`
                      : `Package ${selectedCount} words into deck`
                    : isVietnamese
                    ? "Tạo bộ thẻ từ sổ tay"
                    : "Create deck from notebook"}
                </span>
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="mt-4">
        <SectionHeading
          eyebrow={isVietnamese ? "Sổ tay từ vựng" : "Vocabulary Notebook"}
          title={isVietnamese ? "Kho từ vựng cá nhân" : "Personal Saved Words"}
          description={
            isVietnamese
              ? `Lưu nháp các từ vựng mới và đóng gói thành Bộ thẻ Flashcard (tối thiểu ${MIN_DECK_WORDS} từ, tối đa ${MAX_DECK_WORDS} từ) để đưa vào chu kỳ ôn tập SRS.`
              : `Save new words and package them into Flashcard Decks (min ${MIN_DECK_WORDS}, max ${MAX_DECK_WORDS}) for SRS reviews.`
          }
        />
      </div>

      {/* Thanh tìm kiếm & Trạng thái lựa chọn */}
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

        <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
          {filteredItems.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllCurrentPage}
                className="text-[12px] font-semibold text-primary hover:underline"
              >
                {isVietnamese ? "Chọn tất cả" : "Select all"}
              </button>
              {selectedCount > 0 && (
                <>
                  <span className="text-border">|</span>
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="text-[12px] font-semibold text-rose-500 hover:underline"
                  >
                    {isVietnamese ? "Bỏ chọn" : "Deselect"}
                  </button>
                </>
              )}
            </div>
          )}

          <span className="text-border">•</span>

          <div>
            {isVietnamese ? "Tổng cộng" : "Total"}:{" "}
            <span className="font-bold text-text-primary">{totalItems}</span>{" "}
            {isVietnamese ? "từ đã lưu" : "saved words"}
          </div>
        </div>
      </div>

      {/* Nội dung danh sách */}
      <div className="mt-6">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !isAuthenticated ? (
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
                ? "Đăng nhập để lưu các từ vựng yêu thích và đóng gói thành bộ thẻ flashcard."
                : "Login to save your favorite words and package them into flashcard decks."}
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
                : "Start saving words from dictionary to build your vocabulary collection."}
            </p>
          </div>
        ) : (
          <>
            {/* Cards Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredItems.map((item) => {
                const isSelected = selectedWordIds.has(item.saved_id);
                const isMaxReached = selectedCount >= MAX_DECK_WORDS && !isSelected;

                return (
                  <SavedMeaningCard
                    key={`${item.lexical_item_id}-${item.meaning_index}`}
                    item={item}
                    isSelected={isSelected}
                    isMaxReached={isMaxReached}
                    onToggleSelect={() => handleToggleSelect(item)}
                    onUnsave={handleUnsave}
                    onPlayAudio={handlePlayAudio}
                    isUnsaveLoading={isUnsaveLoading === item.saved_id}
                    isVietnamese={isVietnamese}
                  />
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && !searchQuery && (
              <div className="mt-8 flex items-center justify-center gap-2">
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

      {/* THANH TÁC VỤ NỔI DƯỚI ĐÁY MÀN HÌNH KHI ĐÃ CHỌN TỪ (FLOATING ACTION BAR) */}
      {selectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-2xl border border-primary/30 bg-surface/95 px-5 py-3 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-white">
              {selectedCount}
            </span>
            <div className="text-[13px]">
              <span className="font-bold text-text-primary">
                {isVietnamese ? `Đã chọn ${selectedCount}/${MAX_DECK_WORDS} từ` : `Selected ${selectedCount}/${MAX_DECK_WORDS}`}
              </span>
              {selectedCount < MIN_DECK_WORDS && (
                <span className="ml-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  {isVietnamese ? `(Cần thêm ${MIN_DECK_WORDS - selectedCount} từ)` : `(Need ${MIN_DECK_WORDS - selectedCount} more)`}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 border-l border-border pl-3">
            <Button
              className="gap-2 bg-primary hover:bg-primary-hover shadow-sm"
              disabled={selectedCount < MIN_DECK_WORDS}
              onClick={() => setIsAddToDeckModalOpen(true)}
            >
              <Layers3 size={16} />
              <span>
                {isVietnamese ? "Thêm vào bộ thẻ" : "Add to Deck"}
              </span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleClearSelection}
              className="gap-1 text-text-secondary hover:text-text-primary"
            >
              <X size={14} />
              <span>{isVietnamese ? "Bỏ chọn" : "Clear"}</span>
            </Button>
          </div>
        </div>
      )}

      {/* MODAL ĐÓNG GÓI VÀO BỘ THẺ */}
      <AddSavedWordsToDeckModal
        isOpen={isAddToDeckModalOpen}
        onClose={() => setIsAddToDeckModalOpen(false)}
        selectedWords={selectedWords}
        existingDecks={myDecks}
        userId={userId}
        onSuccess={handleAddToDeckSuccess}
      />
    </main>
  );
}

// ==================== SAVED MEANING CARD ====================

interface SavedMeaningCardProps {
  item: SavedMeaningItem;
  isSelected: boolean;
  isMaxReached: boolean;
  onToggleSelect: () => void;
  onUnsave: (item: SavedMeaningItem) => void;
  onPlayAudio: (type: "us" | "uk", item: SavedMeaningItem) => void;
  isUnsaveLoading: boolean;
  isVietnamese: boolean;
}

function SavedMeaningCard({
  item,
  isSelected,
  isMaxReached,
  onToggleSelect,
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
    <div
      className={`group relative flex h-full flex-col rounded-2xl border bg-surface p-4 transition-all ${
        isSelected
          ? "border-primary bg-primary/[0.03] ring-2 ring-primary/40 shadow-sm"
          : isMaxReached
          ? "border-border opacity-70"
          : "border-border hover:border-primary/40 hover:shadow-md"
      }`}
    >
      {/* Header & Checkbox chọn từ */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          {/* Checkbox */}
          <button
            type="button"
            onClick={onToggleSelect}
            disabled={isMaxReached && !isSelected}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition ${
              isSelected
                ? "border-primary bg-primary text-white"
                : isMaxReached
                ? "border-border/60 bg-surface-subtle cursor-not-allowed"
                : "border-border hover:border-primary/60 bg-surface"
            }`}
            title={isSelected ? "Bỏ chọn" : isMaxReached ? "Đã đạt giới hạn 30 từ" : "Chọn từ này"}
          >
            {isSelected && <Check size={13} strokeWidth={3} />}
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[17px] font-bold text-text-primary leading-tight">
                {item.word}
              </h3>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {item.cefr && (
                <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                  {item.cefr}
                </span>
              )}
              <span className="text-[11px] font-medium text-text-secondary">
                {item.part_of_speech}
              </span>
            </div>
          </div>
        </div>

        {/* Audio buttons */}
        <div className="flex shrink-0 gap-1">
          {item.audio_us && (
            <button
              onClick={() => onPlayAudio("us", item)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
              title={isVietnamese ? "Phát âm US" : "Play US"}
            >
              <Volume1 size={13} />
            </button>
          )}
          {item.audio_uk && (
            <button
              onClick={() => onPlayAudio("uk", item)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 transition-colors hover:bg-emerald-500/20"
              title={isVietnamese ? "Phát âm UK" : "Play UK"}
            >
              <Volume2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* IPA */}
      {item.ipa && (
        <p className="mt-2 font-mono text-[13px] text-primary">/{item.ipa}/</p>
      )}

      {/* Meaning */}
      <div className="mt-2.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
          {isVietnamese ? "Nghĩa" : "Meaning"} #{item.meaning_index + 1}:
        </span>
        <p className="mt-0.5 line-clamp-3 min-h-[3.6em] text-[13px] leading-relaxed text-text-primary">
          {item.meaning}
        </p>
      </div>

      {/* Examples */}
      {item.examples && item.examples.length > 0 && (
        <div className="mt-2.5 min-h-[3.2rem] space-y-1.5">
          {item.examples.slice(0, 1).map((ex, idx) => (
            <div
              key={idx}
              className="rounded-lg border-l-2 border-primary/30 bg-surface-subtle px-2.5 py-1.5"
            >
              <p className="text-[11px] italic text-text-primary">"{ex.en}"</p>
              {ex.vi && (
                <p className="mt-0.5 text-[11px] text-text-secondary">{ex.vi}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between border-t border-border/70 pt-2.5">
        <span className="text-[11px] text-text-tertiary">
          {formatDate(item.saved_at)}
        </span>

        <button
          onClick={() => onUnsave(item)}
          disabled={isUnsaveLoading}
          className="flex items-center gap-1 text-[11px] text-text-tertiary transition-colors hover:text-rose-500 disabled:opacity-50"
        >
          {isUnsaveLoading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Trash2 size={13} />
          )}
          <span>{isVietnamese ? "Xóa" : "Remove"}</span>
        </button>
      </div>
    </div>
  );
}
