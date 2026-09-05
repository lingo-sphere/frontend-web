/**
 * @file use.course.tests.ts
 * @description Custom hook quản lý trạng thái mở modal kiểm tra (Challenge, Post-Mini, Final Test) và cập nhật tiến độ điểm thi
 */

import { useState, useMemo, type Dispatch, type SetStateAction } from 'react'
import { toast } from '@/store/toast-store'
import type { Course, Chapter } from '@/types/course'

interface ActiveTestModalState {
  isOpen: boolean
  chapter: Chapter | null
  testType: 'challenge' | 'exercise' | 'post-mini' | 'final-test'
}

interface UseCourseTestsParams {
  isEnrolled: boolean
  progressDetail: any
  setProgressDetail: Dispatch<SetStateAction<any>>
  setCourse: Dispatch<SetStateAction<Course | null>>
}

export function useCourseTests({
  isEnrolled,
  progressDetail,
  setProgressDetail,
  setCourse,
}: UseCourseTestsParams) {
  const [activeTestModal, setActiveTestModal] = useState<ActiveTestModalState>({
    isOpen: false,
    chapter: null,
    testType: 'challenge',
  })

  const handleTakeTest = (
    chapter: Chapter | null,
    testType: 'challenge' | 'exercise' | 'post-mini' | 'final-test'
  ) => {
    if (!isEnrolled) {
      toast.warning(
        'Vui lòng mua khóa học hoặc nâng cấp gói thành viên để làm bài kiểm tra và đề thi này!',
        'Yêu cầu mở khóa'
      )
      return
    }
    setActiveTestModal({
      isOpen: true,
      chapter,
      testType,
    })
  }

  const handleTestComplete = async (score: number, isPassed: boolean) => {
    if (activeTestModal.testType === 'final-test') {
      setProgressDetail((prev: any) => {
        const currentFinalAttempts = Array.isArray(prev?.course_progress?.final_test_attempts)
          ? [...prev.course_progress.final_test_attempts]
          : []
        const newAttempt = {
          attempt_id: `att_${Date.now()}`,
          score,
          is_passed: isPassed,
          submitted_at: new Date(),
        }
        return {
          ...(prev || {}),
          course_progress: {
            ...(prev?.course_progress || {}),
            final_test_score: Math.max(prev?.course_progress?.final_test_score || 0, score),
            final_test_attempts: [newAttempt, ...currentFinalAttempts],
          },
        }
      })
    }

    if (activeTestModal.chapter) {
      const finishedChId = activeTestModal.chapter.id
      const finishedChOrder = Number(activeTestModal.chapter.order || 1)
      setProgressDetail((prev: any) => {
        const existingMods = Array.isArray(prev?.modules_progress) ? [...prev.modules_progress] : []
        const modIdx = existingMods.findIndex(
          (m: any) =>
            m.module_id === finishedChId ||
            String(m.module_id) === String(finishedChId) ||
            Number(m.order_index) === finishedChOrder
        )
        const prevMod = modIdx >= 0 ? existingMods[modIdx] : null
        const currentAttempts = Array.isArray(prevMod?.attempts) ? [...prevMod.attempts] : []
        const newAttempt = {
          attempt_id: `att_${Date.now()}`,
          test_type: activeTestModal.testType,
          score,
          is_passed: isPassed,
          submitted_at: new Date(),
        }
        const updatedMod = {
          module_id: finishedChId,
          order_index: finishedChOrder,
          status: isPassed ? 'COMPLETED' : prevMod?.status || 'IN_PROGRESS',
          attempts: [newAttempt, ...currentAttempts],
          challenge_score: Math.max(prevMod?.challenge_score || 0, score),
          is_passed_by_challenge: isPassed || Boolean(prevMod?.is_passed_by_challenge),
          challenge_taken: true,
        }
        if (modIdx >= 0) {
          existingMods[modIdx] = { ...existingMods[modIdx], ...updatedMod }
        } else {
          existingMods.push(updatedMod)
        }

        if (isPassed) {
          const nextOrder = finishedChOrder + 1
          const nextModIdx = existingMods.findIndex((m: any) => Number(m.order_index) === nextOrder)
          if (nextModIdx >= 0) {
            existingMods[nextModIdx] = {
              ...existingMods[nextModIdx],
              status: 'IN_PROGRESS',
            }
          }
        }

        return {
          ...(prev || {}),
          modules_progress: existingMods,
        }
      })
      setCourse((prev) => {
        if (!prev) return null
        const nextChapters = prev.chapters.map((ch) =>
          ch.id === finishedChId || String(ch.id) === String(finishedChId) || Number(ch.order) === finishedChOrder
            ? { ...ch, status: (isPassed ? 'completed' : ch.status || 'in-progress') as Chapter['status'] }
            : ch
        )
        return { ...prev, chapters: nextChapters }
      })
    }
  }

  const currentTestModalData = useMemo(() => {
    if (activeTestModal.testType === 'final-test') {
      const finalAttempts = progressDetail?.course_progress?.final_test_attempts || []
      const finalBest = progressDetail?.course_progress?.final_test_score || 0
      return {
        attempts: finalAttempts,
        highestScore: finalBest,
      }
    }
    if (activeTestModal.chapter) {
      const mod = progressDetail?.modules_progress?.find(
        (m: any) =>
          m.module_id === activeTestModal.chapter?.id ||
          String(m.module_id) === String(activeTestModal.chapter?.id) ||
          Number(m.order_index) === Number(activeTestModal.chapter?.order)
      )
      const attempts = mod?.attempts || []
      const highestScore = mod?.challenge_score ?? mod?.post_mini_score ?? 0
      return {
        attempts,
        highestScore,
      }
    }
    return { attempts: [], highestScore: 0 }
  }, [activeTestModal, progressDetail])

  return {
    activeTestModal,
    setActiveTestModal,
    handleTakeTest,
    handleTestComplete,
    currentTestModalData,
  }
}
