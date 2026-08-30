import posthog from 'posthog-js'

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY

export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST

let isInitialized = false

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
        maskAllInputs: false,
        maskInputOptions: {
          password: true,
        },
      },
      loaded: () => {
        if (process.env.NODE_ENV === 'development') {
          console.log('🚀 [PostHog] Initialized for LingoSphere Staging')
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
}

export default posthog
