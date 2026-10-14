// Modal gợi ý học viên làm bài test hoặc nhập điểm đầu vào theo kỹ năng khóa học.
'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import {
  Sparkles,
  ArrowRight,
  Headphones,
  Mic,
  FileEdit,
  X,
  ShieldAlert,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Award,
  Loader2,
} from 'lucide-react'
import { userService } from '@/features/user/services/user.service'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { toast } from '@/store/toast.store'

interface CoursePlacementPromptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProceedPurchase: () => void
  courseTitle?: string
  courseCategory?: string
  courseSkills?: string[]
  courseTargetScore?: number
}

export function CoursePlacementPromptModal({
  open,
  onOpenChange,
  onProceedPurchase,
  courseTitle,
  courseCategory,
  courseSkills,
  courseTargetScore,
}: CoursePlacementPromptModalProps) {
  const router = useRouter()
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const [showManualInput, setShowManualInput] = useState(false)
  const [listeningScore, setListeningScore] = useState<number>(300)
  const [readingScore, setReadingScore] = useState<number>(300)
  const [speakingScore, setSpeakingScore] = useState<number>(120)
  const [writingScore, setWritingScore] = useState<number>(120)
  const [isSavingScore, setIsSavingScore] = useState(false)

  const is4SkillsCourse = useMemo(() => {
    if (courseCategory === 'TOEIC_4_SKILLS') return true
    if (courseCategory === 'TOEIC_2_SKILLS') return false
    return Boolean(
      courseSkills &&
        (courseSkills.includes('SPEAKING') || courseSkills.includes('WRITING'))
    )
  }, [courseCategory, courseSkills])

  const calculatedTotal = useMemo(() => {
    if (is4SkillsCourse) {
      return listeningScore + readingScore + speakingScore + writingScore
    }
    return listeningScore + readingScore
  }, [is4SkillsCourse, listeningScore, readingScore, speakingScore, writingScore])

  const skillBadgeText = is4SkillsCourse
    ? isVietnamese
      ? 'Khóa học 4 Kỹ Năng (Nghe - Nói - Đọc - Viết)'
      : '4 Skills Course (Listening - Speaking - Reading - Writing)'
    : isVietnamese
      ? 'Khóa học 2 Kỹ Năng (Nghe - Đọc)'
      : '2 Skills Course (Listening - Reading)'

  const handleGoToPlacementTest = (type: '2skills' | '4skills') => {
    onOpenChange(false)
    if (type === '2skills') {
      router.push('/toeic/exam/exam_placement_2skills_lr')
    } else {
      router.push('/toeic/exam/exam_placement_4skills_full')
    }
  }

  const handleSaveManualScore = useCallback(async () => {
    if (listeningScore < 0 || listeningScore > 495) {
      toast.error(
        isVietnamese
          ? 'Điểm Nghe (Listening) phải từ 0 đến 495.'
          : 'Listening score must be between 0 and 495.'
      )
      return
    }
    if (readingScore < 0 || readingScore > 495) {
      toast.error(
        isVietnamese
          ? 'Điểm Đọc (Reading) phải từ 0 đến 495.'
          : 'Reading score must be between 0 and 495.'
      )
      return
    }
    if (is4SkillsCourse) {
      if (speakingScore < 0 || speakingScore > 200) {
        toast.error(
          isVietnamese
            ? 'Điểm Nói (Speaking) phải từ 0 đến 200.'
            : 'Speaking score must be between 0 and 200.'
        )
        return
      }
      if (writingScore < 0 || writingScore > 200) {
        toast.error(
          isVietnamese
            ? 'Điểm Viết (Writing) phải từ 0 đến 200.'
            : 'Writing score must be between 0 and 200.'
        )
        return
      }
    }

    const { isAuthenticated: authCheck, user, setUser } = useAuthStore.getState()
    if (!authCheck) {
      toast.warning(
        isVietnamese
          ? 'Vui lòng đăng nhập để lưu điểm đầu vào vào tài khoản của bạn.'
          : 'Please log in to save your placement score to your account.'
      )
      return
    }

    setIsSavingScore(true)
    try {
      const skillsType = is4SkillsCourse ? '4SKILLS' : '2SKILLS'
      const payload = {
        placement_test_score: calculatedTotal,
        placement_listening_score: listeningScore,
        placement_reading_score: readingScore,
        placement_speaking_score: is4SkillsCourse ? speakingScore : undefined,
        placement_writing_score: is4SkillsCourse ? writingScore : undefined,
        placement_skills_type: skillsType,
        target_toeic_score:
          courseTargetScore && courseTargetScore > 0 ? courseTargetScore : undefined,
        current_estimated_score: calculatedTotal,
        is_score_manually_edited: true,
        placement_tested_at: new Date().toISOString(),
      }

      await userService.updateProfile(payload)
      if (user) {
        setUser({
          ...user,
          ...payload,
        })
      }

      toast.success(
        isVietnamese
          ? 'Đã lưu điểm đầu vào thành công!'
          : 'Placement score saved successfully!'
      )

      onOpenChange(false)
      onProceedPurchase()
    } catch {
      toast.error(
        isVietnamese
          ? 'Không thể lưu điểm đầu vào, vui lòng thử lại.'
          : 'Could not save placement score, please try again.'
      )
    } finally {
      setIsSavingScore(false)
    }
  }, [
    listeningScore,
    readingScore,
    speakingScore,
    writingScore,
    is4SkillsCourse,
    calculatedTotal,
    courseTargetScore,
    onOpenChange,
    onProceedPurchase,
    isVietnamese,
  ])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150 relative overflow-hidden my-8"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  {isVietnamese
                    ? 'Gợi Ý Đánh Giá Năng Lực Đầu Vào'
                    : 'Placement Test Recommendation'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {skillBadgeText}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isVietnamese
                  ? 'Đảm bảo nội dung khóa học sát với trình độ thực tế của bạn'
                  : 'Ensure course content matches your real proficiency level'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            <p className="font-semibold">
              {isVietnamese
                ? 'Bạn chưa có điểm số hoặc kết quả kiểm tra năng lực đầu vào trong hệ thống.'
                : 'You do not have a placement test score recorded in the system yet.'}
            </p>
            <p className="text-amber-800 dark:text-amber-300">
              {isVietnamese ? (
                <>
                  Để bài học trong khóa{' '}
                  {courseTitle ? (
                    <strong className="font-bold text-amber-950 dark:text-amber-100">
                      &ldquo;{courseTitle}&rdquo;
                    </strong>
                  ) : (
                    'này'
                  )}{' '}
                  được cá nhân hóa chính xác và phát huy tối đa hiệu quả, bạn nên{' '}
                  <strong>thi bài test đầu vào</strong> hoặc <strong>nhập điểm thi hiện tại</strong> trước khi mua.
                </>
              ) : (
                <>
                  To ensure lessons in{' '}
                  {courseTitle ? (
                    <strong className="font-bold text-amber-950 dark:text-amber-100">
                      &ldquo;{courseTitle}&rdquo;
                    </strong>
                  ) : (
                    'this course'
                  )}{' '}
                  are accurately tailored to your needs, you should{' '}
                  <strong>take a placement test</strong> or <strong>enter your current score</strong> before purchasing.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100 px-0.5">
              <span>
                {isVietnamese
                  ? 'Lựa chọn bài kiểm tra năng lực phù hợp:'
                  : 'Select suitable placement test:'}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {isVietnamese ? 'Miễn phí 100%' : '100% Free'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {is4SkillsCourse ? (
                <>
                  <div className="p-4 rounded-2xl border-2 border-indigo-500 bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/70 dark:from-slate-800/90 dark:via-slate-900 dark:to-indigo-950/60 shadow-md shadow-indigo-500/10 space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                          {isVietnamese ? 'Khuyên Dùng Cho Khóa Này' : 'Recommended For This Course'}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {isVietnamese ? 'Bài Test Toàn Diện 4 Kỹ Năng' : 'Comprehensive 4-Skills Test'}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                        {isVietnamese ? '90 Phút' : '90 Mins'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {isVietnamese
                        ? 'Khóa học bạn chọn có rèn luyện Speaking và Writing. Bài kiểm tra này giúp đánh giá toàn diện cả 4 kỹ năng Nghe, Đọc, Nói, Viết để giảng viên và AI đưa ra hướng dẫn sát nhất.'
                        : 'This course trains Speaking and Writing. This test evaluates all 4 skills so instructors and AI can provide optimal guidance.'}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleGoToPlacementTest('4skills')}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                    >
                      <Mic className="w-4 h-4" />
                      <span>
                        {isVietnamese
                          ? 'Bắt Đầu Thi Test 4 Kỹ Năng Ngay'
                          : 'Start 4-Skills Test Now'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <Headphones className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {isVietnamese
                            ? 'Chỉ muốn kiểm tra Nghe & Đọc (2 Kỹ năng)?'
                            : 'Only test Listening & Reading (2 Skills)?'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {isVietnamese
                          ? 'Bài test Listening & Reading chuẩn format (60 phút)'
                          : 'Standard Listening & Reading test format (60 mins)'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleGoToPlacementTest('2skills')}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer whitespace-nowrap"
                    >
                      {isVietnamese ? 'Thi Test 2 Kỹ Năng' : 'Take 2-Skills Test'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-2xl border-2 border-indigo-500 bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/70 dark:from-slate-800/90 dark:via-slate-900 dark:to-indigo-950/60 shadow-md shadow-indigo-500/10 space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                          {isVietnamese ? 'Khuyên Dùng Cho Khóa Này' : 'Recommended For This Course'}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {isVietnamese
                            ? 'Bài Test Chuẩn 2 Kỹ Năng (Nghe - Đọc)'
                            : 'Standard 2-Skills Test (Listening - Reading)'}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                        {isVietnamese ? '60 Phút' : '60 Mins'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {isVietnamese
                        ? 'Khóa học bạn chọn tập trung vào TOEIC Listening & Reading. Bài kiểm tra đầu vào 2 kỹ năng sẽ phân loại chính xác trình độ và xác định các điểm ngữ pháp/từ vựng bạn cần bổ sung.'
                        : 'This course focuses on TOEIC Listening & Reading. This 2-skills test will accurately categorize your level and identify areas needing improvement.'}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleGoToPlacementTest('2skills')}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                    >
                      <Headphones className="w-4 h-4" />
                      <span>
                        {isVietnamese
                          ? 'Bắt Đầu Thi Test 2 Kỹ Năng Ngay'
                          : 'Start 2-Skills Test Now'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <Mic className="w-3.5 h-3.5 text-teal-500" />
                        <span>
                          {isVietnamese
                            ? 'Bạn muốn kiểm tra trọn gói cả Nói & Viết?'
                            : 'Want to test full package including Speaking & Writing?'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {isVietnamese
                          ? 'Bài test toàn diện 4 kỹ năng (90 phút)'
                          : 'Comprehensive 4-skills test (90 mins)'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleGoToPlacementTest('4skills')}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-teal-500 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer whitespace-nowrap"
                    >
                      {isVietnamese ? 'Thi Test 4 Kỹ Năng' : 'Take 4-Skills Test'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-850/40 transition-all">
            <button
              type="button"
              onClick={() => setShowManualInput((prev) => !prev)}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                  <FileEdit className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isVietnamese
                      ? 'Bạn đã có chứng chỉ hoặc điểm thi trước đó?'
                      : 'Already have a certificate or prior test score?'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isVietnamese
                      ? 'Nhập điểm ngay tại đây để lưu vào hồ sơ và tiếp tục mua khóa học'
                      : 'Enter score here to save to your profile and proceed with purchase'}
                  </div>
                </div>
              </div>
              <div className="text-slate-400">
                {showManualInput ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showManualInput && (
              <div className="p-4 pt-1 border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 space-y-3.5 animate-in fade-in duration-200">
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {isVietnamese
                        ? 'Điểm Nghe (Listening) (0 - 495)'
                        : 'Listening Score (0 - 495)'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={495}
                      value={listeningScore}
                      onChange={(e) => setListeningScore(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {isVietnamese
                        ? 'Điểm Đọc (Reading) (0 - 495)'
                        : 'Reading Score (0 - 495)'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={495}
                      value={readingScore}
                      onChange={(e) => setReadingScore(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-indigo-500"
                    />
                  </div>

                  {is4SkillsCourse && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {isVietnamese
                            ? 'Điểm Nói (Speaking) (0 - 200)'
                            : 'Speaking Score (0 - 200)'}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={200}
                          value={speakingScore}
                          onChange={(e) => setSpeakingScore(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {isVietnamese
                            ? 'Điểm Viết (Writing) (0 - 200)'
                            : 'Writing Score (0 - 200)'}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={200}
                          value={writingScore}
                          onChange={(e) => setWritingScore(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-indigo-500"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>{isVietnamese ? 'Tổng điểm ước tính:' : 'Estimated Total Score:'}</span>
                  </div>
                  <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                    {calculatedTotal} / {is4SkillsCourse ? '1390' : '990'}
                  </span>
                </div>

                {!isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      toast.warning(
                        isVietnamese
                          ? 'Vui lòng đăng nhập để lưu điểm đầu vào vào tài khoản của bạn.'
                          : 'Please log in to save your placement score to your account.'
                      )
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isVietnamese
                        ? 'Đăng nhập để lưu điểm đầu vào'
                        : 'Log in to save placement score'}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveManualScore}
                    disabled={isSavingScore}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSavingScore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{isVietnamese ? 'Đang lưu điểm...' : 'Saving score...'}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {isVietnamese
                            ? 'Lưu Điểm Đầu Vào & Tiếp Tục Mua Khóa Học'
                            : 'Save Placement Score & Continue Purchase'}
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors cursor-pointer"
          >
            {isVietnamese ? 'Đóng hộp thoại' : 'Close dialog'}
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenChange(false)
              onProceedPurchase()
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{isVietnamese ? 'Bỏ qua cảnh báo & Tiếp tục mua' : 'Skip warning & Proceed to purchase'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
