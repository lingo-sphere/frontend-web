// Updated: 2026-08-17
// Mock data cho Listening page - Synced với Practice Service DB
// Cấu trúc dữ liệu đúng cho Video Dictation

import type {
  ListeningExercise,
  ListeningAttempt,
  TranscriptSegment,
  Blank,
  SegmentAnswer,
  AIAnalysis,
} from '@/types/listening'

// Re-export types for convenience
export type {
  ListeningExercise,
  ListeningAttempt,
  TranscriptSegment,
  Blank,
  SegmentAnswer,
  AIAnalysis,
}

// ============================================================
// TYPES - Matching Practice Service DB
// ============================================================

export type MediaType = 'AUDIO' | 'VIDEO'
export type ExerciseType = 'DICTATION' | 'VIDEO_DICTATION' | 'LISTEN_CHOOSE' | 'LISTEN_ORDER'
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD'
export type AttemptStatus = 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED'
export type BlankStatus = 'PENDING' | 'CORRECT' | 'INCORRECT' | 'SKIPPED' | 'HINTED'

// ============================================================
// TOPICS (từ topics-data.ts)
// ============================================================

export const listeningTopics = [
  { id: 'topic-business', name: 'Business', nameVi: 'Kinh doanh', cefr: 'B1-B2' },
  { id: 'topic-daily', name: 'Daily Life', nameVi: 'Đời thường', cefr: 'A2-B1' },
  { id: 'topic-travel', name: 'Travel', nameVi: 'Du lịch', cefr: 'A2-B1' },
]

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getExerciseById(id: string): ListeningExercise | undefined {
  return listeningExercises.find((e) => e.id === id)
}

export function getAttemptsByExerciseId(exerciseId: string): ListeningAttempt[] {
  return listeningAttempts.filter((a) => a.exerciseId === exerciseId)
}

export function getInProgressAttempt(exerciseId: string): ListeningAttempt | undefined {
  return listeningAttempts.find((a) => a.exerciseId === exerciseId && a.status === 'IN_PROGRESS')
}

export function getLastAttempt(exerciseId: string): ListeningAttempt | undefined {
  const attempts = listeningAttempts
    .filter((a) => a.exerciseId === exerciseId && a.status === 'COMPLETED')
    .sort((a, b) => new Date(b.completedAt || b.startedAt).getTime() - new Date(a.completedAt || a.startedAt).getTime())
  return attempts[0]
}

export function getRecommendedExercises(): ListeningExercise[] {
  return listeningExercises.filter((e) => e.cefrLevel === 'B1' || e.cefrLevel === 'B2').slice(0, 3)
}

export function getContinueListening(): ListeningAttempt[] {
  return listeningAttempts.filter((a) => a.status === 'IN_PROGRESS')
}

