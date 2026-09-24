/**
 * @file context.types.ts
 * @description Types cho PracticeContext taxonomy
 */

export interface PracticeContext {
  _id: string
  code: string
  name_en: string
  name_vi?: string
  description?: string
  description_vi?: string
  parent_id?: string
  level: number // 0 = root, 1 = child, 2 = grandchild
  path: string[]
  path_string: string
  domains: string[]
  cefr_level?: string
  target_level?: string
  tags: string[]
  icon?: string
  media_id?: string
  is_selectable: boolean
  sort_order: number
  usage_count: number
  total_questions: number
  total_exercises: number
  avg_accuracy: number
  status: string
  children?: PracticeContext[]
}

export interface ContextWithBreadcrumb extends PracticeContext {
  breadcrumb: Array<{
    id: string
    code: string
    name_en: string
    name_vi?: string
  }>
}

export interface ContextSearchResult extends ContextWithBreadcrumb {
  // Search result với breadcrumb đầy đủ
}

export interface ListeningContextStats {
  level0: PracticeContext[]
  level1: PracticeContext[]
  level2: PracticeContext[]
}

// Helper type for tree building
export interface ContextTreeNode extends PracticeContext {
  children: ContextTreeNode[]
  // Computed fields
  totalExercises?: number
}
