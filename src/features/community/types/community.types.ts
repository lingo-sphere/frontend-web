// Định nghĩa các kiểu dữ liệu và giao diện cho tính năng phòng chat cộng đồng.
export interface ChatMessage {
  _id: string;
  room_code: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  sender_role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  sender_badge: 'ADMIN' | 'MODERATOR' | 'PRO' | 'LEARNER';
  sender_level?: number;
  content: string;
  attachments?: string[];
  reply_to?: {
    message_id: string;
    sender_name: string;
    content: string;
  };
  is_pinned: boolean;
  is_deleted: boolean;
  deleted_by?: string;
  created_at: string;
}

export interface ChatRoom {
  _id: string;
  room_code: string;
  title: string;
  is_chat_enabled: boolean;
  slow_mode_seconds: number;
  pinned_message_ids?: string[];
}

export interface ModeratorPermissions {
  can_delete_messages: boolean;
  can_mute_members: boolean;
  can_kick_members: boolean;
  can_ban_members: boolean;
  can_toggle_room_chat: boolean;
  can_pin_messages: boolean;
}

export interface CommunityMember {
  _id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  badge: 'ADMIN' | 'MODERATOR' | 'PRO' | 'LEARNER';
  is_banned: boolean;
  banned_reason?: string;
  banned_at?: string;
  muted_until?: string;
  kicked_cooldown_until?: string;
  joined_at: string;
  moderator_permissions?: ModeratorPermissions;
}

export interface EligibilityResponse {
  is_eligible: boolean;
  role?: string;
  badge?: string;
  status?: 'BANNED' | 'KICKED' | 'NOT_QUALIFIED' | 'UNAUTHORIZED';
  banned_reason?: string;
  banned_at?: string;
  kicked_cooldown_until?: string;
  muted_until?: string;
  member?: CommunityMember;
}

export interface MessagesResponse {
  messages: ChatMessage[];
  next_cursor?: string;
  has_more: boolean;
}
