// Trang danh sách đề thi và bộ lọc luyện thi TOEIC trực tuyến.
'use client'

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@/lib/navigation'
import { Trophy, Headphones, BookOpen } from 'lucide-react'
import { Card, CardContent } from '@/components/card'
import { SectionHeading } from '@/features/dashboard/components/section.heading'
import type { BackendToeicExam } from '@/features/toeic/services/exam.service'
import { useToeicExamsQuery } from '@/features/toeic/hooks/use.toeic.query'
import type { ToeicExam, ToeicExamFilters } from '@/features/toeic/types/toeic'
import { ExamCard } from '@/features/toeic/components/toeic.exam.card'
import { ToeicFilterBar } from '@/features/toeic/components/toeic.filter.bar'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { toast } from '@/store/toast.store'

export default function ToeicHubPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isVietnamese = i18n.language === 'vi'
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const handleExamClick = (examId: string) => {
    if (!isAuthenticated) {
      toast.info(isVietnamese ? 'Vui lòng đăng nhập để bắt đầu làm bài thi' : 'Please log in to start the exam')
      navigate(`/login?returnUrl=/toeic/exam/${examId}`)
      return
    }
    navigate(`/toeic/exam/${examId}`)
  }

  const { data: rawExams = [], isLoading } = useToeicExamsQuery()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<ToeicExamFilters>({})

  const exams: ToeicExam[] = useMemo(() => {
    if (!Array.isArray(rawExams)) return []
    return rawExams
      .filter((e: BackendToeicExam) => e.is_published !== false)
      .map((e: BackendToeicExam, idx: number) => {
        const examType: ToeicExam['examType'] =
          e.is_system_placement || e.exam_type === 'DIAGNOSTIC_TEST'
            ? 'DIAGNOSTIC_TEST'
            : e.exam_type === 'PRACTICE_TEST'
            ? 'PRACTICE_TEST'
            : e.exam_type === 'MOCK_TEST'
            ? 'MOCK_TEST'
            : 'FULL_TEST'

        const skillsEnabled: ToeicExam['skillsEnabled'] =
          e.skills_enabled === 'ALL' || e.skills_enabled === 'LRSW' ? 'LRSW' : 'LR'

        const examSeries = typeof e.category === 'string' && e.category ? e.category : 'ETS TOEIC'
        const releaseYear = typeof e.release_year === 'number' && e.release_year > 0 ? e.release_year : 2024

        return {
          id: e._id,
          title: e.title,
          code: e.slug || e.code || `TOEIC-TEST-${idx + 1}`,
          description: e.description || (e.is_system_placement ? 'Đề thi đánh giá năng lực đầu vào' : 'ETS Official TOEIC Test'),
          thumbnailUrl: '',
          examSeries,
          releaseYear,
          examType,
          skillsEnabled,
          targetScore: 750,
          difficultyLevel: 'MEDIUM' as const,
          totalQuestions: e.total_questions || 200,
          totalAttempts: e.attempts_count || 0,
          status: 'PUBLISHED' as const,
        }
      })
  }, [rawExams])

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
    <>
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
                onClick={() => handleExamClick(exam.id)}
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
    </>
  )
}
