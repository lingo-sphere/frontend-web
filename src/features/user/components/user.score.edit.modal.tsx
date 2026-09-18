// Modal cho phép học viên tự điều chỉnh điểm trình độ kèm theo cảnh báo khuyến nghị của hệ thống
'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  Award,
  Headphones,
  BookOpen,
  Mic,
  FileEdit,
  Layers,
  X,
} from 'lucide-react'
import { toast } from '@/store/toast.store'
import { userService } from '@/features/user/services/user.service'
import { useAuthStore } from '@/features/auth/store/auth.store'
import type { UserScoreData } from '@/features/user/utils/user.score.utils'

interface UserScoreEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentScores: UserScoreData
  onSuccess: (updatedScores: Partial<UserScoreData>) => void
}

export function UserScoreEditModal({
  open,
  onOpenChange,
  currentScores,
  onSuccess,
}: UserScoreEditModalProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [skillsType, setSkillsType] = useState<'2SKILLS' | '4SKILLS'>(
    currentScores.skillsType === '4SKILLS' ? '4SKILLS' : '2SKILLS'
  )
  const [listeningScore, setListeningScore] = useState<number>(currentScores.listeningScore ?? 0)
  const [readingScore, setReadingScore] = useState<number>(currentScores.readingScore ?? 0)
  const [speakingScore, setSpeakingScore] = useState<number>(currentScores.speakingScore ?? 0)
  const [writingScore, setWritingScore] = useState<number>(currentScores.writingScore ?? 0)
  const [targetScore, setTargetScore] = useState<number>(() => {
    if (typeof currentScores.targetScore === 'number' && currentScores.targetScore > 0) {
      return currentScores.targetScore
    }
    const storedUser = useAuthStore.getState().user
    const existingTarget = Number(storedUser?.target_toeic_score)
    return existingTarget > 0 ? existingTarget : 450
  })
  const [isSaving, setIsSaving] = useState<boolean>(false)

  if (!open) return null

  const calculatedTotal =
    skillsType === '4SKILLS'
      ? listeningScore + readingScore + speakingScore + writingScore
      : listeningScore + readingScore

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để cập nhật điểm trình độ của bạn.')
      return
    }

    if (listeningScore < 0 || listeningScore > 495) {
      toast.error('Điểm Nghe (Listening) phải từ 0 đến 495.')
      return
    }
    if (readingScore < 0 || readingScore > 495) {
      toast.error('Điểm Đọc (Reading) phải từ 0 đến 495.')
      return
    }
    if (skillsType === '4SKILLS') {
      if (speakingScore < 0 || speakingScore > 200) {
        toast.error('Điểm Nói (Speaking) phải từ 0 đến 200.')
        return
      }
      if (writingScore < 0 || writingScore > 200) {
        toast.error('Điểm Viết (Writing) phải từ 0 đến 200.')
        return
      }
    }

    setIsSaving(true)
    try {
      const payload = {
        placement_test_score: calculatedTotal,
        placement_listening_score: listeningScore,
        placement_reading_score: readingScore,
        placement_speaking_score: skillsType === '4SKILLS' ? speakingScore : undefined,
        placement_writing_score: skillsType === '4SKILLS' ? writingScore : undefined,
        placement_skills_type: skillsType,
        target_toeic_score: targetScore > 0 ? targetScore : undefined,
        current_estimated_score: calculatedTotal,
        is_score_manually_edited: true,
        placement_tested_at: new Date().toISOString(),
      }

      const updatedUser = await userService.updateProfile(payload)
      const { user, setUser } = useAuthStore.getState()
      if (user) {
        setUser({
          ...user,
          ...payload,
          ...(updatedUser || {}),
        })
      }
      toast.success('Cập nhật điểm trình độ thành công!')
      onSuccess(payload)
      onOpenChange(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể cập nhật điểm. Vui lòng thử lại.'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 dark:bg-black/35 backdrop-blur-[2px] animate-in fade-in duration-150"
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl ring-1 ring-black/5 dark:ring-white/10 p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150 relative"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Cập Nhật Điểm Trình Độ Năng Lực
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tự điều chỉnh điểm thi hoặc mức điểm thực tế của bạn
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        
        {!isAuthenticated && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11.5px] text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Yêu cầu đăng nhập: </span>
              <span>Bạn cần đăng nhập tài khoản LingoSphere để lưu và cập nhật điểm trình độ vào hệ thống.</span>
            </div>
          </div>
        )}

        <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Khuyến Nghị Quan Trọng Từ Hệ Thống</span>
          </div>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
            Hệ thống khuyên bạn nên làm bài kiểm tra đầu vào trên hệ thống để đo lường chính xác nhất. Việc tự ý chỉnh sửa có thể khiến các khóa học được gợi ý không phản ánh đúng năng lực hiện tại của bạn. Tuy nhiên, nếu bạn đã có kết quả thi thật, bạn hoàn toàn có thể lưu lại mức điểm này.
          </p>
        </div>

        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Hình thức bài thi bạn có điểm:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSkillsType('2SKILLS')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  skillsType === '2SKILLS'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/20'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>2 Kỹ Năng (LR)</span>
              </button>
              <button
                type="button"
                onClick={() => setSkillsType('4SKILLS')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  skillsType === '4SKILLS'
                    ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300 ring-1 ring-teal-500/20'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>4 Kỹ Năng (Toàn diện)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5 text-indigo-500" />
                <span>Điểm Nghe (0 - 495):</span>
              </label>
              <input
                type="number"
                min={0}
                max={495}
                value={listeningScore}
                onChange={(e) => setListeningScore(Math.min(495, Math.max(0, Number(e.target.value))))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>Điểm Đọc (0 - 495):</span>
              </label>
              <input
                type="number"
                min={0}
                max={495}
                value={readingScore}
                onChange={(e) => setReadingScore(Math.min(495, Math.max(0, Number(e.target.value))))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {skillsType === '4SKILLS' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-teal-500" />
                  <span>Điểm Nói (0 - 200):</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={speakingScore}
                  onChange={(e) => setSpeakingScore(Math.min(200, Math.max(0, Number(e.target.value))))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <FileEdit className="w-3.5 h-3.5 text-teal-500" />
                  <span>Điểm Viết (0 - 200):</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={writingScore}
                  onChange={(e) => setWritingScore(Math.min(200, Math.max(0, Number(e.target.value))))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Tổng điểm TOEIC dự kiến:</span>
            <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
              {calculatedTotal} / {skillsType === '4SKILLS' ? '1390' : '990'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Mục tiêu TOEIC mong muốn đạt được:
            </label>
            <input
              type="number"
              min={0}
              max={990}
              step={5}
              value={targetScore}
              onChange={(e) => setTargetScore(Math.min(990, Math.max(0, Number(e.target.value))))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          {!isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                toast.warning('Vui lòng đăng nhập để cập nhật điểm trình độ của bạn.')
              }}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold hover:shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              Đăng nhập để cập nhật điểm
            </button>
          ) : (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold hover:shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? 'Đang lưu...' : 'Xác nhận cập nhật điểm'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
