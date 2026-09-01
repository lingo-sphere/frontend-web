/**
 * @file robots.ts
 * @description Trang giao diện người dùng (Next.js App Router) cho tuyến robots.ts
 */

import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://lingosphere.edu.vn'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/settings', '/profile', '/verify-email', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
