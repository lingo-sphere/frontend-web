// Hook quản lý trạng thái và chức năng chuyển đổi ngôn ngữ ứng dụng.

import { useTranslation } from 'react-i18next'
import { useCallback } from 'react'
import { storage, STORAGE_KEYS } from '@/lib/storage'

export type Language = 'vi' | 'en'

export function useLanguage() {
  const { i18n, t } = useTranslation()
  const currentLanguage = ((i18n.language || 'vi').toLowerCase().startsWith('en') ? 'en' : 'vi') as Language

  const changeLanguage = useCallback(
    (lang: Language) => {
      i18n.changeLanguage(lang)
      storage.set(STORAGE_KEYS.I18N_LNG, lang)
    },
    [i18n]
  )

  const toggleLanguage = useCallback(() => {
    const newLang = currentLanguage === 'vi' ? 'en' : 'vi'
    changeLanguage(newLang)
  }, [currentLanguage, changeLanguage])

  const isVietnamese = currentLanguage === 'vi'
  const isEnglish = currentLanguage === 'en'

  return {
    currentLanguage,
    changeLanguage,
    toggleLanguage,
    isVietnamese,
    isEnglish,
    t,
  }
}
