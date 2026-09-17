// Trang hiển thị lỗi hệ thống toàn cục hỗ trợ đa ngôn ngữ cho học viên
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/button'
import { Icon } from '@/components/icon.map'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useTranslation()

  useEffect(() => {
    console.error('Unhandled Next.js client error:', error)
  }, [error])

  return (
    <>
      <main className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-error/15 text-error shadow-inner">
          <Icon name="alertTriangle" size={40} />
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl">
          {t('errors.serverErrorTitle')}
        </h1>
        <p className="mt-2.5 max-w-md text-sm text-text-secondary">
          {t('errors.serverErrorDesc')}
        </p>

        {error.digest && (
          <p className="mt-2 font-mono text-xs text-text-tertiary">
            {t('common.error')}: {error.digest}
          </p>
        )}

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            className="gap-2 bg-primary px-5 font-semibold text-white shadow-md hover:bg-primary/90 cursor-pointer"
          >
            <Icon name="rotateCcw" size={16} />
            {t('common.retry')}
          </Button>
          <Link href="/home">
            <Button variant="outline" className="gap-2 cursor-pointer">
              <Icon name="home" size={16} />
              {t('common.backHome')}
            </Button>
          </Link>
        </div>
      </main>
    </>
  )
}
