/**
 * @file ToeicModeSelector.tsx
 * @description Component giao diện React ToeicModeSelector cho học viên
 */

import { useTranslation } from 'react-i18next'
import { ArrowLeft, Trophy, Clock, Headphones, BookOpen, Settings, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export type PracticeMode = 'FULL' | 'LISTENING' | 'READING' | 'PART'

interface ToeicModeSelectorProps {
  title: string
  description?: string
  onSelectMode: (mode: PracticeMode, parts: number[], timed: boolean) => void
  onBack: () => void
}

export function ToeicModeSelector({
  title,
  description,
  onSelectMode,
  onBack,
}: ToeicModeSelectorProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  return (
    <div className="min-h-screen bg-surface-secondary px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-[14px] text-text-secondary hover:text-primary"
        >
          <ArrowLeft size={18} />
          {isVietnamese ? 'Quay lại danh sách đề' : 'Back to exam list'}
        </button>

        <Card className="dashboard-card mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-warning/10">
                <Trophy className="h-8 w-8 text-warning" />
              </div>
              <div>
                <h1 className="text-[20px] font-bold text-text-primary">{title}</h1>
                {description && <p className="text-[13px] text-text-secondary">{description}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="mb-4 text-[16px] font-semibold text-text-primary">
          {isVietnamese ? 'Chọn chế độ luyện tập' : 'Choose practice mode'}
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Card
            className="dashboard-card cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
            onClick={() => onSelectMode('FULL', [1, 2, 3, 4, 5, 6, 7], true)}
          >
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                  <Trophy className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-text-primary">
                    {isVietnamese ? 'Luyện Full đề' : 'Full Test'}
                  </h3>
                  <p className="text-[12px] text-text-secondary">
                    7 Parts (200 {isVietnamese ? 'câu' : 'questions'})
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-[12px] text-text-secondary">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-text-tertiary" />
                  <span>
                    {isVietnamese ? 'Thời gian:' : 'Time:'} ~135 {isVietnamese ? 'phút' : 'min'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Headphones size={14} className="text-text-tertiary" />
                  <span>
                    Listening: 100 {isVietnamese ? 'câu' : 'q'} (45 {isVietnamese ? 'phút' : 'min'})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className="text-text-tertiary" />
                  <span>
                    Reading: 100 {isVietnamese ? 'câu' : 'q'} (75 {isVietnamese ? 'phút' : 'min'})
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="dashboard-card cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
            onClick={() => onSelectMode('LISTENING', [1, 2, 3, 4], true)}
          >
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
                  <Headphones className="h-6 w-6 text-info" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-text-primary">
                    {isVietnamese ? 'Luyện Nghe' : 'Listening Practice'}
                  </h3>
                  <p className="text-[12px] text-text-secondary">
                    Part 1-4 (100 {isVietnamese ? 'câu' : 'questions'})
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-[12px] text-text-secondary">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-text-tertiary" />
                  <span>
                    {isVietnamese ? 'Thời gian:' : 'Time:'} ~45 {isVietnamese ? 'phút' : 'min'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="dashboard-card cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
            onClick={() => onSelectMode('READING', [5, 6, 7], true)}
          >
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-text-primary">
                    {isVietnamese ? 'Luyện Đọc' : 'Reading Practice'}
                  </h3>
                  <p className="text-[12px] text-text-secondary">
                    Part 5-7 (100 {isVietnamese ? 'câu' : 'questions'})
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-[12px] text-text-secondary">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-text-tertiary" />
                  <span>
                    {isVietnamese ? 'Thời gian:' : 'Time:'} 75 {isVietnamese ? 'phút' : 'min'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald/10">
                  <Settings className="h-6 w-6 text-emerald" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-text-primary">
                    {isVietnamese ? 'Luyện từng Part' : 'Practice by Part'}
                  </h3>
                  <p className="text-[12px] text-text-secondary">
                    {isVietnamese ? 'Chọn Part cụ thể' : 'Select specific Part'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((part) => (
                  <button
                    key={part}
                    onClick={() => onSelectMode('PART', [part], false)}
                    className="rounded-lg bg-surface-subtle px-2 py-1.5 text-[11px] font-medium text-text-primary hover:bg-surface-hover"
                  >
                    Part {part}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-text-tertiary">
                {isVietnamese
                  ? 'Không giới hạn thời gian khi luyện từng part'
                  : 'No time limit when practicing by part'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="dashboard-card mt-6 border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <h3 className="mb-3 flex items-center gap-2 text-[14px] font-semibold text-amber-800">
              <AlertCircle size={16} />
              {isVietnamese ? 'Mẹo phân bổ thời gian TOEIC' : 'TOEIC Time Management Tips'}
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg bg-white/50 p-3">
                <p className="text-[12px] font-medium text-amber-900">
                  📖 Part 5 (30 {isVietnamese ? 'câu' : 'questions'})
                </p>
                <p className="text-[11px] text-amber-700">
                  {isVietnamese
                    ? '18 phút → 36 giây/câu. Đọc nhanh, không suy nghĩ quá lâu.'
                    : '18 min → 36 sec/question. Read fast, do not overthink.'}
                </p>
              </div>
              <div className="rounded-lg bg-white/50 p-3">
                <p className="text-[12px] font-medium text-amber-900">
                  📄 Part 6 (16 {isVietnamese ? 'câu' : 'questions'})
                </p>
                <p className="text-[11px] text-amber-700">
                  {isVietnamese
                    ? '18 phút → 1+ phút/câu. Đọc passage trước rồi mới trả lời.'
                    : '18 min → 1+ min/question. Read passage first, then answer.'}
                </p>
              </div>
              <div className="rounded-lg bg-white/50 p-3 md:col-span-2">
                <p className="text-[12px] font-medium text-amber-900">
                  📚 Part 7 (54 {isVietnamese ? 'câu' : 'questions'})
                </p>
                <p className="text-[11px] text-amber-700">
                  {isVietnamese
                    ? '60 phút → hơn 1 phút/câu. Đọc câu hỏi trước → tìm keyword → đọc passage.'
                    : '60 min → over 1 min/question. Read questions first → find keywords → read passage.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