export function getTopicById(topicId: string) {
  return listeningTopics.find((t) => t.id === topicId)
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function getDifficultyColor(level: DifficultyLevel): string {
  switch (level) {
    case 'EASY':
      return 'text-success bg-success-soft'
    case 'MEDIUM':
      return 'text-warning bg-warning-soft'
    case 'HARD':
      return 'text-error bg-error-soft'
    default:
      return 'text-text-secondary bg-surface-subtle'
  }
}

export function getDifficultyLabel(level: DifficultyLevel): string {
  switch (level) {
    case 'EASY':
      return 'Dễ'
    case 'MEDIUM':
      return 'Trung bình'
    case 'HARD':
      return 'Khó'
    default:
      return level
  }
}

export function getExerciseTypeLabel(type: ExerciseType): string {
  switch (type) {
    case 'DICTATION':
      return 'Dictation'
    case 'VIDEO_DICTATION':
      return 'Video Dictation'
    case 'LISTEN_CHOOSE':
      return 'Listen & Choose'
    case 'LISTEN_ORDER':
      return 'Listen & Order'
    default:
      return type
  }
}

/**
 * Xác định segment index tại thời điểm currentTime
 * SINGLE SOURCE OF TRUTH cho việc xác định segment hiện tại
 */
export function getSegmentIndexAtTime(currentTime: number, segments: TranscriptSegment[]): number {
  for (let i = segments.length - 1; i >= 0; i--) {
    if (currentTime >= segments[i].startTime) {
      return i
    }
  }
  return 0
}

/**
 * Validate listening exercise data
 */
export function validateListeningExercise(exercise: ListeningExercise): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (exercise.durationSeconds <= 0) {
    errors.push(`Exercise ${exercise.id}: durationSeconds must be > 0`)
  }

  let prevEndTime = 0
  exercise.segments.forEach((seg, index) => {
    if (seg.startTime < 0) {
      errors.push(`Segment ${index} (${seg.id}): startTime must be >= 0`)
    }
    if (seg.endTime <= seg.startTime) {
      errors.push(`Segment ${index} (${seg.id}): endTime must be > startTime`)
    }
    if (seg.startTime < prevEndTime) {
      errors.push(`Segment ${index} (${seg.id}): overlap detected - starts before previous ends`)
    }
    prevEndTime = seg.endTime

    // Validate blanks
    seg.blanks?.forEach((blank) => {
      const words = seg.textEn.split(' ')
      if (blank.wordIndex < 0 || blank.wordIndex >= words.length) {
        errors.push(`Blank ${blank.id} in segment ${seg.id}: invalid wordIndex ${blank.wordIndex}`)
      }
    })
  })

  if (prevEndTime > exercise.durationSeconds) {
    errors.push(`Exercise ${exercise.id}: last segment ends after duration`)
  }

  return { valid: errors.length === 0, errors }
}

// ============================================================
// LISTENING EXERCISES MẪU
// ============================================================

