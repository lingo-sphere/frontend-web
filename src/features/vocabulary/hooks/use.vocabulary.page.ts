// Hook quản lý dữ liệu thẻ từ vựng công khai và cá nhân bằng TanStack Query.
'use client'

import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from '@/lib/navigation'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useApp } from '@/contexts/app.context'
import { useAuthStore } from '@/features/auth/store/auth.store'
import {
  usePublicDecksQuery,
  useMyVocabularyEnrollmentsQuery,
  useTopicsQuery,
} from '@/features/vocabulary/hooks/use.vocabulary.query'
import { vocabularyService } from '@/features/vocabulary/services/vocabulary.service'
import { vocabularyKeys } from '@/features/vocabulary/keys/vocabulary.keys'
import type { Deck, BackendTopic } from '@/features/vocabulary/schemas/vocabulary.schema'

export const TARGET_BANDS = [
  { value: 'all', label: 'Tất cả Band', labelEn: 'All Bands' },
  { value: '350-500', label: 'Band 350 - 500', labelEn: 'Band 350 - 500' },
  { value: '500-650', label: 'Band 500 - 650', labelEn: 'Band 500 - 650' },
  { value: '650-800', label: 'Band 650 - 800', labelEn: 'Band 650 - 800' },
  { value: '800-990', label: 'Band 800 - 990', labelEn: 'Band 800 - 990' },
]

