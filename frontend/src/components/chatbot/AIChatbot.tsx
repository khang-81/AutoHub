import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { sendChatMessage } from '../../api/gemini';
import type { ChatMessage } from '../../api/gemini';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput('');
    const userMessage: ChatMessage = { role: 'user', content: msg };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // Skip the initial greeting message when sending context to Gemini.
      const history = messages.slice(1);
      const response = await sendChatMessage(msg, history);
      setMessages((prev) => [...prev, { role: 'model', content: response }]);
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
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-50 w-12 h-12 bg-primary rounded-full shadow-lg hover:bg-primary/90 hover:scale-105 transition-all duration-200 flex items-center justify-center group"
        aria-label="Mở chat AI"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <>
            <MessageCircle className="w-5 h-5 text-white" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unread}
              </span>
            )}
          </>
        )}
        {!isOpen && (
          <span className="absolute right-16 bg-navy text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
            Hỏi AutoBot AI 🤖
          </span>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-5 z-50 w-[min(100vw-1.5rem,18rem)] sm:w-80 flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl transition-all duration-200"
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
                <span className="text-[10px] text-gray-300 sm:text-xs">Trực tuyến • Gemini</span>
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
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-primary transition-colors hover:bg-primary/90 disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
            <p className="mt-1 text-center text-[10px] text-gray-400">AutoBot • AutoHub</p>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
