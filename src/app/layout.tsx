/**
 * @file layout.tsx
 * @description Trang giao diện người dùng (Next.js App Router) cho tuyến layout.tsx
 */

import type { Metadata, Viewport } from 'next'
import { Inter, Newsreader } from 'next/font/google'
import './globals.css'
import { AppClientProvider } from '@/components/providers/app.client.provider'
import { PostHogProvider } from '@/components/providers/posthog.provider'

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
  display: 'swap',
})

const newsreader = Newsreader({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-serif',
  style: ['normal', 'italic'],
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#2F7F78',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: {
    template: '%s | LingoSphere - Học Tiếng Anh & Luyện Thi TOEIC',
    default: 'LingoSphere - Nền Tảng Học Tiếng Anh & Luyện Thi TOEIC Chuẩn Quốc Tế',
  },
  description:
    'Luyện thi TOEIC 7 Part, học từ vựng Spaced Repetition SRS, luyện nghe Dictation, phát âm Whisper AI và gia sư AI thông minh.',
  keywords: [
    'TOEIC online',
    'Luyện thi TOEIC',
    'ETS 2024',
    'Học từ vựng tiếng Anh',
    'Spaced Repetition SRS',
    'Luyện nghe chép chính tả',
    'Dictation',
    'AI Tutor',
    'LingoSphere',
  ],
  authors: [{ name: 'LingoSphere Education' }],
  creator: 'LingoSphere',
  publisher: 'LingoSphere',
  metadataBase: new URL('https://lingosphere.edu.vn'),
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://lingosphere.edu.vn',
    siteName: 'LingoSphere',
    title: 'LingoSphere - Nền Tảng Học Tiếng Anh & Luyện Thi TOEIC Chuẩn Quốc Tế',
    description:
      'Luyện thi TOEIC 7 Part chuẩn ETS, học 3000 từ vựng cốt lõi theo phương pháp lặp lại ngắt quãng SRS, luyện nghe Dictation và chấm điểm phát âm AI.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LingoSphere - Nền Tảng Học Tiếng Anh & Luyện Thi TOEIC Chuẩn Quốc Tế',
    description:
      'Luyện thi TOEIC 7 Part chuẩn ETS, học từ vựng SRS, nghe chép chính tả Dictation và gia sư AI.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className={`${inter.variable} ${newsreader.variable} h-full antialiased`} data-theme="light" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <PostHogProvider>
          <AppClientProvider>{children}</AppClientProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
