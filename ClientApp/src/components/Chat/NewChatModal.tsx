import React, { useState, useEffect } from "react";
import { useChat } from "../../context/ChatContext";
import { useTheme } from "../../context/ThemeContext";
import { getFriends } from "../../services/api/friendsApi";
import { getOrCreateConversation } from "../../services/api/chatApi";
import type { IFriend } from "../../types/Friends";
import { X, Search, Loader2, MessageCircle } from "lucide-react";

interface Props {
  onConversationStarted: () => void; // callback để đóng modal + chuyển sang chat
}

const NewChatModal: React.FC<Props> = ({ onConversationStarted }) => {
  const { openConversation } = useChat();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [friends, setFriends] = useState<IFriend[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);

  useEffect(() => {
    getFriends()
      .then(res => setFriends(res.data))
      .catch(() => setFriends([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = friends.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleStart = async (friend: IFriend) => {
    const userId = friend.userId ?? friend.id;
    if (!userId) return;
    setStartingId(userId);
    try {
      const conv = await getOrCreateConversation(userId);
      if (conv) {
        await openConversation(conv);
        onConversationStarted();
      }
    } finally {
      setStartingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-96">
      {/* Search */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm mb-3 ${
        isDark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"
      }`}>
        <Search size={14} />
        <input
          autoFocus
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm bạn bè..."
          className="bg-transparent outline-none flex-1 text-sm"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={20} className="animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className={`text-center py-8 text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            {search ? "Không tìm thấy" : "Chưa có bạn bè nào"}
          </div>
        ) : (
          filtered.map(friend => {
            const uid = friend.userId ?? friend.id ?? "";
            const isStarting = startingId === uid;
            return (
              <button
                key={uid}
                onClick={() => handleStart(friend)}
                disabled={isStarting}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"
                } disabled:opacity-50`}
              >
                {friend.avatar ? (
                  <img src={friend.avatar} alt={friend.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shrink-0">
                    {friend.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isDark ? "text-gray-100" : "text-gray-900"}`}>
                    {friend.name}
                  </p>
                </div>
                {isStarting ? (
                  <Loader2 size={16} className="animate-spin text-blue-500 shrink-0" />
                ) : (
                  <MessageCircle size={16} className={`shrink-0 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

// ─── Wrapper Modal ───────────────────────────────────────

interface ModalWrapperProps {
  onClose: () => void;
  onConversationStarted: () => void;
}

const NewChatModalWrapper: React.FC<ModalWrapperProps> = ({ onClose, onConversationStarted }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
        w-full max-w-sm rounded-2xl shadow-2xl p-4 border
        ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>
            Tin nhắn mới
          </h3>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors ${
              isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            <X size={18} />
          </button>
        </div>

        <NewChatModal onConversationStarted={() => { onConversationStarted(); onClose(); }} />
      </div>
    </>
  );
};

export default NewChatModalWrapper;
