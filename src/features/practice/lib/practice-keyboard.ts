export type PracticeKeyboardAction =
  | 'help'
  | 'exit'
  | 'save'
  | 'submit'
  | 'previous-group'
  | 'next-group'
  | 'previous'
  | 'next'
  | 'enter'
  | 'play'
  | 'record'
  | 'answer'
export interface PracticeKey {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  repeat?: boolean
  isComposing?: boolean
  defaultPrevented?: boolean
  keyCode?: number
}
/** Only explicit save/submit combinations work inside text fields. Never consume Tab. */
export function practiceKeyAction(
  event: PracticeKey,
  editable: boolean,
  characters: boolean,
  letters = false,
): { action: PracticeKeyboardAction; answer?: string } | undefined {
  if (
    event.defaultPrevented ||
    event.repeat ||
    event.isComposing ||
    event.keyCode === 229 ||
    event.altKey
  )
    return
  const key = event.key.toLowerCase()
  if (event.ctrlKey || event.metaKey) {
    if (event.shiftKey) return
    if (key === 's') return { action: 'save' }
    if (key === 'enter') return { action: 'submit' }
    return
  }
  if (editable) return
  if (key === 'escape') return { action: 'exit' }
  if (key === '?' && characters) return { action: 'help' }
  if (event.shiftKey) {
    if (key === 'arrowleft') return { action: 'previous-group' }
    if (key === 'arrowright') return { action: 'next-group' }
    return
  }
  if (key === 'arrowleft') return { action: 'previous' }
  if (key === 'arrowright') return { action: 'next' }
  if (key === 'enter') return { action: 'enter' }
  if (key === ' ') return { action: 'play' }
  if (!characters) return
  if (key === 'r') return { action: 'record' }
  if (/^[1-9]$/.test(key)) return { action: 'answer', answer: key }
  if (letters && /^[a-i]$/.test(key))
    return { action: 'answer', answer: key.toUpperCase() }
}
