'use client'

/**
 * @file page.tsx
 * @description Trang giao diện người dùng (Next.js App Router) cho tuyến (study)/toeic
 */

import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@/lib/navigation'
import { Trophy, Headphones, BookOpen } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeading } from '@/components/dashboard/SectionHeading'
import { examService, type BackendToeicExam } from '@/services/exam.service'
import type { ToeicExam, ToeicExamFilters } from '@/types/toeic'
import { ExamCard } from '@/components/toeic/ToeicExamCard'
import { ToeicFilterBar } from '@/components/toeic/ToeicFilterBar'

export default function ToeicHubPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isVietnamese = i18n.language === 'vi'

  const [exams, setExams] = useState<ToeicExam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<ToeicExamFilters>({})

  useEffect(() => {
    let isMounted = true
    const fetchExams = async () => {
      try {
        setIsLoading(true)
        const res = await examService.getExams()
        if (isMounted && Array.isArray(res)) {
          const mapped: ToeicExam[] = res.map((e: BackendToeicExam, idx) => ({
            id: e._id,
            title: e.title,
            code: e.slug || `TOEIC-TEST-${idx + 1}`,
            description: e.description || 'ETS Official TOEIC Test',
            thumbnailUrl: '',
            examSeries: 'ETS TOEIC',
            releaseYear: 2024,
            examType: 'FULL_TEST',
            skillsEnabled: 'LR',
            targetScore: 750,
            difficultyLevel: 'MEDIUM',
            totalQuestions: e.total_questions || 200,
            totalAttempts: e.attempts_count || 1500,
            status: 'PUBLISHED',
          }))
          setExams(mapped)
        }
      } catch (err) {
        console.error('Failed to load TOEIC exams:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    fetchExams()
    return () => {
      isMounted = false
    }
  }, [])

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
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
  }, [exams, searchQuery, filters])

  return (
    <Layout>
      <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
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
            <CardContent className="flex items-center gap-3 p-4">
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
            <CardContent className="flex items-center gap-3 p-4">
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
            <CardContent className="flex items-center gap-3 p-4">
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

        {isLoading ? (
          <div className="mt-12 flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filteredExams.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredExams.map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                onClick={() => navigate(`/exam/${exam.id}`)}
                isVietnamese={isVietnamese}
              />
            ))}
          </div>
        ) : (
          <div className="mt-12 text-center text-text-secondary">
            {isVietnamese ? 'Không tìm thấy đề thi nào phù hợp' : 'No exams found'}
          </div>
        )}
      </main>
    </Layout>
  )
}
