'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import { Button } from '@/components/button'
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
    staleTime: 10 * 60 * 1000,
  })
  const byId = new Map(
    data.flatMap(
      (row) =>
        [
          [row._id, row],
          [row.code, row],
        ] as const,
    ),
  )
  const name = (row: PracticeContext) =>
    vi ? row.name_vi || row.name_en : row.name_en
  const path = (row: PracticeContext) => {
    const parts = [name(row)],
      seen = new Set([row._id])
    let parent = row.parent_id ? byId.get(row.parent_id) : undefined
    while (parent && !seen.has(parent._id)) {
      seen.add(parent._id)
      parts.unshift(name(parent))
      parent = parent.parent_id ? byId.get(parent.parent_id) : undefined
    }
    return parts.join(' › ')
  }
  // Include category nodes as filters: backend expands a parent to all descendants.
  const options = data
    .filter((row) => row.status === 'ACTIVE')
    .map((row) => ({ id: row._id, code: row.code, label: path(row) }))
    .sort((a, b) => a.label.localeCompare(b.label, vi ? 'vi' : 'en'))
  const selected = options.find(
    (option) => option.id === value || option.code === value,
  )

  return (
    <div className="flex flex-col gap-1 max-w-full">
      <label className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
        <span className="font-medium">{vi ? 'Chủ đề:' : 'Topic:'}</span>
        <select
          aria-label={vi ? 'Chủ đề' : 'Topic'}
          value={selected?.id || value}
          disabled={isPending}
          onChange={(event) => onChange(event.target.value)}
          className="w-full sm:w-64 max-w-full rounded-lg border border-border bg-surface-subtle px-2.5 py-1.5 text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">
            {isPending
              ? vi
                ? 'Đang tải chủ đề…'
                : 'Loading topics…'
              : vi
              ? 'Tất cả chủ đề'
              : 'All topics'}
          </option>
          {value && !selected && (
            <option value={value}>
              {vi ? 'Chủ đề từ liên kết' : 'Topic from link'}
            </option>
          )}
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
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
