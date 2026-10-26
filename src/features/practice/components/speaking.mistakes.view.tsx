// Component giao diện Sổ tay lỗi sai & Ôn tập lặp lại ngắt quãng (SRS) cho kỹ năng Luyện nói (Speaking).

'use client'

import React, { useState, useMemo } from 'react'
import {
  Mic,
  Calendar,
  Volume2,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BookOpen,
  Filter,
  Search,
  Flame,
  Award,
  Layers,
  HelpCircle,
  Clock,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/button'
import { useSpeakingMistakesQuery } from '@/features/practice/hooks/use.mistake.query'
import { useNavigate } from '@/lib/navigation'
import type {
  SpeakingSrsDueExercise,
  SpeakingMispronouncedWord,
  SpeakingPhonemeError,
  SpeakingGrammarError,
  SpeakingContextImprovement,
} from '@/features/practice/types/mistake'

type SpeakingSubTab = 'DUE' | 'WORDS' | 'PHONEMES' | 'GRAMMAR' | 'CONTEXT'

export function SpeakingMistakesView() {
  const navigate = useNavigate()
  const { data, isLoading, refetch } = useSpeakingMistakesQuery()

  const [activeSubTab, setActiveSubTab] = useState<SpeakingSubTab>('DUE')
  const [wordSearch, setWordSearch] = useState('')
  const [playingWord, setPlayingWord] = useState<string | null>(null)
  const [showAllScheduled, setShowAllScheduled] = useState(false)

  const summary = data?.summary || {
    total_due_today: 0,
    total_scheduled: 0,
    total_mispronounced_words: 0,
    total_phoneme_errors: 0,
    total_grammar_errors: 0,
    overall_speaking_score: 0,
  }

  const dueExercises = data?.due_exercises || []
  const allScheduledExercises = data?.all_scheduled_exercises || []
  const mispronouncedWords = data?.mispronounced_words || []
  const phonemeErrors = data?.phoneme_errors || []
  const grammarErrors = data?.grammar_errors || []
  const contextImprovements = data?.context_improvements || []

  // Phát âm từ chuẩn qua Web Speech API
  const handlePlayWord = (word: string) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    utterance.rate = 0.85
    setPlayingWord(word)
    utterance.onend = () => setPlayingWord(null)
    utterance.onerror = () => setPlayingWord(null)
    window.speechSynthesis.speak(utterance)
  }

  const filteredWords = useMemo(() => {
    if (!wordSearch.trim()) return mispronouncedWords
    return mispronouncedWords.filter((w) =>
      w.word.toLowerCase().includes(wordSearch.toLowerCase())
    )
  }, [mispronouncedWords, wordSearch])

  const displayedExercises = showAllScheduled ? allScheduledExercises : dueExercises

  return (
    <div className="space-y-6">
      {/* Banner SRS Speaking */}
      <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-emerald-950/90 via-teal-900/90 to-slate-900 text-white shadow-xl">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Mic size={20} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Adaptive Speaking Remedial & Spaced Repetition (SRS SM-2)
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Sổ tay sửa lỗi phát âm & Luyện nói thích ứng
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Hệ thống tự động bóc tách các hạt nhân lỗi khi bạn nói: từ phát âm sai, lỗi âm vị IPA, lỗi ngữ pháp giao tiếp và lên lịch ôn tập SM-2 ngắt quãng theo từng bài nói cụ thể.
          </p>
        </div>

        {summary.total_due_today > 0 && (
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <div className="px-3.5 py-1.5 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-bold flex items-center gap-1.5">
              <Calendar size={14} className="text-rose-400" />
              <span>{summary.total_due_today} bài nói đến hạn ôn tập hôm nay!</span>
            </div>
            {dueExercises.length > 0 && (
              <Button
                onClick={() => navigate(`/speaking?exercise_id=${dueExercises[0].exercise_id}`)}
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/30 gap-2 cursor-pointer"
              >
                <RotateCcw size={16} />
                <span>Bắt đầu luyện ngay ({summary.total_due_today})</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
            <Calendar size={14} />
            <span>Cần ôn hôm nay</span>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {summary.total_due_today}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
            <Volume2 size={14} />
            <span>Từ sai âm</span>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {summary.total_mispronounced_words}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-medium">
            <Layers size={14} />
            <span>Âm vị IPA yếu</span>
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {summary.total_phoneme_errors}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
            <AlertTriangle size={14} />
            <span>Lỗi ngữ pháp nói</span>
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {summary.total_grammar_errors}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <Award size={14} />
            <span>Điểm nói TB</span>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {summary.overall_speaking_score > 0 ? `${summary.overall_speaking_score}/100` : '--'}
          </div>
        </div>
      </div>

      {/* Sub Tabs Selection */}
      <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-surface border border-border">
        <button
          type="button"
          onClick={() => setActiveSubTab('DUE')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'DUE'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-surface-secondary text-text-secondary hover:bg-surface-hover'
          }`}
        >
          <Calendar size={14} />
          <span>Bài nói cần ôn ({dueExercises.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('WORDS')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'WORDS'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-surface-secondary text-text-secondary hover:bg-surface-hover'
          }`}
        >
          <Volume2 size={14} />
          <span>Từ phát âm sai ({mispronouncedWords.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('PHONEMES')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'PHONEMES'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-surface-secondary text-text-secondary hover:bg-surface-hover'
          }`}
        >
          <Layers size={14} />
          <span>Lỗi âm vị IPA ({phonemeErrors.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('GRAMMAR')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'GRAMMAR'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-surface-secondary text-text-secondary hover:bg-surface-hover'
          }`}
        >
          <AlertTriangle size={14} />
          <span>Lỗi ngữ pháp khi nói ({grammarErrors.length})</span>
        </button>

        {contextImprovements.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveSubTab('CONTEXT')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'CONTEXT'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-surface-secondary text-text-secondary hover:bg-surface-hover'
            }`}
          >
            <Sparkles size={14} />
            <span>Ngữ cảnh yếu ({contextImprovements.length})</span>
          </button>
        )}
      </div>

      {/* Subtab Content */}
      <div className="space-y-4">
        {/* TAB 1: DUE EXERCISES */}
        {activeSubTab === 'DUE' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 px-1">
              <p className="text-xs text-text-secondary">
                Lịch nhắc lại ngắt quãng dựa trên SM-2: Điểm cao kéo dài khoảng cách ôn, điểm thấp kích hoạt ôn lại sớm.
              </p>
              <button
                type="button"
                onClick={() => setShowAllScheduled(!showAllScheduled)}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {showAllScheduled ? 'Chỉ xem bài đến hạn hôm nay' : `Xem tất cả bài có lịch (${allScheduledExercises.length})`}
              </button>
            </div>

            {displayedExercises.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 p-8 rounded-3xl bg-surface border border-border">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-base font-bold text-text-primary">
                  {showAllScheduled
                    ? 'Bạn chưa có bài nói nào trong danh sách Spaced Repetition'
                    : 'Tuyệt vời! Không có bài nói nào đến hạn ôn tập hôm nay!'}
                </h3>
                <p className="text-xs text-text-secondary max-w-md">
                  Khi bạn thực hành các bài tập nói trong khu vực Luyện nói, hệ thống sẽ tự động lập lịch lặp lại ngắt quãng để đảm bảo bạn nhớ lâu và hoàn thiện phát âm.
                </p>
                <Button
                  onClick={() => navigate('/speaking')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl gap-2 font-bold mt-2 cursor-pointer"
                >
                  <Mic size={16} />
                  <span>Đến phòng Luyện nói</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {displayedExercises.map((ex) => (
                  <div
                    key={ex.srs_id}
                    className="p-5 rounded-2xl bg-surface border border-border hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                          {ex.exercise_type}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-surface-secondary text-text-tertiary text-[11px] font-bold">
                          {ex.cefr_level}
                        </span>
                        {ex.is_due ? (
                          <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-bold">
                            Đến hạn ôn tập
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-lg bg-surface-secondary text-text-tertiary text-[11px] font-medium">
                            Chu kỳ {ex.interval_days} ngày
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-base text-text-primary">
                        {ex.title}
                      </h4>

                      {ex.prompt_text_en && (
                        <p className="text-xs text-text-secondary line-clamp-2 italic">
                          &ldquo;{ex.prompt_text_en}&rdquo;
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-text-tertiary pt-1">
                        {ex.last_score != null && (
                          <span className="flex items-center gap-1 font-semibold text-text-secondary">
                            Điểm lần trước:{' '}
                            <strong className={(ex.last_score ?? 0) >= 75 ? 'text-emerald-600' : 'text-amber-600'}>
                              {ex.last_score}/100
                            </strong>
                          </span>
                        )}
                        <span>Lần ôn đúng: {ex.repetitions}</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <Button
                        onClick={() => navigate(`/speaking?exercise_id=${ex.exercise_id}`)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
                      >
                        <Mic size={16} />
                        <span>Luyện nói lại</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MISPRONOUNCED WORDS */}
        {activeSubTab === 'WORDS' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-text-secondary">
                Tổng hợp các từ bạn từng phát âm chưa chuẩn trong các bài nói gần nhất. Bấm loa để nghe mẫu US bản ngữ.
              </p>
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  placeholder="Tìm từ phát âm sai..."
                  value={wordSearch}
                  onChange={(e) => setWordSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface-secondary border border-border text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {filteredWords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 p-8 rounded-3xl bg-surface border border-border">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-base font-bold text-text-primary">
                  {wordSearch ? 'Không tìm thấy từ phù hợp' : 'Chưa ghi nhận từ phát âm sai'}
                </h3>
                <p className="text-xs text-text-secondary max-w-md">
                  Khi bạn nói chưa chuẩn một từ trong bài tập, AI sẽ tự động ghi nhận tại đây kèm theo phiên âm đối chiếu.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredWords.map((item, idx) => (
                  <div
                    key={`${item.word}-${idx}`}
                    className="p-4 rounded-2xl bg-surface border border-border space-y-3 hover:border-amber-500/40 transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-text-primary tracking-tight">
                          {item.word}
                        </span>
                        <button
                          type="button"
                          onClick={() => handlePlayWord(item.word)}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            playingWord === item.word
                              ? 'bg-emerald-600 text-white animate-pulse'
                              : 'bg-surface-secondary text-text-secondary hover:text-emerald-600'
                          }`}
                          title="Nghe phát âm chuẩn US"
                        >
                          <Volume2 size={16} />
                        </button>
                      </div>

                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold">
                        Sai {item.count} lần
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {item.phonetic_expected && (
                        <div className="flex items-center gap-2 text-text-secondary">
                          <span className="text-text-tertiary">Chuẩn:</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                            {item.phonetic_expected}
                          </span>
                        </div>
                      )}
                      {item.phonetic_actual && (
                        <div className="flex items-center gap-2 text-text-secondary">
                          <span className="text-text-tertiary">Bạn đọc:</span>
                          <span className="font-mono text-rose-500 font-semibold line-through">
                            {item.phonetic_actual}
                          </span>
                        </div>
                      )}
                      {item.last_exercise_title && (
                        <p className="text-[11px] text-text-tertiary truncate">
                          Bài: {item.last_exercise_title}
                        </p>
                      )}
                    </div>

                    <div className="pt-1 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => navigate('/practice/ipa')}
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Luyện trong Bảng IPA</span>
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PHONEMES */}
        {activeSubTab === 'PHONEMES' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 px-1">
              <p className="text-xs text-text-secondary">
                Các âm vị IPA học viên hay bị lệch hoặc chưa thuần thục theo hồ sơ năng lực 44 âm.
              </p>
              <Button
                onClick={() => navigate('/practice/ipa')}
                variant="outline"
                size="sm"
                className="rounded-xl text-xs gap-1.5 cursor-pointer font-bold border-purple-500/30 text-purple-600 dark:text-purple-400"
              >
                <span>Mở Bảng 44 âm IPA</span>
                <ExternalLink size={12} />
              </Button>
            </div>

            {phonemeErrors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 p-8 rounded-3xl bg-surface border border-border">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-base font-bold text-text-primary">
                  Tuyệt vời! Không phát hiện lỗi âm vị cố hữu
                </h3>
                <p className="text-xs text-text-secondary max-w-md">
                  Năng lực phát âm các nguyên âm và phụ âm IPA của bạn đang duy trì ở mức tốt.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {phonemeErrors.map((pe, idx) => (
                  <div
                    key={`${pe.phoneme}-${idx}`}
                    className="p-4 rounded-2xl bg-surface border border-border space-y-3 hover:border-purple-500/40 transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono font-black text-xl flex items-center justify-center border border-purple-500/20">
                          {pe.phoneme}
                        </span>
                        <div>
                          <h4 className="font-bold text-sm text-text-primary">
                            Âm vị {pe.phoneme}
                          </h4>
                          <span className="text-[11px] text-text-tertiary">
                            Lỗi phát âm: {pe.speaking_error_count} lần
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          pe.status === 'CRITICAL'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {pe.status === 'CRITICAL' ? 'Báo động' : 'Cần rèn'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-tertiary">Độ thành thục:</span>
                        <span className="font-bold text-text-primary">{pe.mastery_score}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface-secondary overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full transition-all"
                          style={{ width: `${Math.max(5, pe.mastery_score)}%` }}
                        />
                      </div>
                    </div>

                    {pe.top_substitution && (
                      <div className="p-2.5 rounded-xl bg-surface-secondary text-xs text-text-secondary flex items-start gap-1.5">
                        <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <span>
                          Hay nhầm lẫn thành:{' '}
                          <strong className="font-mono text-text-primary">{pe.top_substitution}</strong>
                        </span>
                      </div>
                    )}

                    <div className="pt-1">
                      <Button
                        onClick={() => navigate('/practice/ipa')}
                        variant="outline"
                        size="sm"
                        className="w-full rounded-xl text-xs font-bold gap-1 cursor-pointer"
                      >
                        <span>Luyện âm {pe.phoneme} ngay</span>
                        <ArrowRight size={12} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SPOKEN GRAMMAR */}
        {activeSubTab === 'GRAMMAR' && (
          <div className="space-y-4">
            <p className="text-xs text-text-secondary px-1">
              Các lỗi ngữ pháp trong lời nói tự nhiên của bạn được AI phát hiện kèm phương án chỉnh sửa chuẩn xác.
            </p>

            {grammarErrors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 p-8 rounded-3xl bg-surface border border-border">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-base font-bold text-text-primary">
                  Không ghi nhận lỗi ngữ pháp nói nghiêm trọng!
                </h3>
                <p className="text-xs text-text-secondary max-w-md">
                  Cấu trúc câu và ngữ pháp trong các bài nói gần đây của bạn được áp dụng chính xác và tự nhiên.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {grammarErrors.map((ge, idx) => (
                  <div
                    key={`grammar-err-${idx}`}
                    className="p-5 rounded-2xl bg-surface border border-border space-y-3 hover:border-blue-500/40 transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-bold">
                        {ge.error_category}
                      </span>
                      {ge.exercise_title && (
                        <span className="text-[11px] text-text-tertiary truncate">
                          Bài: {ge.exercise_title}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-1">
                        <span className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400">
                          Câu bạn nói (Cần sửa):
                        </span>
                        <p className="font-semibold text-rose-700 dark:text-rose-300">
                          &ldquo;{ge.original_phrase}&rdquo;
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                        <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Sparkles size={11} />
                          <span>Câu sửa mẫu chuẩn:</span>
                        </span>
                        <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                          &ldquo;{ge.corrected_phrase}&rdquo;
                        </p>
                      </div>
                    </div>

                    {ge.rule_violated_vi && (
                      <p className="text-xs text-text-secondary leading-relaxed bg-surface-secondary p-2.5 rounded-xl border border-border">
                        <strong>Quy tắc cần nhớ:</strong> {ge.rule_violated_vi}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: CONTEXT IMPROVEMENTS */}
        {activeSubTab === 'CONTEXT' && (
          <div className="space-y-4">
            <p className="text-xs text-text-secondary px-1">
              Các ngữ cảnh giao tiếp mà kết quả phản xạ và điểm nói của bạn còn dưới mức tối ưu (dưới 75 điểm).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {contextImprovements.map((ci) => (
                <div
                  key={ci.context_id}
                  className="p-4 rounded-2xl bg-surface border border-border space-y-3 hover:border-teal-500/40 transition-all shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-text-primary">
                      {ci.context_name}
                    </h4>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold">
                      {ci.avg_score}/100
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary">
                    Đã thực hành {ci.attempts} lượt. Cần trau dồi thêm từ vựng và câu phản xạ theo ngữ cảnh này.
                  </p>

                  <Button
                    onClick={() => navigate(`/speaking`)}
                    size="sm"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold gap-1 cursor-pointer"
                  >
                    <span>Luyện chủ đề này</span>
                    <ArrowRight size={12} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
