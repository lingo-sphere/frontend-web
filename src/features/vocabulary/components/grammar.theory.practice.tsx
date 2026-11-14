'use client'

import { ArrowRight, LockKeyhole } from 'lucide-react'
import { Button } from '@/components/button'
import type { TheoryPracticeState } from '../hooks/use.grammar.theory.practice'

export function GrammarTheoryPractice({ state, hasLinks, vi, compact = false }: {
  state: TheoryPracticeState; hasLinks: boolean; vi: boolean; compact?: boolean
}) {
  const { query, starting, userId, login, start } = state
  const title = vi ? 'Luyện tập cấu trúc này' : 'Practice this structure'
  const links = (query.data?.links || []).filter(link => !state.sourceRequested || link.topic_code === state.sourceIssue?.target?.topic_code)
  if (compact && !hasLinks) return null
  let body
  if (!hasLinks) body = <p className="text-sm leading-6 text-text-secondary">{vi ? 'Cấu trúc này chưa có bộ bài luyện tương ứng. Bạn vẫn có thể tra cứu đầy đủ lý thuyết và ví dụ.' : 'A matching exercise set is not available yet. You can still read the theory and examples.'}</p>
  else if (!userId) body = <Button onClick={login} variant="outline">{vi ? 'Đăng nhập để luyện tập' : 'Sign in to practice'}</Button>
  else if (state.sourceError) body = <div role="alert" className="text-sm text-text-secondary">{vi ? 'Chưa xác minh được nguồn lỗi bài làm. Bạn vẫn có thể đọc lý thuyết.' : 'The submission source could not be verified. You can still read the theory.'}<Button variant="outline" className="ml-2" onClick={() => void state.sourceQuery.refetch()}>{vi ? 'Thử lại' : 'Retry'}</Button></div>
  else if (state.sourceLoading) body = <p role="status" className="text-sm text-text-secondary">{vi ? 'Đang đối chiếu lỗi bài làm…' : 'Checking the submission source…'}</p>
  else if (query.isError) body = <div role="alert" className="text-sm text-text-secondary">{vi ? 'Chưa tải được bài luyện tương ứng.' : 'Could not load the matching exercises.'}<Button variant="outline" className="ml-2" onClick={() => void query.refetch()}>{vi ? 'Thử lại' : 'Retry'}</Button></div>
  else if (query.isPending) body = <p role="status" className="text-sm text-text-secondary">{vi ? 'Đang kiểm tra bài luyện tương ứng…' : 'Checking matching exercises…'}</p>
  else if (!links.length) body = <p className="text-sm text-text-secondary">{vi ? 'Liên kết bài luyện đang được cập nhật.' : 'The exercise links are being updated.'}</p>
  else if (compact && links.length > 1) body = <Button asChild variant="outline" className="min-h-11 w-full whitespace-normal sm:w-auto"><a href="#practice">{title}<ArrowRight size={16} aria-hidden="true" /></a></Button>
  else body = <div className={compact ? 'space-y-3' : 'grid gap-4'}>{links.map(link => {
    const topic = link.topic
    const locked = Boolean(topic && !topic.is_unlocked)
    const insufficient = Boolean(topic && topic.total_questions < (state.sourceRequested ? 10 : 6))
    const minimum = state.sourceRequested ? 10 : 6
    const reason = !topic ? (vi ? 'Bài luyện tương ứng hiện chưa khả dụng.' : 'This exercise is currently unavailable.') : locked ? (vi ? `Bài luyện cấp ${topic.cefr_level} chưa được mở khóa. Hoàn thành yêu cầu cấp độ tại phần Luyện ngữ pháp để mở bài.` : `Level ${topic.cefr_level} is locked. Complete the level requirements in Grammar Practice.`) : insufficient ? (vi ? `Bộ bài luyện chưa đủ ${minimum} câu hỏi đã xuất bản.` : `This set needs at least ${minimum} published questions.`) : null
    const label = compact || links.length === 1 ? title : vi ? 'Luyện dạng này' : 'Practice this form'
    return <div key={link.topic_code} className={compact ? 'space-y-2' : 'flex flex-wrap items-start justify-between gap-4 rounded-lg bg-surface-subtle p-4'}>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-6 font-medium text-text-primary">{(vi ? link.scope_vi : link.scope_en) || (vi ? topic?.name_vi || topic?.name_en : topic?.name_en) || (vi ? 'Bài luyện tương ứng' : 'Matching exercise')}</p>
        {topic && <p className="mt-1 text-xs leading-5 text-text-secondary">{topic.cefr_level} · {Math.min(10, topic.total_questions)} {vi ? 'câu mỗi lượt' : 'questions per session'}</p>}
        {reason && <p className="mt-2 max-w-[65ch] text-sm leading-6 text-text-secondary">{reason}</p>}
      </div>
      <Button variant="outline" disabled={Boolean(reason || starting || (state.sourceRequested && state.sourceIssue?.availability !== 'READY'))} onClick={() => void start(link.topic_code)} className="min-h-11 w-full whitespace-normal border-primary/30 text-primary-hover sm:w-auto dark:text-primary">
        {locked && <LockKeyhole size={16} aria-hidden="true" />}{starting === link.topic_code ? (vi ? 'Đang mở bài…' : 'Opening…') : label}{!reason && <ArrowRight size={16} aria-hidden="true" />}
      </Button>
    </div>
  })}</div>
  if (compact) return <div className="mt-5">{body}</div>
  return <section id="practice" aria-labelledby="theory-practice-heading" className="scroll-mt-28 rounded-xl border border-border bg-surface p-5 sm:p-6"><h2 id="theory-practice-heading" className="mb-3 text-xl font-semibold">{title}</h2>{hasLinks && <p className="mb-5 max-w-[68ch] text-sm leading-6 text-text-secondary">{vi ? 'Mở bài luyện đúng chủ điểm tại phần Luyện ngữ pháp. Kết quả được lưu vào lịch sử làm bài như các bài luyện khác.' : 'Open the matching topic in Grammar Practice. Results are saved in your existing practice history.'}</p>}{body}</section>
}