export const listeningExercises: ListeningExercise[] = [
  // Exercise 1: VIDEO - EASY - A2
  {
    id: 'listen-video-easy-01',
    title: 'Daily Routines',
    titleVi: 'Thói quen hàng ngày',
    description: 'Watch and practice listening to daily routine conversations.',
    descriptionVi: 'Xem và luyện nghe các cuộc trò chuyện về thói quen hàng ngày.',
    domain: 'LISTENING',
    mediaType: 'VIDEO',
    mediaId: 'media-video-001',
    mediaUrl: 'https://example.com/video/daily-routines.mp4',
    thumbnailUrl: 'https://example.com/thumbnails/daily-routines.jpg',
    durationSeconds: 24,
    exerciseType: 'VIDEO_DICTATION',
    difficultyLevel: 'EASY',
    cefrLevel: 'A2',
    topicId: 'topic-daily',
    targetLexicalItemIds: ['lex-wake', 'lex-breakfast', 'lex-work', 'lex-home'],
    targetGrammarPointIds: [],
    status: 'PUBLISHED',
    createdBy: 'admin-001',
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-15T00:00:00Z',
    segments: [
      {
        id: 'seg-001-1',
        exerciseId: 'listen-video-easy-01',
        segmentIndex: 0,
        startTime: 0,
        endTime: 5.5,
        textEn: 'I wake up at six every morning.',
        textVi: 'Tôi thức dậy lúc sáu mỗi sáng.',
        speaker: 'SPEAKER_A',
        blanks: [
          { id: 'blank-001-1-1', wordIndex: 1, answer: 'wake', acceptedAnswers: ['wake'], hintText: 'w____' },
        ],
      },
      {
        id: 'seg-001-2',
        exerciseId: 'listen-video-easy-01',
        segmentIndex: 1,
        startTime: 5.5,
        endTime: 11.2,
        textEn: 'I usually have breakfast at seven.',
        textVi: 'Tôi thường ăn sáng lúc bảy giờ.',
        speaker: 'SPEAKER_A',
        blanks: [
          { id: 'blank-001-2-1', wordIndex: 2, answer: 'breakfast', acceptedAnswers: ['breakfast'], hintText: 'b________' },
        ],
      },
      {
        id: 'seg-001-3',
        exerciseId: 'listen-video-easy-01',
        segmentIndex: 2,
        startTime: 11.2,
        endTime: 16.8,
        textEn: 'I go to work by bus every day.',
        textVi: 'Tôi đi làm bằng xe buýt mỗi ngày.',
        speaker: 'SPEAKER_B',
        blanks: [
          { id: 'blank-001-3-1', wordIndex: 3, answer: 'work', acceptedAnswers: ['work'], hintText: 'w___' },
          { id: 'blank-001-3-2', wordIndex: 6, answer: 'bus', acceptedAnswers: ['bus'], hintText: 'b__' },
        ],
      },
      {
        id: 'seg-001-4',
        exerciseId: 'listen-video-easy-01',
        segmentIndex: 3,
        startTime: 16.8,
        endTime: 24,
        textEn: 'I come home at six in the evening.',
        textVi: 'Tôi về nhà lúc sáu giờ tối.',
        speaker: 'SPEAKER_B',
        blanks: [
          { id: 'blank-001-4-1', wordIndex: 2, answer: 'home', acceptedAnswers: ['home'], hintText: 'h___' },
        ],
      },
    ],
  },

  // Exercise 2: VIDEO - MEDIUM - B1
  {
    id: 'listen-video-medium-01',
    title: 'Business Meeting',
    titleVi: 'Cuộc họp kinh doanh',
    description: 'Listen to a business meeting conversation and fill in the blanks.',
    descriptionVi: 'Nghe cuộc trò chuyện trong cuộc họp kinh doanh và điền vào chỗ trống.',
    domain: 'LISTENING',
    mediaType: 'VIDEO',
    mediaId: 'media-video-002',
    mediaUrl: 'https://example.com/video/business-meeting.mp4',
    thumbnailUrl: 'https://example.com/thumbnails/business-meeting.jpg',
    durationSeconds: 32,
    exerciseType: 'VIDEO_DICTATION',
    difficultyLevel: 'MEDIUM',
    cefrLevel: 'B1',
    topicId: 'topic-business',
    targetLexicalItemIds: ['lex-schedule', 'lex-confirm', 'lex-available', 'lex-attend'],
    targetGrammarPointIds: [],
    status: 'PUBLISHED',
    createdBy: 'admin-001',
    createdAt: '2026-08-02T00:00:00Z',
    updatedAt: '2026-08-15T00:00:00Z',
    segments: [
      {
        id: 'seg-002-1',
        exerciseId: 'listen-video-medium-01',
        segmentIndex: 0,
        startTime: 0,
        endTime: 7.5,
        textEn: 'I would like to schedule a meeting with the marketing team.',
        textVi: 'Tôi muốn sắp xếp một cuộc họp với team marketing.',
        speaker: 'SPEAKER_A',
        blanks: [
          { id: 'blank-002-1-1', wordIndex: 3, answer: 'schedule', acceptedAnswers: ['schedule'], hintText: 's________' },
          { id: 'blank-002-1-2', wordIndex: 7, answer: 'marketing', acceptedAnswers: ['marketing'], hintText: 'm_________' },
        ],
      },
      {
        id: 'seg-002-2',
        exerciseId: 'listen-video-medium-01',
        segmentIndex: 1,
        startTime: 7.5,
        endTime: 14.8,
        textEn: 'What time would be convenient for you tomorrow?',
        textVi: 'Thời gian nào thuận tiện cho bạn vào ngày mai?',
        speaker: 'SPEAKER_B',
        blanks: [
          { id: 'blank-002-2-1', wordIndex: 4, answer: 'convenient', acceptedAnswers: ['convenient'], hintText: 'c___________' },
        ],
      },
      {
        id: 'seg-002-3',
        exerciseId: 'listen-video-medium-01',
        segmentIndex: 2,
        startTime: 14.8,
        endTime: 22.3,
        textEn: 'Is three o clock in the afternoon available?',
        textVi: 'Ba giờ chiều có được không?',
        speaker: 'SPEAKER_A',
        blanks: [
          { id: 'blank-002-3-1', wordIndex: 1, answer: "clock", acceptedAnswers: ["clock", "o'clock"], hintText: 'c____' },
          { id: 'blank-002-3-2', wordIndex: 5, answer: 'afternoon', acceptedAnswers: ['afternoon'], hintText: 'a___________' },
        ],
      },
      {
        id: 'seg-002-4',
        exerciseId: 'listen-video-medium-01',
        segmentIndex: 3,
        startTime: 22.3,
        endTime: 32,
        textEn: 'Yes, that time is available. I will send a confirmation email.',
        textVi: 'Có, thời gian đó có sẵn. Tôi sẽ gửi email xác nhận.',
        speaker: 'SPEAKER_B',
        blanks: [
          { id: 'blank-002-4-1', wordIndex: 3, answer: 'available', acceptedAnswers: ['available'], hintText: 'a_________' },
          { id: 'blank-002-4-2', wordIndex: 8, answer: 'confirmation', acceptedAnswers: ['confirmation'], hintText: 'c_____________' },
        ],
      },
    ],
  },

  // Exercise 3: AUDIO - HARD - B2
  {
    id: 'listen-audio-hard-01',
    title: 'Conference Call',
    titleVi: 'Cuộc gọi hội nghị',
    description: 'Listen to a conference call and complete the transcript.',
    descriptionVi: 'Nghe cuộc gọi hội nghị và hoàn thành bản transcript.',
    domain: 'LISTENING',
    mediaType: 'AUDIO',
    mediaId: 'media-audio-001',
    mediaUrl: 'https://example.com/audio/conference-call.mp3',
    durationSeconds: 45,
    exerciseType: 'DICTATION',
    difficultyLevel: 'HARD',
    cefrLevel: 'B2',
    topicId: 'topic-business',
    targetLexicalItemIds: ['lex-postpone', 'lex-reschedule', 'lex-cancelled', 'lex-attendee'],
    targetGrammarPointIds: [],
    status: 'PUBLISHED',
    createdBy: 'admin-001',
    createdAt: '2026-08-03T00:00:00Z',
    updatedAt: '2026-08-15T00:00:00Z',
    segments: [
      {
        id: 'seg-003-1',
        exerciseId: 'listen-audio-hard-01',
        segmentIndex: 0,
        startTime: 0,
        endTime: 10.5,
        textEn: 'We need to reschedule the quarterly meeting.',
        textVi: 'Chúng ta cần đổi lịch cuộc họp hàng quý.',
        speaker: 'SPEAKER_A',
        blanks: [
          { id: 'blank-003-1-1', wordIndex: 3, answer: 'reschedule', acceptedAnswers: ['reschedule'], hintText: 'r_________' },
          { id: 'blank-003-1-2', wordIndex: 5, answer: 'quarterly', acceptedAnswers: ['quarterly'], hintText: 'q_________' },
        ],
      },
      {
        id: 'seg-003-2',
        exerciseId: 'listen-audio-hard-01',
        segmentIndex: 1,
        startTime: 10.5,
        endTime: 21.2,
        textEn: 'The client has postponed their visit to next week.',
        textVi: 'Khách hàng đã hoãn chuyến thăm sang tuần sau.',
        speaker: 'SPEAKER_B',
        blanks: [
          { id: 'blank-003-2-1', wordIndex: 3, answer: 'postponed', acceptedAnswers: ['postponed'], hintText: 'p_________' },
          { id: 'blank-003-2-2', wordIndex: 7, answer: 'visit', acceptedAnswers: ['visit'], hintText: 'v___' },
        ],
      },
      {
        id: 'seg-003-3',
        exerciseId: 'listen-audio-hard-01',
        segmentIndex: 2,
        startTime: 21.2,
        endTime: 32.8,
        textEn: 'Can we reschedule for Wednesday at two PM?',
        textVi: 'Chúng ta có thể đổi sang thứ Tư lúc hai giờ không?',
        speaker: 'SPEAKER_A',
        blanks: [
          { id: 'blank-003-3-1', wordIndex: 3, answer: 'reschedule', acceptedAnswers: ['reschedule'], hintText: 'r_________' },
          { id: 'blank-003-3-2', wordIndex: 5, answer: 'Wednesday', acceptedAnswers: ['Wednesday', 'wednesday'], hintText: 'W________' },
        ],
      },
      {
        id: 'seg-003-4',
        exerciseId: 'listen-audio-hard-01',
        segmentIndex: 3,
        startTime: 32.8,
        endTime: 45,
        textEn: 'I will check the availability of all attendees and send a revised calendar invitation.',
        textVi: 'Tôi sẽ kiểm tra tình trạng sẵn sàng của tất cả người tham dự và gửi lời mời lịch đã điều chỉnh.',
        speaker: 'SPEAKER_B',
        blanks: [
          { id: 'blank-003-4-1', wordIndex: 5, answer: 'availability', acceptedAnswers: ['availability'], hintText: 'a____________' },
          { id: 'blank-003-4-2', wordIndex: 9, answer: 'attendees', acceptedAnswers: ['attendees', 'attendees'], hintText: 'a________' },
        ],
      },
    ],
  },
]

