import { useEffect, useState } from 'react'
import { resolveMediaUrlAsync } from '@/utils/media.utils'

export function ReadingMedia({ id, kind, title }: { id: string; kind: 'IMAGE' | 'VIDEO'; title: string }) {
  const [url, setUrl] = useState(''), [failed, setFailed] = useState(false), [retry, setRetry] = useState(0)
  useEffect(() => {
    let active = true
    resolveMediaUrlAsync(id).then(url => { if (active) { setUrl(url); setFailed(!url) } }).catch(() => { if (active) setFailed(true) })
    return () => { active = false }
  }, [id, retry])
  return <div className="mb-4 rounded-xl border border-border p-3">
    {failed ? <div role="alert">Không tải được tệp đính kèm. <button type="button" onClick={() => { setFailed(false); setRetry(v => v + 1) }} className="text-primary underline">Thử lại</button></div> : !url ? <p role="status">Đang tải tệp đính kèm…</p> : kind === 'VIDEO' ? <video key={retry} controls preload="metadata" src={url} onError={() => setFailed(true)} className="max-h-96 w-full" /> : <img key={retry} src={url} alt={title} onError={() => setFailed(true)} className="max-h-96 w-full object-contain" />}
  </div>
}
