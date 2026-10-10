'use client'

import { useState, useEffect } from 'react'
import {
  Volume2,
  Award,
  Target,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Headphones,
  Zap,
  History,
} from 'lucide-react'
import { Card } from '@/components/card'
import { Button } from '@/components/button'
import {
  pronunciationService,
  type PhonemeMasteryResponse,
  type PronunciationAnalyticsResponse,
} from '@/features/practice/services/pronunciation.service'

const ALL_44_PHONEMES = [
  // Monophthongs (12)
  { symbol: 'iː', type: 'VOWEL' },
  { symbol: 'ɪ', type: 'VOWEL' },
  { symbol: 'ʊ', type: 'VOWEL' },
  { symbol: 'uː', type: 'VOWEL' },
  { symbol: 'e', type: 'VOWEL' },
  { symbol: 'ə', type: 'VOWEL' },
  { symbol: 'ɜː', type: 'VOWEL' },
  { symbol: 'ɔː', type: 'VOWEL' },
  { symbol: 'æ', type: 'VOWEL' },
  { symbol: 'ʌ', type: 'VOWEL' },
  { symbol: 'ɑː', type: 'VOWEL' },
  { symbol: 'ɒ', type: 'VOWEL' },
  // Diphthongs (8)
  { symbol: 'ɪə', type: 'DIPHTHONG' },
  { symbol: 'eɪ', type: 'DIPHTHONG' },
  { symbol: 'ʊə', type: 'DIPHTHONG' },
  { symbol: 'ɔɪ', type: 'DIPHTHONG' },
  { symbol: 'əʊ', type: 'DIPHTHONG' },
  { symbol: 'eə', type: 'DIPHTHONG' },
  { symbol: 'aɪ', type: 'DIPHTHONG' },
  { symbol: 'aʊ', type: 'DIPHTHONG' },
  // Consonants (24)
  { symbol: 'p', type: 'CONSONANT' },
  { symbol: 'b', type: 'CONSONANT' },
  { symbol: 't', type: 'CONSONANT' },
  { symbol: 'd', type: 'CONSONANT' },
  { symbol: 'tʃ', type: 'CONSONANT' },
  { symbol: 'dʒ', type: 'CONSONANT' },
  { symbol: 'k', type: 'CONSONANT' },
  { symbol: 'g', type: 'CONSONANT' },
  { symbol: 'f', type: 'CONSONANT' },
  { symbol: 'v', type: 'CONSONANT' },
  { symbol: 'θ', type: 'CONSONANT' },
  { symbol: 'ð', type: 'CONSONANT' },
  { symbol: 's', type: 'CONSONANT' },
  { symbol: 'z', type: 'CONSONANT' },
  { symbol: 'ʃ', type: 'CONSONANT' },
  { symbol: 'ʒ', type: 'CONSONANT' },
  { symbol: 'm', type: 'CONSONANT' },
  { symbol: 'n', type: 'CONSONANT' },
  { symbol: 'ŋ', type: 'CONSONANT' },
  { symbol: 'h', type: 'CONSONANT' },
  { symbol: 'l', type: 'CONSONANT' },
  { symbol: 'r', type: 'CONSONANT' },
  { symbol: 'w', type: 'CONSONANT' },
  { symbol: 'j', type: 'CONSONANT' },
]

interface PronunciationDetailTabProps {
  userId?: string
  onNavigate: (path: string) => void
}

