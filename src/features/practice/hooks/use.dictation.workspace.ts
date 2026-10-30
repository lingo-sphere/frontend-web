/**
 * @file use.dictation.workspace.ts
 * @description Custom hook quản lý trạng thái playback, ghi nhận đáp án từng ô trống, chấm điểm phân đoạn và tạo kết quả bài luyện nghe chép chính tả
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import {
  calculateAttemptScore,
  type ListeningExercise,
  type ListeningAttempt,
  type TranscriptSegment,
  type Blank,
} from '@/features/practice/types/listening'
import { Analytics } from '@/lib/posthog'
import type {
  CheckedResults,
  CheckedBlankResult,
  UserAnswers,
  HintRevealedCount,
} from '@/features/practice/components/dictation.input.box'

export function formatDuration(seconds?: number): string {
  if (!seconds) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

function getSegmentIndexAtTime(
  time: number,
  segments?: TranscriptSegment[]
): number {
  if (!segments || segments.length === 0) return 0
  const idx = segments.findIndex(
    (s) => time >= s.startTime && time <= s.endTime
  )
  return idx !== -1 ? idx : 0
}

function findHintableBlank(
  blanks: Blank[],
  hintCounts: HintRevealedCount
): Blank | undefined {
  return blanks.find((blank) => {
    const hintCount = hintCounts[blank.id] || 0
    return hintCount < blank.answer.length
  })
}

function getSegmentHintCount(
  blanks: Blank[],
  hintCounts: HintRevealedCount
): number {
  return blanks.reduce((sum, blank) => sum + (hintCounts[blank.id] || 0), 0)
}

function checkBlank(blank: Blank, userAnswer: string): CheckedBlankResult {
  const isCorrect =
    userAnswer.toLowerCase().trim() === blank.answer.toLowerCase().trim()
  return {
    blankId: blank.id,
    userAnswer,
    correctAnswer: blank.answer,
    isCorrect,
  }
}

interface UseDictationWorkspaceProps {
  exercise: ListeningExercise
  existingAttempt: ListeningAttempt | null
  onComplete: (attempt: ListeningAttempt) => void
}

export function useDictationWorkspace({
  exercise,
  existingAttempt,
  onComplete,
}: UseDictationWorkspaceProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(
    existingAttempt?.currentTime || 0
  )
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [autoPause] = useState(true)

  const activeSegmentIndex = useMemo(
    () => getSegmentIndexAtTime(currentTime, exercise.segments),
    [currentTime, exercise.segments]
  )

  const [completedSegments, setCompletedSegments] = useState<Set<string>>(
    () => {
      const result = new Set<string>()
      if (existingAttempt) {
        existingAttempt.segmentAnswers.forEach((segAns) => {
          result.add(segAns.segmentId)
        })
      }
      return result
    }
  )

  const [answers, setAnswers] = useState<UserAnswers>(() => {
    const result: UserAnswers = {}
    if (existingAttempt) {
      existingAttempt.segmentAnswers.forEach((segAns) => {
        segAns.blankResults.forEach((blankRes) => {
          result[blankRes.blankId] = blankRes.userAnswer
        })
      })
    }
    return result
  })

  const [hintRevealedCount, setHintRevealedCount] = useState<HintRevealedCount>(
    () => {
      const result: HintRevealedCount = {}
      if (existingAttempt) {
        existingAttempt.segmentAnswers.forEach((segAns) => {
          segAns.blankResults.forEach((blankRes) => {
            if (blankRes.isHintUsed) {
              result[blankRes.blankId] = 1
            }
          })
        })
      }
      return result
    }
  )

  const [replayCount, setReplayCount] = useState(
    existingAttempt?.totalReplays || 0
  )
  const [totalHintsUsed, setTotalHintsUsed] = useState(
    existingAttempt?.totalHintsUsed || 0
  )
  const [checkedResults, setCheckedResults] = useState<CheckedResults>({})
  const [correctedAnswers, setCorrectedAnswers] = useState<
    Record<string, string>
  >({})

  const segmentStartTimeRef = useRef<number>(Date.now())
  const currentSegment = exercise.segments[activeSegmentIndex]

  const isCurrentSegmentCompleted = currentSegment
    ? completedSegments.has(currentSegment.id)
    : false

  const isBlankFilled = (blank: Blank, userAnswer: string): boolean => {
    return userAnswer.length >= blank.answer.length
  }

  const canSubmitCurrentSegment = currentSegment
    ? currentSegment.blanks.every((blank) => {
        const userAnswer = answers[blank.id] || ''
        return isBlankFilled(blank, userAnswer)
      })
    : false

  const hasViewedCurrentResult = currentSegment
    ? checkedResults[currentSegment.blanks[0]?.id] !== undefined
    : false

  const allSegmentsCompleted =
    completedSegments.size === exercise.segments.length

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.1 * playbackSpeed

        if (autoPause && currentSegment) {
          if (next >= currentSegment.endTime) {
            setIsPlaying(false)
            return currentSegment.endTime
          }
        }

        if (next >= exercise.durationSeconds) {
          setIsPlaying(false)
          return exercise.durationSeconds
        }
        return next
      })
    }, 100)

    return () => clearInterval(interval)
  }, [
    isPlaying,
    playbackSpeed,
    autoPause,
    currentSegment,
    exercise.durationSeconds,
  ])

  useEffect(() => {
    segmentStartTimeRef.current = Date.now()
  }, [activeSegmentIndex, currentSegment?.id])

  const togglePlayback = () => setIsPlaying(!isPlaying)

  const replaySegment = () => {
    if (!currentSegment || isCurrentSegmentCompleted) return
    setReplayCount((prev) => prev + 1)
    setCurrentTime(currentSegment.startTime)
    setIsPlaying(true)
  }

  const replayPreviousSegment = () => {
    if (activeSegmentIndex <= 0) return
    const prevSegment = exercise.segments[activeSegmentIndex - 1]
    setCurrentTime(prevSegment.startTime)
    setIsPlaying(true)
  }

  const handleHint = () => {
    if (!currentSegment || isCurrentSegmentCompleted) return

    const hintableBlank = findHintableBlank(
      currentSegment.blanks,
      hintRevealedCount
    )

    if (hintableBlank) {
      const currentRevealed = hintRevealedCount[hintableBlank.id] || 0
      setHintRevealedCount((prev) => ({
        ...prev,
        [hintableBlank.id]: currentRevealed + 1,
      }))
      setTotalHintsUsed((prev) => prev + 1)
    }
  }

  const handleNext = () => {
    if (!currentSegment) return

    if (!hasViewedCurrentResult) {
      const newCheckedResults: CheckedResults = {}
      currentSegment.blanks.forEach((blank) => {
        const userAnswer = answers[blank.id] || ''
        newCheckedResults[blank.id] = checkBlank(blank, userAnswer)
      })
      setCheckedResults(newCheckedResults)
      return
    }

    const newCorrected: Record<string, string> = {}
    currentSegment.blanks.forEach((blank) => {
      const result = checkedResults[blank.id]
      if (result && !result.isCorrect) {
        newCorrected[blank.id] = result.correctAnswer
      }
    })
    setCorrectedAnswers((prev) => ({ ...prev, ...newCorrected }))

    setCompletedSegments((prev) => {
      const next = new Set(prev)
      next.add(currentSegment.id)
      return next
    })

    if (activeSegmentIndex === exercise.segments.length - 1) {
      const segmentAnswers = exercise.segments.map((seg) => {
        const blankResults = seg.blanks.map((blank) => {
          const userAnswer = answers[blank.id] || ''
          const hintCount = hintRevealedCount[blank.id] || 0
          const result = checkBlank(blank, userAnswer)
          return {
            blankId: blank.id,
            userAnswer,
            isCorrect: result.isCorrect,
            isHintUsed: hintCount > 0,
          }
        })

        return {
          segmentId: seg.id,
          completedAt: new Date().toISOString(),
          blankResults,
          timeSpentSeconds:
            seg.id === currentSegment.id
              ? Math.round((Date.now() - segmentStartTimeRef.current) / 1000)
              : 0,
          replayCount: 0,
        }
      })

      const { totalCorrectBlanks, totalBlanks, accuracy } =
        calculateAttemptScore(segmentAnswers)

      const attempt: ListeningAttempt = {
        id: `attempt-${Date.now()}`,
        exerciseId: exercise.id,
        userId: 'user-001',
        status: 'COMPLETED',
        currentSegmentIndex: activeSegmentIndex,
        currentTime,
        startedAt: existingAttempt?.startedAt || new Date().toISOString(),
        completedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        segmentAnswers,
        totalHintsUsed,
        totalReplays: replayCount,
        totalTimeSeconds: Math.round(
          (Date.now() -
            new Date(existingAttempt?.startedAt || Date.now()).getTime()) /
            1000
        ),
        score: accuracy,
        totalCorrectBlanks,
        totalBlanks,
        accuracy,
      }

      Analytics.dictationCompleted({
        audioId: exercise.id,
        accuracyPercentage: accuracy,
        wordCount: totalBlanks,
        mistakesCount: Math.max(0, totalBlanks - totalCorrectBlanks),
      })

      onComplete(attempt)
    } else {
      const nextSegment = exercise.segments[activeSegmentIndex + 1]
      setCurrentTime(nextSegment.startTime)
      setCheckedResults({})
      if (!autoPause) setIsPlaying(true)
    }
  }

  const goToSegment = (index: number) => {
    if (index < 0 || index >= exercise.segments.length) return
    const segment = exercise.segments[index]

    if (
      index > activeSegmentIndex &&
      !completedSegments.has(exercise.segments[index - 1]?.id || '')
    ) {
      return
    }

    setCurrentTime(segment.startTime)
    setIsPlaying(false)

    if (completedSegments.has(segment.id)) {
      const results: CheckedResults = {}
      segment.blanks.forEach((blank) => {
        const userAnswer = answers[blank.id] || ''
        results[blank.id] = checkBlank(blank, userAnswer)
      })
      setCheckedResults(results)

      const corrected: Record<string, string> = {}
      segment.blanks.forEach((blank) => {
        if (correctedAnswers[blank.id]) {
          corrected[blank.id] = correctedAnswers[blank.id]
        }
      })
      if (Object.keys(corrected).length > 0) {
        setCorrectedAnswers((prev) => ({ ...prev, ...corrected }))
      }
    } else {
      setCheckedResults({})
    }
  }

  const handleAnswerChange = (blankId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [blankId]: value }))
  }

  const currentSegmentHintsUsed = currentSegment
    ? getSegmentHintCount(currentSegment.blanks, hintRevealedCount)
    : 0

  const hasMoreHints = currentSegment
    ? findHintableBlank(currentSegment.blanks, hintRevealedCount) !== undefined
    : false

  return {
    isPlaying,
    currentTime,
    playbackSpeed,
    activeSegmentIndex,
    completedSegments,
    answers,
    hintRevealedCount,
    replayCount,
    totalHintsUsed,
    checkedResults,
    correctedAnswers,
    currentSegment,
    isCurrentSegmentCompleted,
    canSubmitCurrentSegment,
    hasViewedCurrentResult,
    allSegmentsCompleted,
    currentSegmentHintsUsed,
    hasMoreHints,
    setCurrentTime,
    setPlaybackSpeed,
    togglePlayback,
    replaySegment,
    replayPreviousSegment,
    handleHint,
    handleNext,
    goToSegment,
    handleAnswerChange,
  }
}
