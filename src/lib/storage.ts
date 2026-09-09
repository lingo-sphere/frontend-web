// Tiện ích quản lý lưu trữ cục bộ, phiên và cookie chuẩn hóa cho web
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'lingosphere_user_access_token',
  REFRESH_TOKEN: 'lingosphere_user_refresh_token',
  USER: 'lingosphere_user_info',
  THEME: 'lingosphere-web-theme',
  PLACEMENT_SCORE: 'lingo_user_placement_score',
  PROFILE_STATS: 'lingo_cached_profile_stats',
  LANGUAGE: 'i18nextLng',
  I18N_LNG: 'i18nextLng',
  LANDING_LANG: 'lingosphere_landing_lang',
  USER_NOTES: 'lingosphere_user_notes',
  USER_PREFERENCES: 'lingosphere_user_preferences',
  WISHLIST: 'lingosphere-user-wishlist',
  BANNER_DISMISSED: 'course_schedule_banner_dismissed_until',
  PENDING_ORDER: 'lingo_payment_pending_order',
  COURSE_LAST_WATCHED: (courseId: string) => `course_last_watched_${courseId}`,
} as const

interface CookieOptions {
  days?: number
  path?: string
  sameSite?: 'Lax' | 'Strict' | 'None'
  secure?: boolean
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function parseValue<T>(raw: string | null, fallback?: T): T | null {
  if (raw === null || raw === undefined) {
    return fallback !== undefined ? fallback : null
  }
  try {
    return JSON.parse(raw) as T
  } catch {
    return raw as unknown as T
  }
}

function serializeValue<T>(value: T): string {
  if (typeof value === 'string') {
    return value
  }
  return JSON.stringify(value)
}

const cookieUtil = {
  get(name: string): string | null {
    if (typeof document === 'undefined') return null
    const match = document.cookie.match(new RegExp(`(^|;\\s*)${encodeURIComponent(name)}=([^;]*)`))
    return match ? decodeURIComponent(match[2]) : null
  },

  set(name: string, value: string, options?: CookieOptions): void {
    if (typeof document === 'undefined') return
    const path = options?.path || '/'
    let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=${path}`
    if (options?.days) {
      const date = new Date()
      date.setTime(date.getTime() + options.days * 24 * 60 * 60 * 1000)
      cookieStr += `; expires=${date.toUTCString()}`
    }
    if (options?.sameSite) {
      cookieStr += `; samesite=${options.sameSite}`
    }
    if (options?.secure) {
      cookieStr += '; secure'
    }
    document.cookie = cookieStr
  },

  remove(name: string, path: string = '/'): void {
    if (typeof document === 'undefined') return
    document.cookie = `${encodeURIComponent(name)}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  },
}

const sessionUtil = {
  get<T>(key: string, fallback?: T): T | null {
    if (!isBrowser() || typeof window.sessionStorage === 'undefined') {
      return fallback !== undefined ? fallback : null
    }
    try {
      const item = window.sessionStorage.getItem(key)
      return parseValue<T>(item, fallback)
    } catch {
      return fallback !== undefined ? fallback : null
    }
  },

  set<T>(key: string, value: T): void {
    if (!isBrowser() || typeof window.sessionStorage === 'undefined') return
    try {
      window.sessionStorage.setItem(key, serializeValue(value))
    } catch {}
  },

  remove(key: string): void {
    if (!isBrowser() || typeof window.sessionStorage === 'undefined') return
    try {
      window.sessionStorage.removeItem(key)
    } catch {}
  },

  has(key: string): boolean {
    if (!isBrowser() || typeof window.sessionStorage === 'undefined') return false
    try {
      return window.sessionStorage.getItem(key) !== null
    } catch {
      return false
    }
  },

  clear(): void {
    if (!isBrowser() || typeof window.sessionStorage === 'undefined') return
    try {
      window.sessionStorage.clear()
    } catch {}
  },
}

export const storage = {
  get<T>(key: string, fallback?: T): T | null {
    if (!isBrowser()) {
      return fallback !== undefined ? fallback : null
    }
    try {
      const item = window.localStorage.getItem(key)
      return parseValue<T>(item, fallback)
    } catch {
      return fallback !== undefined ? fallback : null
    }
  },

  set<T>(key: string, value: T): void {
    if (!isBrowser()) return
    try {
      window.localStorage.setItem(key, serializeValue(value))
    } catch {}
  },

  remove(key: string): void {
    if (!isBrowser()) return
    try {
      window.localStorage.removeItem(key)
    } catch {}
  },

  has(key: string): boolean {
    if (!isBrowser()) return false
    try {
      return window.localStorage.getItem(key) !== null
    } catch {
      return false
    }
  },

  clear(): void {
    if (!isBrowser()) return
    try {
      window.localStorage.clear()
    } catch {}
  },

  session: sessionUtil,
  cookie: cookieUtil,
}
