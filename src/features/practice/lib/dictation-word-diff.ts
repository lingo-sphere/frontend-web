export interface DictationWordChange {
  kind: 'match' | 'missing' | 'extra'
  word: string
}

// Only explains a saved grade; it never changes the server's scoring result.
export function dictationWordDiff(answer: string, expected: string): DictationWordChange[] {
  const words = (text: string) => text.trim().match(/\S+/gu) || []
  const actual = words(answer), target = words(expected)
  const normalize = (word: string) => word.normalize('NFKC').toLocaleLowerCase('en').replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, '')
  const a = actual.map(normalize), b = target.map(normalize)
  const width = b.length + 1
  const directions = new Uint8Array((a.length + 1) * width)
  let previous = new Uint16Array(width)
  for (let i = 1; i <= a.length; i++) {
    const current = new Uint16Array(width)
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        current[j] = previous[j - 1] + 1
        directions[i * width + j] = 1
      } else if (previous[j] >= current[j - 1]) {
        current[j] = previous[j]
        directions[i * width + j] = 2
      } else {
        current[j] = current[j - 1]
        directions[i * width + j] = 3
      }
    }
    previous = current
  }
  const changes: DictationWordChange[] = []
  let i = a.length, j = b.length
  while (i || j) {
    const direction = directions[i * width + j]
    if (i && j && direction === 1) {
      changes.push({ kind: 'match', word: target[--j] }); i--
    } else if (i && (!j || direction === 2)) {
      changes.push({ kind: 'extra', word: actual[--i] })
    } else {
      changes.push({ kind: 'missing', word: target[--j] })
    }
  }
  return changes.reverse()
}
