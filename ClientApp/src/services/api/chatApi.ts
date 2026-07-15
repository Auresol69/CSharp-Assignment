import api from './index';

// ──────────────────────── Types ────────────────────────

export interface ConversationDto {
  idConversation: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatarUrl?: string | null;
  isOtherUserOnline: boolean;
  lastMessageContent?: string | null;
  lastMessageSenderId?: string | null;
  lastMessageAt: string;
  unreadCount: number;
}

export interface MessageDto {
  idMessage: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string | null;
  content: string;
  sentAt: string;
  isRead: boolean;
  isOwnMessage: boolean;
}

// ──────────────────────── API Calls ────────────────────────

/** Lấy danh sách conversations của user hiện tại */
export async function getConversations(): Promise<ConversationDto[]> {
  try {
    const res = await api.get<ConversationDto[]>('/chat/conversations');
    return res.data;
  } catch {
    return [];
  }
}

/** Lấy hoặc tạo conversation với một user */
export async function getOrCreateConversation(otherUserId: string): Promise<ConversationDto | null> {
  try {
    const res = await api.post<ConversationDto>('/chat/conversations', { otherUserId });
    return res.data;
  } catch {
    return null;
  }
}

/** Lấy lịch sử tin nhắn (cursor-based) */
export async function getMessages(
  conversationId: string,
  take = 30,
  beforeMessageId?: string
): Promise<MessageDto[]> {
  try {
    const res = await api.get<MessageDto[]>(`/chat/conversations/${conversationId}/messages`, {
      params: { take, ...(beforeMessageId ? { beforeMessageId } : {}) },
    });
    return res.data;
  } catch {
    return [];
  }
}

/** Đánh dấu đã đọc (REST fallback, ưu tiên dùng SignalR) */
export async function markConversationAsRead(conversationId: string): Promise<void> {
  try {
    await api.put(`/chat/conversations/${conversationId}/read`);
  } catch {
    // silent
  }
}
