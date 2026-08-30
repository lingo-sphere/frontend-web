export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  TIMEOUT: 120000,
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'lingosphere_user_access_token',
    REFRESH_TOKEN: 'lingosphere_user_refresh_token',
    USER: 'lingosphere_user_info',
    THEME: 'lingosphere-web-theme',
  },
  ENDPOINTS: {

    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      VERIFY_EMAIL_OTP: '/auth/verify-email-otp',
      VERIFY_EMAIL_TOKEN: '/auth/verify-email-token',
      RESEND_VERIFICATION_OTP: '/auth/resend-verification-otp',
      REFRESH_TOKEN: '/auth/refresh-token',
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
      CHANGE_PASSWORD: (userId: string) => `/auth/change-password/${userId}`,
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      SOCIAL_LOGIN: '/auth/social-login',
    },

    USERS: {
      PROFILE: '/users/profile',
      PROFILE_BY_ID: (userId: string) => `/users/profile/${userId}`,
      SETTINGS: '/users/settings',
      GAMIFICATION: '/users/gamification',
      LEADERBOARD: '/users/gamification/leaderboard',
      XP_LOGS: '/users/gamification/xp-logs',
      ACHIEVEMENTS: '/users/achievements',
      MY_SUBSCRIPTION: '/users/subscriptions/my',
    },

    COURSES: {
      LIST: '/courses',
      RECOMMENDATIONS: '/courses/recommendations',
      BY_ID: (id: string) => `/courses/${id}`,
      CHAPTERS: (courseId: string) => `/courses/${courseId}/chapters`,
      LESSONS: (chapterId: string) => `/courses/chapters/${chapterId}/lessons`,
      LESSON_BY_ID: (lessonId: string) => `/courses/lessons/${lessonId}`,
      ENROLL: (courseId: string) => `/courses/${courseId}/enroll`,
      MY_ENROLLED: '/courses/my/enrolled',
    },

    VOCABULARY: {
      ITEMS: '/vocabulary/items',
      ITEM_BY_ID: (id: string) => `/vocabulary/items/${id}`,
      DECKS: '/vocabulary/decks',
      DECK_BY_ID: (id: string) => `/vocabulary/decks/${id}`,
      PUBLIC_DECKS: '/vocabulary/decks/public',
      REVIEW_SESSION: (deckId: string) => `/vocabulary/decks/${deckId}/review-session`,
      SUBMIT_REVIEW: '/vocabulary/reviews/submit',
      NOTEBOOK: '/vocabulary/notebook',
      NOTEBOOK_SAVE: '/vocabulary/notebook/save',
    },

    EXAMS: {
      LIST: '/exams',
      BY_ID: (id: string) => `/exams/${id}`,
      QUESTIONS: (examId: string) => `/exams/${examId}/questions`,
      SUBMIT: '/exams/submit',
      HISTORY: '/exams/my/history',
      RESULT: (submissionId: string) => `/exams/results/${submissionId}`,
    },

    PRACTICE: {
      LISTENING: '/practice/listening/exercises',
      LISTENING_BY_ID: (id: string) => `/practice/listening/exercises/${id}`,
      SPEAKING: '/practice/speaking/exercises',
      SPEAKING_BY_ID: (id: string) => `/practice/speaking/exercises/${id}`,
      SPEAKING_EVALUATE: '/practice/speaking/evaluate',
      WRITING: '/practice/writing/exercises',
      WRITING_BY_ID: (id: string) => `/practice/writing/exercises/${id}`,
      WRITING_EVALUATE: '/practice/writing/evaluate',
      DAILY_PROMPT: '/practice/writing/journal/daily-prompt',
    },

    AI: {
      CHAT: '/ai/chat',
      EXPLAIN_QUESTION: '/ai/explain-question',
      GENERATE: '/ai/generate',
      IMPROVE_WRITING: '/ai/improve-writing',
    },

    NOTIFICATIONS: {
      MY: '/notifications/my',
      MARK_READ: (id: string) => `/notifications/${id}/read`,
      MARK_ALL_READ: '/notifications/my/read-all',
      PREFERENCES: '/notifications/preferences/my',
    },

    COMMUNITY: {
      POSTS: '/community/posts',
      POST_BY_ID: (id: string) => `/community/posts/${id}`,
      COMMENTS: (postId: string) => `/community/posts/${postId}/comments`,
      LIKE: (postId: string) => `/community/posts/${postId}/like`,
    },
  },
}
