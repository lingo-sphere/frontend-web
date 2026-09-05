/**
 * @file course.qna.thread.item.tsx
 * @description Card hiển thị một câu hỏi thảo luận, danh sách các câu trả lời và khung phản hồi của Giảng viên
 */

import {
  BookOpen,
  Bot,
  CheckCircle2,
  Clock,
  EyeOff,
  GraduationCap,
  Send,
  ShieldCheck,
  ThumbsUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { QnAItem } from '@/types/course'

interface CourseQnAThreadItemProps {
  item: QnAItem
  currentUserId?: string
  isTeacherOrAdmin: boolean
  replyingQnaId: string | null
  replyText: string
  isSubmitting: boolean
  onUpvote: (id: string) => void
  onStartReply: (id: string) => void
  onCancelReply: () => void
  onReplyTextChange: (text: string) => void
  onSendReply: (id: string) => void
}

export function CourseQnAThreadItem({
  item,
  currentUserId,
  isTeacherOrAdmin,
  replyingQnaId,
  replyText,
  isSubmitting,
  onUpvote,
  onStartReply,
  onCancelReply,
  onReplyTextChange,
  onSendReply,
}: CourseQnAThreadItemProps) {
  const isAuthorCurrent = Boolean(currentUserId && item.userId && item.userId === currentUserId)
  const authorDisplayName = item.isAnonymous
    ? isAuthorCurrent
      ? 'Bạn (Ẩn danh)'
      : 'Học viên ẩn danh'
    : isAuthorCurrent
      ? `${item.author || 'Bạn'} (Bạn)`
      : item.author || 'Học viên'

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-4 hover:border-border-hover transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {item.isAnonymous ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-xs">
              <EyeOff size={18} />
            </div>
          ) : item.authorAvatar ? (
            <img
              src={item.authorAvatar}
              alt={authorDisplayName}
              className="h-10 w-10 shrink-0 rounded-2xl object-cover border border-border/60 shadow-xs"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-sm shadow-xs">
              {(item.author || 'H').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 space-y-1">
            <h4 className="text-sm sm:text-base font-bold text-text-primary leading-snug">
              {item.title}
            </h4>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-tertiary">
              <span className="font-semibold text-text-secondary flex items-center gap-1.5">
                {authorDisplayName}
                {item.isAnonymous && (
                  <span className="inline-flex items-center gap-0.5 rounded-md bg-purple-500/10 px-1.5 py-0.2 text-[10px] font-bold text-purple-600 dark:text-purple-400">
                    <ShieldCheck size={11} /> Ẩn danh
                  </span>
                )}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-text-tertiary">
                <BookOpen size={11} />
                {item.lessonTitle}
              </span>
              <span>•</span>
              <span>{item.createdAt}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onUpvote(item.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface-hover/50 hover:border-primary hover:text-primary transition-all text-xs font-bold text-text-secondary cursor-pointer shrink-0 shadow-2xs"
        >
          <ThumbsUp size={13} />
          <span>{item.upvotes}</span>
        </button>
      </div>

      {item.body && (
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed pl-0 sm:pl-13">
          {item.body}
        </p>
      )}

      {item.answers && item.answers.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-border/60 pl-0 sm:pl-13">
          {item.answers.map((ans) => {
            const isAI = ans.authorRole === 'Gia sư AI'
            return (
              <div
                key={ans.id}
                className={`rounded-2xl p-4 border space-y-2 ${
                  isAI
                    ? 'border-indigo-500/20 bg-indigo-500/[0.03]'
                    : 'border-emerald-500/30 bg-emerald-500/[0.03] border-l-4 border-l-emerald-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    {isAI ? (
                      <span className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg text-[10px]">
                        <Bot size={12} /> Trợ lý AI
                      </span>
                    ) : ans.authorAvatar ? (
                      <img
                        src={ans.authorAvatar}
                        alt={ans.author}
                        className="h-5 w-5 rounded-full object-cover border border-border/60"
                      />
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg text-[10px]">
                        <CheckCircle2 size={12} /> {ans.authorRole || 'Giảng viên'}
                      </span>
                    )}
                    <span className="font-bold text-text-primary text-xs">{ans.author}</span>
                  </div>
                  <span className="text-[10px] text-text-tertiary">{ans.createdAt}</span>
                </div>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {ans.body}
                </p>
              </div>
            )
          })}
        </div>
      )}

      <div className="pl-0 sm:pl-13 pt-1">
        {isTeacherOrAdmin ? (
          replyingQnaId === item.id ? (
            <div className="space-y-3 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.03] animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <GraduationCap size={15} />
                <span>Giải đáp thắc mắc với tư cách Giảng viên</span>
              </div>
              <textarea
                rows={2}
                placeholder="Nhập nội dung giải đáp chuyên môn cho học viên..."
                value={replyText}
                onChange={(e) => onReplyTextChange(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-text-primary placeholder:text-text-tertiary focus:border-emerald-500 focus:outline-hidden resize-none"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onCancelReply}
                  className="text-xs font-bold text-text-secondary cursor-pointer"
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={isSubmitting || !replyText.trim()}
                  onClick={() => onSendReply(item.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 rounded-xl cursor-pointer shadow-xs"
                >
                  <Send size={13} />
                  <span>Gửi giải đáp</span>
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onStartReply(item.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
            >
              <GraduationCap size={14} />
              <span>Phản hồi với tư cách Giảng viên</span>
            </button>
          )
        ) : (
          (!item.answers || item.answers.length === 0) && (
            <div className="inline-flex items-center gap-1.5 text-[11px] text-text-tertiary bg-surface-hover/50 px-2.5 py-1 rounded-lg">
              <Clock size={12} />
              <span>Đang chờ Giảng viên giải đáp</span>
            </div>
          )
        )}
      </div>
    </div>
  )
}
