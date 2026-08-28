import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/icons/icon-map'
import {
  getSegmentIndexAtTime,
  formatDuration,
} from '@/data/listening-data'
import {
  calculateAttemptScore,
  type ListeningExercise,
  type ListeningAttempt,
  type TranscriptSegment,
  type Blank,
} from '@/types/listening'

interface UserAnswers {
  [blankId: string]: string
}

interface HintRevealedCount {
  [blankId: string]: number
}

interface CheckedBlankResult {
  blankId: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
}

interface CheckedResults {
  [blankId: string]: CheckedBlankResult
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
    userAnswer: userAnswer,
    correctAnswer: blank.answer,
    isCorrect,
  }
}

interface VideoDictationViewProps {
  exercise: ListeningExercise
  existingAttempt: ListeningAttempt | null
  onBack: () => void
  onComplete: (attempt: ListeningAttempt) => void
}

export function VideoDictationView({
  exercise,
  existingAttempt,
  onBack,
  onComplete,
}: VideoDictationViewProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

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
  const segmentRefs = useRef<Record<string, HTMLDivElement | null>>({})

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
    const segmentEl = segmentRefs.current[currentSegment?.id || '']
    if (segmentEl) {
      segmentEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
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

  const renderBlank = (blank: Blank, segmentId: string) => {
    const userAnswer = answers[blank.id] || ''
    const hintCount = hintRevealedCount[blank.id] || 0
    const checkedResult = checkedResults[blank.id]
    const isChecked = !!checkedResult
    const isCorrect = checkedResult?.isCorrect
    const isSegmentCompleted = completedSegments.has(segmentId)
    const hasCorrectedAnswer = !!correctedAnswers[blank.id]

    const answerLength = blank.answer.length
    const userInputLength = userAnswer.length
    const totalShown = Math.max(userInputLength, hintCount)
    const remainingStars = Math.max(0, answerLength - totalShown)

    const hintPrefix = blank.answer.slice(0, hintCount)
    const userTypedPart = userAnswer.slice(hintCount)
    let displayText = hintPrefix + userTypedPart
    if (remainingStars > 0 && !isChecked && !isSegmentCompleted) {
      displayText += '*'.repeat(remainingStars)
    }

    let finalText = displayText
    let textColor = 'text-text-tertiary'
    let hasLineThrough = false

    if (isSegmentCompleted) {
      if (isCorrect) {
        textColor = 'text-success'
      } else if (hasCorrectedAnswer) {
        finalText = correctedAnswers[blank.id]
        textColor = 'text-warning font-medium'
      }
    } else if (isChecked) {
      if (isCorrect) {
        textColor = 'text-success'
      } else {
        textColor = 'text-error'
        hasLineThrough = true
      }
    } else if (userInputLength > hintCount) {
      textColor = 'text-primary'
    } else if (hintCount > 0) {
      textColor = 'text-warning'
    }

    return (
      <span
        key={blank.id}
        className="relative inline-block mx-0.5"
        onClick={() => {
          if (!isSegmentCompleted && !isChecked) {
            const input = document.getElementById(
              `blank-input-${blank.id}`
            ) as HTMLInputElement
            if (input) input.focus()
          }
        }}
      >
        <span
          className={`
            inline-flex items-center justify-center min-w-[40px] max-w-[200px] h-8 px-2 text-center
            transition-all
            ${hasLineThrough ? 'line-through decoration-2' : ''}
            ${textColor}
          `}
        >
          {finalText}
        </span>

        <input
          id={`blank-input-${blank.id}`}
          type="text"
          maxLength={answerLength}
          disabled={isSegmentCompleted}
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
          value={userAnswer}
          onChange={(e) => {
            if (isSegmentCompleted) return
            const newValue = e.target.value
            const hintPart = blank.answer.slice(0, hintCount)
            if (newValue.length < hintCount) {
              setAnswers((prev) => ({ ...prev, [blank.id]: hintPart }))
            } else {
              const userTyped = newValue.slice(hintCount)
              setAnswers((prev) => ({
                ...prev,
                [blank.id]: hintPart + userTyped,
              }))
            }
          }}
          onKeyDown={(e) => {
            if (isSegmentCompleted) return
            if (e.key === 'Enter') {
              e.currentTarget.blur()
            }
            if (e.key === 'Backspace' && userAnswer.length <= hintCount) {
              e.preventDefault()
            }
          }}
          autoComplete="off"
          autoCapitalize="off"
        />
      </span>
    )
  }

  const renderSegmentWithBlanks = (segment: TranscriptSegment) => {
    const words = segment.textEn.split(' ')

    return words.map((word, index) => {
      const blank = segment.blanks.find((b) => b.wordIndex === index)

      if (!blank) {
        return <span key={index}>{word}</span>
      }

      return (
        <span key={blank.id}>
          {renderBlank(blank, segment.id)}
          <span> </span>
        </span>
      )
    })
  }

  const currentSegmentHintsUsed = currentSegment
    ? getSegmentHintCount(currentSegment.blanks, hintRevealedCount)
    : 0

  const hasMoreHints = currentSegment
    ? findHintableBlank(currentSegment.blanks, hintRevealedCount) !== undefined
    : false

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-4 lg:px-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary"
        >
          <Icon name="arrow-left" size={20} />
          <span className="font-medium">{isVietnamese ? 'Quay lại' : 'Back'}</span>
        </button>
        <div className="text-sm text-text-tertiary">{exercise.title}</div>
      </div>

      <div className="flex gap-4 h-[calc(100vh-140px)]">
        <div className="w-180 shrink-0 flex flex-col gap-4">
          <Card className="overflow-hidden">
            <div
              className={`relative ${
                exercise.mediaType === 'VIDEO'
                  ? 'aspect-video bg-black'
                  : 'h-32 bg-linear-to-br from-primary-20 to-primary-5'
              }`}
            >
              {exercise.mediaType === 'VIDEO' ? (
                <div className="absolute inset-0 flex items-center justify-center bg-surface-subtle">
                  <div className="text-center">
                    <Icon
                      name="video"
                      size={36}
                      className="text-text-tertiary mx-auto mb-1"
                    />
                    <p className="text-xs text-text-secondary">Video Player</p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-end gap-0.5 h-16">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-0.5 rounded-full transition-all ${
                          currentTime >= (i / 20) * exercise.durationSeconds
                            ? 'bg-primary'
                            : 'bg-primary-20'
                        }`}
                        style={{ height: `${20 + Math.sin(i * 0.5) * 15}%` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={togglePlayback}
                className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30"
              >
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
                  <Icon name={isPlaying ? 'pause' : 'play'} size={24} />
                </div>
              </button>
            </div>

            <CardContent className="p-3">
              <div className="mb-2">
                <input
                  type="range"
                  min="0"
                  max={exercise.durationSeconds}
                  step="0.1"
                  value={currentTime}
                  onChange={(e) => setCurrentTime(Number(e.target.value))}
                  className="w-full h-1.5 bg-surface-subtle rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-text-tertiary mt-0.5">
                  <span>{formatDuration(currentTime)}</span>
                  <span>{formatDuration(exercise.durationSeconds)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={replayPreviousSegment}
                    disabled={activeSegmentIndex === 0}
                    className="h-7 w-7 p-0"
                  >
                    <Icon name="chevron-left" size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={replaySegment}
                    className="h-7 px-1.5"
                  >
                    <Icon name="rotate-ccw" size={12} />
                  </Button>
                </div>

                <div className="flex items-center gap-0.5 bg-surface-subtle rounded-md p-0.5">
                  {[0.75, 1, 1.25].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-1.5 py-0.5 rounded text-xs ${
                        playbackSpeed === speed
                          ? 'bg-primary text-white'
                          : 'text-text-secondary'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-1 overflow-x-auto pb-1">
            {exercise.segments.map((seg, i) => {
              const isCompleted = completedSegments.has(seg.id)
              const isActive = i === activeSegmentIndex && !isCompleted

              return (
                <button
                  key={seg.id}
                  onClick={() => goToSegment(i)}
                  className={`
                    flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all
                    ${
                      isCompleted
                        ? 'bg-success text-white cursor-pointer'
                        : isActive
                          ? 'bg-primary text-white cursor-pointer'
                          : 'bg-surface-subtle text-text-tertiary cursor-not-allowed'
                    }
                  `}
                >
                  {isCompleted ? <Icon name="check" size={12} /> : i + 1}
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-text-tertiary">
            <span>{isVietnamese ? 'Gợi ý' : 'Hints'}: {totalHintsUsed}</span>
            <span>{isVietnamese ? 'Nghe lại' : 'Replay'}: {replayCount}</span>
            <span>
              {completedSegments.size}/{exercise.segments.length}
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardContent className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center gap-2 mb-4 sticky top-0 bg-white pb-2">
                <span className="text-xs px-2 py-1 bg-primary-soft text-primary rounded-full font-medium">
                  {isVietnamese ? 'Câu' : 'Question'} {activeSegmentIndex + 1}
                </span>
                <span className="text-xs text-text-tertiary">
                  {formatDuration(currentSegment?.startTime || 0)} -{' '}
                  {formatDuration(currentSegment?.endTime || 0)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-lg leading-relaxed text-text-primary mb-4 font-medium">
                {currentSegment && renderSegmentWithBlanks(currentSegment)}
              </div>

              {hasViewedCurrentResult && !isCurrentSegmentCompleted && (
                <div className="mb-4 p-3 bg-surface-subtle rounded-lg">
                  <h4 className="text-sm font-medium text-text-secondary mb-2">
                    {isVietnamese ? 'Kết quả kiểm tra:' : 'Check results:'}
                  </h4>
                  {currentSegment?.blanks.map((blank) => {
                    const result = checkedResults[blank.id]
                    if (!result) return null
                    return (
                      <div
                        key={blank.id}
                        className="flex items-center gap-2 mb-2"
                      >
                        <Icon
                          name={result.isCorrect ? 'check' : 'x'}
                          size={16}
                          className={
                            result.isCorrect ? 'text-success' : 'text-error'
                          }
                        />
                        <span className="text-sm">
                          {result.isCorrect ? (
                            <span className="text-success">
                              {isVietnamese ? 'Đúng' : 'Correct'}: {result.userAnswer}
                            </span>
                          ) : (
                            <span>
                              <span className="text-error line-through">
                                {isVietnamese ? 'Sai' : 'Wrong'}: {result.userAnswer}
                              </span>
                              <span className="text-warning ml-2">
                                → {isVietnamese ? 'Đáp án' : 'Answer'}: {result.correctAnswer}
                              </span>
                            </span>
                          )}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  onClick={handleHint}
                  disabled={!hasMoreHints || isCurrentSegmentCompleted}
                  className="border-primary text-primary"
                >
                  <Icon name="lightbulb" size={16} />
                  <span className="ml-1">{isVietnamese ? 'Gợi ý' : 'Hint'}</span>
                  {currentSegmentHintsUsed > 0 && (
                    <span className="ml-1 text-xs opacity-70">
                      ({currentSegmentHintsUsed})
                    </span>
                  )}
                </Button>
              </div>

              <Button
                onClick={handleNext}
                disabled={!hasViewedCurrentResult && !canSubmitCurrentSegment}
                className="w-full bg-primary hover:bg-primary-hover"
              >
                {!hasViewedCurrentResult ? (
                  <>{isVietnamese ? 'Kiểm tra' : 'Check'}</>
                ) : isCurrentSegmentCompleted || allSegmentsCompleted ? (
                  <>{isVietnamese ? 'Hoàn thành' : 'Complete'}</>
                ) : (
                  <>{isVietnamese ? 'Tiếp tục' : 'Next'}</>
                )}
                <Icon
                  name={!hasViewedCurrentResult ? 'check' : 'chevron-right'}
                  size={16}
                />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
