import { useEffect, useState } from 'react'
import { api } from '@/services/api.client'
import { resolveMediaUrl } from '@/utils/media.utils'

export function GrammarMedia({ id }: { id: string }) {
  const [media, setMedia] = useState<{ url: string; kind: string } | null>(null)
  const [failed, setFailed] = useState(false), [retry, setRetry] = useState(0)
  useEffect(() => {
    let active = true
    api.get<{ storage_key?: string; file_path?: string; content_type?: string; mime_type?: string }>('/media/files/' + id).then(file => {
      const url = resolveMediaUrl(file.storage_key || file.file_path || '')
      const kind = file.content_type || file.mime_type?.split('/')[0].toUpperCase() || ''
      if (active) { setMedia(url ? { url, kind } : null); setFailed(!url || !['IMAGE', 'AUDIO', 'VIDEO'].includes(kind)) }
    }).catch(() => { if (active) setFailed(true) })
    return () => { active = false }
  }, [id, retry])
  if (failed) return <div role="alert">Không tải được tệp đính kèm. <button type="button" className="underline" onClick={() => { setFailed(false); setMedia(null); setRetry(v => v + 1) }}>Thử lại</button></div>
  if (!media) return <p role="status">Đang tải tệp đính kèm…</p>
  if (media.kind === 'AUDIO') return <audio key={retry} controls preload="metadata" src={media.url} onError={() => setFailed(true)} className="w-full" />
  if (media.kind === 'VIDEO') return <video key={retry} controls preload="metadata" src={media.url} onError={() => setFailed(true)} className="max-h-96 w-full" />
  return <img key={retry} src={media.url} alt="Hình minh họa câu hỏi" onError={() => setFailed(true)} className="max-h-96 w-full object-contain" />
}
