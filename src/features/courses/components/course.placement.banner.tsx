// Banner gọn hiển thị điểm số baseline đầu vào hoặc gợi ý làm bài kiểm tra năng lực
'use client'

import { useState, useMemo } from 'react'
import { useNavigate } from '@/lib/navigation'
import {
  Sparkles,
  ArrowRight,
  Headphones,
  Mic,
  RotateCcw,
  CheckCircle2,
  Compass,
} from 'lucide-react'
import { Button } from '@/components/button'
import { toast } from '@/store/toast.store'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { UserScoreEditModal } from '@/features/user/components/user.score.edit.modal'
import { useMounted } from '@/hooks/use.mounted'

interface PlacementData {
  score: number
  listening?: number
  reading?: number
  speaking?: number
  writing?: number
  skillsType?: string
  testedAt?: string
}

function resolvePlacementData(user: ReturnType<typeof useAuthStore.getState>['user']): PlacementData | null {
  if (user) {
    const scoreNum = Number(user.placement_test_score)
    if (scoreNum > 0) {
      return {
        score: scoreNum,
        listening: typeof user.placement_listening_score === 'number' ? user.placement_listening_score : undefined,
        reading: typeof user.placement_reading_score === 'number' ? user.placement_reading_score : undefined,
        speaking: typeof user.placement_speaking_score === 'number' ? user.placement_speaking_score : undefined,
        writing: typeof user.placement_writing_score === 'number' ? user.placement_writing_score : undefined,
        skillsType: typeof user.placement_skills_type === 'string' ? user.placement_skills_type : '2SKILLS',
        testedAt: typeof user.placement_tested_at === 'string' ? user.placement_tested_at : undefined,
      }
    }
  }

  return null
}

export function CoursePlacementBannerSkeleton() {
  return (
    <div className="rounded-2xl bg-slate-900/40 p-3 sm:p-3.5 border border-indigo-500/20 shadow-sm animate-pulse h-14 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 shrink-0" />
        <div className="space-y-1">
          <div className="h-3.5 w-36 sm:w-48 rounded-md bg-white/10" />
          <div className="h-2.5 w-48 sm:w-80 rounded-md bg-white/10 hidden sm:block" />
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-2">
        <div className="h-8 w-28 rounded-xl bg-emerald-500/20" />
        <div className="h-8 w-28 rounded-xl bg-white/10" />
      </div>
    </div>
  )
}

