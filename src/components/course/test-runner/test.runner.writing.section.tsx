'use client'

import { useState, useRef } from 'react'
import {
  PenTool,
  UploadCloud,
  FileText,
  CheckCircle,
  Send,
  Loader2,
  CheckCircle2,
  FileDown,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { courseService } from '@/services/course.service'
import { toast } from '@/store/toast-store'

interface TestRunnerWritingSectionProps {
  courseId: string
  moduleId?: string
  testType: string
  prompt: string
  fileUrl?: string
  onScoreUpdated?: (score: number) => void
}

export function TestRunnerWritingSection({
  courseId,
  moduleId,
  testType,
  prompt,
  fileUrl,
  onScoreUpdated,
}: TestRunnerWritingSectionProps) {
  const [essayText, setEssayText] = useState('')
  const [writingInputMode, setWritingInputMode] = useState<'TYPE' | 'UPLOAD'>('TYPE')
  const [uploadedEssayFileName, setUploadedEssayFileName] = useState<string | null>(null)
  const essayFileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmittingWriting, setIsSubmittingWriting] = useState(false)
  const [writingResult, setWritingResult] = useState<any>(null)

  const handleEssayFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!/\.(txt|md|docx|doc|pdf)$/i.test(file.name)) {
      toast.error('Chỉ chấp nhận file văn bản (.txt, .md, .docx, .doc, .pdf)')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Dung lượng file không được vượt quá 10MB')
      return
    }

    setUploadedEssayFileName(file.name)
    setWritingResult(null)

    if (/\.(txt|md)$/i.test(file.name)) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        if (content) {
          setEssayText(content.trim())
          toast.success(`Đã đọc nội dung bài viết từ file: ${file.name}`)
        }
      }
      reader.readAsText(file)
    } else {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        if (text && text.length > 20) {
          const sanitized = text
            .replace(/[^\x20-\x7E\s\n\r\t]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
          if (sanitized.length > 15) {
            setEssayText(sanitized)
          } else {
            setEssayText(
              `[Tệp đính kèm: ${file.name}]\n\nNội dung bài luận tiếng Anh của học viên đính kèm từ tệp ${file.name}.`
            )
          }
        } else {
          setEssayText(
            `[Tệp đính kèm: ${file.name}]\n\nNội dung bài luận tiếng Anh của học viên đính kèm từ tệp ${file.name}.`
          )
        }
        toast.success(`Đã đính kèm file bài viết: ${file.name}`)
      }
      reader.readAsText(file)
    }
  }

  const resetEssayFile = () => {
    setUploadedEssayFileName(null)
    setEssayText('')
    setWritingResult(null)
    if (essayFileInputRef.current) essayFileInputRef.current.value = ''
  }

  const handleSubmitWriting = async () => {
    if (!essayText.trim()) return
    setIsSubmittingWriting(true)
    try {
      const res = await courseService.submitWritingSubmission(courseId, {
        essay_text: essayText,
        module_id: moduleId,
        test_type: testType.toUpperCase(),
        prompt: prompt,
      })
      setWritingResult(res)
      if (res?.ai_score !== undefined) {
        onScoreUpdated?.(res.ai_score)
      }
      toast.success('Đã nộp bài viết thành công! AI đã hoàn tất phân tích bài luận.')
    } catch {
      toast.error('Lỗi khi nộp bài viết. Vui lòng thử lại.')
    } finally {
      setIsSubmittingWriting(false)
    }
  }

  const essayWordCount = essayText.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="space-y-5">
      <div className="p-4.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-200">
            <PenTool className="h-4 w-4 text-indigo-600" />
            <span>Đề bài viết luận Writing:</span>
          </div>
          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <FileDown size={13} />
              <span>Xem file đề bài đính kèm</span>
              <ExternalLink size={11} />
            </a>
          )}
        </div>

        <p className="text-xs text-indigo-900 dark:text-indigo-100 font-medium leading-relaxed whitespace-pre-line">
          &ldquo;{prompt}&rdquo;
        </p>
      </div>

      <div className="flex items-center gap-1.5 p-1 bg-surface-subtle border border-border rounded-2xl w-full max-w-sm mx-auto">
        <button
          type="button"
          onClick={() => setWritingInputMode('TYPE')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            writingInputMode === 'TYPE'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <PenTool size={13} />
          <span>Soạn thảo trực tiếp</span>
        </button>
        <button
          type="button"
          onClick={() => setWritingInputMode('UPLOAD')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            writingInputMode === 'UPLOAD'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <UploadCloud size={13} />
          <span>Tải file bài viết</span>
        </button>
      </div>

      <input
        ref={essayFileInputRef}
        type="file"
        accept=".txt,.md,.docx,.doc,.pdf,text/plain"
        onChange={handleEssayFileSelect}
        className="hidden"
      />

      {writingInputMode === 'UPLOAD' && !writingResult && (
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/70 dark:bg-indigo-950/20 dark:border-indigo-700/60 dark:hover:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 transition-all space-y-2 text-center">
          <button
            type="button"
            onClick={() => essayFileInputRef.current?.click()}
            className="flex flex-col items-center gap-2 cursor-pointer w-full"
          >
            <FileText className="h-9 w-9 text-indigo-500" />
            <span className="text-xs font-bold">Bấm để chọn file bài viết từ thiết bị</span>
            <span className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80">
              Hỗ trợ .txt, .md, .docx, .doc, .pdf (tối đa 10MB)
            </span>
          </button>

          {uploadedEssayFileName && (
            <div className="flex items-center gap-2 pt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle size={14} />
              <span>Đã nạp file: {uploadedEssayFileName}</span>
              <button
                type="button"
                onClick={resetEssayFile}
                className="text-rose-500 hover:underline text-[11px] ml-1 cursor-pointer"
              >
                (Đổi file khác)
              </button>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-text-secondary">
            {writingInputMode === 'UPLOAD'
              ? 'Nội dung bài viết đã nạp từ file:'
              : 'Khung soạn thảo bài viết:'}
          </label>
          <span
            className={`font-bold px-2 py-0.5 rounded-md ${
              essayWordCount >= 80 && essayWordCount <= 150
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-surface-subtle text-text-tertiary'
            }`}
          >
            Đã viết: {essayWordCount} từ {essayWordCount < 80 ? '(Tối thiểu 80 từ)' : ''}
          </span>
        </div>

        <textarea
          rows={7}
          disabled={Boolean(writingResult)}
          value={essayText}
          onChange={(e) => setEssayText(e.target.value)}
          placeholder="Gõ bài viết tiếng Anh của bạn tại đây hoặc tải file bài viết ở trên..."
          className="w-full p-4 rounded-2xl border border-border bg-surface text-xs text-text-primary leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-primary"
        />

        {!writingResult && (
          <Button
            type="button"
            disabled={isSubmittingWriting || essayWordCount < 10}
            onClick={handleSubmitWriting}
            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmittingWriting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>AI đang phân tích ngữ pháp & từ vựng...</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>Nộp bài luận để AI chấm</span>
              </>
            )}
          </Button>
        )}
      </div>

      {writingResult && (
        <div className="p-5 rounded-2xl bg-surface border border-indigo-500/40 shadow-xs space-y-3.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <CheckCircle2 size={16} />
              <span>Kết quả đánh giá bài viết sơ bộ</span>
            </div>
            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-xl">
              {writingResult.ai_score}/100 điểm
            </span>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed">
            {writingResult.ai_feedback?.detailed_comment}
          </p>

          {Array.isArray(writingResult.ai_feedback?.improvement_tips) && (
            <div className="p-3.5 rounded-xl bg-surface-subtle border border-border space-y-1.5 text-xs">
              <span className="font-bold text-primary block">💡 Gợi ý cải thiện:</span>
              <ul className="list-disc pl-4 space-y-1 text-text-secondary">
                {writingResult.ai_feedback.improvement_tips.map((tip: string, tIdx: number) => (
                  <li key={tIdx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
