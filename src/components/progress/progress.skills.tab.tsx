// Component hiển thị phân tích kỹ năng TOEIC và tiến độ từ vựng ngắt quãng SRS

import { GraduationCap, Brain } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { VocabStatsSummary } from '@/hooks/use.progress.data'

interface ProgressSkillsTabProps {
  listeningScore: number
  readingScore: number
  vocabStats: VocabStatsSummary
  onNavigate: (path: string) => void
}

export function ProgressSkillsTab({
  listeningScore,
  readingScore,
  vocabStats,
  onNavigate,
}: ProgressSkillsTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="dashboard-card p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-primary">Năng lực khảo thí TOEIC</span>
            <h4 className="text-sm font-bold text-text-primary">Kỹ năng Nghe & Đọc (LR)</h4>
          </div>
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <GraduationCap size={18} />
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <div className="p-3.5 rounded-xl border border-border bg-surface-subtle/50 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-text-primary block">Listening (Kỹ năng Nghe)</span>
              <span className="text-[11px] text-text-tertiary">Part 1, 2, 3, 4</span>
            </div>
            <span className="text-base font-black text-indigo-600">
              {listeningScore > 0 ? `${listeningScore} / 495` : '-- / 495'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-surface-subtle/50 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-text-primary block">Reading (Kỹ năng Đọc)</span>
              <span className="text-[11px] text-text-tertiary">Part 5, 6, 7</span>
            </div>
            <span className="text-base font-black text-emerald-600">
              {readingScore > 0 ? `${readingScore} / 495` : '-- / 495'}
            </span>
          </div>
        </div>

        <div className="pt-2">
          <Button
            onClick={() => onNavigate('/toeic')}
            className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Luyện đề thi TOEIC
          </Button>
        </div>
      </Card>

      <Card className="dashboard-card p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-amber-600">Từ vựng & Trí nhớ ngắt quãng</span>
            <h4 className="text-sm font-bold text-text-primary">Spaced Repetition (SRS)</h4>
          </div>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
            <Brain size={18} />
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <div className="p-3.5 rounded-xl border border-border bg-surface-subtle/50 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-text-primary block">Từ vựng đã ghi nhớ:</span>
              <span className="text-[11px] text-text-tertiary">Đã lưu vào bộ nhớ dài hạn</span>
            </div>
            <span className="text-base font-black text-amber-600">
              {vocabStats.learned_words} từ
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-surface-subtle/50 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-text-primary block">Thẻ cần ôn tập hôm nay:</span>
              <span className="text-[11px] text-text-tertiary">Lặp lại ngắt quãng SRS</span>
            </div>
            <span className="text-base font-black text-rose-600">
              {vocabStats.review_due} thẻ
            </span>
          </div>
        </div>

        <div className="pt-2">
          <Button
            onClick={() => onNavigate('/vocabulary')}
            variant="outline"
            className="w-full text-xs font-semibold rounded-xl cursor-pointer"
          >
            Vào học Từ Vựng
          </Button>
        </div>
      </Card>
    </div>
  )
}