export function CoursePlacementBanner() {
  const navigate = useNavigate()
  const mounted = useMounted()
  const { user } = useAuthStore()
  const [showEditScoreModal, setShowEditScoreModal] = useState(false)
  const [customPlacementData, setCustomPlacementData] = useState<PlacementData | null>(null)

  const placementData = useMemo(() => {
    if (!mounted) return null
    if (customPlacementData) return customPlacementData
    return resolvePlacementData(user)
  }, [mounted, customPlacementData, user])

  if (!mounted) {
    return <CoursePlacementBannerSkeleton />
  }

  if (placementData && placementData.score > 0) {
    const is4Skills = placementData.skillsType === '4SKILLS'

    return (
      <>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 sm:px-5 py-2.5 sm:py-3 border border-indigo-500/30 shadow-md shadow-indigo-950/20 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                <CheckCircle2 size={12} />
                <span>Baseline</span>
              </span>
              <span className="text-xs sm:text-sm font-bold text-white">
                Trình độ: <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 font-extrabold">{placementData.score} / {is4Skills ? '1390' : '990'} TOEIC</span>
              </span>
              <span className="text-slate-400 text-xs hidden md:inline">•</span>
              <div className="hidden md:flex items-center gap-2 text-xs text-slate-300">
                <span>🎧 Nghe: <strong className="text-slate-100">{placementData.listening ?? '--'}đ</strong></span>
                <span>•</span>
                <span>📖 Đọc: <strong className="text-slate-100">{placementData.reading ?? '--'}đ</strong></span>
                {is4Skills && (
                  <>
                    <span>•</span>
                    <span className="text-teal-300">🗣️ Nói: <strong>{placementData.speaking ?? '--'}đ</strong></span>
                    <span>•</span>
                    <span className="text-teal-300">✍️ Viết: <strong>{placementData.writing ?? '--'}đ</strong></span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                onClick={() => navigate('/toeic')}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs px-3.5 py-1.5 h-8 shadow-sm cursor-pointer flex items-center gap-1.5 transition-all hover:scale-102"
              >
                <Compass size={14} />
                <span>Luyện đề TOEIC</span>
                <ArrowRight size={13} />
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (!user) {
                    toast.warning('Vui lòng đăng nhập để cập nhật điểm trình độ.')
                    return
                  }
                  setShowEditScoreModal(true)
                }}
                className="rounded-xl bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold text-xs px-3 py-1.5 h-8 cursor-pointer flex items-center gap-1"
              >
                <RotateCcw size={13} />
                <span>Test lại</span>
              </Button>
            </div>
          </div>
        </div>

        {showEditScoreModal && (
          <UserScoreEditModal
            open={showEditScoreModal}
            onOpenChange={setShowEditScoreModal}
            currentScores={{
              totalScore: placementData.score,
              listeningScore: placementData.listening,
              readingScore: placementData.reading,
              speakingScore: placementData.speaking,
              writingScore: placementData.writing,
              skillsType: (placementData.skillsType as '2SKILLS' | '4SKILLS') || '2SKILLS',
              targetScore: Number(user?.target_toeic_score) || 450,
            }}
            onSuccess={(updated) => {
              if (updated) {
                const newScore = Number(updated.placement_test_score) || placementData.score
                setCustomPlacementData({
                  score: newScore,
                  listening: updated.placement_listening_score,
                  reading: updated.placement_reading_score,
                  speaking: updated.placement_speaking_score,
                  writing: updated.placement_writing_score,
                  skillsType: updated.placement_skills_type || '2SKILLS',
                  testedAt: updated.placement_tested_at || new Date().toISOString(),
                })
              }
              setShowEditScoreModal(false)
            }}
          />
        )}
      </>
    )
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white px-4 sm:px-5 py-3 sm:py-3.5 border border-indigo-400/30 shadow-md shadow-indigo-950/20 animate-in fade-in duration-200">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 text-amber-300">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xs sm:text-sm font-extrabold text-white tracking-tight">
                  Chưa Rõ Trình Độ Của Mình?
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                  Miễn phí
                </span>
              </div>
              <p className="text-[11.5px] text-indigo-200/90 line-clamp-1 sm:line-clamp-none mt-0.5">
                Làm bài test rút gọn chuẩn ETS để hệ thống AI định vị trình độ và gợi ý khóa học sát nhất.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/toeic/exam/placement_2skills')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-102 cursor-pointer"
            >
              <Headphones size={14} />
              <span>Test 2 Kỹ Năng</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/toeic/exam/placement_4skills')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs transition-all hover:scale-102 cursor-pointer"
            >
              <Mic size={14} />
              <span>Test 4 Kỹ Năng</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!user) {
                  toast.warning('Vui lòng đăng nhập để cập nhật điểm trình độ.')
                  return
                }
                setShowEditScoreModal(true)
              }}
              className="text-[11.5px] font-bold text-indigo-200 hover:text-white underline underline-offset-4 cursor-pointer px-2 py-1"
            >
              Nhập điểm thi thật
            </button>
          </div>
        </div>
      </div>

      {showEditScoreModal && (
        <UserScoreEditModal
          open={showEditScoreModal}
          onOpenChange={setShowEditScoreModal}
          currentScores={{
            totalScore: 500,
            listeningScore: 250,
            readingScore: 250,
            speakingScore: 110,
            writingScore: 110,
            skillsType: '2SKILLS',
            targetScore: Number(user?.target_toeic_score) || 600,
          }}
          onSuccess={(updated) => {
            if (updated) {
              const newScore = Number(updated.placement_test_score) || 0
              setCustomPlacementData({
                score: newScore,
                listening: updated.placement_listening_score,
                reading: updated.placement_reading_score,
                speaking: updated.placement_speaking_score,
                writing: updated.placement_writing_score,
                skillsType: updated.placement_skills_type || '2SKILLS',
                testedAt: updated.placement_tested_at || '',
              })
            }
            setShowEditScoreModal(false)
          }}
        />
      )}
    </>
  )
}
