import React from "react";
import { useChat } from "../../context/ChatContext";
import type { ConversationDto } from "../../services/api/chatApi";
import { useTheme } from "../../context/ThemeContext";
import { MessageCircle, Search } from "lucide-react";
import { useState } from "react";

interface Props {
  onSelect?: () => void; // Mobile: đóng sidebar sau khi chọn
}

const ConversationList: React.FC<Props> = ({ onSelect }) => {
  const { conversations, activeConversation, openConversation, isLoadingConversations } = useChat();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [search, setSearch] = useState("");

  const filtered = conversations.filter(c =>
    c.otherUserName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = async (conv: ConversationDto) => {
    await openConversation(conv);
    onSelect?.();
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60_000) return "Vừa xong";
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}ph`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  };

  return (
    <div className={`flex flex-col h-full ${isDark ? "bg-gray-900" : "bg-white"}`}>
      {/* Header */}
      <div className={`px-4 pt-5 pb-3 border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}>
        <div className="flex items-center justify-between mb-3">
          <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Tin nhắn
          </h2>
          <button className={`p-1.5 rounded-full transition-colors ${
            isDark ? "text-blue-400 hover:bg-gray-800" : "text-blue-600 hover:bg-blue-50"
          }`}>
            <MessageCircle size={18} />
          </button>
        </div>

        {/* Search */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${
          isDark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"
        }`}>
          <Search size={14} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm cuộc hội thoại..."
            className="bg-transparent outline-none flex-1 text-sm"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingConversations ? (
          <div className="flex flex-col gap-3 p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex items-center gap-3 animate-pulse`}>
                <div className={`w-12 h-12 rounded-full shrink-0 ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
                <div className="flex-1 space-y-2">
                  <div className={`h-3.5 rounded-full w-2/3 ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
                  <div className={`h-3 rounded-full w-4/5 ${isDark ? "bg-gray-700" : "bg-gray-100"}`} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 opacity-50">
            <MessageCircle size={32} className={isDark ? "text-gray-600" : "text-gray-400"} />
            <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              {search ? "Không tìm thấy" : "Chưa có hội thoại nào"}
            </p>
          </div>
        ) : (
          filtered.map(conv => {
            const isActive = activeConversation?.idConversation === conv.idConversation;
            const hasUnread = conv.unreadCount > 0;

            return (
              <button
                key={conv.idConversation}
                onClick={() => handleSelect(conv)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 ${
                  isActive
                    ? isDark ? "bg-blue-900/30" : "bg-blue-50"
                    : isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"
                }`}
              >
                {/* Avatar + Online Indicator */}
                <div className="relative shrink-0">
                  {conv.otherUserAvatarUrl ? (
                    <img
                      src={conv.otherUserAvatarUrl}
                      alt={conv.otherUserName}
                      className={`w-12 h-12 rounded-full object-cover ring-2 ring-offset-1 ${isActive ? "ring-blue-500" : "ring-transparent"}`}
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white ${
                      isActive ? "bg-blue-500" : "bg-gradient-to-br from-purple-500 to-blue-500"
                    }`}>
                      {conv.otherUserName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {/* Online dot */}
                  {conv.isOtherUserOnline && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white dark:border-gray-900" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-sm font-semibold truncate ${
                      isDark ? "text-gray-100" : "text-gray-900"
                    } ${hasUnread ? "font-bold" : ""}`}>
                      {conv.otherUserName}
                    </span>
                    <span className={`text-xs shrink-0 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                      {formatTime(conv.lastMessageAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <p className={`text-xs truncate ${
                      hasUnread
                        ? isDark ? "text-gray-200 font-semibold" : "text-gray-800 font-semibold"
                        : isDark ? "text-gray-500" : "text-gray-400"
                    }`}>
                      {conv.lastMessageContent
                        ? (conv.lastMessageSenderId !== conv.otherUserId ? "Bạn: " : "") + conv.lastMessageContent
                        : "Bắt đầu cuộc trò chuyện"}
                    </p>
                    {hasUnread && (
                      <span className="shrink-0 min-w-[20px] h-5 px-1 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
