'use client'

/**
 * @file user.score.card.tsx
 * @description Thẻ hiển thị điểm trình độ đánh giá đầu vào và mục tiêu TOEIC trong trang hồ sơ cá nhân
 */

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Award,
  Sparkles,
  Headphones,
  BookOpen,
  Mic,
  FileEdit,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  RotateCcw,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { UserScoreEditModal } from '@/components/user/user.score.edit.modal'

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
    testedAt?: string
  }
  onScoresUpdated?: (newScores: any) => void
}

export function UserScoreCard({ userScores, onScoresUpdated }: UserScoreCardProps) {
  const router = useRouter()
  const [showEditModal, setShowEditModal] = useState<boolean>(false)

  const totalScore = userScores.totalScore || (userScores.listeningScore || 0) + (userScores.readingScore || 0) || 450
  const listeningScore = userScores.listeningScore || 240
  const readingScore = userScores.readingScore || 210
  const targetScore = userScores.targetScore || 650
  const is4Skills = userScores.skillsType === '4SKILLS'
  const isManuallyEdited = userScores.isManuallyEdited ?? false

  const getLevelInfo = (score: number) => {
    if (score < 450) {
      return {
        name: 'Mất Gốc / Nền Tảng (Beginner)',
        desc: 'Cần củng cố từ vựng cơ bản, phát âm và ngữ pháp thiết yếu.',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
      }
    }
    if (score < 650) {
      return {
        name: 'Trung Cấp (Intermediate)',
        desc: 'Đã nắm vững cấu trúc cơ bản, cần tăng tốc độ làm bài & kỹ thuật bẫy TOEIC.',
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800',
      }
    }
    if (score < 800) {
      return {
        name: 'Nâng Cao (Upper-Intermediate)',
        desc: 'Khả năng giao tiếp và làm bài tốt, hướng tới band 800+ và kỹ năng Speaking & Writing.',
        badgeColor: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800',
      }
    }
    return {
      name: 'Cao Cấp / Master (Advanced)',
      desc: 'Năng lực xuất sắc, làm quen với đề thi khó và bộ bẫy nâng cao 850 - 990.',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
    }
  }

  const level = getLevelInfo(totalScore)

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
                  {isManuallyEdited ? (
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
          {/* Main Score Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Tổng điểm hiện tại:
              </span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {totalScore} <span className="text-xs font-normal text-slate-400">/ 990</span>
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
                {targetScore} <span className="text-xs font-normal text-slate-400">/ 990</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Cần tích lũy thêm: <strong>{Math.max(0, targetScore - totalScore)} điểm</strong>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/50 space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Hình thức đánh giá:
              </span>
              <div className="text-sm font-bold text-teal-800 dark:text-teal-300 pt-1">
                {is4Skills ? '🎧 📖 🗣️ ✍️ TOEIC 4 Kỹ Năng' : '🎧 📖 TOEIC 2 Kỹ Năng'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {is4Skills ? 'LR + Speaking & Writing' : 'Listening & Reading'}
              </div>
            </div>
          </div>

          {/* Sub-scores grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
              Chi tiết điểm từng kỹ năng:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Listening</span>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {listeningScore} / 495
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Reading</span>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {readingScore} / 495
                </span>
              </div>

              {is4Skills && (
                <>
                  <div className="p-3 rounded-xl border border-teal-100 dark:border-teal-900/40 bg-teal-50/30 dark:bg-teal-950/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4 text-teal-500" />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Speaking</span>
                    </div>
                    <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
                      {userScores.speakingScore || 110} / 200
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border border-teal-100 dark:border-teal-900/40 bg-teal-50/30 dark:bg-teal-950/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileEdit className="w-4 h-4 text-teal-500" />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Writing</span>
                    </div>
                    <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
                      {userScores.writingScore || 110} / 200
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Placement Test CTA */}
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
            targetScore,
            skillsType: userScores.skillsType,
          }}
          onSuccess={(updated) => {
            if (onScoresUpdated) onScoresUpdated(updated)
          }}
        />
      )}
    </>
  )
}
