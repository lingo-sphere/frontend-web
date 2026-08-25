
import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Layers3,
  Plus,
  Bookmark,
  X,
  Volume2,
  Search,
  Check,
  BookOpen,
  FolderPlus,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/dashboard/SectionHeading";
import { useDashboardStore } from "@/store/dashboard-store";
import { SelectDeckModal } from "./SelectDeckModal";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { VocabularyCard } from "./VocabularyCard";
import type {
  SavedVocabulary,
  LearningStatus,
  UserDeck,
} from "@/types/vocabulary";

import {
  savedVocabulary as initialSavedVocabulary,
  userDecks as initialUserDecks,
} from "@/data/vocabulary-data";

interface NotebookPageProps {
  onAction: (message: string) => void;
}

export function NotebookPage({ onAction }: NotebookPageProps) {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const navigate = useNavigate();
  const setActiveNavItem = useDashboardStore((state) => state.setActiveNavItem);
  const [activeTab, setActiveTab] = useState<"vocabulary" | "decks">("vocabulary");

  const [savedVocabulary, setSavedVocabulary] = useState<SavedVocabulary[]>(
    initialSavedVocabulary
  );
  const [userDecks, setUserDecks] = useState<UserDeck[]>(initialUserDecks);

  const [selectDeckModal, setSelectDeckModal] = useState<{
    isOpen: boolean;
    word: SavedVocabulary | null;
  }>({ isOpen: false, word: null });

  const [deleteWordModal, setDeleteWordModal] = useState<{
    isOpen: boolean;
    word: SavedVocabulary | null;
  }>({ isOpen: false, word: null });

  const [createDeckModal, setCreateDeckModal] = useState<boolean>(false);
  const [newDeckTitle, setNewDeckTitle] = useState("");

  const deckWordCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    savedVocabulary.forEach((item) => {
      if (item.deck_id) {
        counts[item.deck_id] = (counts[item.deck_id] || 0) + 1;
      }
    });
    return counts;
  }, [savedVocabulary]);

  const inboxWords = useMemo(() => {
    return savedVocabulary.filter((item) => !item.deck_id);
  }, [savedVocabulary]);

  const wordsInDeck = (deckId: string) => {
    return savedVocabulary.filter((item) => item.deck_id === deckId);
  };

  const handleDeckClick = (deckId: string) => {
    setActiveNavItem("vocabulary");
    navigate(`/vocabulary/learn/${deckId}`);
    onAction(isVietnamese ? "Bắt đầu học deck" : "Starting deck learning");
  };

  const handleAddToDeck = (word: SavedVocabulary) => {
    setSelectDeckModal({ isOpen: true, word });
  };

  const handleSelectDeck = (
    deckId: string | null,
    createNew: boolean,
    newDeckTitle?: string
  ) => {
    const word = selectDeckModal.word;
    if (!word) return;

    if (createNew && newDeckTitle) {

      const newDeck: UserDeck = {
        id: `deck-${Date.now()}`,
        title: newDeckTitle,
        cardCount: 1,
        createdAt: new Date().toISOString(),
      };
      setUserDecks((prev) => [...prev, newDeck]);

      setSavedVocabulary((prev) =>
        prev.map((item) =>
          item.id === word.id ? { ...item, deck_id: newDeck.id } : item
        )
      );

      onAction(isVietnamese ? `Đã tạo deck "${newDeckTitle}" và thêm từ` : `Created deck "${newDeckTitle}" and added word`);
    } else if (deckId) {

      setSavedVocabulary((prev) =>
        prev.map((item) =>
          item.id === word.id ? { ...item, deck_id: deckId } : item
        )
      );
      const deckName = userDecks.find((d) => d.id === deckId)?.title || deckId;
      onAction(isVietnamese ? `Đã thêm từ vào "${deckName}"` : `Added word to "${deckName}"`);
    } else {

      onAction(isVietnamese ? `Đã lưu từ "${word.lexical_item.word}"` : `Saved word "${word.lexical_item.word}"`);
    }

    setSelectDeckModal({ isOpen: false, word: null });
  };

  const handleDeleteWord = (word: SavedVocabulary) => {
    setDeleteWordModal({ isOpen: true, word });
  };

  const confirmDeleteWord = () => {
    const word = deleteWordModal.word;
    if (!word) return;

    setSavedVocabulary((prev) => prev.filter((item) => item.id !== word.id));
    onAction(isVietnamese ? `Đã xóa từ "${word.lexical_item.word}"` : `Deleted word "${word.lexical_item.word}"`);

    setDeleteWordModal({ isOpen: false, word: null });
  };

  const handleCreateDeck = () => {
    if (!newDeckTitle.trim()) return;

    const newDeck: UserDeck = {
      id: `deck-${Date.now()}`,
      title: newDeckTitle.trim(),
      cardCount: 0,
      createdAt: new Date().toISOString(),
    };

    setUserDecks((prev) => [...prev, newDeck]);
    setNewDeckTitle("");
    setCreateDeckModal(false);
    onAction(isVietnamese ? `Đã tạo deck "${newDeck.title}"` : `Created deck "${newDeck.title}"`);
  };

  const handleDeleteDeck = (deck: UserDeck) => {

    setUserDecks((prev) => prev.filter((d) => d.id !== deck.id));

    setSavedVocabulary((prev) =>
      prev.map((item) =>
        item.deck_id === deck.id ? { ...item, deck_id: undefined } : item
      )
    );

    onAction(isVietnamese ? `Đã xóa deck "${deck.title}"` : `Deleted deck "${deck.title}"`);
  };

  const handleRemoveFromDeck = (word: SavedVocabulary) => {
    setSavedVocabulary((prev) =>
      prev.map((item) =>
        item.id === word.id ? { ...item, deck_id: undefined } : item
      )
    );
    onAction(isVietnamese ? `Đã xóa từ "${word.lexical_item.word}" khỏi deck` : `Removed word "${word.lexical_item.word}" from deck`);
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      {/* Header */}
      <SectionHeading
        eyebrow={t('vocabulary.notebook')}
        title={isVietnamese ? "Sổ tay từ vựng" : "Vocabulary Notebook"}
        description={isVietnamese ? "Từ vựng đã lưu và bộ thẻ của bạn" : "Your saved vocabulary and decks"}
      />

      {/* Tabs */}
      <div className="mt-6 inline-flex rounded-xl border border-border bg-surface p-1">
        <button
          onClick={() => setActiveTab("vocabulary")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition-all ${
            activeTab === "vocabulary"
              ? "bg-primary text-white shadow-sm"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <Bookmark size={16} />
          {isVietnamese ? "Từ vựng" : "Vocabulary"} ({savedVocabulary.length})
        </button>
        <button
          onClick={() => setActiveTab("decks")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition-all ${
            activeTab === "decks"
              ? "bg-primary text-white shadow-sm"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <Layers3 size={16} />
          {isVietnamese ? "Bộ thẻ" : "Decks"} ({userDecks.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "vocabulary" && (
        <VocabularyTab
          savedVocabulary={savedVocabulary}
          userDecks={userDecks}
          onAddToDeck={handleAddToDeck}
          onDeleteWord={handleDeleteWord}
          onRemoveFromDeck={handleRemoveFromDeck}
          onAction={onAction}
          isVietnamese={isVietnamese}
        />
      )}

      {activeTab === "decks" && (
        <DecksTab
          decks={userDecks}
          deckWordCounts={deckWordCounts}
          wordsInDeck={wordsInDeck}
          onDeckClick={handleDeckClick}
          onDeleteDeck={handleDeleteDeck}
          onCreateDeck={() => setCreateDeckModal(true)}
          onAction={onAction}
          isVietnamese={isVietnamese}
        />
      )}

      {/* ===== MODALS ===== */}

      {/* Modal chọn deck */}
      <SelectDeckModal
        isOpen={selectDeckModal.isOpen}
        onClose={() => setSelectDeckModal({ isOpen: false, word: null })}
        word={selectDeckModal.word?.lexical_item.word || ""}
        existingDecks={userDecks}
        onSelectDeck={handleSelectDeck}
      />

      {/* Modal xác nhận xóa từ */}
      <ConfirmDeleteModal
        isOpen={deleteWordModal.isOpen}
        onClose={() => setDeleteWordModal({ isOpen: false, word: null })}
        title={isVietnamese ? "Xóa từ đã lưu" : "Delete Saved Word"}
        message={isVietnamese ? `Bạn có chắc muốn xóa từ "${deleteWordModal.word?.lexical_item.word}" khỏi danh sách đã lưu không?` : `Are you sure you want to delete the word "${deleteWordModal.word?.lexical_item.word}" from your saved list?`}
        confirmText={isVietnamese ? "Xóa" : "Delete"}
        onConfirm={confirmDeleteWord}
      />

      {/* Modal tạo deck mới */}
      <CreateDeckModal
        isOpen={createDeckModal}
        onClose={() => {
          setCreateDeckModal(false);
          setNewDeckTitle("");
        }}
        deckTitle={newDeckTitle}
        onDeckTitleChange={setNewDeckTitle}
        onCreate={handleCreateDeck}
        isVietnamese={isVietnamese}
      />
    </main>
  );
}

interface VocabularyTabProps {
  savedVocabulary: SavedVocabulary[];
  userDecks: UserDeck[];
  onAddToDeck: (word: SavedVocabulary) => void;
  onDeleteWord: (word: SavedVocabulary) => void;
  onRemoveFromDeck: (word: SavedVocabulary) => void;
  onAction: (message: string) => void;
  isVietnamese: boolean;
}

const ITEMS_PER_PAGE = 20; 

function VocabularyTab({
  savedVocabulary,
  userDecks,
  onAddToDeck,
  onDeleteWord,
  onRemoveFromDeck,
  onAction,
  isVietnamese,
}: VocabularyTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDeck, setFilterDeck] = useState<string | "all" | "inbox">("all");
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);

  const filteredWords = savedVocabulary.filter((item) => {

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const meanings = item.meanings || (item.primary_meaning ? [item.primary_meaning] : []);
      const matchesSearch =
        item.lexical_item.word.toLowerCase().includes(query) ||
        meanings.some((m) =>
          (m.definition_vi?.toLowerCase().includes(query)) ||
          (m.definition_en?.toLowerCase().includes(query))
        );
      if (!matchesSearch) return false;
    }

    if (filterDeck === "inbox") {
      return !item.deck_id;
    } else if (filterDeck !== "all" && item.deck_id !== filterDeck) {
      return false;
    }

    return true;
  });

  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [searchQuery, filterDeck]);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const scrollPosition = scrollTop + clientHeight;
      const scrollThreshold = scrollHeight * 0.8; 

      if (
        scrollPosition >= scrollThreshold &&
        displayCount < filteredWords.length &&
        !isLoading
      ) {
        setIsLoading(true);

        setTimeout(() => {
          setDisplayCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredWords.length));
          setIsLoading(false);
        }, 300);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [displayCount, filteredWords.length, isLoading]);

  const displayedWords = filteredWords.slice(0, displayCount);
  const hasMore = displayCount < filteredWords.length;

  if (savedVocabulary.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-subtle">
          <Bookmark className="text-text-tertiary" size={40} />
        </div>
        <h3 className="text-[16px] font-semibold text-text-primary">
          {isVietnamese ? "Chưa có từ nào đã lưu" : "No saved words yet"}
        </h3>
        <p className="mt-2 max-w-sm text-[14px] text-text-secondary">
          {isVietnamese ? "Bắt đầu lưu từ từ điển để xây dựng bộ sưu tập từ vựng cá nhân của bạn." : "Start saving words from the dictionary to build your personal vocabulary collection."}
        </p>
        <Button
          className="mt-6 bg-primary hover:bg-primary-hover"
          onClick={() => onAction(isVietnamese ? "Đi đến Từ vựng" : "Go to Vocabulary")}
        >
          {isVietnamese ? "Khám phá Từ vựng" : "Explore Vocabulary"}
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder={isVietnamese ? "Tìm kiếm từ đã lưu..." : "Search saved words..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-[13px] text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
          />
        </div>

        {/* Filter by deck */}
        <select
          value={filterDeck}
          onChange={(e) => setFilterDeck(e.target.value as typeof filterDeck)}
          className="h-10 rounded-xl border border-border bg-surface px-3 pr-8 text-[13px] text-text-primary focus:border-primary focus:outline-none"
        >
          <option value="all">{isVietnamese ? "Tất cả" : "All"}</option>
          <option value="inbox">
            📁 {isVietnamese ? "Danh sách từ vựng" : "Vocabulary list"} (
            {savedVocabulary.filter((w) => !w.deck_id).length})
          </option>
          {userDecks.map((deck) => (
            <option key={deck.id} value={deck.id}>
              📁 {deck.title}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-[12px] text-text-secondary">
        <span>{isVietnamese ? "Đang hiển thị" : "Showing"}: {displayedWords.length}/{filteredWords.length} {isVietnamese ? "từ" : "words"}</span>
        {hasMore && <span className="text-primary">• {isVietnamese ? "Cuộn xuống để xem thêm" : "Scroll down for more"}</span>}
      </div>

      {/* Word Grid - 5 columns */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {displayedWords.map((item) => (
          <VocabularyCard
            key={item.id}
            item={item}
            userDecks={userDecks}
            onAddToDeck={onAddToDeck}
            onRemoveFromDeck={onRemoveFromDeck}
            onDeleteWord={onDeleteWord}
            onAction={onAction}
          />
        ))}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="py-4 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {/* End of list */}
      {!hasMore && filteredWords.length > 0 && (
        <p className="py-4 text-center text-[12px] text-text-tertiary">
          {isVietnamese ? "Đã hiển thị tất cả" : "Showing all"} {filteredWords.length} {isVietnamese ? "từ" : "words"}
        </p>
      )}

      {filteredWords.length === 0 && searchQuery && (
        <div className="py-8 text-center">
          <p className="text-[14px] text-text-secondary">
            {isVietnamese ? "Không tìm thấy từ nào phù hợp với" : "No words found matching"} "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
}

interface DecksTabProps {
  decks: UserDeck[];
  deckWordCounts: Record<string, number>;
  wordsInDeck: (deckId: string) => SavedVocabulary[];
  onDeckClick: (deckId: string) => void;
  onDeleteDeck: (deck: UserDeck) => void;
  onCreateDeck: () => void;
  onAction: (message: string) => void;
  isVietnamese: boolean;
}

function DecksTab({
  decks,
  deckWordCounts,
  wordsInDeck,
  onDeckClick,
  onDeleteDeck,
  onCreateDeck,
  onAction,
  isVietnamese,
}: DecksTabProps) {
  const [expandedDeck, setExpandedDeck] = useState<string | null>(null);

  return (
    <div>
      {/* Create Deck Button */}
      <div className="mt-6">
        <Button
          className="gap-2 bg-primary hover:bg-primary-hover"
          onClick={onCreateDeck}
        >
          <Plus size={16} />
          {isVietnamese ? "Tạo Deck Mới" : "Create New Deck"}
        </Button>
      </div>

      {/* Decks List */}
      {decks.length > 0 ? (
        <div className="mt-4 space-y-4">
          {decks.map((deck) => {
            const wordCount = deckWordCounts[deck.id] || 0;
            const deckWords = wordsInDeck(deck.id);
            const isExpanded = expandedDeck === deck.id;

            return (
              <Card key={deck.id} className="dashboard-card overflow-hidden">
                <CardContent className="p-0">
                  {/* Deck Header */}
                  <div
                    className="flex cursor-pointer items-center justify-between p-4 hover:bg-surface-subtle/50"
                    onClick={() => setExpandedDeck(isExpanded ? null : deck.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/80 to-primary">
                        <Layers3 className="text-white/60" size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-[15px] font-semibold text-text-primary">
                            {deck.title}
                          </h4>
                          {deck.cefrLevel && (
                            <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-[10px] font-medium text-text-secondary">
                              {deck.cefrLevel}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-[12px] text-text-secondary">
                          <span className="flex items-center gap-1">
                            <BookOpen size={12} />
                            {wordCount} {isVietnamese ? "từ" : "words"}
                          </span>
                          {deck.totalStudied !== undefined && (
                            <span>{isVietnamese ? "Đã học" : "Studied"}: {deck.totalStudied} {isVietnamese ? "lần" : "times"}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary-hover"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeckClick(deck.id);
                        }}
                      >
                        {isVietnamese ? "Học Ngay" : "Learn Now"}
                      </Button>
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-red-50 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteDeck(deck);
                        }}
                        title={isVietnamese ? "Xóa deck" : "Delete deck"}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded: Show words in deck */}
                  {isExpanded && deckWords.length > 0 && (
                    <div className="border-t border-border bg-surface-subtle/30 p-4">
                      <p className="mb-3 text-[12px] font-medium text-text-secondary">
                        {isVietnamese ? "Từ trong deck này" : "Words in this deck"}:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {deckWords.map((item) => (
                          <span
                            key={item.id}
                            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[12px] text-primary"
                          >
                            {item.lexical_item.word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {isExpanded && deckWords.length === 0 && (
                    <div className="border-t border-border bg-surface-subtle/30 p-4">
                      <p className="text-[12px] text-text-tertiary">
                        {isVietnamese ? "Deck này chưa có từ nào. Thêm từ từ tab Vocabulary." : "This deck has no words yet. Add words from the Vocabulary tab."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-subtle">
            <Layers3 className="text-text-tertiary" size={40} />
          </div>
          <h3 className="text-[16px] font-semibold text-text-primary">
            {isVietnamese ? "Chưa có Deck nào" : "No Decks Yet"}
          </h3>
          <p className="mt-2 max-w-sm text-[14px] text-text-secondary">
            {isVietnamese ? "Tạo deck đầu tiên để bắt đầu sắp xếp từ vựng của bạn." : "Create your first deck to start organizing your vocabulary."}
          </p>
        </div>
      )}
    </div>
  );
}

interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  deckTitle: string;
  onDeckTitleChange: (value: string) => void;
  onCreate: () => void;
  isVietnamese: boolean;
}

function CreateDeckModal({
  isOpen,
  onClose,
  deckTitle,
  onDeckTitleChange,
  onCreate,
  isVietnamese,
}: CreateDeckModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl border border-border bg-surface p-6 shadow-lg">
        <h3 className="text-[16px] font-bold text-text-primary">
          {isVietnamese ? "Tạo Deck Mới" : "Create New Deck"}
        </h3>

        <div className="mt-4">
          <label className="text-[13px] font-medium text-text-secondary">
            {isVietnamese ? "Tên deck" : "Deck name"}
          </label>
          <input
            type="text"
            value={deckTitle}
            onChange={(e) => onDeckTitleChange(e.target.value)}
            placeholder={isVietnamese ? "VD: Business English, TOEIC 500..." : "E.g., Business English, TOEIC 500..."}
            className="mt-1 h-10 w-full rounded-xl border border-border bg-surface px-4 text-[14px] text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && deckTitle.trim()) {
                onCreate();
              }
            }}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {isVietnamese ? "Hủy" : "Cancel"}
          </Button>
          <Button onClick={onCreate} disabled={!deckTitle.trim()}>
            {isVietnamese ? "Tạo Deck" : "Create Deck"}
          </Button>
        </div>
      </div>
    </div>
  );
}
