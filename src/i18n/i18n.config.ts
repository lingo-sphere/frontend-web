// Cấu hình quốc tế hóa i18next (Tiếng Việt và Tiếng Anh) cho frontend-web
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { storage, STORAGE_KEYS } from '@/lib/storage'
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
      lng: storage.get<string>(STORAGE_KEYS.I18N_LNG) || 'vi',
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
  storage.set(STORAGE_KEYS.I18N_LNG, lang)
}

export const getCurrentLanguage = (): 'vi' | 'en' => {
  return (i18n.language || 'vi') as 'vi' | 'en'
}
