// Updated: 2026-08-20
// Practice hub page - tổng hợp các bài luyện tập:
// - Knowledge: Grammar, IPA
// - Skills: Listening, Speaking, Writing
// - Exam: TOEIC

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeading } from '@/components/dashboard/SectionHeading'
import { Icon } from '@/components/icons/icon-map'
import { PRACTICE_CATEGORIES } from '@/config/practice.config'

interface PracticeHubProps {
  onAction: (message: string) => void
}

export function PracticeHub({ onAction }: PracticeHubProps) {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const navigate = useNavigate()

  const handleItemClick = (itemId: string, label: string) => {
    switch (itemId) {
      case 'ipa':
        navigate('/ipa')
        break
      case 'grammar':
        navigate('/grammar')
        break
      case 'listening':
        navigate('/listening')
        break
      case 'speaking':
        navigate('/speaking')
        break
      case 'writing':
        navigate('/writing')
        break
      case 'toeic':
        navigate('/toeic')
        break
      default:
        onAction(`${isVietnamese ? 'Đã mở' : 'Opened'} ${label}`)
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <SectionHeading
        eyebrow={t('practice.title')}
        title={isVietnamese ? 'Luyện tập' : 'Practice'}
        description={isVietnamese ? 'Chọn hoạt động luyện tập' : 'Choose a practice activity'}
      />

      <div className="mt-6 space-y-8">
        {PRACTICE_CATEGORIES.map((category) => (
          <section key={category.title}>
            <h3 className="mb-4 text-[14px] font-semibold uppercase tracking-wide text-text-tertiary">
              {isVietnamese && category.titleVi ? category.titleVi : category.title}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.items.map((item) => (
                <Card
                  key={item.id}
                  className="dashboard-card cursor-pointer transition-all hover:-translate-y-0.5 hover:bg-surface-hover"
                  onClick={() => handleItemClick(item.id, isVietnamese && item.labelVi ? item.labelVi : item.label)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.bgColor}`}
                    >
                      <Icon className={item.color} name={item.icon} size={24} />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-semibold text-text-primary">
                        {isVietnamese && item.labelVi ? item.labelVi : item.label}
                      </h4>
                      <p className="text-[12px] text-text-secondary">
                        {isVietnamese && item.descriptionVi ? item.descriptionVi : item.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
