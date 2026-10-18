// Cấu hình định danh, tên miền chuẩn hóa và thông tin SEO mặc định cho toàn bộ LingoSphere Web
export const SITE_CONFIG = {
  name: 'LingoSphere',
  title: 'LingoSphere - Nền Tảng Học Tiếng Anh & Luyện Thi TOEIC Chuẩn Quốc Tế',
  titleTemplate: '%s | LingoSphere',
  description:
    'Luyện thi TOEIC 7 Part chuẩn ETS, học 3000 từ vựng Spaced Repetition SRS, luyện nghe Dictation, phát âm Whisper AI và gia sư AI thông minh.',
  domain: 'lingosphere.online',
  url: process.env.NEXT_PUBLIC_APP_URL ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '') : 'https://lingosphere.online',
  ogImage: '/og-image.png',
  locale: 'vi_VN',
  author: 'LingoSphere Education',
  creator: 'LingoSphere',
  publisher: 'LingoSphere',
  keywords: [
    'TOEIC online',
    'Luyện thi TOEIC',
    'ETS 2024',
    'Học từ vựng tiếng Anh',
    'Spaced Repetition SRS',
    'Luyện nghe chép chính tả',
    'Dictation',
    'Gia sư AI',
    'LingoSphere',
    'TOEIC 450',
    'TOEIC 650',
    'TOEIC 850',
  ],
}

export function absoluteUrl(path = ''): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${SITE_CONFIG.url}${cleanPath}`
}
