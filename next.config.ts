import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.r2.dev' },
      { protocol: 'https', hostname: 'assets.lingosphere.io.vn' },
      { protocol: 'https', hostname: 'cdn.lingosphere.io.vn' },
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
