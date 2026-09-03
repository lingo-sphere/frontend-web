'use client'

/**
 * @file page.tsx
 * @description Trang giao diện người dùng (Next.js App Router) cho tuyến (study)/vocabulary
 */

import { useState, useEffect } from 'react'
import { useNavigate } from '@/lib/navigation'
import { useTranslation } from 'react-i18next'
import { BookOpen, Layers3, Star, Globe, Info, Plus, Users, GraduationCap, Bookmark, HelpCircle } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/dashboard/section.heading'
import { Icon } from '@/components/icons/icon-map'
import { useDashboardStore } from '@/store/dashboard-store'
import { useApp } from '@/contexts/app.context'
import { vocabularyService } from '@/services/vocabulary.service'
import type { Deck } from '@/types/api.types'

export default function VocabularyAppPage() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const navigate = useNavigate()
  const { showAction } = useApp()
  const setActiveNavItem = useDashboardStore((state) => state.setActiveNavItem)
  const [activeTag, setActiveTag] = useState('all')
  const [publicDecks, setPublicDecks] = useState<Deck[]>([])
  const [myDecks, setMyDecks] = useState<Deck[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchVocabularyData = async () => {
      try {
        setIsLoading(true)
        const [pubDecks, myEnrollments] = await Promise.all([
          vocabularyService.getPublicDecks(),
          vocabularyService.getMyEnrollments().catch(() => []),
        ])
        if (isMounted) {
          if (Array.isArray(pubDecks)) setPublicDecks(pubDecks)
          if (Array.isArray(myEnrollments)) setMyDecks(myEnrollments)
        }
      } catch (err) {
        console.error('Error loading vocabulary data:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    fetchVocabularyData()
    return () => {
      isMounted = false
    }
  }, [])

  const tags = ['all', 'TOEIC', 'General', 'Business', 'Communication', 'Basic']

  const filteredPacks = publicDecks.filter((d: any) => {
    if (activeTag === 'all') return true
    const deckTags = d.tags || []
    return deckTags.some((t: string) => t.toLowerCase() === activeTag.toLowerCase()) ||
      (d.category && d.category.toLowerCase() === activeTag.toLowerCase())
  })

  const totalCards = publicDecks.reduce((sum: number, d: any) => sum + (d.card_count || d.total_cards || 0), 0)

  const handleDeckClick = (deck: Deck) => {
    setActiveNavItem('vocabulary')
    navigate(`/vocabulary/learn/${deck.id || deck._id}`)
    showAction(`Bắt đầu học bộ thẻ "${deck.title || (deck as any).name}"`)
  }

  return (
    <>
      <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
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
                  description={isVietnamese ? 'Làm chủ từ vựng với hệ thống Spaced Repetition SRS' : "Master English vocabulary with LingoSphere's Spaced Repetition System"}
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
              onClick={() => showAction(isVietnamese ? 'Spaced Repetition (SM-2): Thuật toán lặp lại ngắt quãng tối ưu trí nhớ' : 'Spaced Repetition SM-2 Algorithm')}
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
                <StatItem icon="book" label={isVietnamese ? 'Tổng thẻ' : 'Total Cards'} value={totalCards} />
                <StatItem icon="refresh" label={isVietnamese ? 'Bộ thẻ công khai' : 'Public Decks'} value={publicDecks.length} />
                <StatItem icon="clock" label={isVietnamese ? 'Bộ thẻ của tôi' : 'My Enrolled'} value={myDecks.length} />
                <StatItem icon="award" label={t('dashboard.accuracy')} value="100%" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  className="flex flex-col items-center justify-center gap-1 rounded-xl bg-primary px-4 py-3 text-white transition-all hover:opacity-90"
                  onClick={() => {
                    setActiveNavItem('vocabulary')
                    navigate('/vocabulary/learn')
                  }}
                >
                  <span className="text-[18px] font-bold">{publicDecks.length}</span>
                  <span className="text-[11px] font-medium">{isVietnamese ? 'Bắt đầu học ngay' : 'Learn Now'}</span>
                </button>
                <button
                  className="flex flex-col items-center justify-center gap-1 rounded-xl bg-info px-4 py-3 text-white transition-all hover:opacity-90"
                  onClick={() => {
                    setActiveNavItem('vocabulary')
                    navigate('/public-decks')
                  }}
                >
                  <span className="text-[18px] font-bold">{totalCards}</span>
                  <span className="text-[11px] font-medium">{isVietnamese ? 'Khám phá thẻ từ' : 'Explore Decks'}</span>
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="flex h-full flex-col justify-between p-4">
              <h3 className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-text-primary">
                <Icon name="chart" className="text-info" size={18} />
                {isVietnamese ? 'Trạng thái bộ thẻ' : 'Deck Overview'}
              </h3>

              <div className="flex flex-1 items-end justify-around gap-3 pt-4">
                {[
                  { label: isVietnamese ? 'Công khai' : 'Public', value: publicDecks.length, color: 'bg-primary' },
                  { label: isVietnamese ? 'Đã lưu' : 'Enrolled', value: myDecks.length, color: 'bg-success' },
                  { label: isVietnamese ? 'Tổng thẻ' : 'Cards', value: totalCards, color: 'bg-info' },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-[14px] font-bold text-text-primary">{item.value}</span>
                    <div className="relative w-full overflow-hidden rounded-t-lg bg-surface-subtle" style={{ height: '120px' }}>
                      <div
                        className={`absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-700 ${item.color}`}
                        style={{ height: `${Math.min(Math.max((item.value / Math.max(totalCards, 1)) * 100, 15), 100)}%` }}
                      />
                    </div>
                    <span className="text-[12px] font-medium text-text-secondary">{item.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-[16px] font-semibold text-text-primary">
                <Icon name="cards" className="text-primary" size={18} />
                {isVietnamese ? 'BỘ THẺ NỔI BẬT' : 'FEATURED DECKS'}
              </h3>
              <p className="mt-0.5 text-[12px] text-text-secondary">
                {publicDecks.length} {isVietnamese ? 'bộ thẻ khả dụng' : 'available decks'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover">
                <Info size={16} />
              </button>
              <Button
                size="sm"
                className="gap-1 bg-primary hover:bg-primary-hover"
                onClick={() => navigate('/vocabulary/learn')}
              >
                <Plus size={14} />
                {isVietnamese ? 'Học ngay' : 'Learn Now'}
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="mt-6 flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : publicDecks.length > 0 ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {publicDecks.map((deck: any, idx) => (
                <Card
                  key={deck.id || deck._id || idx}
                  className="dashboard-card cursor-pointer overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  onClick={() => handleDeckClick(deck)}
                >
                  <div
                    className="flex h-24 w-full items-center justify-center"
                    style={{ backgroundColor: ['#6b5ce7', '#00b894', '#0984e3'][idx % 3] }}
                  >
                    <Layers3 className="text-white/60" size={36} />
                  </div>
                  <CardContent className="p-4">
                    <h4 className="text-[15px] font-semibold text-text-primary">{deck.title || deck.name}</h4>
                    <p className="mt-1 text-[12px] text-text-secondary line-clamp-2">{deck.description || deck.description_vi}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[12px] text-text-tertiary">{deck.card_count || deck.total_cards || 0} {isVietnamese ? 'từ' : 'words'}</span>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary-hover"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeckClick(deck)
                        }}
                      >
                        {isVietnamese ? 'Bắt đầu' : 'Start'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-12">
              <BookOpen className="mb-3 text-text-tertiary" size={48} />
              <h4 className="text-[15px] font-semibold text-text-primary">{isVietnamese ? 'Chưa có bộ thẻ nào' : 'No decks yet'}</h4>
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
                  <h4 className="text-[14px] font-semibold text-text-primary">{isVietnamese ? 'CHỦ ĐỀ TỪ VỰNG' : 'VOCABULARY TOPICS'}</h4>
                  <p className="mt-0.5 text-[12px] text-text-secondary">{isVietnamese ? 'Khám phá các chủ đề từ vựng đa dạng' : 'Explore diverse vocabulary topics'}</p>
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
                  <p className="mt-0.5 text-[12px] text-text-secondary">{isVietnamese ? 'Khám phá bộ thẻ từ cộng đồng' : 'Discover shared vocabulary decks'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-8">
          <h3 className="mb-4 flex items-center gap-2 text-[16px] font-semibold text-text-primary">
            <GraduationCap className="text-primary" size={20} />
            {isVietnamese ? 'DANH SÁCH BỘ THẺ' : 'ALL VOCABULARY DECKS'}
          </h3>

          <div className="mb-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
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

          {filteredPacks.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPacks.map((pack: any, idx) => (
                <Card
                  key={pack.id || pack._id || idx}
                  className="dashboard-card cursor-pointer overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  onClick={() => handleDeckClick(pack)}
                >
                  <div
                    className="flex h-24 w-full items-center justify-center"
                    style={{ backgroundColor: ['#6b5ce7', '#00b894', '#0984e3', '#fdcb6e'][idx % 4] }}
                  >
                    <Layers3 className="text-white/60" size={36} />
                  </div>
                  <CardContent className="p-3">
                    <h4 className="text-[14px] font-semibold text-text-primary line-clamp-1">{pack.title || pack.name}</h4>
                    <p className="mt-1 text-[12px] text-text-secondary line-clamp-2">{pack.description || pack.description_vi}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[12px] text-text-secondary">{pack.card_count || pack.total_cards || 0} {isVietnamese ? 'từ' : 'words'}</span>
                      <span className="flex items-center gap-1 text-[12px] text-text-secondary">
                        <Users size={12} />
                        {(pack.total_users || 0).toLocaleString()}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      className="mt-3 w-full bg-primary hover:bg-primary-hover"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeckClick(pack)
                      }}
                    >
                      {isVietnamese ? 'Bắt đầu học' : 'Start Learning'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="mt-8 text-center">
              <p className="text-[14px] text-text-secondary">{isVietnamese ? 'Không tìm thấy bộ thẻ nào cho' : 'No vocabulary decks found for'} "#{activeTag}"</p>
            </div>
          )}
        </section>
      </main>
    </>
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
