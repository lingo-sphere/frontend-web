
import { useTranslation } from 'react-i18next'
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import type { TestResult } from '@/types/course'

interface TestResultDialogProps {
  isOpen: boolean
  onClose: () => void
  result: TestResult | null
  testType: string
  baseline?: {
    listening: number
    reading: number
    speaking: number
    writing: number
  }
}

export function TestResultDialog({ isOpen, onClose, result, testType, baseline }: TestResultDialogProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  if (!result) return null

  const getImprovementIcon = (improvement?: number) => {
    if (!improvement) return <Minus className="h-4 w-4 text-text-tertiary" />
    if (improvement > 0) return <TrendingUp className="h-4 w-4 text-success" />
    return <TrendingDown className="h-4 w-4 text-error" />
  }

  const getImprovementColor = (improvement?: number) => {
    if (!improvement) return 'text-text-secondary'
    if (improvement > 0) return 'text-success'
    return 'text-error'
  }

  const testTitles = {
    'pre-test': isVietnamese ? 'Kết quả bài đầu vào' : 'Pre-test Result',
    'challenge': isVietnamese ? 'Kết quả bài thử thách' : 'Challenge Test Result',
    'exercise': isVietnamese ? 'Kết quả bài tập chương' : 'Chapter Exercise Result',
    'post-mini': isVietnamese ? 'Kết quả bài kiểm tra' : 'Post-mini Test Result',
    'final': isVietnamese ? 'Kết quả bài cuối khóa' : 'Final Test Result',
  }

  const skillLabels = {
    listening: isVietnamese ? 'Nghe' : 'Listening',
    reading: isVietnamese ? 'Đọc' : 'Reading',
    speaking: isVietnamese ? 'Nói' : 'Speaking',
    writing: isVietnamese ? 'Viết' : 'Writing',
  }

  const hasScores = result.listeningScore !== undefined || result.readingScore !== undefined

  return (
    <Modal open={isOpen} onClose={onClose} title={testTitles[testType as keyof typeof testTitles] || (isVietnamese ? 'Kết quả bài kiểm tra' : 'Test Result')} size="lg">
      <div className="relative rounded-2xl bg-surface p-6">
        <div className="mb-6 text-center">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${result.score >= 70 ? 'bg-success/20' : 'bg-warning/20'}`}>
            <Trophy className={`h-8 w-8 ${result.score >= 70 ? 'text-success' : 'text-warning'}`} />
          </div>
          <p className="mt-1 text-[14px] text-text-secondary">
            {result.score >= 70
              ? (isVietnamese ? 'Tuyệt vời! Bạn đã đạt yêu cầu!' : 'Great job! You passed!')
              : (isVietnamese ? 'Tiếp tục luyện tập để cải thiện!' : 'Keep practicing to improve!')}
          </p>
        </div>

        <Card className={`mb-6 border ${result.score >= 70 ? 'border-success/30 bg-success-soft/30' : 'border-warning/30 bg-warning-soft/30'}`}>
          <CardContent className="p-6 text-center">
            <p className="text-[48px] font-bold" style={{ color: result.score >= 70 ? 'var(--success)' : 'var(--warning)' }}>
              {result.score}%
            </p>
            <p className="text-[14px] text-text-secondary">{isVietnamese ? 'Điểm tổng' : 'Overall Score'}</p>
          </CardContent>
        </Card>

        {hasScores && (
          <div className="mb-6">
            <h3 className="mb-3 text-[14px] font-semibold text-text-primary">{isVietnamese ? 'Chi tiết kỹ năng' : 'Skill Breakdown'}</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {result.listeningScore !== undefined && (
                <Card className="border-border bg-surface">
                  <CardContent className="p-3 text-center">
                    <p className="text-[24px] font-bold text-primary">{result.listeningScore}%</p>
                    <p className="text-[11px] text-text-secondary">{skillLabels.listening}</p>
                    {baseline && (
                      <p className={`mt-1 flex items-center justify-center gap-1 text-[11px] ${getImprovementColor(result.listeningScore - baseline.listening)}`}>
                        {getImprovementIcon(result.listeningScore - baseline.listening)}
                        {result.listeningScore - baseline.listening > 0 ? '+' : ''}{result.listeningScore - baseline.listening}%
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
              {result.readingScore !== undefined && (
                <Card className="border-border bg-surface">
                  <CardContent className="p-3 text-center">
                    <p className="text-[24px] font-bold text-primary">{result.readingScore}%</p>
                    <p className="text-[11px] text-text-secondary">{skillLabels.reading}</p>
                    {baseline && (
                      <p className={`mt-1 flex items-center justify-center gap-1 text-[11px] ${getImprovementColor(result.readingScore - baseline.reading)}`}>
                        {getImprovementIcon(result.readingScore - baseline.reading)}
                        {result.readingScore - baseline.reading > 0 ? '+' : ''}{result.readingScore - baseline.reading}%
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
              {result.speakingScore !== undefined && (
                <Card className="border-border bg-surface">
                  <CardContent className="p-3 text-center">
                    <p className="text-[24px] font-bold text-primary">{result.speakingScore}%</p>
                    <p className="text-[11px] text-text-secondary">{skillLabels.speaking}</p>
                    {baseline && (
                      <p className={`mt-1 flex items-center justify-center gap-1 text-[11px] ${getImprovementColor(result.speakingScore - baseline.speaking)}`}>
                        {getImprovementIcon(result.speakingScore - baseline.speaking)}
                        {result.speakingScore - baseline.speaking > 0 ? '+' : ''}{result.speakingScore - baseline.speaking}%
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
              {result.writingScore !== undefined && (
                <Card className="border-border bg-surface">
                  <CardContent className="p-3 text-center">
                    <p className="text-[24px] font-bold text-primary">{result.writingScore}%</p>
                    <p className="text-[11px] text-text-secondary">{skillLabels.writing}</p>
                    {baseline && (
                      <p className={`mt-1 flex items-center justify-center gap-1 text-[11px] ${getImprovementColor(result.writingScore - baseline.writing)}`}>
                        {getImprovementIcon(result.writingScore - baseline.writing)}
                        {result.writingScore - baseline.writing > 0 ? '+' : ''}{result.writingScore - baseline.writing}%
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {result.improvement !== undefined && (
          <Card className="mb-6 border-ai/30 bg-ai-soft/30">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-[14px] font-semibold text-text-primary">{isVietnamese ? 'Cải thiện' : 'Improvement'}</p>
                <p className="text-[12px] text-text-secondary">{isVietnamese ? 'So với kết quả trước' : 'Compared to previous result'}</p>
              </div>
              <p className={`text-[24px] font-bold ${getImprovementColor(result.improvement)}`}>
                {result.improvement > 0 ? '+' : ''}{result.improvement}%
              </p>
            </CardContent>
          </Card>
        )}

        {!baseline && hasScores && (
          <Card className="mb-6 border-warning/30 bg-warning-soft/30">
            <CardContent className="p-4">
              <p className="text-[13px] text-warning">
                ⚠️ {isVietnamese ? 'Chưa có dữ liệu để so sánh.' : 'No data available for comparison.'}
              </p>
              <p className="mt-1 text-[12px] text-text-secondary">
                {isVietnamese ? 'Hoàn thành nhiều chương hơn để xem so sánh tiến độ.' : 'Complete more chapters to see your progress comparison.'}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={onClose}>{isVietnamese ? 'Đóng' : 'Close'}</Button>
          <Button className="bg-primary hover:bg-primary-hover" onClick={onClose}>
            {isVietnamese ? 'Tiếp tục học' : 'Continue Learning'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
