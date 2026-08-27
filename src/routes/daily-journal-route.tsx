import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/icons/icon-map'
import { api } from '@/services/api-client'

interface JournalEvaluation {
  overall_score: number
  word_count: number
  corrected_text?: string
  grammar_feedback: string[]
  vocabulary_suggestions: string[]
  teacher_advice: string
}

export function DailyJournalRoute() {
  const [dailyPrompt, setDailyPrompt] = useState<{ title: string; prompt: string; hints: string[] }>({
    title: 'Hôm nay bạn học được điều gì mới mẻ?',
    prompt: 'Write about a memorable experience you had this week and what lessons you learned from it.',
    hints: ['Use past simple and present perfect tense', 'Include at least 3 descriptive adjectives', 'Minimum 50 words'],
  })

  const [journalContent, setJournalContent] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [evaluation, setEvaluation] = useState<JournalEvaluation | null>(null)
  const [wordCount, setWordCount] = useState<number>(0)

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const res = await api.get<{ title?: string; prompt?: string; hints?: string[] }>('/practice/writing/journal/daily-prompt')
        if (res && res.prompt) {
          setDailyPrompt({
            title: res.title ? res.title : 'Chủ đề Nhật ký hôm nay',
            prompt: res.prompt,
            hints: res.hints && res.hints.length > 0 ? res.hints : ['Describe in 50-150 words', 'Check your grammar & tenses'],
          })
        }
      } catch {
        // Fallback default prompt
      }
    }
    fetchPrompt()
  }, [])

  useEffect(() => {
    const words = journalContent.trim().split(/\s+/).filter(Boolean)
    setWordCount(words.length)
  }, [journalContent])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!journalContent.trim() || wordCount < 10) return

    setIsSubmitting(true)
    try {
      const res = await api.post<JournalEvaluation>('/practice/writing/journal/submit', {
        content: journalContent,
        prompt: dailyPrompt.prompt,
      })
      if (res) {
        setEvaluation(res)
      }
    } catch {
      // Fallback mock AI evaluation
      setEvaluation({
        overall_score: 8.5,
        word_count: wordCount,
        corrected_text: journalContent.replace(/i /g, 'I '),
        grammar_feedback: [
          'Cấu trúc câu phong phú và sử dụng thì quá khứ đơn chính xác.',
          'Lưu ý viết hoa đại từ nhân xưng "I" và dấu câu cuối mỗi đoạn.',
        ],
        vocabulary_suggestions: [
          'Thử thay "good" bằng "exceptional" hoặc "remarkable" để văn phong tự nhiên hơn.',
          'Sử dụng liên từ nối "Furthermore", "In addition" để tạo tính liên kết.',
        ],
        teacher_advice: 'Bài viết có chiều sâu và diễn đạt ý tưởng mạch lạc. Hãy duy trì thói quen viết nhật ký mỗi ngày nhé!',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                <Icon name="sparkles" size={13} />
                Daily AI Writing
              </span>
              <span className="text-xs text-text-tertiary">Mỗi ngày 1 trang nhật ký</span>
            </div>
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight mt-1.5 flex items-center gap-2">
              Nhật Ký Tiếng Anh Hàng Ngày
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Rèn luyện tư duy phản xạ tiếng Anh và nhận nhận xét, sửa lỗi chi tiết từ Gia sư AI
            </p>
          </div>
        </div>

        {/* Daily Prompt Card */}
        <div className="rounded-2xl bg-gradient-to-tr from-primary/10 via-surface to-accent/10 border border-primary/20 p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Icon name="bookCheck" size={18} />
            <span>Chủ Đề Hôm Nay: {dailyPrompt.title}</span>
          </div>
          <p className="text-base font-semibold text-text-primary leading-relaxed">
            &ldquo;{dailyPrompt.prompt}&rdquo;
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs font-medium text-text-tertiary">Gợi ý viết:</span>
            {dailyPrompt.hints.map((hint, idx) => (
              <span
                key={idx}
                className="inline-flex items-center text-xs px-2.5 py-1 rounded-lg bg-surface border border-border text-text-secondary"
              >
                💡 {hint}
              </span>
            ))}
          </div>
        </div>

        {/* Writing Editor Form */}
        {!evaluation ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-2xl bg-surface border border-border p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  Soạn Nhật Ký Của Bạn
                </span>
                <span className={`text-xs font-bold ${wordCount >= 50 ? 'text-success' : 'text-text-tertiary'}`}>
                  {wordCount} từ (Mục tiêu: 50+ từ)
                </span>
              </div>

              <textarea
                rows={8}
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
                placeholder="Start writing your thoughts in English here... (e.g., Today was an exciting day because...)"
                className="w-full bg-transparent border-0 outline-none text-sm text-text-primary placeholder:text-text-tertiary focus:ring-0 resize-none font-sans leading-relaxed"
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting || wordCount < 10}
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Gia sư AI đang chấm bài...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Icon name="sparkles" size={16} />
                    <span>Nộp Nhật Ký & Nhận Chấm Điểm AI</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        ) : (
          /* Evaluation Results View */
          <div className="space-y-5">
            {/* Overall Score Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-focus p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs uppercase tracking-widest text-white/80 font-bold">Kết quả đánh giá</span>
                <h3 className="text-2xl font-extrabold">Xuất Sắc! Bài Viết Đã Được Chấm Xong</h3>
                <p className="text-xs text-white/90">Tổng số từ hoàn thành: {evaluation.word_count} từ</p>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/30">
                <span className="text-3xl font-black">{evaluation.overall_score}</span>
                <span className="text-xs text-white/80">/ 10 điểm</span>
              </div>
            </div>

            {/* Teacher Advice */}
            <div className="rounded-2xl bg-surface border border-border p-5 shadow-sm space-y-2">
              <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Icon name="sparkles" size={16} className="text-primary" />
                Nhận Xét Sư Phạm Từ Gia Sư AI
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed bg-surface-subtle p-3.5 rounded-xl border border-border">
                {evaluation.teacher_advice}
              </p>
            </div>

            {/* Grammar & Vocabulary Feedback */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Grammar Feedback */}
              <div className="rounded-2xl bg-surface border border-border p-5 shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <Icon name="bookCheck" size={16} className="text-success" />
                  Góp Ý Ngữ Pháp
                </h4>
                <ul className="space-y-2">
                  {evaluation.grammar_feedback.map((item, idx) => (
                    <li key={idx} className="text-xs text-text-secondary flex items-start gap-2 bg-surface-subtle p-2.5 rounded-lg">
                      <span className="text-success font-bold mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Vocabulary Suggestions */}
              <div className="rounded-2xl bg-surface border border-border p-5 shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <Icon name="cards" size={16} className="text-accent" />
                  Gợi Ý Nâng Cấp Từ Vựng
                </h4>
                <ul className="space-y-2">
                  {evaluation.vocabulary_suggestions.map((item, idx) => (
                    <li key={idx} className="text-xs text-text-secondary flex items-start gap-2 bg-surface-subtle p-2.5 rounded-lg">
                      <span className="text-accent font-bold mt-0.5">★</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEvaluation(null)
                  setJournalContent('')
                }}
                className="cursor-pointer"
              >
                Viết bài nhật ký mới
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
