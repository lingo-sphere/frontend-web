'use client'

import { useState, useEffect } from 'react'
import { useNavigate } from '@/lib/navigation'
import { useTranslation } from 'react-i18next'
import { BookOpen, Layers3, Star, Globe, Info, Plus, Users, GraduationCap, Bookmark, HelpCircle } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/dashboard/SectionHeading'
import { Icon } from '@/components/icons/icon-map'
import { useDashboardStore } from '@/store/dashboard-store'
import { vocabularyService } from '@/services/vocabulary.service'
import type { Deck } from '@/types/api.types'
import { vocabularyStats, vocabularyStatus, commonPacks, oxfordPacks, vocabularyTagFilters, userDecks } from '@/data/vocabulary-data'
import type { VocabularyPack, UserDeck } from '@/types/vocabulary'

interface VocabularyPageProps {
  onAction: (message: string) => void
}

export function VocabularyPage({ onAction }: VocabularyPageProps) {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const navigate = useNavigate()
  const setActiveNavItem = useDashboardStore((state) => state.setActiveNavItem)
  const [activeTag, setActiveTag] = useState('all')
  const [liveDecks, setLiveDecks] = useState<UserDeck[]>(userDecks)

  useEffect(() => {
    let isMounted = true
    const fetchVocabularyData = async () => {
      try {
        const decks = await vocabularyService.getPublicDecks()
        if (isMounted && Array.isArray(decks) && decks.length > 0) {
          const mapped: UserDeck[] = decks.map((d, idx) => ({
            id: d.id || d._id || `deck-${idx}`,
            title: d.title,
            cardCount: d.total_cards || 20,
            createdAt: new Date().toISOString(),
            description: d.description,
            cefrLevel: d.cefr_level || 'A2',
          }))
          setLiveDecks(mapped)
        }
      } catch {
        // Fallback to userDecks
      }
    }
    fetchVocabularyData()
    return () => {
      isMounted = false
    }
  }, [])

  const filteredCommonPacks = activeTag === 'all'
    ? commonPacks
    : commonPacks.filter(p => p.tags.includes(activeTag))

  const filteredOxfordPacks = activeTag === 'all'
    ? oxfordPacks
    : oxfordPacks.filter(p => p.tags.includes(activeTag))

  const statusLabels = {
    learning: { vi: 'Đang học', en: 'Learning' },
    reviewing: { vi: 'Đang ôn', en: 'Reviewing' },
    mastered: { vi: 'Đã thành thạo', en: 'Mastered' },
    total: { vi: 'Tổng', en: 'Total' },
  }

  const statusData = [
    { label: statusLabels.learning[isVietnamese ? 'vi' : 'en'], value: vocabularyStatus.learning, color: 'bg-info' },
    { label: statusLabels.reviewing[isVietnamese ? 'vi' : 'en'], value: vocabularyStatus.reviewing, color: 'bg-primary' },
    { label: statusLabels.mastered[isVietnamese ? 'vi' : 'en'], value: vocabularyStatus.mastered, color: 'bg-success' },
    { label: statusLabels.total[isVietnamese ? 'vi' : 'en'], value: vocabularyStatus.totalCards, color: 'bg-red-500' },
  ]

  const reviewStats = [
    { label: { vi: 'Cần ôn', en: 'Due' }, value: vocabularyStats.due, color: 'bg-info' },
    { label: { vi: 'Yếu', en: 'Weak' }, value: vocabularyStats.weak, color: 'bg-warning' },
  ]

  const handleDeckClick = (deck: UserDeck) => {
    setActiveNavItem('vocabulary')
    navigate(`/vocabulary/learn/${deck.id}`)
    onAction(`Starting learning with deck "${deck.title}"`)
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <img
              src="/assets/capybara-mascot.png"
              alt="LingoSphere Mascot"
              className="h-14 w-14 rounded-2xl object-contain"
            />
            <div>
              <SectionHeading
                eyebrow={t('vocabulary.title')}
                title={isVietnamese ? 'Học từ vựng tiếng Anh' : 'Learn English Vocabulary'}
                description={isVietnamese ? 'Làm chủ từ vựng với hệ thống spaced repetition' : "Master English vocabulary with LingoSphere's spaced repetition system"}
              />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            className="gap-2 bg-primary hover:bg-primary-hover"
            onClick={() => {
              setActiveNavItem('vocabulary')
              navigate('/vocabulary/notebook')
            }}
          >
            <Bookmark size={16} />
            {isVietnamese ? 'Từ đã lưu' : 'Saved Vocabulary'}
          </Button>
          <button
            className="flex h-9 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-[12px] font-semibold text-text-secondary hover:bg-surface-hover"
            onClick={() => onAction(isVietnamese ? 'Đang mở hướng dẫn Spaced Repetition' : 'Opening Spaced Repetition guide')}
          >
            <HelpCircle size={14} />
            {isVietnamese ? 'Spaced Repetition là gì?' : 'What is Spaced Repetition?'}
          </button>
        </div>
      </div>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">

        <Card className="dashboard-card">
          <CardContent className="p-4">
            <h3 className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-text-primary">
              <Icon name="book" className="text-primary" size={18} />
              {isVietnamese ? 'Thống kê học tập' : 'Learning Statistics'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <StatItem icon="book" label={isVietnamese ? 'Tổng thẻ' : 'Total Cards'} value={vocabularyStats.totalCards} />
              <StatItem icon="refresh" label={isVietnamese ? 'Tổng ôn' : 'Total Reviews'} value={vocabularyStats.totalReviews} />
              <StatItem icon="clock" label={isVietnamese ? 'Cần ôn' : 'Due'} value={vocabularyStats.due} />
              <StatItem icon="award" label={t('dashboard.accuracy')} value={`${vocabularyStats.accuracy}%`} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {reviewStats.map((stat, idx) => (
                <button
                  key={idx}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl ${stat.color} px-4 py-3 text-white transition-all hover:opacity-90`}
                  onClick={() => {
                    setActiveNavItem('vocabulary')
                    navigate('/vocabulary/learn')
                  }}
                >
                  <span className="text-[18px] font-bold">{stat.value}</span>
                  <span className="text-[11px] font-medium">{stat.label[isVietnamese ? 'vi' : 'en']}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="flex h-full flex-col justify-between p-4">
            <h3 className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-text-primary">
              <Icon name="chart" className="text-info" size={18} />
              {isVietnamese ? 'Trạng thái từ vựng' : 'Vocabulary Status'}
            </h3>

            <div className="flex flex-1 items-end justify-around gap-3 pt-4">
              {statusData.map((item, idx) => {
                const maxVal = Math.max(...statusData.map(d => d.value || 10), 10)
                const heightPercent = Math.max((item.value / maxVal) * 100, 5)

                return (
                  <div key={idx} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-[14px] font-bold text-text-primary">{item.value}</span>
                    <div className="relative w-full overflow-hidden rounded-t-lg bg-surface-subtle" style={{ height: '120px' }}>
                      <div
                        className={`absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-700 ${item.color}`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[12px] font-medium text-text-secondary">{item.label}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">

        <div className="flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-[16px] font-semibold text-text-primary">
              <Icon name="cards" className="text-primary" size={18} />
              {isVietnamese ? 'BỘ THẺ CỦA TÔI' : 'MY DECKS'}
            </h3>
            <p className="mt-0.5 text-[12px] text-text-secondary">
              {isVietnamese ? 'Free user ·' : 'Free user ·'} {userDecks.length}/3 {isVietnamese ? 'decks ·' : 'decks ·'} max 500 {isVietnamese ? 'thẻ' : 'cards'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover">
              <Info size={16} />
            </button>
            <Button size="sm" className="gap-1 bg-primary hover:bg-primary-hover">
              <Plus size={14} />
              {isVietnamese ? 'Tạo deck' : 'Create Deck'}
            </Button>
          </div>
        </div>

        {userDecks.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {userDecks.map((deck) => (
              <Card
                key={deck.id}
                className="dashboard-card cursor-pointer overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg"
                onClick={() => handleDeckClick(deck)}
              >
                <div className="flex h-24 w-full items-center justify-center bg-gradient-to-br from-primary/80 to-primary">
                  <Layers3 className="text-white/60" size={36} />
                </div>
                <CardContent className="p-4">
                  <h4 className="text-[15px] font-semibold text-text-primary">{deck.title}</h4>
                  <p className="mt-1 text-[12px] text-text-secondary">{deck.cardCount} {isVietnamese ? 'từ' : 'words'}</p>
                  <Button
                    size="sm"
                    className="mt-3 w-full bg-primary hover:bg-primary-hover"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeckClick(deck)
                    }}
                  >
                    {isVietnamese ? 'Bắt đầu' : 'Start'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-12">
            <BookOpen className="mb-3 text-text-tertiary" size={48} />
            <h4 className="text-[15px] font-semibold text-text-primary">{isVietnamese ? 'Chưa có deck nào' : 'No decks yet'}</h4>
            <p className="mt-1 text-[13px] text-text-secondary">{isVietnamese ? 'Tạo deck đầu tiên để bắt đầu' : 'Create your first deck to start managing your vocabulary'}</p>
            <Button className="mt-4 gap-1 bg-primary hover:bg-primary-hover">
              <Plus size={14} />
              {isVietnamese ? 'Tạo deck đầu tiên' : 'Create First Deck'}
            </Button>
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Card className="dashboard-card cursor-pointer transition-all hover:-translate-y-0.5" onClick={() => {
              setActiveNavItem('topics')
              navigate('/topics')
            }}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-warning/10">
                <Star className="text-warning" size={24} />
              </div>
              <div className="flex-1">
                <h4 className="text-[14px] font-semibold text-text-primary">{isVietnamese ? 'CHỦ ĐỀ PHỔ BIẾN' : 'POPULAR TOPICS'}</h4>
                <p className="mt-0.5 text-[12px] text-text-secondary">{isVietnamese ? 'Khám phá các chủ đề phổ biến' : 'Explore the most popular topics'}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="dashboard-card cursor-pointer transition-all hover:-translate-y-0.5" onClick={() => {
              setActiveNavItem('public-decks')
              navigate('/public-decks')
            }}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-info/10">
                <Globe className="text-info" size={24} />
              </div>
              <div className="flex-1">
                <h4 className="text-[14px] font-semibold text-text-primary">{isVietnamese ? 'DECK CỘNG ĐỒNG' : 'COMMUNITY DECKS'}</h4>
                <p className="mt-0.5 text-[12px] text-text-secondary">{isVietnamese ? 'Khám phá deck từ cộng đồng' : 'Discover shared vocabulary decks from the community'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-8">
        <h3 className="mb-4 flex items-center gap-2 text-[16px] font-semibold text-text-primary">
          <GraduationCap className="text-primary" size={20} />
          {isVietnamese ? 'BỘ TỪ VỰNG PHỔ BIẾN' : 'COMMON VOCABULARY PACKS'}
        </h3>

        <div className="mb-4 flex flex-wrap gap-2">
          {vocabularyTagFilters.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
                activeTag === tag
                  ? 'bg-primary text-white'
                  : 'bg-surface-subtle text-text-secondary hover:bg-surface-hover'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {filteredCommonPacks.length > 0 && (
          <div className="mb-6">
            <h4 className="mb-3 text-[13px] font-semibold text-text-secondary">
              {isVietnamese ? 'Từ vựng tiếng Anh phổ biến' : 'Common English Vocabulary'} ({filteredCommonPacks.length} packs)
            </h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCommonPacks.map((pack) => (
                <PackCard key={pack.id} pack={pack} onAction={onAction} isVietnamese={isVietnamese} />
              ))}
            </div>
          </div>
        )}

        {filteredOxfordPacks.length > 0 && (
          <div>
            <h4 className="mb-3 text-[13px] font-semibold text-text-secondary">
              {isVietnamese ? 'Từ vựng Oxford' : 'Oxford Vocabulary'} ({filteredOxfordPacks.length} packs)
            </h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredOxfordPacks.map((pack) => (
                <PackCard key={pack.id} pack={pack} onAction={onAction} isVietnamese={isVietnamese} />
              ))}
            </div>
          </div>
        )}

        {filteredCommonPacks.length === 0 && filteredOxfordPacks.length === 0 && (
          <div className="mt-8 text-center">
            <p className="text-[14px] text-text-secondary">{isVietnamese ? 'Không tìm thấy pack nào cho' : 'No vocabulary packs found for'} "#{activeTag}"</p>
          </div>
        )}
      </section>
    </main>
  )
}

function StatItem({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="flex flex-col">
      <span className="text-[20px] font-bold text-text-primary">{value}</span>
      <span className="flex items-center gap-1 text-[11px] text-text-secondary">
        <Icon name={icon} size={12} />
        {label}
      </span>
    </div>
  )
}

function PackCard({ pack, onAction, isVietnamese }: { pack: VocabularyPack; onAction: (message: string) => void; isVietnamese: boolean }) {
  return (
    <Card className="dashboard-card cursor-pointer overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg" onClick={() => onAction(`Opening "${pack.title}"`)}>

      <div
        className="flex h-24 w-full items-center justify-center"
        style={{ backgroundColor: pack.coverColor }}
      >
        <Layers3 className="text-white/60" size={36} />
      </div>
      <CardContent className="p-3">
        <h4 className="text-[14px] font-semibold text-text-primary line-clamp-1">{pack.title}</h4>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[12px] text-text-secondary">{pack.wordCount} {isVietnamese ? 'từ' : 'words'}</span>
          <span className="flex items-center gap-1 text-[12px] text-text-secondary">
            <Users size={12} />
            {pack.studentCount.toLocaleString()}
          </span>
        </div>
        <Button
          size="sm"
          className="mt-3 w-full bg-primary hover:bg-primary-hover"
          onClick={(e) => {
            e.stopPropagation()
            onAction(`Starting "${pack.title}"`)
          }}
        >
          {isVietnamese ? 'Bắt đầu học' : 'Start Learning'}
        </Button>
      </CardContent>
    </Card>
  )
}
