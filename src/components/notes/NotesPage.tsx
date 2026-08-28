import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/dashboard/SectionHeading";
import { Icon } from "@/components/icons/icon-map";
import { Pagination } from "@/components/common/Pagination";
import { sampleNotes } from "@/data/notes-data";
import type { UserNote, NoteTargetType, CreateNoteForm } from "@/types/notes";
import { NOTE_TARGET_LABELS, NOTE_TARGET_ICONS } from "@/types/notes";

const ITEMS_PER_PAGE = 9;

function NoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  isVietnamese,
}: {
  note: UserNote;
  onEdit: (note: UserNote) => void;
  onDelete: (note: UserNote) => void;
  onTogglePin: (note: UserNote) => void;
  isVietnamese: boolean;
}) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isVietnamese ? "vi-VN" : "en-US", {
      day: "2-digit",
      month: "short",
    });
  };

  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + "...";
  };

  return (
    <div
      className={`bg-surface-subtle rounded-xl p-4 transition-all hover:shadow-md cursor-pointer group ${
        note.isPinned ? "ring-2 ring-primary" : ""
      }`}
      onClick={() => onEdit(note)}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs px-2 py-0.5 bg-primary-10 text-primary rounded-full shrink-0">
            {NOTE_TARGET_LABELS[note.targetType]}
          </span>
          {note.isPinned && (
            <Icon name="pin" size={12} className="text-primary shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(note);
            }}
            className="p-1 hover:bg-surface rounded"
          >
            <Icon
              name={note.isPinned ? "pin" : "pin"}
              size={14}
              className={note.isPinned ? "text-primary" : "text-text-tertiary"}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note);
            }}
            className="p-1 hover:bg-surface rounded text-text-tertiary hover:text-error"
          >
            <Icon name="trash-2" size={14} />
          </button>
        </div>
      </div>

      {note.title && (
        <h4 className="font-medium text-text-primary mb-1 line-clamp-1">
          {note.title}
        </h4>
      )}
      <p className="text-sm text-text-secondary line-clamp-3 whitespace-pre-wrap">
        {truncateContent(note.content)}
      </p>
      <div className="flex items-center justify-between mt-3 text-xs text-text-tertiary">
        <span>{formatDate(note.updatedAt)}</span>
      </div>
    </div>
  );
}

