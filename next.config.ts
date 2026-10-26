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
    ]
  },
}

export default nextConfig
