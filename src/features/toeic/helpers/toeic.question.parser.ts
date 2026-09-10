// Bộ phân tích và chuẩn hóa danh sách câu hỏi từ dữ liệu đề thi TOEIC sang định dạng hiển thị.

import type { BackendToeicExam } from '@/features/toeic/services/exam.service'
import type { ToeicQuestion } from '@/features/toeic/types/toeic'

export function parseQuestionsFromExamData(examData: BackendToeicExam, parts: number[]): ToeicQuestion[] {
  if (examData.questions && Array.isArray(examData.questions) && examData.questions.length > 0) {
    const questions: ToeicQuestion[] = []
    let qIndex = 1

    const isSystemPlacement = Boolean(
      examData.is_system_placement ||
      examData.placement_type ||
      Boolean(examData.code && examData.code.includes('placement')) ||
      examData.title?.toLowerCase().includes('đầu vào') ||
      examData.title?.toLowerCase().includes('placement')
    )

    examData.questions.forEach((rawQ, idx) => {
      const q = rawQ as Record<string, unknown>
      const rawPart = q.part_number
      const isPartNumeric = typeof rawPart === 'number' || (typeof rawPart === 'string' && /^\d+$/.test(rawPart))
      const numericPartVal = isPartNumeric ? Number(rawPart) : undefined
      const hasGenuinePart =
        !isSystemPlacement &&
        numericPartVal !== undefined &&
        numericPartVal >= 1 &&
        numericPartVal <= 7

      const rawOptions = Array.isArray(q.options) ? q.options : []
      const areAllOptionsEmpty =
        rawOptions.length === 0 ||
        rawOptions.every((opt: unknown) => {
          if (typeof opt === 'string') return !opt.trim()
          if (typeof opt === 'object' && opt !== null) {
            const o = opt as Record<string, unknown>
            return !String(o.text || o.textEn || '').trim()
          }
          return true
        })

      const qText = String(q.question_text || '')
      const isWritingPrompt = /write\s+an?\s+(email|essay|letter|paragraph)|at\s+least\s+\d+\s+words/i.test(qText)
      const isSpeakingPrompt = /describe\s+a\s+time|speak\s+about|pronounce|recording/i.test(qText)

      const isWriting =
        q.question_type === 'WRITING' ||
        q.skill_type === 'WRITING' ||
        String(rawPart).toLowerCase().includes('writ') ||
        (areAllOptionsEmpty && isWritingPrompt)

      const isSpeaking =
        !isWriting &&
        (q.question_type === 'SPEAKING' ||
          q.skill_type === 'SPEAKING' ||
          String(rawPart).toLowerCase().includes('speak') ||
          (areAllOptionsEmpty && isSpeakingPrompt))

      const shouldInclude =
        parts.length === 0 ||
        parts.length >= 7 ||
        (isWriting && parts.includes(8)) ||
        (isSpeaking && parts.includes(7)) ||
        (!isWriting && !isSpeaking && (!hasGenuinePart || (numericPartVal !== undefined && parts.includes(numericPartVal))))

      if (shouldInclude) {
        const optionKeys = ['A', 'B', 'C', 'D']
        const mappedOptions = isWriting || isSpeaking
          ? []
          : rawOptions
              .map((opt: unknown, optIdx: number) => {
                if (typeof opt === 'string') {
                  return { key: optionKeys[optIdx] || String.fromCharCode(65 + optIdx), textEn: opt }
                }
                if (typeof opt === 'object' && opt !== null) {
                  const o = opt as Record<string, unknown>
                  return {
                    key: String(o.key || optionKeys[optIdx] || 'A'),
                    textEn: String(o.text || o.textEn || ''),
                  }
                }
                return { key: optionKeys[optIdx] || 'A', textEn: String(opt) }
              })
              .filter((opt) => Boolean(opt.textEn.trim()))

        const audioUrl = (q.media_url || q.audio_url || examData.audio_full_url || examData.audio_url) as string | undefined
        const imageUrl = (q.image_url || '') as string

        const finalSkillType: 'LISTENING' | 'READING' | 'SPEAKING' | 'WRITING' = isWriting
          ? 'WRITING'
          : isSpeaking
            ? 'SPEAKING'
            : q.skill_type === 'LISTENING' || (!isWriting && !isSpeaking && Boolean(audioUrl)) || (hasGenuinePart && numericPartVal !== undefined && numericPartVal <= 4)
              ? 'LISTENING'
              : 'READING'

        const finalQuestionType = isWriting
          ? 'WRITING'
          : isSpeaking
            ? 'SPEAKING'
            : 'MULTIPLE_CHOICE'

        questions.push({
          id: String(q.id || `q-${idx + 1}`),
          examId: examData._id,
          partId: hasGenuinePart && numericPartVal ? `part-${numericPartVal}` : `skill-${finalSkillType.toLowerCase()}`,
          partNumber: isWriting ? 'writing' : isSpeaking ? 'speaking' : hasGenuinePart && numericPartVal ? numericPartVal : undefined,
          questionNumber: Number(q.question_number) || qIndex,
          questionType: finalQuestionType,
          questionTextEn: qText || `Question ${qIndex}`,
          options: mappedOptions,
          correctOption: String(q.correct_answer || (mappedOptions[0]?.key || 'A')).trim().toUpperCase(),
          explanationEn: typeof q.explanation === 'string' ? q.explanation : undefined,
          imageMediaId: imageUrl || undefined,
          audioMediaId: audioUrl || undefined,
          hasImage: Boolean(imageUrl),
          hasAudio: Boolean(audioUrl),
          difficultyLevel: (q.difficulty_level as 'EASY' | 'MEDIUM' | 'HARD') || 'MEDIUM',
          skillType: finalSkillType,
          hasPassage: !isWriting && !isSpeaking && hasGenuinePart && numericPartVal !== undefined && numericPartVal >= 6,
          status: 'PUBLISHED',
          minWords: isWriting ? (Number(q.min_words) || 100) : undefined,
          prepTimeSeconds: isSpeaking ? (Number(q.prep_time_seconds) || 45) : undefined,
          responseTimeSeconds: isSpeaking ? (Number(q.response_time_seconds) || 60) : undefined,
        })
        qIndex++
      }
    })

    if (questions.length > 0) {
      return questions
    }
  }

  if (examData.parts && Array.isArray(examData.parts)) {
    const questions: ToeicQuestion[] = []
    examData.parts.forEach((p) => {
      if (parts.includes(p.part_number) || parts.length === 0) {
        p.questions.forEach((q) => {
          questions.push({
            id: `p${p.part_number}-q${q.question_number}`,
            examId: examData._id,
            partId: `part-${p.part_number}`,
            partNumber: p.part_number,
            questionNumber: q.question_number,
            questionType: 'MULTIPLE_CHOICE',
            questionTextEn: q.question_text || `Question ${q.question_number}`,
            options: q.options.map((opt) => ({ key: opt.key, textEn: opt.text })),
            correctOption: q.correct_answer || 'A',
            explanationEn: q.explanation,
            imageMediaId: q.image_url,
            audioMediaId: q.audio_url,
            hasImage: Boolean(q.image_url),
            hasAudio: Boolean(q.audio_url),
            difficultyLevel: 'MEDIUM',
            skillType: p.part_number <= 4 ? 'LISTENING' : 'READING',
            hasPassage: p.part_number >= 6,
            status: 'PUBLISHED',
          })
        })
      }
    })
    return questions
  }

  return []
}
