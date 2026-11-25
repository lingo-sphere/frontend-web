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
  const storedUser = useAuthStore((state) => state.user)

  const [skillsType, setSkillsType] = useState<'2SKILLS' | '4SKILLS'>(
    currentScores.skillsType === '4SKILLS' ? '4SKILLS' : '2SKILLS'
  )

  const [listening2K, setListening2K] = useState<number>(() => {
    if (typeof currentScores.placement_2skills_listening_score === 'number') {
      return currentScores.placement_2skills_listening_score
    }
    if (typeof storedUser?.placement_2skills_listening_score === 'number') {
      return storedUser.placement_2skills_listening_score
    }
    if (currentScores.skillsType !== '4SKILLS' && typeof currentScores.listeningScore === 'number') {
      return currentScores.listeningScore
    }
    return 0
  })

  const [reading2K, setReading2K] = useState<number>(() => {
    if (typeof currentScores.placement_2skills_reading_score === 'number') {
      return currentScores.placement_2skills_reading_score
    }
    if (typeof storedUser?.placement_2skills_reading_score === 'number') {
      return storedUser.placement_2skills_reading_score
    }
    if (currentScores.skillsType !== '4SKILLS' && typeof currentScores.readingScore === 'number') {
      return currentScores.readingScore
    }
    return 0
  })

  const initialTotal2K = listening2K + reading2K

  const [target2K, setTarget2K] = useState<number>(() => {
    const existing =
      typeof currentScores.target_toeic_2skills_score === 'number' && currentScores.target_toeic_2skills_score > 0
        ? currentScores.target_toeic_2skills_score
        : typeof storedUser?.target_toeic_2skills_score === 'number' && storedUser.target_toeic_2skills_score > 0
        ? storedUser.target_toeic_2skills_score
        : currentScores.skillsType !== '4SKILLS' && typeof currentScores.targetScore === 'number' && currentScores.targetScore > 0 && currentScores.targetScore <= 990
        ? currentScores.targetScore
        : typeof storedUser?.target_toeic_score === 'number' && storedUser.target_toeic_score > 0 && storedUser.target_toeic_score <= 990
        ? storedUser.target_toeic_score
        : 0

    if (existing > initialTotal2K && existing <= 990) return existing
    return Math.min(990, Math.max(450, initialTotal2K > 0 ? Math.ceil((initialTotal2K + 50) / 10) * 10 : 450))
  })

  const [listening4K, setListening4K] = useState<number>(() => {
    if (typeof currentScores.placement_4skills_listening_score === 'number') {
      return currentScores.placement_4skills_listening_score
    }
    if (typeof storedUser?.placement_4skills_listening_score === 'number') {
      return storedUser.placement_4skills_listening_score
    }
    if (currentScores.skillsType === '4SKILLS' && typeof currentScores.listeningScore === 'number') {
      return currentScores.listeningScore
    }
    return 0
  })

  const [reading4K, setReading4K] = useState<number>(() => {
    if (typeof currentScores.placement_4skills_reading_score === 'number') {
      return currentScores.placement_4skills_reading_score
    }
    if (typeof storedUser?.placement_4skills_reading_score === 'number') {
      return storedUser.placement_4skills_reading_score
    }
    if (currentScores.skillsType === '4SKILLS' && typeof currentScores.readingScore === 'number') {
      return currentScores.readingScore
    }
    return 0
  })

  const [speaking4K, setSpeaking4K] = useState<number>(() => {
    if (typeof currentScores.placement_4skills_speaking_score === 'number') {
      return currentScores.placement_4skills_speaking_score
    }
    if (typeof storedUser?.placement_4skills_speaking_score === 'number') {
      return storedUser.placement_4skills_speaking_score
    }
    if (typeof currentScores.speakingScore === 'number') {
      return currentScores.speakingScore
    }
    return 0
  })

  const [writing4K, setWriting4K] = useState<number>(() => {
    if (typeof currentScores.placement_4skills_writing_score === 'number') {
      return currentScores.placement_4skills_writing_score
    }
    if (typeof storedUser?.placement_4skills_writing_score === 'number') {
      return storedUser.placement_4skills_writing_score
    }
    if (typeof currentScores.writingScore === 'number') {
      return currentScores.writingScore
    }
    return 0
  })

  const initialTotal4K = listening4K + reading4K + speaking4K + writing4K

  const [target4K, setTarget4K] = useState<number>(() => {
    const existing =
      typeof currentScores.target_toeic_4skills_score === 'number' && currentScores.target_toeic_4skills_score > 0
        ? currentScores.target_toeic_4skills_score
        : typeof storedUser?.target_toeic_4skills_score === 'number' && storedUser.target_toeic_4skills_score > 0
        ? storedUser.target_toeic_4skills_score
        : currentScores.skillsType === '4SKILLS' && typeof currentScores.targetScore === 'number' && currentScores.targetScore > 0
        ? currentScores.targetScore
        : typeof storedUser?.target_toeic_score === 'number' && storedUser.target_toeic_score > 0
        ? storedUser.target_toeic_score
        : 0

    if (existing > initialTotal4K && existing <= 1390) return existing
    return Math.min(1390, Math.max(650, initialTotal4K > 0 ? Math.ceil((initialTotal4K + 50) / 10) * 10 : 650))
  })

  const [isSaving, setIsSaving] = useState<boolean>(false)

  if (!open) return null

  const is4Skills = skillsType === '4SKILLS'
  const maxPossibleScore = is4Skills ? 1390 : 990
  const calculatedTotal = is4Skills
    ? listening4K + reading4K + speaking4K + writing4K
    : listening2K + reading2K

  const currentTargetScore = is4Skills ? target4K : target2K
  const isTargetInvalid = calculatedTotal < maxPossibleScore && currentTargetScore <= calculatedTotal

  const handleListening2KChange = (val: number) => {
    const clamped = Math.min(495, Math.max(0, val))
    setListening2K(clamped)
    const newTotal = clamped + reading2K
    if (target2K <= newTotal && newTotal < 990) {
      setTarget2K(Math.min(990, Math.max(newTotal + 10, Math.ceil((newTotal + 50) / 10) * 10)))
    }
  }

  const handleReading2KChange = (val: number) => {
    const clamped = Math.min(495, Math.max(0, val))
    setReading2K(clamped)
    const newTotal = listening2K + clamped
    if (target2K <= newTotal && newTotal < 990) {
      setTarget2K(Math.min(990, Math.max(newTotal + 10, Math.ceil((newTotal + 50) / 10) * 10)))
    }
  }

  const handleListening4KChange = (val: number) => {
    const clamped = Math.min(495, Math.max(0, val))
    setListening4K(clamped)
    const newTotal = clamped + reading4K + speaking4K + writing4K
    if (target4K <= newTotal && newTotal < 1390) {
      setTarget4K(Math.min(1390, Math.max(newTotal + 10, Math.ceil((newTotal + 50) / 10) * 10)))
    }
  }

  const handleReading4KChange = (val: number) => {
    const clamped = Math.min(495, Math.max(0, val))
    setReading4K(clamped)
    const newTotal = listening4K + clamped + speaking4K + writing4K
    if (target4K <= newTotal && newTotal < 1390) {
      setTarget4K(Math.min(1390, Math.max(newTotal + 10, Math.ceil((newTotal + 50) / 10) * 10)))
    }
  }

  const handleSpeaking4KChange = (val: number) => {
    const clamped = Math.min(200, Math.max(0, val))
    setSpeaking4K(clamped)
    const newTotal = listening4K + reading4K + clamped + writing4K
    if (target4K <= newTotal && newTotal < 1390) {
      setTarget4K(Math.min(1390, Math.max(newTotal + 10, Math.ceil((newTotal + 50) / 10) * 10)))
    }
  }

  const handleWriting4KChange = (val: number) => {
    const clamped = Math.min(200, Math.max(0, val))
    setWriting4K(clamped)
    const newTotal = listening4K + reading4K + speaking4K + clamped
    if (target4K <= newTotal && newTotal < 1390) {
      setTarget4K(Math.min(1390, Math.max(newTotal + 10, Math.ceil((newTotal + 50) / 10) * 10)))
    }
  }

  const handleSkillsTypeChange = (newType: '2SKILLS' | '4SKILLS') => {
    setSkillsType(newType)
  }

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để cập nhật điểm trình độ của bạn.')
      return
    }

    if (is4Skills) {
      if (listening4K < 0 || listening4K > 495) {
        toast.error('Điểm Nghe (Listening) phải từ 0 đến 495.')
        return
      }
      if (reading4K < 0 || reading4K > 495) {
        toast.error('Điểm Đọc (Reading) phải từ 0 đến 495.')
        return
      }
      if (speaking4K < 0 || speaking4K > 200) {
        toast.error('Điểm Nói (Speaking) phải từ 0 đến 200.')
        return
      }
      if (writing4K < 0 || writing4K > 200) {
        toast.error('Điểm Viết (Writing) phải từ 0 đến 200.')
        return
      }
      if (calculatedTotal < 1390 && target4K <= calculatedTotal) {
        toast.error(`Điểm mục tiêu (${target4K}đ) phải lớn hơn tổng điểm hiện tại (${calculatedTotal}đ).`)
        return
      }
      if (target4K > 1390) {
        toast.error('Điểm mục tiêu không được vượt quá tối đa 1390đ.')
        return
      }
    } else {
      if (listening2K < 0 || listening2K > 495) {
        toast.error('Điểm Nghe (Listening) phải từ 0 đến 495.')
        return
      }
      if (reading2K < 0 || reading2K > 495) {
        toast.error('Điểm Đọc (Reading) phải từ 0 đến 495.')
        return
      }
      if (calculatedTotal < 990 && target2K <= calculatedTotal) {
        toast.error(`Điểm mục tiêu (${target2K}đ) phải lớn hơn tổng điểm hiện tại (${calculatedTotal}đ).`)
        return
      }
      if (target2K > 990) {
        toast.error('Điểm mục tiêu không được vượt quá tối đa 990đ.')
        return
      }
    }

    setIsSaving(true)
    try {
      const total2K = listening2K + reading2K
      const total4K = listening4K + reading4K + speaking4K + writing4K

      const activeTotal = is4Skills ? total4K : total2K
      const activeTarget = is4Skills ? target4K : target2K
      const activeListening = is4Skills ? listening4K : listening2K
      const activeReading = is4Skills ? reading4K : reading2K
      const activeSpeaking = is4Skills ? speaking4K : undefined
      const activeWriting = is4Skills ? writing4K : undefined

      const payload = {
        placement_test_score: activeTotal,
        placement_listening_score: activeListening,
        placement_reading_score: activeReading,
        placement_speaking_score: activeSpeaking,
        placement_writing_score: activeWriting,
        placement_skills_type: skillsType,
        target_toeic_score: activeTarget > 0 ? activeTarget : undefined,
        current_estimated_score: activeTotal,
        is_score_manually_edited: true,
        placement_tested_at: new Date().toISOString(),
        placement_2skills_test_score: total2K,
        placement_2skills_listening_score: listening2K,
        placement_2skills_reading_score: reading2K,
        target_toeic_2skills_score: target2K > 0 ? target2K : undefined,
        placement_4skills_test_score: total4K,
        placement_4skills_listening_score: listening4K,
        placement_4skills_reading_score: reading4K,
        placement_4skills_speaking_score: speaking4K,
        placement_4skills_writing_score: writing4K,
        target_toeic_4skills_score: target4K > 0 ? target4K : undefined,
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
            Hệ thống khuyên bạn nên làm bài kiểm tra đầu vào trên hệ thống để đo lường chính xác nhất. TOEIC 2 kỹ năng và TOEIC 4 kỹ năng là 2 thang đánh giá riêng biệt. Điểm số giữa 2 hình thức thi này hoàn toàn độc lập và không dùng chung điểm Nghe & Đọc của nhau.
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
                onClick={() => handleSkillsTypeChange('2SKILLS')}
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
                onClick={() => handleSkillsTypeChange('4SKILLS')}
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

          {!is4Skills ? (
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
                  value={listening2K}
                  onChange={(e) => handleListening2KChange(Number(e.target.value))}
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
                  value={reading2K}
                  onChange={(e) => handleReading2KChange(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5 text-teal-500" />
                    <span>Điểm Nghe 4KN (0 - 495):</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={495}
                    value={listening4K}
                    onChange={(e) => handleListening4KChange(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-teal-500" />
                    <span>Điểm Đọc 4KN (0 - 495):</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={495}
                    value={reading4K}
                    onChange={(e) => handleReading4KChange(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-teal-500" />
                    <span>Điểm Nói (0 - 200):</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={200}
                    value={speaking4K}
                    onChange={(e) => handleSpeaking4KChange(Number(e.target.value))}
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
                    value={writing4K}
                    onChange={(e) => handleWriting4KChange(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Tổng điểm TOEIC dự kiến ({is4Skills ? '4 Kỹ Năng' : '2 Kỹ Năng'}):
            </span>
            <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
              {calculatedTotal} / {maxPossibleScore}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Mục tiêu TOEIC mong muốn đạt được:
              </label>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Tối đa: {maxPossibleScore}đ
              </span>
            </div>
            <input
              type="number"
              min={Math.min(maxPossibleScore, calculatedTotal + 5)}
              max={maxPossibleScore}
              step={5}
              value={currentTargetScore}
              onChange={(e) => {
                const val = Math.min(maxPossibleScore, Math.max(0, Number(e.target.value)))
                if (is4Skills) {
                  setTarget4K(val)
                } else {
                  setTarget2K(val)
                }
              }}
              className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 transition-all ${
                isTargetInvalid
                  ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500/20 text-rose-600 dark:text-rose-400'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20'
              }`}
            />
            {isTargetInvalid ? (
              <p className="text-[11px] font-bold text-rose-500 mt-1">
                Lưu ý: Điểm mục tiêu phải lớn hơn tổng điểm hiện tại ({calculatedTotal}đ). Gợi ý: {Math.min(maxPossibleScore, Math.max(calculatedTotal + 10, Math.ceil((calculatedTotal + 50) / 10) * 10))}đ
              </p>
            ) : (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Mục tiêu cần cao hơn tổng điểm hiện tại ({calculatedTotal}đ) để hệ thống xây dựng lộ trình cải thiện.
              </p>
            )}
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
              disabled={isSaving || isTargetInvalid}
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? 'Đang lưu...' : 'Xác nhận cập nhật điểm'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