export function useVocabularyPage() {
  const navigate = useNavigate()
  const searchParams = useSearchParams()
  const { showAction } = useApp()
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [activeTag, setActiveTag] = useState('all')
  const [activeBand, setActiveBand] = useState('all')
  const [activeTopic, setActiveTopic] = useState('all')

  // Query cài đặt học tập từ server (MongoDB + Redis Cache)
  const { data: serverSettings } = useQuery({
    queryKey: ['vocabulary', 'settings'],
    queryFn: () => vocabularyService.getLearningSettings(),
    staleTime: 5 * 60 * 1000,
  })

  // Query tiến độ học hôm nay từ Redis Real-time Counter
  const { data: serverDailyProgress } = useQuery({
    queryKey: ['vocabulary', 'daily-progress'],
    queryFn: () => vocabularyService.getDailyProgress(),
    staleTime: 20 * 1000,
  })

  // Mục tiêu từ vựng mỗi ngày do user chọn động (Mặc định 20, tối đa 20, lưu Cloud DB + Redis + localStorage)
  const [dailyGoal, setDailyGoal] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lingosphere_vocab_daily_goal')
      if (saved) {
        const val = parseInt(saved, 10)
        if (!isNaN(val) && val >= 5 && val <= 20) return val
      }
    }
    return 20
  })

  // Đồng bộ khi có dữ liệu từ server (MongoDB + Redis)
  useEffect(() => {
    const remoteGoal = serverSettings?.daily_new_cards_limit ?? serverSettings?.daily_goal
    if (typeof remoteGoal === 'number' && remoteGoal >= 5 && remoteGoal <= 20) {
      setDailyGoal(remoteGoal)
      if (typeof window !== 'undefined') {
        localStorage.setItem('lingosphere_vocab_daily_goal', String(remoteGoal))
      }
    }
  }, [serverSettings])

  const handleUpdateDailyGoal = async (val: number) => {
    const safeVal = Math.min(Math.max(val, 5), 20) // Tối đa 20 từ/ngày
    setDailyGoal(safeVal)
    if (typeof window !== 'undefined') {
      localStorage.setItem('lingosphere_vocab_daily_goal', String(safeVal))
    }

    // Lưu vào Backend (MongoDB + Redis Cache O(1))
    try {
      await vocabularyService.updateLearningSettings({
        daily_goal: safeVal,
        daily_new_cards_limit: safeVal,
      })
    } catch {
      // Offline hoặc guest mode
    }

    showAction(isVietnamese ? `Đã lưu mục tiêu ${safeVal} từ/ngày vào hệ thống` : `Saved daily goal of ${safeVal} words/day to cloud`)
  }

  // Lắng nghe URL params (ví dụ: ?topic=... hoặc ?band=...)
  useEffect(() => {
    const paramBand = searchParams.get('band')
    const paramTopic = searchParams.get('topic')
    const paramPart = searchParams.get('part')
    if (paramBand) setActiveBand(paramBand)
    if (paramTopic) setActiveTopic(paramTopic)
    if (paramPart) setActiveTag(paramPart)
  }, [searchParams])

  const { user: currentUser } = useAuthStore()
  const { data: publicDecks = [], isLoading: isPublicLoading } = usePublicDecksQuery()
  const { data: myEnrollments = [], isLoading: isMyLoading } = useMyVocabularyEnrollmentsQuery()
  const { data: topics = [] } = useTopicsQuery()
  const isLoading = isPublicLoading || isMyLoading

  // Bộ thẻ của tôi: Bao gồm các bộ thẻ đã ghi danh và bộ thẻ do chính mình tạo (kể cả khi chưa enroll)
  const myDecks = useMemo(() => {
    const list = [...myEnrollments]
    const existingIds = new Set(
      list.map((d: Deck) => String(d._id || d.id || (d as any).deck_id?._id || (d as any).deck_id))
    )

    const currentUserId = (currentUser as any)?.user_id || (currentUser as any)?.id

    if (currentUserId && Array.isArray(publicDecks)) {
      for (const d of publicDecks) {
        const dCreatorId = (d as any).creator_id || (d as any).user_id
        const deckId = String(d._id || d.id || '')
        if (dCreatorId === currentUserId && deckId && !existingIds.has(deckId)) {
          list.unshift(d)
          existingIds.add(deckId)
        }
      }
    }

    return list
  }, [myEnrollments, publicDecks, currentUser])

  // Map topic_id -> topic object để tra cứu tên/thông tin topic của deck
  const topicMap = useMemo(() => {
    const map = new Map<string, BackendTopic>()
    for (const t of topics) {
      if (t._id) map.set(String(t._id), t)
      if (t.slug) map.set(t.slug, t)
    }
    return map
  }, [topics])

  // Lọc ra các Topic thực sự có Deck thuộc về
  const availableTopics = useMemo(() => {
    const usedTopicIds = new Set<string>()
    for (const d of publicDecks) {
      if (d.topic_id) usedTopicIds.add(String(d.topic_id))
    }
    return topics.filter((t) => usedTopicIds.has(String(t._id)))
  }, [publicDecks, topics])

  // Query tổng số từ vựng người dùng đã lưu vào Sổ tay
  const { data: savedVocabData } = useQuery({
    queryKey: ['vocabulary', 'saved', 'count'],
    queryFn: async () => {
      try {
        const res = await vocabularyService.getSavedVocabulary({ page: 1, limit: 1 })
        return res?.pagination?.total ?? 0
      } catch {
        return 0
      }
    },
    staleTime: 60 * 1000,
  })
  const savedCount = typeof savedVocabData === 'number' ? savedVocabData : 0

  // Query tóm tắt từ sai (Quota & Active count)
  const { data: wrongWordsData } = useQuery({
    queryKey: ['vocabulary', 'wrong-words', 'summary'],
    queryFn: async () => {
      try {
        const res = await vocabularyService.getWrongWords({ status: 'ACTIVE', page: 1, limit: 1 })
        return {
          total: res?.pagination?.total ?? 0,
          quotaUsed: res?.pagination?.quota_used ?? 0,
          maxQuota: res?.pagination?.max_quota ?? 100,
        }
      } catch {
        return { total: 0, quotaUsed: 0, maxQuota: 100 }
      }
    },
    staleTime: 30 * 1000,
  })
  const wrongWordsSummary = wrongWordsData || { total: 0, quotaUsed: 0, maxQuota: 100 }

  // Query tiến độ học từ vựng cá nhân
  const { data: vocabProgressData } = useQuery({
    queryKey: ['vocabulary', 'progress', 'my'],
    queryFn: async () => {
      try {
        const res = await vocabularyService.getMyVocabProgress()
        return Array.isArray(res) ? res : []
      } catch {
        return []
      }
    },
    staleTime: 60 * 1000,
  })

  // Thống kê SRS: Đang học - Cần ôn - Thành thạo - Tổng từ vựng & Tổng số lần ôn tập (100% dữ liệu thật)
  const masteryStats = useMemo(() => {
    const list = Array.isArray(vocabProgressData) ? vocabProgressData : []
    let newLearnedCount = 0
    let learningCount = 0
    let dueCount = 0
    let masteredCount = 0
    let totalReviews = 0
    let totalCorrectReviews = 0

    const now = Date.now()

    for (const item of list) {
      const it = item as Record<string, unknown>
      const status = String(it.status || '').toUpperCase()
      const revCount = Number(it.review_count || it.total_reviews || 0)
      const correctCount = Number(it.correct_count || 0)
      const rawDate = it.due_at || it.next_review_at
      const nextReviewAt = rawDate ? new Date(String(rawDate)).getTime() : 0

      totalReviews += revCount
      totalCorrectReviews += correctCount

      // Kiểm tra xem từ có thực sự đến hạn cần ôn hay không
      const isDue = nextReviewAt > 0 && nextReviewAt <= now

      if (isDue) {
        dueCount++
      }

      if (status === 'MASTERED') {
        masteredCount++
      } else if (status === 'NEW' || revCount === 0) {
        newLearnedCount++
      } else {
        // Đang học / đang củng cố
        learningCount++
      }
    }

    // Tổng từ vựng trong kho
    const totalWords = list.length

    // Dữ liệu từ Redis bộ đếm hôm nay
    const wordsReviewedToday = serverDailyProgress?.words_reviewed_today ?? 0
    const activeStudySeconds = Number((serverDailyProgress as any)?.study_time_seconds || 0)

    // Tổng số lần ôn tập thật sự từ DB và Redis
    const actualTotalReviews = Math.max(totalReviews, wordsReviewedToday)

    // Độ chính xác thật sự (%)
    let reviewAccuracy = 0
    if (serverDailyProgress && serverDailyProgress.words_reviewed_today > 0) {
      reviewAccuracy = serverDailyProgress.accuracy_today
    } else if (totalReviews > 0) {
      reviewAccuracy = Math.round((totalCorrectReviews / totalReviews) * 100)
    }

    return {
      newLearnedCount,   // Mới học
      learningCount,     // Đang nhớ / củng cố
      dueCount,          // Cần ôn
      masteredCount,     // Thành thạo
      totalWords,        // Tổng từ thật
      totalLearned: learningCount + masteredCount,
      totalReviews: actualTotalReviews,
      reviewAccuracy,
      wordsReviewedToday,
      activeStudySeconds,
    }
  }, [vocabProgressData, savedCount, serverDailyProgress])

  // Phân loại Deck của hệ thống (TOEIC Official) và Deck do cộng đồng người dùng chia sẻ (User Public Decks)
  const systemDecks = useMemo(() => {
    return publicDecks.filter((d: Deck) => d.creator_type !== 'USER')
  }, [publicDecks])

  const communityDecks = useMemo(() => {
    return publicDecks.filter((d: Deck) => d.creator_type === 'USER')
  }, [publicDecks])

  // Lọc đa chiều cho bộ thẻ hệ thống: activeBand + activeTopic + activeTag
  const filteredPacks = useMemo(() => {
    return systemDecks.filter((d: Deck) => {
      // 1. Lọc theo Target Band
      if (activeBand !== 'all') {
        const deckBand = d.settings?.target_band
        if (deckBand !== activeBand) return false
      }

      // 2. Lọc theo Chủ đề (Topic)
      if (activeTopic !== 'all') {
        const deckTopicId = String(d.topic_id || '')
        if (deckTopicId !== activeTopic) return false
      }

      // 3. Lọc theo Part / Tag
      if (activeTag !== 'all') {
        const deckTags = d.tags || []
        const deckPart = d.settings?.exam_part
        const matchTag =
          deckTags.some((t: string) => t.toLowerCase() === activeTag.toLowerCase()) ||
          (d.category && d.category.toLowerCase() === activeTag.toLowerCase()) ||
          (deckPart && deckPart.toLowerCase() === activeTag.toLowerCase())

        if (!matchTag) return false
      }

      return true
    })
  }, [systemDecks, activeBand, activeTopic, activeTag])

  const totalCards = publicDecks.reduce(
    (sum: number, d: Deck) => sum + (d.card_count || 0),
    0
  )

  const handleDeckClick = (deck: Deck) => {
    const rawDeck = deck as any
    const deckId = deck._id || deck.id || rawDeck.deck_id?._id || rawDeck.deck_id
    if (!deckId) return

    // Tự động lưu về "Bộ thẻ của tôi" khi ấn vào học (dù là bộ thẻ hệ thống hay cộng đồng)
    const deckIdStr = String(deckId)
    if (!enrolledDeckIdSet.has(deckIdStr)) {
      vocabularyService.enrollDeck(deckIdStr).then(() => {
        queryClient.invalidateQueries({ queryKey: vocabularyKeys.all })
      }).catch(() => {})
    }

    navigate(`/vocabulary/learn/${deckId}`)
    showAction(
      isVietnamese
        ? `Bắt đầu học bộ thẻ "${deck.name || rawDeck.title || ''}"`
        : `Starting study session for "${deck.name || rawDeck.title || ''}"`
    )
  }

  const queryClient = useQueryClient()

  // Tập hợp ID các bộ thẻ đã lưu để kiểm tra nhanh O(1)
  const enrolledDeckIdSet = useMemo(() => {
    return new Set(myDecks.map((d: Deck) => String(d._id || d.id || (d as any).deck_id?._id || (d as any).deck_id)))
  }, [myDecks])

  // Trạng thái khi chính chủ muốn chuyển sang Riêng tư mà đã có người lưu
  const [pendingPrivacyDeck, setPendingPrivacyDeck] = useState<{
    deck: Deck
    saversCount: number
  } | null>(null)

  const [savingDeckId, setSavingDeckId] = useState<string | null>(null)

  // Lưu một bộ thẻ từ kho cộng đồng về "Bộ thẻ của tôi"
  const handleEnrollCommunityDeck = async (deck: Deck) => {
    const rawDeck = deck as any
    const deckId = deck._id || deck.id || rawDeck.deck_id?._id || rawDeck.deck_id
    if (!deckId) return

    try {
      setSavingDeckId(deckId)
      await vocabularyService.enrollDeck(deckId)
      await queryClient.invalidateQueries({ queryKey: vocabularyKeys.all })
      showAction(
        isVietnamese
          ? `🎉 Đã lưu bộ thẻ "${deck.name || rawDeck.title}" về Bộ thẻ của tôi!`
          : `🎉 Saved deck "${deck.name || rawDeck.title}" to My Decks!`
      )
    } catch (err) {
      console.error('Lỗi lưu bộ thẻ cộng đồng:', err)
      showAction(
        isVietnamese
          ? 'Không thể lưu bộ thẻ. Vui lòng thử lại!'
          : 'Failed to save deck. Try again!'
      )
    } finally {
      setSavingDeckId(null)
    }
  }

  const executeChangeVisibility = async (deck: Deck, targetVis: 'PUBLIC' | 'PRIVATE') => {
    const rawDeck = deck as any
    const deckId = deck._id || deck.id || rawDeck.deck_id?._id || rawDeck.deck_id
    if (!deckId) return

    try {
      await vocabularyService.updateDeck(deckId, { visibility: targetVis })
      // Đồng bộ lại tất cả queries từ vựng (cả bộ thẻ của tôi & kho cộng đồng)
      await queryClient.invalidateQueries({ queryKey: vocabularyKeys.all })

      showAction(
        isVietnamese
          ? `Đã chuyển bộ thẻ "${deck.name || rawDeck.title}" sang chế độ ${targetVis === 'PUBLIC' ? 'Công khai (Public)' : 'Riêng tư (Private)'}`
          : `Updated deck "${deck.name || rawDeck.title}" visibility to ${targetVis}`
      )
    } catch (err) {
      console.error('Lỗi cập nhật quyền riêng tư:', err)
      showAction(
        isVietnamese
          ? 'Không thể cập nhật quyền riêng tư. Vui lòng thử lại!'
          : 'Failed to update visibility. Try again!'
      )
    }
  }

  const handleToggleVisibility = async (deck: Deck) => {
    const rawDeck = deck as any
    const deckId = deck._id || deck.id || rawDeck.deck_id?._id || rawDeck.deck_id
    if (!deckId) return

    const currentVis = (deck.visibility || 'PRIVATE').toUpperCase()

    // Nếu đang là PUBLIC và muốn chuyển sang PRIVATE, kiểm tra xem có ai đang lưu không
    if (currentVis === 'PUBLIC') {
      try {
        const res = await vocabularyService.getDeckSaversCount(deckId)
        const saversCount = res?.savers_count ?? 0
        if (saversCount > 0) {
          setPendingPrivacyDeck({ deck, saversCount })
          return
        }
      } catch (err) {
        console.error('Lỗi kiểm tra số người lưu:', err)
      }
    }

    // Nếu chuyển sang PUBLIC hoặc không có ai lưu, cập nhật trực tiếp
    await executeChangeVisibility(deck, currentVis === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC')
  }

  const confirmSwitchToPrivate = async () => {
    if (!pendingPrivacyDeck) return
    const targetDeck = pendingPrivacyDeck.deck
    setPendingPrivacyDeck(null)
    await executeChangeVisibility(targetDeck, 'PRIVATE')
  }

  const cancelSwitchToPrivate = () => {
    setPendingPrivacyDeck(null)
  }

  const handleCopyShareLink = (deck: Deck) => {
    const rawDeck = deck as any
    const deckId = deck._id || deck.id || rawDeck.deck_id?._id || rawDeck.deck_id
    if (!deckId) return

    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/vocabulary/learn/${deckId}`
    navigator.clipboard.writeText(url)
    showAction(
      isVietnamese
        ? `Đã sao chép liên kết bộ thẻ "${deck.name || rawDeck.title}"! Bạn có thể gửi link cho mọi người để cùng học.`
        : `Copied share link for "${deck.name || rawDeck.title}" to clipboard!`
    )
  }

  return {
    publicDecks,
    systemDecks,
    communityDecks,
    myDecks,
    isLoading,
    activeTag,
    setActiveTag,
    activeBand,
    setActiveBand,
    activeTopic,
    setActiveTopic,
    targetBands: TARGET_BANDS,
    availableTopics,
    topicMap,
    filteredPacks,
    totalCards,
    handleDeckClick,
    handleToggleVisibility,
    handleCopyShareLink,
    currentUser,
    enrolledDeckIdSet,
    savingDeckId,
    handleEnrollCommunityDeck,
    pendingPrivacyDeck,
    confirmSwitchToPrivate,
    cancelSwitchToPrivate,
    savedCount,
    wrongWordsSummary,
    masteryStats,
    dailyGoal,
    setDailyGoal: handleUpdateDailyGoal,
    dailyProgress: serverDailyProgress,
  }
}
