/**
 * @file vocabulary.dashboard.view.tsx
 * @description Màn hình giao diện Vocabulary Intelligence Dashboard - Báo cáo phân tích trí nhớ và tiến bộ từ vựng
 */

'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@/lib/navigation'
import {
  Brain,
  Layers3,
  Calendar,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Award,
  Sparkles,
  Volume2,
  CheckCircle2,
  Activity,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Target,
  Zap,
  Play,
} from 'lucide-react'
import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import { useVocabularyDashboard } from '../hooks/use.vocabulary.dashboard'

export interface VocabularyDashboardViewProps {
  isEmbedded?: boolean
}

export function VocabularyDashboardView({ isEmbedded = false }: VocabularyDashboardViewProps) {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useVocabularyDashboard()

  const [playingWord, setPlayingWord] = useState<string | null>(null)

  const speakWord = (word: string) => {
    if (!word || typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    utterance.rate = 0.9
    setPlayingWord(word)
    utterance.onend = () => setPlayingWord(null)
    utterance.onerror = () => setPlayingWord(null)
    window.speechSynthesis.speak(utterance)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-text-secondary">
          {isVietnamese ? 'Đang phân tích dữ liệu trí nhớ từ vựng...' : 'Analyzing memory retention data...'}
        </p>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
        <AlertTriangle className="h-10 w-10 text-rose-500" />
        <h3 className="text-base font-bold text-text-primary">
          {isVietnamese ? 'Không thể tải báo cáo từ vựng' : 'Failed to load vocabulary analytics'}
        </h3>
        <p className="max-w-md text-xs text-text-secondary">
          {isVietnamese ? 'Vui lòng kiểm tra lại kết nối và thử lại.' : 'Please check your connection and retry.'}
        </p>
        <Button onClick={() => refetch()} variant="outline" className="gap-2">
          <RotateCcw size={14} />
          <span>{isVietnamese ? 'Thử lại' : 'Retry'}</span>
        </Button>
      </div>
    )
  }

  const { summary, memory_strength, cefr_breakdown, activity_30d, top_weak_words } = data

  const retentionStatus =
    summary.retention_rate_30d >= 85
      ? { text: isVietnamese ? 'Xuất sắc' : 'Excellent', color: 'text-emerald-500 bg-emerald-500/10' }
      : summary.retention_rate_30d >= 70
      ? { text: isVietnamese ? 'Ổn định' : 'Good', color: 'text-blue-500 bg-blue-500/10' }
      : { text: isVietnamese ? 'Cần củng cố' : 'Needs Focus', color: 'text-amber-500 bg-amber-500/10' }

  return (
    <div className={`w-full space-y-6 ${isEmbedded ? 'pb-4' : 'pb-12'}`}>
      {/* 1. TOP HEADER & QUICK ACTIONS */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-5">
        <div className="space-y-1">
          {!isEmbedded && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/vocabulary')}
                className="gap-1.5 px-2 text-text-secondary hover:text-text-primary"
              >
                <ArrowLeft size={16} />
                <span>{isVietnamese ? 'Kho từ vựng' : 'Vocabulary'}</span>
              </Button>
              <span className="text-xs font-semibold text-text-tertiary">/</span>
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                Intelligence Analytics
              </span>
            </div>
          )}
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-text-primary flex items-center gap-2.5">
            <Brain className="h-6 w-6 text-primary" />
            <span>
              {isVietnamese ? 'Tiến độ & Phân tích Trí nhớ Từ vựng (SRS)' : 'Vocabulary Retention & SRS Intelligence'}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary max-w-2xl">
            {isVietnamese
              ? 'Đo lường năng lực ghi nhớ thực tế theo thuật toán Spaced Repetition (SRS), tỷ lệ lưu giữ và sự chuyển hóa từ vựng dài hạn.'
              : 'Track true memory retention with Spaced Repetition (SRS), long-term vocabulary stability, and learning improvements.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {isEmbedded && (
            <Button
              onClick={() => navigate('/vocabulary')}
              className="gap-2 bg-primary hover:bg-primary-hover text-white font-bold shadow-xs cursor-pointer"
            >
              <Play size={14} fill="currentColor" />
              <span>{isVietnamese ? 'Vào học từ vựng' : 'Study Vocabulary'}</span>
            </Button>
          )}

          {summary.due_today_count > 0 && (
            <Button
              onClick={() => navigate('/vocabulary/learn/due-srs')}
              className="gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/20"
            >
              <RotateCcw size={15} />
              <span>
                {isVietnamese
                  ? `Ôn ${summary.due_today_count} từ đến hạn`
                  : `Review ${summary.due_today_count} due`}
              </span>
              <ArrowRight size={14} />
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => refetch()}
            className="gap-1.5 border-border bg-surface text-text-secondary hover:text-text-primary"
            title={isVietnamese ? 'Làm mới số liệu' : 'Refresh analytics'}
          >
            <RefreshCw size={14} />
            <span>{isVietnamese ? 'Cập nhật' : 'Refresh'}</span>
          </Button>
        </div>
      </div>

      {/* 2. CORE HEALTH METRICS (4 KPI CARDS) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: VỐN TỪ THỰC GIỮ ĐƯỢC (NET RETAINED WORDS) */}
        <Card className="dashboard-card border-border/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-primary/10 blur-xl pointer-events-none" />
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-text-tertiary">
              <span className="text-xs font-bold uppercase tracking-wider">
                {isVietnamese ? 'Vốn từ thực giữ được' : 'Net Retained Words'}
              </span>
              <Brain size={18} className="text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-text-primary">
                {summary.net_retained_words}
              </span>
              <span className="text-xs font-semibold text-text-secondary">
                / {summary.total_words} {isVietnamese ? 'đã học' : 'learned'}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-subtle">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{
                  width: `${
                    summary.total_words > 0
                      ? Math.min(100, Math.round((summary.net_retained_words / summary.total_words) * 100))
                      : 0
                  }%`,
                }}
              />
            </div>
            <p className="text-[11px] text-text-secondary pt-0.5">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {summary.mastered_count}
              </span>{' '}
              {isVietnamese ? 'từ đã ăn sâu (>21 ngày)' : 'mastered long-term'}
            </p>
          </CardContent>
        </Card>

        {/* KPI 2: TỶ LỆ LƯU GIỮ 30 NGÀY (30-DAY TRUE RETENTION RATE) */}
        <Card className="dashboard-card border-border/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-text-tertiary">
              <span className="text-xs font-bold uppercase tracking-wider">
                {isVietnamese ? 'Độ lưu giữ 30 ngày' : '30-Day Retention'}
              </span>
              <Award size={18} className="text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-text-primary">
                {summary.retention_rate_30d}%
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${retentionStatus.color}`}>
                {retentionStatus.text}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-subtle">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${summary.retention_rate_30d}%` }}
              />
            </div>
            <p className="text-[11px] text-text-secondary pt-0.5">
              {isVietnamese ? 'Đo lường trên các phiên ôn tập SRS' : 'Evaluated across SRS recall tests'}
            </p>
          </CardContent>
        </Card>

        {/* KPI 3: TIẾN BỘ 30 NGÀY (NET MASTERED GROWTH) */}
        <Card className="dashboard-card border-border/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-text-tertiary">
              <span className="text-xs font-bold uppercase tracking-wider">
                {isVietnamese ? 'Tăng trưởng dài hạn' : 'Net Mastered Growth'}
              </span>
              <TrendingUp size={18} className="text-indigo-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                +{summary.net_mastered_growth_30d}
              </span>
              <span className="text-xs font-semibold text-text-secondary">
                {isVietnamese ? 'từ trong 30 ngày' : 'words in 30d'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-text-secondary pt-2">
              <Sparkles size={13} className="text-amber-500" />
              <span>
                {isVietnamese
                  ? `${summary.learning_count} từ đang tiến về mốc thành thạo`
                  : `${summary.learning_count} words currently maturing`}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: LỖ HỔNG & TỪ YẾU CẦN CỨU */}
        <Card className="dashboard-card border-border/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-rose-500/10 blur-xl pointer-events-none" />
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-text-tertiary">
              <span className="text-xs font-bold uppercase tracking-wider">
                {isVietnamese ? 'Từ yếu & Cần chăm sóc' : 'At-Risk & Weak Words'}
              </span>
              <ShieldAlert size={18} className="text-rose-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-rose-600 dark:text-rose-400">
                {summary.active_weak_count}
              </span>
              <span className="text-xs font-semibold text-text-secondary">
                {isVietnamese ? 'từ cần phục hồi' : 'words need rescue'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-text-secondary pt-2">
              <CheckCircle2 size={13} className="text-emerald-500" />
              <span>
                {isVietnamese
                  ? `Đã cứu thành công ${summary.recovered_weak_count} từ`
                  : `${summary.recovered_weak_count} words recovered`}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. TRỤ TIẾN BỘ & PHÂN BỔ TRÍ NHỚ (2 CỘT LỚN) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* PHÂN BỔ ĐỘ BỀN TRÍ NHỚ (7 COLS) */}
        <Card className="dashboard-card border-border/80 shadow-xs lg:col-span-7">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <Layers3 size={18} className="text-primary" />
                  <span>{isVietnamese ? 'Phân bổ Độ bền Trí nhớ' : 'Memory Stability Distribution'}</span>
                </h3>
                <p className="text-xs text-text-secondary">
                  {isVietnamese
                    ? 'Phân tầng theo chu kỳ giãn cách Spaced Repetition (SRS)'
                    : 'Tiered by Spaced Repetition interval days'}
                </p>
              </div>
              <span className="text-xs font-bold text-text-tertiary">
                {summary.total_words} {isVietnamese ? 'tổng mục từ' : 'total items'}
              </span>
            </div>

            {/* STACKED HORIZONTAL BAR */}
            <div className="space-y-2">
              <div className="h-5 w-full flex overflow-hidden rounded-xl bg-surface-subtle p-0.5 shadow-inner">
                {memory_strength.deep_memory.percentage > 0 && (
                  <div
                    style={{ width: `${memory_strength.deep_memory.percentage}%` }}
                    className="h-full bg-emerald-500 transition-all duration-500 first:rounded-l-lg last:rounded-r-lg"
                    title={`Bền vững: ${memory_strength.deep_memory.count} từ (${memory_strength.deep_memory.percentage}%)`}
                  />
                )}
                {memory_strength.stable.percentage > 0 && (
                  <div
                    style={{ width: `${memory_strength.stable.percentage}%` }}
                    className="h-full bg-blue-500 transition-all duration-500 first:rounded-l-lg last:rounded-r-lg"
                    title={`Ổn định: ${memory_strength.stable.count} từ (${memory_strength.stable.percentage}%)`}
                  />
                )}
                {memory_strength.learning.percentage > 0 && (
                  <div
                    style={{ width: `${memory_strength.learning.percentage}%` }}
                    className="h-full bg-amber-500 transition-all duration-500 first:rounded-l-lg last:rounded-r-lg"
                    title={`Đang rèn: ${memory_strength.learning.count} từ (${memory_strength.learning.percentage}%)`}
                  />
                )}
                {memory_strength.fragile.percentage > 0 && (
                  <div
                    style={{ width: `${memory_strength.fragile.percentage}%` }}
                    className="h-full bg-rose-500 transition-all duration-500 first:rounded-l-lg last:rounded-r-lg"
                    title={`Mong manh/Mới: ${memory_strength.fragile.count} từ (${memory_strength.fragile.percentage}%)`}
                  />
                )}
              </div>
            </div>

            {/* 4 STAGES DETAIL GRID */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-1">
              {/* STAGE 1: BỀN VỮNG */}
              <div className="rounded-xl border border-border/80 bg-surface p-3 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-text-primary">
                    {isVietnamese ? 'Bền vững' : 'Deep'}
                  </span>
                </div>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {memory_strength.deep_memory.count}{' '}
                  <span className="text-[10px] font-normal text-text-tertiary">
                    ({memory_strength.deep_memory.percentage}%)
                  </span>
                </p>
                <p className="text-[10.5px] text-text-secondary leading-tight">
                  {isVietnamese ? 'Giãn cách ≥ 30 ngày' : 'Interval ≥ 30 days'}
                </p>
              </div>

              {/* STAGE 2: ỔN ĐỊNH */}
              <div className="rounded-xl border border-border/80 bg-surface p-3 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <span className="text-xs font-bold text-text-primary">
                    {isVietnamese ? 'Ổn định' : 'Stable'}
                  </span>
                </div>
                <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                  {memory_strength.stable.count}{' '}
                  <span className="text-[10px] font-normal text-text-tertiary">
                    ({memory_strength.stable.percentage}%)
                  </span>
                </p>
                <p className="text-[10.5px] text-text-secondary leading-tight">
                  {isVietnamese ? 'Giãn cách 7 - 30 ngày' : 'Interval 7 - 30 days'}
                </p>
              </div>

              {/* STAGE 3: ĐANG RÈN */}
              <div className="rounded-xl border border-border/80 bg-surface p-3 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-text-primary">
                    {isVietnamese ? 'Đang rèn' : 'Learning'}
                  </span>
                </div>
                <p className="text-lg font-black text-amber-600 dark:text-amber-400">
                  {memory_strength.learning.count}{' '}
                  <span className="text-[10px] font-normal text-text-tertiary">
                    ({memory_strength.learning.percentage}%)
                  </span>
                </p>
                <p className="text-[10.5px] text-text-secondary leading-tight">
                  {isVietnamese ? 'Giãn cách 1 - 7 ngày' : 'Interval 1 - 7 days'}
                </p>
              </div>

              {/* STAGE 4: MONG MANH / MỚI */}
              <div className="rounded-xl border border-border/80 bg-surface p-3 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <span className="text-xs font-bold text-text-primary">
                    {isVietnamese ? 'Mong manh' : 'Fragile'}
                  </span>
                </div>
                <p className="text-lg font-black text-rose-600 dark:text-rose-400">
                  {memory_strength.fragile.count}{' '}
                  <span className="text-[10px] font-normal text-text-tertiary">
                    ({memory_strength.fragile.percentage}%)
                  </span>
                </p>
                <p className="text-[10.5px] text-text-secondary leading-tight">
                  {isVietnamese ? 'Vừa nạp hoặc < 1 ngày' : 'New or interval < 1d'}
                </p>
              </div>
            </div>

            {/* LEARNING ADVICE BANNER */}
            <div className="rounded-xl bg-primary/5 p-3.5 border border-primary/20 flex items-start gap-3">
              <Zap size={18} className="text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-text-secondary leading-relaxed">
                {isVietnamese
                  ? `Mục tiêu quan trọng nhất là đẩy nhóm "Đang rèn" (${memory_strength.learning.count} từ) sang nhóm "Ổn định" và "Bền vững" bằng cách duy trì ôn đúng hạn Spaced Repetition.`
                  : `Your main goal is transitioning "Learning" words (${memory_strength.learning.count}) into "Stable" and "Deep" stages through on-time spaced reviews.`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* PHỔ VỐN TỪ THEO CEFR (5 COLS) */}
        <Card className="dashboard-card border-border/80 shadow-xs lg:col-span-5">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <Target size={18} className="text-indigo-500" />
                  <span>{isVietnamese ? 'Phổ Vốn từ theo CEFR' : 'CEFR Level Profile'}</span>
                </h3>
                <p className="text-xs text-text-secondary">
                  {isVietnamese ? 'Độ phủ từ vựng qua các bậc A1 - C2' : 'Vocabulary coverage by CEFR bands'}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => {
                const item = cefr_breakdown[lvl] || { total: 0, mastered: 0, learning: 0 }
                return (
                  <div key={lvl} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-text-primary">{lvl}</span>
                      <span className="text-text-secondary font-medium">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {item.mastered} {isVietnamese ? 'đã thuộc' : 'mastered'}
                        </span>{' '}
                        / {item.total} {isVietnamese ? 'từ' : 'words'}
                      </span>
                    </div>
                    <div className="h-2 w-full flex overflow-hidden rounded-full bg-surface-subtle">
                      <div
                        style={{
                          width: `${item.total > 0 ? (item.mastered / item.total) * 100 : 0}%`,
                        }}
                        className="h-full bg-emerald-500 transition-all duration-500"
                        title={`${lvl} Mastered: ${item.mastered}`}
                      />
                      <div
                        style={{
                          width: `${item.total > 0 ? (item.learning / item.total) * 100 : 0}%`,
                        }}
                        className="h-full bg-blue-500 transition-all duration-500"
                        title={`${lvl} Learning: ${item.learning}`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. TRẠM CỨU HỘ TỪ VỰNG (ACTIONABLE RESCUE HUB) */}
      <Card className="dashboard-card border-border/80 shadow-xs">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <ShieldAlert size={18} className="text-rose-500" />
                <span>
                  {isVietnamese
                    ? 'Trạm Cứu hộ Từ vựng (Words to Rescue)'
                    : 'Vocabulary Rescue Station'}
                </span>
              </h3>
              <p className="text-xs text-text-secondary">
                {isVietnamese
                  ? 'Các từ có nguy cơ rơi rụng trí nhớ cao nhất được xếp hạng theo tần suất lỗi'
                  : 'Highest memory decay risk words prioritized by error frequency'}
              </p>
            </div>

            {top_weak_words.length > 0 && (
              <Button
                onClick={() => navigate('/vocabulary/learn/wrong-words')}
                className="gap-2 bg-primary hover:bg-primary-hover font-semibold shadow-xs"
              >
                <RotateCcw size={14} />
                <span>
                  {isVietnamese
                    ? `Ôn tập sổ từ sai (${summary.active_weak_count})`
                    : `Practice Wrong Words (${summary.active_weak_count})`}
                </span>
                <ArrowRight size={14} />
              </Button>
            )}
          </div>

          {top_weak_words.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-8 text-center space-y-2">
              <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
              <h4 className="text-sm font-bold text-text-primary">
                {isVietnamese ? 'Không có từ vựng nào gặp nguy cấp!' : 'No critical weak words!'}
              </h4>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                {isVietnamese
                  ? 'Tuyệt vời! Bạn đang duy trì phong độ ghi nhớ rất tốt, không có từ nào bị lapse nhiều lần.'
                  : 'Great job! Your memory retention is healthy with no repeating lapse words.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/80 text-text-tertiary uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-bold">{isVietnamese ? 'Từ vựng' : 'Word'}</th>
                    <th className="pb-3 font-bold">{isVietnamese ? 'Nghĩa tiếng Việt' : 'Meaning'}</th>
                    <th className="pb-3 font-bold text-center">{isVietnamese ? 'Số lần sai' : 'Lapses'}</th>
                    <th className="pb-3 font-bold text-center">{isVietnamese ? 'Đúng liên tiếp' : 'Correct Streak'}</th>
                    <th className="pb-3 font-bold text-right">{isVietnamese ? 'Thao tác' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {top_weak_words.map((w) => (
                    <tr key={w.lexical_item_id} className="hover:bg-surface-hover/50 transition">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => speakWord(w.word)}
                            className="rounded-lg p-1.5 text-text-tertiary hover:bg-primary/10 hover:text-primary transition"
                            title={isVietnamese ? 'Nghe phát âm' : 'Listen pronunciation'}
                          >
                            <Volume2
                              size={15}
                              className={playingWord === w.word ? 'text-primary animate-pulse' : ''}
                            />
                          </button>
                          <div>
                            <span className="font-extrabold text-sm text-text-primary">{w.word}</span>
                            {w.ipa && (
                              <span className="ml-1.5 font-mono text-[11px] text-text-tertiary">
                                /{w.ipa}/
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 pr-4 font-medium text-text-secondary">
                        {w.part_of_speech && (
                          <span className="mr-1.5 rounded bg-surface-subtle px-1.5 py-0.5 text-[10px] font-bold uppercase text-text-tertiary">
                            {w.part_of_speech}
                          </span>
                        )}
                        <span>{w.meaning_vi || '—'}</span>
                      </td>

                      <td className="py-3 px-2 text-center">
                        <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-black text-rose-600 dark:text-rose-400">
                          {w.wrong_count}
                        </span>
                      </td>

                      <td className="py-3 px-2 text-center">
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                          {w.consecutive_correct}
                        </span>
                      </td>

                      <td className="py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/vocabulary/learn/wrong-words')}
                          className="h-8 gap-1 text-primary hover:bg-primary/10 hover:text-primary font-bold text-xs"
                        >
                          <span>{isVietnamese ? 'Cứu từ' : 'Rescue'}</span>
                          <ArrowRight size={12} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. HOẠT ĐỘNG ÔN TẬP 30 NGÀY (MINI ACTIVITY TIMELINE) */}
      <Card className="dashboard-card border-border/80 shadow-xs">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Activity size={18} className="text-primary" />
                <span>{isVietnamese ? 'Hoạt động Ôn tập 30 ngày qua' : '30-Day Vocabulary Review Activity'}</span>
              </h3>
              <p className="text-xs text-text-secondary">
                {isVietnamese
                  ? 'Theo dõi tính liên tục và khối lượng lượt ôn tập thẻ mỗi ngày'
                  : 'Daily review volume and spaced repetition consistency'}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-end gap-1.5 sm:gap-2 h-24 overflow-x-auto pb-2">
              {activity_30d.map((day) => {
                const maxCount = Math.max(...activity_30d.map((d) => d.reviews_count), 20)
                const heightPercent = day.reviews_count > 0 ? Math.max(12, Math.round((day.reviews_count / maxCount) * 100)) : 4

                return (
                  <div
                    key={day.date}
                    className="flex flex-1 min-w-[12px] flex-col items-center gap-1 group relative cursor-pointer"
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-gray-900 text-white text-[10px] py-1 px-2 rounded-md shadow-md whitespace-nowrap z-20 pointer-events-none">
                      <span className="font-bold">{day.date}</span>
                      <span>
                        {day.reviews_count} {isVietnamese ? 'lượt ôn' : 'reviews'} ({day.accuracy}%)
                      </span>
                    </div>

                    {/* Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        day.reviews_count > 0
                          ? 'bg-primary group-hover:bg-primary-hover shadow-xs'
                          : 'bg-surface-subtle'
                      }`}
                    />
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-text-tertiary pt-2 border-t border-border/60">
              <span>{activity_30d[0]?.date || '30 days ago'}</span>
              <span className="font-semibold text-text-secondary">
                {isVietnamese ? 'Hôm nay' : 'Today'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
