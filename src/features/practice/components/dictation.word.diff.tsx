import { dictationWordDiff } from '../lib/dictation-word-diff'

export function DictationWordDiff({ answer, expected, vi }: { answer: string; expected: string; vi: boolean }) {
  const changes = dictationWordDiff(answer, expected)
  if (!changes.some(change => change.kind !== 'match')) return null
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-surface-subtle p-3" aria-label={vi ? 'Đối chiếu từ thiếu và thừa' : 'Missing and extra words'}>
      {changes.map((change, index) => (
        change.kind === 'match' ? <span key={index}>{change.word}</span> :
        <span key={index} className={`rounded border px-1.5 py-0.5 ${change.kind === 'missing' ? 'border-emerald-600/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-rose-600/40 bg-rose-500/10 text-rose-700 dark:text-rose-300'}`}>
          <span className="font-semibold">{change.kind === 'missing' ? (vi ? 'Thiếu: ' : 'Missing: ') : (vi ? 'Thừa: ' : 'Extra: ')}</span>
          {change.kind === 'missing' ? <ins className="no-underline">{change.word}</ins> : <del>{change.word}</del>}
        </span>
      ))}
    </div>
  )
}
