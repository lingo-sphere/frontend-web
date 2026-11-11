// Component thẻ biểu đồ tăng trưởng điểm số học tập theo phong cách Gogo Analytics.
'use client'

import { useState } from 'react'
import { TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react'
import { GrowthAreaChart } from '@/components/growth.area.chart'
import type { GrowthChartDataPoint, GrowthChartSeries } from '@/components/growth.area.chart'

export interface GrowthCardStats {
  latestScore: number | null
  avgScore: number | null
  passed: boolean | null
}

interface GogoGrowthChartCardProps {
  data2K: GrowthChartDataPoint[]
  stats2K: GrowthCardStats
  data4K: GrowthChartDataPoint[]
  stats4K: GrowthCardStats
  toeicData?: GrowthChartDataPoint[]
  toeicStats?: GrowthCardStats
  toeicSeries?: GrowthChartSeries[]
}

export function GogoGrowthChartCard({
  data2K,
  stats2K,
  data4K,
  stats4K,
  toeicData = [],
  toeicStats,
  toeicSeries = [],
}: GogoGrowthChartCardProps) {
  const [activeTab, setActiveTab] = useState<'2KN' | '4KN' | 'TOEIC'>('2KN')

  const currentStats = activeTab === '2KN' ? stats2K : activeTab === '4KN' ? stats4K : (toeicStats || stats2K)
  const isToeic = activeTab === 'TOEIC'

  return (
    <div className="rounded-3xl bg-surface border border-border p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-text-primary">
              Biểu Đồ Phát Triển Năng Lực Học Tập
            </h3>
          </div>
          <p className="text-xs text-text-secondary">
            Theo dõi sự bứt phá điểm số qua các bài kiểm tra chương và đề thi thực tế
          </p>
        </div>

        <div className="flex items-center p-1 rounded-2xl bg-surface-subtle border border-border">
          <button
            type="button"
            onClick={() => setActiveTab('2KN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === '2KN'
                ? 'bg-surface text-primary shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Khóa 2KN
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('4KN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === '4KN'
                ? 'bg-surface text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Khóa 4KN
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TOEIC')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'TOEIC'
                ? 'bg-surface text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Đề TOEIC
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 p-3 rounded-2xl bg-surface-subtle/60 border border-border/80">
        <div className="space-y-0.5">
          <span className="text-[11px] font-medium text-text-secondary">Điểm gần nhất</span>
          <div className="text-base font-extrabold text-text-primary">
            {currentStats.latestScore !== null ? `${currentStats.latestScore}${isToeic ? 'đ' : '%'}` : '---'}
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[11px] font-medium text-text-secondary">Trung bình</span>
          <div className="text-base font-extrabold text-teal-600 dark:text-teal-400">
            {currentStats.avgScore !== null ? `${currentStats.avgScore}${isToeic ? 'đ' : '%'}` : '---'}
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[11px] font-medium text-text-secondary">Chuẩn đạt</span>
          <div className="text-base font-extrabold text-text-primary">
            {isToeic ? '450+ TOEIC' : '70% Bài thi'}
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[11px] font-medium text-text-secondary">Đánh giá chung</span>
          <div className="flex items-center gap-1.5">
            {currentStats.passed ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đạt chuẩn</span>
              </span>
            ) : currentStats.passed === false ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Cần ôn thêm</span>
              </span>
            ) : (
              <span className="text-xs text-text-tertiary">Chưa thi</span>
            )}
          </div>
        </div>
      </div>

      <div className="min-h-[260px] w-full">
        {activeTab === '2KN' ? (
          <GrowthAreaChart
            data={data2K}
            height={260}
            minVal={0}
            maxVal={100}
            targetValue={70}
            targetLabel="Chuẩn đạt (70%)"
            colorTheme="teal"
            valueSuffix="%"
            emptyMessage="Chưa có dữ liệu bài kiểm tra chương Khóa 2 Kỹ Năng"
          />
        ) : activeTab === '4KN' ? (
          <GrowthAreaChart
            data={data4K}
            height={260}
            minVal={0}
            maxVal={100}
            targetValue={70}
            targetLabel="Chuẩn đạt (70%)"
            colorTheme="emerald"
            valueSuffix="%"
            emptyMessage="Chưa có dữ liệu bài kiểm tra chương Khóa 4 Kỹ Năng"
          />
        ) : (
          <GrowthAreaChart
            data={toeicSeries.length > 0 ? undefined : toeicData}
            series={toeicSeries.length > 0 ? toeicSeries : undefined}
            height={260}
            minVal={0}
            maxVal={990}
            targetValue={650}
            targetLabel="Mục tiêu (650)"
            colorTheme="purple"
            valueSuffix="đ"
            emptyMessage="Chưa có dữ liệu làm bài thi thử TOEIC"
          />
        )}
      </div>
    </div>
  )
}

