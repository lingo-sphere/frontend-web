// Bố cục gốc ứng dụng Web cung cấp Font, PostHog, QueryProvider và AppClientProvider.
import type { Metadata, Viewport } from 'next'
import { Inter, Newsreader } from 'next/font/google'
import '@/app/globals.css'
import { AppClientProvider } from '@/providers/app.client.provider'
import { PostHogProvider } from '@/providers/posthog.provider'
import { QueryProvider } from '@/providers/query.provider'

import { SITE_CONFIG } from '@/config/site.config'

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
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    template: `%s | ${SITE_CONFIG.name} - Học Tiếng Anh & Luyện Thi TOEIC`,
    default: SITE_CONFIG.title,
  },
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords,
  authors: [{ name: SITE_CONFIG.author, url: SITE_CONFIG.url }],
  creator: SITE_CONFIG.creator,
  publisher: SITE_CONFIG.publisher,
  alternates: {
    canonical: './',
  },
  openGraph: {
    type: 'website',
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [
      {
        url: `${SITE_CONFIG.url}/og-image.png`,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.title,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [`${SITE_CONFIG.url}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
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
          <QueryProvider>
            <AppClientProvider>{children}</AppClientProvider>
          </QueryProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
