
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import vi from './vi.json'
import en from './en.json'

const resources = {
  vi: { translation: vi },
  en: { translation: en },
}

i18n
  .use(LanguageDetector) 
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi', // Default language
    supportedLngs: ['vi', 'en'],
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {

      order: ['localStorage', 'navigator', 'htmlTag'],

      caches: ['localStorage'],
    },
  })

export default i18n

export const changeLanguage = (lang: 'vi' | 'en') => {
  i18n.changeLanguage(lang)
  localStorage.setItem('i18nextLng', lang)
}

export const getCurrentLanguage = (): 'vi' | 'en' => {
  return (i18n.language || 'vi') as 'vi' | 'en'
}
