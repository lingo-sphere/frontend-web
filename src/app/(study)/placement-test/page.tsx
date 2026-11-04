// Trang danh sách đề thi đánh giá năng lực đầu vào và quản lý trình độ học viên.
'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@/lib/navigation'
import {
  Trophy,
  Headphones,
  BookOpen,
  Sparkles,
  ArrowRight,
  ClipboardCheck,
  RotateCcw,
  Clock,
  HelpCircle,
  Award,
  CheckCircle2,
  FileEdit,
} from 'lucide-react'
import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import { SectionHeading } from '@/features/dashboard/components/section.heading'
import { useActivePlacementExamsQuery } from '@/features/toeic/hooks/use.toeic.query'
import type { BackendToeicExam } from '@/features/toeic/services/exam.service'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { toast } from '@/store/toast.store'
import { UserScoreEditModal } from '@/features/user/components/user.score.edit.modal'
import { getUserScoreLevelInfo } from '@/features/user/utils/user.score.utils'
import { formatDate } from '@/lib/format'

export default function PlacementTestPage() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const isVietnamese = i18n.language === 'vi'
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const [showEditScoreModal, setShowEditScoreModal] = useState(false)

  const { data: rawExams = [], isLoading } = useActivePlacementExamsQuery()

  const placementExams = (Array.isArray(rawExams) ? rawExams : []).filter(
    (e: BackendToeicExam) => e.is_published !== false
  )

  const userPlacementScore = Number(user?.placement_test_score) || 0
  const hasTested = Boolean(userPlacementScore > 0 || user?.placement_tested_at)
  const levelInfo = getUserScoreLevelInfo(userPlacementScore, hasTested)

  const handleStartExam = (examId: string) => {
    if (!isAuthenticated) {
      toast.info(
        isVietnamese
          ? 'Vui lòng đăng nhập để bắt đầu làm bài thi đánh giá năng lực đầu vào'
          : 'Please log in to start your entrance placement exam'
      )
      navigate(`/login?returnUrl=/toeic/exam/${examId}`)
      return
    }
    navigate(`/toeic/exam/${examId}`)
  }

  return (
    <>
      <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8 max-w-7xl mx-auto space-y-6">
        <SectionHeading
          eyebrow={isVietnamese ? 'ĐÁNH GIÁ NĂNG LỰC ĐẦU VÀO' : 'PLACEMENT TEST'}
          title={
            isVietnamese
              ? 'Đề thi Đánh Giá Năng Lực Đầu Vào'
              : 'System Placement & Entrance Tests'
          }
          description={
            isVietnamese
              ? 'Làm bài kiểm tra năng lực đầu vào chuẩn hóa ETS để hệ thống AI định vị chính xác trình độ hiện tại và thiết lập lộ trình học tập tối ưu cho bạn.'
              : 'Take official standardized placement tests to assess your current proficiency and tailor your personalized learning path.'
          }
        />

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-7 border border-indigo-500/30 shadow-xl shadow-indigo-950/20">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  <Sparkles size={14} className="text-amber-400" />
                  <span>{isVietnamese ? 'Hồ Sơ Năng Lực Baseline' : 'Baseline Profile'}</span>
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${levelInfo.badgeColor}`}
                >
                  <Award size={13} />
                  <span>{levelInfo.name}</span>
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  {hasTested
                    ? isVietnamese
                      ? `Trình độ hiện tại: ${userPlacementScore} / 990 TOEIC`
                      : `Current Level: ${userPlacementScore} / 990 TOEIC`
                    : isVietnamese
                    ? 'Bạn chưa có điểm đánh giá năng lực đầu vào'
                    : 'You have not taken an entrance test yet'}
                </h3>
                <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed mt-1">
                  {hasTested
                    ? levelInfo.desc
                    : isVietnamese
                    ? 'Làm bài kiểm tra đầu vào rút gọn miễn phí ngay bên dưới để AI cá nhân hóa lộ trình học và gợi ý khóa học sát nhất với mục tiêu của bạn.'
                    : 'Take a quick free placement test below so our AI can personalize your study roadmap to reach your target band.'}
                </p>
              </div>

              {hasTested && (
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                  <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center gap-2">
                    <Headphones size={14} className="text-sky-300" />
                    <span>
                      {isVietnamese ? 'Nghe:' : 'Listening:'}{' '}
                      <strong className="text-white">
                        {user?.placement_listening_score ?? 0}đ
                      </strong>
                    </span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center gap-2">
                    <BookOpen size={14} className="text-emerald-300" />
                    <span>
                      {isVietnamese ? 'Đọc:' : 'Reading:'}{' '}
                      <strong className="text-white">
                        {user?.placement_reading_score ?? 0}đ
                      </strong>
                    </span>
                  </div>
                  {user?.placement_tested_at && (
                    <span className="text-[11px] text-indigo-300/80">
                      {isVietnamese ? 'Cập nhật:' : 'Updated:'}{' '}
                      {formatDate(user.placement_tested_at, isVietnamese)}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
              <Button
                variant="outline"
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.warning(
                      isVietnamese
                        ? 'Vui lòng đăng nhập để cập nhật điểm trình độ'
                        : 'Please log in to update your score'
                    )
                    return
                  }
                  setShowEditScoreModal(true)
                }}
                className="rounded-xl border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                <FileEdit size={14} />
                <span>{isVietnamese ? 'Nhập điểm thi thật' : 'Enter Official Score'}</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="rounded-2xl border-amber-200/60 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="flex items-center gap-3.5 p-4.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Trophy className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-text-primary">
                  {isVietnamese ? 'Thang điểm ETS 990' : 'Standard ETS 990'}
                </h4>
                <p className="text-xs text-text-secondary mt-0.5">
                  {isVietnamese
                    ? 'Quy đổi điểm số và đối chiếu CEFR chuẩn quốc tế'
                    : 'Accurate scale and CEFR benchmark'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-indigo-200/60 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20">
            <CardContent className="flex items-center gap-3.5 p-4.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-text-primary">
                  {isVietnamese ? 'Đề thi rút gọn tinh chuẩn' : 'Optimized Diagnostic Format'}
                </h4>
                <p className="text-xs text-text-secondary mt-0.5">
                  {isVietnamese
                    ? 'Đầy đủ kỹ năng Nghe & Đọc, làm nhanh không mệt mỏi'
                    : 'Full listening & reading skills evaluation'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20">
            <CardContent className="flex items-center gap-3.5 p-4.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-text-primary">
                  {isVietnamese ? 'Cá nhân hóa lộ trình AI' : 'AI Learning Recommendations'}
                </h4>
                <p className="text-xs text-text-secondary mt-0.5">
                  {isVietnamese
                    ? 'Tự động gợi ý khóa học và bài luyện tập phù hợp'
                    : 'Personalized course & practice suggestions'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-text-primary">
                {isVietnamese
                  ? 'Danh sách đề thi đầu vào hệ thống'
                  : 'System Placement Tests'}
              </h3>
              <p className="text-xs text-text-secondary">
                {isVietnamese
                  ? 'Chọn đề thi kiểm tra đầu vào để bắt đầu đánh giá'
                  : 'Select an entrance test below to start your diagnostic session'}
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-surface-subtle border border-border text-text-secondary">
              {placementExams.length}{' '}
              {isVietnamese ? 'đề thi sẵn sàng' : 'tests available'}
            </span>
          </div>

          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2].map((idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-border bg-surface p-5 space-y-4 animate-pulse"
                >
                  <div className="h-6 w-28 rounded-full bg-surface-subtle" />
                  <div className="h-5 w-3/4 rounded-md bg-surface-subtle" />
                  <div className="h-12 w-full rounded-md bg-surface-subtle" />
                  <div className="h-10 w-full rounded-xl bg-surface-subtle" />
                </div>
              ))}
            </div>
          ) : placementExams.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-border bg-surface p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
                <HelpCircle size={24} />
              </div>
              <h4 className="text-sm font-bold text-text-primary">
                {isVietnamese
                  ? 'Hiện tại chưa có đề thi đầu vào nào được xuất bản'
                  : 'No placement tests are currently published'}
              </h4>
              <p className="text-xs text-text-secondary max-w-md mx-auto">
                {isVietnamese
                  ? 'Vui lòng quay lại sau hoặc liên hệ ban quản trị để được hỗ trợ kiểm tra năng lực.'
                  : 'Please check back later or contact administrators for assistance.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {placementExams.map((exam) => {
                const skillsText =
                  exam.skills_enabled === 'LRSW'
                    ? isVietnamese
                      ? '4 Kỹ năng (L, R, S, W)'
                      : '4 Skills (L, R, S, W)'
                    : isVietnamese
                    ? '2 Kỹ năng (Nghe & Đọc)'
                    : '2 Skills (Listening & Reading)'

                const durationText = `${exam.duration_minutes || 120} ${
                  isVietnamese ? 'phút' : 'mins'
                }`
                const questionsText = `${exam.total_questions || 40} ${
                  isVietnamese ? 'câu hỏi' : 'questions'
                }`

                return (
                  <Card
                    key={exam._id}
                    className="group relative flex flex-col justify-between rounded-3xl border border-border bg-surface p-5.5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-extrabold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                          <CheckCircle2 size={12} />
                          <span>
                            {isVietnamese ? 'Đề thi đầu vào' : 'Entrance Placement'}
                          </span>
                        </span>

                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary">
                          {isVietnamese ? 'Miễn phí' : 'Free'}
                        </span>
                      </div>

                      <h4 className="text-base font-extrabold text-text-primary group-hover:text-primary transition-colors leading-snug">
                        {exam.title}
                      </h4>

                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                        {exam.description ||
                          (isVietnamese
                            ? 'Bộ đề thi đánh giá toàn diện năng lực tiếng Anh theo cấu trúc chuẩn quốc tế.'
                            : 'Comprehensive entrance test assessing English proficiency under international standards.')}
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Headphones size={14} className="text-primary shrink-0" />
                          <span className="truncate">{skillsText}</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Clock size={14} className="text-amber-500 shrink-0" />
                          <span>{durationText}</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                          <ClipboardCheck size={14} className="text-sky-500 shrink-0" />
                          <span>{questionsText}</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Trophy size={14} className="text-amber-500 shrink-0" />
                          <span>{isVietnamese ? 'Thang điểm 990' : 'Score 990'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-5 mt-2">
                      <button
                        type="button"
                        onClick={() => handleStartExam(exam._id)}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary-hover text-white font-extrabold text-xs py-3 shadow-md shadow-primary/20 transition-all cursor-pointer group-hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <span>{isVietnamese ? 'Bắt đầu làm bài thi' : 'Start Placement Exam'}</span>
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {showEditScoreModal && (
        <UserScoreEditModal
          open={showEditScoreModal}
          onOpenChange={setShowEditScoreModal}
          currentScores={{
            totalScore: userPlacementScore || 450,
            listeningScore: user?.placement_listening_score ?? 225,
            readingScore: user?.placement_reading_score ?? 225,
            speakingScore: user?.placement_speaking_score ?? 110,
            writingScore: user?.placement_writing_score ?? 110,
            skillsType: user?.placement_skills_type || '2SKILLS',
            targetScore: Number(user?.target_toeic_score) || 650,
          }}
          onSuccess={() => {
            setShowEditScoreModal(false)
            toast.success(
              isVietnamese
                ? 'Đã cập nhật điểm trình độ thành công!'
                : 'Proficiency score updated successfully!'
            )
          }}
        />
      )}
    </>
  )
}

