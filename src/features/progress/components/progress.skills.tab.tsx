// Component hiển thị phân tích kỹ năng TOEIC 4 kỹ năng và tiến độ từ vựng ngắt quãng SRS

import { GraduationCap, Brain, Mic } from 'lucide-react'
import { Card } from '@/components/card'
import { Button } from '@/components/button'
import type { VocabStatsSummary } from '@/features/progress/hooks/use.progress.data'

interface ProgressSkillsTabProps {
  listeningScore: number
  readingScore: number
  speakingScore?: number
  writingScore?: number
  selectedSkillsType?: '2SKILLS' | '4SKILLS'
  vocabStats: VocabStatsSummary
  onNavigate: (path: string) => void
}

export function ProgressSkillsTab({
  listeningScore,
  readingScore,
  speakingScore = 0,
  writingScore = 0,
  vocabStats,
  onNavigate,
}: ProgressSkillsTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="dashboard-card p-5 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-primary">Năng lực khảo thí TOEIC</span>
              <h4 className="text-sm font-bold text-text-primary">Kỹ năng Nghe & Đọc (L&R)</h4>
            </div>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <GraduationCap size={18} />
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="p-3.5 rounded-xl border border-border bg-surface-subtle/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-text-primary block">Listening (Nghe hiểu)</span>
                <span className="text-[11px] text-text-tertiary">Part 1, 2, 3, 4</span>
              </div>
              <span className="text-base font-black text-indigo-600">
                {listeningScore > 0 ? `${listeningScore} / 495` : '-- / 495'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-surface-subtle/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-text-primary block">Reading (Đọc hiểu)</span>
                <span className="text-[11px] text-text-tertiary">Part 5, 6, 7</span>
              </div>
              <span className="text-base font-black text-emerald-600">
                {readingScore > 0 ? `${readingScore} / 495` : '-- / 495'}
              </span>
            </div>
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

      <Card className="dashboard-card p-5 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400">TOEIC 4 Kỹ Năng</span>
              <h4 className="text-sm font-bold text-text-primary">Kỹ năng Nói & Viết (S&W)</h4>
            </div>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Mic size={18} />
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="p-3.5 rounded-xl border border-border bg-surface-subtle/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-text-primary block">Speaking (Nói)</span>
                <span className="text-[11px] text-text-tertiary">Phát âm, ngữ điệu & miêu tả</span>
              </div>
              <span className="text-base font-black text-teal-600 dark:text-teal-400">
                {speakingScore > 0 ? `${speakingScore} / 200` : '-- / 200'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-surface-subtle/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-text-primary block">Writing (Viết)</span>
                <span className="text-[11px] text-text-tertiary">Viết câu, viết thư & viết luận</span>
              </div>
              <span className="text-base font-black text-amber-600 dark:text-amber-400">
                {writingScore > 0 ? `${writingScore} / 200` : '-- / 200'}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 grid grid-cols-2 gap-2">
          <Button
            onClick={() => onNavigate('/speaking')}
            variant="outline"
            className="w-full text-xs font-bold rounded-xl cursor-pointer"
          >
            Luyện Nói
          </Button>
          <Button
            onClick={() => onNavigate('/writing')}
            variant="outline"
            className="w-full text-xs font-bold rounded-xl cursor-pointer"
          >
            Luyện Viết
          </Button>
        </div>
      </Card>

      <Card className="dashboard-card p-5 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
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
