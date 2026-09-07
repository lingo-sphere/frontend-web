// Component hiển thị thẻ tổng quan điểm số và thời gian làm bài của lượt thi.

import { Trophy, CheckCircle2, Clock, Calendar, CheckCircle, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface AttemptSummaryCardProps {
  scoreDisplay: string
  isPassed: boolean
  correctQ: number
  totalQ: number
  durationSeconds?: number
  submittedAt: string
  formatDuration: (seconds?: number) => string
  formatDateTime: (dateStr?: string) => string
  listeningScore?: number
  readingScore?: number
}

export function AttemptSummaryCard({
  scoreDisplay,
  isPassed,
  correctQ,
  totalQ,
  durationSeconds,
  submittedAt,
  formatDuration,
  formatDateTime,
  listeningScore,
  readingScore,
}: AttemptSummaryCardProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="dashboard-card p-4 rounded-2xl border-border bg-surface shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Điểm số đạt được
            </span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Trophy size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-primary">{scoreDisplay}</div>
            <div className="mt-1 flex items-center gap-2">
              {isPassed ? (
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  <CheckCircle size={10} className="mr-1" /> Đạt chuẩn
                </Badge>
              ) : (
                <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  <AlertCircle size={10} className="mr-1" /> Cần cải thiện
                </Badge>
              )}
            </div>
          </div>
        </Card>

        <Card className="dashboard-card p-4 rounded-2xl border-border bg-surface shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Số câu chính xác
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {correctQ} / {totalQ} câu
            </div>
            <p className="text-[11px] font-semibold text-text-tertiary mt-1">
              Độ chính xác: {totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 0}%
            </p>
          </div>
        </Card>

        <Card className="dashboard-card p-4 rounded-2xl border-border bg-surface shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Thời gian làm bài
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {formatDuration(durationSeconds)}
            </div>
            <p className="text-[11px] font-semibold text-text-tertiary mt-1">
              Thời lượng quy chuẩn
            </p>
          </div>
        </Card>

        <Card className="dashboard-card p-4 rounded-2xl border-border bg-surface shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Thời điểm nộp bài
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
              <Calendar size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-sm font-black text-text-primary">
              {formatDateTime(submittedAt)}
            </div>
            <p className="text-[11px] font-semibold text-text-tertiary mt-1">
              Đã đồng bộ lên hệ thống
            </p>
          </div>
        </Card>
      </div>

      {(listeningScore !== undefined || readingScore !== undefined) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-4 rounded-2xl border border-border bg-surface">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-secondary">Điểm phần Nghe (Listening)</span>
              <span className="text-xs font-semibold text-primary">ETS Scaled</span>
            </div>
            <div className="mt-2 text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {listeningScore ?? 0} / 495 điểm
            </div>
            <div className="w-full bg-surface-subtle h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.round(((listeningScore ?? 0) / 495) * 100))}%`,
                }}
              />
            </div>
          </Card>

          <Card className="p-4 rounded-2xl border border-border bg-surface">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-secondary">Điểm phần Đọc (Reading)</span>
              <span className="text-xs font-semibold text-emerald-600">ETS Scaled</span>
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {readingScore ?? 0} / 495 điểm
            </div>
            <div className="w-full bg-surface-subtle h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.round(((readingScore ?? 0) / 495) * 100))}%`,
                }}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
