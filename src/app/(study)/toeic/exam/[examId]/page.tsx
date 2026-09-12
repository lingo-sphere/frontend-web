// Trang làm bài thi TOEIC trực tuyến và hiển thị kết quả đánh giá năng lực
'use client'

import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { useNavigate, useParams } from '@/lib/navigation'
import {
  RotateCcw,
  BookOpen,
  ArrowLeft,
  Home,
  Headphones,
  Award,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Target,
  BarChart3,
  Compass,
} from 'lucide-react'
import { Button } from '@/components/button'
import { useToeicExam } from '@/features/toeic/hooks/use.toeic.exam'
import { ToeicExamResult } from '@/features/toeic/components/toeic.exam.result'
import { ToeicQuestionCard } from '@/features/toeic/components/toeic.question.card'
import { ToeicQuestionNav } from '@/features/toeic/components/toeic.question.nav'
import { ToeicExamHeader } from '@/features/toeic/components/toeic.exam.header'
import { PART_TIMINGS, PART_TIPS } from '@/features/toeic/components/toeic.constants'

export default function ToeicExamAppPage() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const { examId } = useParams<{ examId?: string }>()
  const isVietnamese = i18n.language === 'vi'

  const {
    examData,
    isLoadingExam,
    allQuestions,
    state,
    recommendedCourses,
    recommendedRoadmap,
    targetBand,
    levelLabel,
    isLoadingRecommendations,
    handleSelectAnswer,
    goToQuestion,
    toggleFlag,
    handleSubmit,
    handleRetry,
    handleChooseAnother,
    calculateResults,
  } = useToeicExam(examId)

  if (isLoadingExam) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <RotateCcw className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
            </div>
            <Sparkles className="w-5 h-5 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {isVietnamese ? 'Đang chuẩn bị đề thi...' : 'Preparing exam...'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isVietnamese
                ? 'Hệ thống đang tải câu hỏi và cấu trúc bài thi, vui lòng đợi trong giây lát.'
                : 'Loading questions and exam structure, please wait a moment.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!examData || allQuestions.length === 0) {
    return (
      <main className="w-full min-h-[calc(100vh-120px)] flex flex-col justify-between px-4 py-5 sm:px-6 sm:py-7 lg:px-8 space-y-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
            <Link href="/home" className="hover:text-primary transition-colors">
              {isVietnamese ? 'Trang chủ' : 'Home'}
            </Link>
            <span>/</span>
            <Link href="/toeic" className="hover:text-primary transition-colors">
              {isVietnamese ? 'Đề thi TOEIC' : 'TOEIC Exams'}
            </Link>
            <span>/</span>
            <span className="text-text-primary font-bold truncate max-w-[250px]">
              {examId || (isVietnamese ? 'Kiểm tra năng lực' : 'Placement Test')}
            </span>
          </div>

          <div className="rounded-3xl border border-border bg-surface shadow-sm p-6 sm:p-8 lg:p-10 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-teal-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isVietnamese ? 'Thông báo trạng thái đề thi' : 'Exam Status Notice'}</span>
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
                    {!examData
                      ? isVietnamese
                        ? 'Đề Thi Chưa Khởi Tạo Hoặc Không Khả Dụng'
                        : 'Exam Not Found Or Unpublished'
                      : isVietnamese
                        ? 'Đề Thi Chưa Có Câu Hỏi Hoàn Chỉnh'
                        : 'No Questions In This Exam'}
                  </h1>
                  <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
                    {!examData
                      ? isVietnamese
                        ? `Mã bài thi "${examId}" hiện chưa được kích hoạt hoặc chưa xuất bản trên hệ thống LingoSphere. Bạn có thể chọn các đề thi tiêu chuẩn sẵn có bên dưới để bắt đầu luyện tập ngay.`
                        : `The exam "${examId}" is currently unpublished or does not exist. Please explore standard available exams below.`
                      : isVietnamese
                        ? 'Bài thi này hiện đang trong quá trình cập nhật nội dung câu hỏi từ ban học thuật. Vui lòng quay lại sau hoặc liên hệ hỗ trợ.'
                        : 'This exam is currently undergoing question updates. Please check back later.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/toeic')}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>{isVietnamese ? 'Khám phá kho đề thi TOEIC' : 'Explore TOEIC Exams'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/roadmap')}
                    className="px-4 py-2.5 rounded-xl bg-surface-subtle hover:bg-border text-text-primary text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-border hover:scale-[1.02]"
                  >
                    <Target className="w-4 h-4 text-teal-500" />
                    <span>{isVietnamese ? 'Xem lộ trình cá nhân' : 'Personal Roadmap'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-4 py-2.5 rounded-xl border border-border hover:bg-surface-subtle text-text-secondary text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{isVietnamese ? 'Quay lại' : 'Go Back'}</span>
                  </button>
                </div>
              </div>

              <div className="hidden lg:flex flex-col gap-3 min-w-[260px] p-5 rounded-2xl bg-surface-subtle/70 border border-border">
                <div className="text-xs font-extrabold text-text-primary flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>{isVietnamese ? 'Tiêu chuẩn đề thi TOEIC' : 'TOEIC Standards'}</span>
                </div>
                <div className="space-y-2 text-xs text-text-secondary">
                  <div className="flex items-center justify-between">
                    <span>{isVietnamese ? 'Thang điểm ETS:' : 'ETS Score Range:'}</span>
                    <span className="font-bold text-text-primary">10 - 990</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{isVietnamese ? 'Số phần thi:' : 'Total Parts:'}</span>
                    <span className="font-bold text-text-primary">Part 1 - 7</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{isVietnamese ? 'Thời gian làm bài:' : 'Duration:'}</span>
                    <span className="font-bold text-text-primary">120 {isVietnamese ? 'phút' : 'mins'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{isVietnamese ? 'Phân tích kết quả:' : 'AI Analytics:'}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{isVietnamese ? 'Tức thì' : 'Instant'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-text-primary flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>{isVietnamese ? 'Các bài thi & phương thức luyện tập đề xuất:' : 'Recommended Tests & Practice:'}</span>
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  {isVietnamese
                    ? 'Chọn ngay bài thi có sẵn trên hệ thống để đo lường năng lực và nhận gợi ý học tập'
                    : 'Choose available tests to assess your proficiency and get personalized recommendations'}
                </p>
              </div>
              <Link
                href="/toeic"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 transition-colors"
              >
                <span>{isVietnamese ? 'Xem tất cả kho đề' : 'View all tests'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-text-primary">
                      {isVietnamese ? 'Đề Thi 2 Kỹ Năng (Listening & Reading)' : '2 Skills Exam (Listening & Reading)'}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {isVietnamese
                        ? 'Thi theo chuẩn ETS Part 1 - 7 với thang điểm 990. Đánh giá toàn diện kỹ năng nghe hiểu và đọc hiểu thực tế.'
                        : 'Official ETS Part 1 - 7 format with 990 scoring scale. Evaluate comprehensive listening and reading skills.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/toeic')}
                  className="w-full py-2.5 px-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{isVietnamese ? 'Chọn đề thi 2 kỹ năng' : 'Select 2-skill exam'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm hover:shadow-md hover:border-teal-400 dark:hover:border-teal-600 transition-all flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-text-primary">
                      {isVietnamese ? 'Đề Thi 4 Kỹ Năng (Toàn Diện)' : '4 Skills Exam (Comprehensive)'}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {isVietnamese
                        ? 'Bao gồm Listening, Reading kèm Speaking & Writing AI để định hướng năng lực giao tiếp và làm việc chuyên nghiệp.'
                        : 'Includes Listening, Reading, Speaking & Writing AI to benchmark communication and professional skills.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/toeic')}
                  className="w-full py-2.5 px-3 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{isVietnamese ? 'Chọn đề thi 4 kỹ năng' : 'Select 4-skill exam'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm hover:shadow-md hover:border-amber-400 dark:hover:border-amber-600 transition-all flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-text-primary">
                      {isVietnamese ? 'Luyện Nghe Chép Chính Tả (Dictation)' : 'Dictation Practice'}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {isVietnamese
                        ? 'Luyện phản xạ nghe từng từ ngữ, cấu trúc câu và phát âm chuẩn bản xứ trước khi bước vào phòng thi chính thức.'
                        : 'Train listening reflex, sentence patterns, and native pronunciation before official exams.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/practice')}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{isVietnamese ? 'Luyện Dictation ngay' : 'Practice Dictation'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            <div className="p-5 rounded-2xl bg-surface-subtle/50 border border-border flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <Target className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-text-primary">
                  {isVietnamese ? '1. Đánh giá năng lực chuẩn xác' : '1. Accurate Assessment'}
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {isVietnamese
                    ? 'Hệ thống đo lường điểm số thực tế sát với đề thi thật tại IIG.'
                    : 'Real score measurement aligned with actual test standards.'}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-surface-subtle/50 border border-border flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-text-primary">
                  {isVietnamese ? '2. Phân tích điểm yếu từng Part' : '2. Weakness Part Analysis'}
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {isVietnamese
                    ? 'Chỉ ra chính xác các dạng bài câu hỏi bạn thường sai để khắc phục.'
                    : 'Pinpoints specific question types and error patterns to improve.'}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-surface-subtle/50 border border-border flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 mt-0.5">
                <Compass className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-text-primary">
                  {isVietnamese ? '3. Lộ trình cá nhân hóa tự động' : '3. Auto Personalized Path'}
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {isVietnamese
                    ? 'Gợi ý ngay các khóa học và bài luyện tập nâng band điểm mục tiêu.'
                    : 'Instantly recommends courses and exercises to hit your target band.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <footer className="pt-8 pb-4 border-t border-border text-center text-xs text-text-tertiary space-y-1">
          <p>{isVietnamese ? '© 2026 LingoSphere Ecosystem. Nền tảng học tiếng Anh & luyện thi TOEIC chuẩn quốc tế.' : '© 2026 LingoSphere Ecosystem. International English Learning & TOEIC Platform.'}</p>
          <p>{isVietnamese ? 'Mọi thắc mắc về đề thi vui lòng liên hệ ban quản trị hoặc gửi phản hồi qua Chat Cộng Đồng.' : 'For exam inquiries, please contact administration or send feedback via Community Chat.'}</p>
        </footer>
      </main>
    )
  }

  if (state.submitted) {
    const results = calculateResults()
    return (
      <ToeicExamResult
        results={results}
        questions={allQuestions}
        userAnswers={state.answers}
        recommendedCourses={recommendedCourses}
        recommendedRoadmap={recommendedRoadmap}
        targetBand={targetBand}
        levelLabel={levelLabel}
        isLoadingRecommendations={isLoadingRecommendations}
        onRetry={handleRetry}
        onChooseAnother={handleChooseAnother}
      />
    )
  }

  const currentQuestion = allQuestions[state.currentQuestionIndex]

  const isWriting =
    currentQuestion?.questionType === 'WRITING' ||
    currentQuestion?.skillType === 'WRITING' ||
    String(currentQuestion?.partNumber).toLowerCase().includes('writ')

  const isSpeaking =
    !isWriting &&
    (currentQuestion?.questionType === 'SPEAKING' ||
      currentQuestion?.skillType === 'SPEAKING' ||
      String(currentQuestion?.partNumber).toLowerCase().includes('speak'))

  const isSystemPlacement = Boolean(
    examData?.is_system_placement ||
    examData?.placement_type ||
    Boolean(examData?.code && examData.code.includes('placement')) ||
    examData?.title?.toLowerCase().includes('đầu vào') ||
    examData?.title?.toLowerCase().includes('placement')
  )

  const hasExplicitPart =
    !isSystemPlacement &&
    !isWriting &&
    !isSpeaking &&
    typeof currentQuestion?.partNumber === 'number' &&
    currentQuestion.partNumber >= 1 &&
    currentQuestion.partNumber <= 7

  const currentPart = hasExplicitPart ? (currentQuestion.partNumber as number) : undefined
  const partName = hasExplicitPart && currentPart ? `Part ${currentPart}` : undefined

  const partTip = isWriting
    ? isVietnamese
      ? 'Đảm bảo cấu trúc bài viết rõ ràng, đủ luận điểm và đạt tối thiểu số từ yêu cầu.'
      : 'Ensure clear structure, coherence, and meet the minimum word count.'
    : isSpeaking
      ? isVietnamese
        ? 'Nói to rõ ràng, tự nhiên, bám sát các ý trọng tâm trong đề bài.'
        : 'Speak clearly, naturally, and cover all required prompt points.'
      : hasExplicitPart && currentPart
        ? PART_TIPS[currentPart]
        : undefined

  const partTiming = hasExplicitPart && currentPart ? PART_TIMINGS[currentPart] : undefined

  return (
    <div className="min-h-screen bg-surface-secondary">
      <ToeicExamHeader
        title={examData?.title || 'TOEIC Exam'}
        currentQuestionIndex={state.currentQuestionIndex}
        totalQuestions={allQuestions.length}
        timedMode={state.timedMode}
        timeRemaining={state.timeRemaining}
        isVietnamese={isVietnamese}
        onBackToModeSelect={() => navigate(-1)}
        onSubmit={handleSubmit}
      />

      <div className="w-full grid gap-6 p-4 sm:p-6 lg:p-8 lg:grid-cols-[1fr_320px]">
        {currentQuestion && (
          <ToeicQuestionCard
            question={currentQuestion}
            currentPart={currentPart}
            partName={partName}
            partTip={partTip}
            selectedOption={state.answers[currentQuestion.questionNumber]}
            isFlagged={state.flagged.includes(currentQuestion.questionNumber)}
            showAnswer={state.showAnswer}
            isSubmitted={state.submitted}
            currentIndex={state.currentQuestionIndex}
            totalQuestions={allQuestions.length}
            onSelectAnswer={handleSelectAnswer}
            onToggleFlag={toggleFlag}
            onPrev={() => goToQuestion(state.currentQuestionIndex - 1)}
            onNext={() => goToQuestion(state.currentQuestionIndex + 1)}
          />
        )}

        <ToeicQuestionNav
          questions={allQuestions}
          answers={state.answers}
          flagged={state.flagged}
          currentIndex={state.currentQuestionIndex}
          currentPart={currentPart}
          partTiming={partTiming}
          onGoToQuestion={goToQuestion}
        />
      </div>
    </div>
  )
}
