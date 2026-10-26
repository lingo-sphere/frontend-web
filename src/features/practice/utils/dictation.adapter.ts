/**
 * @file dictation.adapter.ts
 * @description Hàm chuyển đổi dữ liệu DictationItem sang ListeningExercise cho VideoDictationView
 */

import type { DictationItem } from '../types/listening-practice';
import type { ListeningExercise } from '../types/listening';

export function convertDictationToExercise(item: DictationItem): ListeningExercise {
  return {
    id: item._id,
    title: item.title,
    titleVi: item.title_vi,
    description: item.description || '',
    descriptionVi: item.description_vi,
    domain: 'GENERAL',
    mediaType: 'AUDIO',
    mediaId: item._id,
    mediaUrl: item.audio_url,
    durationSeconds: item.duration_seconds || 60,
    exerciseType: 'DICTATION',
    difficultyLevel: (item.difficulty_level as any) || 'MEDIUM',
    cefrLevel: item.cefr_level || 'B1',
    topicId: '',
    status: 'ACTIVE',
    createdBy: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    segments: (item.segments || []).map((seg, idx) => ({
      id: seg._id || `seg-${idx}`,
      exerciseId: item._id,
      segmentIndex: seg.segment_index ?? idx,
      startTime: seg.start_time,
      endTime: seg.end_time,
      textEn: seg.text,
      textVi: seg.text_vi,
      blanks: (seg.blanks || []).map((b, bIdx) => ({
        id: `blank-${idx}-${bIdx}`,
        wordIndex: b.blank_index ?? bIdx,
        answer: b.correct_answer,
        acceptedAnswers: b.alternative_answers,
      })),
    })),
  };
}

