// Bộ lọc chủ đề ngữ cảnh luyện nghe theo cây phân cấp đa tầng.
'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import { Button } from '@/components/button'
import { AppSelect } from '@/components/select'
import type { PracticeContext } from '../types/context.types'

interface Props {
  value: string
  onChange: (id: string) => void
  isVietnamese: boolean
}

export function ListeningContextFilter({
  value,
  onChange,
  isVietnamese: vi,
}: Props) {
  const {
    data = [],
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['contexts', 'listening-filter'],
    queryFn: () =>
      api.get<PracticeContext[]>(API_CONFIG.ENDPOINTS.CONTEXT.LIST, {
        status: 'ACTIVE',
      }),
  })

  const byId = new Map(data.map((c) => [c._id, c]))
  const name = (c: PracticeContext): string =>
    (vi ? c.name_vi || c.name_en : c.name_en || c.name_vi) || ''

  const path = (c: PracticeContext) => {
    const parts: string[] = []
    let parent: PracticeContext | undefined = c
    while (parent) {
      parts.unshift(name(parent))
      parent = parent.parent_id ? byId.get(parent.parent_id) : undefined
    }
    return parts.join(' › ')
  }

  const options = data
    .filter((row) => row.status === 'ACTIVE')
    .map((row) => ({ id: row._id, code: row.code, label: path(row) }))
    .sort((a, b) => a.label.localeCompare(b.label, vi ? 'vi' : 'en'))
  const selected = options.find(
    (option) => option.id === value || option.code === value,
  )

  const topicOptions = [
    {
      value: '',
      label: isPending
        ? vi
          ? 'Đang tải chủ đề…'
          : 'Loading topics…'
        : vi
        ? 'Tất cả chủ đề'
        : 'All topics',
    },
    ...(value && !selected
      ? [{ value, label: vi ? 'Chủ đề từ liên kết' : 'Topic from link' }]
      : []),
    ...options.map((opt) => ({ value: opt.id, label: opt.label })),
  ]

  return (
    <div className="flex flex-col gap-1 max-w-full">
      <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
        <span className="font-medium">{vi ? 'Chủ đề:' : 'Topic:'}</span>
        <AppSelect
          value={selected?.id || value}
          onChange={(newVal) => onChange(newVal)}
          options={topicOptions}
          disabled={isPending}
          size="sm"
          ariaLabel={vi ? 'Chủ đề' : 'Topic'}
          triggerClassName="w-full sm:w-64 max-w-full justify-between"
        />
      </div>
      {isError ? (
        <div role="alert" className="text-xs text-red-500">
          {vi ? 'Không tải được chủ đề.' : 'Could not load topics.'}{' '}
          <Button variant="ghost" size="sm" onClick={() => void refetch()}>
            {vi ? 'Thử lại' : 'Retry'}
          </Button>
        </div>
      ) : (
        value && (
          <span className="text-xs text-text-tertiary">
            {vi ? 'Bao gồm các chủ đề con.' : 'Includes subtopics.'}
          </span>
        )
      )}
    </div>
  )
}
