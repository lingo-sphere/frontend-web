// Trang danh sách đề thi đánh giá năng lực đầu vào và quản lý trình độ học viên.
'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@/lib/navigation'
import {
  Headphones,
  BookOpen,
  Mic,
  Sparkles,
  HelpCircle,
  Award,
  FileEdit,
} from 'lucide-react'
import { Button } from '@/components/button'
import { SectionHeading } from '@/features/dashboard/components/section.heading'
import { useActivePlacementExamsQuery } from '@/features/toeic/hooks/use.toeic.query'
import type { BackendToeicExam } from '@/features/toeic/services/exam.service'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { toast } from '@/store/toast.store'
import { UserScoreEditModal } from '@/features/user/components/user.score.edit.modal'
import { getUserScoreLevelInfo } from '@/features/user/utils/user.score.utils'
import { formatDate } from '@/lib/format'
import { PlacementExamCard } from '@/features/toeic/components/placement.exam.card'

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
  const is4Skills = user?.placement_skills_type === '4SKILLS'
  const maxScore = is4Skills ? 1390 : 990
  const levelInfo = getUserScoreLevelInfo(userPlacementScore, hasTested, maxScore)

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
      <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8 space-y-6">
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

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-5 sm:p-7 border border-emerald-500/30 shadow-xl shadow-emerald-950/20">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
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
                      ? `Trình độ hiện tại: ${userPlacementScore} / ${maxScore} TOEIC`
                      : `Current Level: ${userPlacementScore} / ${maxScore} TOEIC`
                    : isVietnamese
                    ? 'Bạn chưa có điểm đánh giá năng lực đầu vào'
                    : 'You have not taken an entrance test yet'}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed mt-1">
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
                  {is4Skills && (
                    <>
                      <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center gap-2">
                        <Mic size={14} className="text-teal-300" />
                        <span>
                          {isVietnamese ? 'Nói:' : 'Speaking:'}{' '}
                          <strong className="text-white">
                            {user?.placement_speaking_score ?? 0}đ
                          </strong>
                        </span>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center gap-2">
                        <FileEdit size={14} className="text-purple-300" />
                        <span>
                          {isVietnamese ? 'Viết:' : 'Writing:'}{' '}
                          <strong className="text-white">
                            {user?.placement_writing_score ?? 0}đ
                          </strong>
                        </span>
                      </div>
                    </>
                  )}
                  {user?.placement_tested_at && (
                    <span className="text-[11px] text-emerald-300/80">
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
            <div className="grid gap-6 grid-cols-1">
              {placementExams.map((exam) => (
                <PlacementExamCard
                  key={exam._id}
                  exam={exam}
                  onStartExam={handleStartExam}
                  isVietnamese={isVietnamese}
                />
              ))}
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
            placement_2skills_test_score: user?.placement_2skills_test_score ?? undefined,
            placement_2skills_listening_score: user?.placement_2skills_listening_score ?? undefined,
            placement_2skills_reading_score: user?.placement_2skills_reading_score ?? undefined,
            target_toeic_2skills_score: user?.target_toeic_2skills_score ?? undefined,
            placement_4skills_test_score: user?.placement_4skills_test_score ?? undefined,
            placement_4skills_listening_score: user?.placement_4skills_listening_score ?? undefined,
            placement_4skills_reading_score: user?.placement_4skills_reading_score ?? undefined,
            placement_4skills_speaking_score: user?.placement_4skills_speaking_score ?? undefined,
            placement_4skills_writing_score: user?.placement_4skills_writing_score ?? undefined,
            target_toeic_4skills_score: user?.target_toeic_4skills_score ?? undefined,
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

