'use client'

import { useTranslation } from 'react-i18next'
import {
  type PhonemeSkillItem,
} from '@/features/practice/services/pronunciation.service'
import { X, Volume2, Sparkles, TrendingUp, TrendingDown, Target, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/button'

interface PhonemeDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  symbol: string
  exampleWord?: string
  skillData?: PhonemeSkillItem
  onPlaySound?: () => void
  onStartTargetedPractice: (phoneme: string) => void
}

export function PhonemeDetailDrawer({
  isOpen,
  onClose,
  symbol,
  exampleWord,
  skillData,
  onPlaySound,
  onStartTargetedPractice,
}: PhonemeDetailDrawerProps) {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  if (!isOpen) return null

  const masteryScore = skillData?.mastery_score || 0
  const status = skillData?.status || 'DEVELOPING'
  const perception = skillData?.perception_score || 0
  const recognition = skillData?.recognition_score || 0
  const production = skillData?.production_score || 0
  const speaking = skillData?.speaking_score || 0
  const topSub = skillData?.top_substitution
  const recentEvents = skillData?.recent_events || []

  const getStatusBadge = () => {
    switch (status) {
      case 'MASTERED':
        return <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600">Mastered (Thành thạo)</span>
      case 'STRONG':
        return <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-bold text-blue-600">Strong (Vững vàng)</span>
      case 'DEVELOPING':
        return <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-600">Developing (Đang luyện)</span>
      case 'WEAK':
        return <span className="rounded-md bg-orange-500/10 px-2 py-0.5 text-xs font-bold text-orange-600">Weak (Cần khắc phục)</span>
      case 'CRITICAL':
        return <span className="rounded-md bg-rose-500/10 px-2 py-0.5 text-xs font-bold text-rose-600">Critical (Nguy cơ nhầm lẫn)</span>
      case 'NOT_STARTED':
      default:
        return <span className="rounded-md bg-surface-subtle px-2 py-0.5 text-xs font-bold text-text-tertiary">{isVietnamese ? 'Chưa luyện' : 'Not started'}</span>
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-surface p-6 shadow-2xl animate-in slide-in-from-right duration-200 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-3xl font-extrabold text-primary">
              /{symbol}/
            </span>
            {getStatusBadge()}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-tertiary transition hover:bg-surface-hover hover:text-text-primary cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Overview Box */}
        <div className="mt-5 rounded-2xl border border-border/80 bg-surface-subtle p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-text-tertiary">
                {isVietnamese ? 'Mức độ làm chủ (Mastery)' : 'Phoneme Mastery'}
              </span>
              <p className="text-3xl font-black text-text-primary">
                {masteryScore}%
              </p>
            </div>
            {onPlaySound && (
              <button
                type="button"
                onClick={onPlaySound}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-md transition hover:bg-primary-hover active:scale-95 cursor-pointer"
                title="Nghe lại âm này"
              >
                <Volume2 size={24} />
              </button>
            )}
          </div>

          {/* Mastery Progress Bar */}
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-border/60">
            <div
              className={`h-full transition-all duration-500 ${
                masteryScore >= 85
                  ? 'bg-emerald-500'
                  : masteryScore >= 70
                    ? 'bg-blue-500'
                    : masteryScore >= 50
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
              }`}
              style={{ width: `${masteryScore}%` }}
            />
          </div>

          {/* Warning if top substitution */}
          {topSub && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/10 p-3 text-xs font-semibold text-orange-700 dark:text-orange-400">
              <AlertTriangle size={16} className="shrink-0 text-orange-500" />
              <span>
                {isVietnamese
                  ? `Bạn hay bị phát âm nhầm thành âm ${topSub} trong bài nói.`
                  : `You often substitute this sound with ${topSub} in Speaking.`}
              </span>
            </div>
          )}
        </div>

        {/* 4 Pillars Breakdown */}
        <div className="mt-6">
          <h4 className="mb-3 text-sm font-bold text-text-primary">
            {isVietnamese ? 'Năng lực 4 chiều ngữ âm' : '4-Dimension Phoneme Skills'}
          </h4>
          <div className="space-y-2.5">
            {[
              { label: isVietnamese ? '1. Nghe phân biệt (Perception)' : '1. Sound Perception', score: perception },
              { label: isVietnamese ? '2. Nhận diện mặt chữ (Recognition)' : '2. Word-Sound Recognition', score: recognition },
              { label: isVietnamese ? '3. Tự phát âm bài tập (Production)' : '3. Word Production Drill', score: production },
              { label: isVietnamese ? '4. Ứng dụng thực tế (Speaking)' : '4. Real-world Speaking', score: speaking },
            ].map((pillar) => (
              <div key={pillar.label} className="rounded-xl border border-border bg-surface-subtle/60 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-text-secondary">{pillar.label}</span>
                  <span className="font-bold text-text-primary">{pillar.score}/100</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border/40">
                  <div
                    className="h-full bg-primary/80 transition-all duration-300"
                    style={{ width: `${pillar.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phonetic Position & Evidence Metrics */}
        <div className="mt-6 rounded-2xl border border-border/80 bg-surface-subtle/50 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
              {isVietnamese ? 'Độ phủ vị trí âm & Bằng chứng' : 'Position Coverage & Evidence'}
            </h4>
            {skillData?.evidence_stats?.total_attempts ? (
              <span className="text-[11px] font-semibold text-primary">
                {skillData.evidence_stats.total_attempts} {isVietnamese ? 'lượt luyện' : 'attempts'}
              </span>
            ) : null}
          </div>
          <div className="mt-3 flex items-center gap-2">
            {[
              { id: 'INITIAL', label: isVietnamese ? 'Đầu từ (Initial)' : 'Initial' },
              { id: 'MEDIAL', label: isVietnamese ? 'Giữa từ (Medial)' : 'Medial' },
              { id: 'FINAL', label: isVietnamese ? 'Cuối từ (Final)' : 'Final' },
            ].map((pos) => {
              const isCovered = skillData?.evidence_stats?.practiced_positions?.includes(pos.id as any);
              return (
                <div
                  key={pos.id}
                  className={`flex-1 rounded-xl border px-2 py-2 text-center text-[11px] font-bold transition ${
                    isCovered
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-border/60 bg-surface text-text-tertiary'
                  }`}
                >
                  <span className="block">{pos.label}</span>
                  <span className="text-[9px] font-normal opacity-80">
                    {isCovered ? (isVietnamese ? 'Đã kiểm chứng' : 'Verified') : (isVietnamese ? 'Chưa luyện' : 'Pending')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress History */}
        <div className="mt-6">
          <h4 className="mb-3 text-sm font-bold text-text-primary">
            {isVietnamese ? 'Lịch sử biến động năng lực (Evidence)' : 'Progress History'}
          </h4>
          {recentEvents.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-text-tertiary">
              {isVietnamese ? 'Chưa có dữ liệu bài tập hoặc Speaking gần đây.' : 'No recent practice or speaking events.'}
            </p>
          ) : (
            <div className="space-y-2">
              {recentEvents.map((evt, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-border/80 bg-surface p-2.5 text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    {evt.delta > 0 ? (
                      <TrendingUp size={14} className="text-emerald-500" />
                    ) : (
                      <TrendingDown size={14} className="text-rose-500" />
                    )}
                    <div>
                      <span className="font-semibold text-text-primary">
                        {evt.source === 'SPEAKING'
                          ? (isVietnamese ? 'Bài Speaking tự do' : 'Speaking Practice')
                          : evt.source === 'IPA_MINIMAL_PAIR'
                            ? 'Minimal Pair Drill'
                            : evt.source === 'IPA_RECORD'
                              ? 'Record Drill'
                              : 'IPA Quiz'}
                      </span>
                      {evt.context_word && (
                        <span className="ml-1.5 font-mono text-text-tertiary">
                          ({evt.context_word})
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`font-bold ${
                      evt.delta > 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {evt.delta > 0 ? `+${evt.delta}` : evt.delta}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-6">
          <Button
            className="w-full gap-2 bg-primary py-3 text-white hover:bg-primary-hover shadow-md"
            onClick={() => {
              onClose()
              onStartTargetedPractice(symbol)
            }}
          >
            <Target size={16} />
            <span>
              {isVietnamese ? `Luyện tập chuyên sâu âm /${symbol}/` : `Practice /${symbol}/ Now`}
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
