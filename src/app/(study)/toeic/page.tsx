'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@/lib/navigation'
import { Trophy, Headphones, BookOpen } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeading } from '@/components/dashboard/SectionHeading'
import { examService } from '@/services/exam.service'
import { toeicExams } from '@/data/toeic-data'
import type { ToeicExamFilters } from '@/types/toeic'
import { ExamCard } from '@/components/toeic/ToeicExamCard'
import { ToeicFilterBar } from '@/components/toeic/ToeicFilterBar'

export default function ToeicHubPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isVietnamese = i18n.language === 'vi'

  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<ToeicExamFilters>({})

  useEffect(() => {
    examService
      .getExams({ type: 'TOEIC' })
      .then((res) => {
        if (res && res.length > 0) {
          // Backend exams loaded
        }
      })
      .catch((err) => {
        console.warn('Cannot fetch exams from backend, using local mock data:', err)
      })
  }, [])

  const filteredExams = useMemo(() => {
    return toeicExams.filter((exam) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchTitle = exam.title.toLowerCase().includes(query)
        const matchCode = exam.code.toLowerCase().includes(query)
        if (!matchTitle && !matchCode) return false
      }
      if (filters.series && exam.examSeries !== filters.series) return false
      if (filters.year && String(exam.releaseYear) !== String(filters.year)) return false
      if (filters.difficulty && exam.difficultyLevel !== filters.difficulty) return false
      return true
    })
  }, [searchQuery, filters])

  return (
    <Layout>
      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <SectionHeading
          eyebrow={t('toeic.title') || 'Luyện thi TOEIC'}
          title={isVietnamese ? 'Bộ đề thi TOEIC chuẩn quốc tế' : 'TOEIC Full Test Library'}
          description={
            isVietnamese
              ? 'Luyện tập đề thi TOEIC định dạng mới nhất với hệ thống tính điểm ETS chính xác'
              : 'Practice official TOEIC tests with accurate ETS scoring system'
          }
        />

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card className="dashboard-card border-amber-200/60 bg-amber-50/40">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">
                  {isVietnamese ? 'Thang điểm ETS 990' : 'ETS 990 Scoring'}
                </h4>
                <p className="text-xs text-text-secondary">
                  {isVietnamese ? 'Quy đổi điểm chuẩn xác' : 'Exact score conversion'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card border-indigo-200/60 bg-indigo-50/40">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
                <Headphones className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">
                  {isVietnamese ? 'Listening 100 câu' : 'Listening 100 Qs'}
                </h4>
                <p className="text-xs text-text-secondary">Part 1, 2, 3, 4 (45 phút)</p>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card border-emerald-200/60 bg-emerald-50/40">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">
                  {isVietnamese ? 'Reading 100 câu' : 'Reading 100 Qs'}
                </h4>
                <p className="text-xs text-text-secondary">Part 5, 6, 7 (75 phút)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <ToeicFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onFilterChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
          isVietnamese={isVietnamese}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredExams.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              onClick={() => navigate(`/toeic/exam/${exam.id}`)}
              isVietnamese={isVietnamese}
            />
          ))}
        </div>
      </main>
    </Layout>
  )
}
