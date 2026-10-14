// Cấu hình quốc tế hóa i18next (Tiếng Việt và Tiếng Anh) cho frontend-web
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import vi from '@/i18n/vi.json'
import en from '@/i18n/en.json'

const resources = {
  vi: { translation: vi },
  en: { translation: en },
}

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: 'vi',
      fallbackLng: 'vi',
      supportedLngs: ['vi', 'en'],
      interpolation: {
        escapeValue: false,
      },
    })
}

export default i18n

export const initClientLanguage = () => {
  if (typeof window === 'undefined') return
  const raw = storage.get<string>(STORAGE_KEYS.I18N_LNG)
  if (raw) {
    const lang = raw.toLowerCase().startsWith('en') ? 'en' : 'vi'
    if (lang !== i18n.language) {
      i18n.changeLanguage(lang)
    }
  }
}

export const changeLanguage = (lang: 'vi' | 'en') => {
  i18n.changeLanguage(lang)
  storage.set(STORAGE_KEYS.I18N_LNG, lang)
}

export const getCurrentLanguage = (): 'vi' | 'en' => {
  return (i18n.language || 'vi') as 'vi' | 'en'
}
