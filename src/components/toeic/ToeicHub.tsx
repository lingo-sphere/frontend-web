import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Trophy, Clock, Users, ChevronRight, Star, BookOpen, Headphones, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/dashboard/SectionHeading'
import { examService } from '@/services/exam.service'
import type { Exam } from '@/types/api.types'
import { toeicExams, toeicParts, toeicYearFilters, toeicSeriesFilters, toeicDifficultyFilters } from '@/data/toeic-data'
import type { ToeicExam, ToeicExamFilters, ToeicPart } from '@/types/toeic'

// ============================================================
// FILTER CHIP
// ============================================================

function FilterChip({
  label,
  active,
  count,
  onClick,
}: {
  label: string
  active: boolean
  count?: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
        active
          ? 'bg-primary text-white'
          : 'bg-surface-subtle text-text-secondary hover:bg-surface-hover hover:text-text-primary'
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? 'bg-white/20' : 'bg-surface-hover'}`}>
          {count}
        </span>
      )}
    </button>
  )
}

// ============================================================
// EXAM CARD
// ============================================================

function ExamCard({
  exam,
  onClick,
  isVietnamese,
}: {
  exam: ToeicExam
  onClick: () => void
  isVietnamese: boolean
}) {
  const difficultyColors = {
    EASY: 'bg-emerald-100 text-emerald-700',
    MEDIUM: 'bg-amber-100 text-amber-700',
    HARD: 'bg-red-100 text-red-700',
  }

  const difficultyLabels = {
    EASY: isVietnamese ? 'Dễ' : 'Easy',
    MEDIUM: isVietnamese ? 'TB' : 'Medium',
    HARD: isVietnamese ? 'Khó' : 'Hard',
  }

  const isOfficial = exam.isOfficial
  const difficulty = exam.difficultyLevel || 'MEDIUM'

  return (
    <Card
      className="dashboard-card cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            {isOfficial ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                <Trophy className="h-5 w-5 text-amber-600" />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info-soft">
                <FileText className="h-5 w-5 text-info" />
              </div>
            )}
            <div>
              <h3 className="text-[15px] font-semibold text-text-primary line-clamp-1">
                {exam.title}
              </h3>
              <p className="text-[11px] text-text-tertiary">
                {exam.examSeries} {exam.releaseYear}
              </p>
            </div>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${difficultyColors[difficulty as keyof typeof difficultyColors]}`}>
            {difficultyLabels[difficulty as keyof typeof difficultyLabels]}
          </span>
        </div>

        {/* Description */}
        <p className="mb-3 text-[12px] text-text-secondary line-clamp-2">
          {exam.description}
        </p>

        {/* Stats */}
        <div className="mb-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-surface-subtle p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-text-tertiary">
              <Headphones size={12} />
              <span>Listening</span>
            </div>
            <p className="text-[13px] font-semibold text-text-primary">
              {exam.listeningQuestionCount || 0} {isVietnamese ? 'câu' : 'q'}
            </p>
          </div>
          <div className="rounded-lg bg-surface-subtle p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-text-tertiary">
              <BookOpen size={12} />
              <span>Reading</span>
            </div>
            <p className="text-[13px] font-semibold text-text-primary">
              {exam.readingQuestionCount || 0} {isVietnamese ? 'câu' : 'q'}
            </p>
          </div>
          <div className="rounded-lg bg-surface-subtle p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-text-tertiary">
              <Clock size={12} />
              <span>{isVietnamese ? 'Thời gian' : 'Time'}</span>
            </div>
            <p className="text-[13px] font-semibold text-text-primary">
              {((exam.listeningQuestionCount || 0) / 60 + (exam.readingQuestionCount || 0) / 40).toFixed(0)} {isVietnamese ? 'phút' : 'min'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-text-tertiary">
            <span className="flex items-center gap-1">
              <Users size={12} />
              {exam.totalAttempts?.toLocaleString() || 0}
            </span>
            <span className="flex items-center gap-1">
              <Star size={12} className="text-amber-500" />
              {exam.avgScore || 0}
            </span>
          </div>
          <Button size="sm" className="gap-1 bg-primary hover:bg-primary-hover">
            {isVietnamese ? 'Luyện ngay' : 'Practice now'}
            <ChevronRight size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================
// PART OVERVIEW
// ============================================================

function PartOverview({ isVietnamese }: { isVietnamese: boolean }) {
  const listeningParts = toeicParts.filter(p => p.section === 'LISTENING')
  const readingParts = toeicParts.filter(p => p.section === 'READING')

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Listening */}
      <Card className="dashboard-card">
        <CardContent className="p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info-soft">
              <Headphones className="h-5 w-5 text-info" />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-text-primary">Listening</h3>
              <p className="text-[12px] text-text-secondary">
                {isVietnamese ? 'Nghe - 100 câu - 45 phút' : 'Listening - 100 questions - 45 minutes'}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {listeningParts.map(part => (
              <div key={part.id} className="flex items-center justify-between rounded-lg bg-surface-subtle p-2">
                <div>
                  <span className="text-[13px] font-medium text-text-primary">Part {part.partNumber}</span>
                  <span className="ml-2 text-[11px] text-text-tertiary">{part.nameVi}</span>
                </div>
                <span className="text-[11px] text-text-tertiary">{part.standardQuestionCount} {isVietnamese ? 'câu' : 'q'}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reading */}
      <Card className="dashboard-card">
        <CardContent className="p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-text-primary">Reading</h3>
              <p className="text-[12px] text-text-secondary">
                {isVietnamese ? 'Đọc - 100 câu - 75 phút' : 'Reading - 100 questions - 75 minutes'}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {readingParts.map(part => (
              <div key={part.id} className="flex items-center justify-between rounded-lg bg-surface-subtle p-2">
                <div>
                  <span className="text-[13px] font-medium text-text-primary">Part {part.partNumber}</span>
                  <span className="ml-2 text-[11px] text-text-tertiary">{part.nameVi}</span>
                </div>
                <span className="text-[11px] text-text-tertiary">{part.standardQuestionCount} {isVietnamese ? 'câu' : 'q'}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function ToeicHub() {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const navigate = useNavigate()
  const [exams, setExams] = useState<ToeicExam[]>(toeicExams)
  const [filters, setFilters] = useState<ToeicExamFilters>({
    year: 'all',
    series: 'all',
    difficulty: 'all',
  })
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    let isMounted = true
    const fetchExams = async () => {
      try {
        const liveExams: Exam[] = await examService.getExams()
        if (isMounted && Array.isArray(liveExams) && liveExams.length > 0) {
          const mapped: ToeicExam[] = liveExams.map((e, idx) => ({
            id: e.id || e._id || `exam-${idx}`,
            code: e.code || `TOEIC-TEST-${idx + 1}`,
            title: e.title,
            description: 'Đề thi chuẩn cấu trúc ETS 200 câu hỏi 120 phút',
            examSeries: 'ETS',
            releaseYear: e.year || 2024,
            testNumber: idx + 1,
            difficultyLevel: 'MEDIUM',
            estimatedDurationMinutes: e.duration_minutes || 120,
            questionCount: e.total_questions || 200,
            isOfficial: true,
            isFullTest: true,
            isPublished: true,
            examType: 'FULL_TEST',
            skillsEnabled: 'LR',
          }))
          setExams(mapped)
        }
      } catch {
        // Fallback to toeicExams
      }
    }
    fetchExams()
    return () => {
      isMounted = false
    }
  }, [])

  // Filter exams
  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        if (!exam.title.toLowerCase().includes(query) && !exam.code.toLowerCase().includes(query)) {
          return false
        }
      }
      // Year
      if (filters.year && filters.year !== 'all') {
        if (exam.releaseYear?.toString() !== filters.year) return false
      }
      // Series
      if (filters.series && filters.series !== 'all') {
        if (exam.examSeries !== filters.series) return false
      }
      // Difficulty
      if (filters.difficulty && filters.difficulty !== 'all') {
        if (exam.difficultyLevel !== filters.difficulty) return false
      }
      return true
    })
  }, [filters, searchQuery])

  // Group by year
  const groupedExams = useMemo(() => {
    const groups: Record<string, ToeicExam[]> = {}
    filteredExams.forEach(exam => {
      const year = exam.releaseYear?.toString() || 'Other'
      if (!groups[year]) groups[year] = []
      groups[year].push(exam)
    })
    return Object.entries(groups).sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
  }, [filteredExams])

  const handleStartExam = (exam: ToeicExam) => {
    // Chỉ test với exam đầu tiên
    navigate(`/toeic/exam/toeic_2019_test1`)
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      {/* Header */}
      <SectionHeading
        eyebrow={isVietnamese ? 'Luyện tập' : 'Practice'}
        title={isVietnamese ? 'Luyện thi TOEIC' : 'TOEIC Practice'}
        description={isVietnamese ? 'Chọn đề thi phù hợp với trình độ của bạn' : 'Choose exams that match your level'}
      />

      {/* Part Overview */}
      <section className="mb-8">
        <h2 className="mb-4 text-[16px] font-semibold text-text-primary">
          {isVietnamese ? 'Tổng quan các phần thi' : 'Test Section Overview'}
        </h2>
        <PartOverview isVietnamese={isVietnamese} />
      </section>

      {/* Filters */}
      <section className="mb-6">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder={isVietnamese ? 'Tìm kiếm đề thi...' : 'Search exams...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-[14px] text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
          />
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-4">
          {/* Year */}
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center text-[12px] font-medium text-text-tertiary">
              <Filter size={14} className="mr-1" />
              {isVietnamese ? 'Năm:' : 'Year:'}
            </span>
            {toeicYearFilters.map(filter => (
              <FilterChip
                key={filter.value}
                label={filter.label}
                count={filter.count}
                active={filters.year === filter.value}
                onClick={() => setFilters({ ...filters, year: filter.value })}
              />
            ))}
          </div>

          {/* Series */}
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center text-[12px] font-medium text-text-tertiary">
              {isVietnamese ? 'Loại đề:' : 'Type:'}
            </span>
            {toeicSeriesFilters.map(filter => (
              <FilterChip
                key={filter.value}
                label={filter.label}
                count={filter.count}
                active={filters.series === filter.value}
                onClick={() => setFilters({ ...filters, series: filter.value })}
              />
            ))}
          </div>

          {/* Difficulty */}
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center text-[12px] font-medium text-text-tertiary">
              {isVietnamese ? 'Độ khó:' : 'Difficulty:'}
            </span>
            {toeicDifficultyFilters.map(filter => (
              <FilterChip
                key={filter.value}
                label={filter.label}
                count={filter.count}
                active={filters.difficulty === filter.value}
                onClick={() => setFilters({ ...filters, difficulty: filter.value })}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Results count */}
      <p className="mb-4 text-[13px] text-text-secondary">
        {isVietnamese ? 'Tìm thấy' : 'Found'} {filteredExams.length} {isVietnamese ? 'đề thi' : 'exams'}
      </p>

      {/* Exam list by year */}
      <section className="space-y-8">
        {groupedExams.map(([year, exams]) => (
          <div key={year}>
            <h2 className="mb-4 flex items-center gap-2 text-[16px] font-semibold text-text-primary">
              <Trophy size={18} className="text-warning" />
              {isVietnamese ? 'Đề thi' : 'Exams'} {year}
              <span className="text-[12px] font-normal text-text-tertiary">
                ({exams.length} {isVietnamese ? 'đề' : 'exams'})
              </span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {exams.map(exam => (
                <ExamCard
                  key={exam.id}
                  exam={exam}
                  onClick={() => handleStartExam(exam)}
                  isVietnamese={isVietnamese}
                />
              ))}
            </div>
          </div>
        ))}

        {filteredExams.length === 0 && (
          <div className="py-12 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-text-tertiary" />
            <p className="text-[14px] text-text-secondary">
              {isVietnamese ? 'Không tìm thấy đề thi phù hợp.' : 'No matching exams found.'}
            </p>
          </div>
        )}
      </section>
    </main>
  )
}
