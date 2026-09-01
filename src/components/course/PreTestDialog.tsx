/**
 * @file PreTestDialog.tsx
 * @description Component giao diện React PreTestDialog cho học viên
 */

import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import type { BaselineScore, TestResult } from '@/types/course'

interface PreTestDialogProps {
  isOpen: boolean
  onClose: () => void
  hasBaseline: boolean
  baseline: BaselineScore | null
  onComplete: (result: TestResult) => void
}

export function PreTestDialog({ isOpen, onClose, hasBaseline, baseline, onComplete }: PreTestDialogProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const handleTakeTest = (_type: '4skills' | '2skills') => {
    const result: TestResult = {
      testType: 'pre',
      score: 62,
      listeningScore: 60,
      readingScore: 64,
      speakingScore: 58,
      writingScore: 65,
      completedAt: new Date().toISOString(),
    }
    onComplete(result)
  }

  const handleSkip = () => {
    onClose()
  }

  return (
    <Modal open={isOpen} onClose={onClose} title={isVietnamese ? 'Bài kiểm tra đầu vào' : 'Course Pre-test'} size="lg">
      <div className="space-y-4">
        {!hasBaseline && (
          <Card className="border-warning/30 bg-warning-soft/50">
            <CardContent className="p-4">
              <p className="text-[14px] text-warning">
                ⚠️ {isVietnamese ? 'Bạn chưa có điểm cơ sở.' : 'Your baseline has not been established yet.'}
              </p>
              <p className="mt-1 text-[12px] text-text-secondary">
                {isVietnamese ? 'Làm bài kiểm tra đầu vào để theo dõi sự tiến bộ.' : 'Taking the pre-test helps track your improvement throughout the course.'}
              </p>
            </CardContent>
          </Card>
        )}

        {hasBaseline && baseline && (
          <Card className="border-primary/30 bg-primary-soft/50">
            <CardContent className="p-4">
              <h3 className="mb-3 text-[14px] font-semibold text-text-primary">
                {isVietnamese ? 'Điểm cơ sở của bạn' : 'Your Baseline'}
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="text-center">
                  <p className="text-[20px] font-bold text-primary">{baseline.listening}%</p>
                  <p className="text-[11px] text-text-secondary">{isVietnamese ? 'Nghe' : 'Listening'}</p>
                </div>
                <div className="text-center">
                  <p className="text-[20px] font-bold text-primary">{baseline.reading}%</p>
                  <p className="text-[11px] text-text-secondary">{isVietnamese ? 'Đọc' : 'Reading'}</p>
                </div>
                <div className="text-center">
                  <p className="text-[20px] font-bold text-primary">{baseline.speaking}%</p>
                  <p className="text-[11px] text-text-secondary">{isVietnamese ? 'Nói' : 'Speaking'}</p>
                </div>
                <div className="text-center">
                  <p className="text-[20px] font-bold text-primary">{baseline.writing}%</p>
                  <p className="text-[11px] text-text-secondary">{isVietnamese ? 'Viết' : 'Writing'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          <h3 className="text-[14px] font-semibold text-text-primary">{isVietnamese ? 'Chọn loại bài kiểm tra:' : 'Choose test type:'}</h3>

          <Card className="cursor-pointer border-border transition-colors hover:border-primary/50 hover:bg-primary-soft/20">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-[15px] font-semibold text-text-primary">{isVietnamese ? 'Bài kiểm tra - 4 kỹ năng' : 'Pre-test - 4 Skills'}</p>
                <p className="text-[12px] text-text-secondary">
                  {isVietnamese ? 'Nghe, Đọc, Nói, Viết' : 'Listening, Reading, Speaking, Writing'}
                </p>
              </div>
              <Button size="sm" className="bg-primary hover:bg-primary-hover" onClick={() => handleTakeTest('4skills')}>
                {isVietnamese ? 'Bắt đầu' : 'Start'}
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer border-border transition-colors hover:border-primary/50 hover:bg-primary-soft/20">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-[15px] font-semibold text-text-primary">{isVietnamese ? 'Bài kiểm tra - 2 kỹ năng' : 'Pre-test - 2 Skills'}</p>
                <p className="text-[12px] text-text-secondary">
                  {isVietnamese ? 'Nghe, Đọc' : 'Listening, Reading only'}
                </p>
              </div>
              <Button size="sm" className="bg-primary hover:bg-primary-hover" onClick={() => handleTakeTest('2skills')}>
                {isVietnamese ? 'Bắt đầu' : 'Start'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center pt-2">
          <Button variant="ghost" className="text-[13px] text-text-secondary" onClick={handleSkip}>
            {isVietnamese ? 'Bỏ qua' : 'Skip for now'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
