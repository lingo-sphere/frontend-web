// Cấu hình Next.js cho frontend-web hỗ trợ remote patterns và rewrites tới API Gateway.
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.r2.dev' },
      { protocol: 'https', hostname: 'assets.lingosphere.online' },
      { protocol: 'https', hostname: 'cdn.lingosphere.online' },
    ],
  },
  async rewrites() {
    const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    if (!rawApiBaseUrl) return []
    const apiBaseUrl = rawApiBaseUrl.replace(/\/+$/, '')
    return [
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/api/:path*`,
      },
      {
        source: '/media/:path*',
        destination: `${apiBaseUrl}/media/:path*`,
      },
    ]
  },
}

export default nextConfig
