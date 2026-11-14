'use client'

/**
 * @file add.saved.words.to.deck.modal.tsx
 * @description Modal đóng gói các từ vựng đã chọn từ Sổ tay vào Bộ thẻ Flashcard (Min 5 từ, Max 30 từ)
 */

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Layers3,
  Plus,
  Check,
  AlertCircle,
  Sparkles,
  Loader2,
  Trash2,
  Lock,
  Globe,
  Share2,
  Copy,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import { Modal } from '@/components/modal'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { useNavigate } from '@/lib/navigation'
import { useApp } from '@/contexts/app.context'
import { vocabularyService } from '@/features/vocabulary/services/vocabulary.service'
import type { Deck } from '@/features/vocabulary/schemas/vocabulary.schema'
import type { SpeakingVocabularySource } from '../types/vocabulary-source'

export const MIN_DECK_WORDS = 5
export const MAX_DECK_WORDS = 30

export interface SavedWordItem {
  speaking_sources?: SpeakingVocabularySource[]
  saved_id: string
  lexical_item_id: string
  word: string
  ipa?: string
  meaning_index: number
  meaning: string
  examples?: Array<{ en: string; vi?: string }>
}

interface AddSavedWordsToDeckModalProps {
  isOpen: boolean
  onClose: () => void
  selectedWords: SavedWordItem[]
  existingDecks: Deck[]
  userId?: string
  onSuccess: (removedWordIds: string[]) => void
}

