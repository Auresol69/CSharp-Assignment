import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useChat } from "../context/ChatContext";
import ConversationList from "../components/Chat/ConversationList";
import ChatWindow from "../components/Chat/ChatWindow";
import { MessageCircleMore } from "lucide-react";

/**
 * ChatPage – Layout 2 cột giống Messenger:
 * - Desktop: sidebar conversations (w-80) + chat window (flex-1)
 * - Mobile: toggle giữa list và chat window
 */
const ChatPage = () => {
  const { theme } = useTheme();
  const { activeConversation } = useChat();
  const isDark = theme === "dark";
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  return (
    <div className={`w-full max-w-5xl mx-auto min-h-[calc(100vh-2rem)] flex overflow-hidden rounded-2xl shadow-xl border transition-colors ${
      isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white"
    }`}
    style={{ height: "calc(100vh - 5rem)" }}>

      {/* ── Left: Conversation List ──────────────────────── */}
      <aside className={`
        ${mobileView === "list" ? "flex" : "hidden"}
        md:flex flex-col w-full md:w-80 shrink-0
        border-r transition-colors
        ${isDark ? "border-gray-800" : "border-gray-100"}
      `}>
        <ConversationList onSelect={() => setMobileView("chat")} />
      </aside>

      {/* ── Right: Chat Window ────────────────────────────── */}
      <div className={`
        ${mobileView === "chat" ? "flex" : "hidden"}
        md:flex flex-col flex-1 relative overflow-hidden
      `}>
        <ChatWindow onBack={() => setMobileView("list")} />
      </div>

      {/* ── Mobile FAB: nếu không có conversation active trên mobile ── */}
      {!activeConversation && mobileView === "list" && (
        <div className="md:hidden fixed bottom-24 right-4 z-50">
          <button
            className="w-14 h-14 rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center hover:bg-blue-600 active:scale-95 transition-all"
          >
            <MessageCircleMore size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
