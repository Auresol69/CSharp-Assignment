import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { HubConnectionState } from "@microsoft/signalr";
import {
  getSignalRConnection,
  onReceiveChatMessage,
  offReceiveChatMessage,
  onMessagesMarkedAsRead,
  offMessagesMarkedAsRead,
  onUserTyping,
  onUserStoppedTyping,
  offTypingListeners,
  joinConversation,
  leaveConversation,
  sendChatMessageViaHub,
  startTypingSignalR,
  stopTypingSignalR,
  markConversationAsReadSignalR,
  type NewMessageSignalDto,
} from "../services/signalRService";
import { getConversations, getMessages, type ConversationDto, type MessageDto } from "../services/api/chatApi";

// ══════════════════════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════════════════════

interface ChatContextType {
  conversations: ConversationDto[];
  activeConversation: ConversationDto | null;
  messages: MessageDto[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  hasMoreMessages: boolean;
  typingUsers: Record<string, boolean>; // conversationId → isTyping
  totalUnread: number;

  openConversation: (conv: ConversationDto) => void;
  closeConversation: () => void;
  sendMessage: (content: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  sendTyping: () => void;
  sendStopTyping: () => void;
  refreshConversations: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// ══════════════════════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════════════════════

function getCurrentUserId(): string {
  try {
    const auth = localStorage.getItem("auth");
    if (auth) {
      const data = JSON.parse(auth);
      return data.userId ?? data.id ?? "";
    }
  } catch { /* silent */ }
  return "";
}

// ══════════════════════════════════════════════════════════════
// Provider
// ══════════════════════════════════════════════════════════════

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationDto | null>(null);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  const activeConvRef = useRef<ConversationDto | null>(null);
  const typingTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const typingDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const signalRSetupRef = useRef(false);

  // Sync ref with state
  useEffect(() => {
    activeConvRef.current = activeConversation;
  }, [activeConversation]);

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  // ── Load conversations ──────────────────────────────────────

  const refreshConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    try {
      const data = await getConversations();
      setConversations(data);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // ── Open conversation ───────────────────────────────────────

  const openConversation = useCallback(async (conv: ConversationDto) => {
    // Leave previous
    if (activeConvRef.current && activeConvRef.current.idConversation !== conv.idConversation) {
      await leaveConversation(activeConvRef.current.idConversation);
    }

    setActiveConversation(conv);
    setMessages([]);
    setIsLoadingMessages(true);
    setHasMoreMessages(false);

    try {
      await joinConversation(conv.idConversation);
      await markConversationAsReadSignalR(conv.idConversation);

      const data = await getMessages(conv.idConversation, 30);
      setMessages(data);
      setHasMoreMessages(data.length === 30);

      // Clear unread badge
      setConversations(prev =>
        prev.map(c => c.idConversation === conv.idConversation ? { ...c, unreadCount: 0 } : c)
      );
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // ── Close conversation ──────────────────────────────────────

  const closeConversation = useCallback(async () => {
    if (activeConvRef.current) {
      await leaveConversation(activeConvRef.current.idConversation);
    }
    setActiveConversation(null);
    setMessages([]);
  }, []);

  // ── Send message ────────────────────────────────────────────

  const sendMessage = useCallback(async (content: string) => {
    const conv = activeConvRef.current;
    if (!conv || !content.trim()) return;

    const currentUserId = getCurrentUserId();
    const optimistic: MessageDto = {
      idMessage: `temp-${Date.now()}`,
      conversationId: conv.idConversation,
      senderId: currentUserId,
      senderName: "Bạn",
      content: content.trim(),
      sentAt: new Date().toISOString(),
      isRead: false,
      isOwnMessage: true,
    };

    setMessages(prev => [...prev, optimistic]);

    try {
      await sendChatMessageViaHub(conv.otherUserId, content.trim());
      // The real message will arrive via ReceiveChatMessage SignalR event
      // Remove optimistic (the server message will replace it)
      setMessages(prev => prev.filter(m => m.idMessage !== optimistic.idMessage));
    } catch (err) {
      // Rollback on error
      setMessages(prev => prev.filter(m => m.idMessage !== optimistic.idMessage));
      throw err;
    }

    // Update conversation preview
    setConversations(prev =>
      prev.map(c =>
        c.idConversation === conv.idConversation
          ? { ...c, lastMessageContent: content.trim(), lastMessageAt: new Date().toISOString(), lastMessageSenderId: currentUserId }
          : c
      )
    );
  }, []);

  // ── Load more messages (pagination) ────────────────────────

  const loadMoreMessages = useCallback(async () => {
    const conv = activeConvRef.current;
    if (!conv || messages.length === 0 || isLoadingMessages) return;

    setIsLoadingMessages(true);
    try {
      const oldest = messages[0].idMessage;
      const older = await getMessages(conv.idConversation, 30, oldest);
      setMessages(prev => [...older, ...prev]);
      setHasMoreMessages(older.length === 30);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [messages, isLoadingMessages]);

  // ── Typing ──────────────────────────────────────────────────

  const sendTyping = useCallback(() => {
    const conv = activeConvRef.current;
    if (!conv) return;

    if (typingDebounce.current) clearTimeout(typingDebounce.current);
    startTypingSignalR(conv.idConversation);

    typingDebounce.current = setTimeout(() => {
      stopTypingSignalR(conv.idConversation);
    }, 2000);
  }, []);

  const sendStopTyping = useCallback(() => {
    const conv = activeConvRef.current;
    if (!conv) return;
    if (typingDebounce.current) clearTimeout(typingDebounce.current);
    stopTypingSignalR(conv.idConversation);
  }, []);

  // ── SignalR event handlers ──────────────────────────────────

  const handleReceiveChatMessage = useCallback((msg: NewMessageSignalDto) => {
    const currentUserId = getCurrentUserId();

    const mapped: MessageDto = {
      idMessage: msg.idMessage,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      senderName: msg.senderName,
      senderAvatarUrl: msg.senderAvatarUrl,
      content: msg.content,
      sentAt: msg.sentAt,
      isRead: false,
      isOwnMessage: msg.senderId === currentUserId,
    };

    const activeConvId = activeConvRef.current?.idConversation;

    if (activeConvId === msg.conversationId) {
      // Đang mở conversation này → thêm tin nhắn vào cuối
      setMessages(prev => {
        // Tránh duplicate
        if (prev.some(m => m.idMessage === msg.idMessage)) return prev;
        return [...prev, mapped];
      });
      // Auto-read
      markConversationAsReadSignalR(msg.conversationId);
    } else {
      // Conversation khác → tăng unread
      setConversations(prev =>
        prev.map(c =>
          c.idConversation === msg.conversationId
            ? { ...c, unreadCount: c.unreadCount + 1, lastMessageContent: msg.content, lastMessageAt: msg.sentAt, lastMessageSenderId: msg.senderId }
            : c
        )
      );
    }
  }, []);

  const handleMessagesMarkedAsRead = useCallback(({ conversationId }: { conversationId: string }) => {
    if (activeConvRef.current?.idConversation === conversationId) {
      setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
    }
  }, []);

  const handleUserTyping = useCallback((conversationId: string) => {
    setTypingUsers(prev => ({ ...prev, [conversationId]: true }));

    // Auto-clear sau 3 giây nếu không có stop event
    if (typingTimers.current[conversationId]) {
      clearTimeout(typingTimers.current[conversationId]);
    }
    typingTimers.current[conversationId] = setTimeout(() => {
      setTypingUsers(prev => ({ ...prev, [conversationId]: false }));
    }, 3000);
  }, []);

  const handleUserStoppedTyping = useCallback((conversationId: string) => {
    if (typingTimers.current[conversationId]) {
      clearTimeout(typingTimers.current[conversationId]);
    }
    setTypingUsers(prev => ({ ...prev, [conversationId]: false }));
  }, []);

  // ── Setup SignalR when connection is ready ──────────────────

  useEffect(() => {
    let pollInterval: ReturnType<typeof setInterval>;

    const setup = () => {
      const conn = getSignalRConnection();
      if (conn && conn.state === HubConnectionState.Connected && !signalRSetupRef.current) {
        signalRSetupRef.current = true;
        clearInterval(pollInterval);

        onReceiveChatMessage(handleReceiveChatMessage);
        onMessagesMarkedAsRead(handleMessagesMarkedAsRead);
        onUserTyping(handleUserTyping);
        onUserStoppedTyping(handleUserStoppedTyping);

        // Load conversations on connect
        void refreshConversations();
      }
    };

    setup();

    if (!signalRSetupRef.current) {
      let attempts = 0;
      pollInterval = setInterval(() => {
        attempts++;
        setup();
        if (attempts > 60) clearInterval(pollInterval);
      }, 500);
    }

    return () => {
      clearInterval(pollInterval);
      offReceiveChatMessage();
      offMessagesMarkedAsRead();
      offTypingListeners();
    };
  }, [handleReceiveChatMessage, handleMessagesMarkedAsRead, handleUserTyping, handleUserStoppedTyping, refreshConversations]);

  return (
    <ChatContext.Provider value={{
      conversations,
      activeConversation,
      messages,
      isLoadingConversations,
      isLoadingMessages,
      hasMoreMessages,
      typingUsers,
      totalUnread,
      openConversation,
      closeConversation,
      sendMessage,
      loadMoreMessages,
      sendTyping,
      sendStopTyping,
      refreshConversations,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
};

export default ChatContext;
