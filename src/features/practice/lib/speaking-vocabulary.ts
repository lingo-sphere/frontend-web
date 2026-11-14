import type { SpeakingWordTarget } from '../types/speaking-vocabulary'
import type { SpeakingLearningIssue } from '../types/speaking'
export const normalizeSpeakingWord = (word: string) =>
  word.normalize('NFKC').trim().toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ')
export const speakingWordSourceKey = (target: SpeakingWordTarget) =>
  `${target.source_kind === 'WRITING' ? 'writing:' : ''}${target.attempt_id}:${target.turn_number}:${normalizeSpeakingWord(target.word)}`
export const validSpeakingWordTarget = (target: SpeakingWordTarget) =>
  /^[a-f\d]{24}$/i.test(target.attempt_id) &&
  Number.isInteger(target.turn_number) &&
  target.turn_number >= 0 &&
  target.turn_number <= 40 &&
  Boolean(target.word.trim()) &&
  target.word.length <= 120
export const speakingIssueWordTarget = (
  issue: SpeakingLearningIssue,
  fallbackAttempt = '',
): SpeakingWordTarget => ({
  attempt_id: issue.attempt_id || fallbackAttempt,
  turn_number: issue.turn_number,
  word: issue.original,
})
