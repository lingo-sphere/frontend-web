// Store quan ly trang thai trinh phat mini player bai giang toan cuc.
'use client'

import { useSyncExternalStore } from 'react'
import type { Lesson } from '@/features/courses/types/course'

export interface CourseMiniPlayerData {
  isOpen: boolean
  lesson: Lesson | null
  courseId: string
  courseTitle: string
  courseThumbnail: string
  effectiveVideoUrl: string
  currentTime: number
  duration: number
  isPlaying: boolean
  volume: number
  isMuted: boolean
  hasNextLesson: boolean
  hasPrevLesson: boolean
}

export interface CourseMiniPlayerStoreState extends CourseMiniPlayerData {
  openMiniPlayer: (data: Partial<CourseMiniPlayerData> & { lesson: Lesson; courseId: string }) => void
  closeMiniPlayer: () => void
  setIsPlaying: (isPlaying: boolean) => void
  setCurrentTime: (currentTime: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  setIsMuted: (isMuted: boolean) => void
  updatePlayback: (data: Partial<CourseMiniPlayerData>) => void
}

const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

const defaultState: CourseMiniPlayerData = {
  isOpen: false,
  lesson: null,
  courseId: '',
  courseTitle: '',
  courseThumbnail: '',
  effectiveVideoUrl: '',
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  volume: 1,
  isMuted: false,
  hasNextLesson: false,
  hasPrevLesson: false,
}

let state: CourseMiniPlayerStoreState = {
  ...defaultState,
  openMiniPlayer: (data) => {
    state = {
      ...state,
      ...data,
      isOpen: true,
    }
    notifyListeners()
  },
  closeMiniPlayer: () => {
    state = {
      ...state,
      isOpen: false,
      isPlaying: false,
    }
    notifyListeners()
  },
  setIsPlaying: (isPlaying) => {
    state = { ...state, isPlaying }
    notifyListeners()
  },
  setCurrentTime: (currentTime) => {
    state = { ...state, currentTime }
    notifyListeners()
  },
  setDuration: (duration) => {
    state = { ...state, duration }
    notifyListeners()
  },
  setVolume: (volume) => {
    state = { ...state, volume, isMuted: volume === 0 }
    notifyListeners()
  },
  setIsMuted: (isMuted) => {
    state = { ...state, isMuted }
    notifyListeners()
  },
  updatePlayback: (data) => {
    state = { ...state, ...data }
    notifyListeners()
  },
}

export const courseMiniPlayerStore = {
  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  getState: (): CourseMiniPlayerStoreState => state,
  getInitialState: (): CourseMiniPlayerStoreState => state,
}

export function useCourseMiniPlayerStore(): CourseMiniPlayerStoreState
export function useCourseMiniPlayerStore<T>(selector: (state: CourseMiniPlayerStoreState) => T): T
export function useCourseMiniPlayerStore<T>(
  selector?: (state: CourseMiniPlayerStoreState) => T
): T | CourseMiniPlayerStoreState {
  return useSyncExternalStore(
    courseMiniPlayerStore.subscribe,
    () => (selector ? selector(state) : state),
    () => (selector ? selector(state) : state)
  )
}
