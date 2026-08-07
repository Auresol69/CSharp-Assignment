import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { sendChatbotMessage } from '../../services/api/chatbotApi';
import { Bot, X, Send, Trash2, ChevronDown, Sparkles } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(date: Date): string {
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}



// ─── Typing dots animation ────────────────────────────────────────────────────

const TypingIndicator: React.FC = () => (
  <div className="flex items-end gap-1 px-4 py-3">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
);

// ─── Message bubble ───────────────────────────────────────────────────────────

interface BubbleProps {
  msg: UiMessage;
  isDark: boolean;
}

const MessageBubble: React.FC<BubbleProps> = ({ msg, isDark }) => {
  const isUser = msg.role === 'user';

  return (
    <div className={`flex gap-2 items-end ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg">
          <Sparkles size={13} className="text-white" />
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
            isUser
              ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-br-sm'
              : isDark
              ? 'bg-gray-700 text-gray-100 rounded-bl-sm'
              : 'bg-gray-100 text-gray-800 rounded-bl-sm'
          }`}
        >
          {msg.content}
        </div>
        <span className={`text-[10px] px-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {formatTime(msg.timestamp)}
        </span>
      </div>
    </div>
  );
};

// ─── Main Widget ──────────────────────────────────────────────────────────────

const WELCOME: UiMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Xin chào! Tôi là trợ lý AI của InteractHub. Tôi có thể giúp bạn điều gì hôm nay?',
  timestamp: new Date(),
};

const ChatbotWidget: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasNewMsg, setHasNewMsg] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // ── Auto-scroll to bottom ──────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ── Focus input when panel opens ───────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setHasNewMsg(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: UiMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatbotMessage({ message: text });

      const botMsg: UiMessage = {
        id: `b-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);

      if (!open) setHasNewMsg(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, open]);

  // ── Enter to send (Shift+Enter = newline) ──────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Clear conversation ─────────────────────────────────────────────────────
  const handleClear = () => {
    setMessages([{ ...WELCOME, timestamp: new Date() }]);
  };

  // ── Auto-resize textarea ───────────────────────────────────────────────────
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Floating Action Button ──────────────────────────────────────────── */}
      <button
        id="chatbot-fab"
        onClick={() => setOpen((v) => !v)}
        aria-label="Mở chatbot AI"
        className={`fixed bottom-24 right-5 md:bottom-6 md:right-6 z-50
          w-14 h-14 rounded-full shadow-2xl flex items-center justify-center
          transition-all duration-300 active:scale-90
          bg-gradient-to-br from-blue-600 to-violet-600 text-white
          hover:from-blue-500 hover:to-violet-500
          ${open ? 'rotate-12 scale-95' : 'scale-100'}
        `}
      >
        {open ? <X size={22} /> : <Bot size={22} />}

        {/* Unread badge */}
        {hasNewMsg && !open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 animate-ping" />
        )}
        {hasNewMsg && !open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500" />
        )}
      </button>

      {/* ── Chat Panel ─────────────────────────────────────────────────────── */}
      <div
        ref={panelRef}
        id="chatbot-panel"
        className={`
          fixed z-50
          bottom-44 right-5 md:bottom-24 md:right-6
          w-[calc(100vw-2.5rem)] max-w-sm
          flex flex-col
          rounded-2xl overflow-hidden shadow-2xl
          border transition-all duration-300 origin-bottom-right
          ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}
          ${open
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-90 pointer-events-none'
          }
        `}
        style={{ height: '32rem' }}
      >
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-violet-600 shrink-0">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm leading-tight">InteractHub AI</p>
            <p className="text-blue-200 text-[11px]">Trợ lý thông minh</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleClear}
              title="Xóa cuộc trò chuyện"
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Trash2 size={15} />
            </button>
            <button
              onClick={() => setOpen(false)}
              title="Thu nhỏ"
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronDown size={15} />
            </button>
          </div>
        </div>

        {/* ── Message list ───────────────────────────────────────────────────── */}
        <div
          className={`flex-1 overflow-y-auto px-3 py-3 space-y-3 scroll-smooth
            ${isDark ? 'scrollbar-thin scrollbar-thumb-gray-700' : 'scrollbar-thin scrollbar-thumb-gray-200'}
          `}
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} isDark={isDark} />
          ))}

          {loading && (
            <div className={`flex gap-2 items-end`}>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0">
                <Sparkles size={13} className="text-white" />
              </div>
              <div className={`rounded-2xl rounded-bl-sm shadow-sm ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <TypingIndicator />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Divider ────────────────────────────────────────────────────────── */}
        <div className={`h-px mx-3 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`} />

        {/* ── Input area ─────────────────────────────────────────────────────── */}
        <div className={`px-3 py-3 flex items-end gap-2 shrink-0 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <textarea
            ref={inputRef}
            id="chatbot-input"
            rows={1}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Nhập câu hỏi... (Enter để gửi)"
            disabled={loading}
            className={`flex-1 resize-none rounded-xl px-3.5 py-2.5 text-sm leading-relaxed
              border outline-none transition-colors overflow-hidden
              disabled:opacity-50
              ${isDark
                ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-blue-500'
                : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-400'
              }
            `}
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
          <button
            id="chatbot-send"
            onClick={handleSend}
            disabled={!input.trim() || loading}
            aria-label="Gửi tin nhắn"
            className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
              transition-all duration-200 active:scale-90
              ${input.trim() && !loading
                ? 'bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50'
                : isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'
              }
            `}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatbotWidget;
