import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { getAiStatus, sendChatMessage } from '../../api/ai';
import type { ChatMessage, ChatReplySource } from '../../api/ai';

const QUICK_QUESTIONS = [
  '💰 Giá thuê và giá mua xe?',
  '🛒 Quy trình mua xe?',
  '📋 Điều kiện thuê xe?',
  '🛞 Quy trình thuê xe?',
  '📅 Đặt lịch xem xe?',
  '📞 Liên hệ hỗ trợ',
];

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content:
        '👋 Xin chào! Tôi là **AutoBot** - trợ lý AI của AutoHub.\n\nTôi có thể giúp bạn:\n- **Thuê xe** tự lái (giá/ngày, điều kiện, quy trình)\n- **Mua xe** (giá bán, đặt mua, xem xe)\n- Hướng dẫn dùng website\n\nBạn cần hỗ trợ gì? 😊',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);
  const [lastTokens, setLastTokens] = useState<number | null>(null);
  const [lastSource, setLastSource] = useState<ChatReplySource | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAiStatus()
      .then((status) => setAiConfigured(status.aiConfigured))
      .catch(() => setAiConfigured(false));
  }, []);

  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const statusLabel = (() => {
    if (aiConfigured === null) return 'Đang kết nối...';
    if (!aiConfigured) return 'AutoBot (cục bộ)';
    // AI configured - show online status
    if (lastSource === 'arcanic') return 'Trực tuyến • AutoBot AI';
    // Fallback (FAQ or error) - still online, just using local data
    return 'Trực tuyến • AutoBot';
  })();

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput('');
    const userMessage: ChatMessage = { role: 'user', content: msg };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const history = messages.slice(1);
      const response = await sendChatMessage(msg, history);
      setLastSource(response.source);
      setLastTokens(response.totalTokens ?? null);
      setMessages((prev) => [...prev, { role: 'model', content: response.content }]);
      if (!isOpen) setUnread((u) => u + 1);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: '❌ Xin lỗi, có lỗi xảy ra. Vui lòng thử lại!' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (content: string) => {
    // Parse simple markdown: **bold**, line breaks
    return content.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className={i > 0 ? 'mt-1' : ''}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
          )}
        </p>
      );
    });
  };

  return (
    <>
      {/* Nút nổi + nhãn luôn hiển thị (không cần hover) */}
      <div className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-1.5rem)] flex-row-reverse items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary shadow-xl ring-2 ring-primary/30 transition-all duration-200 hover:bg-primary/90 hover:ring-primary/50 hover:scale-[1.03] active:scale-95"
          aria-label="Mở chat AI"
        >
          {isOpen ? (
            <X className="h-7 w-7 text-white" strokeWidth={2.25} />
          ) : (
            <>
              <MessageCircle className="h-7 w-7 text-white" strokeWidth={2.25} />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white shadow">
                  {unread}
                </span>
              )}
            </>
          )}
        </button>
        {!isOpen && (
          <span className="pointer-events-none select-none rounded-full border border-navy/20 bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-lg sm:text-base">
            Hỏi AutoBot AI 🤖
          </span>
        )}
      </div>

      {/* Chat window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-5 z-50 w-[min(100vw-1.5rem,18rem)] sm:w-80 flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl transition-all duration-200"
          style={{ height: 'min(420px, calc(100vh - 5.5rem))', maxHeight: 'calc(100vh - 5.5rem)' }}
        >
          {/* Header */}
          <div className="flex flex-shrink-0 items-center gap-2.5 bg-gradient-to-r from-navy to-navy/90 px-3 py-2.5 text-white">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight">AutoBot AI</p>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                <span className="text-[10px] text-gray-300 sm:text-xs">{statusLabel}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 transition-colors hover:bg-white/10"
              aria-label="Đóng chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-gray-50 p-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                    msg.role === 'user' ? 'bg-primary' : 'bg-navy'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User className="h-3.5 w-3.5 text-white" />
                  ) : (
                    <Bot className="h-3.5 w-3.5 text-white" />
                  )}
                </div>
                <div
                  className={`max-w-[78%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'rounded-tr-sm bg-primary text-white'
                      : 'rounded-tl-sm border border-gray-100 bg-white text-gray-800 shadow-sm'
                  }`}
                >
                  {renderMessage(msg.content)}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-navy">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-gray-100 bg-white px-3 py-2 shadow-sm">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span className="text-[11px] text-gray-400">Đang trả lời...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="flex-shrink-0 border-t border-gray-100 bg-gray-50 px-3 py-2">
              <p className="mb-1.5 text-[10px] text-gray-400">Câu hỏi thường gặp:</p>
              <div className="flex flex-wrap gap-1">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSend(q)}
                    className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] transition-colors hover:border-primary hover:text-primary sm:text-xs"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-shrink-0 border-t border-gray-100 bg-white px-3 py-2">
            <div className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1.5">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Nhập câu hỏi..."
                className="min-w-0 flex-1 bg-transparent text-xs text-gray-700 outline-none placeholder:text-gray-400"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                aria-label="Gửi tin nhắn"
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-primary transition-colors hover:bg-primary/90 disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
            <p className="mt-1 text-center text-[10px] text-gray-400">
              AutoBot • AutoHub
              {lastTokens != null && lastSource === 'arcanic' && (
                <span className="text-gray-300"> • {lastTokens} tokens</span>
              )}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
