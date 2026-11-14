import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import type {
  SpeakingWordTarget,
  SpeakingWordSource,
  SpeakingSavedWord,
  SaveSpeakingWordResult,
  SpeakingWordDetail,
} from '../types/speaking-vocabulary'

const sourcePath = (target: SpeakingWordTarget) =>
  `/practice/${target.source_kind === 'WRITING' ? 'writing/submissions' : 'speaking/attempts'}/${encodeURIComponent(target.attempt_id)}`
export const speakingVocabularyService = {
  source(target: SpeakingWordTarget) {
    return api.get<SpeakingWordSource>(`${sourcePath(target)}/vocabulary-source`, {
      word: target.word,
      turn_number: String(target.turn_number),
    })
  },
  save(
    target: SpeakingWordTarget,
    lexicalItemId: string,
    meaningIndex: number,
    confirmWord: boolean,
  ) {
    return api.post<SaveSpeakingWordResult>(`${sourcePath(target)}/vocabulary`, {
      word: target.word,
      turn_number: target.turn_number,
      lexical_item_id: lexicalItemId,
      meaning_index: meaningIndex,
      confirm_word: confirmWord,
    })
  },
  async status(sourceKeys: string[]) {
    const batches: string[][] = []
    for (let i = 0; i < sourceKeys.length; i += 100) batches.push(sourceKeys.slice(i, i + 100))
    return (
      await Promise.all(
        batches.map((source_keys) =>
          api.post<SpeakingSavedWord[]>('/vocabulary/saved/speaking-status', { source_keys }),
        ),
      )
    ).flat()
  },
  detail(id: string) {
    return api.get<SpeakingWordDetail>(API_CONFIG.ENDPOINTS.VOCABULARY.ITEM_BY_ID(id))
  },
}
