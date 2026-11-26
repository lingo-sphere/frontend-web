// Quản lý trạng thái và danh sách phát của trình phát mini player bài giảng toàn cục.
'use client'

import { useSyncExternalStore } from 'react'
import type { Lesson } from '@/features/courses/types/course'

export interface CourseMiniPlayerPlaylistItem {
  id: string
  title: string
  videoUrl: string
  duration?: number
  thumbnail?: string
  chapterTitle?: string
}

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
  playlist: CourseMiniPlayerPlaylistItem[]
  currentLessonIndex: number
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
  nextLesson: () => void
  prevLesson: () => void
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
  playlist: [],
  currentLessonIndex: 0,
}

let state: CourseMiniPlayerStoreState = {
  ...defaultState,
  openMiniPlayer: (data) => {
    const playlist = data.playlist ?? state.playlist
    const currentLessonIndex =
      data.currentLessonIndex !== undefined
        ? data.currentLessonIndex
        : playlist.findIndex((item) => item.id === data.lesson.id)
    const validIndex = currentLessonIndex >= 0 ? currentLessonIndex : 0
    state = {
      ...state,
      ...data,
      playlist,
      currentLessonIndex: validIndex,
      hasNextLesson:
        data.hasNextLesson !== undefined
          ? data.hasNextLesson
          : validIndex < playlist.length - 1,
      hasPrevLesson:
        data.hasPrevLesson !== undefined ? data.hasPrevLesson : validIndex > 0,
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
  nextLesson: () => {
    const { playlist, currentLessonIndex, lesson } = state
    if (!playlist || playlist.length === 0) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lingosphere:course-next-lesson'))
      }
      return
    }
    const nextIdx = currentLessonIndex + 1
    if (nextIdx < playlist.length) {
      const nextItem = playlist[nextIdx]
      const updatedLesson = {
        ...(lesson || {}),
        id: nextItem.id,
        title: nextItem.title,
        videoUrl: nextItem.videoUrl,
        duration: nextItem.duration || 0,
      } as Lesson
      state = {
        ...state,
        currentLessonIndex: nextIdx,
        lesson: updatedLesson,
        effectiveVideoUrl: nextItem.videoUrl,
        currentTime: 0,
        duration: nextItem.duration || 0,
        isPlaying: true,
        hasNextLesson: nextIdx < playlist.length - 1,
        hasPrevLesson: nextIdx > 0,
      }
      notifyListeners()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('lingosphere:course-next-lesson', {
            detail: { lessonId: nextItem.id },
          })
        )
      }
    }
  },
  prevLesson: () => {
    const { playlist, currentLessonIndex, lesson } = state
    if (!playlist || playlist.length === 0) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lingosphere:course-prev-lesson'))
      }
      return
    }
    const prevIdx = currentLessonIndex - 1
    if (prevIdx >= 0) {
      const prevItem = playlist[prevIdx]
      const updatedLesson = {
        ...(lesson || {}),
        id: prevItem.id,
        title: prevItem.title,
        videoUrl: prevItem.videoUrl,
        duration: prevItem.duration || 0,
      } as Lesson
      state = {
        ...state,
        currentLessonIndex: prevIdx,
        lesson: updatedLesson,
        effectiveVideoUrl: prevItem.videoUrl,
        currentTime: 0,
        duration: prevItem.duration || 0,
        isPlaying: true,
        hasNextLesson: prevIdx < playlist.length - 1,
        hasPrevLesson: prevIdx > 0,
      }
      notifyListeners()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('lingosphere:course-prev-lesson', {
            detail: { lessonId: prevItem.id },
          })
        )
      }
    }
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
