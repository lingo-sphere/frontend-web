'use client'

import Image from 'next/image'
import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { resolveImageUrl } from '@/utils/media.utils'
import type { BackendGrammarPoint } from '../schemas/vocabulary.schema'
import { grammarFormula, grammarTitle } from '../lib/grammar-handbook'

export function GrammarPhoto({ point, vi, className = '', eager = false }: { point: BackendGrammarPoint; vi: boolean; className?: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false)
  const src = resolveImageUrl(point.image_url)
  return (
    <div className={`relative overflow-hidden bg-surface-subtle ${className}`}>
      {src && !failed ? (
        <Image src={src} alt={vi ? `Ảnh minh họa ${grammarTitle(point, vi)}` : `Illustration for ${grammarTitle(point, vi)}`} fill unoptimized loading={eager ? 'eager' : 'lazy'} className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" onError={() => setFailed(true)} />
      ) : (
        <div className="flex h-full min-h-32 items-center justify-center gap-3 px-5 text-text-secondary" role="img" aria-label={vi ? 'Minh họa cấu trúc câu' : 'Sentence structure illustration'}>
          <BookOpen size={32} aria-hidden="true" /><span className="font-mono text-sm">S + V + …</span>
        </div>
      )}
    </div>
  )
}

/** Diagrams explain time or a real formula; photographs never carry the grammar rule. */
export function GrammarDiagram({ point, vi }: { point: BackendGrammarPoint; vi: boolean }) {
  const tense = {
    'present-simple-tense': { title: vi ? 'Thói quen lặp lại theo thời gian' : 'A habit repeated over time', marks: [60, 130, 200, 270, 340], continuous: false },
    'past-simple-tense': { title: vi ? 'Hành động đã kết thúc trong quá khứ' : 'A completed action in the past', marks: [110], continuous: false },
    'present-continuous-tense': { title: vi ? 'Hành động đang diễn ra quanh hiện tại' : 'An action in progress around now', marks: [200], continuous: true },
  }[point.slug]

  if (tense) return (
    <figure className="my-5 rounded-xl bg-primary-soft p-5 text-text-primary">
      <figcaption className="text-center text-sm font-semibold text-balance">{tense.title}</figcaption>
      <svg viewBox="0 0 400 72" className="mx-auto mt-4 w-full max-w-lg text-primary-hover dark:text-primary" role="img" aria-label={tense.title}>
        <path d="M24 46H376l-8-5m8 5-8 5" fill="none" stroke="currentColor" strokeWidth="2" />
        {tense.continuous && <rect x="155" y="37" width="90" height="18" rx="9" fill="currentColor" opacity=".25" />}
        {tense.marks.map(x => <circle key={x} cx={x} cy="46" r="5" fill="currentColor" />)}
        <path d="M200 21v48" stroke="currentColor" strokeDasharray="3 4" />
      </svg>
      <div className="mx-auto grid max-w-lg grid-cols-3 text-center text-xs text-text-secondary"><span>{vi ? 'Quá khứ' : 'Past'}</span><span>{vi ? 'Hiện tại' : 'Now'}</span><span>{vi ? 'Tương lai' : 'Future'}</span></div>
    </figure>
  )

  const pattern = point.formula_details[0]?.pattern || grammarFormula(point)
  if (!pattern) return null
  return (
    <figure className="my-5 rounded-xl bg-primary-soft p-5">
      <figcaption className="mb-4 text-sm font-semibold text-text-primary">{vi ? 'Nhìn cấu trúc qua từng thành phần' : 'See the structure in parts'}</figcaption>
      <div className="space-y-3">
        {pattern.split('|').map((variant, index) => (
          <div key={index} className="flex flex-wrap items-center gap-2">
            {variant.split(/\s+\+\s+/).map((part, i) => <span key={i} className="contents">{i > 0 && <span aria-hidden="true" className="text-text-secondary">+</span>}<span className="max-w-full break-words rounded-lg bg-surface px-3 py-2 font-mono text-sm text-text-primary">{part.trim()}</span></span>)}
          </div>
        ))}
      </div>
    </figure>
  )
}
