// Custom hook for language management
import { useTranslation } from 'react-i18next'
import { useCallback } from 'react'

export type Language = 'vi' | 'en'

export function useLanguage() {
  const { i18n, t } = useTranslation()
  const currentLanguage = (i18n.language || 'vi') as Language

  const changeLanguage = useCallback(
    (lang: Language) => {
      i18n.changeLanguage(lang)
      localStorage.setItem('i18nextLng', lang)
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