export function PronunciationDetailTab({ userId, onNavigate }: PronunciationDetailTabProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<PhonemeMasteryResponse | null>(null)
  const [analytics, setAnalytics] = useState<PronunciationAnalyticsResponse | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    Promise.all([
      pronunciationService.getPhonemeMastery(userId).catch(() => null),
      pronunciationService.getPhonemeAnalytics(userId).catch(() => null),
    ])
      .then(([masteryRes, analyticsRes]) => {
        if (masteryRes) setData(masteryRes)
        if (analyticsRes) setAnalytics(analyticsRes)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [userId])

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs text-text-tertiary">Đang tổng hợp dữ liệu Ngữ âm IPA...</p>
      </div>
    )
  }

  const skillsMap = data?.phoneme_skills || {}
  const skillsList = Object.values(skillsMap)

  // Compute breakdown metrics
  let masteredCount = 0
  let strongCount = 0
  let developingCount = 0
  let weakCount = 0
  let totalAttemptsCount = 0
  let perceptionSum = 0
  let recognitionSum = 0
  let ratedCount = 0

  for (const item of skillsList) {
    if (item.mastery_score >= 85 || item.status === 'MASTERED') masteredCount++
    else if (item.mastery_score >= 70 || item.status === 'STRONG') strongCount++
    else if (item.mastery_score >= 30 || item.status === 'DEVELOPING') developingCount++
    else if (item.mastery_score > 0) weakCount++

    if (item.evidence_stats?.total_attempts) {
      totalAttemptsCount += item.evidence_stats.total_attempts
    }
    if (item.mastery_score > 0) {
      perceptionSum += item.perception_score || 0
      recognitionSum += item.recognition_score || 0
      ratedCount++
    }
  }

  const unpracticedCount = Math.max(0, 44 - (masteredCount + strongCount + developingCount + weakCount))
  const avgPerception = ratedCount > 0 ? Math.round(perceptionSum / ratedCount) : 0
  const avgRecognition = ratedCount > 0 ? Math.round(recognitionSum / ratedCount) : 0
  const masteredPercent = Math.round(((masteredCount + strongCount) / 44) * 100)

  // Filter chronic confusion pairs
  const chronicErrors = data?.top_chronic_phonemes || []

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-surface to-surface p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Volume2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                Năng lực Ngữ âm & Bảng phiên âm quốc tế (IPA)
              </h3>
              <p className="mt-1 text-xs text-text-secondary max-w-xl">
                Theo dõi mức độ làm chủ 44 âm chuẩn quốc tế qua mô hình tích lũy bằng chứng đa chiều:
                Nghe phân biệt âm (Perception), Nhận diện ký tự (Recognition) và Vị trí ngữ âm trong từ.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              className="gap-2 bg-primary text-white hover:bg-primary-hover shadow-xs"
              onClick={() => onNavigate('/ipa')}
            >
              <BookOpen size={16} />
              <span>Bảng tra cứu 44 âm</span>
              <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <Card className="p-4 bg-surface border-border">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-tertiary">
            <Award size={15} className="text-amber-500" />
            <span>Đã làm chủ vững</span>
          </div>
          <p className="mt-2 text-2xl font-black text-text-primary">
            {masteredCount + strongCount} <span className="text-sm font-normal text-text-tertiary">/ 44 âm</span>
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
            <span>{masteredPercent}% bảng âm</span>
            <span className="text-text-tertiary font-normal">({masteredCount} Mastered)</span>
          </div>
        </Card>

        <Card className="p-4 bg-surface border-border">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-tertiary">
            <Target size={15} className="text-blue-500" />
            <span>Nghe phân biệt (Perception)</span>
          </div>
          <p className="mt-2 text-2xl font-black text-text-primary">
            {avgPerception}%
          </p>
          <p className="mt-2 text-[11px] text-text-tertiary">
            Khả năng nhận biết âm qua Minimal Pair
          </p>
        </Card>

        <Card className="p-4 bg-surface border-border">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-tertiary">
            <Sparkles size={15} className="text-purple-500" />
            <span>Nhận diện mặt chữ (Recognition)</span>
          </div>
          <p className="mt-2 text-2xl font-black text-text-primary">
            {avgRecognition}%
          </p>
          <p className="mt-2 text-[11px] text-text-tertiary">
            Liên kết chữ viết với ký hiệu ngữ âm
          </p>
        </Card>

        <Card className="p-4 bg-surface border-border">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-tertiary">
            <TrendingUp size={15} className="text-emerald-500" />
            <span>Lượt câu hỏi tích lũy</span>
          </div>
          <p className="mt-2 text-2xl font-black text-text-primary">
            {totalAttemptsCount} <span className="text-sm font-normal text-text-tertiary">câu</span>
          </p>
          <p className="mt-2 text-[11px] text-text-tertiary">
            Bằng chứng thực hành không thể farming
          </p>
        </Card>
      </div>

      {/* 44 Phonemes Distribution Bar */}
      <Card className="p-5 bg-surface border-border">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-sm font-bold text-text-primary">
              Phân bổ năng lực 44 âm vị quốc tế
            </h4>
            <p className="text-xs text-text-tertiary">
              Tiến độ làm chủ bảng âm dựa trên đường cong bão hòa Diminishing Returns
            </p>
          </div>
          <span className="text-xs font-bold text-primary">
            {masteredCount + strongCount + developingCount + weakCount} / 44 âm đã chạm tới
          </span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-surface-subtle border border-border/80">
          <div
            title={`Mastered: ${masteredCount} âm`}
            className="bg-emerald-500 transition-all duration-300"
            style={{ width: `${(masteredCount / 44) * 100}%` }}
          />
          <div
            title={`Strong: ${strongCount} âm`}
            className="bg-blue-500 transition-all duration-300"
            style={{ width: `${(strongCount / 44) * 100}%` }}
          />
          <div
            title={`Developing: ${developingCount} âm`}
            className="bg-amber-500 transition-all duration-300"
            style={{ width: `${(developingCount / 44) * 100}%` }}
          />
          <div
            title={`Cần khắc phục: ${weakCount} âm`}
            className="bg-orange-500 transition-all duration-300"
            style={{ width: `${(weakCount / 44) * 100}%` }}
          />
          <div
            title={`Chưa luyện: ${unpracticedCount} âm`}
            className="bg-surface-subtle transition-all duration-300"
            style={{ width: `${(unpracticedCount / 44) * 100}%` }}
          />
        </div>

        {/* Legend */}
        <div className="mt-3.5 flex flex-wrap items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-text-secondary">Mastered ({masteredCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span className="text-text-secondary">Strong ({strongCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-text-secondary">Developing ({developingCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
            <span className="text-text-secondary">Cần ôn ({weakCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="text-text-tertiary">Chưa luyện ({unpracticedCount})</span>
          </div>
        </div>
      </Card>

      {/* Mini 44 IPA Matrix */}
      <Card className="p-5 bg-surface border-border">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-sm font-bold text-text-primary">
            Lưới tổng quan 44 âm IPA
          </h4>
          <span className="text-[11px] text-text-tertiary">
            Bấm vào âm bất kỳ để chuyển đến trang luyện âm
          </span>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-11 gap-2">
          {ALL_44_PHONEMES.map((item) => {
            const cleanSym = item.symbol.replace(/^\/+|\/+$/g, '')
            const skill =
              skillsMap[`/${cleanSym}/`] ||
              skillsMap[cleanSym] ||
              skillsMap[item.symbol]

            const score = skill?.mastery_score || 0
            const status = skill?.status || 'NOT_STARTED'

            let bgClass = 'border-border/60 bg-surface-subtle/50 text-text-tertiary hover:border-primary/50'
            if (score >= 85 || status === 'MASTERED') {
              bgClass = 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
            } else if (score >= 70 || status === 'STRONG') {
              bgClass = 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
            } else if (score >= 30 || status === 'DEVELOPING') {
              bgClass = 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
            } else if (score > 0) {
              bgClass = 'border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400'
            }

            return (
              <button
                key={item.symbol}
                type="button"
                onClick={() => onNavigate('/ipa')}
                className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center transition hover:scale-105 cursor-pointer ${bgClass}`}
                title={`/${item.symbol}/: ${score > 0 ? `${score}% (${status})` : 'Chưa luyện'}`}
              >
                <span className="font-mono text-sm font-bold">/{item.symbol}/</span>
                <span className="mt-0.5 text-[9px] font-semibold opacity-90">
                  {score > 0 ? `${score}%` : '—'}
                </span>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Section 1: Chẩn đoán Điểm yếu Ngữ âm & Cặp âm hay nhầm lẫn */}
      <Card className="p-5 sm:p-6 bg-surface border-border shadow-xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary">
                Chẩn đoán Điểm yếu Ngữ âm & Cặp âm hay nhầm lẫn
              </h4>
              <p className="text-xs text-text-tertiary">
                Phân tích các âm vị bạn có tỷ lệ nhận diện sai cao nhất hoặc thường xuyên nghe nhầm
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-text-tertiary">
            {(analytics?.chronic_phonemes?.length || chronicErrors.length) > 0
              ? `${analytics?.chronic_phonemes?.length || chronicErrors.length} cặp âm cần chú ý`
              : 'Chưa phát hiện điểm yếu'}
          </span>
        </div>

        {((analytics?.chronic_phonemes && analytics.chronic_phonemes.length > 0) || chronicErrors.length > 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(analytics?.chronic_phonemes && analytics.chronic_phonemes.length > 0
              ? analytics.chronic_phonemes
              : chronicErrors.map((c) => ({
                  expected: c.expected_phoneme,
                  actual: c.actual_phoneme,
                  frequency: c.frequency,
                  last_occurred_at: '',
                }))
            ).map((err, idx) => {
              const cleanExp = err.expected.replace(/^\/+|\/+$/g, '')
              const cleanAct = err.actual.replace(/^\/+|\/+$/g, '')

              return (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/80 bg-surface-subtle p-3.5 transition hover:border-primary/40 hover:bg-surface-hover/50"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1.5 font-mono text-sm">
                      <span className="rounded-lg bg-emerald-500/10 px-2 py-1 font-bold text-emerald-600 dark:text-emerald-400">
                        /{cleanExp}/
                      </span>
                      <span className="text-xs text-text-tertiary font-sans font-medium">hay nhầm sang</span>
                      <span className="rounded-lg bg-rose-500/10 px-2 py-1 font-bold text-rose-600 dark:text-rose-400">
                        /{cleanAct}/
                      </span>
                    </div>
                    <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-bold text-rose-500 border border-rose-500/20">
                      {err.frequency} lần
                    </span>
                  </div>

                  <Button
                    size="sm"
                    className="h-8 gap-1.5 text-xs bg-primary text-white hover:bg-primary-hover shadow-xs cursor-pointer self-start sm:self-auto"
                    onClick={() => onNavigate(`/ipa?phoneme=${encodeURIComponent(cleanExp)}&action=practice`)}
                  >
                    <RotateCcw size={12} />
                    <span>Luyện lại /{cleanExp}/ ngay</span>
                  </Button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-6 text-center">
            <CheckCircle2 size={28} className="text-emerald-500 mb-2" />
            <p className="text-xs font-semibold text-text-primary">
              Năng lực phân biệt âm rất tốt!
            </p>
            <p className="mt-1 text-[11px] text-text-tertiary max-w-sm">
              Bạn chưa ghi nhận lỗi lặp lại cố hữu nào giữa các cặp âm đối lập. Hãy tiếp tục duy trì!
            </p>
          </div>
        )}
      </Card>

      {/* Section 2: Hành vi & Tốc độ Thực hành */}
      <Card className="p-5 sm:p-6 bg-surface border-border shadow-xs">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <Headphones size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-primary">
              Hành Vi & Tốc Độ Thực Hành Ngữ Âm
            </h4>
            <p className="text-xs text-text-tertiary">
              Đánh giá thói quen nghe lại âm thanh, tốc độ phản xạ và độ tự tin khi nhận diện
            </p>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
          <div className="rounded-xl border border-border bg-surface-subtle p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-text-tertiary">
              <span>Số lần nghe lại TB</span>
              <Volume2 size={15} className="text-blue-500" />
            </div>
            <p className="mt-2 text-2xl font-black text-text-primary">
              {analytics?.behavior_stats?.avg_replays_per_question ?? 1.0}{' '}
              <span className="text-xs font-normal text-text-tertiary">lần / câu</span>
            </p>
            <p className="mt-1 text-[11px] text-text-tertiary">
              {(analytics?.behavior_stats?.avg_replays_per_question ?? 1) <= 1.3
                ? '⚡ Phản xạ nghe tức thì, độ tự tin cao'
                : (analytics?.behavior_stats?.avg_replays_per_question ?? 1) <= 2.2
                  ? '👍 Nghe kiểm tra cẩn thận trước khi chọn'
                  : '🔍 Cần nghe nhiều lần để nhận diện'}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface-subtle p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-text-tertiary">
              <span>Tốc độ phản xạ TB</span>
              <Zap size={15} className="text-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-black text-text-primary">
              {analytics?.behavior_stats?.avg_time_spent_seconds ?? 4}{' '}
              <span className="text-xs font-normal text-text-tertiary">giây / câu</span>
            </p>
            <p className="mt-1 text-[11px] text-text-tertiary">
              Thời gian xử lý tín hiệu âm thanh và chọn đáp án
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface-subtle p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-text-tertiary">
              <span>Chuẩn xác lần nghe đầu</span>
              <Award size={15} className="text-emerald-500" />
            </div>
            <p className="mt-2 text-2xl font-black text-text-primary">
              {analytics?.behavior_stats?.first_listen_accuracy ?? 0}%
            </p>
            <p className="mt-1 text-[11px] text-text-tertiary">
              Tỷ lệ trả lời chính xác mà chỉ cần nghe duy nhất 1 lần
            </p>
          </div>
        </div>

        {/* Top âm cần nghe lại nhiều nhất */}
        {analytics?.behavior_stats?.top_replayed_phonemes && analytics.behavior_stats.top_replayed_phonemes.length > 0 && (
          <div>
            <h5 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2.5">
              Âm vị bạn thường bấm nghe lại nhiều lần nhất
            </h5>
            <div className="flex flex-wrap gap-2.5">
              {analytics.behavior_stats.top_replayed_phonemes.map((item, idx) => {
                const cleanP = item.phoneme.replace(/^\/+|\/+$/g, '')
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs"
                  >
                    <span className="font-mono font-bold text-primary">/{cleanP}/</span>
                    <span className="text-text-tertiary">TB:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {item.avg_replays} lần
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-1.5 text-[11px] text-text-secondary hover:text-primary"
                      onClick={() => onNavigate(`/ipa?phoneme=${encodeURIComponent(cleanP)}&action=practice`)}
                    >
                      <RotateCcw size={11} className="mr-1" />
                      Luyện lại
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Section 3: Lịch sử Luyện tập Gần đây */}
      <Card className="p-5 sm:p-6 bg-surface border-border shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
              <History size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary">
                Lịch Sử Luyện Tập Gần Đây
              </h4>
              <p className="text-xs text-text-tertiary">
                Chi tiết kết quả các câu hỏi phát âm và nhận diện bạn đã thực hiện
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-text-tertiary">
            {analytics?.recent_history?.length || 0} câu gần nhất
          </span>
        </div>

        {analytics?.recent_history && analytics.recent_history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/80 text-text-tertiary font-semibold">
                  <th className="pb-3 font-semibold">Thời gian</th>
                  <th className="pb-3 font-semibold">Dạng bài</th>
                  <th className="pb-3 font-semibold">Âm mục tiêu / Từ vựng</th>
                  <th className="pb-3 font-semibold">Bạn chọn</th>
                  <th className="pb-3 font-semibold text-center">Kết quả</th>
                  <th className="pb-3 font-semibold text-center">Nghe lại</th>
                  <th className="pb-3 font-semibold text-right">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {analytics.recent_history.map((att) => {
                  const targetPhonemeStr = att.target_phonemes?.join(', ') || '—'
                  const dateStr = att.completed_at
                    ? new Date(att.completed_at).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                      })
                    : '—'

                  const typeLabel =
                    att.exercise_type === 'MINIMAL_PAIR_LISTEN'
                      ? 'Cặp âm đối lập'
                      : att.exercise_type === 'WORD_TRANSCRIPTION'
                        ? 'Chữ -> Phiên âm'
                        : 'Nhận diện âm'

                  return (
                    <tr key={att._id} className="hover:bg-surface-subtle/50 transition">
                      <td className="py-3 text-text-tertiary whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <span className="rounded-md bg-surface-subtle px-2 py-0.5 text-[11px] font-medium text-text-secondary border border-border/60">
                          {typeLabel}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-primary">
                            {targetPhonemeStr}
                          </span>
                          {att.target_words && att.target_words.length > 0 && (
                            <span className="text-text-tertiary font-medium">
                              ({att.target_words.slice(0, 2).join(' / ')})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 font-mono font-semibold text-text-primary">
                        {att.user_answer || '—'}
                      </td>
                      <td className="py-3 text-center">
                        {att.is_correct ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={12} />
                            Đúng
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                            <XCircle size={12} />
                            Sai
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-center font-semibold text-text-secondary whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px]">
                          <Volume2 size={12} className="text-text-tertiary" />
                          {att.audio_replays_count || 1} lần
                        </span>
                      </td>
                      <td className="py-3 text-right text-text-tertiary font-medium whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px]">
                          <Clock size={11} />
                          {att.time_spent_seconds || 5}s
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-6 text-center">
            <History size={26} className="text-text-tertiary mb-2 opacity-60" />
            <p className="text-xs font-medium text-text-secondary">
              Chưa có lịch sử làm bài gần đây
            </p>
            <p className="mt-1 text-[11px] text-text-tertiary">
              Các câu hỏi phát âm bạn làm sẽ hiển thị chi tiết tại đây kèm số lần nghe và thời gian
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