function NoteModal({
  note,
  onClose,
  onSave,
  isVietnamese,
}: {
  note?: UserNote;
  onClose: () => void;
  onSave: (data: CreateNoteForm & { id?: string; isPinned?: boolean }) => void;
  isVietnamese: boolean;
}) {
  const [form, setForm] = useState<CreateNoteForm>({
    title: note?.title || "",
    content: note?.content || "",
    targetType: note?.targetType || "VOCABULARY",
    targetId: note?.targetId || "",
    isPinned: note?.isPinned || false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const targetTypes: NoteTargetType[] = [
    "VOCABULARY",
    "GRAMMAR",
    "IPA",
    "PRACTICE_QUESTION",
    "LISTENING_SEGMENT",
    "SPEAKING_EXERCISE",
    "WRITING_EXERCISE",
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.content.trim()) {
      newErrors.content = isVietnamese ? "Nội dung không được để trống" : "Content cannot be empty";
    }
    if (!form.targetId.trim()) {
      newErrors.targetId = isVietnamese ? "ID mục tiêu không được để trống" : "Target ID cannot be empty";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      ...form,
      id: note?.id,
      isPinned: form.isPinned,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">
              {note ? (isVietnamese ? "Chỉnh sửa ghi chú" : "Edit Note") : (isVietnamese ? "Tạo ghi chú mới" : "Create New Note")}
            </h3>
            <button
              onClick={onClose}
              className="text-text-tertiary hover:text-text-primary"
            >
              <Icon name="x" size={20} />
            </button>
          </div>

          <div className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {isVietnamese ? "Tiêu đề (tùy chọn)" : "Title (optional)"}
              </label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={isVietnamese ? "Nhập tiêu đề ghi chú" : "Enter note title"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {isVietnamese ? "Nội dung" : "Content"} <span className="text-error">*</span>
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder={isVietnamese ? "Nhập nội dung ghi chú..." : "Enter note content..."}
                rows={6}
                className={`w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  errors.content ? "border-error" : "border-surface-subtle"
                }`}
              />
              {errors.content && (
                <p className="text-xs text-error mt-1">{errors.content}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {isVietnamese ? "Loại mục tiêu" : "Target Type"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {targetTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setForm({ ...form, targetType: type })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      form.targetType === type
                        ? "bg-primary text-white"
                        : "bg-surface-subtle text-text-secondary hover:bg-surface"
                    }`}
                  >
                    <Icon name={NOTE_TARGET_ICONS[type]} size={14} />
                    {NOTE_TARGET_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {isVietnamese ? "ID mục tiêu" : "Target ID"} <span className="text-error">*</span>
              </label>
              <Input
                value={form.targetId}
                onChange={(e) => setForm({ ...form, targetId: e.target.value })}
                placeholder={isVietnamese ? "Nhập ID của mục tiêu (VD: vocab-001)" : "Enter target ID (e.g., vocab-001)"}
                className={errors.targetId ? "border-error" : ""}
              />
              {errors.targetId && (
                <p className="text-xs text-error mt-1">{errors.targetId}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setForm({ ...form, isPinned: !form.isPinned })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  form.isPinned ? "bg-primary" : "bg-surface-subtle"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    form.isPinned ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
              <span className="text-sm text-text-secondary">
                {isVietnamese ? "Ghim ghi chú này lên đầu" : "Pin this note to top"}
              </span>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={onClose} className="flex-1">
              {isVietnamese ? "Hủy" : "Cancel"}
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              {note ? (isVietnamese ? "Lưu thay đổi" : "Save changes") : (isVietnamese ? "Tạo ghi chú" : "Create Note")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DeleteConfirmModal({
  onClose,
  onConfirm,
  isVietnamese,
}: {
  note: UserNote;
  onClose: () => void;
  onConfirm: () => void;
  isVietnamese: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <div className="w-12 h-12 bg-error-10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon name="trash-2" size={24} className="text-error" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{isVietnamese ? "Xóa ghi chú?" : "Delete Note?"}</h3>
            <p className="text-sm text-text-secondary">
              {isVietnamese ? "Bạn có chắc muốn xóa ghi chú này? Hành động này không thể hoàn tác." : "Are you sure you want to delete this note? This action cannot be undone."}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              {isVietnamese ? "Hủy" : "Cancel"}
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-error hover:bg-error-hover"
            >
              {isVietnamese ? "Xóa" : "Delete"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function NotesPage() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [notes, setNotes] = useState<UserNote[]>(sampleNotes);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<NoteTargetType | "ALL">(
    "ALL"
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNote, setEditingNote] = useState<UserNote | null>(null);
  const [deletingNote, setDeletingNote] = useState<UserNote | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const targetTypes: NoteTargetType[] = [
    "VOCABULARY",
    "GRAMMAR",
    "IPA",
    "PRACTICE_QUESTION",
    "LISTENING_SEGMENT",
    "SPEAKING_EXERCISE",
    "WRITING_EXERCISE",
  ];

  const filteredNotes = useMemo(() => {
    let result = notes.filter((note) => note.status === "ACTIVE");

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (note) =>
          note.title?.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
      );
    }

    if (selectedFilter !== "ALL") {
      result = result.filter((note) => note.targetType === selectedFilter);
    }

    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return result;
  }, [notes, searchQuery, selectedFilter]);

  const totalPages = Math.ceil(filteredNotes.length / ITEMS_PER_PAGE);
  const paginatedNotes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredNotes.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredNotes, currentPage]);

  const handleFilterChange = (filter: NoteTargetType | "ALL") => {
    setSelectedFilter(filter);
    setCurrentPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const stats = useMemo(() => {
    const activeNotes = notes.filter((n) => n.status === "ACTIVE");
    const pinnedCount = activeNotes.filter((n) => n.isPinned).length;
    const byType = targetTypes.reduce((acc, type) => {
      acc[type] = activeNotes.filter((n) => n.targetType === type).length;
      return acc;
    }, {} as Record<NoteTargetType, number>);
    return { total: activeNotes.length, pinned: pinnedCount, byType };
  }, [notes]);

  const handleSaveNote = (
    data: CreateNoteForm & { id?: string; isPinned?: boolean }
  ) => {
    if (data.id) {

      setNotes((prev) =>
        prev.map((n) =>
          n.id === data.id
            ? {
                ...n,
                title: data.title,
                content: data.content,
                targetType: data.targetType,
                targetId: data.targetId,
                isPinned: data.isPinned || false,
                updatedAt: new Date().toISOString(),
              }
            : n
        )
      );
    } else {

      const newNote: UserNote = {
        id: `note-${Date.now()}`,
        userId: "user-001",
        title: data.title,
        content: data.content,
        targetType: data.targetType,
        targetId: data.targetId,
        isPinned: data.isPinned || false,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotes((prev) => [newNote, ...prev]);
    }
  };

  const handleDeleteNote = (note: UserNote) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === note.id
          ? { ...n, status: "DELETED", updatedAt: new Date().toISOString() }
          : n
      )
    );
    setDeletingNote(null);
  };

  const handleTogglePin = (note: UserNote) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === note.id
          ? { ...n, isPinned: !n.isPinned, updatedAt: new Date().toISOString() }
          : n
      )
    );
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow={t('notes.title')}
        title={isVietnamese ? "Ghi chú cá nhân" : "Personal Notes"}
        description={isVietnamese ? "Lưu lại kiến thức và ghi chú trong quá trình học tập" : "Save knowledge and notes during your learning journey"}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-xs text-text-tertiary">{isVietnamese ? "Tổng ghi chú" : "Total notes"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">
              {stats.pinned}
            </div>
            <div className="text-xs text-text-tertiary">{isVietnamese ? "Được ghim" : "Pinned"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">
              {stats.byType["VOCABULARY"] || 0}
            </div>
            <div className="text-xs text-text-tertiary">{isVietnamese ? "Từ vựng" : "Vocabulary"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-info">
              {stats.byType["GRAMMAR"] || 0}
            </div>
            <div className="text-xs text-text-tertiary">{isVietnamese ? "Ngữ pháp" : "Grammar"}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Icon
            name="search"
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={isVietnamese ? "Tìm kiếm ghi chú..." : "Search notes..."}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Icon name="plus" size={18} />
          <span className="ml-2">{isVietnamese ? "Tạo ghi chú" : "Create Note"}</span>
        </Button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => handleFilterChange("ALL")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            selectedFilter === "ALL"
              ? "bg-primary text-white"
              : "bg-surface-subtle text-text-secondary hover:bg-surface"
          }`}
        >
          {isVietnamese ? "Tất cả" : "All"} ({stats.total})
        </button>
        {targetTypes.map((type) => (
          <button
            key={type}
            onClick={() => handleFilterChange(type)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
              selectedFilter === type
                ? "bg-primary text-white"
                : "bg-surface-subtle text-text-secondary hover:bg-surface"
            }`}
          >
            <Icon name={NOTE_TARGET_ICONS[type]} size={14} />
            {NOTE_TARGET_LABELS[type]} ({stats.byType[type] || 0})
          </button>
        ))}
      </div>

      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-surface-subtle rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="file-text" size={32} className="text-text-tertiary" />
            </div>
            <h3 className="font-medium text-text-primary mb-2">
              {searchQuery || selectedFilter !== "ALL"
                ? (isVietnamese ? "Không tìm thấy ghi chú" : "No notes found")
                : (isVietnamese ? "Chưa có ghi chú nào" : "No notes yet")}
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              {searchQuery || selectedFilter !== "ALL"
                ? (isVietnamese ? "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc" : "Try changing your search keyword or filters")
                : (isVietnamese ? "Bắt đầu tạo ghi chú đầu tiên của bạn" : "Start creating your first note")}
            </p>
            {!searchQuery && selectedFilter === "ALL" && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Icon name="plus" size={16} />
                <span className="ml-2">{isVietnamese ? "Tạo ghi chú" : "Create Note"}</span>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={setEditingNote}
                onDelete={setDeletingNote}
                onTogglePin={handleTogglePin}
                isVietnamese={isVietnamese}
              />
            ))}
          </div>

          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredNotes.length}
            />
          </div>
        </>
      )}

      {showCreateModal && (
        <NoteModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleSaveNote}
          isVietnamese={isVietnamese}
        />
      )}

      {editingNote && (
        <NoteModal
          note={editingNote}
          onClose={() => setEditingNote(null)}
          onSave={handleSaveNote}
          isVietnamese={isVietnamese}
        />
      )}

      {deletingNote && (
        <DeleteConfirmModal
          note={deletingNote}
          onClose={() => setDeletingNote(null)}
          onConfirm={() => handleDeleteNote(deletingNote)}
          isVietnamese={isVietnamese}
        />
      )}
    </main>
  );
}
