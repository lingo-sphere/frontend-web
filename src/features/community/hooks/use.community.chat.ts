// Hook quản lý trạng thái kết nối socket, danh sách tin nhắn và tương tác phòng chat cộng đồng.
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '@/config/api.config';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { authService } from '@/features/auth/services/auth.service';
import { refreshAuthToken } from '@/services/api.client';
import { communityService } from '@/features/community/services/community.service';
import type {
  ChatMessage,
  ChatRoom,
  EligibilityResponse,
  MessageReaction,
} from '@/features/community/types/community.types';

export function useCommunityChat() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [isOpen, setIsOpenState] = useState<boolean>(() => {
    return Boolean(storage.session.get<boolean>(STORAGE_KEYS.COMMUNITY_CHAT_OPEN, false));
  });
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const isOpenRef = useRef<boolean>(isOpen);
  isOpenRef.current = isOpen;

  const setIsOpen = useCallback((open: boolean) => {
    setIsOpenState(open);
    isOpenRef.current = open;
    storage.session.set(STORAGE_KEYS.COMMUNITY_CHAT_OPEN, open);
    if (open) {
      setUnreadCount(0);
    }
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setErrorBanner(null);
    try {
      if (isAuthenticated) {
        const elig = await communityService.getEligibility().catch(() => ({ is_eligible: true } as EligibilityResponse));
        setEligibility(elig);
      } else {
        setEligibility({ is_eligible: false, status: 'UNAUTHORIZED' });
      }

      const [roomData, pinsData, msgData] = await Promise.all([
        communityService.getRoom().catch(() => null),
        communityService.getPinnedMessages().catch(() => []),
        communityService.getMessages(50).catch(() => null),
      ]);

      if (roomData) setRoom(roomData);
      if (pinsData) setPinnedMessages(pinsData);
      if (msgData?.messages) setMessages(msgData.messages);
      setHasMore(Boolean(msgData?.has_more));
      setNextCursor(msgData?.next_cursor);
    } catch {
      setErrorBanner('Không thể kết nối đến máy chủ cộng đồng');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (messages.length > 0 && !isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    const loadData = async () => {
      try {
        const elig = await communityService.getEligibility().catch(() => ({ is_eligible: true } as EligibilityResponse));
        if (isMounted) setEligibility(elig);

        const [roomData, pinsData, msgData] = await Promise.all([
          communityService.getRoom().catch(() => null),
          communityService.getPinnedMessages().catch(() => []),
          communityService.getMessages(50).catch(() => null),
        ]);

        if (isMounted) {
          if (roomData) setRoom(roomData);
          if (pinsData) setPinnedMessages(pinsData);
          if (msgData?.messages) {
            setMessages(msgData.messages);
            setHasMore(Boolean(msgData.has_more));
            setNextCursor(msgData.next_cursor);
          }
        }
      } catch {
        if (isMounted) setErrorBanner('Không thể kết nối đến máy chủ cộng đồng');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const token = authService.getAccessToken();
    if (!token) return;

    if (!API_CONFIG.BASE_URL) return;

    const socketUrl = new URL(API_CONFIG.BASE_URL).origin;
    const socket = io(socketUrl, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setErrorBanner(null);
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        refreshAuthToken().then((newToken) => {
          if (newToken) {
            socket.auth = { token: newToken };
            socket.connect();
          }
        }).catch(() => null);
      }
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    socket.on('auth:error', async () => {
      setIsConnected(false);
      try {
        const newToken = await refreshAuthToken();
        if (newToken) {
          socket.auth = { token: newToken };
          socket.connect();
        } else {
          setErrorBanner('Phiên đăng nhập chat đã hết hạn');
        }
      } catch {
        setErrorBanner('Phiên đăng nhập chat đã hết hạn');
      }
    });

    socket.on('auth:forbidden', (data: EligibilityResponse) => {
      setEligibility(data);
      if (data.status === 'BANNED') {
        setErrorBanner(`Bạn đã bị cấm: ${data.banned_reason || 'Vi phạm tiêu chuẩn cộng đồng'}`);
      } else if (data.status === 'KICKED') {
        setErrorBanner('Bạn đang trong thời gian chờ sau khi bị đuổi khỏi phòng chat');
      }
    });

    socket.on('message:new', (msg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      if (!isOpenRef.current && user?.user_id !== msg.sender_id) {
        setUnreadCount((c) => c + 1);
      }
    });

    socket.on('message:deleted', (data: { message_id: string; deleted_by: string }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === data.message_id ? { ...m, is_deleted: true, deleted_by: data.deleted_by } : m)),
      );
      setPinnedMessages((prev) => prev.filter((m) => m._id !== data.message_id));
    });

    socket.on('message:pinned', (data: { message_id: string; pinned_message_ids: string[]; message?: ChatMessage }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === data.message_id ? { ...m, is_pinned: true } : m)),
      );
      setRoom((prev) => (prev ? { ...prev, pinned_message_ids: data.pinned_message_ids } : prev));
      if (data.message) {
        setPinnedMessages((prev) => {
          const exists = prev.some((p) => p._id === data.message?._id);
          if (exists) {
            return prev.map((p) => (p._id === data.message?._id ? data.message! : p));
          }
          return [...prev, data.message!];
        });
      } else {
        communityService.getPinnedMessages().then((pins) => {
          if (pins) setPinnedMessages(pins);
        }).catch(() => null);
      }
    });

    socket.on('message:unpinned', (data: { message_id: string; pinned_message_ids: string[] }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === data.message_id ? { ...m, is_pinned: false } : m)),
      );
      setRoom((prev) => (prev ? { ...prev, pinned_message_ids: data.pinned_message_ids } : prev));
      setPinnedMessages((prev) => prev.filter((m) => m._id !== data.message_id));
    });

    socket.on('message:reaction', (data: { message_id: string; reactions: MessageReaction[] }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === data.message_id ? { ...m, reactions: data.reactions } : m)),
      );
    });

    socket.on('presence:online_count', (data: { online_count: number }) => {
      if (data?.online_count) {
        setOnlineCount(data.online_count);
      }
    });

    socket.on('room:setting_updated', (updatedRoom: ChatRoom) => {
      setRoom(updatedRoom);
    });

    socket.on('member:typing', (data: { user_name: string; is_typing: boolean }) => {
      setTypingUsers((prev) => {
        if (data.is_typing) {
          return prev.includes(data.user_name) ? prev : [...prev, data.user_name];
        }
        return prev.filter((name) => name !== data.user_name);
      });
    });

    socket.on('member:muted', (data: { target_user_id: string; muted_until: string }) => {
      if (user?.user_id === data.target_user_id) {
        setErrorBanner(`Bạn vừa bị cấm phát ngôn trong phòng chat đến ${new Date(data.muted_until).toLocaleTimeString()}`);
      }
    });

    socket.on('member:unmuted', (data: { target_user_id: string }) => {
      if (user?.user_id === data.target_user_id) {
        setErrorBanner(null);
        communityService.getEligibility().then((elig) => setEligibility(elig)).catch(() => null);
      }
    });

    socket.on('member:kicked', (data: { message: string; kicked_cooldown_until: string }) => {
      setErrorBanner(data.message || 'Bạn đã bị đuổi khỏi phòng chat');
      socket.disconnect();
    });

    socket.on('member:banned', (data: { message: string; reason: string }) => {
      setErrorBanner(data.message || 'Bạn đã bị cấm tham gia cộng đồng');
      socket.disconnect();
    });

    socket.on('member:unbanned', (data: { target_user_id: string }) => {
      if (user?.user_id === data.target_user_id) {
        setErrorBanner(null);
        communityService.getEligibility().then((elig) => setEligibility(elig)).catch(() => null);
      }
    });

    socket.on('member:moderator_updated', (data: { user_id: string; role: string }) => {
      if (user?.user_id === data.user_id) {
        communityService.getEligibility().then((elig) => setEligibility(elig)).catch(() => null);
      }
    });

    socket.on('error', (err: { message: string }) => {
      if (err?.message) {
        setErrorBanner(err.message);
        setTimeout(() => setErrorBanner(null), 5000);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user?.user_id]);

  const sendMessage = useCallback((content: string, attachments?: string[]) => {
    const hasContent = Boolean(content && content.trim());
    const hasAttachments = Boolean(attachments && attachments.length > 0);
    if (!hasContent && !hasAttachments) return;

    if (!socketRef.current?.connected) {
      const freshToken = authService.getAccessToken();
      if (socketRef.current && freshToken) {
        socketRef.current.auth = { token: freshToken };
        socketRef.current.connect();
      }
      refreshAuthToken().then((newToken) => {
        if (newToken && socketRef.current) {
          socketRef.current.auth = { token: newToken };
          socketRef.current.connect();
        }
      }).catch(() => null);
    }

    if (socketRef.current) {
      socketRef.current.emit('send_message', {
        content: (content || '').trim(),
        attachments: attachments || [],
        reply_to_message_id: replyTo?._id,
      });
    }

    setReplyTo(null);
  }, [replyTo]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (!socketRef.current) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    socketRef.current.emit('typing', { is_typing: isTyping });

    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('typing', { is_typing: false });
      }, 3000);
    }
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('delete_message', { message_id: messageId });
  }, []);

  const pinMessage = useCallback((messageId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('pin_message', { message_id: messageId });
  }, []);

  const unpinMessage = useCallback((messageId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('unpin_message', { message_id: messageId });
  }, []);

  const reactToMessage = useCallback(async (messageId: string, emoji: string, action: 'add' | 'remove' = 'add') => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('react_message', { message_id: messageId, emoji, action });
    } else {
      try {
        const res = await communityService.toggleReaction(messageId, emoji, action);
        setMessages((prev) =>
          prev.map((m) => (m._id === messageId ? { ...m, reactions: res.reactions } : m)),
        );
      } catch {
      }
    }
  }, []);

  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || isLoadingMore || messages.length === 0) return;

    const oldestMsg = messages[0];
    const cursor = nextCursor || oldestMsg?._id;
    if (!cursor) return;

    setIsLoadingMore(true);
    try {
      const res = await communityService.getMessages(30, cursor);
      if (res?.messages && res.messages.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m._id));
          const uniqueNew = res.messages.filter((m) => !existingIds.has(m._id));
          return [...uniqueNew, ...prev];
        });
        setHasMore(Boolean(res.has_more));
        setNextCursor(res.next_cursor);
      } else {
        setHasMore(false);
      }
    } catch {
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, messages, nextCursor]);

  return {
    isOpen,
    setIsOpen,
    unreadCount,
    messages,
    pinnedMessages,
    room,
    eligibility,
    isLoading,
    isConnected,
    onlineCount,
    typingUsers,
    replyTo,
    setReplyTo,
    errorBanner,
    hasMore,
    isLoadingMore,
    loadMoreMessages,
    refreshData,
    sendMessage,
    deleteMessage,
    pinMessage,
    unpinMessage,
    reactToMessage,
    sendTyping,
    uploadChatImage: communityService.uploadChatImage,
  };
}
