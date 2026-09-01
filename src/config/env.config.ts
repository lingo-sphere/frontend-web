/**
 * @file env.config.ts
 * @description Mã nguồn thành phần env.config.ts
 */

export const ENV_CONFIG = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://lingosphere.edu.vn',
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'LingoSphere',
  DEFAULT_LANG: process.env.NEXT_PUBLIC_DEFAULT_LANG || 'vi',
  IS_PROD: process.env.NODE_ENV === 'production',
} as const