// ============================================================
// LISTENING ATTEMPTS MẪU
// ============================================================

export const listeningAttempts: ListeningAttempt[] = [
  // Attempt đang làm dở
  {
    id: 'attempt-in-progress-01',
    exerciseId: 'listen-video-medium-01',
    userId: 'user-001',
    status: 'IN_PROGRESS',
    currentSegmentIndex: 1,
    currentTime: 8.5,
    startedAt: '2026-08-16T10:00:00Z',
    lastActivityAt: '2026-08-16T10:05:00Z',
    segmentAnswers: [
      {
        segmentId: 'seg-002-1',
        completedAt: '2026-08-16T10:03:00Z',
        blankResults: [
          { blankId: 'blank-002-1-1', userAnswer: 'schedule', isCorrect: true, isHintUsed: false },
          { blankId: 'blank-002-1-2', userAnswer: 'marketing', isCorrect: true, isHintUsed: false },
        ],
        timeSpentSeconds: 45,
        replayCount: 2,
      },
    ],
    totalHintsUsed: 0,
    totalReplays: 2,
    totalTimeSeconds: 180,
  },

  // Attempt hoàn thành tốt
  {
    id: 'attempt-completed-01',
    exerciseId: 'listen-video-easy-01',
    userId: 'user-001',
    status: 'COMPLETED',
    currentSegmentIndex: 3,
    currentTime: 24, // duration of exercise
    startedAt: '2026-08-15T14:00:00Z',
    completedAt: '2026-08-15T14:05:30Z',
    lastActivityAt: '2026-08-15T14:05:30Z',
    segmentAnswers: [
      {
        segmentId: 'seg-001-1',
        completedAt: '2026-08-15T14:01:00Z',
        blankResults: [
          { blankId: 'blank-001-1-1', userAnswer: 'wake', isCorrect: true, isHintUsed: false },
        ],
        timeSpentSeconds: 25,
        replayCount: 1,
      },
      {
        segmentId: 'seg-001-2',
        completedAt: '2026-08-15T14:02:30Z',
        blankResults: [
          { blankId: 'blank-001-2-1', userAnswer: 'breakfast', isCorrect: true, isHintUsed: false },
        ],
        timeSpentSeconds: 30,
        replayCount: 1,
      },
      {
        segmentId: 'seg-001-3',
        completedAt: '2026-08-15T14:04:00Z',
        blankResults: [
          { blankId: 'blank-001-3-1', userAnswer: 'work', isCorrect: true, isHintUsed: false },
          { blankId: 'blank-001-3-2', userAnswer: 'bus', isCorrect: true, isHintUsed: false },
        ],
        timeSpentSeconds: 40,
        replayCount: 2,
      },
      {
        segmentId: 'seg-001-4',
        completedAt: '2026-08-15T14:05:30Z',
        blankResults: [
          { blankId: 'blank-001-4-1', userAnswer: 'home', isCorrect: true, isHintUsed: false },
        ],
        timeSpentSeconds: 25,
        replayCount: 1,
      },
    ],
    totalHintsUsed: 0,
    totalReplays: 5,
    totalTimeSeconds: 330,
    score: 100,
    totalCorrectBlanks: 5,
    totalBlanks: 5,
    accuracy: 100,
  },

  // Attempt hoàn thành với lỗi và hint
  {
    id: 'attempt-completed-02',
    exerciseId: 'listen-audio-hard-01',
    userId: 'user-001',
    status: 'COMPLETED',
    currentSegmentIndex: 3,
    currentTime: 45, // duration of exercise
    startedAt: '2026-08-14T16:00:00Z',
    completedAt: '2026-08-14T16:08:45Z',
    lastActivityAt: '2026-08-14T16:08:45Z',
    segmentAnswers: [
      {
        segmentId: 'seg-003-1',
        completedAt: '2026-08-14T16:02:00Z',
        blankResults: [
          { blankId: 'blank-003-1-1', userAnswer: 'reschedule', isCorrect: true, isHintUsed: false },
          { blankId: 'blank-003-1-2', userAnswer: 'quarterly', isCorrect: true, isHintUsed: false },
        ],
        timeSpentSeconds: 60,
        replayCount: 3,
      },
      {
        segmentId: 'seg-003-2',
        completedAt: '2026-08-14T16:04:30Z',
        blankResults: [
          { blankId: 'blank-003-2-1', userAnswer: 'canceled', isCorrect: false, isHintUsed: false },
          { blankId: 'blank-003-2-2', userAnswer: 'visit', isCorrect: true, isHintUsed: false },
        ],
        timeSpentSeconds: 75,
        replayCount: 4,
      },
      {
        segmentId: 'seg-003-3',
        completedAt: '2026-08-14T16:06:15Z',
        blankResults: [
          { blankId: 'blank-003-3-1', userAnswer: 'schedule', isCorrect: false, isHintUsed: true },
          { blankId: 'blank-003-3-2', userAnswer: 'Wednesday', isCorrect: true, isHintUsed: false },
        ],
        timeSpentSeconds: 90,
        replayCount: 2,
      },
      {
        segmentId: 'seg-003-4',
        completedAt: '2026-08-14T16:08:45Z',
        blankResults: [
          { blankId: 'blank-003-4-1', userAnswer: 'availability', isCorrect: true, isHintUsed: true },
          { blankId: 'blank-003-4-2', userAnswer: 'attendees', isCorrect: true, isHintUsed: false },
        ],
        timeSpentSeconds: 85,
        replayCount: 3,
      },
    ],
    totalHintsUsed: 2,
    totalReplays: 12,
    totalTimeSeconds: 525,
    score: 75,
    totalCorrectBlanks: 6,
    totalBlanks: 8,
    accuracy: 75,
    aiAnalysis: {
      overallScore: 75,
      accuracy: 75,
      mistakes: [
        {
          segmentId: 'seg-003-2',
          blankId: 'blank-003-2-1',
          userAnswer: 'canceled',
          correctAnswer: 'postponed',
          explanation: '"Canceled" means to stop something planned, while "postponed" means to move it to a later time.',
        },
        {
          segmentId: 'seg-003-3',
          blankId: 'blank-003-3-1',
          userAnswer: 'schedule',
          correctAnswer: 'reschedule',
          explanation: '"Reschedule" specifically means to change an existing appointment, while "schedule" means to set a time for something new.',
        },
      ],
      weakAreas: ['phrasal_verbs', 'business_vocabulary', 'word_recognition_speed'],
      suggestions: [
        'Practice distinguishing between similar business terms',
        'Review common meeting-related vocabulary',
        'Try shadowing exercises to improve recognition speed',
      ],
    },
  },
]

// ============================================================
// VALIDATE ALL EXERCISES ON IMPORT
// ============================================================

if (typeof window !== 'undefined') {
  listeningExercises.forEach((exercise) => {
    const { valid, errors } = validateListeningExercise(exercise)
    if (!valid) {
      console.error('Listening Exercise Validation Failed:', errors)
    }
  })
}
