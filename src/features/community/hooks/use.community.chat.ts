// Hook quản lý trạng thái kết nối socket, danh sách tin nhắn và tương tác phòng chat cộng đồng.
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '@/config/api.config';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { communityService } from '@/features/community/services/community.service';
import type {
  ChatMessage,
  ChatRoom,
  EligibilityResponse,
} from '@/features/community/types/community.types';

export function useCommunityChat() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [isOpen, setIsOpenState] = useState<boolean>(false);

  useEffect(() => {
    const saved = storage.session.get<boolean>(STORAGE_KEYS.COMMUNITY_CHAT_OPEN, false);
    if (saved) {
      setIsOpenState(true);
    }
  }, []);

  const setIsOpen = useCallback((open: boolean) => {
    setIsOpenState(open);
    storage.session.set(STORAGE_KEYS.COMMUNITY_CHAT_OPEN, open);
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
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

      const [roomData, msgData] = await Promise.all([
        communityService.getRoom().catch(() => null),
        communityService.getMessages(50).catch(() => null),
      ]);

      if (roomData) setRoom(roomData);
      if (msgData?.messages) setMessages(msgData.messages);
    } catch {
      setErrorBanner('Không thể kết nối đến máy chủ cộng đồng');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen, refreshData]);

  useEffect(() => {
    if (!isOpen || !isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const token = storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) return;

    const socketUrl = API_CONFIG.BASE_URL ? new URL(API_CONFIG.BASE_URL).origin : 'http://localhost:8080';
    const socket = io(socketUrl, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setErrorBanner(null);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
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
    });

    socket.on('message:deleted', (data: { message_id: string; deleted_by: string }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === data.message_id ? { ...m, is_deleted: true, deleted_by: data.deleted_by } : m)),
      );
    });

    socket.on('message:pinned', (data: { message_id: string; pinned_message_ids: string[] }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === data.message_id ? { ...m, is_pinned: true } : m)),
      );
      setRoom((prev) => (prev ? { ...prev, pinned_message_ids: data.pinned_message_ids } : prev));
    });

    socket.on('message:unpinned', (data: { message_id: string; pinned_message_ids: string[] }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === data.message_id ? { ...m, is_pinned: false } : m)),
      );
      setRoom((prev) => (prev ? { ...prev, pinned_message_ids: data.pinned_message_ids } : prev));
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

    socket.on('member:kicked', (data: { message: string; kicked_cooldown_until: string }) => {
      setErrorBanner(data.message || 'Bạn đã bị đuổi khỏi phòng chat');
      socket.disconnect();
    });

    socket.on('member:banned', (data: { message: string; reason: string }) => {
      setErrorBanner(data.message || 'Bạn đã bị cấm tham gia cộng đồng');
      socket.disconnect();
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
  }, [isOpen, isAuthenticated, user?.user_id]);

  const sendMessage = useCallback((content: string, attachments?: string[]) => {
    if (!socketRef.current || !content.trim()) return;

    socketRef.current.emit('send_message', {
      content: content.trim(),
      attachments: attachments || [],
      reply_to_message_id: replyTo?._id,
    });

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

  return {
    isOpen,
    setIsOpen,
    messages,
    room,
    eligibility,
    isLoading,
    isConnected,
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
    uploadChatImage: communityService.uploadChatImage,
  };
}
