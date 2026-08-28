import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import vi from '@/i18n/vi.json'
import en from '@/i18n/en.json'

const resources = {
  vi: { translation: vi },
  en: { translation: en },
}

if (!i18n.isInitialized) {
  const isBrowser = typeof window !== 'undefined'
  
  if (isBrowser) {
    i18n.use(LanguageDetector)
  }

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: isBrowser ? (localStorage.getItem('i18nextLng') || 'vi') : 'vi',
      fallbackLng: 'vi',
      supportedLngs: ['vi', 'en'],
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
      },
    })
}

export default i18n

export const changeLanguage = (lang: 'vi' | 'en') => {
  i18n.changeLanguage(lang)
  if (typeof window !== 'undefined') {
    localStorage.setItem('i18nextLng', lang)
  }
}

export const getCurrentLanguage = (): 'vi' | 'en' => {
  return (i18n.language || 'vi') as 'vi' | 'en'
}
