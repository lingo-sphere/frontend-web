// Component modal tra tu dien nhanh voi goi y tim kiem va lich su tra cuu.
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import { Search, X, BookOpen, Clock, Trash2 } from "lucide-react";
import { vocabularyService } from "@/features/vocabulary/services/vocabulary.service";
import { VocabularyDetailModal } from "@/features/vocabulary/components/vocabulary-detail.modal";
import type {
  LookupResultItem,
  SearchHistoryResponse,
} from "@/features/vocabulary/schemas/vocabulary.schema";

interface DictionaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (message: string) => void;
  userId?: string | null;
}

export function DictionaryModal({
  open,
  onOpenChange,
  onAction,
  userId,
}: DictionaryModalProps) {
  const { i18n } = useTranslation();
  const isVietnamese = i18n.language === "vi";

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LookupResultItem[]>([]);
  const [searchHistory, setSearchHistory] = useState<
    SearchHistoryResponse["results"]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showHistory, setShowHistory] = useState(false);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedVocab, setSelectedVocab] = useState<{
    id: string;
    word: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSearchHistory = useCallback(async () => {
    if (!userId) return;
    try {
      const history = await vocabularyService.getSearchHistory(userId, 10);
      setSearchHistory((history.results || []).slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch search history:", err);
    }
  }, [userId]);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await vocabularyService.lookup(q.trim(), 8);
      setSuggestions(response.results || []);
    } catch (err) {
      console.error("Lookup failed:", err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim()) {
      setSuggestions([]);
      setShowHistory(true);
      fetchSearchHistory();
      return;
    }

    setShowHistory(false);

    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 200);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, fetchSuggestions, fetchSearchHistory]);

  const saveToHistory = useCallback(
    async (item: LookupResultItem) => {
      console.log("[saveToHistory] userId:", userId, "item:", item);
      if (!userId) {
        console.warn("[saveToHistory] No userId, skipping...");
        return;
      }
      try {
        await vocabularyService.saveSearchHistory(userId, {
          vocabularyId: item.id,
          searchQuery: item.word,
          searchType: item.matchType.toUpperCase(),
        });
        console.log("[saveToHistory] Saved successfully");
      } catch (err) {
        console.error("Failed to save search history:", err);
      }
    },
    [userId]
  );

  const handleSelect = (item: LookupResultItem) => {
    saveToHistory(item);

    setSelectedVocab({ id: item.id, word: item.word });
    setDetailModalOpen(true);

    setSuggestions([]);
    setShowHistory(false);
  };

  const handleHistorySelect = (item: SearchHistoryResponse["results"][0]) => {
    if (item.searchQuery) {
      setQuery(item.searchQuery);
    }
    const vocabId = item.vocabularyId || item.clicked_item_id;
    const word = item.searchQuery || item.word;
    if (vocabId && word) {
      setSelectedVocab({ id: vocabId, word });
      setDetailModalOpen(true);
    }
    setShowHistory(false);
  };

  const handleClearHistory = async () => {
    if (!userId) return;
    try {
      await vocabularyService.clearSearchHistory(userId);
      setSearchHistory([]);
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = showHistory ? searchHistory : suggestions;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && !showHistory && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        } else if (query.trim()) {
          fetchSuggestions(query);
        }
        break;
      case "Escape":
        e.preventDefault();
        setSuggestions([]);
        setShowHistory(false);
        onOpenChange(false);
        break;
    }
  };

  useEffect(() => {
    if (open) {
      setQuery("");
      setSuggestions([]);
      setSelectedIndex(-1);
      setShowHistory(true);
      fetchSearchHistory();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, fetchSearchHistory]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const showDropdown =
    (showHistory && searchHistory.length > 0) ||
    suggestions.length > 0 ||
    (isLoading && query.length >= 2);

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/50 p-4 pt-[15vh]"
    >
      <div
        ref={dropdownRef}
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-surface shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="text-primary" size={20} />
            <h2 className="text-lg font-semibold text-text-primary">
              {isVietnamese ? "Tra từ điển" : "Dictionary"}
            </h2>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover"
          >
            <X size={18} />
          </button>
        </div>

        <div className="border-b border-border px-5 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              ref={inputRef}
              autoFocus
              type="text"
              placeholder={
                isVietnamese
                  ? "Tìm từ vựng hoặc cụm từ..."
                  : "Search for a word or phrase..."
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (!query.trim()) setShowHistory(true);
              }}
              className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-10 text-[14px] text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}
            {query && !isLoading && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {showDropdown && (
          <div className="max-h-[50vh] overflow-y-auto">
            {showHistory && searchHistory.length > 0 && (
              <div className="border-b border-border">
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center gap-2 text-[12px] font-medium text-text-secondary">
                    <Clock size={14} />
                    {isVietnamese ? "Tìm kiếm gần đây" : "Recent Searches"}
                  </div>
                  <button
                    onClick={handleClearHistory}
                    className="flex items-center gap-1 text-[12px] text-text-tertiary hover:text-primary"
                  >
                    <Trash2 size={12} />
                    {isVietnamese ? "Xóa tất cả" : "Clear all"}
                  </button>
                </div>
                {searchHistory.map((item, idx) => (
                  <button
                    key={item._id}
                    onClick={() => handleHistorySelect(item)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-hover ${
                      selectedIndex === idx ? "bg-surface-hover" : ""
                    }`}
                  >
                    <Clock size={14} className="text-text-tertiary" />
                    <span className="flex-1 text-[14px] text-text-primary">
                      {item.searchQuery || item.word}
                    </span>
                    {item.cefr && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        {item.cefr}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="py-2">
                {suggestions.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-hover ${
                      selectedIndex === idx ? "bg-surface-hover" : ""
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-semibold text-text-primary">
                          {item.word}
                        </span>
                        {item.cefr && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                            {item.cefr}
                          </span>
                        )}
                        {item.matchType === "fuzzy" && (
                          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                            {isVietnamese ? "Gợi ý" : "Did you mean?"}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[12px] text-text-secondary">
                        {item.pos.length > 0 && (
                          <span className="italic text-text-tertiary">
                            {item.pos[0]}
                          </span>
                        )}
                        {item.meaning && (
                          <span className="truncate text-text-secondary">
                            · {item.meaning}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.ipa && (
                      <span className="font-mono text-[12px] text-text-tertiary">
                        /{item.ipa}/
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {!showHistory &&
              query.length >= 2 &&
              suggestions.length === 0 &&
              !isLoading && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Search className="mb-2 text-text-tertiary" size={32} />
                  <p className="text-[14px] text-text-secondary">
                    {isVietnamese
                      ? `Không tìm thấy kết quả cho "${query}"`
                      : `No results found for "${query}"`}
                  </p>
                </div>
              )}
          </div>
        )}

        <div className="border-t border-border px-4 py-2">
          <p className="text-[11px] text-text-tertiary">
            {isVietnamese
              ? "Nhấn ↑↓ để chọn, Enter để tra, Esc để đóng"
              : "Press ↑↓ to select, Enter to search, Esc to close"}
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(
    <>
      {modalContent}

      <VocabularyDetailModal
        wordId={selectedVocab?.id || ""}
        word={selectedVocab?.word || ""}
        open={detailModalOpen}
        onOpenChange={(open) => {
          setDetailModalOpen(open);
        }}
        onAction={onAction}
      />
    </>,
    document.body
  );
}
