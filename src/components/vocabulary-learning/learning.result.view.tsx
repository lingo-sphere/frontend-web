/**
 * @file LearningResultView.tsx
 * @description Component giao diện React LearningResultView cho học viên
 */

import { useTranslation } from 'react-i18next'
import { ChevronRight, RotateCcw, Home } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { LearningResult, VocabularyItem } from '@/types/vocabulary-learn'

interface LearningResultViewProps {
  result: LearningResult
  onRetry: () => void
  onBackToHome: () => void
  onAction: (message: string) => void
}

export function LearningResultView({ result, onRetry, onBackToHome, onAction }: LearningResultViewProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const { totalWords, correctAnswers, accuracy, skillBreakdown, weakWords } = result

  const getAccuracyColor = (acc: number) => {
    if (acc >= 90) return 'text-success'
    if (acc >= 70) return 'text-primary'
    if (acc >= 50) return 'text-warning'
    return 'text-error'
  }

  const getAccuracyMessage = (acc: number) => {
    if (acc >= 90) return isVietnamese ? 'Xuất sắc!' : 'Excellent!'
    if (acc >= 80) return isVietnamese ? 'Tuyệt vời!' : 'Great job!'
    if (acc >= 70) return isVietnamese ? 'Làm tốt lắm!' : 'Good work!'
    if (acc >= 50) return isVietnamese ? 'Tiếp tục luyện tập!' : 'Keep practicing!'
    return isVietnamese ? 'Đừng bỏ cuộc!' : "Don't give up!"
  }

  const skillLabels = {
    meaning: isVietnamese ? 'Nghĩa' : 'Meaning',
    spelling: isVietnamese ? 'Chính tả' : 'Spelling',
    listening: isVietnamese ? 'Nghe' : 'Listening',
    pronunciation: isVietnamese ? 'Phát âm' : 'Pronunciation',
    context: isVietnamese ? 'Ngữ cảnh' : 'Context',
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mb-4 text-6xl">{accuracy >= 80 ? '🎉' : accuracy >= 50 ? '💪' : '📚'}</div>
        <h1 className="text-[28px] font-bold text-text-primary">{getAccuracyMessage(accuracy)}</h1>
        <p className="mt-2 text-[14px] text-text-secondary">
          {isVietnamese ? 'Bạn đã hoàn thành phiên học từ vựng.' : 'You completed your vocabulary session.'}
        </p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <Card className="dashboard-card">
          <CardContent className="p-4 text-center">
            <p className="text-[32px] font-bold text-text-primary">{totalWords}</p>
            <p className="text-[12px] text-text-secondary">{isVietnamese ? 'Từ đã luyện' : 'Words practiced'}</p>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="p-4 text-center">
            <p className="text-[32px] font-bold text-success">{correctAnswers}</p>
            <p className="text-[12px] text-text-secondary">{isVietnamese ? 'Đúng' : 'Correct'}</p>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="p-4 text-center">
            <p className={`text-[32px] font-bold ${getAccuracyColor(accuracy)}`}>{accuracy}%</p>
            <p className="text-[12px] text-text-secondary">{isVietnamese ? 'Độ chính xác' : 'Accuracy'}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="dashboard-card mb-6">
        <CardContent className="p-5">
          <h3 className="mb-4 text-[16px] font-semibold text-text-primary">
            {isVietnamese ? 'Tiến bộ của bạn' : 'Your Progress'}
          </h3>
          <div className="space-y-3">
            <SkillBar label={skillLabels.meaning} value={skillBreakdown.meaning} />
            <SkillBar label={skillLabels.spelling} value={skillBreakdown.spelling} />
            <SkillBar label={skillLabels.listening} value={skillBreakdown.listening} />
            <SkillBar label={skillLabels.pronunciation} value={skillBreakdown.pronunciation} />
            <SkillBar label={skillLabels.context} value={skillBreakdown.context} />
          </div>
        </CardContent>
      </Card>

      {weakWords.length > 0 && (
        <Card className="dashboard-card mb-6">
          <CardContent className="p-5">
            <h3 className="mb-4 text-[16px] font-semibold text-text-primary">
              {isVietnamese ? 'Từ cần ôn tập' : 'Words to review'} ({weakWords.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {weakWords.map((word: VocabularyItem) => (
                <button key={word.id}
                  className="rounded-full bg-error/10 px-3 py-1.5 text-[13px] font-medium text-error transition-colors hover:bg-error/20"
                  onClick={() => onAction(`${isVietnamese ? 'Ôn tập:' : 'Reviewing:'} ${word.word}`)}>
                  {word.word}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        {weakWords.length > 0 && (
          <Button className="flex-1 gap-2 bg-error hover:bg-error-hover"
            onClick={() => onAction(isVietnamese ? 'Bắt đầu ôn tập từ yếu' : 'Starting weak words review')}>
            {isVietnamese ? 'Ôn từ yếu' : 'Review Weak Words'}
            <ChevronRight size={18} />
          </Button>
        )}
        <Button variant="outline" className="flex-1 gap-2" onClick={onRetry}>
          <RotateCcw size={18} />
          {isVietnamese ? 'Thử lại' : 'Try Again'}
        </Button>
        <Button variant="outline" className="flex-1 gap-2" onClick={onBackToHome}>
          <Home size={18} />
          {isVietnamese ? 'Quay về Từ vựng' : 'Back to Vocabulary'}
        </Button>
      </div>
    </div>
  )
}

function SkillBar({ label, value }: { label: string; value: number }) {
  const getColor = (val: number) => {
    if (val >= 90) return 'bg-success'
    if (val >= 70) return 'bg-primary'
    if (val >= 50) return 'bg-warning'
    return 'bg-error'
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-text-secondary">{label}</span>
        <span className="font-semibold text-text-primary">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
        <div className={`h-full rounded-full transition-all ${getColor(value)}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
