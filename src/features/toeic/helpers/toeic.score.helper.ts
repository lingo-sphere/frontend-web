// Bộ tính toán điểm số bài thi TOEIC, thống kê tỷ lệ đúng theo kỹ năng và ước lượng band điểm.

import type { ToeicQuestion } from '@/features/toeic/types/toeic'
import type { ExamResultMetrics } from '@/features/toeic/components/toeic.exam.result'

export function calculateToeicExamResults(
  allQuestions: ToeicQuestion[],
  answers: Record<number, string>,
  evaluatedAnswers: Record<
    number,
    {
      whisper_transcript?: string
      ai_score?: number
      ai_feedback?: {
        pronunciation_score?: number
        fluency_score?: number
        grammar_score?: number
        vocabulary_score?: number
        detailed_comment?: string
        improvement_tips?: string[]
      }
      is_correct?: boolean
    }
  > = {}
): ExamResultMetrics {
  let correct = 0
  let listeningCorrect = 0
  let listeningTotal = 0
  let readingCorrect = 0
  let readingTotal = 0
  let speakingTotal = 0
  let speakingCompleted = 0
  let speakingScoreSum = 0
  let writingTotal = 0
  let writingCompleted = 0
  let writingScoreSum = 0

  const partStats: Record<string, { correct: number; total: number }> = {}

  allQuestions.forEach((q) => {
    const isWriting =
      q.questionType === 'WRITING' ||
      q.skillType === 'WRITING' ||
      String(q.partNumber).toLowerCase().includes('writ')
    const isSpeaking =
      !isWriting &&
      (q.questionType === 'SPEAKING' ||
        q.skillType === 'SPEAKING' ||
        String(q.partNumber).toLowerCase().includes('speak'))

    const hasGenuinePart =
      typeof q.partNumber === 'number' &&
      q.partNumber >= 1 &&
      q.partNumber <= 7

    const partKey: string = isWriting
      ? 'writing'
      : isSpeaking
        ? 'speaking'
        : hasGenuinePart
          ? String(q.partNumber)
          : q.skillType === 'LISTENING'
            ? 'listening'
            : 'reading'

    if (!partStats[partKey]) {
      partStats[partKey] = { correct: 0, total: 0 }
    }
    partStats[partKey].total++

    if (isWriting) {
      writingTotal++
      const studentText = (answers[q.questionNumber] || '').trim()
      const wordCount = studentText.split(/\s+/).filter(Boolean).length
      const evalInfo = evaluatedAnswers[q.questionNumber]
      const hasAiEvaluation = evalInfo && evalInfo.ai_score !== undefined
      const isPass = evalInfo
        ? (evalInfo.is_correct ?? (evalInfo.ai_score !== undefined && evalInfo.ai_score >= 50))
        : false

      if (wordCount > 0) {
        writingCompleted++
      }
      if (isPass) {
        correct++
        partStats[partKey].correct++
      }
      if (hasAiEvaluation) {
        const qScore = Math.round(((evalInfo.ai_score || 0) / 100) * 200)
        writingScoreSum += qScore
      } else if (wordCount > 0) {
        const minWords = q.minWords || 60
        const completionRatio = Math.min(1, wordCount / minWords)
        const qScore = Math.round(completionRatio * 200)
        writingScoreSum += qScore
      }
    } else if (isSpeaking) {
      speakingTotal++
      const studentResponse = (answers[q.questionNumber] || '').trim()
      const evalInfo = evaluatedAnswers[q.questionNumber]
      const hasAiEvaluation = evalInfo && evalInfo.ai_score !== undefined
      const isPass = evalInfo
        ? (evalInfo.is_correct ?? (evalInfo.ai_score !== undefined && evalInfo.ai_score >= 50))
        : false

      if (studentResponse.length > 0) {
        speakingCompleted++
      }
      if (isPass) {
        correct++
        partStats[partKey].correct++
      }
      if (hasAiEvaluation) {
        const qScore = Math.round(((evalInfo.ai_score || 0) / 100) * 200)
        speakingScoreSum += qScore
      } else if (studentResponse.length > 0) {
        const wordCount = studentResponse.split(/\s+/).filter(Boolean).length
        const completionRatio =
          studentResponse.startsWith('data:audio') || studentResponse.startsWith('http')
            ? 0.5
            : Math.min(1, Math.max(0.2, wordCount / 30))
        const qScore = Math.round(completionRatio * 200)
        speakingScoreSum += qScore
      }
    } else {
      if (q.skillType === 'LISTENING') {
        listeningTotal++
      } else if (q.skillType === 'READING') {
        readingTotal++
      }

      const isCorrect = answers[q.questionNumber] === q.correctOption
      if (isCorrect) {
        correct++
        partStats[partKey].correct++
        if (q.skillType === 'LISTENING') {
          listeningCorrect++
        } else if (q.skillType === 'READING') {
          readingCorrect++
        }
      }
    }
  })

  const total = allQuestions.length || 1
  const percentage = Math.round((correct / total) * 100)

  const estimatedListening =
    listeningTotal > 0
      ? Math.min(495, Math.max(5, Math.round(((listeningCorrect / listeningTotal) * 495) / 5) * 5))
      : 0
  const estimatedReading =
    readingTotal > 0
      ? Math.min(495, Math.max(5, Math.round(((readingCorrect / readingTotal) * 495) / 5) * 5))
      : 0
  const estimatedTotal =
    estimatedListening > 0 || estimatedReading > 0
      ? estimatedListening + estimatedReading
      : Math.min(990, Math.max(10, Math.round(((percentage / 100) * 990) / 5) * 5))

  const estimatedSpeaking =
    speakingTotal > 0 ? Math.min(200, Math.round(speakingScoreSum / speakingTotal)) : undefined

  const estimatedWriting =
    writingTotal > 0 ? Math.min(200, Math.round(writingScoreSum / writingTotal)) : undefined

  return {
    correct,
    total,
    percentage,
    listeningCorrect,
    listeningTotal,
    readingCorrect,
    readingTotal,
    estimatedListening,
    estimatedReading,
    estimatedTotal,
    partStats,
    speakingTotal,
    speakingCompleted,
    estimatedSpeaking,
    writingTotal,
    writingCompleted,
    estimatedWriting,
  }
}
