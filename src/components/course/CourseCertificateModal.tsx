'use client'

import { Download, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CourseCertificateModalProps {
  courseTitle: string
  progressPercent: number
  completedLessons: number
  totalLessons: number
  onClose: () => void
}

export function CourseCertificateModal({
  courseTitle,
  progressPercent,
  completedLessons,
  totalLessons,
  onClose,
}: CourseCertificateModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl border border-primary/30 bg-surface p-8 shadow-2xl space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Trophy size={36} />
        </div>
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-widest text-primary">
            Chứng Nhận Hoàn Thành
          </div>
          <h3 className="text-xl font-black text-text-primary">{courseTitle}</h3>
          <p className="text-xs text-text-secondary max-w-md mx-auto">
            Chứng chỉ điện tử chính thức được cấp bởi Viện Đào Tạo Tiếng Anh Tư Duy LingoSphere với mã định danh quốc tế.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface-subtle p-4 text-xs font-medium text-text-secondary">
          Tiến độ hiện tại của bạn: <strong className="text-primary">{progressPercent}%</strong> ({completedLessons}/{totalLessons} bài học)
        </div>
        <div className="flex justify-center gap-3">
          <Button variant="ghost" onClick={onClose} className="text-xs rounded-xl">
            Đóng
          </Button>
          <Button
            onClick={onClose}
            className="bg-primary text-white hover:bg-primary-hover text-xs rounded-xl px-6 gap-2"
          >
            <Download size={14} />
            Tải chứng chỉ PDF
          </Button>
        </div>
      </div>
    </div>
  )
}
