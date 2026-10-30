// Cấu hình SDK PostHog, tracking sự kiện học tập và quản lý phiên người dùng cho học viên.
import posthog from 'posthog-js'

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST

let isInitialized = false

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
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: true,
      session_recording: {
        maskAllInputs: true,
        maskInputOptions: {
          password: true,
        },
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
  user_id?: string
  id?: string
  _id?: string
  email?: string
  full_name?: string
  role?: string
}): void {
  if (typeof window === 'undefined' || !posthog) return
  const userId = user.user_id
  if (!userId) return

  posthog.identify(userId, {
    email: user.email,
    name: user.full_name || '',
    role: user.role || 'STUDENT',
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

  const isImportantPage = IMPORTANT_LEARNING_PATHS.some((path) => url.toLowerCase().includes(path))
  if (isImportantPage && typeof posthog.startSessionRecording === 'function') {
    posthog.startSessionRecording()
  }
}

export function trackError(errorName: string, errorDetail?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !posthog) return
  posthog.capture('$exception', {
    error_name: errorName,
    ...errorDetail,
    occurred_at: new Date().toISOString(),
  })

  if (typeof posthog.startSessionRecording === 'function') {
    posthog.startSessionRecording()
  }
}

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

  checkoutStarted: (data: {
    planId: string
    planName?: string
  }) => {
    trackEvent('checkout_started', data)
  },

  paymentSucceeded: (data: {
    orderCode?: string | number
    amount?: number
    planId?: string
  }) => {
    trackEvent('payment_succeeded', data)
  },

  paymentFailed: (data: {
    orderCode?: string | number
    reason?: string
  }) => {
    trackEvent('payment_failed', data)
  },

  userLoggedIn: (data: {
    method: string
  }) => {
    trackEvent('user_logged_in', data)
  },

  userRegistered: (data: {
    method: string
  }) => {
    trackEvent('user_registered', data)
  },
}

export default posthog
