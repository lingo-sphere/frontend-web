// Trang chi tiết kết quả bài kiểm tra và bài thi thử của học viên.
'use client'

import {
  RotateCcw,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { Card } from '@/components/card'
import { Button } from '@/components/button'
import { useNavigate } from '@/lib/navigation'
import { AttemptSummaryCard } from '@/features/toeic/components/attempt.summary.card'
import {
  ToeicQuestionCard,
  CourseQuestionCard,
} from '@/features/toeic/components/attempt.question.item'
import { useExamAttemptDetail } from '@/features/toeic/hooks/use.exam.attempt.detail'

export default function ExamAttemptDetailPage() {
  const navigate = useNavigate()
  const {
    isLoading,
    detailData,
    courseQuestions,
    filteredCourseQuestions,
    filterAnswerStatus,
    setFilterAnswerStatus,
    filteredToeicAnswers,
    title,
    scoreDisplay,
    totalQ,
    correctQ,
    isPassed,
    submittedAt,
    durationSeconds,
    formatDuration,
    formatDateTime,
    isCourseTest,
    isProfilePlacement,
    attemptId,
    courseId,
    testType,
    moduleId,
  } = useExamAttemptDetail()

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/exam-history')}
            className="rounded-xl shrink-0 cursor-pointer hover:bg-surface-subtle"
            title="Quay lại danh sách"
          >
            <ArrowLeft size={18} />
          </Button>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-text-tertiary">
                {isCourseTest ? 'Khóa học' : 'Luyện thi TOEIC'}
              </span>
              <span className="text-text-tertiary">•</span>
              <span className="text-xs font-mono text-text-tertiary">Mã: {attemptId}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isCourseTest && courseId ? (
            <Button
              onClick={() =>
                navigate(
                  `/course/${courseId}/exam?type=${testType}${moduleId ? `&chapterId=${moduleId}` : ''}`
                )
              }
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl gap-1.5 shadow-xs cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Làm lại bài</span>
            </Button>
          ) : (
            <Button
              onClick={() =>
                navigate(
                  detailData?.attempt?.exam_id
                    ? `/toeic/exam/${detailData.attempt.exam_id}`
                    : '/toeic/exam/placement_2skills'
                )
              }
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl gap-1.5 shadow-xs cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Làm lại đề thi</span>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate('/exam-history')}
            className="text-xs font-semibold rounded-xl cursor-pointer"
          >
            Quay lại
          </Button>
        </div>
      </div>

      <AttemptSummaryCard
        scoreDisplay={scoreDisplay}
        isPassed={isPassed}
        correctQ={correctQ}
        totalQ={totalQ}
        durationSeconds={durationSeconds}
        submittedAt={submittedAt}
        formatDuration={formatDuration}
        formatDateTime={formatDateTime}
        listeningScore={detailData?.attempt?.listening_scaled_score}
        readingScore={detailData?.attempt?.reading_scaled_score}
        teacherFeedback={detailData?.attempt?.teacher_feedback}
        isScoreManuallyEdited={detailData?.attempt?.is_score_manually_edited}
      />

      {isCourseTest && courseQuestions.length > 0 && (
        <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterAnswerStatus('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterAnswerStatus === 'ALL'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
            }`}
          >
            Tất cả ({courseQuestions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterAnswerStatus('CORRECT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterAnswerStatus === 'CORRECT'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            Làm đúng ({courseQuestions.filter((q) => q.is_correct === true).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterAnswerStatus('INCORRECT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterAnswerStatus === 'INCORRECT'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
            }`}
          >
            Làm sai (
            {
              courseQuestions.filter(
                (q) =>
                  q.is_correct === false ||
                  (((q.selected_index !== undefined && q.selected_index >= 0) || Boolean(q.selected_option)) &&
                    !q.is_correct)
              ).length
            }
            )
          </button>
          <button
            type="button"
            onClick={() => setFilterAnswerStatus('SKIPPED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterAnswerStatus === 'SKIPPED'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
            }`}
          >
            Chưa làm (
            {
              courseQuestions.filter(
                (q) =>
                  (q.selected_index === undefined || q.selected_index < 0) && !q.selected_option
              ).length
            }
            )
          </button>
        </div>
      )}

      {detailData?.answers && detailData.answers.length > 0 && (
        <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterAnswerStatus('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterAnswerStatus === 'ALL'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
            }`}
          >
            Tất cả ({detailData.answers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterAnswerStatus('CORRECT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterAnswerStatus === 'CORRECT'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            Làm đúng ({detailData.answers.filter((a) => a.is_correct).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterAnswerStatus('INCORRECT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterAnswerStatus === 'INCORRECT'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
            }`}
          >
            Làm sai (
            {
              detailData.answers.filter(
                (a) => !a.is_correct && !a.is_skipped && Boolean(a.selected_option)
              ).length
            }
            )
          </button>
          <button
            type="button"
            onClick={() => setFilterAnswerStatus('SKIPPED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterAnswerStatus === 'SKIPPED'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
            }`}
          >
            Chưa làm ({detailData.answers.filter((a) => a.is_skipped || !a.selected_option).length})
          </button>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-text-secondary">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="text-sm font-semibold">Đang tải chi tiết các câu hỏi bài làm...</p>
          </div>
        ) : isCourseTest ? (
          courseQuestions.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <BookOpen size={18} className="text-primary" />
                <span>
                  Danh sách câu hỏi bài kiểm tra khóa học ({filteredCourseQuestions.length}/{courseQuestions.length} câu)
                </span>
              </h3>
              {filteredCourseQuestions.map((q) => (
                <CourseQuestionCard
                  key={q.question_number}
                  question={q}
                  courseTitle={title}
                  courseId={courseId}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center space-y-4 rounded-2xl border-border">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <Trophy size={24} />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="font-bold text-text-primary text-base">
                  Kết quả bài kiểm tra khóa học
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Bạn đã hoàn thành bài kiểm tra với kết quả{' '}
                  <strong className="text-primary font-bold">{scoreDisplay}</strong> (Đúng{' '}
                  {correctQ}/{totalQ} câu hỏi).
                </p>
              </div>
              {courseId && (
                <div className="pt-2 flex items-center justify-center gap-2.5">
                  <Button
                    onClick={() =>
                      navigate(
                        `/course/${courseId}/exam?type=${testType}${
                          moduleId ? `&chapterId=${moduleId}` : ''
                        }`
                      )
                    }
                    className="bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl"
                  >
                    <RotateCcw size={14} className="mr-1.5" />
                    Làm lại bài kiểm tra
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/course/${courseId}`)}
                    className="text-xs font-semibold rounded-xl"
                  >
                    Vào khóa học
                  </Button>
                </div>
              )}
            </Card>
          )
        ) : isProfilePlacement ? (
          <Card className="p-8 text-center space-y-4 rounded-2xl border-border">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 mx-auto flex items-center justify-center">
              <Sparkles size={24} />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h4 className="font-bold text-text-primary text-base">
                Đánh Giá Năng Lực Đầu Vào (Placement Test)
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Điểm xuất phát của bạn được ghi nhận là{' '}
                <strong className="text-primary">{scoreDisplay}</strong>. Hệ thống gợi ý các khóa học
                luyện thi TOEIC phù hợp tương ứng với kết quả này.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2.5">
              <Button
                onClick={() => navigate('/courses')}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl"
              >
                Khám phá khóa học phù hợp
              </Button>
              <Button
                onClick={() => navigate('/toeic/exam/placement_2skills')}
                variant="outline"
                className="text-xs font-semibold rounded-xl"
              >
                <RotateCcw size={14} className="mr-1.5" />
                Làm lại Test đầu vào
              </Button>
            </div>
          </Card>
        ) : !detailData || !detailData.answers || detailData.answers.length === 0 ? (
          <Card className="p-12 text-center text-xs text-text-secondary space-y-2 rounded-2xl border-border">
            <AlertCircle size={28} className="mx-auto text-amber-500" />
            <h4 className="text-sm font-bold text-text-primary">
              Không có dữ liệu câu hỏi chi tiết
            </h4>
            <p>Lần thi này chưa được lưu lại danh sách câu hỏi từng phần trong cơ sở dữ liệu.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <HelpCircle size={18} className="text-primary" />
              <span>
                Phân tích chi tiết câu hỏi & Lời giải bài làm ({filteredToeicAnswers.length}/
                {detailData.answers.length} câu)
              </span>
            </h3>
            {filteredToeicAnswers.map((ans, idx) => (
              <ToeicQuestionCard key={idx} answer={ans} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
