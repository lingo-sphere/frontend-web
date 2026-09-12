// Component hiển thị trạng thái đề thi chưa khởi tạo hoặc không khả dụng kèm gợi ý bài thi thay thế.

import Link from 'next/link'
import {
  BookOpen,
  ArrowLeft,
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

interface ToeicExamEmptyStateProps {
  examId?: string
  isVietnamese: boolean
  hasExamData: boolean
  onNavigate: (path: string | number) => void
}

export function ToeicExamEmptyState({
  examId,
  isVietnamese,
  hasExamData,
  onNavigate,
}: ToeicExamEmptyStateProps) {
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
                  {!hasExamData
                    ? isVietnamese
                      ? 'Đề Thi Chưa Khởi Tạo Hoặc Không Khả Dụng'
                      : 'Exam Not Found Or Unpublished'
                    : isVietnamese
                      ? 'Đề Thi Chưa Có Câu Hỏi Hoàn Chỉnh'
                      : 'No Questions In This Exam'}
                </h1>
                <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
                  {!hasExamData
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
                  onClick={() => onNavigate('/toeic')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{isVietnamese ? 'Khám phá kho đề thi TOEIC' : 'Explore TOEIC Exams'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('/roadmap')}
                  className="px-4 py-2.5 rounded-xl bg-surface-subtle hover:bg-border text-text-primary text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-border hover:scale-[1.02]"
                >
                  <Target className="w-4 h-4 text-teal-500" />
                  <span>{isVietnamese ? 'Xem lộ trình cá nhân' : 'Personal Roadmap'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate(-1)}
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
                onClick={() => onNavigate('/toeic')}
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
                onClick={() => onNavigate('/toeic')}
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
                onClick={() => onNavigate('/practice')}
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
    </main>
  )
}
