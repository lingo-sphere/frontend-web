/**
 * @file writing.result.tsx
 * @description Component giao diện React WritingResult cho học viên
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Trophy,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lightbulb,
  RotateCcw,
  ChevronRight,
  BookOpen,
  Sparkles,
  Target,
  FileText,
  MessageSquare,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { WritingSubmission, WritingExercise, GrammarError } from '@/types/writing'

interface WritingResultProps {
  submission: WritingSubmission
  exercise: WritingExercise
  onBack: () => void
  onTryAgain: () => void
  onNextExercise: () => void
  onViewHistory: () => void
}

export function WritingResult({
  submission,
  exercise,
  onBack,
  onTryAgain,
  onNextExercise,
  onViewHistory,
}: WritingResultProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [activeTab, setActiveTab] = useState<'overview' | 'vocabulary' | 'grammar' | 'errors' | 'vocabulary-detailed' | 'sentence'>('overview')

  const aiEval = submission.ai_evaluation
  const scores = {
    overall: submission.overall_score || 0,
    task: submission.task_achievement_score || 0,
    coherence: submission.coherence_score || 0,
    vocabulary: submission.lexical_resource_score || 0,
    grammar: submission.grammatical_accuracy_score || 0,
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-600'
    if (score >= 6) return 'text-amber-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 8) return 'bg-emerald-100'
    if (score >= 6) return 'bg-amber-100'
    return 'bg-red-100'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'bg-red-100 text-red-700'
      case 'MEDIUM': return 'bg-amber-100 text-amber-700'
      case 'LOW': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'GRAMMAR': return '📝'
      case 'SPELLING': return '🔤'
      case 'PUNCTUATION': return '📍'
      case 'VOCABULARY': return '📚'
      case 'STYLE': return '✨'
      case 'FORMAT': return '📋'
      default: return '❓'
    }
  }

  const tabs = [
    { id: 'overview', label: isVietnamese ? 'Tổng quan' : 'Overview', icon: Sparkles },
    { id: 'vocabulary', label: isVietnamese ? 'Từ vựng' : 'Vocabulary', icon: BookOpen },
    { id: 'grammar', label: isVietnamese ? 'Ngữ pháp' : 'Grammar', icon: MessageSquare },
    { id: 'sentence', label: isVietnamese ? 'Câu' : 'Sentences', icon: FileText },
  ]

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-[14px] text-text-secondary hover:text-primary">
        <ArrowLeft size={18} />
        {isVietnamese ? 'Quay lại' : 'Back'}
      </button>

      <section className="mb-8 text-center">
        <div className={`inline-flex h-32 w-32 flex-col items-center justify-center rounded-full ${getScoreBg(scores.overall)}`}>
          <span className={`text-[48px] font-bold ${getScoreColor(scores.overall)}`}>
            {scores.overall.toFixed(1)}
          </span>
          <span className="text-[14px] text-text-tertiary">/10</span>
        </div>
        <h1 className="mt-4 text-[24px] font-bold text-text-primary">
          {scores.overall >= 8 ? '🎉 ' + (isVietnamese ? 'Tuyệt vời!' : 'Excellent!') : scores.overall >= 6 ? '👍 ' + (isVietnamese ? 'Tốt lắm!' : 'Good job!') : '💪 ' + (isVietnamese ? 'Cố gắng hơn!' : 'Keep trying!')}
        </h1>
        <div className="mt-2 flex items-center justify-center gap-2 text-[14px] text-text-secondary">
          {aiEval?.estimated_cefr && (
            <span className="rounded-full bg-purple-100 px-3 py-1 text-[12px] font-medium text-purple-700">
              CEFR: {aiEval.estimated_cefr}
            </span>
          )}
          <span>{submission.word_count} {isVietnamese ? 'từ' : 'words'}</span>
          <span>•</span>
          <span>{formatTime(submission.writing_time_seconds || 0, isVietnamese)}</span>
        </div>
        <p className="mt-3 text-[14px] text-text-secondary">
          {aiEval?.overall_feedback || (isVietnamese ? 'Bài viết của bạn đã được đánh giá.' : 'Your writing has been evaluated.')}
        </p>
      </section>

      <section className="mb-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className={`rounded-xl p-3 ${getScoreBg(scores.task)}`}>
            <div className="flex items-center gap-2">
              <Target className={`h-4 w-4 ${getScoreColor(scores.task)}`} />
              <span className="text-[11px] text-text-secondary">{isVietnamese ? 'Task' : 'Task'}</span>
            </div>
            <p className={`mt-1 text-[22px] font-bold ${getScoreColor(scores.task)}`}>{scores.task.toFixed(1)}</p>
          </div>
          <div className={`rounded-xl p-3 ${getScoreBg(scores.coherence)}`}>
            <div className="flex items-center gap-2">
              <FileText className={`h-4 w-4 ${getScoreColor(scores.coherence)}`} />
              <span className="text-[11px] text-text-secondary">{isVietnamese ? 'Liên kết' : 'Coherence'}</span>
            </div>
            <p className={`mt-1 text-[22px] font-bold ${getScoreColor(scores.coherence)}`}>{scores.coherence.toFixed(1)}</p>
          </div>
          <div className={`rounded-xl p-3 ${getScoreBg(scores.vocabulary)}`}>
            <div className="flex items-center gap-2">
              <BookOpen className={`h-4 w-4 ${getScoreColor(scores.vocabulary)}`} />
              <span className="text-[11px] text-text-secondary">{isVietnamese ? 'Từ vựng' : 'Vocabulary'}</span>
            </div>
            <p className={`mt-1 text-[22px] font-bold ${getScoreColor(scores.vocabulary)}`}>{scores.vocabulary.toFixed(1)}</p>
          </div>
          <div className={`rounded-xl p-3 ${getScoreBg(scores.grammar)}`}>
            <div className="flex items-center gap-2">
              <MessageSquare className={`h-4 w-4 ${getScoreColor(scores.grammar)}`} />
              <span className="text-[11px] text-text-secondary">{isVietnamese ? 'Ngữ pháp' : 'Grammar'}</span>
            </div>
            <p className={`mt-1 text-[22px] font-bold ${getScoreColor(scores.grammar)}`}>{scores.grammar.toFixed(1)}</p>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <div className="flex gap-2 border-b border-border">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as 'overview' | 'vocabulary' | 'grammar' | 'errors' | 'vocabulary-detailed')}
              className={`flex items-center gap-2 border-b-2 px-4 py-2 text-[13px] font-medium transition-colors ${
                activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}>
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {activeTab === 'overview' && aiEval && (
            <div className="space-y-4">
              {aiEval.overall_strengths && (
                <Card className="dashboard-card border-emerald-200 bg-emerald-50/50">
                  <CardContent className="p-4">
                    <p className="mb-2 flex items-center gap-2 text-[14px] font-medium text-emerald-700">
                      <CheckCircle className="h-4 w-4" />
                      {isVietnamese ? 'Điểm mạnh' : 'Strengths'}
                    </p>
                    <p className="text-[13px] text-emerald-600">{aiEval.overall_strengths}</p>
                  </CardContent>
                </Card>
              )}
              {aiEval.overall_weaknesses && (
                <Card className="dashboard-card border-amber-200 bg-amber-50/50">
                  <CardContent className="p-4">
                    <p className="mb-2 flex items-center gap-2 text-[14px] font-medium text-amber-700">
                      <AlertTriangle className="h-4 w-4" />
                      {isVietnamese ? 'Cần cải thiện' : 'Needs improvement'}
                    </p>
                    <p className="text-[13px] text-amber-600">{aiEval.overall_weaknesses}</p>
                  </CardContent>
                </Card>
              )}
              {aiEval.improvement_tips && aiEval.improvement_tips.length > 0 && (
                <Card className="dashboard-card border-blue-200 bg-blue-50/50">
                  <CardContent className="p-4">
                    <p className="mb-3 flex items-center gap-2 text-[14px] font-medium text-blue-700">
                      <Lightbulb className="h-4 w-4" />
                      {isVietnamese ? 'Mẹo cải thiện' : 'Improvement tips'}
                    </p>
                    <ul className="space-y-2">
                      {aiEval.improvement_tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 text-[13px] text-blue-600">
                          <span className="mt-1">•</span><span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {aiEval.suggested_version && (
                <Card className="dashboard-card border-purple-200 bg-purple-50/50">
                  <CardContent className="p-4">
                    <p className="mb-3 flex items-center gap-2 text-[14px] font-medium text-purple-700">
                      <Sparkles className="h-4 w-4" />
                      {isVietnamese ? 'Phiên bản cải thiện' : 'Improved version'}
                    </p>
                    <div className="rounded-lg bg-surface p-3">
                      <p className="text-[14px] italic text-text-primary">"{aiEval.suggested_version}"</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'vocabulary' && aiEval?.vocabulary_analysis && (
            <div className="space-y-4">
              {aiEval.vocabulary_analysis.keywords_used.length > 0 && (
                <Card className="dashboard-card">
                  <CardContent className="p-4">
                    <p className="mb-3 text-[14px] font-medium text-text-primary">{isVietnamese ? 'Từ khóa đã sử dụng' : 'Keywords used'}</p>
                    <div className="flex flex-wrap gap-2">
                      {aiEval.vocabulary_analysis.keywords_used.map((item, index) => (
                        <span key={index} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[13px] ${item.is_correct ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          <CheckCircle className="h-3 w-3" />{item.word}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              {aiEval.lexical_resource_feedback && (
                <Card className="dashboard-card">
                  <CardContent className="p-4">
                    <p className="mb-2 text-[14px] font-medium text-text-primary">{isVietnamese ? 'Nhận xét về từ vựng' : 'Vocabulary feedback'}</p>
                    <p className="text-[13px] text-text-secondary">{aiEval.lexical_resource_feedback}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'grammar' && aiEval && (
            <div className="space-y-4">
              {aiEval.errors && aiEval.errors.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[14px] font-medium text-text-primary">{isVietnamese ? 'Lỗi được phát hiện' : 'Errors detected'} ({aiEval.errors.length})</p>
                  {aiEval.errors.map((error, index) => (
                    <Card key={index} className="dashboard-card border-red-200 bg-red-50/50">
                      <CardContent className="p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getErrorIcon(error.type)}</span>
                            <span className="text-[13px] font-medium text-text-primary">{error.type}</span>
                          </div>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${getSeverityColor(error.severity)}`}>{error.severity}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="rounded bg-surface p-2">
                            <p className="text-[12px] text-text-secondary">{isVietnamese ? 'Câu của bạn:' : 'Your sentence:'}</p>
                            <p className="text-[13px] font-medium text-text-primary">{error.original}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] text-red-500 line-through">{error.original}</span>
                            <span className="text-[13px] text-text-tertiary">→</span>
                            <span className="text-[13px] font-medium text-emerald-600">{error.correction}</span>
                          </div>
                          <p className="text-[12px] text-text-secondary">{error.explanation}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {aiEval.grammatical_accuracy_feedback && (
                <Card className="dashboard-card">
                  <CardContent className="p-4">
                    <p className="mb-2 text-[14px] font-medium text-text-primary">{isVietnamese ? 'Nhận xét về ngữ pháp' : 'Grammar feedback'}</p>
                    <p className="text-[13px] text-text-secondary">{aiEval.grammatical_accuracy_feedback}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'sentence' && aiEval?.sentence_analysis && (
            <div className="space-y-4">
              <Card className="dashboard-card">
                <CardContent className="p-4">
                  <p className="mb-4 text-[14px] font-medium text-text-primary">{isVietnamese ? 'Phân tích câu' : 'Sentence analysis'}</p>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="text-center">
                      <p className="text-[24px] font-bold text-primary">{aiEval.sentence_analysis.sentence_count}</p>
                      <p className="text-[11px] text-text-secondary">{isVietnamese ? 'Số câu' : 'Sentences'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[24px] font-bold text-primary">{aiEval.sentence_analysis.avg_sentence_length}</p>
                      <p className="text-[11px] text-text-secondary">{isVietnamese ? 'TB từ/câu' : 'Avg words/sentence'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[24px] font-bold text-emerald-600">{aiEval.sentence_analysis.complex_sentences}</p>
                      <p className="text-[11px] text-text-secondary">{isVietnamese ? 'Câu phức' : 'Complex'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[24px] font-bold text-blue-600">{aiEval.sentence_analysis.simple_sentences}</p>
                      <p className="text-[11px] text-text-secondary">{isVietnamese ? 'Câu đơn' : 'Simple'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-[16px] font-semibold text-text-primary">{isVietnamese ? 'Bài viết của bạn' : 'Your writing'}</h2>
        <Card className="dashboard-card">
          <CardContent className="p-4">
            <div className="rounded-lg bg-surface-subtle p-4">
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-text-primary">{submission.content}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-4 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onViewHistory}>{isVietnamese ? 'Xem lịch sử' : 'View history'}</Button>
        <Button variant="outline" className="gap-2" onClick={onTryAgain}>
          <RotateCcw size={16} />{isVietnamese ? 'Thử lại' : 'Try again'}
        </Button>
        <Button className="gap-2 bg-primary hover:bg-primary-hover" onClick={onNextExercise}>
          {isVietnamese ? 'Bài tiếp theo' : 'Next exercise'}<ChevronRight size={16} />
        </Button>
      </section>

      {aiEval?.ai_model && (
        <p className="mt-6 text-center text-[11px] text-text-tertiary">
          {isVietnamese ? 'Được đánh giá bởi' : 'Evaluated by'} {aiEval.ai_model} {aiEval.ai_version} • {aiEval.processing_time_ms}ms
        </p>
      )}
    </main>
  )
}

function formatTime(seconds: number, isVietnamese: boolean): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs} ${isVietnamese ? 'giây' : 'sec'}`
  return `${mins} ${isVietnamese ? 'phút' : 'min'} ${secs}s`
}
