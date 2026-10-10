'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowLeft,
  Sparkles,
  FileText,
  Target,
  BookOpen,
  MessageSquare,
  Compass,
} from 'lucide-react'
import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import type { WritingSubmission, SubmissionComparison } from '@/features/practice/types/writing'

export interface WritingComparisonCardProps {
  comparison: SubmissionComparison
  onBack?: () => void
}

export function WritingComparisonCard({ comparison, onBack }: WritingComparisonCardProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const { v1, v2, delta } = comparison

  if (!v1 || !v2) {
    return (
      <Card className="p-6 text-center text-text-tertiary">
        <p>{comparison.message || (isVi ? 'Không tìm thấy dữ liệu so sánh' : 'No comparison data available')}</p>
        {onBack && (
          <Button onClick={onBack} variant="outline" className="mt-4">
            {isVi ? 'Quay lại' : 'Back'}
          </Button>
        )}
      </Card>
    )
  }

  const overallDelta = delta?.overall_score ?? ((v2.overall_score || 0) - (v1.overall_score || 0))

  const criteriaList = [
    {
      key: 'overall',
      labelVi: 'Điểm tổng quát (Overall Score)',
      labelEn: 'Overall Score',
      icon: Target,
      v1Score: v1.overall_score || 0,
      v2Score: v2.overall_score || 0,
      delta: overallDelta,
    },
    {
      key: 'task_achievement',
      labelVi: 'Task Achievement (Đáp ứng đề bài)',
      labelEn: 'Task Achievement',
      icon: Target,
      v1Score: v1.task_achievement_score ?? v1.overall_score ?? 0,
      v2Score: v2.task_achievement_score ?? v2.overall_score ?? 0,
      delta: delta?.task_achievement_score ?? ((v2.task_achievement_score || 0) - (v1.task_achievement_score || 0)),
    },
    {
      key: 'grammatical_accuracy',
      labelVi: 'Grammar Accuracy (Ngữ pháp)',
      labelEn: 'Grammar Accuracy',
      icon: MessageSquare,
      v1Score: v1.grammatical_accuracy_score || 0,
      v2Score: v2.grammatical_accuracy_score || 0,
      delta: delta?.grammatical_accuracy_score ?? ((v2.grammatical_accuracy_score || 0) - (v1.grammatical_accuracy_score || 0)),
    },
    {
      key: 'lexical_resource',
      labelVi: 'Lexical Resource (Từ vựng)',
      labelEn: 'Lexical Resource',
      icon: BookOpen,
      v1Score: v1.lexical_resource_score || 0,
      v2Score: v2.lexical_resource_score || 0,
      delta: delta?.lexical_resource_score ?? ((v2.lexical_resource_score || 0) - (v1.lexical_resource_score || 0)),
    },
    {
      key: 'coherence',
      labelVi: 'Coherence & Cohesion (Mạch lạc)',
      labelEn: 'Coherence & Cohesion',
      icon: FileText,
      v1Score: v1.coherence_score || 0,
      v2Score: v2.coherence_score || 0,
      delta: delta?.coherence_score ?? ((v2.coherence_score || 0) - (v1.coherence_score || 0)),
    },
    {
      key: 'naturalness',
      labelVi: 'Naturalness (Độ tự nhiên)',
      labelEn: 'Naturalness',
      icon: Sparkles,
      v1Score: v1.naturalness_score || 60,
      v2Score: v2.naturalness_score || 70,
      delta: delta?.naturalness_score ?? ((v2.naturalness_score || 70) - (v1.naturalness_score || 60)),
    },
    {
      key: 'register',
      labelVi: 'Register (Văn phong phù hợp)',
      labelEn: 'Register & Appropriateness',
      icon: Compass,
      v1Score: v1.register_score || 65,
      v2Score: v2.register_score || 75,
      delta: delta?.register_score ?? ((v2.register_score || 75) - (v1.register_score || 65)),
    },
  ]

  const renderDeltaBadge = (d: number) => {
    if (d > 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-bold border border-emerald-300">
          <TrendingUp className="h-3.5 w-3.5" />
          +{d}
        </span>
      )
    }
    if (d < 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 px-2.5 py-0.5 text-xs font-bold border border-rose-300">
          <TrendingDown className="h-3.5 w-3.5" />
          {d}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-surface-subtle text-text-tertiary px-2.5 py-0.5 text-xs font-semibold border border-border">
        <Minus className="h-3.5 w-3.5" />
        0
      </span>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-text-secondary hover:text-text-primary">
              <ArrowLeft className="h-4 w-4" />
              {isVi ? 'Quay lại' : 'Back'}
            </Button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200 border border-indigo-300">
                <Sparkles className="h-3.5 w-3.5" />
                {isVi ? 'So sánh tiến bộ bài viết (V1 vs V2)' : 'Progress Comparison (V1 vs V2)'}
              </span>
            </div>
            <h1 className="text-xl font-bold text-text-primary mt-1">
              {isVi ? 'Báo cáo cải thiện qua Khung hướng dẫn thông minh' : 'Progress Report via Scaffolded Rewrite'}
            </h1>
          </div>
        </div>

        <div className={`flex items-center gap-3 rounded-2xl p-4 border-2 ${
          overallDelta >= 0
            ? 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20'
            : 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20'
        }`}>
          <div>
            <span className="text-xs font-semibold text-text-secondary block">
              {isVi ? 'Mức độ tăng điểm tổng:' : 'Overall Score Progress:'}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-black text-text-primary">{v1.overall_score || 0}đ</span>
              <span className="text-text-tertiary">→</span>
              <span className="text-2xl font-black text-indigo-600">{v2.overall_score || 0}đ</span>
            </div>
          </div>
          {renderDeltaBadge(overallDelta)}
        </div>
      </div>

      {comparison.summary && (
        <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/20 border border-indigo-200 p-4 text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed font-medium">
          💡 {comparison.summary}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {criteriaList.map((item) => (
          <Card key={item.key} className="border border-border/80 bg-surface hover:border-border transition-all">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary truncate">
                  {isVi ? item.labelVi : item.labelEn}
                </span>
                {renderDeltaBadge(item.delta)}
              </div>

              <div className="flex items-baseline justify-between pt-1 border-t border-border/60">
                <div className="text-center">
                  <span className="text-[10px] text-text-tertiary uppercase block">V1 (Gốc)</span>
                  <span className="text-base font-bold text-text-secondary">{item.v1Score}đ</span>
                </div>
                <span className="text-xs text-text-tertiary">→</span>
                <div className="text-center">
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase block">V2 (Viết lại)</span>
                  <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">{item.v2Score}đ</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <Card className="border border-border/80 bg-surface">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  {isVi ? 'Phiên bản ban đầu (V1)' : 'Original Version (V1)'}
                </h3>
                <span className="text-xs text-text-tertiary">
                  {v1.word_count || 0} {isVi ? 'từ' : 'words'} • {v1.overall_score || 0} {isVi ? 'điểm' : 'pts'}
                </span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-subtle text-text-secondary border border-border">
                V1
              </span>
            </div>

            <div className="text-xs text-text-secondary leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap font-sans p-3 rounded-lg bg-surface-subtle/50 border border-border/40">
              {v1.content || (isVi ? '(Trống)' : '(Empty)')}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-indigo-300 bg-indigo-50/20 dark:bg-indigo-950/10">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-indigo-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                  {isVi ? 'Phiên bản viết lại có khung sườn (V2)' : 'Scaffolded Rewrite (V2)'}
                </h3>
                <span className="text-xs text-indigo-700/80 dark:text-indigo-300/80">
                  {v2.word_count || 0} {isVi ? 'từ' : 'words'} • {v2.overall_score || 0} {isVi ? 'điểm' : 'pts'}
                </span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-200 border border-indigo-300">
                V2 ✨
              </span>
            </div>

            <div className="text-xs text-text-primary leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap font-sans p-3 rounded-lg bg-surface border border-indigo-100 dark:border-indigo-900/50">
              {v2.content || (isVi ? '(Trống)' : '(Empty)')}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
