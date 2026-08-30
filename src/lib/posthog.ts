import posthog from 'posthog-js'

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST

let isInitialized = false

// Danh sách các trang học tập quan trọng cần ghi hình Session Replay
const IMPORTANT_LEARNING_PATHS = [
  '/exam',
  '/practice',
  '/vocabulary',
  '/course',
  '/dictation',
  '/ai-tutor',
  '/lessons',
  '/challenge',
]

export function initPostHog(): void {
  if (typeof window === 'undefined') return
  if (isInitialized) return

  if (POSTHOG_KEY) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: 'identified_only',
      capture_pageview: false, // Handled manually by Next.js router
      capture_pageleave: true,
      autocapture: true,
      session_recording: {
        // 1. Bảo vệ mật khẩu học viên
        maskAllInputs: false,
        maskInputOptions: {
          password: true,
        },
        // 2. Bỏ qua các phiên dưới 5 giây (học viên vừa mở lên rồi tắt ngay)
        // @ts-expect-error PostHog session recording config option
        minimum_duration_milliseconds: 5000,
        // 3. Che các trường nhạy cảm có class mask-private
        maskTextSelector: '.mask-private',
      },
      loaded: () => {
        if (process.env.NODE_ENV === 'development') {
          console.log('🚀 [PostHog] Initialized for LingoSphere Staging with Smart Session Filters')
        }
      },
    })
    isInitialized = true
  }
}

export function identifyUser(user: {
  id?: string
  _id?: string
  email?: string
  full_name?: string
  name?: string
  role?: string
}): void {
  if (typeof window === 'undefined' || !posthog) return
  const userId = user.id || user._id
  if (!userId) return

  posthog.identify(userId, {
    email: user.email,
    name: user.full_name || user.name,
    role: user.role || 'LEARNER',
    app_platform: 'web',
  })
}

export function resetUser(): void {
  if (typeof window === 'undefined' || !posthog) return
  posthog.reset()
}

export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !posthog) return
  posthog.capture(eventName, properties)
}

export function trackPageView(url: string): void {
  if (typeof window === 'undefined' || !posthog) return
  posthog.capture('$pageview', {
    $current_url: url,
  })

  // Kiểm tra nếu là trang học tập quan trọng (TOEIC, Luyện Nghe, Từ vựng SRS, Khóa học)
  const isImportantPage = IMPORTANT_LEARNING_PATHS.some((path) => url.toLowerCase().includes(path))
  if (isImportantPage && typeof posthog.startSessionRecording === 'function') {
    posthog.startSessionRecording()
  }
}

// 🎯 Bắt lỗi & Kích hoạt ghi hình khi học viên gặp sự cố (Error-triggered Recording)
export function trackError(errorName: string, errorDetail?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !posthog) return
  posthog.capture('$exception', {
    error_name: errorName,
    ...errorDetail,
    occurred_at: new Date().toISOString(),
  })

  // Tự động kích hoạt ghi hình khi có lỗi phát sinh
  if (typeof posthog.startSessionRecording === 'function') {
    posthog.startSessionRecording()
  }
}

// 🎯 LingoSphere Domain Specific Tracking Helpers
export const Analytics = {
  examSubmitted: (data: {
    examId: string
    examTitle?: string
    totalScore?: number
    listeningScore?: number
    readingScore?: number
    durationSeconds?: number
    mode?: string
  }) => {
    trackEvent('exam_submitted', data)
  },

  vocabSessionCompleted: (data: {
    deckId?: string
    deckName?: string
    cardsReviewed: number
    accuracyRate?: number
    durationSeconds?: number
  }) => {
    trackEvent('vocab_session_completed', data)
  },

  lessonStarted: (data: {
    courseId: string
    courseTitle?: string
    lessonId: string
    lessonTitle?: string
  }) => {
    trackEvent('lesson_started', data)
  },

  aiTutorAsked: (data: {
    topic?: string
    messageLength?: number
    responseTimeMs?: number
  }) => {
    trackEvent('ai_tutor_asked', data)
  },

  dictationCompleted: (data: {
    audioId?: string
    accuracyPercentage?: number
    wordCount?: number
    mistakesCount?: number
  }) => {
    trackEvent('dictation_completed', data)
  },

  errorOccurred: (errorName: string, detail?: Record<string, unknown>) => {
    trackError(errorName, detail)
  },
}

export default posthog
