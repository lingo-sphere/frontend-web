// Banner gợi ý học viên làm bài test đầu vào hệ thống tại trang danh sách khóa học.

'use client'

import { useState, useEffect } from 'react'
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
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth.store'
import { UserScoreEditModal } from '@/components/user/user.score.edit.modal'
import { storage, STORAGE_KEYS } from '@/lib/storage'

export function CoursePlacementBanner() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [showEditScoreModal, setShowEditScoreModal] = useState(false)
  const [placementData, setPlacementData] = useState<{
    score: number
    listening?: number
    reading?: number
    speaking?: number
    writing?: number
    skillsType?: string
    testedAt?: string
  } | null>(null)

  useEffect(() => {

    const rawUser = user as any
    if (rawUser?.placement_test_score) {
      setPlacementData({
        score: rawUser.placement_test_score,
        listening: rawUser.placement_listening_score,
        reading: rawUser.placement_reading_score,
        speaking: rawUser.placement_speaking_score,
        writing: rawUser.placement_writing_score,
        skillsType: rawUser.placement_skills_type || '2SKILLS',
        testedAt: rawUser.placement_tested_at,
      })
      return
    }

    const stored = storage.get<{
      placement_test_score?: number
      placement_listening_score?: number
      placement_reading_score?: number
      placement_speaking_score?: number
      placement_writing_score?: number
      placement_skills_type?: string
      placement_tested_at?: string
    }>(STORAGE_KEYS.PLACEMENT_SCORE)
    if (stored?.placement_test_score) {
      setPlacementData({
        score: stored.placement_test_score,
        listening: stored.placement_listening_score,
        reading: stored.placement_reading_score,
        speaking: stored.placement_speaking_score,
        writing: stored.placement_writing_score,
        skillsType: stored.placement_skills_type || '2SKILLS',
        testedAt: stored.placement_tested_at,
      })
    }
  }, [user])

  if (placementData && placementData.score > 0) {
    const is4Skills = placementData.skillsType === '4SKILLS' || (placementData.speaking && placementData.speaking > 0)

    return (
      <>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 border border-indigo-500/30 shadow-xl shadow-indigo-950/20 animate-in fade-in duration-300">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 -mb-16 h-48 w-48 rounded-full bg-teal-500/15 blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                <CheckCircle2 size={13} />
                <span>Đã Xác Thực Trình Độ Đầu Vào (Baseline)</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
                <span>Trình độ hiện tại: </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-300 font-extrabold text-2xl sm:text-3xl">
                  {placementData.score} / 990 TOEIC
                </span>
              </h2>

              <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-300 pt-0.5">
                <span className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/10 font-bold text-slate-200">
                  🎧 Listening: {placementData.listening ?? '--'}đ
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/10 font-bold text-slate-200">
                  📖 Reading: {placementData.reading ?? '--'}đ
                </span>
                {is4Skills && (
                  <>
                    <span className="px-2.5 py-1 rounded-xl bg-teal-500/20 border border-teal-500/30 font-bold text-teal-300">
                      🗣️ Speaking: {placementData.speaking ?? '--'}đ
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-teal-500/20 border border-teal-500/30 font-bold text-teal-300">
                      ✍️ Writing: {placementData.writing ?? '--'}đ
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Button
                type="button"
                onClick={() => navigate('/roadmap')}
                className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 shadow-lg shadow-emerald-500/25 cursor-pointer flex items-center gap-2 transition-all hover:scale-102"
              >
                <Compass size={16} />
                <span>Xem lộ trình cá nhân</span>
                <ArrowRight size={15} />
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditScoreModal(true)}
                className="rounded-2xl bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold text-xs px-4 py-2.5 cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>Test lại trình độ</span>
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
              skillsType: (placementData.skillsType as any) || '2SKILLS',
            }}
            onSuccess={(updated) => {
              if (updated) {
                setPlacementData({
                  score: updated.placement_test_score || placementData.score,
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-6 sm:p-8 border border-indigo-400/30 shadow-2xl shadow-indigo-950/30 animate-in fade-in duration-300">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 -mb-16 h-56 w-56 rounded-full bg-violet-400/20 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-indigo-200 border border-white/20 text-xs font-bold">
              <Sparkles size={14} className="text-amber-300" />
              <span>ĐÁNH GIÁ NĂNG LỰC ĐẦU VÀO • HOÀN TOÀN MIỄN PHÍ</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Bạn Chưa Rõ Trình Độ Hiện Tại Của Mình?
            </h2>

            <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
              Làm bài kiểm tra đánh giá năng lực rút gọn để hệ thống AI định vị chính xác trình độ và gợi ý danh sách khóa học phù hợp nhất với mục tiêu của bạn.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-[11.5px] text-indigo-200/80 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Format đề thi chuẩn ETS
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Chấm điểm & lưu Baseline tự động
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Gợi ý lộ trình cá nhân hóa
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/toeic/exam/placement_2skills')}
              className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-xl shadow-emerald-500/25 cursor-pointer group hover:scale-102"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Headphones size={20} />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black">
                    Test Đầu Vào 2 Kỹ Năng
                  </div>
                  <div className="text-[11px] text-emerald-100 opacity-90">
                    Listening & Reading • 60 phút
                  </div>
                </div>
              </div>
              <ArrowRight size={16} className="text-white group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/toeic/exam/placement_4skills')}
              className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/20 transition-all cursor-pointer group hover:scale-102"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Mic size={20} />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black">
                    Test Toàn Diện 4 Kỹ Năng
                  </div>
                  <div className="text-[11px] text-indigo-200 opacity-90">
                    LR + Nói & Viết AI • 90 phút
                  </div>
                </div>
              </div>
              <ArrowRight size={16} className="text-white group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => setShowEditScoreModal(true)}
              className="text-[11.5px] font-bold text-indigo-200 hover:text-white underline underline-offset-4 text-center cursor-pointer pt-1"
            >
              Đã có điểm thi thật? Nhập điểm để nhận gợi ý ngay
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
          }}
          onSuccess={(updated) => {
            if (updated) {
              setPlacementData({
                score: updated.placement_test_score || 500,
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
