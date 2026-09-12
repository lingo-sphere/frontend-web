// Thẻ hiển thị điểm trình độ đánh giá đầu vào và mục tiêu TOEIC trong trang hồ sơ cá nhân.
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Award,
  Sparkles,
  BookOpen,
  FileEdit,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  Layers,
} from 'lucide-react'
import { Card, CardContent } from '@/components/card'
import { UserScoreEditModal } from '@/features/user/components/user.score.edit.modal'
import { UserSkillScoreGrid } from '@/features/user/components/user.skill.score.grid'
import { getUserScoreLevelInfo } from '@/features/user/utils/user.score.utils'
import { userService } from '@/features/user/services/user.service'
import { useAuthStore } from '@/features/auth/store/auth.store'

interface UserScoreCardProps {
  userScores: {
    totalScore?: number
    listeningScore?: number
    readingScore?: number
    speakingScore?: number
    writingScore?: number
    targetScore?: number
    skillsType?: '2SKILLS' | '4SKILLS' | string
    isManuallyEdited?: boolean
    hasTested?: boolean
    testedAt?: string | null
  }
  onScoresUpdated?: (newScores: any) => void
}

export function UserScoreCard({ userScores, onScoresUpdated }: UserScoreCardProps) {
  const router = useRouter()
  const [showEditModal, setShowEditModal] = useState<boolean>(false)
  const [selectedSkillsType, setSelectedSkillsType] = useState<'2SKILLS' | '4SKILLS'>(
    userScores.skillsType === '4SKILLS' ? '4SKILLS' : '2SKILLS'
  )

  useEffect(() => {
    if (userScores.skillsType) {
      setSelectedSkillsType(userScores.skillsType === '4SKILLS' ? '4SKILLS' : '2SKILLS')
    }
  }, [userScores.skillsType])

  const rawTotal = userScores.totalScore || 0
  const listeningScore = userScores.listeningScore || 0
  const readingScore = userScores.readingScore || 0
  const speakingScore = userScores.speakingScore || 0
  const writingScore = userScores.writingScore || 0
  const isManuallyEdited = userScores.isManuallyEdited ?? false
  const hasTested = Boolean(
    rawTotal > 0 ||
    listeningScore > 0 ||
    readingScore > 0 ||
    speakingScore > 0 ||
    writingScore > 0 ||
    userScores.testedAt
  )
  const totalScore = hasTested ? (rawTotal || listeningScore + readingScore) : 0
  const hasTargetScore = Boolean(
    userScores.targetScore &&
    userScores.targetScore > 0 &&
    (hasTested || isManuallyEdited)
  )

  const handleSelectSkillsType = async (type: '2SKILLS' | '4SKILLS') => {
    setSelectedSkillsType(type)
    try {
      await userService.updateProfile({ placement_skills_type: type })
      const { user, setUser } = useAuthStore.getState()
      if (user) {
        setUser({
          ...user,
          placement_skills_type: type,
        })
      }
      if (onScoresUpdated) {
        onScoresUpdated({
          ...userScores,
          skillsType: type,
        })
      }
    } catch (err) {
      console.error(err)
    }
  }

  const level = getUserScoreLevelInfo(totalScore, hasTested)

  return (
    <>
      <Card className="dashboard-card overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-lg relative">
        <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-teal-500/10 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-teal-950/40 p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Điểm Đánh Giá Năng Lực Đầu Vào
                  </h3>
                  {!hasTested ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      <AlertCircle className="w-3 h-3 text-slate-400" />
                      <span>Chưa có điểm kiểm tra</span>
                    </span>
                  ) : isManuallyEdited ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <AlertCircle className="w-3 h-3 text-amber-500" />
                      <span>Học viên tự cập nhật</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      <span>Đã kiểm chứng bài test hệ thống</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Dùng để định hướng lộ trình & mở khóa bộ gợi ý khóa học tối ưu
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-xs cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              <FileEdit className="w-3.5 h-3.5 text-indigo-500" />
              <span>Chỉnh sửa điểm</span>
            </button>
          </div>
        </div>

        <CardContent className="p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Tổng điểm hiện tại:
              </span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {hasTested ? (
                  <>
                    {totalScore} <span className="text-xs font-normal text-slate-400">/ 990</span>
                  </>
                ) : (
                  <span className="text-base font-bold text-slate-400">Chưa thiết lập</span>
                )}
              </div>
              <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                {level.name}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/50 space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-violet-500" />
                <span>Mục tiêu TOEIC:</span>
              </span>
              <div className="text-2xl font-black text-violet-600 dark:text-violet-400">
                {hasTargetScore ? (
                  <>
                    {userScores.targetScore} <span className="text-xs font-normal text-slate-400">/ 990</span>
                  </>
                ) : (
                  <span className="text-base font-bold text-slate-400">Chưa thiết lập</span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {hasTargetScore ? (
                  hasTested ? (
                    <>
                      Cần tích lũy thêm: <strong>{Math.max(0, (userScores.targetScore || 0) - totalScore)} điểm</strong>
                    </>
                  ) : (
                    <span>Mục tiêu đầu ra dự kiến</span>
                  )
                ) : (
                  <span>Chưa đặt mục tiêu đầu ra</span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Hình thức đánh giá:
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300">
                  {selectedSkillsType === '4SKILLS' ? '4 Kỹ Năng' : '2 Kỹ Năng'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-white/90 dark:bg-slate-900/80 rounded-xl border border-teal-200/60 dark:border-teal-800/50">
                <button
                  type="button"
                  onClick={() => handleSelectSkillsType('2SKILLS')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedSkillsType === '2SKILLS'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span>2 Kỹ Năng</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSkillsType('4SKILLS')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedSkillsType === '4SKILLS'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 shrink-0" />
                  <span>4 Kỹ Năng</span>
                </button>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {selectedSkillsType === '4SKILLS'
                  ? 'Listening & Reading + Speaking & Writing'
                  : 'Listening & Reading (Thang điểm 990)'}
              </div>
            </div>
          </div>

          <UserSkillScoreGrid
            listeningScore={listeningScore}
            readingScore={readingScore}
            speakingScore={speakingScore}
            writingScore={writingScore}
            hasTested={hasTested}
            selectedSkillsType={selectedSkillsType}
          />

          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/80 dark:border-indigo-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-200">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Bạn muốn đo lường lại năng lực thực tế?</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Làm bài test chính thức của hệ thống để cập nhật kết quả kiểm chứng mới nhất.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push('/toeic/exam/exam_placement_2skills_lr')}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
              >
                Test 2 Kỹ Năng
              </button>
              <button
                type="button"
                onClick={() => router.push('/toeic/exam/exam_placement_4skills_full')}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
              >
                Test 4 Kỹ Năng
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showEditModal && (
        <UserScoreEditModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          currentScores={{
            totalScore,
            listeningScore,
            readingScore,
            speakingScore: userScores.speakingScore,
            writingScore: userScores.writingScore,
            targetScore: userScores.targetScore,
            skillsType: selectedSkillsType,
          }}
          onSuccess={(updated) => {
            if (onScoresUpdated) onScoresUpdated(updated)
          }}
        />
      )}
    </>
  )
}
