// Component giao diện hộp thoại chat cộng đồng mini dạng tab nổi bên phải màn hình.
'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FileText,
  Image as ImageIcon,
  Loader2,
  Lock,
  MessageCircle,
  Pin,
  PinOff,
  RefreshCw,
  Send,
  Shield,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useCommunityChat } from '@/features/community/hooks/use.community.chat';
import type { ChatMessage } from '@/features/community/types/community.types';

function formatRelativeTime(dateStr: string): string {
  const diff = Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000));
  if (diff < 60) return 'vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

interface CommunityChatWidgetProps {
  chatState: ReturnType<typeof useCommunityChat>;
}

export function CommunityChatWidget({ chatState }: CommunityChatWidgetProps) {
  const {
    isOpen,
    setIsOpen,
    messages,
    room,
    eligibility,
    isLoading,
    onlineCount,
    typingUsers,
    replyTo,
    setReplyTo,
    errorBanner,
    refreshData,
    sendMessage,
    deleteMessage,
    pinMessage,
    unpinMessage,
    sendTyping,
    uploadChatImage,
  } = chatState;

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [inputContent, setInputContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showRoomInfo, setShowRoomInfo] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputContent.trim() && !attachedImage) return;

    const attachments = attachedImage ? [attachedImage] : [];
    sendMessage(inputContent, attachments);
    setInputContent('');
    setAttachedImage(null);
    sendTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadChatImage(file);
      if (url) {
        setAttachedImage(url);
      }
    } catch {
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  const isEligible = Boolean(eligibility?.is_eligible);
  const isRoomLocked = room ? !room.is_chat_enabled : false;
  const isPrivileged = eligibility?.role === 'ADMIN' || eligibility?.role === 'MODERATOR';
  const canPin =
    eligibility?.role === 'ADMIN' ||
    (eligibility?.role === 'MODERATOR' && Boolean(eligibility?.member?.moderator_permissions?.can_pin_messages));

  const pinnedMessages = messages.filter((m) => m.is_pinned && !m.is_deleted);
  const activePinnedMsg = pinnedMessages[pinnedMessages.length - 1];

  return (
    <>
      <div className="fixed bottom-24 right-6 z-50 flex h-[580px] max-h-[calc(100vh-120px)] w-[380px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-white px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-800 shadow-xs border border-slate-200/80 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
              Chat Cộng Đồng
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <button
              type="button"
              title="Thông tin phòng"
              onClick={() => setShowRoomInfo(!showRoomInfo)}
              className="rounded-full p-1.5 transition-colors hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <FileText className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Làm mới"
              onClick={refreshData}
              disabled={isLoading}
              className="rounded-full p-1.5 transition-colors hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              title="Đóng"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1.5 transition-colors hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {errorBanner && (
          <div className="bg-rose-50 px-4 py-1.5 text-center text-xs font-medium text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
            {errorBanner}
          </div>
        )}

        {showRoomInfo && (
          <div className="border-b border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
            <div className="flex items-center justify-between font-semibold">
              <span>{room?.title || 'Kênh thảo luận chung'}</span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                {onlineCount} đang online
              </span>
            </div>
            {room && room.slow_mode_seconds > 0 && (
              <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
                ⚡ Đang bật Slow Mode: {room.slow_mode_seconds}s giữa mỗi tin nhắn.
              </p>
            )}
            {room && !room.is_chat_enabled && (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                🔒 Phòng chat hiện đang khóa tin nhắn từ thành viên thường.
              </p>
            )}
          </div>
        )}

        {activePinnedMsg && (
          <div className="flex items-center justify-between gap-2 border-b border-amber-200/80 bg-amber-50/90 px-3.5 py-2 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200 shrink-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Pin className="h-3.5 w-3.5 shrink-0 fill-amber-500 text-amber-600 dark:text-amber-400" />
              <div className="min-w-0 flex-1 truncate">
                <span className="font-bold mr-1">@{activePinnedMsg.sender_name}:</span>
                <span className="text-slate-700 dark:text-slate-300 truncate">{activePinnedMsg.content}</span>
              </div>
            </div>
            {canPin && (
              <button
                type="button"
                title="Bỏ ghim tin nhắn này"
                onClick={() => unpinMessage(activePinnedMsg._id)}
                className="shrink-0 p-1 text-amber-700 hover:text-rose-600 dark:text-amber-400 dark:hover:text-rose-400 transition-colors cursor-pointer"
              >
                <PinOff className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        <div ref={scrollRef} className="flex-1 space-y-3.5 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
                <MessageCircle className="mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" />
                <p className="text-xs">Chưa có tin nhắn nào trong phòng chat chung</p>
                <p className="mt-0.5 text-[11px] text-slate-400">Hãy là người đầu tiên mở lời chào nhé!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = user?.user_id === msg.sender_id;
                const canDelete = isMe || isPrivileged;

                return (
                  <div key={msg._id} className="group flex items-start gap-2.5">
                    <div className="relative shrink-0">
                      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-slate-200 font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                        {msg.sender_avatar ? (
                          <Image
                            src={msg.sender_avatar}
                            alt={msg.sender_name}
                            width={36}
                            height={36}
                            className="h-full w-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <span>{msg.sender_name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="absolute -bottom-1 -right-1 rounded-full border border-blue-200 bg-blue-50 px-1 py-0.2 text-[8px] font-bold text-blue-600 shadow-2xs dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        {msg.sender_badge === 'ADMIN'
                          ? 'ADMIN'
                          : msg.sender_badge === 'PRO'
                            ? 'PRO'
                            : `Lv.${msg.sender_level ?? 1}`}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                          @{msg.sender_name}
                        </span>
                        {msg.sender_role === 'ADMIN' && (
                          <span title="Quản trị viên">
                            <Shield className="h-3 w-3 text-amber-500 fill-amber-500" />
                          </span>
                        )}
                        {msg.sender_badge === 'PRO' && msg.sender_role !== 'ADMIN' && (
                          <span title="Thành viên PRO">
                            <Star className="h-3 w-3 text-emerald-500 fill-emerald-500" />
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {formatRelativeTime(msg.created_at)}
                        </span>

                        <div className="ml-auto flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          {canPin && !msg.is_deleted && (
                            <button
                              type="button"
                              title={msg.is_pinned ? 'Bỏ ghim tin nhắn' : 'Ghim tin nhắn'}
                              onClick={() => (msg.is_pinned ? unpinMessage(msg._id) : pinMessage(msg._id))}
                              className={`rounded p-1 transition-colors cursor-pointer ${
                                msg.is_pinned
                                  ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                                  : 'text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800'
                              }`}
                            >
                              {msg.is_pinned ? (
                                <PinOff className="h-3.5 w-3.5" />
                              ) : (
                                <Pin className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}

                          {canDelete && !msg.is_deleted && (
                            <button
                              type="button"
                              title="Xóa tin nhắn"
                              onClick={() => deleteMessage(msg._id)}
                              className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {msg.reply_to && !msg.is_deleted && (
                        <div className="mt-1 rounded-md border-l-2 border-slate-300 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
                          <span className="font-semibold text-slate-600 dark:text-slate-300">
                            @{msg.reply_to.sender_name}:{' '}
                          </span>
                          <span>{msg.reply_to.content}</span>
                        </div>
                      )}

                      {msg.is_deleted ? (
                        <p className="mt-1 text-xs italic text-slate-400">
                          [Tin nhắn đã bị thu hồi]
                        </p>
                      ) : (
                        <div className="mt-0.5 text-xs text-slate-700 dark:text-slate-200 break-words leading-relaxed">
                          {msg.content}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {msg.attachments.map((url, i) => (
                                <a
                                  key={i}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 hover:opacity-90"
                                >
                                  <Image
                                    src={url}
                                    alt="attachment"
                                    width={140}
                                    height={100}
                                    className="h-24 w-auto max-w-[180px] object-cover"
                                    unoptimized
                                  />
                                </a>
                              ))}
                            </div>
                          )}
                          {msg.is_pinned && !msg.is_deleted && (
                            <div className="mt-1 inline-flex items-center gap-1 rounded bg-amber-100/80 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
                              <Pin className="h-2.5 w-2.5 fill-amber-500 text-amber-600 dark:text-amber-400" />
                              <span>Đã ghim</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {typingUsers.length > 0 && (
              <div className="text-[11px] italic text-slate-400 flex items-center gap-1.5 pt-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse"></span>
                <span>{typingUsers.join(', ')} đang soạn tin...</span>
              </div>
            )}
          </div>

        <div className="border-t border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          {!isAuthenticated ? (
            <Link
              href="/login"
              className="flex w-full items-center justify-center rounded-full border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Vui lòng đăng nhập để tham gia chat
            </Link>
          ) : eligibility?.status === 'BANNED' ? (
            <div className="rounded-full bg-rose-50 border border-rose-200 py-2 px-3 text-center text-xs font-medium text-rose-600 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
              ⛔ Bạn đã bị cấm tham gia phòng chat
            </div>
          ) : eligibility?.status === 'KICKED' ? (
            <div className="rounded-full bg-orange-50 border border-orange-200 py-2 px-3 text-center text-xs font-medium text-orange-600 dark:bg-orange-950/40 dark:border-orange-900 dark:text-orange-300">
              ⏱️ Bạn đang trong thời gian chờ sau khi bị kick
            </div>
          ) : eligibility?.muted_until && new Date(eligibility.muted_until) > new Date() ? (
            <div className="rounded-full bg-amber-50 border border-amber-200 py-2 px-3 text-center text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300">
              🔇 Bạn đang bị tắt tiếng trong phòng chat
            </div>
          ) : isRoomLocked && !isPrivileged ? (
            <div className="rounded-full bg-slate-100 py-2 text-center text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              🔒 Phòng chat đang ở chế độ chỉ đọc
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {replyTo && (
                <div className="flex items-center justify-between rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <span className="truncate">
                    Trả lời <b>@{replyTo.sender_name}</b>: {replyTo.content}
                  </span>
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    className="text-slate-400 hover:text-slate-700 ml-2"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {attachedImage && (
                <div className="relative inline-block w-fit">
                  <Image
                    src={attachedImage}
                    alt="preview"
                    width={60}
                    height={60}
                    className="h-14 w-14 rounded-lg object-cover border border-slate-200"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => setAttachedImage(null)}
                    className="absolute -top-1.5 -right-1.5 rounded-full bg-rose-500 p-0.5 text-white shadow-xs"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <button
                  type="button"
                  title="Gửi ảnh"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                  ) : (
                    <ImageIcon className="h-4 w-4" />
                  )}
                </button>

                <input
                  type="text"
                  value={inputContent}
                  onChange={(e) => {
                    setInputContent(e.target.value);
                    sendTyping(e.target.value.length > 0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-500"
                />

                <button
                  type="button"
                  title="Gửi"
                  onClick={handleSend}
                  disabled={!inputContent.trim() && !attachedImage}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white transition-all hover:bg-slate-800 disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
