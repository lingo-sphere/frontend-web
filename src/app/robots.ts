// Cấu hình quy tắc thu thập dữ liệu robots.txt cho công cụ tìm kiếm
import type { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/config/site.config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/cart',
        '/settings',
        '/profile',
        '/progress',
        '/notes',
        '/notifications',
        '/exam-history',
        '/verify-email',
        '/forbidden',
        '/api/',
      ],
    },
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  }
}