export function AddSavedWordsToDeckModal({
  isOpen,
  onClose,
  selectedWords,
  existingDecks,
  userId,
  onSuccess,
}: AddSavedWordsToDeckModalProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const { showAction } = useApp()
  const navigate = useNavigate()

  const queryClient = useQueryClient()
  const [mode, setMode] = useState<'create' | 'existing'>('create')
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null)
  const [deckName, setDeckName] = useState('')
  const [deckDescription, setDeckDescription] = useState('')
  const [targetBand, setTargetBand] = useState('500-650')
  const [visibility, setVisibility] = useState<'PRIVATE' | 'PUBLIC'>('PRIVATE') // Mặc định: Riêng tư
  const [removeChoice, setRemoveChoice] = useState<boolean | null>(null)
  const hasSpeakingSources = selectedWords.some(word => word.speaking_sources?.length)
  const removeAfterAdd = removeChoice ?? !hasSpeakingSources
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [createdSuccess, setCreatedSuccess] = useState<{
    deckId: string
    deckName: string
    visibility: 'PRIVATE' | 'PUBLIC'
    removedIds: string[]
  } | null>(null)

  const selectedCount = selectedWords.length
  const isMinSatisfied = selectedCount >= MIN_DECK_WORDS
  const isMaxSatisfied = selectedCount <= MAX_DECK_WORDS

  // Tìm deck đang chọn để kiểm tra giới hạn 30 thẻ
  const targetExistingDeck = existingDecks.find((d) => (d._id || d.id) === selectedDeckId)
  const currentDeckCount = targetExistingDeck?.card_count || 0
  const isExistingDeckOverflow = mode === 'existing' && targetExistingDeck && (currentDeckCount + selectedCount > MAX_DECK_WORDS)

  const canSubmit =
    !isSubmitting &&
    isMinSatisfied &&
    isMaxSatisfied &&
    (mode === 'create' ? deckName.trim().length > 0 : Boolean(selectedDeckId) && !isExistingDeckOverflow)

  const handleClose = () => {
    if (isSubmitting) return
    setDeckName('')
    setDeckDescription('')
    setSelectedDeckId(null)
    setMode('create')
    setVisibility('PRIVATE')
    setCreatedSuccess(null)
    setIsCopied(false)
    setRemoveChoice(null)
    onClose()
  }

  const handleSubmit = async () => {
    if (!canSubmit) return

    try {
      setIsSubmitting(true)
      const payload = {
        deck_id: mode === 'existing' ? selectedDeckId || undefined : undefined,
        name: mode === 'create' ? deckName.trim() : undefined,
        description: mode === 'create' ? deckDescription.trim() : undefined,
        visibility, settings: { target_band: targetBand },
        words: selectedWords.map(word => ({ lexical_item_id: word.lexical_item_id, meaning_index: word.meaning_index })),
        remove_after_add: removeAfterAdd,
      };
      const storageKey = `vocabulary-package:${userId}`;
      const fingerprint = JSON.stringify(payload);
      let prior: { fingerprint: string; key: string } | null = null;
      try { prior = JSON.parse(sessionStorage.getItem(storageKey) || 'null'); } catch {}
      const operation = prior?.fingerprint === fingerprint ? prior : { fingerprint, key: crypto.randomUUID() };
      sessionStorage.setItem(storageKey, JSON.stringify(operation));
      const result = await vocabularyService.packageSavedWords({ ...payload, operation_id: operation.key });
      await queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
      const targetDeckId = result.deck_id;
      const removedIds = result.removed_ids;
      sessionStorage.removeItem(storageKey);

      if (mode === 'create') {
        setCreatedSuccess({
          deckId: targetDeckId,
          deckName: deckName.trim(),
          visibility,
          removedIds,
        })
      } else {
        showAction(
          isVietnamese
            ? `🎉 Đã thêm thành công ${selectedCount} từ vào bộ thẻ ${removeAfterAdd ? 'và dọn dẹp khỏi sổ tay' : ''}!`
            : `🎉 Successfully added ${selectedCount} words to deck ${removeAfterAdd ? 'and cleaned from notebook' : ''}!`
        )
        onSuccess(removedIds)
        handleClose()
      }
    } catch (err: unknown) {
      console.error('Lỗi thêm từ vào bộ thẻ:', err)
      showAction(isVietnamese ? 'Thêm từ vào bộ thẻ thất bại. Vui lòng thử lại!' : 'Failed to add words to deck. Try again!')
    } finally {
      setIsSubmitting(false)
    }
  }

  const shareUrl = createdSuccess
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/vocabulary/learn/${createdSuccess.deckId}`
    : ''

  const handleCopyLink = async () => {
    if (!shareUrl) return
    try { await navigator.clipboard.writeText(shareUrl) } catch { showAction(isVietnamese ? 'Không sao chép được liên kết.' : 'Unable to copy link.'); return }
    setIsCopied(true)
    showAction(isVietnamese ? 'Đã sao chép liên kết bộ thẻ vào bộ nhớ tạm!' : 'Copied link to clipboard!')
    setTimeout(() => setIsCopied(false), 2500)
  }

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title={
        createdSuccess
          ? isVietnamese ? '🎉 Bộ thẻ đã sẵn sàng!' : '🎉 Deck is Ready!'
          : isVietnamese ? 'Đóng gói vào Bộ thẻ Flashcard' : 'Package into Flashcard Deck'
      }
      size="lg"
      footer={
        createdSuccess ? null : (
          <div className="flex w-full items-center justify-between">
            <span className="text-[12px] font-medium text-text-tertiary">
              {isVietnamese ? `Đã chọn: ${selectedCount} từ` : `Selected: ${selectedCount} words`}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                {isVietnamese ? 'Hủy' : 'Cancel'}
              </Button>
              <Button
                className="gap-2 bg-primary hover:bg-primary-hover shadow-sm"
                onClick={handleSubmit}
                disabled={!canSubmit}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{isVietnamese ? 'Đang xử lý...' : 'Processing...'}</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>
                      {mode === 'create'
                        ? isVietnamese ? `Tạo bộ thẻ & thêm ${selectedCount} từ` : `Create deck & add ${selectedCount} words`
                        : isVietnamese ? `Thêm ${selectedCount} từ vào bộ thẻ` : `Add ${selectedCount} words to deck`}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )
      }
    >
      {createdSuccess ? (
        <div className="space-y-4 py-1 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={32} />
          </div>

          <div>
            <h3 className="text-[17px] font-bold text-text-primary">
              {isVietnamese ? 'Tạo bộ thẻ thành công!' : 'Deck Created Successfully!'}
            </h3>
            <p className="mt-1 text-[13px] text-text-secondary">
              {isVietnamese
                ? `Đã thêm ${selectedCount} từ vào bộ thẻ "${createdSuccess.deckName}"`
                : `Added ${selectedCount} words to "${createdSuccess.deckName}"`}
            </p>
            <div className="mt-2.5 flex justify-center">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
                  createdSuccess.visibility === 'PUBLIC'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-primary/10 text-primary'
                }`}
              >
                {createdSuccess.visibility === 'PUBLIC' ? <Globe size={13} /> : <Lock size={13} />}
                <span>
                  {createdSuccess.visibility === 'PUBLIC'
                    ? isVietnamese ? 'Chế độ Công khai (Public)' : 'Public Deck'
                    : isVietnamese ? 'Chế độ Riêng tư (Private)' : 'Private Deck'}
                </span>
              </span>
            </div>
          </div>

          {/* Khung link chia sẻ trực tiếp */}
          <div className="rounded-2xl border border-border bg-surface-subtle p-3.5 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-bold text-text-primary flex items-center gap-1.5">
                <Share2 size={13} className="text-primary" />
                {isVietnamese ? 'Liên kết trực tiếp tới bộ thẻ' : 'Direct link to deck'}
              </span>
              <span className="text-[11px] text-text-tertiary">
                {createdSuccess.visibility === 'PUBLIC'
                  ? isVietnamese ? 'Người khác có thể mở link để học' : 'Anyone with link can study'
                  : isVietnamese ? 'Chỉ bạn có thể mở học' : 'Only you can study'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={shareUrl}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-[12px] text-text-secondary font-mono select-all focus:outline-none"
              />
              <Button
                size="sm"
                variant={isCopied ? 'default' : 'outline'}
                className="shrink-0 gap-1.5 text-[12px]"
                onClick={handleCopyLink}
              >
                {isCopied ? <Check size={14} /> : <Copy size={14} />}
                <span>{isCopied ? (isVietnamese ? 'Đã sao chép' : 'Copied') : (isVietnamese ? 'Sao chép link' : 'Copy Link')}</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/70">
            <Button
              variant="outline"
              onClick={() => {
                onSuccess(createdSuccess.removedIds)
                handleClose()
              }}
            >
              {isVietnamese ? 'Hoàn tất & Đóng' : 'Done & Close'}
            </Button>
            <Button
              className="gap-1.5 bg-primary hover:bg-primary-hover shadow-sm"
              onClick={() => {
                onSuccess(createdSuccess.removedIds)
                handleClose()
                navigate(`/vocabulary/learn/${createdSuccess.deckId}`)
              }}
            >
              <ExternalLink size={14} />
              <span>{isVietnamese ? 'Vào học ngay' : 'Study Now'}</span>
            </Button>
          </div>
        </div>
      ) : (
      <div className="space-y-4">
        {/* BANNER THÔNG BÁO QUY TẮC MIN / MAX */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5">
          <div className="flex items-start gap-2.5">
            <Sparkles size={18} className="shrink-0 text-primary mt-0.5" />
            <div className="text-[12px] text-text-secondary">
              <p className="font-bold text-text-primary">
                {isVietnamese ? 'Quy tắc bộ thẻ hiệu quả (SRS Chunking):' : 'Effective Deck Chunking:'}
              </p>
              <p className="mt-0.5">
                {isVietnamese
                  ? `Mỗi bộ thẻ cần tối thiểu ${MIN_DECK_WORDS} từ và tối đa ${MAX_DECK_WORDS} từ để tối ưu hóa khả năng ghi nhớ dài hạn mà không gây quá tải nhận thức.`
                  : `Each deck requires min ${MIN_DECK_WORDS} words and max ${MAX_DECK_WORDS} words to optimize memory retention without cognitive overload.`}
              </p>
            </div>
          </div>
        </div>

        {/* CẢNH BÁO NẾU CHƯA ĐỦ 5 TỪ HOẶC VƯỢT 30 TỪ */}
        {!isMinSatisfied && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 p-3 text-[12px] font-semibold text-amber-600 dark:text-amber-400">
            <AlertCircle size={16} className="shrink-0" />
            <span>
              {isVietnamese
                ? `Cần chọn ít nhất ${MIN_DECK_WORDS} từ để tạo bộ thẻ (hiện tại: ${selectedCount}/${MIN_DECK_WORDS} từ).`
                : `Please select at least ${MIN_DECK_WORDS} words to create a deck (current: ${selectedCount}/${MIN_DECK_WORDS}).`}
            </span>
          </div>
        )}

        {/* TABS CHUYỂN ĐỔI: TẠO BỘ MỚI HOẶC CHỌN BỘ CÓ SẴN */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface-subtle p-1">
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-[13px] font-bold transition ${
              mode === 'create'
                ? 'bg-surface text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Plus size={15} />
            <span>{isVietnamese ? 'Tạo bộ thẻ mới' : 'Create New Deck'}</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('existing')}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-[13px] font-bold transition ${
              mode === 'existing'
                ? 'bg-surface text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Layers3 size={15} />
            <span>{isVietnamese ? 'Chọn bộ thẻ có sẵn' : 'Existing Deck'}</span>
          </button>
        </div>

        {/* FORM 1: TẠO BỘ THẺ MỚI */}
        {mode === 'create' && (
          <div className="space-y-3 rounded-2xl border border-border p-4">
            <div>
              <label className="mb-1 block text-[12px] font-bold text-text-primary">
                {isVietnamese ? 'Tên bộ thẻ *' : 'Deck Name *'}
              </label>
              <Input
                placeholder={isVietnamese ? 'VD: Từ vựng TOEIC Part 7 tuần 1...' : 'E.g: TOEIC Part 7 Week 1...'}
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                maxLength={60}
                className="w-full"
              />
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-bold text-text-primary">
                {isVietnamese ? 'Mô tả bộ thẻ (tùy chọn)' : 'Description (optional)'}
              </label>
              <Input
                placeholder={isVietnamese ? 'VD: Các từ hay gặp trong hợp đồng...' : 'E.g: Common contract terms...'}
                value={deckDescription}
                onChange={(e) => setDeckDescription(e.target.value)}
                maxLength={120}
                className="w-full"
              />
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-bold text-text-primary">
                {isVietnamese ? 'Mục tiêu điểm số (Target Band)' : 'Target Band'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['350-500', '500-650', '650-800', '800-990'].map((band) => (
                  <button
                    key={band}
                    type="button"
                    onClick={() => setTargetBand(band)}
                    className={`rounded-xl py-1.5 text-[11px] font-bold transition ${
                      targetBand === band
                        ? 'bg-primary text-white shadow-sm ring-2 ring-primary/30'
                        : 'bg-surface-subtle text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                    }`}
                  >
                    {band}
                  </button>
                ))}
              </div>
            </div>

            {/* CHỌN QUYỀN RIÊNG TƯ / CÔNG KHAI */}
            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-text-primary">
                {isVietnamese ? 'Quyền riêng tư (Mặc định: Riêng tư)' : 'Privacy (Default: Private)'}
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setVisibility('PRIVATE')}
                  className={`flex items-start gap-2.5 rounded-xl border p-2.5 text-left transition ${
                    visibility === 'PRIVATE'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border bg-surface hover:border-primary/40'
                  }`}
                >
                  <Lock
                    size={16}
                    className={`mt-0.5 shrink-0 ${
                      visibility === 'PRIVATE' ? 'text-primary' : 'text-text-tertiary'
                    }`}
                  />
                  <div>
                    <span className="block text-[12px] font-bold text-text-primary">
                      {isVietnamese ? 'Riêng tư (Chỉ mình tôi)' : 'Private (Only me)'}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-text-tertiary leading-tight">
                      {isVietnamese
                        ? 'Chỉ bạn mới có thể thấy và học bộ thẻ này'
                        : 'Only you can view and study'}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setVisibility('PUBLIC')}
                  className={`flex items-start gap-2.5 rounded-xl border p-2.5 text-left transition ${
                    visibility === 'PUBLIC'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border bg-surface hover:border-primary/40'
                  }`}
                >
                  <Globe
                    size={16}
                    className={`mt-0.5 shrink-0 ${
                      visibility === 'PUBLIC' ? 'text-primary' : 'text-text-tertiary'
                    }`}
                  />
                  <div>
                    <span className="block text-[12px] font-bold text-text-primary">
                      {isVietnamese ? 'Công khai (Chia sẻ)' : 'Public (Shared)'}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-text-tertiary leading-tight">
                      {isVietnamese
                        ? 'Chia sẻ lên cộng đồng và gửi link cho mọi người'
                        : 'Share to community & direct link'}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FORM 2: CHỌN BỘ THẺ CÓ SẴN CỦA USER */}
        {mode === 'existing' && (
          <div className="space-y-3">
            {existingDecks.length > 0 ? (
              <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
                {existingDecks.map((deck, idx) => {
                  const deckId = deck._id || deck.id || ''
                  const isSelected = selectedDeckId === deckId
                  const count = deck.card_count || 0
                  const isFull = count >= MAX_DECK_WORDS
                  const wouldOverflow = count + selectedCount > MAX_DECK_WORDS

                  return (
                    <button
                      key={deckId || idx}
                      type="button"
                      disabled={isFull || wouldOverflow || !deckId}
                      onClick={() => deckId && setSelectedDeckId(deckId)}
                      className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : isFull || wouldOverflow
                          ? 'opacity-50 cursor-not-allowed border-border/50 bg-surface-subtle'
                          : 'border-border hover:border-primary/50 bg-surface'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Layers3 size={18} className={isSelected ? 'text-primary' : 'text-text-tertiary'} />
                        <div>
                          <span className="block text-[13px] font-bold text-text-primary">
                            {(isVietnamese && deck.name_vi) ? deck.name_vi : deck.name}
                          </span>
                          <span className="block text-[11px] text-text-tertiary">
                            {count}/{MAX_DECK_WORDS} {isVietnamese ? 'thẻ' : 'cards'}
                            {wouldOverflow && !isFull && (
                              <span className="ml-2 font-semibold text-rose-500">
                                {isVietnamese ? `(Còn trống ${MAX_DECK_WORDS - count} chỗ)` : `(${MAX_DECK_WORDS - count} slots left)`}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      {isSelected && <Check size={18} className="text-primary" />}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-4 text-center text-[13px] text-text-secondary">
                {isVietnamese
                  ? 'Bạn chưa có bộ thẻ cá nhân nào. Hãy chuyển sang tab "Tạo bộ thẻ mới" bên trên!'
                  : 'No personal decks found. Please switch to "Create New Deck" tab above!'}
              </div>
            )}
          </div>
        )}

        {/* Keep Speaking source links by default; the learner can still choose removal. */}
        <div className="rounded-2xl border border-border bg-surface-subtle p-3.5">
          {hasSpeakingSources && <p className="mb-2 text-xs text-text-secondary">{isVietnamese ? 'Các từ này có nguồn từ bài Speaking. Mặc định giữ trong Sổ tay để bạn quay lại nghe lỗi gốc; chọn xóa sẽ gỡ các liên kết này khỏi Sổ tay.' : 'These words have Speaking sources. They stay in your notebook by default so you can replay the original mistakes; removal also removes those notebook links.'}</p>}
          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={removeAfterAdd}
              onChange={(e) => setRemoveChoice(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <div className="text-[12px]">
              <span className="font-bold text-text-primary flex items-center gap-1.5">
                <Trash2 size={13} className="text-rose-500" />
                {isVietnamese
                  ? 'Xóa các từ này khỏi Sổ tay sau khi thêm vào bộ thẻ'
                  : 'Remove these words from Notebook after adding to deck'}
              </span>
              <p className="mt-0.5 text-text-tertiary text-[11px]">
                {isVietnamese
                  ? 'Dọn dẹp sổ tay để tập trung ôn luyện các từ này bằng Flashcard & thuật toán SRS.'
                  : 'Clean your notebook to focus on practicing these words via Flashcards & SRS.'}
              </p>
            </div>
          </label>
        </div>
      </div>
      )}
    </Modal>
  )
}
