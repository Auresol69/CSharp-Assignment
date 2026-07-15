import React, { useEffect, useRef, useState, useCallback } from "react";
import { useChat } from "../../context/ChatContext";
import { useTheme } from "../../context/ThemeContext";
import { Send, ChevronLeft, Phone, Video, Info, Loader2, ChevronDown } from "lucide-react";
import type { MessageDto } from "../../services/api/chatApi";

interface Props {
  onBack?: () => void; // Mobile: quay về list
}

// ─────────────────────────────────────────────
// MessageBubble
// ─────────────────────────────────────────────
const MessageBubble: React.FC<{ msg: MessageDto; isDark: boolean; showAvatar: boolean }> = ({
  msg, isDark, showAvatar,
}) => {
  const isOwn = msg.isOwnMessage;
  const time = new Date(msg.sentAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar (người nhận) */}
      {!isOwn && (
        <div className="w-7 h-7 shrink-0">
          {showAvatar && (
            msg.senderAvatarUrl ? (
              <img src={msg.senderAvatarUrl} alt={msg.senderName}
                className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                {msg.senderName.charAt(0).toUpperCase()}
              </div>
            )
          )}
        </div>
      )}

      {/* Bubble */}
      <div className={`group relative max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words transition-all ${
          isOwn
            ? "bg-blue-500 text-white rounded-br-sm shadow-sm shadow-blue-200"
            : isDark
              ? "bg-gray-800 text-gray-100 rounded-bl-sm"
              : "bg-gray-100 text-gray-800 rounded-bl-sm"
        }`}>
          {msg.content}
        </div>

        {/* Time (show on hover) */}
        <span className={`text-[10px] opacity-0 group-hover:opacity-100 transition-opacity px-1 ${
          isDark ? "text-gray-500" : "text-gray-400"
        } ${isOwn ? "text-right" : "text-left"}`}>
          {time}
          {isOwn && (
            <span className="ml-1">{msg.isRead ? "✓✓" : "✓"}</span>
          )}
        </span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// TypingIndicator
// ─────────────────────────────────────────────
const TypingIndicator: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <div className="flex items-end gap-2">
    <div className={`px-4 py-3 rounded-2xl rounded-bl-sm inline-flex gap-1 ${
      isDark ? "bg-gray-800" : "bg-gray-100"
    }`}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDark ? "bg-gray-400" : "bg-gray-500"}`}
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────
// ChatWindow
// ─────────────────────────────────────────────
const ChatWindow: React.FC<Props> = ({ onBack }) => {
  const {
    activeConversation,
    messages,
    isLoadingMessages,
    hasMoreMessages,
    typingUsers,
    sendMessage,
    loadMoreMessages,
    sendTyping,
    sendStopTyping,
  } = useChat();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isNearBottom = useRef(true);

  const conv = activeConversation;
  const isOtherTyping = conv ? typingUsers[conv.idConversation] : false;

  // Scroll to bottom
  const scrollToBottom = useCallback((smooth = false) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }, []);

  // Auto-scroll when new messages arrive (if near bottom)
  useEffect(() => {
    if (isNearBottom.current) {
      scrollToBottom();
    }
  }, [messages, isOtherTyping, scrollToBottom]);

  // Track scroll position
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    isNearBottom.current = distanceFromBottom < 100;
    setShowScrollDown(distanceFromBottom > 300);
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    sendTyping();
    // Auto-resize
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;
    setIsSending(true);
    setInput("");
    sendStopTyping();
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
    try {
      await sendMessage(trimmed);
    } catch {
      setInput(trimmed); // restore on error
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  if (!conv) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center gap-4 ${
        isDark ? "bg-gray-950 text-gray-500" : "bg-gray-50 text-gray-400"
      }`}>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
          isDark ? "bg-gray-800" : "bg-gray-200"
        }`}>
          <Send size={32} className="opacity-40" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-base mb-1">Chọn một cuộc hội thoại</p>
          <p className="text-sm opacity-70">Chọn từ danh sách bên trái để bắt đầu chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${isDark ? "bg-gray-950" : "bg-gray-50"}`}>
      {/* Header */}
      <div className={`flex items-center gap-3 px-4 py-3 border-b shrink-0 ${
        isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"
      } shadow-sm`}>
        {onBack && (
          <button onClick={onBack} className={`p-1 rounded-lg mr-1 ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>
            <ChevronLeft size={22} />
          </button>
        )}

        <div className="relative">
          {conv.otherUserAvatarUrl ? (
            <img src={conv.otherUserAvatarUrl} alt={conv.otherUserName}
              className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
              {conv.otherUserName.charAt(0).toUpperCase()}
            </div>
          )}
          {conv.isOtherUserOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-900" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm truncate ${isDark ? "text-white" : "text-gray-900"}`}>
            {conv.otherUserName}
          </p>
          <p className={`text-xs ${
            conv.isOtherUserOnline
              ? "text-green-500"
              : isDark ? "text-gray-500" : "text-gray-400"
          }`}>
            {isOtherTyping ? "Đang nhập..." : conv.isOtherUserOnline ? "Đang hoạt động" : "Ngoại tuyến"}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button className={`p-2 rounded-full transition-colors ${isDark ? "text-blue-400 hover:bg-gray-800" : "text-blue-600 hover:bg-blue-50"}`}>
            <Phone size={18} />
          </button>
          <button className={`p-2 rounded-full transition-colors ${isDark ? "text-blue-400 hover:bg-gray-800" : "text-blue-600 hover:bg-blue-50"}`}>
            <Video size={18} />
          </button>
          <button className={`p-2 rounded-full transition-colors ${isDark ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-100"}`}>
            <Info size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1.5"
      >
        {/* Load more */}
        {hasMoreMessages && (
          <button
            onClick={() => void loadMoreMessages()}
            disabled={isLoadingMessages}
            className={`self-center px-4 py-1.5 text-xs font-medium rounded-full mb-2 transition-all ${
              isDark
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            {isLoadingMessages ? <Loader2 size={14} className="animate-spin" /> : "Tải thêm tin cũ hơn"}
          </button>
        )}

        {isLoadingMessages && messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={24} className={`animate-spin ${isDark ? "text-gray-600" : "text-gray-400"}`} />
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => {
              const prev = messages[idx - 1];
              const showAvatar = !prev || prev.senderId !== msg.senderId;
              return (
                <MessageBubble key={msg.idMessage} msg={msg} isDark={isDark} showAvatar={showAvatar} />
              );
            })}

            {/* Typing indicator */}
            {isOtherTyping && <TypingIndicator isDark={isDark} />}
          </>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollDown && (
        <button
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-24 right-6 w-8 h-8 rounded-full bg-blue-500 text-white shadow-lg flex items-center justify-center hover:bg-blue-600 transition-all"
        >
          <ChevronDown size={16} />
        </button>
      )}

      {/* Input */}
      <div className={`px-4 py-3 border-t shrink-0 ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}>
        <div className={`flex items-end gap-2 rounded-2xl px-4 py-2 ${
          isDark ? "bg-gray-800" : "bg-gray-100"
        }`}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn... (Enter để gửi)"
            rows={1}
            className={`flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed max-h-28 overflow-y-auto ${
              isDark ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"
            }`}
            style={{ scrollbarWidth: "thin" }}
          />
          <button
            onClick={() => void handleSend()}
            disabled={!input.trim() || isSending}
            className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              input.trim() && !isSending
                ? "bg-blue-500 text-white hover:bg-blue-600 shadow-sm shadow-blue-200"
                : isDark
                  ? "bg-gray-700 text-gray-500"
                  : "bg-gray-200 text-gray-400"
            }`}
          >
            {isSending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
        <p className={`text-[10px] text-center mt-1 ${isDark ? "text-gray-700" : "text-gray-300"}`}>
          Shift + Enter để xuống dòng
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;
